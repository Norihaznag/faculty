'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

type Program = {
  id: string;
  name: string;
  slug: string;
  _count: { semesters: number };
};

type FacultyDetail = {
  id: string;
  name: string;
  slug: string;
  university: { name: string; slug: string };
  programs: Program[];
};

interface PageProps {
  params: { slug: string; faculty: string };
}

export default function FacultyPage({ params }: PageProps) {
  const [faculty, setFaculty] = useState<FacultyDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        const res = await fetch(
          `/api/universities/${params.slug}/faculty/${params.faculty}`
        );
        const data = await res.json();
        setFaculty(data);
      } catch (err) {
        console.error('Failed to fetch faculty');
      }
      setLoading(false);
    };

    fetchFaculty();
  }, [params.slug, params.faculty]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!faculty) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Faculty not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <Link href="/" className="hover:text-gray-900 dark:hover:text-gray-300">
            Home
          </Link>
          <span>/</span>
          <Link
            href="/explore"
            className="hover:text-gray-900 dark:hover:text-gray-300"
          >
            Universities
          </Link>
          <span>/</span>
          <Link
            href={`/university/${faculty.university.slug}`}
            className="hover:text-gray-900 dark:hover:text-gray-300"
          >
            {faculty.university.name}
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-gray-100">{faculty.name}</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            {faculty.name}
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">
            {faculty.university.name}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {faculty.programs.length} programs available
          </p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Programs</h2>
          {faculty.programs.map((program) => (
            <Link
              key={program.id}
              href={`/university/${faculty.university.slug}/faculty/${faculty.slug}/program/${program.slug}`}
            >
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                <div className="h-1 bg-blue-600" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{program.name}</CardTitle>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {program._count.semesters} semesters
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}
