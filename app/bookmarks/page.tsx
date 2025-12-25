'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/lib/auth-context';
import { Bookmark, Heart } from 'lucide-react';

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
      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-red-100 dark:bg-red-900 mb-4">
            <Heart className="h-7 w-7 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Saved Lessons
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Your bookmarked content for quick access
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading saved lessons...</p>
          </div>
        ) : lessons.length === 0 ? (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              You haven&apos;t saved any lessons yet.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              Bookmark your favorite lessons for easy access later
            </p>
            <Link href="/resources" className="text-blue-600 dark:text-blue-400 hover:underline">
              Browse lessons →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <Link
                key={lesson.id}
                href={`/lessons/${lesson.slug}`}
                className="group"
              >
                <Card className="h-full bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20 border-2 border-red-200 dark:border-red-800 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden">
                  <CardHeader className="pb-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900">
                        <Heart className="h-5 w-5 text-red-600 dark:text-red-400 fill-current" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-red-600 transition-colors">
                          {lesson.title}
                        </CardTitle>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          {lesson.subject?.name || 'Uncategorized'}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      👁 {lesson.views} views
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

