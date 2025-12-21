'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home, Upload, Settings, Bookmark } from 'lucide-react';
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
        .order('order_index', { ascending: true })
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
          'fixed top-16 left-0 h-[calc(100vh-4rem)] w-80 bg-slate-900 border-r border-slate-800 z-50 transition-transform duration-200 ease-out overflow-hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <ScrollArea className="h-full w-full">
          <div className="space-y-1 p-4">
            {/* Main Navigation Items */}
            <div className="space-y-1 pb-4">
              {navItems
                .filter((item) => !item.adminOnly || isAdmin || isModerator)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      'flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-all active:scale-[0.98]',
                      pathname === item.href
                        ? 'bg-primary text-white font-medium shadow-lg shadow-primary/20'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white active:bg-slate-700'
                    )}
                  >
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium">{item.label}</span>
                  </Link>
                ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-slate-700 my-4" />

            {/* Subjects/Faculties Section */}
            <div>
              <h3 className="px-4 text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Faculties & Subjects
              </h3>

              {subjects.map((subject) => (
                <div key={subject.id} className="mb-1">
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-all text-left active:scale-[0.98]',
                      expandedSubjects.has(subject.id)
                        ? 'bg-slate-800 text-white font-semibold'
                        : 'text-slate-300 hover:bg-slate-800/50 hover:text-white active:bg-slate-700'
                    )}
                  >
                    <span className="font-semibold text-sm">{subject.name}</span>
                    <ChevronRight
                      className={cn(
                        'h-4 w-4 transition-transform flex-shrink-0',
                        expandedSubjects.has(subject.id) && 'rotate-90'
                      )}
                    />
                  </button>

                  {expandedSubjects.has(subject.id) && lessonsMap[subject.id] && (
                    <div className="ml-4 mt-2 space-y-1 pb-2">
                      {lessonsMap[subject.id].slice(0, 8).map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.slug}`}
                          onClick={isMobile ? onClose : undefined}
                          className={cn(
                            'block px-3 py-1.5 text-sm rounded-md transition-all active:scale-[0.98]',
                            pathname === `/lessons/${lesson.slug}`
                              ? 'bg-primary/20 text-primary font-medium'
                              : 'text-slate-300 hover:bg-slate-800/50 hover:text-white active:bg-slate-700'
                          )}
                          title={lesson.title}
                        >
                          <span className="line-clamp-2">{lesson.title}</span>
                        </Link>
                      ))}
                      {lessonsMap[subject.id].length > 8 && (
                        <Link
                          href={`/subjects/${subject.slug}`}
                          onClick={isMobile ? onClose : undefined}
                          className="block px-3 py-1.5 text-sm text-primary hover:text-accent transition-colors font-medium"
                        >
                          View all ({lessonsMap[subject.id].length}) →
                        </Link>
                      )}
                      {lessonsMap[subject.id].length <= 8 && (
                        <Link
                          href={`/subjects/${subject.slug}`}
                          onClick={isMobile ? onClose : undefined}
                          className="block px-3 py-1.5 text-sm text-primary hover:text-accent transition-colors font-medium"
                        >
                          View all →
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Footer Spacing */}
            <div className="h-8" />
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}
