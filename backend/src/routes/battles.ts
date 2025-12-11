import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get all battles (can filter by status query param)
router.get('/', async (req: Request, res: Response) => {
    try {
        const conversations = await prisma.battle.findMany({
            where: {
                status: {
                    in: ['waiting', 'active']
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                rating: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(conversations);
    } catch (error) {
        console.error('Error fetching battles:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create battle
router.post('/', async (req: Request, res: Response) => {
    try {
        const { type, participantIds } = req.body;

        const battle = await prisma.battle.create({
            data: {
                type,
                status: 'waiting',
                participants: {
                    create: participantIds.map((userId: string) => ({
                        userId,
                        score: 0
                    }))
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                rating: true
                            }
                        }
                    }
                }
            }
        });

        res.status(201).json({ battle });
    } catch (error) {
        console.error('Error creating battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get battle by ID
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const battle = await prisma.battle.findUnique({
            where: { id },
            include: {
                participants: {
                    include: {
                        user: {
                            select: {
                                username: true,
                                rating: true
                            }
                        }
                    }
                },
                rounds: {
                    include: {
                        problem: {
                            select: {
                                title: true,
                                difficulty: true
                            }
                        }
                    }
                }
            }
        });

        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        res.json({ battle });
    } catch (error) {
        console.error('Error fetching battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join battle
router.post('/:id/join', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { userId } = req.body;

        const battle = await prisma.battle.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        if (battle.status !== 'waiting') {
            return res.status(400).json({ error: 'Battle already started or finished' });
        }

        const isParticipant = battle.participants.some(p => p.userId === userId);
        if (isParticipant) {
            return res.status(400).json({ error: 'User already in battle' });
        }

        const participant = await prisma.battleParticipant.create({
            data: {
                battleId: id,
                userId,
                score: 0
            },
            include: {
                user: {
                    select: {
                        username: true,
                        rating: true
                    }
                }
            }
        });

        res.json({ participant });
    } catch (error) {
        console.error('Error joining battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start battle
router.post('/:id/start', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const battle = await prisma.battle.findUnique({ where: { id } });

        if (!battle) {
            return res.status(404).json({ error: 'Battle not found' });
        }

        if (battle.status !== 'waiting') {
            return res.status(400).json({ error: 'Battle already started' });
        }

        // Fetch random problems if none assigned (simple logic for now)
        // For simplicity, we'll assume problems are assigned or we pick random ones here
        // This is a placeholder for more complex matchmaking logic
        const problems = await prisma.problem.findMany({ take: 3 });

        // Create rounds
        for (let i = 0; i < problems.length; i++) {
            await prisma.battleRound.create({
                data: {
                    battleId: id,
                    problemId: problems[i].id,
                    order: i + 1,
                    duration: 1800 // 30 mins
                }
            });
        }

        const updatedBattle = await prisma.battle.update({
            where: { id },
            data: {
                status: 'active',
                startTime: new Date()
            }
        });

        res.json({ battle: updatedBattle });
    } catch (error) {
        console.error('Error starting battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
