import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET /api/announcements - Get all active (public)
router.get('/', async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            where: { active: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch announcements' });
    }
});

// GET /api/announcements/all - Get ALL (admin only)
router.get('/all', async (req: Request, res: Response) => {
    try {
        const announcements = await prisma.announcement.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(announcements);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch all announcements' });
    }
});

// POST /api/announcements - Create (Admin)
router.post('/', async (req: Request, res: Response) => {
    try {
        const { title, content, type, active } = req.body;
        const announcement = await prisma.announcement.create({
            data: {
                title,
                content,
                type: type || 'INFO',
                active: active !== undefined ? active : true
            }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create announcement' });
    }
});

// PUT /api/announcements/:id - Update
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, content, type, active } = req.body;
        const announcement = await prisma.announcement.update({
            where: { id },
            data: { title, content, type, active }
        });
        res.json(announcement);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update announcement' });
    }
});

// DELETE /api/announcements/:id - Delete
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.announcement.delete({ where: { id } });
        res.json({ message: 'Announcement deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete announcement' });
    }
});

export default router;
