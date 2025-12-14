
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        where: { email: 'raizhekimov2010@gmail.com' }
    });

    if (user) {
        console.log('User found:', user.username, user.email, 'Auth Type:', user.password ? 'Password' : 'OAuth Only');
    } else {
        console.log('User NOT found!');
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
