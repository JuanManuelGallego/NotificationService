/**
 * Seed script — populates the DB with sample patients for local development.
 * Run with: npm run db:seed
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePatients = [
  {
    name: 'María',        lastName: 'García',    email: 'maria.garcia@example.com',
    whatsappNumber: '+15551110001', smsNumber: '+15551110001', status: 'ACTIVE'  as const,
  },
  {
    name: 'Carlos',       lastName: 'López',     email: 'carlos.lopez@example.com',
    whatsappNumber: '+15551110002', smsNumber: null,            status: 'ACTIVE'  as const,
  },
  {
    name: 'Sofía',        lastName: 'Martínez',  email: 'sofia.martinez@example.com',
    whatsappNumber: null,           smsNumber: '+15551110003', status: 'ACTIVE'  as const,
  },
  {
    name: 'Andrés',       lastName: 'Rodríguez', email: 'andres.rodriguez@example.com',
    whatsappNumber: '+15551110004', smsNumber: '+15551110004', status: 'INACTIVE' as const,
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  for (const patient of samplePatients) {
    const created = await prisma.patient.upsert({
      where:  { email: patient.email },
      update: {},
      create: patient,
    });
    console.log(`  ✓ ${created.name} ${created.lastName} (${created.id})`);
  }

  console.log(`\n✅ Seeded ${samplePatients.length} patients.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
