
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get an Admin User to be the creator
        const creator = await prisma.user.findFirst({
            where: { role: 'ADMIN' }
        });

        if (!creator) {
            console.error('No admin user found. Please create an admin user first.');
            return;
        }

        console.log(`Creating contest with creator: ${creator.username} (${creator.id})`);

        // 2. Get some problems to add to the contest (optional, but good for demo)
        const problems = await prisma.problem.findMany({ take: 3 });
        console.log(`Found ${problems.length} problems to add.`);

        // 3. Create the Contest
        const startTime = new Date();
        startTime.setHours(startTime.getHours() + 24); // Start tomorrow

        const contest = await prisma.contest.create({
            data: {
                title: 'ConJudge Contest - 1',
                description: 'The first official round of ConJudge. Solve 3 problems in 2 hours!',
                startTime: startTime,
                duration: 120, // 2 hours
                status: 'UPCOMING',
                createdById: creator.id,
                problems: {
                    connect: problems.map(p => ({ id: p.id }))
                }
            }
        });

        console.log('✅ Contest Created Successfully:');
        console.log(contest);

    } catch (error) {
        console.error('Error creating contest:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
