import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// Get top users (Rankings)
router.get('/', async (req: Request, res: Response) => {
    try {
        const { sortBy = 'rating', country, search, favoritesOnly, userId } = req.query;

        const where: any = {};

        // Filter by Country
        if (country && country !== 'All') {
            where.country = country as string;
        }

        // Filter by Username
        if (search) {
            where.username = { contains: search as string };
        }

        // Filter by Favorites (Following)
        // If favoritesOnly is true, we want users that the current user (userId) follows
        if (favoritesOnly === 'true' && userId) {
            where.followedBy = {
                some: {
                    id: userId as string
                }
            };
        }

        const orderBy: any = {};
        if (sortBy === 'battleRating') {
            orderBy.battleRating = 'desc';
        } else {
            orderBy.rating = 'desc';
        }

        const users = await prisma.user.findMany({
            where,
            take: 50,
            orderBy,
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                password: true, // Helper for Admin to see hash
                country: true,
                rating: true,
                battleRating: true,
                profilePicture: true,
                _count: {
                    select: { submissions: { where: { status: 'AC' } } }
                }
            }
        });

        // Format for frontend
        const formatted = users.map(u => ({
            ...u,
            submissionsCount: u._count.submissions
        }));

        res.json(formatted);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get public profile
router.get('/:username', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username } = req.params;

        const user = await prisma.user.findUnique({
            where: { username },
            select: {
                id: true,
                username: true,
                name: true,
                email: true, // Maybe hide this if public? leaving for now as per request
                country: true,
                city: true,
                bio: true,
                rating: true,
                battleRating: true,
                maxRating: true,
                brainType: true,
                createdAt: true,
                lastVisit: true,
                _count: {
                    select: {
                        submissions: { where: { status: 'AC' } },
                        createdProblems: true,
                        followedBy: true, // Followers
                        following: true   // Following
                    }
                },
                submissions: {
                    where: { status: 'AC' },
                    select: { createdAt: true }
                },
                // Fetch recent submissions for Activity Log
                // NOTE: We can't easily alias in Prisma select without raw query or separate query.
                // But we can just do a second query for recent submissions since we are in an async function.
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch recent submissions separately to avoid messing with the AC-only aggregation logic above (or refactor it)
        const recentActivity = await prisma.submission.findMany({
            where: { userId: user.id },
            take: 20,
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

        // Process AC submissions for Heatmap
        const heatmapData: Record<string, number> = {};
        user.submissions.forEach(sub => {
            const date = sub.createdAt.toISOString().split('T')[0];
            heatmapData[date] = (heatmapData[date] || 0) + 1;
        });

        // Calculate Ranks
        const globalRank = await prisma.user.count({
            where: {
                rating: { gt: user.rating }
            }
        }) + 1;

        let countryRank = 0;
        if (user.country) {
            countryRank = await prisma.user.count({
                where: {
                    rating: { gt: user.rating },
                    country: user.country
                }
            }) + 1;
        }

        // Fetch distinct solved count (unique problems solved)
        const distinctSolved = await prisma.submission.findMany({
            where: {
                userId: user.id,
                status: 'AC'
            },
            distinct: ['problemId'],
            select: { id: true }
        });
        const solvedCount = distinctSolved.length;

        // Check if current user follows this profile
        let isFollowing = false;
        // (We would check follow status here if authentication context provided, 
        //  but this endpoint might be public. If accessed with token, we can check.)

        res.json({
            user: {
                ...user,
                _count: {
                    ...user._count,
                    submissions: solvedCount // Override with distinct count
                },
                globalRank,
                countryRank: countryRank || 'N/A'
            },
            heatmap: heatmapData,
            recentActivity // Return this
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

import bcrypt from 'bcrypt';

// ... (existing imports and code)

// Admin Update User
router.put('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;
        const { username, email, role, rating, battleRating, bio, country, password } = req.body;
        // In a real app we'd check req.user.role === 'ADMIN' here

        const updateData: any = {
            username,
            email,
            role, // Allow changing role
            rating: rating ? Number(rating) : undefined,
            battleRating: battleRating ? Number(battleRating) : undefined,
            bio,
            country
        };

        // Only update password if provided
        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        const updated = await prisma.user.update({
            where: { id },
            data: updateData
        });

        res.json({ user: updated });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Update profile (User's own profile)
router.put('/update/profile', async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId, name, country, city, bio, newPassword } = req.body;

        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const updateData: any = {
            name,
            city,
            bio
        };

        // Only allow setting country once
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (user && !user.country && country) {
            updateData.country = country;
        }

        // Handle password change if provided
        if (newPassword && newPassword.trim().length > 0) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(newPassword, salt);
        }

        const updated = await prisma.user.update({
            where: { id: userId },
            data: updateData
        });

        res.json({ user: updated });
    } catch (error) {
        console.error('Error updating profile:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

// Follow user
router.post('/:id/follow', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id: targetId } = req.params;
        const { userId } = req.body; // Current user

        if (userId === targetId) return res.status(400).json({ error: 'Cannot follow self' });

        // Check if already following
        const me = await prisma.user.findUnique({
            where: { id: userId },
            include: { following: true }
        });

        const isFollowing = me?.following.some(u => u.id === targetId);

        if (isFollowing) {
            // Unfollow
            await prisma.user.update({
                where: { id: userId },
                data: {
                    following: {
                        disconnect: { id: targetId }
                    }
                }
            });
            res.json({ status: 'unfollowed' });
        } else {
            // Follow
            await prisma.user.update({
                where: { id: userId },
                data: {
                    following: {
                        connect: { id: targetId }
                    }
                }
            });
            res.json({ status: 'followed' });
        }

    } catch (error) {
        console.error('Error following user:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// POST /api/users/upload-avatar - Upload profile picture
import { upload } from '../utils/upload';

router.post('/upload-avatar', upload.single('avatar'), async (req: Request, res: Response): Promise<any> => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: 'User ID required' });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Update user's profilePicture field
        // Append timestamp to bust cache since filename is constant (userId.ext)
        const avatarUrl = `/avatars/${req.file.filename}`;

        await prisma.user.update({
            where: { id: userId },
            data: { profilePicture: avatarUrl }
        });

        res.json({ avatarUrl, message: 'Avatar uploaded successfully' });
    } catch (error) {
        console.error('Error uploading avatar:', error);
        res.status(500).json({ error: 'Failed to upload avatar' });
    }
});

// Get User Followers
router.get('/:username/followers', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                followedBy: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        country: true,
                        rating: true
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.followedBy);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching followers' });
    }
});

// Get User Following
router.get('/:username/following', async (req: Request, res: Response): Promise<any> => {
    try {
        const { username } = req.params;
        const user = await prisma.user.findUnique({
            where: { username },
            include: {
                following: {
                    select: {
                        id: true,
                        username: true,
                        profilePicture: true,
                        country: true,
                        rating: true
                    }
                }
            }
        });

        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.following);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error fetching following' });
    }
});

export default router;
