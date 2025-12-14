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
    memory?: number; // KB
}

export const executeCode = async (language: string, code: string, input: string): Promise<ExecutionResult> => {
    const jobId = uuidv4();
    const filename = `${jobId}.${language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js'}`;
    const filePath = path.join(TEMP_DIR, filename);
    const inputPath = path.join(TEMP_DIR, `${jobId}.txt`);
    const executablePath = path.join(TEMP_DIR, jobId); // For C++
    const timePath = path.join(TEMP_DIR, `${jobId}_time.txt`);

    // Write code and input to files
    fs.writeFileSync(filePath, code);
    fs.writeFileSync(inputPath, input);

    // Helper to cleanup files
    const cleanup = () => {
        try {
            if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
            if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
            if (fs.existsSync(timePath)) fs.unlinkSync(timePath);
            if (fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
        } catch (e) {
            console.error('Error cleaning up temp files:', e);
        }
    };

    try {
        // --- 1. COMPILATION (C++ Only) ---
        if (language === 'cpp') {
            await new Promise<void>((resolve, reject) => {
                exec(`g++ ${filePath} -o ${executablePath}`, { timeout: 10000 }, (error, stdout, stderr) => {
                    if (error) {
                        reject({ type: 'COMPILATION_ERROR', message: stderr || error.message });
                    } else {
                        resolve();
                    }
                });
            });
        }

        // --- 2. EXECUTION ---
        let command = '';
        if (language === 'python') {
            // Measure Max Resident Set Size (KB) and Elapsed Real Time (sec)
            command = `/usr/bin/time -f "%M %e" -o ${timePath} python3 ${filePath} < ${inputPath}`;
        } else if (language === 'cpp') {
            command = `/usr/bin/time -f "%M %e" -o ${timePath} ${executablePath} < ${inputPath}`;
        } else if (language === 'javascript') {
            command = `/usr/bin/time -f "%M %e" -o ${timePath} node ${filePath} < ${inputPath}`;
        } else {
            cleanup();
            return { output: '', error: 'Unsupported language', executionTime: 0, memory: 0 };
        }

        return await new Promise((resolve) => {
            exec(command, { timeout: 2000, maxBuffer: 1024 * 1024 * 10 }, (error, stdout, stderr) => {
                // Parse stats from time output file
                let executionTime = 0;
                let memory = 0;

                try {
                    if (fs.existsSync(timePath)) {
                        const timeContent = fs.readFileSync(timePath, 'utf-8').trim().split(/\s+/);
                        // timeContent format: [MemoryKB, TimeSeconds] e.g. "1234 0.05"
                        if (timeContent.length >= 2) {
                            memory = parseInt(timeContent[0]); // KB
                            const seconds = parseFloat(timeContent[1]);
                            executionTime = Math.round(seconds * 1000); // Convert to ms
                        }
                    }
                } catch (e) {
                    console.error('Failed to parse time/memory stats');
                }

                // Handle Execution Errors
                if (error) {
                    if (error.killed) {
                        resolve({
                            output: '',
                            error: 'Time Limit Exceeded',
                            executionTime: executionTime || 2000, // Fallback to max timeout
                            memory
                        });
                    } else {
                        // Runtime Error (stderr usually contains the error)
                        resolve({
                            output: stdout,
                            error: stderr || error.message,
                            executionTime,
                            memory
                        });
                    }
                } else {
                    // Success
                    resolve({
                        output: stdout.trim(),
                        error: null,
                        executionTime,
                        memory
                    });
                }

                cleanup();
            });
        });

    } catch (err: any) {
        cleanup();
        if (err.type === 'COMPILATION_ERROR') {
            return { output: '', error: `Compilation Error:\n${err.message}`, executionTime: 0, memory: 0 };
        }
        return { output: '', error: 'Internal System Error', executionTime: 0, memory: 0 };
    }
};
