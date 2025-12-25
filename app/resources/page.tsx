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
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2 mb-2">
            <SearchIcon className="h-6 w-6" /> All Resources
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            {filteredLessons.length} lessons found
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
          <Input
            placeholder="Search lessons, topics, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 w-full"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <Select value={selectedSubject || 'all'} onValueChange={setSelectedSubject}>
            <SelectTrigger className="w-full sm:w-48">
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

          <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="views">Most Viewed</SelectItem>
            </SelectContent>
          </Select>

          {activeFilters > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSortBy('recent');
              }}
              className="w-full sm:w-auto"
            >
              <X className="h-4 w-4 mr-1" /> Clear Filters
            </Button>
          )}
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.slug}`} className="group">
                <Card className="h-full border border-border/60 hover:border-primary/50 hover:shadow-md transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <CardTitle className="text-base font-semibold group-hover:text-primary transition-colors line-clamp-2">
                        {lesson.title}
                      </CardTitle>
                      {lesson.difficulty === 'advanced' && (
                        <Badge variant="secondary" className="shrink-0 text-xs">
                          {lesson.difficulty}
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="text-xs sm:text-sm line-clamp-1">
                      {lesson.subject?.name || 'No subject'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
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

