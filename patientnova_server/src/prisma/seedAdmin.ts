import bcrypt from 'bcrypt';
import { prisma } from './prismaClient.js';

async function seedAdmin() {
  const email = 'admin@patientnova.com';
  const existing = await prisma.user.findUnique({ where: { email } });

  if (existing) {
    console.log('Admin user already exists — skipping.');
    return;
  }

  const passwordHash = await bcrypt.hash('ChangeMe123!', 12);
  await prisma.user.create({
    data: {
      email,
      passwordHash,
      name: 'Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Admin created: admin@patientnova.com / ChangeMe123!');
  console.log('⚠️  Change the default password immediately after first login!');
}

seedAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
