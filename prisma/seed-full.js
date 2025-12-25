const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

// Utility functions
function slugify(str) {
  return str.toLowerCase().replace(/[^\w-]+/g, "-");
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

const dummyData = {
  users: [
    {
      name: "Admin User",
      email: "admin@faculty.edu",
      role: "admin",
      password: hashPassword("admin123"),
    },
    {
      name: "Dr. Ahmed Hassan",
      email: "dr.ahmed@faculty.edu",
      role: "teacher",
      password: hashPassword("teacher123"),
    },
    {
      name: "Dr. Fatima Benani",
      email: "dr.fatima@faculty.edu",
      role: "teacher",
      password: hashPassword("teacher123"),
    },
    {
      name: "Prof. Mohamed Khalil",
      email: "prof.mohamed@faculty.edu",
      role: "teacher",
      password: hashPassword("teacher123"),
    },
    {
      name: "Student One",
      email: "student1@faculty.edu",
      role: "student",
      password: hashPassword("student123"),
    },
    {
      name: "Student Two",
      email: "student2@faculty.edu",
      role: "student",
      password: hashPassword("student123"),
    },
    {
      name: "Student Three",
      email: "student3@faculty.edu",
      role: "student",
      password: hashPassword("student123"),
    },
  ],

  tags: [
    "Beginner",
    "Intermediate",
    "Advanced",
    "Practical",
    "Theory",
    "Exam Prep",
    "Problem Solving",
    "Lab Work",
    "Research",
    "Case Study",
  ],

  lessons: [
    {
      title: "Introduction to Linear Algebra",
      description: "Master the fundamentals of vectors, matrices, and linear transformations",
      content: "Linear algebra is the study of linear equations and linear functions...",
      difficulty: "beginner",
      duration: 45,
      subjectSlug: "mathematics",
      tags: ["Beginner", "Theory"],
    },
    {
      title: "Calculus I: Limits and Derivatives",
      description: "Understand limits, continuity, and the derivative concept",
      content: "Calculus is one of the most important branches of mathematics...",
      difficulty: "intermediate",
      duration: 60,
      subjectSlug: "mathematics",
      tags: ["Intermediate", "Theory", "Problem Solving"],
    },
    {
      title: "Modern Physics: Quantum Mechanics",
      description: "Explore the quantum world and its principles",
      content: "Quantum mechanics describes the physical properties of nature at the scale of atoms...",
      difficulty: "advanced",
      duration: 90,
      subjectSlug: "physics",
      tags: ["Advanced", "Theory", "Research"],
    },
    {
      title: "Organic Chemistry Basics",
      description: "Learn about organic compounds and reactions",
      content: "Organic chemistry is the chemistry of carbon and its compounds...",
      difficulty: "intermediate",
      duration: 75,
      subjectSlug: "chemistry",
      tags: ["Intermediate", "Lab Work", "Practical"],
    },
    {
      title: "Cell Biology and Genetics",
      description: "Understanding cells and heredity",
      content: "Cell biology is the study of cells, which are the basic units of life...",
      difficulty: "beginner",
      duration: 60,
      subjectSlug: "biology",
      tags: ["Beginner", "Theory", "Lab Work"],
    },
    {
      title: "Arabic Grammar: The Fundamentals",
      description: "Master Arabic language structure and grammar rules",
      content: "Arabic grammar is the foundation of understanding classical and modern Arabic...",
      difficulty: "beginner",
      duration: 50,
      subjectSlug: "arabic-language",
      tags: ["Beginner", "Theory"],
    },
    {
      title: "World History: The Renaissance",
      description: "Explore the cultural rebirth of Europe",
      content: "The Renaissance was a period of great cultural and intellectual change...",
      difficulty: "intermediate",
      duration: 60,
      subjectSlug: "history",
      tags: ["Intermediate", "Case Study"],
    },
    {
      title: "Philosophy of Ethics",
      description: "Understand moral principles and ethical theories",
      content: "Ethics is the study of what is right and wrong in conduct...",
      difficulty: "advanced",
      duration: 90,
      subjectSlug: "philosophy",
      tags: ["Advanced", "Theory"],
    },
    {
      title: "Human Anatomy: The Skeletal System",
      description: "Learn about bones and the human skeleton",
      content: "The skeletal system provides support, protection, and movement for the body...",
      difficulty: "intermediate",
      duration: 60,
      subjectSlug: "anatomy",
      tags: ["Intermediate", "Lab Work", "Practical"],
    },
    {
      title: "Introduction to Programming with Python",
      description: "Learn Python programming from scratch",
      content: "Python is a versatile and beginner-friendly programming language...",
      difficulty: "beginner",
      duration: 90,
      subjectSlug: "computer-science",
      tags: ["Beginner", "Practical", "Problem Solving"],
    },
  ],

  modules: [
    {
      title: "Vectors and Vector Operations",
      content: "Understanding what vectors are and how to work with them",
      order: 1,
    },
    {
      title: "Matrices and Determinants",
      content: "Matrix theory and calculations",
      order: 2,
    },
    {
      title: "Eigenvalues and Eigenvectors",
      content: "Advanced linear algebra concepts",
      order: 3,
    },
  ],

  resources: [
    { title: "Linear Algebra Notes PDF", url: "https://example.com/linear-algebra.pdf", type: "pdf" },
    {
      title: "MIT Linear Algebra Course",
      url: "https://example.com/mit-linear-algebra",
      type: "video",
    },
    {
      title: "Practice Problems",
      url: "https://example.com/linear-algebra-problems",
      type: "document",
    },
  ],
};

async function seed() {
  console.log("🌱 Starting comprehensive database seed...\n");

  try {
    // Clear data in order to avoid foreign key constraints
    console.log("Clearing existing data...");
    await prisma.bookmark.deleteMany({});
    await prisma.upload.deleteMany({});
    await prisma.resource.deleteMany({});
    await prisma.module.deleteMany({});
    await prisma.lesson.deleteMany({});
    await prisma.tag.deleteMany({});
    await prisma.account.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.user.deleteMany({});
    console.log("✓ Cleared all data\n");

    // 1. CREATE USERS
    console.log("👥 Creating users...");
    const users = [];
    for (const userData of dummyData.users) {
      const user = await prisma.user.create({
        data: userData,
      });
      users.push(user);
      console.log(`   ✓ Created ${user.role}: ${user.email}`);
    }

    // 2. CREATE TAGS
    console.log("\n🏷️  Creating tags...");
    const tags = [];
    for (const tagName of dummyData.tags) {
      const tag = await prisma.tag.create({
        data: {
          name: tagName,
        },
      });
      tags.push(tag);
      console.log(`   ✓ Created tag: ${tag.name}`);
    }

    // 3. GET SUBJECTS
    console.log("\n📚 Fetching subjects...");
    const subjects = await prisma.subject.findMany();
    console.log(`   ✓ Found ${subjects.length} subjects`);

    // 4. CREATE LESSONS
    console.log("\n📖 Creating lessons...");
    const lessons = [];
    for (const lessonData of dummyData.lessons) {
      const subject = subjects.find((s) => s.slug === lessonData.subjectSlug);
      if (!subject) continue;

      const lesson = await prisma.lesson.create({
        data: {
          title: lessonData.title,
          slug: slugify(lessonData.title),
          description: lessonData.description,
          content: lessonData.content,
          difficulty: lessonData.difficulty,
          duration: lessonData.duration,
          published: true,
          views: Math.floor(Math.random() * 500),
          likes: Math.floor(Math.random() * 100),
          subject: { connect: { id: subject.id } },
          tags: {
            connect: tags
              .filter((t) => lessonData.tags.includes(t.name))
              .map((t) => ({ id: t.id })),
          },
        },
      });
      lessons.push(lesson);
      console.log(`   ✓ Created lesson: ${lesson.title}`);
    }

    // 5. CREATE MODULES
    console.log("\n🎯 Creating modules...");
    for (let i = 0; i < Math.min(lessons.length, 3); i++) {
      for (let j = 0; j < dummyData.modules.length; j++) {
        const moduleData = dummyData.modules[j];
        await prisma.module.create({
          data: {
            title: moduleData.title,
            content: moduleData.content,
            order: moduleData.order,
            lesson: { connect: { id: lessons[i].id } },
          },
        });
        console.log(`   ✓ Created module: ${moduleData.title}`);
      }
    }

    // 6. CREATE RESOURCES
    console.log("\n📄 Creating resources...");
    for (let i = 0; i < Math.min(lessons.length, 5); i++) {
      for (let j = 0; j < Math.min(dummyData.resources.length, 2); j++) {
        const resourceData = dummyData.resources[j];
        await prisma.resource.create({
          data: {
            title: resourceData.title,
            url: resourceData.url,
            type: resourceData.type,
            lesson: { connect: { id: lessons[i].id } },
          },
        });
        console.log(`   ✓ Created resource: ${resourceData.title}`);
      }
    }

    // 7. CREATE BOOKMARKS
    console.log("\n❤️  Creating bookmarks...");
    const students = users.filter((u) => u.role === "student");
    for (let i = 0; i < Math.min(students.length, 3); i++) {
      const randomLessons = lessons
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.floor(Math.random() * 4) + 2);
      for (const lesson of randomLessons) {
        try {
          await prisma.bookmark.create({
            data: {
              user: { connect: { id: students[i].id } },
              lesson: { connect: { id: lesson.id } },
            },
          });
          console.log(`   ✓ Bookmarked: ${students[i].email} → ${lesson.title}`);
        } catch (e) {
          // Duplicate bookmarks are ok
        }
      }
    }

    // 8. CREATE UPLOADS
    console.log("\n📤 Creating uploads...");
    const teachers = users.filter((u) => u.role === "teacher");
    for (let i = 0; i < Math.min(lessons.length, 4); i++) {
      for (let j = 0; j < Math.min(teachers.length, 2); j++) {
        const fileName = `lesson-material-${i + 1}.pdf`;
        await prisma.upload.create({
          data: {
            title: `Study Material for ${lessons[i].title}`,
            description: `Uploaded by ${teachers[j].name}`,
            fileName: fileName,
            fileUrl: `https://example.com/uploads/${fileName}`,
            mimeType: "application/pdf",
            size: Math.floor(Math.random() * 5000000) + 100000,
            status: "published",
            lesson: { connect: { id: lessons[i].id } },
            user: { connect: { id: teachers[j].id } },
          },
        });
        console.log(`   ✓ Created upload for: ${lessons[i].title}`);
      }
    }

    // SUMMARY
    console.log("\n" + "=".repeat(60));
    console.log("✅ Database seeding completed successfully!");
    console.log("=".repeat(60));
    console.log(`👥 Users created: ${users.length}`);
    console.log(`📚 Subjects: ${subjects.length}`);
    console.log(`📖 Lessons created: ${lessons.length}`);
    console.log(`🏷️  Tags created: ${tags.length}`);
    console.log(`🎯 Modules created: ${dummyData.modules.length * Math.min(lessons.length, 3)}`);
    console.log(`📄 Resources created: ${Math.min(lessons.length, 5) * 2}`);
    console.log(`❤️  Bookmarks created: ${students.length * 3}`);
    console.log(`📤 Uploads created: ${Math.min(lessons.length, 4) * 2}`);
    console.log("=".repeat(60));
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
