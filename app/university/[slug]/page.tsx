'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { ChevronRight, BookOpen } from 'lucide-react';

type Faculty = {
  id: string;
  name: string;
  slug: string;
  _count: { programs: number };
};

type UniversityDetail = {
  id: string;
  name: string;
  slug: string;
  city: string;
  faculties: Faculty[];
};

interface PageProps {
  params: { slug: string };
}

export default function UniversityPage({ params }: PageProps) {
  const [university, setUniversity] = useState<UniversityDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const res = await fetch(`/api/universities/${params.slug}`);
        const data = await res.json();
        setUniversity(data);
      } catch (err) {
        console.error('Failed to fetch university');
      }
      setLoading(false);
    };

    fetchUniversity();
  }, [params.slug]);

  if (loading) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </MainLayout>
    );
  }

  if (!university) {
    return (
      <MainLayout>
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400">University not found</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">{university.name}</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 mt-2">{university.city}</p>
          <p className="text-sm text-gray-500 mt-4">{university.faculties.length} faculties available</p>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Faculties</h2>
          {university.faculties.map((faculty) => (
            <Link key={faculty.id} href={`/university/${university.slug}/faculty/${faculty.slug}`}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                <div className="h-1 bg-blue-600" />
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0 mt-1" />
                      <div>
                        <CardTitle className="text-lg">{faculty.name}</CardTitle>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {faculty._count.programs} programs
                        </p>
                      </div>
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
