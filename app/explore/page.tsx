'use client';

import { useEffect, useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Building2, 
  BookOpen, 
  Users, 
  MapPin,
  GraduationCap,
  Zap
} from 'lucide-react';

// University icons based on slug
const universityIcons: Record<string, React.ReactNode> = {
  'ibn-zohr': <GraduationCap className="w-10 h-10" />,
  'qadi-ayyad': <BookOpen className="w-10 h-10" />,
  'university-of-fez': <Building2 className="w-10 h-10" />,
  'hassan-ii': <Zap className="w-10 h-10" />,
  'al-akhawayn': <Users className="w-10 h-10" />,
  'university-of-rabat': <MapPin className="w-10 h-10" />,
  'sultan-moulay-slimane': <GraduationCap className="w-10 h-10" />,
  'university-of-tangier': <BookOpen className="w-10 h-10" />,
};

// Color scheme for each university
const universityColors: Record<string, { bg: string; accent: string; text: string }> = {
  'ibn-zohr': { bg: 'bg-blue-50 dark:bg-blue-950', accent: 'text-blue-600 dark:text-blue-400', text: 'from-blue-500 to-blue-600' },
  'qadi-ayyad': { bg: 'bg-purple-50 dark:bg-purple-950', accent: 'text-purple-600 dark:text-purple-400', text: 'from-purple-500 to-purple-600' },
  'university-of-fez': { bg: 'bg-green-50 dark:bg-green-950', accent: 'text-green-600 dark:text-green-400', text: 'from-green-500 to-green-600' },
  'hassan-ii': { bg: 'bg-red-50 dark:bg-red-950', accent: 'text-red-600 dark:text-red-400', text: 'from-red-500 to-red-600' },
  'al-akhawayn': { bg: 'bg-amber-50 dark:bg-amber-950', accent: 'text-amber-600 dark:text-amber-400', text: 'from-amber-500 to-amber-600' },
  'university-of-rabat': { bg: 'bg-indigo-50 dark:bg-indigo-950', accent: 'text-indigo-600 dark:text-indigo-400', text: 'from-indigo-500 to-indigo-600' },
  'sultan-moulay-slimane': { bg: 'bg-cyan-50 dark:bg-cyan-950', accent: 'text-cyan-600 dark:text-cyan-400', text: 'from-cyan-500 to-cyan-600' },
  'university-of-tangier': { bg: 'bg-rose-50 dark:bg-rose-950', accent: 'text-rose-600 dark:text-rose-400', text: 'from-rose-500 to-rose-600' },
};

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
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900 mb-4">
            <GraduationCap className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-3">
            Explore Universities
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Discover Moroccan universities, browse faculties, programs, and semesters to find your courses
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
          </div>
        ) : (
          <>
            {/* Universities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {universities.map((uni) => {
                const colors = universityColors[uni.slug] || universityColors['ibn-zohr'];
                const icon = universityIcons[uni.slug] || <Building2 className="w-10 h-10" />;

                return (
                  <Link key={uni.id} href={`/university/${uni.slug}`}>
                    <Card className={`${colors.bg} border-0 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden cursor-pointer h-full group hover:scale-105 transform`}>
                      {/* Header with Icon */}
                      <div className="pt-6 px-6 pb-4">
                        <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg ${colors.bg} border-2 ${colors.accent} mb-4 group-hover:scale-110 transition-transform`}>
                          <span className={colors.accent}>
                            {icon}
                          </span>
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1 line-clamp-2">
                          {uni.name}
                        </h3>
                        
                        <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="w-4 h-4" />
                          <span>{uni.city}</span>
                        </div>
                      </div>

                      {/* Stats Section */}
                      <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <Building2 className="w-4 h-4" />
                              <span>Faculties</span>
                            </div>
                            <span className={`font-bold text-lg ${colors.accent}`}>
                              {uni._count.faculties}
                            </span>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <BookOpen className="w-4 h-4" />
                              <span>Lessons</span>
                            </div>
                            <span className={`font-bold text-lg ${colors.accent}`}>
                              {uni._count.lessons}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* CTA Footer */}
                      <div className={`px-6 py-3 bg-gradient-to-r ${colors.text} bg-opacity-5 flex items-center justify-between group`}>
                        <span className={`text-sm font-semibold ${colors.accent}`}>
                          Explore
                        </span>
                        <span className={`transition-transform group-hover:translate-x-1 ${colors.accent}`}>
                          →
                        </span>
                      </div>
                    </Card>
                  </Link>
                );
              })}
            </div>

            {/* Empty State */}
            {universities.length === 0 && (
              <div className="text-center py-16">
                <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">No universities found</p>
              </div>
            )}

            {/* Stats Footer */}
            <div className="mt-16 p-8 rounded-lg bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 border border-blue-200 dark:border-blue-700">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {universities.length}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Universities</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {universities.reduce((sum, u) => sum + u._count.faculties, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Faculties</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                    {universities.reduce((sum, u) => sum + u._count.lessons, 0)}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Total Lessons</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
}
