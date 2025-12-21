'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/lib/auth-context';
import { supabase, Lesson } from '@/lib/supabase';
import { Bookmark, BookmarkCheck, Eye, Calendar, User, ArrowLeft, ArrowRight, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

type LessonViewW3StyleProps = {
  lesson: Lesson;
  previousLesson?: Lesson | null;
  nextLesson?: Lesson | null;
};

export function LessonViewW3Style({ lesson, previousLesson, nextLesson }: LessonViewW3StyleProps) {
  const { user } = useAuth();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showTableOfContents, setShowTableOfContents] = useState(false);

  useEffect(() => {
    if (user?.id) {
      checkBookmark();
    } else {
      setIsBookmarked(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, lesson.id]);

  const checkBookmark = async () => {
    if (!user) return;

    try {
      const { data } = await supabase
        .from('bookmarks')
        .select('id')
        .eq('user_id', user.id)
        .eq('lesson_id', lesson.id)
        .maybeSingle();

      setIsBookmarked(!!data);
    } catch (error) {
      console.error('Error checking bookmark:', error);
    }
  };

  const toggleBookmark = async () => {
    if (!user || bookmarkLoading) return;  // ← GUARD: Prevent concurrent requests

    const previousState = isBookmarked;    // ← SNAPSHOT current state
    setBookmarkLoading(true);

    try {
      if (previousState) {
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
      console.error('Error toggling bookmark:', error);
      setIsBookmarked(previousState);  // ← ROLLBACK on error
    } finally {
      setBookmarkLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 min-h-[calc(100vh-3.5rem)]">
      {/* Sidebar - TOC */}
      <aside className="hidden lg:block w-64 flex-shrink-0 bg-gray-50 border-r border-border">
        <div className="sticky top-0 p-6 h-screen overflow-y-auto">
          <h3 className="font-semibold text-sm text-gray-700 mb-4">TABLE OF CONTENTS</h3>
          <nav className="space-y-2 text-sm">
            <a href="#introduction" className="block text-blue-600 hover:underline">
              Introduction
            </a>
            <a href="#content" className="block text-blue-600 hover:underline">
              Main Content
            </a>
            {lesson.pdf_url && (
              <a href="#resources" className="block text-blue-600 hover:underline">
                Resources
              </a>
            )}
            <a href="#related" className="block text-blue-600 hover:underline">
              Related Lessons
            </a>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-6 py-8 sm:py-12 max-w-4xl">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <span>/</span>
          {lesson.subject && (
            <>
              <Link href={`/subjects/${lesson.subject.slug}`} className="hover:text-foreground">
                {lesson.subject.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-foreground font-medium">{lesson.title}</span>
        </div>

        {/* Header */}
        <div className="space-y-4 mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground">
            {lesson.title}
          </h1>

          {/* Metadata */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            {lesson.subject && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{lesson.subject.name}</span>
              </div>
            )}
            {lesson.semester && (
              <>
                <span>•</span>
                <span>{lesson.semester}</span>
              </>
            )}
            {lesson.author && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {lesson.author.full_name}
                </span>
              </>
            )}
            <span>•</span>
            <span className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              {lesson.views} views
            </span>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={isBookmarked ? 'default' : 'outline'}
              size="sm"
              onClick={toggleBookmark}
              disabled={bookmarkLoading || !user}
              className="gap-2"
            >
              {isBookmarked ? (
                <>
                  <BookmarkCheck className="h-4 w-4" />
                  Bookmarked
                </>
              ) : (
                <>
                  <Bookmark className="h-4 w-4" />
                  Save
                </>
              )}
            </Button>
            {lesson.pdf_url && (
              <Button variant="outline" size="sm" asChild>
                <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                  Download PDF
                </a>
              </Button>
            )}
            {lesson.external_link && (
              <Button variant="outline" size="sm" asChild>
                <a href={lesson.external_link} target="_blank" rel="noopener noreferrer">
                  External Link
                </a>
              </Button>
            )}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Main Content */}
        <div id="content" className="prose prose-sm sm:prose-base lg:prose-lg dark:prose-invert max-w-none mb-12">
          <section id="introduction">
            <h2>Overview</h2>
            {lesson.content && (
              <div className="text-lg leading-relaxed text-foreground/80 whitespace-pre-wrap break-words overflow-x-auto">
                {lesson.content}
              </div>
            )}
          </section>
        </div>

        {/* Resources */}
        {(lesson.pdf_url || lesson.external_link) && (
          <div id="resources" className="space-y-4 mb-12">
            <h2 className="text-2xl font-bold">Resources</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
              {lesson.pdf_url && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">PDF Document</span>
                  <Button size="sm" asChild>
                    <a href={lesson.pdf_url} target="_blank" rel="noopener noreferrer">
                      Download
                    </a>
                  </Button>
                </div>
              )}
              {lesson.external_link && (
                <div className="flex items-center justify-between">
                  <span className="text-blue-900">External Resource</span>
                  <Button size="sm" asChild>
                    <a href={lesson.external_link} target="_blank" rel="noopener noreferrer">
                      Visit
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {lesson.tags && lesson.tags.length > 0 && (
          <div className="mb-12">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">TAGS</h3>
            <div className="flex flex-wrap gap-2">
              {lesson.tags.map((tag) => (
                <Badge key={tag.id} variant="secondary">
                  {tag.name}
                </Badge>
              ))}
            </div>
          </div>
        )}

        <Separator className="my-8" />

        {/* Navigation */}
        <div id="related" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {previousLesson ? (
            <Link href={`/lessons/${previousLesson.slug}`} className="group">
              <div className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </div>
                <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                  {previousLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="p-4 border border-border rounded-lg bg-gray-50" />
          )}

          {nextLesson ? (
            <Link href={`/lessons/${nextLesson.slug}`} className="group text-right">
              <div className="p-4 border border-border rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-end gap-2 text-sm text-muted-foreground mb-2">
                  Next
                  <ArrowRight className="h-4 w-4" />
                </div>
                <p className="font-semibold text-foreground group-hover:text-blue-600 transition-colors line-clamp-2">
                  {nextLesson.title}
                </p>
              </div>
            </Link>
          ) : (
            <div className="p-4 border border-border rounded-lg bg-gray-50" />
          )}
        </div>
      </main>
    </div>
  );
}
