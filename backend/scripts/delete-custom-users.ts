
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const targetUsernames = ['12312', 'testuser100'];

    console.log(`Searching for users: ${targetUsernames.join(', ')}...`);

    for (const username of targetUsernames) {
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            console.log(`User '${username}' not found.`);
            continue;
        }

        console.log(`Deleting dependencies for user '${username}' (${user.id})...`);

        // Delete dependencies manually to be safe (Battle, Submission, Contest, etc.)

        // 1. Battle Participants
        // Note: Check if model exists before deleting (in case of schema mismatch)
        try {
            await prisma.battleParticipant.deleteMany({ where: { userId: user.id } });
            console.log(' - Deleted Battle Participants');
        } catch (e) {
            console.log(' - Skipped Battle Participants (model might not exist or empty)');
        }

        // 2. Submissions
        try {
            await prisma.submission.deleteMany({ where: { userId: user.id } });
            console.log(' - Deleted Submissions');
        } catch (e) {
            console.log(' - Skipped Submissions');
        }

        // 3. Delete User
        try {
            await prisma.user.delete({ where: { id: user.id } });
            console.log(`✅ User '${username}' successfully deleted.`);
        } catch (e) {
            console.error(`❌ Failed to delete user '${username}':`, e);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
