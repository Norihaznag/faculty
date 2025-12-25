'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BookOpen, Filter, X, Search as SearchIcon } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content?: string;
  views: number;
  published: boolean;
  difficulty: string;
  subject?: { id: string; name: string };
  subjectId: string;
  createdAt?: Date | string;
};

type Subject = {
  id: string;
  name: string;
  slug: string;
};

export default function ResourcesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [lessonsRes, subjectsRes] = await Promise.all([
        fetch('/api/lessons').then(r => r.json()),
        fetch('/api/subjects').then(r => r.json()),
      ]);

      setLessons(lessonsRes.lessons || []);
      setSubjects(subjectsRes.subjects || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter & search
  const filteredLessons = useMemo(() => {
    let result = [...lessons];

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(query) ||
          lesson.description?.toLowerCase().includes(query)
      );
    }

    // Subject filter - only filter if not "all"
    if (selectedSubject && selectedSubject !== 'all') {
      result = result.filter((lesson) => lesson.subjectId === selectedSubject);
    }

    // Sort
    if (sortBy === 'views') {
      result.sort((a, b) => (b.views || 0) - (a.views || 0));
    } else if (sortBy === 'recent') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    return result;
  }, [lessons, searchQuery, selectedSubject, sortBy]);

  const activeFilters = [searchQuery, selectedSubject, sortBy !== 'recent'].filter(Boolean).length;

  return (
    <MainLayout>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm sticky top-4">
            <CardHeader>
              <CardTitle className="text-lg">Filters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-semibold block mb-2">Faculty</label>
                <Select value={selectedSubject || 'all'} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="All Faculties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Faculties</SelectItem>
                    {subjects.map((subject) => (
                      <SelectItem key={subject.id} value={subject.id}>
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-semibold block mb-2">Sort By</label>
                <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="views">Most Popular</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {activeFilters > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setSortBy('recent');
                  }}
                  className="w-full"
                >
                  <X className="h-4 w-4 mr-1" /> Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-900">
            <CardHeader>
              <CardTitle className="text-base">📊 Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
                <p className="text-2xl font-bold">{lessons.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Results Found</p>
                <p className="text-2xl font-bold">{filteredLessons.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search Bar */}
          <div className="relative w-full">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted pointer-events-none" />
            <Input
              placeholder="Search lessons, topics, keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-full h-12 text-base md:text-sm"
            />
          </div>
          </div>

          {/* Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-2">
              <SearchIcon className="h-6 w-6" /> All Resources
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              {filteredLessons.length} lessons found
            </p>
          </div>

          {/* Results */}
          {loading ? (
            <div className="text-center py-12">
              <p>Loading resources...</p>
            </div>
          ) : filteredLessons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No resources found</p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedSubject('all');
                }}
              >
                Clear Filters & Try Again
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredLessons.map((lesson) => (
                <Link key={lesson.id} href={`/lessons/${lesson.slug}`} className="group">
                  <Card className="h-full border-0 shadow-sm hover:shadow-md transition-all hover:border-blue-200">
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-indigo-600"></div>
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <CardTitle className="text-base font-semibold group-hover:text-blue-600 transition-colors line-clamp-2">
                          {lesson.title}
                        </CardTitle>
                        <Badge className="shrink-0 text-xs capitalize">
                          {lesson.difficulty}
                        </Badge>
                      </div>
                      <CardDescription className="text-xs sm:text-sm line-clamp-1 text-blue-600 font-medium">
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
          )}
        </div>
      </div>
    </MainLayout>
  );
}


