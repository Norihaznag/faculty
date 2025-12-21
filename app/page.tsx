import { MainLayout } from '@/components/layout/main-layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase, Subject } from '@/lib/supabase';
import { BookOpen, Upload, Search as SearchIcon } from 'lucide-react';
import Link from 'next/link';

export default async function Home() {
  // Fetch data on the server
  const [lessonsRes, subjectsRes] = await Promise.all([
    supabase.from('lessons').select('id', { count: 'exact' }).eq('is_published', true),
    supabase.from('subjects').select('*').order('order_index'),
  ]);

  const lessonsCount = lessonsRes.count || 0;
  const subjects = (subjectsRes.data as Subject[]) || [];

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Hero - Minimal & Fast */}
        <div className="text-center space-y-6 py-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight">
            Find Educational Content in Seconds
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Morocco&apos;s fastest edu platform. Search lessons, explore faculties, filter by subject.
          </p>

          {/* Quick Stats */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-8 py-4">
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{lessonsCount}+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Lessons</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">{subjects.length}+</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Faculties</p>
            </div>
            <div className="text-center">
              <p className="text-2xl sm:text-3xl font-bold text-primary">100%</p>
              <p className="text-xs sm:text-sm text-muted-foreground">Free</p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 justify-center pt-2">
            <Button size="lg" className="w-full sm:w-auto" asChild>
              <Link href="/resources">
                <SearchIcon className="mr-2 h-4 w-4" /> Browse All Resources
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto" asChild>
              <Link href="/upload">
                <Upload className="mr-2 h-4 w-4" /> Contribute
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Faculties Grid */}
        <div className="space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold flex items-center gap-2">
            <BookOpen className="h-5 w-5" /> Top Faculties
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3">
            {subjects.slice(0, 8).map((subject) => (
              <Link key={subject.id} href={`/subjects/${subject.slug}`}>
                <Card className="h-full border border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
                  <CardContent className="p-3 sm:p-4 text-center">
                    <p className="font-semibold text-sm sm:text-base truncate text-foreground">
                      {subject.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
