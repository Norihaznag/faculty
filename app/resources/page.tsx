'use client';

import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Search as SearchIcon, BookOpen } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
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
  const [sortBy, setSortBy] = useState<'recent' | 'views'>('views');

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

    // Subject filter
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

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
            <BookOpen className="h-7 w-7 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Browse All Lessons
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Explore {lessons.length} lessons from Morocco's top universities
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search by title, topic, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-11 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500 text-base"
            />
          </div>

          {/* Filters Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Subject
              </label>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm">
                  <SelectValue placeholder="All Subjects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {subjects.map((subject) => (
                    <SelectItem key={subject.id} value={subject.id}>
                      {subject.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                Sort By
              </label>
              <Select value={sortBy} onValueChange={(val) => setSortBy(val as any)}>
                <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="views">Most Popular</SelectItem>
                  <SelectItem value="recent">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {(searchQuery || selectedSubject !== 'all' || sortBy !== 'views') && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubject('all');
                    setSortBy('views');
                  }}
                  className="w-full h-10"
                >
                  Clear Filters
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading lessons...</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">No lessons found matching your filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSortBy('views');
              }}
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredLessons.map((lesson) => (
              <Link key={lesson.id} href={`/lessons/${lesson.slug}`} className="group">
                <Card className="h-full border-0 shadow-sm hover:shadow-lg transition-all hover:translate-y-[-4px] overflow-hidden">
                  {/* Color accent */}
                  <div className="h-1 bg-gradient-to-r from-blue-500 to-indigo-600" />

                  <CardHeader className="pb-2">
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
        )}
      </div>
    </MainLayout>
  );
}


