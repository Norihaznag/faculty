import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import { LessonViewW3Style } from '@/components/lessons/lesson-view-w3style';

type Props = {
  params: { slug: string };
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await prisma.lesson.findUnique({
    where: { slug: params.slug },
    include: { subject: true },
  });

  if (!lesson) {
    return {
      title: 'Lesson Not Found',
    };
  }

  return {
    title: `${lesson.title} | Faculty Hub`,
    description: lesson.description?.substring(0, 160) || `Learn about ${lesson.title} in ${lesson.subject?.name}`,
    openGraph: {
      title: lesson.title,
      description: lesson.description?.substring(0, 160) || `Learn about ${lesson.title}`,
      type: 'article',
    },
  };
}

export default async function LessonPage({ params }: Props) {
  const lesson = await prisma.lesson.findUnique({
    where: { slug: params.slug },
    include: {
      subject: true,
      tags: true,
      modules: { orderBy: { order: 'asc' } },
      resources: true,
    },
  });

  if (!lesson) {
    notFound();
  }

  // Increment view count
  await prisma.lesson.update({
    where: { id: lesson.id },
    data: { views: { increment: 1 } },
  });

  // Fetch adjacent lessons for navigation
  let previousLesson = null;
  let nextLesson = null;

  const allLessons = await prisma.lesson.findMany({
    where: {
      subjectId: lesson.subjectId,
      published: true,
    },
    orderBy: { createdAt: 'asc' },
    select: {
      id: true,
      slug: true,
      title: true,
      subjectId: true,
    },
  });

  if (allLessons.length > 0) {
    const currentIndex = allLessons.findIndex((l) => l.id === lesson.id);
    if (currentIndex > 0) {
      previousLesson = allLessons[currentIndex - 1];
    }
    if (currentIndex < allLessons.length - 1) {
      nextLesson = allLessons[currentIndex + 1];
    }
  }

  return <LessonViewW3Style lesson={lesson} previousLesson={previousLesson} nextLesson={nextLesson} />;
}
