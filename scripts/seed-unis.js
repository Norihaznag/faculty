const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const moroccanUniversities = [
  { name: 'Ibn Zohr University', slug: 'ibn-zohr', city: 'Agadir' },
  { name: 'Qadi Ayyad University', slug: 'qadi-ayyad', city: 'Marrakech' },
  { name: 'University of Fez', slug: 'university-of-fez', city: 'Fez' },
  { name: 'Hassan II University', slug: 'hassan-ii', city: 'Casablanca' },
  { name: 'Al Akhawayn University', slug: 'al-akhawayn', city: 'Ifrane' },
  { name: 'University of Rabat', slug: 'university-of-rabat', city: 'Rabat' },
  { name: 'Sultan Moulay Slimane University', slug: 'sultan-moulay-slimane', city: 'Beni Mellal' },
  { name: 'University of Tangier', slug: 'university-of-tangier', city: 'Tangier' },
];

async function seed() {
  console.log('🏛️  Seeding Moroccan Universities...\n');

  for (const uni of moroccanUniversities) {
    try {
      const created = await prisma.university.upsert({
        where: { slug: uni.slug },
        update: {},
        create: {
          name: uni.name,
          slug: uni.slug,
          city: uni.city,
        },
      });
      console.log(`✓ ${created.name} (${created.city})`);
    } catch (error) {
      console.error(`✗ Error with ${uni.name}:`, error.message);
    }
  }

  console.log('\n✅ Universities seeded successfully!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
