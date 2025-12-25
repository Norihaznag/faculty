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
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Back Button */}
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Search className="h-6 w-6 text-blue-600" />
            <h1 className="text-3xl sm:text-4xl font-bold">Search Lessons</h1>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground">
            Find lessons by title, description, or topic
          </p>
        </div>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
          <Input
            type="search"
            placeholder="Search lessons, topics, keywords..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 w-full h-12 text-base"
            autoFocus
          />
        </form>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Searching...</p>
          </div>
        ) : lessons.length === 0 && query ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-2">
                <BookOpen className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  No lessons found for "{query}"
                </p>
                <p className="text-sm text-muted-foreground">
                  Try searching with different keywords
                </p>
              </div>
            </CardContent>
          </Card>
        ) : lessons.length > 0 ? (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Found {lessons.length} result{lessons.length !== 1 ? 's' : ''}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {lessons.map((lesson) => (
                <Link
                  key={lesson.id}
                  href={`/lessons/${lesson.slug}`}
                  className="group"
                >
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all">
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-600" />
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-base font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                        <Badge className="shrink-0 text-xs capitalize">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs sm:text-sm text-blue-600 font-medium">
                        {lesson.subject?.name || 'No subject'}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="text-sm text-muted-foreground">
                        {lesson.description && (
                          <p className="line-clamp-2 mb-3">{lesson.description}</p>
                        )}
                        <div className="flex items-center justify-between pt-2 border-t">
                          <span className="text-xs text-gray-500">
                            {lesson.views} views
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-8 pb-8">
              <div className="text-center space-y-2">
                <Search className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
                <p className="text-muted-foreground">
                  Start typing to search for lessons
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

