'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, User, LogOut, LogIn, BookOpen, Tags } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

type HeaderProps = {
  onMenuClick: () => void;
};

export function Header({ onMenuClick }: HeaderProps) {
  const router = useRouter();
  const { user, profile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<{
    lessons: { id: string; title: string; slug: string; subject?: { name?: string } | null }[];
    subjects: { id: string; name: string; slug: string }[];
  }>({ lessons: [], subjects: [] });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  // Fetch suggestions for lessons and subjects as user types
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!searchQuery.trim()) {
      setSuggestions({ lessons: [], subjects: [] });
      setShowSuggestions(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoadingSuggestions(true);
      const query = searchQuery.trim();

      const [lessonsRes, subjectsRes] = await Promise.all([
        supabase
          .from('lessons')
          .select('id, title, slug, subject:subjects!inner(name)')
          .eq('is_published', true)
          .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
          .order('views', { ascending: false })
          .limit(5),
        supabase
          .from('subjects')
          .select('id, name, slug')
          .ilike('name', `%${query}%`)
          .order('order_index')
          .limit(5),
      ]);

      // Transform lessons to ensure subject is properly typed
      const lessons = (lessonsRes.data || []).map((lesson: any) => ({
        id: lesson.id,
        title: lesson.title,
        slug: lesson.slug,
        subject: Array.isArray(lesson.subject) ? lesson.subject[0] : lesson.subject,
      }));

      setSuggestions({
        lessons: lessons,
        subjects: subjectsRes.data || [],
      });
      setShowSuggestions(true);
      setLoadingSuggestions(false);
    }, 200);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [searchQuery]);

  const handleSelectLesson = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/lessons/${slug}`);
  };

  const handleSelectSubject = (slug: string) => {
    setShowSuggestions(false);
    router.push(`/subjects/${slug}`);
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4 gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden"
          aria-label="Toggle menu"
        >
          <Menu className="h-5 w-5" />
        </Button>

        <div className="hidden lg:block w-8" />

        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search lessons, subjects, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                className="pl-9 w-full"
                aria-label="Search"
              />
            </div>
          </form>

          {showSuggestions && (suggestions.lessons.length > 0 || suggestions.subjects.length > 0 || loadingSuggestions) && (
            <div className="absolute mt-2 w-full rounded-md border bg-popover shadow-lg z-50">
              <div className="p-2 space-y-1 max-h-80 overflow-y-auto">
                {loadingSuggestions && (
                  <p className="text-xs text-muted-foreground px-2 py-1">Loading...</p>
                )}

                {suggestions.lessons.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Lessons
                    </p>
                    {suggestions.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson.slug)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="text-sm font-medium">{lesson.title}</div>
                        <div className="text-xs text-muted-foreground">
                          {lesson.subject?.name ? `Subject: ${lesson.subject.name}` : 'Lesson'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.subjects.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Tags className="h-3 w-3" /> Subjects
                    </p>
                    {suggestions.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSelectSubject(subject.slug)}
                        className="w-full text-left px-2 py-1.5 rounded-md hover:bg-accent transition-colors"
                      >
                        <div className="text-sm font-medium">{subject.name}</div>
                        <div className="text-xs text-muted-foreground">Subject</div>
                      </button>
                    ))}
                  </div>
                )}

                {!loadingSuggestions &&
                  suggestions.lessons.length === 0 &&
                  suggestions.subjects.length === 0 && (
                    <p className="text-xs text-muted-foreground px-2 py-1">No matches</p>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{profile?.full_name}</p>
                  <p className="text-xs text-muted-foreground">{profile?.email}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-1">
                    Role: {profile?.role}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/bookmarks">My Bookmarks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/upload">Upload Content</Link>
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild>
              <Link href="/auth/login">
                <LogIn className="mr-2 h-4 w-4" />
                Sign In
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
