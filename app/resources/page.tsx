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
import { Search as SearchIcon, BookOpen, X } from 'lucide-react';

type Lesson = {
  id: string;
  title: string;
  slug: string;
  description?: string;
  views: number;
  published: boolean;
  difficulty: string;
  subject?: { id: string; name: string; slug: string };
  subjectId: string;
  createdAt?: Date | string;
};

type Subject = {
  id: string;
  name: string;
  slug: string;
};

type University = {
  id: string;
  name: string;
  slug: string;
};

type Faculty = {
  id: string;
  name: string;
  slug: string;
};

type Semester = {
  id: string;
  name: string;
  order: number;
};

export default function ResourcesPage() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // Hierarchical filters
  const [selectedUni, setSelectedUni] = useState<string>('');
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [selectedSemester, setSelectedSemester] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');

  // Other filters
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'recent' | 'views'>('views');

  // Fetch universities on mount
  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch('/api/universities');
        const data = await res.json();
        setUniversities(data || []);
      } catch (error) {
        console.error('Error fetching universities:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchUniversities();
  }, []);

  // Fetch faculties when university changes
  useEffect(() => {
    if (!selectedUni) {
      setFaculties([]);
      setSelectedFaculty('');
      setSemesters([]);
      setSelectedSemester('');
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const fetchFaculties = async () => {
      try {
        const res = await fetch(`/api/universities/${selectedUni}`);
        const data = await res.json();
        setFaculties(data.faculties || []);
        setSelectedFaculty('');
        setSemesters([]);
        setSelectedSemester('');
        setSubjects([]);
        setSelectedSubject('');
      } catch (error) {
        console.error('Error fetching faculties:', error);
      }
    };
    fetchFaculties();
  }, [selectedUni]);

  // Fetch semesters when faculty changes
  useEffect(() => {
    if (!selectedUni || !selectedFaculty) {
      setSemesters([]);
      setSelectedSemester('');
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const fetchSemesters = async () => {
      try {
        const res = await fetch(`/api/universities/${selectedUni}/faculty/${selectedFaculty}`);
        const data = await res.json();
        // Extract unique semesters from all programs
        const allSemesters = data.programs?.flatMap((p: any) => p.semesters || []) || [];
        const uniqueSemesters = Array.from(
          new Map(allSemesters.map((s: any) => [s.id, s])).values()
        ) as Semester[];
        setSemesters(uniqueSemesters.sort((a, b) => a.order - b.order));
        setSelectedSemester('');
        setSubjects([]);
        setSelectedSubject('');
      } catch (error) {
        console.error('Error fetching semesters:', error);
      }
    };
    fetchSemesters();
  }, [selectedUni, selectedFaculty]);

  // Fetch subjects when semester changes
  useEffect(() => {
    if (!selectedUni || !selectedFaculty || !selectedSemester) {
      setSubjects([]);
      setSelectedSubject('');
      return;
    }

    const fetchSubjects = async () => {
      try {
        const res = await fetch(
          `/api/universities/${selectedUni}/faculty/${selectedFaculty}/program/${selectedSemester.split('|')[1]}/semester/${selectedSemester.split('|')[0]}`
        );
        if (res.ok) {
          const data = await res.json();
          setSubjects(data.subjects || []);
          setSelectedSubject('');
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [selectedUni, selectedFaculty, selectedSemester]);

  // Fetch lessons based on filters
  useEffect(() => {
    const fetchLessons = async () => {
      try {
        const res = await fetch('/api/lessons');
        const data = await res.json();
        setLessons(data.lessons || []);
      } catch (error) {
        console.error('Error fetching lessons:', error);
      }
    };
    fetchLessons();
  }, []);

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
    if (selectedSubject) {
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

  const hasActiveFilters = selectedUni || selectedFaculty || selectedSemester || selectedSubject || searchQuery || sortBy !== 'views';

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

          {/* Hierarchical Filters Section */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-700 p-4 rounded-lg border border-blue-200 dark:border-slate-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Filter by University Structure</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* University */}
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                  University
                </label>
                <Select value={selectedUni} onValueChange={setSelectedUni}>
                  <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm">
                    <SelectValue placeholder="Select university..." />
                  </SelectTrigger>
                  <SelectContent>
                    {universities.map((uni) => (
                      <SelectItem key={uni.id} value={uni.slug}>
                        {uni.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Faculty */}
              {selectedUni && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Faculty
                  </label>
                  <Select value={selectedFaculty} onValueChange={setSelectedFaculty} disabled={!selectedUni}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50">
                      <SelectValue placeholder="Select faculty..." />
                    </SelectTrigger>
                    <SelectContent>
                      {faculties.map((fac) => (
                        <SelectItem key={fac.id} value={fac.slug}>
                          {fac.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Semester */}
              {selectedFaculty && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Semester
                  </label>
                  <Select value={selectedSemester} onValueChange={setSelectedSemester} disabled={!selectedFaculty}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50">
                      <SelectValue placeholder="Select semester..." />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={`${sem.name}|${sem.id}`}>
                          {sem.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Subject */}
              {selectedSemester && (
                <div>
                  <label className="text-xs font-medium text-gray-600 dark:text-gray-400 block mb-2">
                    Subject
                  </label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject} disabled={!selectedSemester}>
                    <SelectTrigger className="h-10 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg text-sm disabled:opacity-50">
                      <SelectValue placeholder="Select subject..." />
                    </SelectTrigger>
                    <SelectContent>
                      {subjects.map((subj) => (
                        <SelectItem key={subj.id} value={subj.id}>
                          {subj.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Additional Filters & Clear */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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

            {hasActiveFilters && (
              <div className="flex items-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedUni('');
                    setSelectedFaculty('');
                    setSelectedSemester('');
                    setSelectedSubject('');
                    setSortBy('views');
                  }}
                  className="w-full h-10 border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950"
                >
                  <X className="h-4 w-4 mr-1" />
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>
        </form>

        {/* Results Info */}
        {filteredLessons.length > 0 && (
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredLessons.length}</span> lesson{filteredLessons.length !== 1 ? 's' : ''}
            {selectedSubject && ` in ${subjects.find(s => s.id === selectedSubject)?.name}`}
          </div>
        )}

        {/* Lessons Grid */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading lessons...</p>
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="text-center py-12 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">No lessons found matching your filters</p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedUni('');
                setSelectedFaculty('');
                setSelectedSemester('');
                setSelectedSubject('');
                setSortBy('views');
              }}
            >
              Reset All Filters
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


