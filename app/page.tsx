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
