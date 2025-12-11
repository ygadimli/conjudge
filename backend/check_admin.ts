import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const user = await prisma.user.findUnique({ where: { username: 'raizhekimov2010' } });
  console.log('User found:', user);
  if (!user) {
    const bcrypt = require('bcrypt');
    const hashedPassword = await bcrypt.hash('hekimov2010', 10);
    const newUser = await prisma.user.create({
      data: {
        username: 'raizhekimov2010',
        email: 'raizhekimov2010@example.com',
        password: hashedPassword,
        role: 'ADMIN',
        brainType: 'Architect'
      }
    });
    console.log('Created admin user:', newUser);
  } else if (user.role !== 'ADMIN') {
      await prisma.user.update({
          where: { id: user.id },
          data: { role: 'ADMIN' }
      });
      console.log('Updated user role to ADMIN');
  }
}
main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
