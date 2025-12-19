'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase, Subject, Lesson } from '@/lib/supabase';
import { BookOpen, TrendingUp, Clock, ArrowRight } from 'lucide-react';

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

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-0">
            <Clock className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Recent Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            {recentLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group gpu-accelerated"
              >
                <Card className="h-full border border-border/60 bg-white rounded-xl transition-all active:scale-[0.98] hover:border-primary/50">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 text-lg font-semibold">
                        {lesson.title}
                      </CardTitle>
                      {lesson.is_premium && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {lesson.subject?.name}
                      {lesson.semester && ` • ${lesson.semester}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-4 sm:mb-6 px-4 sm:px-0">
            <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            <h2 className="text-2xl sm:text-3xl font-bold">Popular Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 px-4 sm:px-0">
            {popularLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group gpu-accelerated"
              >
                <Card className="h-full border border-border/60 bg-white rounded-xl transition-all active:scale-[0.98] hover:border-primary/50">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 text-lg font-semibold">
                        {lesson.title}
                      </CardTitle>
                      {lesson.is_premium && (
                        <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="mt-1">
                      {lesson.subject?.name}
                      {lesson.semester && ` • ${lesson.semester}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {lesson.views} views
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
