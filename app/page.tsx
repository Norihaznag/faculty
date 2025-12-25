import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Compass, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

export default async function Home() {
  const [lessons, subjects] = await Promise.all([
    prisma.lesson.findMany({
      where: { published: true },
      take: 8,
      orderBy: { views: 'desc' },
      include: { subject: true },
    }),
    prisma.subject.findMany({
      take: 12,
      orderBy: { name: 'asc' },
    }),
  ]);

  return (
    <MainLayout>
      <div className="space-y-16">
        {/* Hero Section - iTunes Style */}
        <section className="pt-8 sm:pt-12">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400 text-sm font-medium mb-4">
                <Sparkles className="h-4 w-4" />
                Morocco's Educational Platform
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 dark:text-white">
                Learn from<br />the Best
              </h1>
            </div>
            
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Quality lessons from Morocco's top universities. Learn at your pace.
            </p>

            <div className="flex items-center justify-center gap-4">
              <Link href="/resources">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-lg">
                  <Compass className="h-5 w-5 mr-2" />
                  Browse All
                </Button>
              </Link>
              {/* <Button variant="outline" size="lg" className="h-12 px-8 rounded-lg">
                Learn More
              </Button> */}
            </div>
          </div>
        </section>

        {/* Quick Stats Row */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="text-3xl font-bold text-blue-600">{subjects.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Subjects</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="text-3xl font-bold text-blue-600">{lessons.length}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Lessons</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="text-3xl font-bold text-blue-600">7</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Universities</div>
          </div>
          <div className="text-center p-6 rounded-lg bg-gray-50 dark:bg-slate-900/50">
            <div className="text-3xl font-bold text-blue-600">2</div>
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">Languages</div>
          </div>
        </section>

        {/* Featured Lessons */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Popular Lessons
            </h2>
            <Link href="/resources">
              <Button variant="ghost" className="gap-2">
                See All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {lessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-2px] overflow-hidden group cursor-pointer">
                  {/* Color bar at top */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                  
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-semibold line-clamp-2 group-hover:text-blue-600 transition-colors">
                      {lesson.title}
                    </CardTitle>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {lesson.subject?.name}
                    </p>
                  </CardHeader>

                  <CardContent className="text-xs space-y-2">
                    {lesson.description && (
                      <p className="text-gray-600 dark:text-gray-400 line-clamp-2">
                        {lesson.description}
                      </p>
                    )}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                      <span className="text-gray-500 dark:text-gray-500">
                        👁 {lesson.views}
                      </span>
                      <span className="px-2 py-1 rounded bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400 text-xs capitalize font-medium">
                        {lesson.difficulty}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Browse by Subject */}
        <section className="space-y-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            Browse by Subject
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {subjects.map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all hover:translate-y-[-2px] p-4 text-center group cursor-pointer">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {subject.name}
                  </p>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-8 sm:p-12 text-white text-center space-y-4">
          <h2 className="text-3xl sm:text-4xl font-bold">Want to Share Your Knowledge?</h2>
          <p className="text-lg text-blue-100">Upload your lessons and help other students learn</p>
          <Link href="/upload">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 h-12 px-8 rounded-lg">
              <Upload className="h-5 w-5 mr-2" />
              Upload a Lesson
            </Button>
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
