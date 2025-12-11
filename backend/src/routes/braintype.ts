import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Heuristic 'AI' Analysis Endpoint
router.post('/analyze', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.body;

        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Fetch submissions for analysis
        const submissions = await prisma.submission.findMany({
            where: { userId },
            include: {
                problem: {
                    select: {
                        rating: true,
                        tags: true,
                        difficulty: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: 100 // Analyze last 100 stats
        });

        if (submissions.length === 0) {
            return res.json({
                brainType: "The Novice Explorer",
                description: "Not enough data to analyze patterns yet. Solve more problems to unlock your true Brain Type.",
                stats: {
                    accuracy: 0,
                    speed: 0,
                    complexity: 0,
                    persistence: 0
                }
            });
        }

        // --- Metrics Calculation ---

        // 1. Accuracy (Precision)
        const acCount = submissions.filter(s => s.status === 'AC').length;
        const accuracy = (acCount / submissions.length) * 100;

        // 2. Speed (Avg Runtime of ACs) vs Complexity
        const acSubmissions = submissions.filter(s => s.status === 'AC');
        const avgRuntime = acSubmissions.length > 0
            ? acSubmissions.reduce((sum, s) => sum + s.runtime, 0) / acSubmissions.length
            : 0;

        // Normalize speed score (Lower is better, assume <50ms is instant 100, >1000ms is slow 0)
        // This is rough, real analysis would depend on language/problem.
        let speedScore = Math.max(0, 100 - (avgRuntime / 10));

        // 3. Complexity (Average Rating of Attempted Problems)
        const avgRating = submissions.reduce((sum, s) => sum + (s.problem.rating || 800), 0) / submissions.length;
        // Normalize rating (800 -> 0, 3000 -> 100)
        const complexityScore = Math.min(100, Math.max(0, (avgRating - 800) / 22));

        // 4. Persistence (Ratio of TLE/WA before AC on unique problems)
        // Count unique problems solved
        const solvedProblemIds = new Set(acSubmissions.map(s => s.problemId));
        // Count total attempts on these problems
        const attemptsOnSolved = submissions.filter(s => solvedProblemIds.has(s.problemId)).length;
        // Good persistence = High attempts per solved (Grinder) OR Low attempts (Genius)?
        // Let's define Persistence as "Willingness to keep trying". 
        // If Avg Attempts > 3, High Persistence.
        const avgAttempts = solvedProblemIds.size > 0 ? attemptsOnSolved / solvedProblemIds.size : 0;
        const persistenceScore = Math.min(100, (avgAttempts / 5) * 100);


        // --- Classification Logic (The "AI" Decision Tree) ---
        let brainType = "The Balanced Architect";
        let description = "You maintain a perfect equilibrium between speed and accuracy. Your code is structured, and you approach problems with a clear, balanced mindset.";

        // Thresholds
        const HIGH_ACCURACY = 70;
        const HIGH_SPEED = 80; // (which means low runtime)
        const HIGH_COMPLEXITY = 60; // (~2100 rating avg)
        const HIGH_PERSISTENCE = 60; // (>3 attempts avg)

        if (complexityScore > HIGH_COMPLEXITY && accuracy > HIGH_ACCURACY) {
            brainType = "The Grandmaster Strategist";
            description = "You possess an elite analytical mind. You tackle the hardest problems with surgical precision, rarely making mistakes. You see the solution before you even type.";
        } else if (speedScore > HIGH_SPEED && accuracy > 60) {
            brainType = "The Lightning Coder";
            description = "Your thought process is instantaneous. You solve standard problems faster than anyone else. Your reflex-to-code connection is almost superhuman.";
        } else if (persistenceScore > HIGH_PERSISTENCE && accuracy < 50) {
            brainType = "The Unstoppable Grinder";
            description = "You never give up. Where others quit after a 'Wrong Answer', you dig deeper. Your superpower is resilience; you learn through trial and error until you dominate.";
        } else if (accuracy > 90) {
            brainType = "The Perfectionist";
            description = "You don't just solve problems; you write art. You rarely submit code that fails. You think through every edge case before hitting submit.";
        } else if (complexityScore > 50) {
            brainType = "The Deep Thinker";
            description = "You prefer quality over quantity. You are drawn to complex algorithmic challenges that require deep, abstract reasoning rather than simple implementation.";
        }

        // Update User Profile
        await prisma.user.update({
            where: { id: userId },
            data: { brainType }
        });

        res.json({
            brainType,
            description,
            stats: {
                accuracy: Math.round(accuracy),
                speed: Math.round(speedScore),
                complexity: Math.round(complexityScore),
                persistence: Math.round(persistenceScore)
            }
        });

    } catch (error) {
        console.error('Brain Type Analysis Error:', error);
        res.status(500).json({ error: 'Failed to analyze brain type' });
    }
});

export default router;
