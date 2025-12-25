import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Upload, Search as SearchIcon, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

export default async function Home() {
  const [lessons, subjects] = await Promise.all([
    prisma.lesson.findMany({
      where: { published: true },
      take: 6,
      orderBy: { views: 'desc' },
      include: { subject: true },
    }),
    prisma.subject.findMany({
      take: 12,
      orderBy: { name: 'asc' },
    }),
  ]);

  const stats = [
    { label: 'Subjects', value: subjects.length, icon: '📚' },
    { label: 'Lessons', value: lessons.length, icon: '📖' },
    { label: 'Universities', value: '7', icon: '🎓' },
    { label: 'Languages', value: '2', icon: '🌍' },
  ];

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-slate-900 dark:to-slate-800 px-6 sm:px-8 py-16 sm:py-24">
          <div className="relative z-10 max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-semibold text-blue-600">Welcome to Faculty Hub 🇲🇦</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
              Learn from Morocco's<br />Best Universities
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-2xl">
              Access high-quality educational content from universities across Morocco. Learn at your own pace with lessons from experienced professors and educators.
            </p>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
              {stats.map((stat) => (
                <div key={stat.label} className="bg-white/80 dark:bg-slate-800/80 backdrop-blur rounded-lg p-3 text-center">
                  <p className="text-2xl">{stat.icon}</p>
                  <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-1">{stat.value}</p>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white text-base h-12" asChild>
                <Link href="/resources">
                  <SearchIcon className="mr-2 h-5 w-5" />
                  Explore Resources
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-base h-12" asChild>
                <Link href="/subjects">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Browse Subjects
                </Link>
              </Button>
            </div>
          </div>

          {/* Background decoration */}
          <div className="absolute top-0 right-0 -z-0 opacity-10">
            <div className="h-96 w-96 rounded-full bg-blue-400 blur-3xl"></div>
          </div>
        </section>

        {/* Popular Lessons */}
        {lessons.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold flex items-center gap-2">
                  <BookOpen className="h-8 w-8 text-blue-600" />
                  Popular Lessons
                </h2>
                <p className="text-muted-foreground mt-1">Most viewed content from our community</p>
              </div>
              <Button variant="ghost" asChild>
                <Link href="/resources" className="group">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <Link key={lesson.id} href={`/lessons/${lesson.slug}`}>
                  <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:border-blue-200 overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-indigo-600"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-base font-semibold line-clamp-2 group-hover:text-blue-600">
                          {lesson.title}
                        </CardTitle>
                      </div>
                      <p className="text-xs text-blue-600 font-medium">{lesson.subject?.name}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lesson.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {lesson.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs font-medium text-gray-500 capitalize bg-gray-50 dark:bg-slate-800 px-2 py-1 rounded">
                          {lesson.difficulty}
                        </span>
                        <span className="text-xs text-gray-500">
                          {lesson.views} views
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Subjects Grid */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold flex items-center gap-2">
                <BookOpen className="h-8 w-8 text-indigo-600" />
                Featured Subjects
              </h2>
              <p className="text-muted-foreground mt-1">Explore content from major Moroccan universities</p>
            </div>
            <Button variant="ghost" asChild>
              <Link href="/subjects" className="group">
                View All
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {subjects.slice(0, 12).map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer bg-gradient-to-br from-white to-gray-50 dark:from-slate-800 dark:to-slate-900">
                  <CardContent className="p-4 sm:p-6 text-center flex flex-col items-center justify-center h-full">
                    <div className="text-3xl sm:text-4xl mb-3">{subject.icon}</div>
                    <p className="font-semibold text-sm sm:text-base text-foreground line-clamp-2 text-center">
                      {subject.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* Info Section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="text-3xl mb-3">🎓</div>
              <CardTitle className="text-lg">Quality Content</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              All lessons are created and reviewed by qualified professors and educators from Morocco's leading universities.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="text-3xl mb-3">🌍</div>
              <CardTitle className="text-lg">Bilingual Support</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Content available in both English and Arabic to serve Morocco's diverse population and international students.
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardHeader>
              <div className="text-3xl mb-3">📱</div>
              <CardTitle className="text-lg">Learn Anywhere</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Access lessons on any device, anytime, anywhere. Learn at your own pace with no time restrictions.
            </CardContent>
          </Card>
        </section>
      </div>
    </MainLayout>
  );
}
