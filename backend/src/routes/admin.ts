import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/admin/stats - Summary Counts
router.get('/stats', async (req: Request, res: Response) => {
    try {
        const userCount = await prisma.user.count();
        const problemCount = await prisma.problem.count();
        const submissionCount = await prisma.submission.count();
        const contestCount = await prisma.contest.count();

        // Pending Submissions (Optional, if we had a status 'PENDING')
        // const pendingCount = await prisma.submission.count({ where: { status: 'PENDING' } });

        res.json({
            users: userCount,
            problems: problemCount,
            submissions: submissionCount,
            contests: contestCount
        });
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/activity - Chart Data
router.get('/activity', async (req: Request, res: Response) => {
    try {
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        // Group Submissions by Date
        // Prisma doesn't support easy GROUP BY date directly without raw query or logic separation
        // For portable code, we fetch last 30 days data and group in JS (efficient enough for <100k items, otherwise raw query)

        const submissions = await prisma.submission.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true }
        });

        const newUsers = await prisma.user.findMany({
            where: {
                createdAt: { gte: thirtyDaysAgo }
            },
            select: { createdAt: true }
        });

        // Grouping Logic
        const activityMap: Record<string, { submissions: number, users: number }> = {};

        // Initialize map
        for (let i = 0; i <= 30; i++) {
            const d = new Date(thirtyDaysAgo);
            d.setDate(d.getDate() + i);
            const dateStr = d.toISOString().split('T')[0];
            activityMap[dateStr] = { submissions: 0, users: 0 };
        }

        submissions.forEach(s => {
            const d = s.createdAt.toISOString().split('T')[0];
            if (activityMap[d]) activityMap[d].submissions++;
        });

        newUsers.forEach(u => {
            const d = u.createdAt.toISOString().split('T')[0];
            if (activityMap[d]) activityMap[d].users++;
        });

        // Convert to array
        const data = Object.keys(activityMap).sort().map(date => ({
            date,
            submissions: activityMap[date].submissions,
            users: activityMap[date].users
        }));

        res.json(data);
    } catch (error) {
        console.error('Error fetching admin activity:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET /api/admin/health - System Health
router.get('/health', async (req: Request, res: Response) => {
    try {
        const uptime = process.uptime();
        const memoryUsage = process.memoryUsage();

        // Mock CPU Load (Node.js doesn't give easy % without external libs, loadavg is array)
        // We'll return heap used as a proxy for "server load" interest
        res.json({
            uptime,
            memory: {
                total: memoryUsage.heapTotal,
                used: memoryUsage.heapUsed,
                rss: memoryUsage.rss
            },
            status: 'HEALTHY'
        });
    } catch (error) {
        res.status(500).json({ error: 'Health check failed' });
    }
});

// GET /api/admin/popular-problems
router.get('/popular-problems', async (req: Request, res: Response) => {
    try {
        const popular = await prisma.submission.groupBy({
            by: ['problemId'],
            _count: {
                problemId: true
            },
            orderBy: {
                _count: {
                    problemId: 'desc'
                }
            },
            take: 5
        });

        // Fetch titles
        const problemIds = popular.map(p => p.problemId);
        const problems = await prisma.problem.findMany({
            where: { id: { in: problemIds } },
            select: { id: true, title: true, difficulty: true }
        });

        // Merge data
        const result = popular.map(p => {
            const problem = problems.find(prob => prob.id === p.problemId);
            return {
                id: p.problemId,
                title: problem?.title || 'Unknown',
                difficulty: problem?.difficulty || 'Medium',
                submissions: p._count.problemId
            };
        });

        res.json(result);
    } catch (error) {
        console.error('Error fetching popular problems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/admin/users/:id/ban - Ban a user
router.post('/users/:id/ban', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const user = await prisma.user.update({
            where: { id },
            data: {
                // Set ban status (handled by Prisma generated types)
                isBanned: true,
                bannedAt: new Date(),
                banReason: reason || 'No reason provided'
            }
        });

        res.json({ message: 'User banned successfully', user });
    } catch (error) {
        console.error('Error banning user:', error);
        res.status(500).json({ error: 'Failed to ban user' });
    }
});

// POST /api/admin/users/:id/unban - Unban a user
router.post('/users/:id/unban', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const user = await prisma.user.update({
            where: { id },
            data: {
                isBanned: false,
                bannedAt: null,
                banReason: null
            }
        });

        res.json({ message: 'User unbanned successfully', user });
    } catch (error) {
        console.error('Error unbanning user:', error);
        res.status(500).json({ error: 'Failed to unban user' });
    }
});

// DELETE /api/admin/users/:id - Delete a user
router.delete('/users/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        // Delete user (cascade will handle related data)
        await prisma.user.delete({
            where: { id }
        });

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
