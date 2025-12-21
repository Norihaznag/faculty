'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/lib/auth-context';
import { supabase, Lesson } from '@/lib/supabase';
import { Bookmark, BookOpen } from 'lucide-react';

export default function BookmarksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('bookmarks')
        .select('lesson:lessons(*, subject:subjects(*))')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (data) {
        setLessons(data.map((b: any) => b.lesson).filter(Boolean));
      }

      setLoading(false);
    };

    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchBookmarks();
    }
  }, [user, authLoading, router]);

  const fetchBookmarks = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('bookmarks')
      .select('lesson:lessons(*, subject:subjects(*))')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setLessons(data.map((b: any) => b.lesson).filter(Boolean));
    }

    setLoading(false);
  };

  if (authLoading || loading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <p>Loading...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center gap-2">
          <Bookmark className="h-6 w-6" />
          <h1 className="text-3xl font-bold">My Bookmarks</h1>
        </div>

        {lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                You haven&apos;t bookmarked any lessons yet.
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
                <Card className="h-full transition-all hover:shadow-lg">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      {lesson.is_premium && (
                        <Badge variant="secondary">Premium</Badge>
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
        )}
      </div>
    </MainLayout>
  );
}
