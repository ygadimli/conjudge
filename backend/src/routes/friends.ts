import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get my friends (people I follow)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { userId } = req.query; // Assuming passed as query param for MVP, or header
        if (!userId) return res.status(400).json({ error: 'User ID required' });

        const user = await prisma.user.findUnique({
            where: { id: String(userId) },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        rating: true,
                        country: true,
                        lastVisit: true,
                        _count: {
                            select: { submissions: { where: { status: 'AC' } } }
                        }
                    }
                },
                followedBy: {
                    select: {
                        id: true,
                        username: true,
                        rating: true,
                        country: true,
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({
            following: user.following,
            followers: user.followedBy
        });
    } catch (error) {
        console.error('Error fetching friends:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
