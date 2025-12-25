const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const unis = await prisma.university.findMany();
  console.log('Universities:', unis);
  
  const subjects = await prisma.subject.findMany({ take: 5 });
  console.log('Sample Subjects:', subjects);
  
  await prisma.$disconnect();
}

main().catch(console.error);
