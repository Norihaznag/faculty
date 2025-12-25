import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, BookOpen, Users, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import prisma from '@/lib/db';

export default async function Home() {
  const [universities, stats] = await Promise.all([
    prisma.university.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { faculties: true, lessons: true } } },
    }),
    Promise.all([
      prisma.lesson.count({ where: { published: true } }),
      prisma.user.count(),
    ]).then(([lessons, users]) => ({ lessons, users })),
  ]);

  return (
    <MainLayout>
      <div className="space-y-12">
        {/* Hero */}
        <section className="space-y-4 pt-4">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white">
            Moroccan University Content Hub
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl">
            Access university courses, materials, and resources from Morocco's top institutions. Learn, share, and contribute.
          </p>
          <Link href="/explore">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white h-10 px-6">
              <BookOpen className="h-4 w-4 mr-2" />
              Start Exploring
            </Button>
          </Link>
        </section>

        {/* Stats */}
        <section>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">{universities.length}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Universities</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">{stats.lessons}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Lessons</div>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-slate-900/50 rounded">
              <div className="text-3xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Contributors</div>
            </div>
          </div>
        </section>

        {/* Universities Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Moroccan Universities
            </h2>
            <Link href="/explore">
              <Button variant="ghost" className="gap-2">
                Explore All <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {universities.map((uni) => (
              <Link key={uni.id} href={`/university/${uni.slug}`}>
                <Card className="h-full border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                  <div className="h-1 bg-blue-600" />
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <Building2 className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div className="flex-1">
                        <CardTitle className="text-base font-semibold">
                          {uni.name}
                        </CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {uni.city}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                      <span>{uni._count.faculties} faculties</span>
                      <span>{uni._count.lessons} lessons</span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-blue-600 text-white rounded p-8 text-center space-y-4">
          <div className="flex justify-center mb-4">
            <Users className="h-8 w-8" />
          </div>
          <h2 className="text-3xl font-bold">Ready to Share Your Knowledge?</h2>
          <p className="text-blue-100">Join our community and contribute university materials</p>
          <Link href="/upload">
            <Button className="bg-white text-blue-600 hover:bg-gray-100">
              Upload Content
            </Button>
          </Link>
        </section>
      </div>
    </MainLayout>
  );
}
