import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Moroccan Faculties and their subjects
const moroccanFaculties = [
  {
    name: "Faculty of Science - Fez",
    slug: "faculty-science-fez",
    subjects: [
      {
        name: "Mathematics",
        slug: "mathematics",
        color: "#3B82F6",
        icon: "📐",
      },
      {
        name: "Physics",
        slug: "physics",
        color: "#8B5CF6",
        icon: "⚛️",
      },
      {
        name: "Chemistry",
        slug: "chemistry",
        color: "#EC4899",
        icon: "🧪",
      },
      {
        name: "Biology",
        slug: "biology",
        color: "#10B981",
        icon: "🧬",
      },
    ],
  },
  {
    name: "Faculty of Letters and Humanities - Rabat",
    slug: "faculty-letters-rabat",
    subjects: [
      {
        name: "Arabic Language",
        slug: "arabic-language",
        color: "#F59E0B",
        icon: "🔤",
      },
      {
        name: "History",
        slug: "history",
        color: "#6366F1",
        icon: "🏛️",
      },
      {
        name: "Philosophy",
        slug: "philosophy",
        color: "#8B7355",
        icon: "🤔",
      },
      {
        name: "Islamic Studies",
        slug: "islamic-studies",
        color: "#06B6D4",
        icon: "📖",
      },
    ],
  },
  {
    name: "Faculty of Medicine - Casablanca",
    slug: "faculty-medicine-casablanca",
    subjects: [
      {
        name: "Anatomy",
        slug: "anatomy",
        color: "#EF4444",
        icon: "🦴",
      },
      {
        name: "Physiology",
        slug: "physiology",
        color: "#F87171",
        icon: "❤️",
      },
      {
        name: "Pharmacology",
        slug: "pharmacology",
        color: "#DC2626",
        icon: "💊",
      },
      {
        name: "Pathology",
        slug: "pathology",
        color: "#991B1B",
        icon: "🔬",
      },
    ],
  },
  {
    name: "Faculty of Engineering - Marrakech",
    slug: "faculty-engineering-marrakech",
    subjects: [
      {
        name: "Computer Science",
        slug: "computer-science",
        color: "#0EA5E9",
        icon: "💻",
      },
      {
        name: "Software Engineering",
        slug: "software-engineering",
        color: "#06B6D4",
        icon: "⚙️",
      },
      {
        name: "Civil Engineering",
        slug: "civil-engineering",
        color: "#64748B",
        icon: "🏗️",
      },
      {
        name: "Electrical Engineering",
        slug: "electrical-engineering",
        color: "#F59E0B",
        icon: "⚡",
      },
    ],
  },
  {
    name: "Faculty of Economics and Law - Tangier",
    slug: "faculty-economics-law-tangier",
    subjects: [
      {
        name: "Economics",
        slug: "economics",
        color: "#14B8A6",
        icon: "💰",
      },
      {
        name: "Business Administration",
        slug: "business-administration",
        color: "#059669",
        icon: "📊",
      },
      {
        name: "Law",
        slug: "law",
        color: "#1E40AF",
        icon: "⚖️",
      },
      {
        name: "Political Science",
        slug: "political-science",
        color: "#2563EB",
        icon: "🗳️",
      },
    ],
  },
  {
    name: "Faculty of Education - Meknes",
    slug: "faculty-education-meknes",
    subjects: [
      {
        name: "Educational Psychology",
        slug: "educational-psychology",
        color: "#A855F7",
        icon: "🧠",
      },
      {
        name: "Pedagogy",
        slug: "pedagogy",
        color: "#D946EF",
        icon: "👨‍🏫",
      },
      {
        name: "Curriculum Design",
        slug: "curriculum-design",
        color: "#EC4899",
        icon: "📚",
      },
      {
        name: "Teacher Training",
        slug: "teacher-training",
        color: "#F43F5E",
        icon: "🎓",
      },
    ],
  },
];

async function seed() {
  console.log("🌱 Starting database seed with Moroccan faculties...\n");

  try {
    // Delete existing subjects to avoid conflicts
    await prisma.subject.deleteMany({});
    console.log("✓ Cleared existing subjects");

    let totalSubjectsCreated = 0;

    // Create subjects for each faculty
    for (const faculty of moroccanFaculties) {
      console.log(`\n📚 Creating subjects for: ${faculty.name}`);

      for (const subject of faculty.subjects) {
        try {
          const createdSubject = await prisma.subject.create({
            data: {
              name: subject.name,
              slug: subject.slug,
              color: subject.color,
              icon: subject.icon,
              semesterId: undefined, // Will be linked to semesters once programs are created
            },
          });
          console.log(`   ✓ Created: ${createdSubject.name}`);
          totalSubjectsCreated++;
        } catch (error: any) {
          if (error.code === "P2002") {
            console.log(`   ⚠ Already exists: ${subject.name}`);
          } else {
            console.error(`   ✗ Error creating ${subject.name}:`, error.message);
          }
        }
      }
    }

    // Seed Moroccan Universities
    console.log("\n" + "=".repeat(60));
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
      } catch (error: any) {
        console.error(`   ✗ Error with ${uni.name}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Database seeding completed successfully!`);
    console.log(`📊 Total subjects created: ${totalSubjectsCreated}`);
    console.log(`🏫 Total faculties processed: ${moroccanFaculties.length}`);
    console.log(`🏛️ Total universities created: ${totalUniversitiesCreated}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
