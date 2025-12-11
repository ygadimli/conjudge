import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Create Admins
    const salt = await bcrypt.genSalt(10);

    // Admin 1: Raiz
    const raizPass = await bcrypt.hash('hekimov2010', salt);
    const raiz = await prisma.user.upsert({
        where: { username: 'raizhekimov2010' },
        update: { role: 'ADMIN', password: raizPass },
        create: {
            username: 'raizhekimov2010',
            email: 'raiz@example.com',
            password: raizPass,
            role: 'ADMIN',
            rating: 1500
        }
    });

    // Admin 2: Yusif
    const yusifPass = await bcrypt.hash('yusif2010', salt);
    const yusif = await prisma.user.upsert({
        where: { username: 'yusifbro2010' },
        update: { role: 'ADMIN', password: yusifPass },
        create: {
            username: 'yusifbro2010',
            email: 'yusif@example.com',
            password: yusifPass,
            role: 'ADMIN',
            rating: 1500
        }
    });

    console.log('✅ Admins created');

    // 2. Create Problems with Subtasks (Codeforces Style)
    // Structure: [{ group: 1, points: 5, cases: [] }, ...]

    // Problem 1: Sum 1 to N
    // Subtask 1 (5pts): 1 < n < 5
    // Subtask 2 (15pts): 1 < n < 100
    // Subtask 3 (80pts): n < 100000

    const sumProblem = await prisma.problem.create({
        data: {
            title: 'Sum of Numbers',
            description: 'Print the sum of numbers from 1 to n.\n\n### Scoring\n\n* **Subtask 1 (5 points):** 1 < n < 5\n* **Subtask 2 (15 points):** 1 < n < 100\n* **Subtask 3 (80 points):** n < 100000',
            difficulty: 1,
            rating: 800,
            category: 'Math',
            tags: 'math,implementation',
            timeLimit: 1000,
            memoryLimit: 256,
            testCases: JSON.stringify([
                {
                    group: 1,
                    points: 5,
                    cases: [
                        { input: '3', output: '6' }, // 1+2+3
                        { input: '4', output: '10' }
                    ]
                },
                {
                    group: 2,
                    points: 15,
                    cases: [
                        { input: '10', output: '55' },
                        { input: '50', output: '1275' }
                    ]
                },
                {
                    group: 3,
                    points: 80,
                    cases: [
                        { input: '100', output: '5050' },
                        { input: '1000', output: '500500' }
                    ]
                }
            ]),
            createdById: raiz.id
        }
    });

    // Existing Two Sum (update format if needed, but keeping simple for compatibility for now or wrap in group 0)
    // For backward compatibility, the frontend should handle both formats or we migrate all.
    // Let's migrate Two Sum to new format (1 group, 100 points)

    const twoSum = await prisma.problem.create({
        data: {
            title: 'Two Sum',
            description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
            difficulty: 2,
            rating: 1200,
            category: 'Arrays',
            tags: 'array,hash-table',
            timeLimit: 1000,
            memoryLimit: 256,
            testCases: JSON.stringify([
                {
                    group: 1,
                    points: 100,
                    cases: [
                        { input: "2 7 11 15\n9", output: "0 1" },
                        { input: "3 2 4\n6", output: "1 2" },
                        { input: "3 3\n6", output: "0 1" }
                    ]
                }
            ]),
            createdById: raiz.id
        }
    });

    console.log('✅ Problems seeded with Subtasks');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
