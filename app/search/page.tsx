'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase, Lesson } from '@/lib/supabase';
import { Search, BookOpen } from 'lucide-react';

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      searchLessons();
    } else {
      setLoading(false);
    }
  }, [query]);

  const searchLessons = async () => {
    setLoading(true);

    const { data } = await supabase
      .from('lessons')
      .select('*, subject:subjects(*)')
      .eq('is_published', true)
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('views', { ascending: false })
      .limit(50);

    if (data) {
      setLessons(data);
    }

    setLoading(false);
  };

  return (
    <MainLayout>
      <div className="container mx-auto px-4 py-8 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-6 w-6" />
            <h1 className="text-3xl font-bold">Search Results</h1>
          </div>
          <p className="text-muted-foreground">
            {query ? `Showing results for "${query}"` : 'Enter a search query'}
          </p>
        </div>

        {loading ? (
          <p>Searching...</p>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No lessons found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Found {lessons.length} result{lessons.length !== 1 ? 's' : ''}
            </p>
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
          </>
        )}
      </div>
    </MainLayout>
  );
}
