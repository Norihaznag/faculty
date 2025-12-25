'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Bookmark } from 'lucide-react';
import prisma from '@/lib/db';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  subject: { name: string } | null;
  views: number;
};

export default function BookmarksPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookmarks = async () => {
      if (!user) return;

      try {
        const res = await fetch(`/api/bookmarks?userId=${user.id}`);
        const data = await res.json();
        setLessons(data);
      } catch (err) {
        console.error('Failed to fetch bookmarks');
      }

      setLoading(false);
    };

    if (!authLoading && !user) {
      router.push('/auth/login');
    } else if (user) {
      fetchBookmarks();
    }
  }, [user, authLoading, router]);

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
      <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
        <div className="flex items-center gap-2 mb-8">
          <Bookmark className="h-6 w-6 text-blue-600" />
          <h1 className="text-3xl font-bold">Saved Lessons</h1>
        </div>

        {lessons.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6 pb-6 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                You haven&apos;t saved any lessons yet.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="block"
              >
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                  <div className="h-1 bg-blue-600" />
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base font-semibold line-clamp-2">
                      {lesson.title}
                    </CardTitle>
                    <div className="flex items-center justify-between mt-2 text-xs text-gray-600 dark:text-gray-400">
                      <span>{lesson.subject?.name}</span>
                      <span>{lesson.views} views</span>
                    </div>
                  </CardHeader>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}

