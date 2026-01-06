
import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { calculateElo, generateJoinCode, getTargetProblemRating } from '../utils/elo';

const router = Router();
const prisma = new PrismaClient();

// Get active public battles (Lobbies)
router.get('/public', async (req: Request, res: Response) => {
    try {
        const { minRating, maxRating, region, country } = req.query;

        const whereClause: any = {
            status: 'waiting',
            isPrivate: false,
        };

        if (minRating) whereClause.minRating = { gte: Number(minRating) };
        if (maxRating) whereClause.maxRating = { lte: Number(maxRating) };
        if (region) whereClause.region = region as string;
        if (country) whereClause.country = country as string;

        const battles = await prisma.battle.findMany({
            where: whereClause,
            include: {
                participants: {
                    include: {
                        user: { select: { username: true, rating: true, battleRating: true, country: true } }
                    }
                },
                createdBy: { select: { username: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(battles);
    } catch (error) {
        console.error('Error fetching lobbies:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create new battle
router.post('/create', async (req: Request, res: Response): Promise<any> => {
    try {
        const {
            type = '1v1',
            isPrivate = false,
            minRating,
            maxRating,
            duration = 1800,
            problemCount = 3,
            userId // Creator ID
        } = req.body;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return res.status(404).json({ error: "User not found" });

        const joinCode = isPrivate ? generateJoinCode() : null;

        const battle = await prisma.battle.create({
            data: {
                type,
                status: 'waiting',
                isPrivate,
                joinCode,
                minRating: minRating ? Number(minRating) : null,
                maxRating: maxRating ? Number(maxRating) : null,
                duration: Number(duration),
                problemCount: Number(problemCount),
                createdById: userId,
                participants: {
                    create: {
                        userId,
                        oldRating: user.battleRating || 1200,
                        status: 'ready'
                    }
                }
            }
        });

        res.json(battle);
    } catch (error) {
        console.error('Error creating battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Join battle (by ID or Code)
router.post('/join', async (req: Request, res: Response): Promise<any> => {
    try {
        const { battleId, joinCode, userId } = req.body;

        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        let battle;
        if (joinCode) {
            battle = await prisma.battle.findUnique({
                where: { joinCode },
                include: { participants: true }
            });
        } else if (battleId) {
            battle = await prisma.battle.findUnique({
                where: { id: battleId },
                include: { participants: true }
            });
        }

        if (!battle) return res.status(404).json({ error: "Battle not found" });
        if (battle.status !== 'waiting') return res.status(400).json({ error: "Battle already started" });

        // Rating check
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const userRating = user?.battleRating || 1200;

        if (battle.minRating && userRating < battle.minRating) {
            return res.status(400).json({ error: `Rating too low (Min: ${battle.minRating})` });
        }
        if (battle.maxRating && userRating > battle.maxRating) {
            return res.status(400).json({ error: `Rating too high (Max: ${battle.maxRating})` });
        }

        // Check if already joined
        if (battle.participants.some(p => p.userId === userId)) {
            return res.json({ message: "Already joined", battleId: battle.id });
        }

        // Check types (1v1 limit)
        if (battle.type === '1v1' && battle.participants.length >= 2) {
            return res.status(400).json({ error: "Battle is full" });
        }

        const participant = await prisma.battleParticipant.create({
            data: {
                battleId: battle.id,
                userId,
                oldRating: userRating,
                status: 'ready'
            },
            include: { user: { select: { username: true, rating: true } } }
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`battle-${battle.id}`).emit('participant-joined', participant);
        }

        res.json({ battleId: battle.id });
    } catch (error) {
        console.error('Error joining battle:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Quick Match
router.post('/quick-match', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.body;
        const user = await prisma.user.findUnique({ where: { id: userId } });
        const rating = user?.battleRating || 1200;

        // Find detailed range match
        const battle = await prisma.battle.findFirst({
            where: {
                status: 'waiting',
                isPrivate: false,
                type: '1v1',
                OR: [
                    {
                        // Match roughly +- 200 rating
                        participants: {
                            some: {
                                oldRating: {
                                    gte: rating - 200,
                                    lte: rating + 200
                                }
                            }
                        }
                    },
                    {
                        // Or empty battles with compatible requirements
                        participants: { none: {} }, // Actually a quick match should join existing
                        minRating: { lte: rating },
                        maxRating: { gte: rating }
                    }
                ]
            },
            include: { participants: true }
        });

        if (battle && battle.participants.length < 2) {
            // Join existing
            await prisma.battleParticipant.create({
                data: {
                    battleId: battle.id,
                    userId,
                    oldRating: rating,
                    status: 'ready'
                }
            });
            return res.json({ battleId: battle.id, action: 'joined' });
        }

        // Create new if none found
        const newBattle = await prisma.battle.create({
            data: {
                type: '1v1',
                status: 'waiting',
                isPrivate: false,
                minRating: Math.max(0, rating - 200),
                maxRating: rating + 200,
                duration: 1800,
                problemCount: 3,
                createdById: userId,
                participants: {
                    create: {
                        userId,
                        oldRating: rating,
                        status: 'ready'
                    }
                }
            }
        });

        res.json({ battleId: newBattle.id, action: 'created' });

    } catch (error) {
        console.error('Error quick match:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Battle Details
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const battle = await prisma.battle.findUnique({
            where: { id: req.params.id },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, rating: true, battleRating: true, profilePicture: true, country: true } }
                    },
                    orderBy: { score: 'desc' }
                },
                rounds: {
                    include: {
                        problem: {
                            select: { id: true, title: true, description: true, testCases: true, timeLimit: true, memoryLimit: true }
                        }
                    },
                    orderBy: { order: 'asc' }
                },
                createdBy: { select: { username: true } }
            }
        });

        if (!battle) return res.status(404).json({ error: "Battle not found" });
        res.json({ battle });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Start Battle
router.post('/:id/start', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { userId } = req.body; // Requester

        const battle = await prisma.battle.findUnique({
            where: { id },
            include: { participants: true }
        });

        if (!battle) return res.status(404).json({ error: "Not found" });
        if (battle.createdById !== userId) return res.status(403).json({ error: "Only creator can start" });
        if (battle.status !== 'waiting') return res.status(400).json({ error: "Already started" });

        // Select Problems based on Avg Rating
        const avgRating = battle.participants.reduce((acc, p) => acc + (p.oldRating || 1200), 0) / battle.participants.length;
        const targetRating = getTargetProblemRating(avgRating);

        // Fetch problems roughly near this rating
        // Since we might not have many, we just take 3 closest or random
        const problems = await prisma.problem.findMany({
            take: battle.problemCount,
            // In real app, perform raw query or advanced filter. Here we just take random.
        });

        if (problems.length === 0) return res.status(400).json({ error: "No problems available in system" });

        // Create rounds
        for (let i = 0; i < problems.length; i++) {
            // Loop logic if fewer problems than requested
            const problem = problems[i % problems.length];
            await prisma.battleRound.create({
                data: {
                    battleId: id,
                    problemId: problem.id,
                    order: i + 1,
                    duration: battle.duration, // Total duration spread? Or per problem? User said "Live Battle 00:29:59", usually total time.
                    problemRating: problem.rating
                }
            });
        }

        const updated = await prisma.battle.update({
            where: { id },
            data: {
                status: 'active',
                startTime: new Date()
            }
        });

        const io = req.app.get('io');
        if (io) {
            io.to(`battle-${id}`).emit('battle-started', updated);
        }

        // Socket emit could go here (via global io if available)

        res.json(updated);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Finish Battle (Calculate ELO)
router.post('/:id/finish', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const battle = await prisma.battle.findUnique({
            where: { id },
            include: { participants: { include: { user: true } } }
        });

        if (!battle || battle.status === 'finished') return res.json({ message: "Already finished" });

        // 1v1 Logic
        if (battle.type === '1v1' && battle.participants.length === 2) {
            const p1 = battle.participants[0];
            const p2 = battle.participants[1];

            let score1 = 0.5; // Draw
            if (p1.score > p2.score) score1 = 1;
            else if (p1.score < p2.score) score1 = 0;

            const r1 = p1.oldRating || 1200;
            const r2 = p2.oldRating || 1200;

            const newR1 = calculateElo(r1, r2, score1);
            const newR2 = calculateElo(r2, r1, 1 - score1);

            // Update P1
            await prisma.battleParticipant.update({
                where: { id: p1.id },
                data: {
                    newRating: newR1,
                    ratingChange: newR1 - r1,
                    rank: score1 === 1 ? 1 : (score1 === 0 ? 2 : 1)
                }
            });
            await prisma.user.update({ where: { id: p1.userId }, data: { battleRating: newR1 } });

            // Update P2
            await prisma.battleParticipant.update({
                where: { id: p2.id },
                data: {
                    newRating: newR2,
                    ratingChange: newR2 - r2,
                    rank: score1 === 1 ? 2 : (score1 === 0 ? 1 : 1)
                }
            });
            await prisma.user.update({ where: { id: p2.userId }, data: { battleRating: newR2 } });
        }

        await prisma.battle.update({
            where: { id },
            data: { status: 'finished', endTime: new Date() }
        });

        res.json({ message: "Battle finished" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

export default router;
