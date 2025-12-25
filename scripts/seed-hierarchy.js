const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Simple slug generator
const slugify = (str) => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const FACULTIES_BY_UNIVERSITY = {
  'ibn-zohr': [
    {
      name: 'Faculty of Science',
      programs: [
        { name: 'Mathematics', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Physics', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Chemistry', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Biology', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
    {
      name: 'Faculty of Letters and Humanities',
      programs: [
        { name: 'English Studies', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'French Studies', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Arabic Studies', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
    {
      name: 'Faculty of Law and Economics',
      programs: [
        { name: 'Law', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Economics', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Business Administration', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
  ],
  'qadi-ayyad': [
    {
      name: 'Faculty of Sciences Semlalia',
      programs: [
        { name: 'Biology', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Chemistry', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Physics', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
    {
      name: 'Faculty of Letters and Human Sciences',
      programs: [
        { name: 'English Studies', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Islamic Studies', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
    {
      name: 'Faculty of Law, Economic and Social Sciences',
      programs: [
        { name: 'Law', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
        { name: 'Economics', semesters: ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'] },
      ],
    },
  ],
};

async function seed() {
  console.log('🎓 Seeding faculties, programs, and semesters...\n');

  for (const [uniSlug, faculties] of Object.entries(FACULTIES_BY_UNIVERSITY)) {
    const university = await prisma.university.findUnique({
      where: { slug: uniSlug },
    });

    if (!university) {
      console.log(`⚠️  University ${uniSlug} not found, skipping...`);
      continue;
    }

    console.log(`📚 ${university.name}`);

    for (const facultyData of faculties) {
      const faculty = await prisma.faculty.create({
        data: {
          name: facultyData.name,
          slug: slugify(facultyData.name),
          universityId: university.id,
        },
      });

      console.log(`  📖 ${faculty.name}`);

      for (const programData of facultyData.programs) {
        const program = await prisma.program.create({
          data: {
            name: programData.name,
            slug: slugify(programData.name),
            facultyId: faculty.id,
          },
        });

        console.log(`    🎯 ${program.name}`);

        // Create semesters for this program
        for (let i = 0; i < programData.semesters.length; i++) {
          await prisma.semester.create({
            data: {
              name: programData.semesters[i],
              order: i + 1,
              programId: program.id,
            },
          });
        }
        console.log(`      ✓ ${programData.semesters.length} semesters created`);
      }
    }
    console.log('');
  }

  console.log('✅ Seeding completed!');
  await prisma.$disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
