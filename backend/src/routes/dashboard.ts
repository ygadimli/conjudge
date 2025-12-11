import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/:userId', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.params;

        // 1. Get User Basic Info
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                username: true,
                rating: true,
                battleRating: true, // Added
                brainType: true,
                name: true,
                country: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 2. Get Recent Activity
        const recentSubmissions = await prisma.submission.findMany({
            where: { userId },
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                problem: {
                    select: {
                        title: true,
                        difficulty: true
                    }
                }
            }
        });

        // 3. Get Solved Count
        const acceptedSubmissions = await prisma.submission.findMany({
            where: {
                userId,
                status: 'AC'
            },
            select: { problemId: true },
            distinct: ['problemId']
        });

        const solvedCount = acceptedSubmissions.length;

        // 3.5 Get Battles Count
        const battlesCount = await prisma.battleParticipant.count({
            where: { userId }
        });

        // 4. Calculate Stats per Category
        const acWithCategory = await prisma.submission.findMany({
            where: { userId, status: 'AC' },
            include: {
                problem: {
                    select: { category: true }
                }
            },
            distinct: ['problemId']
        });

        const statsMap: Record<string, number> = {};
        let totalStats = 0;

        acWithCategory.forEach(sub => {
            const cat = sub.problem.category || 'Other';
            statsMap[cat] = (statsMap[cat] || 0) + 1;
            totalStats++;
        });

        // Convert to percentage array
        const stats = Object.entries(statsMap).map(([name, count]) => ({
            name,
            count,
            percentage: totalStats > 0 ? Math.round((count / totalStats) * 100) : 0
        }));

        res.json({
            user,
            recentActivity: recentSubmissions,
            solvedCount,
            stats,
            battlesCount // Real count
        });

    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
