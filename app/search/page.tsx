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
    const searchLessons = async () => {
      setLoading(true);

      try {
        const { data, error } = await supabase
          .from('lessons')
          .select('*, subject:subjects(*)')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('views', { ascending: false })
          .limit(50);

        if (error) throw error;

        setLessons(data || []);
      } catch (error) {
        setLessons([]);
      } finally {
        setLoading(false);
      }
    };
    
    if (query) {
      searchLessons();
    } else {
      setLoading(false);
    }
  }, [query]);

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Search className="h-5 w-5 sm:h-6 sm:w-6" />
            <h1 className="text-2xl sm:text-3xl font-bold">Search Results</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            {query ? `Showing results for "${query}"` : 'Enter a search query'}
          </p>
        </div>

        {loading ? (
          <p className="text-sm sm:text-base">Searching...</p>
        ) : lessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-sm sm:text-base text-muted-foreground">
                No lessons found matching your search.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Found {lessons.length} result{lessons.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className="group"
                >
                  <Card className="h-full transition-all hover:shadow-lg">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 text-base sm:text-lg">
                          {lesson.title}
                        </CardTitle>
                        {lesson.is_premium && (
                          <Badge variant="secondary" className="shrink-0 text-xs">Premium</Badge>
                        )}
                      </div>
                      <CardDescription className="text-xs sm:text-sm">
                        {lesson.subject?.name}
                        {lesson.semester && ` • ${lesson.semester}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground">
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

