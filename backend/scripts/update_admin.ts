
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function updateAdmin() {
    try {
        const username = 'raizhekimov2010';
        const newEmail = 'raizhekimov2010@gmail.com';
        const newPassword = 'hekimov2010';

        console.log(`Updating user: ${username}`);

        // Hash password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user
        const user = await prisma.user.update({
            where: { username },
            data: {
                email: newEmail,
                password: hashedPassword,
                isVerified: true // Auto verify admin
            }
        });

        console.log('User updated successfully:', user.username);
    } catch (error) {
        console.error('Error updating user:', error);
    } finally {
        await prisma.$disconnect();
    }
}

updateAdmin();
