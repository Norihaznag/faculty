'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bookmark, Upload, LogIn } from 'lucide-react';
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
  const { user } = useAuth();

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/resources', label: 'Browse', icon: Compass },
  ];

  const userNavItems = user
    ? [
        { href: '/bookmarks', label: 'Saved', icon: Bookmark },
        { href: '/my-uploads', label: 'My Uploads', icon: Upload },
      ]
    : [
        { href: '/auth/login', label: 'Sign In', icon: LogIn },
      ];

  const NavLink = ({ href, label, icon: Icon }: any) => {
    const isActive = pathname === href || pathname.startsWith(href + '/');
    return (
      <Link href={href}>
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start gap-3 h-10',
            isActive && 'bg-blue-100 dark:bg-slate-800 text-blue-600 dark:text-blue-400'
          )}
          onClick={isMobile ? onClose : undefined}
        >
          <Icon className="h-5 w-5" />
          <span className="text-sm font-medium">{label}</span>
        </Button>
      </Link>
    );
  };

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-40 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:sticky top-16 left-0 h-[calc(100vh-64px)] w-64 bg-white dark:bg-slate-950 border-r border-gray-200 dark:border-slate-800 z-40 transition-transform duration-300',
          isMobile && !isOpen && '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full">
          <div className="p-4 space-y-1">
            {/* Main Navigation */}
            <div className="space-y-1">
              {mainNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-gray-200 dark:bg-slate-800 my-4" />

            {/* User Navigation */}
            <div className="space-y-1">
              {userNavItems.map((item) => (
                <NavLink key={item.href} {...item} />
              ))}
            </div>

            {/* Upload Button for authenticated users */}
            {user && (
              <div className="pt-4">
                <Link href="/upload" className="block">
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white h-10"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Share Lesson
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

      <aside
        className={cn(
          'w-64 bg-white border-r border-border overflow-hidden',
          // Mobile: fixed overlay
          'fixed top-14 left-0 h-[calc(100vh-3.5rem)] z-40 transition-transform duration-200 ease-out lg:hidden',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          // Desktop: relative + toggle support
          'lg:relative lg:transition-all lg:duration-200 lg:flex lg:flex-col lg:h-[calc(100vh-3.5rem)]',
          isOpen ? 'lg:w-64' : 'lg:w-0 lg:overflow-hidden'
        )}
      >
        <ScrollArea className="h-full w-64">
          <div className="space-y-1 p-4">
            {/* Main Navigation */}
            <div className="space-y-1 pb-3">
              {navItems
                .filter((item) => !item.adminOnly || isAdmin || isTeacher)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={isMobile ? onClose : undefined}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2 rounded transition-all text-sm font-medium',
                      pathname === item.href
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-secondary active:bg-secondary'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                ))}
            </div>

            {/* Divider */}
            <div className="h-px bg-border my-3" />

            {/* Subjects Section */}
            <div>
              <h3 className="px-3 text-xs font-semibold text-muted uppercase tracking-wide mb-2 mt-2">
                Subjects
              </h3>

              {subjects.map((subject) => (
                <div key={subject.id} className="mb-1">
                  <button
                    onClick={() => toggleSubject(subject.id)}
                    className={cn(
                      'w-full flex items-center justify-between px-3 py-2 rounded transition-all text-sm',
                      expandedSubjects.has(subject.id)
                        ? 'bg-secondary text-foreground font-medium'
                        : 'text-foreground hover:bg-secondary'
                    )}
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
                    <div className="ml-3 mt-1 space-y-1 pb-2 border-l border-border">
                      {lessonsMap[subject.id].slice(0, 6).map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/lessons/${lesson.slug}`}
                          onClick={isMobile ? onClose : undefined}
                          className={cn(
                            'block px-3 py-1.5 text-xs rounded transition-all line-clamp-2',
                            pathname === `/lessons/${lesson.slug}`
                              ? 'bg-primary/10 text-primary font-medium'
                              : 'text-muted hover:text-foreground hover:bg-secondary'
                          )}
                          title={lesson.title}
                        >
                          {lesson.title}
                        </Link>
                      ))}
                      {lessonsMap[subject.id].length > 6 && (
                        <Link
                          href={`/subjects/${subject.slug}`}
                          onClick={isMobile ? onClose : undefined}
                          className="block px-3 py-1.5 text-xs text-primary hover:text-blue-600 font-medium transition-colors"
                        >
                          View all ({lessonsMap[subject.id].length})
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="h-6" />
          </div>
        </ScrollArea>
      </aside>
    </>
  );
}

