import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import prisma from '@/lib/db';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

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

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Header */}
        <div className="space-y-4 mb-8">
          <Link href={`/subjects/${lesson.subject.slug}`}>
            <Button variant="ghost" size="sm" className="mb-2">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to {lesson.subject.name}
            </Button>
          </Link>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-lg text-muted-foreground">{lesson.description}</p>
            )}
          </div>

          {/* Metadata */}
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Badge>{lesson.difficulty}</Badge>
            <Badge variant="outline">{lesson.views} views</Badge>
            {lesson.duration && <Badge variant="outline">{lesson.duration} mins</Badge>}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Content */}
          <div className="lg:col-span-2 space-y-6">
            {lesson.content && (
              <Card>
                <CardContent className="pt-6">
                  <div className="prose prose-sm max-w-none">
                    {lesson.content}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Modules */}
            {lesson.modules.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Course Modules</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {lesson.modules.map((module, idx) => (
                    <div key={module.id} className="border-l-4 border-primary pl-4 py-2">
                      <h3 className="font-semibold">{module.title}</h3>
                      {module.content && (
                        <p className="text-sm text-muted-foreground mt-1">{module.content}</p>
                      )}
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Resources */}
            {lesson.resources.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Resources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {lesson.resources.map((resource) => (
                    <a
                      key={resource.id}
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 border rounded hover:bg-accent transition-colors"
                    >
                      <h4 className="font-semibold text-sm">{resource.title}</h4>
                      <p className="text-xs text-muted-foreground">{resource.type}</p>
                    </a>
                  ))}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Subject Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">{lesson.subject.name}</CardTitle>
              </CardHeader>
            </Card>

            {/* Tags */}
            {lesson.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {lesson.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center py-8 border-t">
          {previousLesson ? (
            <Link href={`/lessons/${previousLesson.slug}`}>
              <Button variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
            </Link>
          ) : (
            <div />
          )}

          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.slug}`}>
              <Button variant="outline">
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </MainLayout>
  );
}