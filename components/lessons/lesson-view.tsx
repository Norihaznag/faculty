'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/main-layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { supabase, Lesson } from '@/lib/supabase';
import { Bookmark, BookmarkCheck, Download, ExternalLink, Eye, Calendar, User } from 'lucide-react';
import { format } from 'date-fns';

type LessonViewProps = {
  lesson: Lesson;
};

export function LessonView({ lesson }: LessonViewProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);

  useEffect(() => {
    const checkBookmark = async () => {
      if (!user) return;

      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      setIsBookmarked(!!data);
    };
    
    if (user?.id) {
      checkBookmark();
    } else {
      setIsBookmarked(false);
    }
  }, [user, user?.id, lesson.id]);

  const toggleBookmark = async () => {
    if (!user) return;

    setBookmarkLoading(true);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('lesson_id', lesson.id);
        
        if (error) throw error;
        setIsBookmarked(false);
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({ user_id: user.id, lesson_id: lesson.id });
        
        if (error) throw error;
        setIsBookmarked(true);
      }
    } catch (error) {
      // Bookmark toggle failed
    } finally {
      setBookmarkLoading(false);
    }
  };

  return (
    <MainLayout>
      <article className="container mx-auto px-4 py-10 max-w-4xl">
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
              <Link
                href={`/subjects/${lesson.subject?.slug}`}
                className="hover:text-primary transition-colors"
              >
                {lesson.subject?.name}
              </Link>
              {lesson.semester && (
                <>
                  <span>•</span>
                  <span>{lesson.semester}</span>
                </>
              )}
            </div>

            <h1 className="text-4xl font-bold tracking-tight mb-2 text-foreground">
              {lesson.title}
            </h1>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Eye className="h-4 w-4" />
                {lesson.views} views
              </span>
              {lesson.author && (
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {lesson.author.full_name}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(lesson.created_at), 'MMM d, yyyy')}
              </span>
            </div>

            {lesson.tags && lesson.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {lesson.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="bg-sky-500 text-white"
                  >
                    {tag.name}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-2">
            {user && (
              <Button
                variant={isBookmarked ? 'default' : 'outline'}
                onClick={toggleBookmark}
                disabled={bookmarkLoading}
              >
                {isBookmarked ? (
                  <>
                    <BookmarkCheck className="mr-2 h-4 w-4" />
                    Bookmarked
                  </>
                ) : (
                  <>
                    <Bookmark className="mr-2 h-4 w-4" />
                    Bookmark
                  </>
                )}
              </Button>
            )}

            {lesson.pdf_url && (
              <Button variant="outline" asChild>
                <a href={lesson.pdf_url} download target="_blank" rel="noopener noreferrer">
                  <Download className="mr-2 h-4 w-4" />
                  Download PDF
                </a>
              </Button>
            )}

            {lesson.external_link && (
              <Button variant="outline" asChild>
                <a href={lesson.external_link} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="mr-2 h-4 w-4" />
                  External Link
                </a>
              </Button>
            )}
          </div>

          <Separator className="border-border/60" />

          {lesson.content && (
            <Card className="border border-border/60 bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <div
                  className="prose prose-neutral dark:prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              </CardContent>
            </Card>
          )}

          {lesson.pdf_url && (
            <Card className="border border-border/60 bg-card/80 backdrop-blur-sm rounded-2xl">
              <CardContent className="pt-6">
                <h2 className="text-2xl font-bold mb-4">PDF Preview</h2>
                <div className="w-full aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                  <iframe
                    src={`${lesson.pdf_url}#view=FitH`}
                    className="w-full h-full"
                    title="PDF Preview"
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </article>
    </MainLayout>
  );
}

