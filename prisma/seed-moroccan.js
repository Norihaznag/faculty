const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

function slugify(str) {
  return str.toLowerCase().replace(/[^\w-]+/g, "-");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const moroccanUniversities = [
  {
    name: "University of Al Akhawayn",
    subjects: [
      { name: "Computer Science", slug: "computer-science", color: "#0EA5E9", icon: "💻" },
      { name: "Business Administration", slug: "business-administration", color: "#14B8A6", icon: "📊" },
      { name: "Engineering", slug: "engineering", color: "#F59E0B", icon: "⚙️" },
      { name: "International Relations", slug: "international-relations", color: "#8B5CF6", icon: "🌍" },
    ],
  },
  {
    name: "University of Cadi Ayyad",
    subjects: [
      { name: "Medicine", slug: "medicine", color: "#EF4444", icon: "⚕️" },
      { name: "Pharmacy", slug: "pharmacy", color: "#DC2626", icon: "💊" },
      { name: "Dentistry", slug: "dentistry", color: "#F87171", icon: "😁" },
      { name: "Biology", slug: "biology", color: "#10B981", icon: "🧬" },
    ],
  },
  {
    name: "University Hassan II",
    subjects: [
      { name: "Industrial Engineering", slug: "industrial-engineering-uih2", color: "#64748B", icon: "🏗️" },
      { name: "Constitutional Law", slug: "constitutional-law", color: "#1E40AF", icon: "⚖️" },
      { name: "Macroeconomics", slug: "macroeconomics", color: "#059669", icon: "💹" },
      { name: "Advanced Technology", slug: "advanced-technology", color: "#3B82F6", icon: "🔬" },
    ],
  },
  {
    name: "Ibn Tofail University",
    subjects: [
      { name: "Mathematics", slug: "mathematics", color: "#3B82F6", icon: "📐" },
      { name: "Physics", slug: "physics", color: "#8B5CF6", icon: "⚛️" },
      { name: "Chemistry", slug: "chemistry", color: "#EC4899", icon: "🧪" },
      { name: "Environmental Science", slug: "environmental-science", color: "#16A34A", icon: "🌱" },
    ],
  },
  {
    name: "University of Fez",
    subjects: [
      { name: "Arabic Language", slug: "arabic-language", color: "#F59E0B", icon: "🔤" },
      { name: "Islamic Studies", slug: "islamic-studies", color: "#06B6D4", icon: "📖" },
      { name: "Philosophy", slug: "philosophy", color: "#8B7355", icon: "🤔" },
      { name: "History", slug: "history", color: "#6366F1", icon: "🏛️" },
    ],
  },
  {
    name: "University of Marrakech",
    subjects: [
      { name: "Education", slug: "education", color: "#EC4899", icon: "📚" },
      { name: "Psychology", slug: "psychology", color: "#A855F7", icon: "🧠" },
      { name: "Social Sciences", slug: "social-sciences", color: "#D946EF", icon: "👥" },
      { name: "Literature", slug: "literature", color: "#F43F5E", icon: "✍️" },
    ],
  },
  {
    name: "University of Tangier",
    subjects: [
      { name: "Tourism Management", slug: "tourism-management", color: "#14B8A6", icon: "✈️" },
      { name: "Marine Science", slug: "marine-science", color: "#0EA5E9", icon: "🐚" },
      { name: "International Trade", slug: "international-trade", color: "#2563EB", icon: "📦" },
      { name: "Port Management", slug: "port-management", color: "#06B6D4", icon: "⚓" },
    ],
  },
];

const lessons = [
  {
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development with HTML, CSS, and JavaScript",
    content: "Web development is the process of creating websites and applications for the internet. In this comprehensive course, you will learn the fundamental technologies that power the web...",
    difficulty: "beginner",
    duration: 120,
    subject: "Computer Science",
    tags: ["Web", "Programming", "JavaScript"],
  },
  {
    title: "Advanced Python for Data Science",
    description: "Master Python programming for data analysis and machine learning",
    content: "Python has become the go-to language for data science professionals. This advanced course covers data manipulation, analysis, visualization, and machine learning techniques using popular libraries like Pandas, NumPy, and Scikit-learn...",
    difficulty: "advanced",
    duration: 180,
    subject: "Computer Science",
    tags: ["Python", "Data Science", "Machine Learning"],
  },
  {
    title: "International Business Law",
    description: "Understand legal frameworks governing international commerce",
    content: "International business law covers the legal aspects of cross-border transactions, trade agreements, and dispute resolution. This course explores the World Trade Organization, international contracts, and more...",
    difficulty: "intermediate",
    duration: 90,
    subject: "Law",
    tags: ["Business", "Law", "International"],
  },
  {
    title: "Modern Marketing Strategies",
    description: "Digital marketing, branding, and customer engagement in 2025",
    content: "Modern marketing has transformed with digital channels, social media, and data-driven strategies. Learn how successful companies build brands, engage customers, and drive business growth in the digital age...",
    difficulty: "intermediate",
    duration: 75,
    subject: "Business Administration",
    tags: ["Marketing", "Digital", "Business"],
  },
  {
    title: "Organic Chemistry Essentials",
    description: "Understand organic compounds and their reactions",
    content: "Organic chemistry is the study of carbon-containing compounds. This course covers bonding, molecular structure, nomenclature, and major reaction types. Perfect for students in pre-medical, pharmaceutical, or chemistry programs...",
    difficulty: "intermediate",
    duration: 100,
    subject: "Chemistry",
    tags: ["Chemistry", "Organic", "Lab"],
  },
  {
    title: "Human Anatomy: The Nervous System",
    description: "Comprehensive study of neural structures and function",
    content: "The nervous system is responsible for receiving and processing information, then coordinating responses. This detailed course covers the brain, spinal cord, peripheral nerves, and neural function at the cellular and systems level...",
    difficulty: "intermediate",
    duration: 120,
    subject: "Medicine",
    tags: ["Medicine", "Anatomy", "Physiology"],
  },
  {
    title: "Islamic Law: Sharia Principles",
    description: "Foundations of Islamic jurisprudence and its application",
    content: "Sharia, or Islamic law, is derived from the Quran, Hadith, Ijma, and Qiyas. This course explores the sources of Islamic law, principles of jurisprudence, and their application in modern contexts...",
    difficulty: "advanced",
    duration: 150,
    subject: "Islamic Studies",
    tags: ["Religion", "Law", "Islam"],
  },
  {
    title: "Medieval Islamic Civilization",
    description: "Golden Age of Islam: culture, science, and achievements",
    content: "The Islamic Golden Age (8th-14th centuries) was a period of unprecedented scientific, mathematical, and cultural advancement. Learn about the major contributions of Muslim scholars to mathematics, astronomy, medicine, and philosophy...",
    difficulty: "intermediate",
    duration: 100,
    subject: "History",
    tags: ["History", "Islam", "Science"],
  },
  {
    title: "Sustainable Tourism Development",
    description: "Balancing tourism growth with environmental and cultural preservation",
    content: "Sustainable tourism aims to minimize negative impacts while maximizing benefits for communities and environments. This course covers responsible tourism practices, community engagement, and conservation strategies...",
    difficulty: "beginner",
    duration: 80,
    subject: "Tourism Management",
    tags: ["Tourism", "Sustainability", "Development"],
  },
  {
    title: "Marine Biodiversity and Conservation",
    description: "Understanding ocean ecosystems and marine conservation efforts",
    content: "The ocean covers 71% of Earth and contains incredible biodiversity. This course explores marine ecosystems, endangered species, marine protected areas, and conservation strategies for ocean health...",
    difficulty: "intermediate",
    duration: 95,
    subject: "Marine Science",
    tags: ["Environment", "Biology", "Ocean"],
  },
];

const tags = [
  "Beginner",
  "Intermediate",
  "Advanced",
  "Practical",
  "Theory",
  "Exam Prep",
  "Lab Work",
  "Research",
  "Project-Based",
  "Case Study",
];

const users = [
  {
    name: "Dr. Mohammed Hassan",
    email: "dr.hassan@university.ma",
    role: "teacher",
  },
  {
    name: "Prof. Fatima Al-Mansouri",
    email: "prof.fatima@university.ma",
    role: "teacher",
  },
  {
    name: "Dr. Ahmed Bennani",
    email: "dr.bennani@university.ma",
    role: "teacher",
  },
  {
    name: "Admin Morocco",
    email: "admin@faculty.edu",
    role: "admin",
  },
  {
    name: "Karim Student",
    email: "karim.student@gmail.com",
    role: "student",
  },
  {
    name: "Layla Student",
    email: "layla.student@gmail.com",
    role: "student",
  },
  {
    name: "Omar Student",
    email: "omar.student@gmail.com",
    role: "student",
  },
];

async function seed() {
  console.log("\n🇲🇦 Seeding with Moroccan Universities Data...\n");

  try {
    // Clear existing data
    console.log("🧹 Clearing existing data...");
    await prisma.bookmark.deleteMany({});
    await prisma.upload.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.subject.deleteMany({});
    console.log("✓ Data cleared\n");

    // Create users
    console.log("👥 Creating users...");
    const createdUsers = [];
    for (const user of users) {
      const created = await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          password: hashPassword("password123"),
        },
      });
      createdUsers.push(created);
      console.log(`   ✓ ${user.role}: ${user.email}`);
    }

    // Create tags
    console.log("\n🏷️  Creating tags...");
    const createdTags = [];
    for (const tagName of tags) {
      const tag = await prisma.tag.create({
        data: { name: tagName },
      });
      createdTags.push(tag);
      console.log(`   ✓ ${tagName}`);
    }

    // Create subjects from Moroccan universities
    console.log("\n🎓 Creating subjects from Moroccan universities...");
    const subjectMap = new Map();
    for (const uni of moroccanUniversities) {
      console.log(`\n   📍 ${uni.name}`);
      for (const subject of uni.subjects) {
        // Check if subject already exists
        let existingSubject = await prisma.subject.findUnique({
          where: { slug: subject.slug },
        });

        if (!existingSubject) {
          existingSubject = await prisma.subject.create({
            data: {
              name: subject.name,
              slug: subject.slug,
              color: subject.color,
              icon: subject.icon,
            },
          });
          console.log(`      ✓ ${subject.name}`);
        }
        subjectMap.set(subject.name, existingSubject);
      }
    }

    // Create lessons
    console.log("\n📖 Creating lessons...");
    const allSubjects = Array.from(subjectMap.values());
    const createdLessons = [];

    for (const lesson of lessons) {
      const subject = subjectMap.get(lesson.subject);
      if (!subject) {
        console.log(`   ⚠️  Skipped ${lesson.title} - subject not found`);
        continue;
      }

      const lessonTags = createdTags.filter((t) =>
        lesson.tags.some((lt) => lt.toLowerCase() === t.name.toLowerCase())
      );

      const created = await prisma.lesson.create({
        data: {
          title: lesson.title,
          slug: slugify(lesson.title),
          description: lesson.description,
          content: lesson.content,
          difficulty: lesson.difficulty,
          duration: lesson.duration,
          published: true,
          views: Math.floor(Math.random() * 500),
          likes: Math.floor(Math.random() * 100),
          subject: { connect: { id: subject.id } },
          tags: {
            connect: lessonTags.map((t) => ({ id: t.id })),
          },
        },
      });
      createdLessons.push(created);
      console.log(`   ✓ ${lesson.title}`);
    }

    // Create modules
    console.log("\n🎯 Creating course modules...");
    const modules = [
      { title: "Getting Started", content: "Introduction and setup", order: 1 },
      { title: "Core Concepts", content: "Fundamental principles and theory", order: 2 },
      { title: "Advanced Topics", content: "Deeper exploration and applications", order: 3 },
      { title: "Practice & Projects", content: "Hands-on exercises and projects", order: 4 },
    ];

    let moduleCount = 0;
    for (let i = 0; i < Math.min(createdLessons.length, 5); i++) {
      for (const mod of modules) {
        await prisma.module.create({
          data: {
            title: mod.title,
            content: mod.content,
            order: mod.order,
            lesson: { connect: { id: createdLessons[i].id } },
          },
        });
        moduleCount++;
      }
    }
    console.log(`   ✓ Created ${moduleCount} modules`);

    // Create resources
    console.log("\n📚 Creating resources...");
    const resources = [
      { title: "Course Notes PDF", url: "https://example.com/notes.pdf", type: "pdf" },
      { title: "Video Lectures", url: "https://example.com/lectures", type: "video" },
      { title: "Practice Exercises", url: "https://example.com/exercises", type: "document" },
      { title: "Reference Materials", url: "https://example.com/references", type: "link" },
    ];

    let resourceCount = 0;
    for (let i = 0; i < Math.min(createdLessons.length, 6); i++) {
      for (let j = 0; j < 2; j++) {
        const res = resources[j % resources.length];
        await prisma.resource.create({
          data: {
            title: `${res.title} - ${createdLessons[i].title}`,
            url: res.url,
            type: res.type,
            lesson: { connect: { id: createdLessons[i].id } },
          },
        });
        resourceCount++;
      }
    }
    console.log(`   ✓ Created ${resourceCount} resources`);

    // Create bookmarks
    console.log("\n❤️  Creating student bookmarks...");
    const students = createdUsers.filter((u) => u.role === "student");
    let bookmarkCount = 0;

    for (const student of students) {
      const randomLessons = createdLessons
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 3) + 2);

      for (const lesson of randomLessons) {
        try {
          await prisma.bookmark.create({
            data: {
              user: { connect: { id: student.id } },
              lesson: { connect: { id: lesson.id } },
            },
          });
          bookmarkCount++;
        } catch {
          // Duplicate bookmark
        }
      }
    }
    console.log(`   ✓ Created ${bookmarkCount} bookmarks`);

    // Create uploads
    console.log("\n📤 Creating teacher uploads...");
    const teachers = createdUsers.filter((u) => u.role === "teacher");
    let uploadCount = 0;

    for (let i = 0; i < Math.min(createdLessons.length, 4); i++) {
      for (const teacher of teachers.slice(0, 2)) {
        await prisma.upload.create({
          data: {
            title: `Study Material - ${createdLessons[i].title}`,
            description: `Uploaded by ${teacher.name}`,
            fileName: `material-${i}.pdf`,
            fileUrl: `https://example.com/materials/material-${i}.pdf`,
            mimeType: "application/pdf",
            size: Math.floor(Math.random() * 5000000) + 100000,
            status: "published",
            lesson: { connect: { id: createdLessons[i].id } },
            user: { connect: { id: teacher.id } },
          },
        });
        uploadCount++;
      }
    }
    console.log(`   ✓ Created ${uploadCount} uploads`);

    // Summary
    console.log("\n" + "=".repeat(70));
    console.log("✅ SEEDING COMPLETED SUCCESSFULLY!");
    console.log("=".repeat(70));
    console.log(`🇲🇦 Moroccan University Data Statistics:`);
    console.log(`   👥 Users: ${createdUsers.length} (${createdUsers.filter((u) => u.role === "teacher").length} teachers, ${createdUsers.filter((u) => u.role === "student").length} students)`);
    console.log(`   🎓 Universities: ${moroccanUniversities.length}`);
    console.log(`   📚 Subjects: ${subjectMap.size}`);
    console.log(`   📖 Lessons: ${createdLessons.length}`);
    console.log(`   🏷️  Tags: ${createdTags.length}`);
    console.log(`   🎯 Modules: ${moduleCount}`);
    console.log(`   📄 Resources: ${resourceCount}`);
    console.log(`   ❤️  Bookmarks: ${bookmarkCount}`);
    console.log(`   📤 Uploads: ${uploadCount}`);
    console.log("=".repeat(70) + "\n");
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
