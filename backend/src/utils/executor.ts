import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const TEMP_DIR = path.join(__dirname, '../../temp');

// Ensure temp directory exists
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}

interface ExecutionResult {
    output: string;
    error: string | null;
    executionTime: number; // ms
    memory: number; // KB
}

// Calibrate overheads (startup time for interpreters)
const OVERHEADS: Record<string, number> = {
    'python': 45, // ms (typical python3 startup)
    'cpp': 1,     // ms 
    'javascript': 60 // ms (typical node startup)
};

export const executeCode = async (language: string, code: string, input: string): Promise<ExecutionResult> => {
    const jobId = uuidv4();
    const languageLower = language.toLowerCase();
    const ext = languageLower === 'python' ? 'py' : languageLower === 'cpp' ? 'cpp' : 'js';
    const filename = `${jobId}.${ext}`;
    const filePath = path.join(TEMP_DIR, filename);
    const inputPath = path.join(TEMP_DIR, `${jobId}.txt`);
    const executablePath = path.join(TEMP_DIR, jobId); // For C++
    const timePath = path.join(TEMP_DIR, `${jobId}_time.txt`);

    // Write code and input to files
    fs.writeFileSync(filePath, code);
    fs.writeFileSync(inputPath, input);

    const cleanup = () => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(timePath)) fs.unlinkSync(timePath);
            if (fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
        } catch (e) { }
    };

    try {
        if (languageLower === 'cpp') {
            await new Promise<void>((resolve, reject) => {
                exec(`g++ -O3 ${filePath} -o ${executablePath}`, { timeout: 15000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject({ type: 'COMPILATION_ERROR', message: stderr || error.message });
                    } else {
                        resolve();
                    }
                });
            });
        }

        let runCommand = '';
        if (languageLower === 'python') {
            runCommand = `python3 ${filePath}`;
        } else if (languageLower === 'cpp') {
            runCommand = `${executablePath}`;
        } else if (languageLower === 'javascript') {
            runCommand = `node ${filePath}`;
        } else {
            cleanup();
            return { output: '', error: 'Unsupported language', executionTime: 0, memory: 0 };
        }

        // Using GNU time (standard on linux) to get Peak RSS (%M in KB) and Wall clock (%e in sec)
        const command = `/usr/bin/time -f "%M %e" -o ${timePath} ${runCommand} < ${inputPath}`;

        return await new Promise((resolve) => {
            const startTime = Date.now();
            exec(command, { timeout: 10000, maxBuffer: 1024 * 1024 * 50 }, (error, stdout, stderr) => {
                const wallTimeReal = Date.now() - startTime;
                let executionTime = 0;
                let memory = 0;

                try {
                    if (fs.existsSync(timePath)) {
                        const timeContent = fs.readFileSync(timePath, 'utf-8').trim().split(/\s+/);
                        if (timeContent.length >= 2) {
                            memory = parseInt(timeContent[0]); // KB
                            const seconds = parseFloat(timeContent[1]);
                            executionTime = Math.round(seconds * 1000);

                            // Subtract overhead but keep at least 1ms
                            const overhead = OVERHEADS[languageLower] || 0;
                            executionTime = Math.max(1, executionTime - overhead);
                        }
                    }
                } catch (e) {
                    executionTime = wallTimeReal;
                }

                if (error) {
                    if (error.killed || (error as any).signal === 'SIGTERM') {
                        resolve({ output: '', error: 'Time Limit Exceeded', executionTime, memory });
                    } else {
                        // RE might have memory stats even if it crashed
                        resolve({ output: stdout, error: stderr || error.message, executionTime, memory });
                    }
                } else {
                    resolve({ output: stdout.trim(), error: null, executionTime, memory });
                }
                cleanup();
            });
        });

    } catch (err: any) {
        cleanup();
        if (err.type === 'COMPILATION_ERROR') {
            return { output: '', error: `Compilation Error:\n${err.message}`, executionTime: 0, memory: 0 };
        }
        return { output: '', error: 'Internal Error', executionTime: 0, memory: 0 };
    }
};

