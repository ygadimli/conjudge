import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { scrapeCodeforcesProblem } from '../utils/scraper';

const router = Router();
const prisma = new PrismaClient();

// Get all problems with filtering
router.get('/', async (req: Request, res: Response) => {
    try {
        const { minRating, maxRating, tag, search } = req.query;

        const where: any = {};

        // Rating Filter
        if (minRating || maxRating) {
            where.rating = {};
            if (minRating) where.rating.gte = Number(minRating);
            if (maxRating) where.rating.lte = Number(maxRating);
        }

        // Tag Filter
        if (tag) {
            where.tags = {
                contains: String(tag)
            };
        }

        // Search (Title or Description)
        if (search) {
            where.OR = [
                { title: { contains: String(search) } }, // Remove mode: 'insensitive' for SQLite
                { description: { contains: String(search) } }
            ];
        }

        const problems = await prisma.problem.findMany({
            where,
            select: {
                id: true,
                title: true,
                difficulty: true,
                rating: true,
                category: true,
                tags: true,
                createdAt: true
            },
            orderBy: { rating: 'asc' } // Order by rating by default
        });

        res.json({ problems });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get problem by ID
router.get('/:id', async (req: Request, res: Response): Promise<any> => {
    try {
        const { id } = req.params;

        const problem = await prisma.problem.findUnique({
            where: { id },
            include: {
                createdBy: {
                    select: {
                        username: true
                    }
                }
            }
        });

        if (!problem) {
            return res.status(404).json({ error: 'Problem not found' });
        }

        res.json({ problem });
    } catch (error) {
        console.error('Error fetching problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create problem (Admin only - TODO: Middleware)
router.post('/', async (req: Request, res: Response) => {
    try {
        const {
            title, description, rating, category, tags,
            testCases, timeLimit, memoryLimit, createdById
        } = req.body;

        // Map rating to simple difficulty (1-3) for legacy support
        let difficulty = 1;
        if (rating >= 1200) difficulty = 2;
        if (rating >= 1900) difficulty = 3;

        const problem = await prisma.problem.create({
            data: {
                title,
                description,
                difficulty,
                rating: Number(rating),
                category,
                tags: Array.isArray(tags) ? tags.join(',') : tags,
                // testCases should be JSON string of subtask structure provided by frontend
                testCases: typeof testCases === 'string' ? testCases : JSON.stringify(testCases),
                timeLimit: Number(timeLimit),
                memoryLimit: Number(memoryLimit),
                createdById
            }
        });

        res.status(201).json({ problem });
    } catch (error) {
        console.error('Error creating problem:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Import problem from Codeforces (Admin only)
router.post('/import', async (req: Request, res: Response): Promise<any> => {
    try {
        const { url, createdById } = req.body;

        console.log('📥 Import request received:', { url, createdById });

        if (!url || !url.includes('codeforces.com')) {
            return res.status(400).json({ error: 'Invalid Codeforces URL' });
        }

        console.log('🔍 Starting scrape...');
        const scrapedData = await scrapeCodeforcesProblem(url);
        console.log('✅ Scrape successful:', scrapedData.title);

        // Convert scraped data to DB format
        // We'll set a default rating of 1200 or try to map it if we could (scraper doesn't fetch rating easily without contest API)
        const difficulty = 2; // Default Medium
        const rating = 1200;

        // Check if problem already exists (by title)
        const existing = await prisma.problem.findFirst({
            where: { title: scrapedData.title }
        });

        if (existing) {
            console.log('⚠️ Problem already exists:', scrapedData.title);
            return res.status(409).json({ error: 'Problem with this title already exists' });
        }

        console.log('💾 Creating problem in database...');
        const problem = await prisma.problem.create({
            data: {
                title: scrapedData.title,
                description: scrapedData.description + (scrapedData.notes ? `<br><div class="note">Note: ${scrapedData.notes}</div>` : ''),
                difficulty,
                rating,
                category: 'Algorithms', // Default
                tags: scrapedData.tags.join(','),
                testCases: JSON.stringify(scrapedData.testCases), // Store simple test cases array
                timeLimit: parseInt(scrapedData.timeLimit) * 1000 || 1000,
                memoryLimit: parseInt(scrapedData.memoryLimit) || 256,
                isAiGenerated: false,
                externalSource: scrapedData.externalSource,
                externalId: scrapedData.externalId,
                createdById
            }
        });

        console.log('✅ Problem created successfully:', problem.id);
        res.json({ problem });

    } catch (error: any) {
        console.error('❌ Import error:', error);
        console.error('Error details:', error.message);
        res.status(500).json({
            error: 'Failed to import problem',
            details: error.message
        });
    }
});

// Update Problem
router.put('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const {
            title, description, rating, category, tags,
            testCases, timeLimit, memoryLimit
        } = req.body;

        const data: any = {
            title, description, rating: Number(rating), category,
            tags: Array.isArray(tags) ? tags.join(',') : tags,
            timeLimit: Number(timeLimit), memoryLimit: Number(memoryLimit)
        };

        if (testCases) {
            data.testCases = typeof testCases === 'string' ? testCases : JSON.stringify(testCases);
        }

        const problem = await prisma.problem.update({
            where: { id },
            data
        });

        res.json(problem);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update problem' });
    }
});

// Delete Problem
router.delete('/:id', async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.problem.delete({ where: { id } });
        res.json({ message: 'Problem deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete problem' });
    }
});

export default router;
