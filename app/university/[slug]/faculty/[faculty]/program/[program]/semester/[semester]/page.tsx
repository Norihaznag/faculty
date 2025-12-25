'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
  _count: {
    lessons: number;
  };
}

interface SemesterData {
  id: string;
  name: string;
  order: number;
  subjects: Subject[];
  program: {
    name: string;
    slug: string;
    faculty: {
      name: string;
      slug: string;
      university: {
        name: string;
        slug: string;
      };
    };
  };
}

export default function SemesterPage() {
  const params = useParams();
  const [semester, setSemester] = useState<SemesterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;
  const faculty = params.faculty as string;
  const program = params.program as string;
  const semesterParam = params.semester as string;

  useEffect(() => {
    async function fetchSemester() {
      try {
        const response = await fetch(
          `/api/universities/${slug}/faculty/${faculty}/program/${program}/semester/${semesterParam}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch semester');
        }
        const data = await response.json();
        setSemester(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchSemester();
  }, [slug, faculty, program, semesterParam]);

  if (loading) {
    return (
      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <Skeleton className="h-8 w-64 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !semester) {
    return (
      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive">Error Loading Semester</h2>
          <p className="text-sm text-muted-foreground mt-2">{error || 'Semester not found'}</p>
          <Link href={`/university/${slug}/faculty/${faculty}/program/${program}`} className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Program
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 max-w-6xl mx-auto">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/explore">Universities</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/university/${slug}`}>{semester.program.faculty.university.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/university/${slug}/faculty/${faculty}`}>{semester.program.faculty.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/university/${slug}/faculty/${faculty}/program/${program}`}>{semester.program.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{semester.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-4xl font-bold">{semester.name}</h1>
          <Badge variant="secondary">{semester.program.name}</Badge>
        </div>
        <p className="text-muted-foreground">
          {semester.subjects.length} Subjects • {semester.subjects.reduce((sum, s) => sum + s._count.lessons, 0)} Total Lessons
        </p>
      </div>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {semester.subjects.map((subject) => (
          <Link
            key={subject.id}
            href={`/subjects/${subject.slug}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full" style={{ borderTopColor: subject.color, borderTopWidth: '3px' }}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-2xl mb-2">{subject.icon}</div>
                    <CardTitle className="text-lg">{subject.name}</CardTitle>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{subject._count.lessons} Lessons</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {semester.subjects.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No subjects found for this semester</p>
        </div>
      )}
    </div>
  );
}
