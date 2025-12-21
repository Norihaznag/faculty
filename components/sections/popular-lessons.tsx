'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Lesson } from '@/lib/supabase';
import { TrendingUp, BookOpen } from 'lucide-react';

export default function PopularLessonsSection({ lessons }: { lessons: Lesson[] }) {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2 mb-4 sm:mb-6">
        <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
        <h2 className="text-2xl sm:text-3xl font-bold">Popular Lessons</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {lessons.map((lesson) => (
          <Link
            key={lesson.id}
            href={`/lessons/${lesson.slug}`}
            className="group gpu-accelerated"
          >
            <Card className="h-full border border-border/60 bg-white rounded-xl transition-all active:scale-[0.98] hover:border-primary/50">
              <CardHeader className="p-4 sm:p-6">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="group-hover:text-primary transition-colors line-clamp-2 text-lg font-semibold">
                    {lesson.title}
                  </CardTitle>
                  {lesson.is_premium && (
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 shrink-0">
                      Premium
                    </Badge>
                  )}
                </div>
                <CardDescription className="mt-1">
                  {lesson.subject?.name}
                  {lesson.semester && ` • ${lesson.semester}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {lesson.views} views
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
