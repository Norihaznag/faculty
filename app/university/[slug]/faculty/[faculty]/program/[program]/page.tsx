'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronRight, BookOpen } from 'lucide-react';

interface Semester {
  id: string;
  name: string;
  order: number;
  _count: {
    subjects: number;
  };
}

interface ProgramData {
  id: string;
  name: string;
  slug: string;
  semesters: Semester[];
  faculty: {
    name: string;
    slug: string;
    university: {
      name: string;
      slug: string;
    };
  };
}

export default function ProgramPage() {
  const params = useParams();
  const [program, setProgram] = useState<ProgramData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const slug = params.slug as string;
  const faculty = params.faculty as string;
  const programSlug = params.program as string;

  useEffect(() => {
    async function fetchProgram() {
      try {
        const response = await fetch(
          `/api/universities/${slug}/faculty/${faculty}/program/${programSlug}`
        );
        if (!response.ok) {
          throw new Error('Failed to fetch program');
        }
        const data = await response.json();
        setProgram(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProgram();
  }, [slug, faculty, programSlug]);

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

  if (error || !program) {
    return (
      <div className="flex-1 p-6 max-w-6xl mx-auto">
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-6 text-center">
          <h2 className="text-xl font-semibold text-destructive">Error Loading Program</h2>
          <p className="text-sm text-muted-foreground mt-2">{error || 'Program not found'}</p>
          <Link href={`/university/${slug}/faculty/${faculty}`} className="text-blue-600 hover:underline mt-4 inline-block">
            ← Back to Faculty
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
            <BreadcrumbLink href={`/university/${slug}`}>{program.faculty.university.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/university/${slug}/faculty/${faculty}`}>{program.faculty.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{program.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">{program.name}</h1>
        <p className="text-muted-foreground">
          {program.semesters.length} Semesters • {program.semesters.reduce((sum, s) => sum + s._count.subjects, 0)} Subjects
        </p>
      </div>

      {/* Semesters Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {program.semesters.map((semester) => (
          <Link
            key={semester.id}
            href={`/university/${slug}/faculty/${faculty}/program/${programSlug}/semester/${semester.name.toLowerCase().replace(/\s+/g, '-')}`}
          >
            <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{semester.name}</CardTitle>
                    <CardDescription>Semester {semester.order}</CardDescription>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{semester._count.subjects} Subjects</span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {program.semesters.length === 0 && (
        <div className="rounded-lg border border-dashed p-12 text-center">
          <p className="text-muted-foreground">No semesters found for this program</p>
        </div>
      )}
    </div>
  );
}
