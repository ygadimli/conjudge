import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { executeCode } from '../utils/executor';
import { submitToCodeforces } from '../utils/submitter';

const router = Router();
const prisma = new PrismaClient();

// Use any type for flexibility with Prisma structures in this logic block
const evaluateSubmissionKeyLogic = async (problem: any, code: string, language: string) => {
    let subtasks: any[] = [];
    try {
        const parsed = JSON.parse(problem.testCases as string);
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed[0].cases) {
            subtasks = [{ group: 1, points: 100, cases: parsed }];
        } else {
            subtasks = parsed;
        }
    } catch (e) {
        throw new Error('Invalid problem test data');
    }

    let totalScore = 0;
    let finalStatus = 'AC';
    let maxRuntime = 0;

    for (const task of subtasks) {
        let groupPassed = true;

        for (const testCase of task.cases) {
            const result = await executeCode(language, code, testCase.input);
            maxRuntime = Math.max(maxRuntime, result.executionTime);

            if (result.error) {
                groupPassed = false;
                if (finalStatus === 'AC') {
                    if (result.error === 'Time Limit Exceeded') finalStatus = 'TLE';
                    else if (result.error.includes('gcc') || result.error.includes('error:')) finalStatus = 'CE';
                    else finalStatus = 'RE';
                }
                break;
            }

            if (result.output.trim() !== testCase.output.trim()) {
                groupPassed = false;
                if (finalStatus === 'AC') finalStatus = 'WA';
                break;
            }
        }

        if (groupPassed) {
            totalScore += (task.points || 0);
        }
    }

    if (totalScore === 100) finalStatus = 'AC';

    return { status: finalStatus, score: totalScore, runtime: maxRuntime };
};

// Submit solution (Database + Scoring)
router.post('/', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, problemId, code, language } = req.body;

        const problem = await prisma.problem.findUnique({
            where: { id: problemId }
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        if ((problem as any).externalSource === 'Codeforces' && (problem as any).externalId) {
            // External Submission Logic (Codeforces)
            const { jsessionId } = req.body;
            if (!jsessionId) {
                return res.status(400).json({ error: 'JSESSIONID required for Codeforces submission' });
            }

            let cfLangId = '54';
            if (language.includes('python')) cfLangId = '31';

            const result = await submitToCodeforces((problem as any).externalId, code, cfLangId, jsessionId);

            if (!result.success) {
                return res.status(400).json({ error: result.message });
            }

            const submission = await prisma.submission.create({
                data: {
                    code,
                    language,
                    status: 'PENDING',
                    score: 0,
                    runtime: 0,
                    memory: 0,
                    userId,
                    problemId
                }
            });

            return res.status(201).json({ submission, message: result.message });
        }

        // Local Execution
        try {
            const { status, score, runtime } = await evaluateSubmissionKeyLogic(problem, code, language);

            const submission = await prisma.submission.create({
                data: {
                    code,
                    language,
                    status,
                    score,
                    runtime,
                    memory: 0,
                    userId,
                    problemId
                }
            });

            res.status(201).json({ submission });
        } catch (err: any) {
            return res.status(500).json({ error: err.message });
        }
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Rejudge Submission
router.post('/:id/rejudge', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const submission = await prisma.submission.findUnique({
            where: { id },
            include: { problem: true }
        });

        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        if (!submission.problem) return res.status(404).json({ error: 'Problem not found' });

        const { status, score, runtime } = await evaluateSubmissionKeyLogic(submission.problem, submission.code, submission.language);

        const updated = await prisma.submission.update({
            where: { id },
            data: { status, score, runtime }
        });

        res.json(updated);
    } catch (error) {
        console.error('Rejudge failed:', error);
        res.status(500).json({ error: 'Rejudge failed' });
    }
});

// Delete Submission
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.submission.delete({ where: { id } });
        res.json({ message: 'Submission deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Delete failed' });
    }
});

// Get ALL submissions (Admin)
router.get('/all', async (req: Request, res: Response) => {
    try {
        const submissions = await prisma.submission.findMany({
            include: {
                problem: { select: { title: true } },
                user: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        });
        res.json({ submissions });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submissions' });
    }
});

// Get submissions for a user
router.get('/user/:userId', async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;

        const submissions = await prisma.submission.findMany({
            where: { userId },
            include: {
                problem: {
                    select: {
                        title: true,
                        difficulty: true,
                        rating: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json({ submissions });
    } catch (error) {
        console.error('Error fetching submissions:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Run code with custom input
router.post('/run', async (req: Request, res: Response): Promise<any> => {
    try {
        const { code, language, input } = req.body;
        const result = await executeCode(language, code, input || '');
        res.json({ result });
    } catch (error) {
        console.error('Error running code:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Single Submission
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const submission = await prisma.submission.findUnique({
            where: { id },
            include: {
                problem: { select: { title: true, id: true } },
                user: { select: { username: true } }
            }
        });
        if (!submission) return res.status(404).json({ error: 'Submission not found' });
        res.json({ submission });
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch submission' });
    }
});

export default router;
