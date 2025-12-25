const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Count all entities
  const uniCount = await prisma.university.count();
  const facCount = await prisma.faculty.count();
  const progCount = await prisma.program.count();
  const semCount = await prisma.semester.count();
  const subjCount = await prisma.subject.count();
  const lesCount = await prisma.lesson.count();

  console.log('\n📊 DATABASE COUNTS:');
  console.log('─'.repeat(40));
  console.log(`🏛️  Universities: ${uniCount}`);
  console.log(`📖 Faculties: ${facCount}`);
  console.log(`📚 Programs: ${progCount}`);
  console.log(`📄 Semesters: ${semCount}`);
  console.log(`🎓 Subjects: ${subjCount}`);
  console.log(`📝 Lessons: ${lesCount}`);
  console.log('─'.repeat(40) + '\n');

  // Show one university with its hierarchy
  const sampleUni = await prisma.university.findFirst({
    include: {
      faculties: {
        take: 1,
        include: {
          programs: {
            take: 1,
            include: {
              semesters: {
                take: 1,
              },
            },
          },
        },
      },
    },
  });

  if (sampleUni) {
    console.log('📍 SAMPLE HIERARCHY (Ibn Zohr University):');
    console.log(`├─ ${sampleUni.name}`);
    if (sampleUni.faculties[0]) {
      console.log(`│  ├─ ${sampleUni.faculties[0].name}`);
      if (sampleUni.faculties[0].programs[0]) {
        console.log(`│  │  ├─ ${sampleUni.faculties[0].programs[0].name}`);
        if (sampleUni.faculties[0].programs[0].semesters[0]) {
          console.log(`│  │  │  └─ ${sampleUni.faculties[0].programs[0].semesters[0].name}`);
        }
      }
    }
    console.log();
  }
  
  await prisma.$disconnect();
}

main().catch(console.error);
