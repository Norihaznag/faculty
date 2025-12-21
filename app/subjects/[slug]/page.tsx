'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Subject, Lesson } from '@/lib/supabase';
import { BookOpen, TrendingUp } from 'lucide-react';

export default function SubjectPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [subject, setSubject] = useState<Subject | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [slug]);

  const fetchData = async () => {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (subjectData) {
      setSubject(subjectData);

      const { data: lessonsData } = await supabase
        .from('lessons')
        .select('*')
        .eq('subject_id', subjectData.id)
        .eq('is_published', true)
        .order('created_at', { ascending: false });

      if (lessonsData) {
        setLessons(lessonsData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!subject) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold">Faculty Not Found</h1>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-10 space-y-10">
        <div className="space-y-4">
          <h1 className="text-4xl font-bold mb-2 text-foreground">
            {subject.name}
          </h1>
          {subject.description && (
            <p className="text-xl text-muted-foreground">{subject.description}</p>
          )}
        </div>

        <div className="space-y-4">
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
                        {lesson.is_premium && (
                          <Badge variant="secondary" className="bg-amber-400 text-foreground">
                            Premium
                          </Badge>
                        )}
                      </div>
                      {lesson.semester && (
                        <CardDescription>{lesson.semester}</CardDescription>
                      )}
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
    </MainLayout>
  );
}
