import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, TrendingUp } from 'lucide-react';
import prisma from '@/lib/db';

type Props = {
  params: { slug: string };
};

export default async function SubjectPage({ params }: Props) {
  const { slug } = params;

  const subject = await prisma.subject.findFirst({
    where: { slug, semesterId: null }, // Find subject by slug without semester
    include: {
      lessons: {
        where: { published: true },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!subject) {
    notFound();
  }

  const lessons = subject.lessons;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card className="border-0 shadow-sm sticky top-4 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
              {subject.icon && <div className="text-3xl mb-3">{subject.icon}</div>}
              <CardTitle>{subject.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Lessons</p>
                <p className="text-3xl font-bold">{lessons.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-2">Difficulty Levels</p>
                <div className="space-y-1">
                  {['beginner', 'intermediate', 'advanced'].map((level) => (
                    <div key={level} className="flex items-center justify-between text-sm">
                      <span className="capitalize">{level}</span>
                      <span className="font-semibold">
                        {lessons.filter((l) => l.difficulty === level).length}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold mb-4 text-foreground">
              {subject.name}
            </h1>

            <h2 className="text-2xl font-bold">
              All Lessons ({lessons.length})
            </h2>
          {lessons.length === 0 ? (
            <Card className="border border-border/60 bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  No lessons available yet. Check back soon!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className="group"
                >
                  <Card className="h-full border border-border/60 bg-card/80 backdrop-blur-sm rounded-2xl transition-all hover:border-primary/70 hover:shadow-xl hover:-translate-y-1">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                        <Badge variant="secondary" className="shrink-0">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <BookOpen className="h-4 w-4" />
                          {lesson.views} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
