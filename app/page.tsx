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

  // Reusable vibrant tile styles inspired by the reference UI
  const subjectTileColors = [
    'bg-sky-500 text-slate-900',
    'bg-amber-400 text-slate-900',
    'bg-emerald-400 text-slate-900',
    'bg-rose-400 text-slate-900',
    'bg-indigo-400 text-slate-900',
    'bg-teal-400 text-slate-900',
    'bg-orange-500 text-slate-900',
    'bg-violet-500 text-slate-900',
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
      <div className="container mx-auto px-4 py-12 space-y-12">
        <section className="text-center space-y-4 py-10">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground">
            Welcome to EduHub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Your comprehensive university resource platform. Access tutorials, study materials, and educational content across all subjects.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button size="lg" asChild>
              <Link href="/subjects/computer-science">
                Explore Subjects <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/upload">Upload Content</Link>
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <BookOpen className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Browse by Subject</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {subjects.map((subject, index) => (
              <Link
                key={subject.id}
                href={`/subjects/${subject.slug}`}
                className="group"
              >
                <Card
                  className={`h-full border-none rounded-2xl shadow-md shadow-black/40 transition-all hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] ${subjectTileColors[index % subjectTileColors.length]}`}
                >
                  <CardHeader className="space-y-2">
                    <CardTitle className="group-hover:opacity-90 transition-opacity">
                      {subject.name}
                    </CardTitle>
                    <CardDescription className="line-clamp-2 text-slate-900/80">
                      {subject.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Recent Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentLessons.map((lesson) => (
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
                      {lesson.is_premium && (
                        <Badge variant="secondary" className="bg-amber-400 text-slate-900">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {lesson.subject?.name}
                      {lesson.semester && ` • ${lesson.semester}`}
                    </CardDescription>
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
        </section>

        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-6 w-6" />
            <h2 className="text-3xl font-bold">Popular Lessons</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {popularLessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group"
              >
                <Card className="h-full border border-border/60 bg-card/80 backdrop-blur-sm rounded-2xl transition-all hover:border-emerald-400/80 hover:shadow-xl hover:-translate-y-1">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      {lesson.is_premium && (
                        <Badge variant="secondary" className="bg-emerald-400 text-slate-900">
                          Premium
                        </Badge>
                      )}
                    </div>
                    <CardDescription>
                      {lesson.subject?.name}
                      {lesson.semester && ` • ${lesson.semester}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
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
