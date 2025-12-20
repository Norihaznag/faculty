'use client';

import { useEffect, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, Subject, Lesson } from '@/lib/supabase';
import { BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

// Lazy load less critical sections
const RecentLessonsSection = dynamic(
  () => import('@/components/sections/recent-lessons'),
  { loading: () => <LessonsLoadingSkeleton />, ssr: true }
);

const PopularLessonsSection = dynamic(
  () => import('@/components/sections/popular-lessons'),
  { loading: () => <LessonsLoadingSkeleton />, ssr: true }
);

function LessonsLoadingSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-40 bg-gray-200 rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-48 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [recentLessons, setRecentLessons] = useState<Lesson[]>([]);
  const [popularLessons, setPopularLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  // Clean, minimalist subject tile styles - subtle colors on white
  const subjectTileColors = [
    'bg-blue-50 border-blue-200/50 hover:bg-blue-100',
    'bg-emerald-50 border-emerald-200/50 hover:bg-emerald-100',
    'bg-purple-50 border-purple-200/50 hover:bg-purple-100',
    'bg-orange-50 border-orange-200/50 hover:bg-orange-100',
    'bg-pink-50 border-pink-200/50 hover:bg-pink-100',
    'bg-cyan-50 border-cyan-200/50 hover:bg-cyan-100',
    'bg-amber-50 border-amber-200/50 hover:bg-amber-100',
    'bg-indigo-50 border-indigo-200/50 hover:bg-indigo-100',
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const [subjectsRes, recentRes, popularRes] = await Promise.all([
      supabase.from('subjects').select('*').order('order_index').limit(8),
      supabase
        .from('lessons')
        .select('*, subject:subjects(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(6),
      supabase
        .from('lessons')
        .select('*, subject:subjects(*)')
        .eq('is_published', true)
        .order('views', { ascending: false })
        .limit(6),
    ]);

    if (subjectsRes.data) setSubjects(subjectsRes.data);
    if (recentRes.data) setRecentLessons(recentRes.data);
    if (popularRes.data) setPopularLessons(popularRes.data);
    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10 sm:space-y-12">
        <section className="text-center space-y-3 sm:space-y-4 py-6 sm:py-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Welcome to EduHub
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Your comprehensive university resource platform. Access tutorials, study materials, and educational content across all subjects.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-4">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/subjects/computer-science">
                Explore Subjects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/upload">Upload Content</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-0">
            <BookOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Browse by Subject</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 px-4 sm:px-0">
            {subjects.map((subject, index) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group gpu-accelerated"
              >
                <Card
                  className={`h-full border rounded-xl transition-all active:scale-[0.98] ${subjectTileColors[index % subjectTileColors.length]}`}
                >
                  <CardHeader className="space-y-1.5 p-4 sm:p-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-sm text-muted-foreground">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <Suspense fallback={<LessonsLoadingSkeleton />}>
          <RecentLessonsSection lessons={recentLessons} />
        </Suspense>

        <Suspense fallback={<LessonsLoadingSkeleton />}>
          <PopularLessonsSection lessons={popularLessons} />
        </Suspense>
      </div>
    </MainLayout>
  );
}
