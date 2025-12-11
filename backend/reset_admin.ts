import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const username = 'raizhekimov2010';
    const targetEmail = 'raizhekimov2010@example.com';
    const targetPassword = 'hekimov2010';
    
    const hashedPassword = await bcrypt.hash(targetPassword, 10);

    // Check if user exists by username
    const existingUser = await prisma.user.findUnique({ where: { username } });

    if (existingUser) {
        // Update existing user to match the expected credentials
        const updated = await prisma.user.update({
            where: { username },
            data: {
                email: targetEmail,
                password: hashedPassword,
                role: 'ADMIN'
            }
        });
        console.log('Successfully updated admin user:', updated);
    } else {
        // Create if doesn't exist (though we know it does)
        const created = await prisma.user.create({
            data: {
                username,
                email: targetEmail,
                password: hashedPassword,
                role: 'ADMIN',
                rating: 1200
            }
        });
        console.log('Successfully created admin user:', created);
    }
}

main()
  .catch(e => {
      console.error(e);
      process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
