import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Compass, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

export default async function Home() {
  const [lessons, subjects] = await Promise.all([
    prisma.lesson.findMany({
      where: { published: true },
      take: 12,
      orderBy: { views: 'desc' },
      include: { subject: true, university: true },
    }),
    prisma.subject.findMany({
      take: 20,
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Simple Hero */}
        <section className="space-y-4 pt-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Learn from Morocco's Universities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Quality lessons from Ibn Zohr, Qadi Ayyad, and other top Moroccan universities.
          </p>
          <Link href="/resources">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
              <Compass className="h-4 w-4 mr-2" />
              Browse Lessons
            </Button>
          </Link>
        </section>

        {/* Stats - Simple */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">{subjects.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Subjects</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">{lessons.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">8</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Universities</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">2</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Languages</div>
            </div>
          </div>
        </section>

        {/* Popular Lessons */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Popular Lessons
            </h2>
            <Link href="/resources">
              <Button variant="ghost" className="gap-2">
                See All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lessons.slice(0, 6).map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                  <div className="h-1 bg-blue-600" />
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold line-clamp-2">
                      {lesson.title}
                    </CardTitle>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {lesson.subject?.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {lesson.university?.name}
                    </p>
                  </CardHeader>

                  <CardContent className="text-xs space-y-2">
                    {lesson.description && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                    <div className="pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span className="text-gray-500">{lesson.views} views</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Subjects Grid */}
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Subjects
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow p-3 text-center cursor-pointer">
                  <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                    {subject.name}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA - Simple */}
        <section className="bg-blue-600 text-white rounded p-8 text-center space-y-4">
          <h2 className="text-3xl font-bold">Want to Share Your Knowledge?</h2>
          <p className="text-blue-100">Upload your lessons and help other students</p>
          <Link href="/upload">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              <Upload className="h-4 w-4 mr-2" />
              Upload Lesson
            </Button>
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
