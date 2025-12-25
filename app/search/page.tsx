'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, BookOpen, ArrowLeft } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  views: number;
  difficulty: string;
  subject?: { id: string; name: string };
};

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialQuery) {
      searchLessons(initialQuery);
    }
  }, [initialQuery]);

  const searchLessons = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setLessons([]);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/lessons?search=${encodeURIComponent(searchQuery)}`
      );
      const data = await response.json();
      setLessons(data.lessons || []);
    } catch (error) {
      console.error('Search error:', error);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      searchLessons(query);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
            <Search className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Search Lessons
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Find the content you're looking for
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto w-full">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              <Input
                placeholder="Search by title, topic, or keyword..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-12 h-12 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 text-base"
                autoFocus
              />
            </div>
            <Button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 font-semibold"
            >
              Search
            </Button>
          </div>
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Searching...</p>
          </div>
        ) : lessons.length === 0 && query ? (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
              No lessons found for "{query}"
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Try searching with different keywords
            </p>
          </div>
        ) : lessons.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Found <span className="font-semibold text-gray-900 dark:text-white">{lessons.length}</span> result{lessons.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-4px] overflow-hidden">
                    <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <CardTitle className="text-sm font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {lesson.subject?.name || 'Uncategorized'}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lesson.description && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {lesson.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-slate-700">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>👁 {lesson.views}</span>
                        </div>
                        <Badge className="text-xs capitalize bg-blue-100 dark:bg-slate-800 text-blue-700 dark:text-blue-400">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-16 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Start typing to search for lessons
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

