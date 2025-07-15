import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

const docs = JSON.parse(fs.readFileSync('../../dbjson/Task.json', 'utf-8'));

async function main() {
  for (const doc of docs) {
    const { createdAt, updatedAt, dueDate, ...dataWithoutCreatedAt } =
      doc || {};

    await prisma.task.create({
      data: dataWithoutCreatedAt,
    });
  }
}

main()
  .then(() => {
    console.log('✅ Docs seeded successfully!');
  })
  .catch((e) => {
    console.error('❌ Error seeding docs:', e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
