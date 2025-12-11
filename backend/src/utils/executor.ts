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

    let command = '';
    let needsCompilation = false;

    if (language === 'python') {
        // Use /usr/bin/time to track memory (if available)
        command = `/usr/bin/time -f "%M" -o ${timePath} python3 ${filePath} < ${inputPath} 2>&1 || python3 ${filePath} < ${inputPath}`;
    } else if (language === 'cpp') {
        needsCompilation = true;
        // Compile first (not timed), then run with timing
        command = `g++ ${filePath} -o ${executablePath} 2>&1 && /usr/bin/time -f "%M" -o ${timePath} ${executablePath} < ${inputPath} 2>&1 || ${executablePath} < ${inputPath}`;
    } else if (language === 'javascript') {
        command = `/usr/bin/time -f "%M" -o ${timePath} node ${filePath} < ${inputPath} 2>&1 || node ${filePath} < ${inputPath}`;
    } else {
        return { output: '', error: 'Unsupported language', executionTime: 0 };
    }

    return new Promise((resolve) => {
        const start = Date.now();

        exec(command, { timeout: 5000 }, (error, stdout, stderr) => {
            const end = Date.now();
            let executionTime = end - start;

            // For C++, subtract approximate compilation time (usually 200-400ms)
            if (needsCompilation && executionTime > 100) {
                executionTime = Math.max(10, executionTime - 300); // Rough estimate
            }

            // Try to read memory usage from time output
            let memory = 0;
            try {
                if (fs.existsSync(timePath)) {
                    const timeOutput = fs.readFileSync(timePath, 'utf-8').trim();
                    memory = parseInt(timeOutput) || 0; // KB
                }
            } catch (e) {
                // Memory tracking not available
            }

            // Cleanup
            try {
                if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
                if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath);
                if (fs.existsSync(timePath)) fs.unlinkSync(timePath);
                if (language === 'cpp' && fs.existsSync(executablePath)) fs.unlinkSync(executablePath);
            } catch (e) {
                console.error('Error cleaning up temp files:', e);
            }

            if (error) {
                // If it's a timeout
                if (error.killed) {
                    resolve({ output: '', error: 'Time Limit Exceeded', executionTime: 5000, memory });
                } else {
                    resolve({ output: stdout, error: stderr || error.message, executionTime, memory });
                }
            } else {
                resolve({ output: stdout.trim(), error: null, executionTime, memory });
            }
        });
    });
};
