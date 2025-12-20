'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, BookOpen, Home, Upload, Settings, Bookmark, X } from 'lucide-react';
import { supabase, Subject, Lesson } from '@/lib/supabase';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAuth } from '@/lib/auth-context';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  isMobile?: boolean;
};

export function Sidebar({ isOpen, onClose, isMobile = false }: SidebarProps) {
  const pathname = usePathname();
  const { isAdmin, isModerator } = useAuth();
  type SidebarLesson = { id: string; title: string; slug: string };

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [lessonsMap, setLessonsMap] = useState<Record<string, SidebarLesson[]>>({});

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('order_index');

      if (error) throw error;
      if (data) {
        setSubjects(data);
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
    }
  };

  const fetchLessonsForSubject = async (subjectId: string) => {
    if (lessonsMap[subjectId]) return;

    try {
      const { data, error } = await supabase
        .from('lessons')
        .select('id, title, slug')
        .eq('subject_id', subjectId)
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      if (data) {
        setLessonsMap(prev => ({ ...prev, [subjectId]: data }));
      }
    } catch (error) {
      console.error('Error fetching lessons for subject:', error);
    }
  };

  const toggleSubject = (subjectId: string) => {
    const newExpanded = new Set(expandedSubjects);
    if (newExpanded.has(subjectId)) {
      newExpanded.delete(subjectId);
    } else {
      newExpanded.add(subjectId);
      fetchLessonsForSubject(subjectId);
    }
    setExpandedSubjects(newExpanded);
  };

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark },
    { href: '/upload', label: 'Upload', icon: Upload },
    { href: '/my-uploads', label: 'My Uploads', icon: Upload },
    { href: '/admin', label: 'Admin', icon: Settings, adminOnly: true },
  ];

  return (
    <>
      {/* Overlay only on mobile */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      <aside
        className={cn(
          'fixed top-0 left-0 h-full w-72 bg-white border-r border-border/40 z-50 transition-transform duration-200 ease-out',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-border/40">
          <Link href="/" className="flex items-center space-x-2" onClick={isMobile ? onClose : undefined}>
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-lg">EduHub</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-3.5rem)] smooth-scroll">
          <div className="p-3 space-y-1">
            {navItems
              .filter((item) => !item.adminOnly || isAdmin || isModerator)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={cn(
                    'flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors active:scale-[0.98]',
                    pathname === item.href
                      ? 'bg-primary text-white font-medium'
                      : 'hover:bg-muted/50 active:bg-muted'
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </Link>
              ))}

            <div className="pt-3 pb-1.5">
              <h3 className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Subjects
              </h3>
            </div>

            {subjects.map((subject) => (
              <div key={subject.id}>
                <button
                  onClick={() => toggleSubject(subject.id)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 active:bg-muted transition-colors text-left active:scale-[0.98]"
                >
                  <span className="font-medium">{subject.name}</span>
                  <ChevronRight
                    className={cn(
                      'h-4 w-4 transition-transform',
                      expandedSubjects.has(subject.id) && 'rotate-90'
                    )}
                  />
                </button>

                {expandedSubjects.has(subject.id) && lessonsMap[subject.id] && (
                  <div className="ml-4 mt-1 space-y-1">
                    {lessonsMap[subject.id].map((lesson) => (
                      <Link
                        key={lesson.id}
                        href={`/lessons/${lesson.slug}`}
                        onClick={isMobile ? onClose : undefined}
                        className={cn(
                          'block px-3 py-1.5 text-sm rounded-md transition-colors active:scale-[0.98]',
                          pathname === `/lessons/${lesson.slug}`
                            ? 'bg-primary/10 text-primary font-medium'
                            : 'hover:bg-muted/50 active:bg-muted'
                        )}
                      >
                        {lesson.title}
                      </Link>
                    ))}
                    <Link
                      href={`/subjects/${subject.slug}`}
                      onClick={isMobile ? onClose : undefined}
                      className="block px-3 py-1.5 text-sm text-primary hover:underline"
                    >
                      View all →
                    </Link>
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
