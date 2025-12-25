'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ChevronRight, Building2 } from 'lucide-react';

type University = {
  id: string;
  name: string;
  slug: string;
  city: string;
  _count: { faculties: number; lessons: number };
};

export default function ExplorePage() {
  const [universities, setUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const res = await fetch('/api/universities');
        const data = await res.json();
        setUniversities(data);
      } catch (err) {
        console.error('Failed to fetch universities');
      }
      setLoading(false);
    };

    fetchUniversities();
  }, []);

  return (
    <MainLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Explore Universities
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Browse by university, faculty, program, and semester to find your courses
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">Loading universities...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {universities.map((uni) => (
              <Link key={uni.id} href={`/university/${uni.slug}`}>
                <Card className="border-0 shadow-sm hover:shadow-md transition-shadow overflow-hidden cursor-pointer">
                  <div className="h-1 bg-blue-600" />
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-start gap-4 flex-1">
                        <Building2 className="h-6 w-6 text-blue-600 flex-shrink-0 mt-1" />
                        <div>
                          <CardTitle className="text-xl">{uni.name}</CardTitle>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                            {uni.city}
                          </p>
                        </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-gray-400 flex-shrink-0" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-6 text-sm text-gray-600 dark:text-gray-400">
                      <span>📚 {uni._count.faculties} faculties</span>
                      <span>📖 {uni._count.lessons} lessons</span>
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
