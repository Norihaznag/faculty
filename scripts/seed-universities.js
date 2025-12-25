const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function seed() {
  console.log("🌱 Creating Moroccan Universities...\n");

  try {
    // Seed Moroccan Universities
    console.log("🏫 Seeding Moroccan Universities...");
    console.log("=".repeat(60));

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

    let totalUniversitiesCreated = 0;
    for (const uni of moroccanUniversities) {
      try {
        const createdUni = await prisma.university.upsert({
          where: { slug: uni.slug },
          update: {},
          create: {
            name: uni.name,
            slug: uni.slug,
            city: uni.city,
          },
        });
        console.log(`   ✓ ${createdUni.name} (${createdUni.city})`);
        totalUniversitiesCreated++;
      } catch (error) {
        console.error(`   ✗ Error with ${uni.name}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Universities seeding completed!`);
    console.log(`🏛️ Total universities created/updated: ${totalUniversitiesCreated}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
