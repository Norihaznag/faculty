import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if universities exist
  const existing = await prisma.university.count();
  if (existing > 0) {
    console.log('Universities already seeded');
    return;
  }

  const universities = [
    { name: 'Ibn Zohr University', slug: 'ibn-zohr', city: 'Agadir' },
    { name: 'Qadi Ayyad University', slug: 'qadi-ayyad', city: 'Marrakech' },
    { name: 'University of Fez', slug: 'fez', city: 'Fez' },
    { name: 'Hassan II University', slug: 'hassan-ii', city: 'Casablanca' },
    { name: 'Al Akhawayn University', slug: 'al-akhawayn', city: 'Ifrane' },
    { name: 'University of Rabat', slug: 'rabat', city: 'Rabat' },
    { name: 'Sultan Moulay Slimane University', slug: 'sultan-moulay', city: 'Beni Mellal' },
    { name: 'University of Tangier', slug: 'tangier', city: 'Tangier' },
  ];

  for (const uni of universities) {
    await prisma.university.upsert({
      where: { slug: uni.slug },
      update: {},
      create: uni,
    });
    console.log(`Created: ${uni.name}`);
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
