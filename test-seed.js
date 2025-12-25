const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  try {
    console.log("Testing database connection...");
    const result = await prisma.$queryRaw`SELECT NOW()`;
    console.log("✅ Database connection successful:", result);

    // Check existing subjects
    const count = await prisma.subject.count();
    console.log(`Current subjects in database: ${count}`);

    if (count === 0) {
      console.log("\n🌱 Database is empty, seeding now...");

      const moroccanFaculties = [
        {
          name: "Faculty of Science - Fez",
          subjects: [
            { name: "Mathematics", slug: "mathematics", color: "#3B82F6", icon: "📐" },
            { name: "Physics", slug: "physics", color: "#8B5CF6", icon: "⚛️" },
            { name: "Chemistry", slug: "chemistry", color: "#EC4899", icon: "🧪" },
            { name: "Biology", slug: "biology", color: "#10B981", icon: "🧬" },
          ],
        },
        {
          name: "Faculty of Letters and Humanities - Rabat",
          subjects: [
            { name: "Arabic Language", slug: "arabic-language", color: "#F59E0B", icon: "🔤" },
            { name: "History", slug: "history", color: "#6366F1", icon: "🏛️" },
            { name: "Philosophy", slug: "philosophy", color: "#8B7355", icon: "🤔" },
            { name: "Islamic Studies", slug: "islamic-studies", color: "#06B6D4", icon: "📖" },
          ],
        },
        {
          name: "Faculty of Medicine - Casablanca",
          subjects: [
            { name: "Anatomy", slug: "anatomy", color: "#EF4444", icon: "🦴" },
            { name: "Physiology", slug: "physiology", color: "#F87171", icon: "❤️" },
            { name: "Pharmacology", slug: "pharmacology", color: "#DC2626", icon: "💊" },
            { name: "Pathology", slug: "pathology", color: "#991B1B", icon: "🔬" },
          ],
        },
        {
          name: "Faculty of Engineering - Marrakech",
          subjects: [
            { name: "Computer Science", slug: "computer-science", color: "#0EA5E9", icon: "💻" },
            { name: "Software Engineering", slug: "software-engineering", color: "#06B6D4", icon: "⚙️" },
            { name: "Civil Engineering", slug: "civil-engineering", color: "#64748B", icon: "🏗️" },
            { name: "Electrical Engineering", slug: "electrical-engineering", color: "#F59E0B", icon: "⚡" },
          ],
        },
        {
          name: "Faculty of Economics and Law - Tangier",
          subjects: [
            { name: "Economics", slug: "economics", color: "#14B8A6", icon: "💰" },
            { name: "Business Administration", slug: "business-administration", color: "#059669", icon: "📊" },
            { name: "Law", slug: "law", color: "#1E40AF", icon: "⚖️" },
            { name: "Political Science", slug: "political-science", color: "#2563EB", icon: "🗳️" },
          ],
        },
        {
          name: "Faculty of Education - Meknes",
          subjects: [
            { name: "Educational Psychology", slug: "educational-psychology", color: "#A855F7", icon: "🧠" },
            { name: "Pedagogy", slug: "pedagogy", color: "#D946EF", icon: "👨‍🏫" },
            { name: "Curriculum Design", slug: "curriculum-design", color: "#EC4899", icon: "📚" },
            { name: "Teacher Training", slug: "teacher-training", color: "#F43F5E", icon: "🎓" },
          ],
        },
      ];

      let total = 0;
      for (const faculty of moroccanFaculties) {
        console.log(`\n📚 ${faculty.name}`);
        for (const subject of faculty.subjects) {
          await prisma.subject.create({
            data: {
              name: subject.name,
              slug: subject.slug,
              color: subject.color,
              icon: subject.icon,
            },
          });
          console.log(`   ✓ ${subject.name}`);
          total++;
        }
      }
      console.log(`\n✅ Seeded ${total} subjects!`);
    } else {
      console.log(`\n✅ Database already contains ${count} subjects`);
    }
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
