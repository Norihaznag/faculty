'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
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
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

type HeaderProps = {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
};

export function Header({ onMenuClick, sidebarOpen = false }: HeaderProps) {
  const router = useRouter();
  const { user, profile } = useAuth();
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
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const sb = createClient(supabaseUrl, supabaseAnonKey);
    await sb.auth.signOut();
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

    setLoadingSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      try {
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

        if (lessonsRes.error) throw lessonsRes.error;
        if (subjectsRes.error) throw subjectsRes.error;

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
      } catch (error) {
        setSuggestions({ lessons: [], subjects: [] });
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

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
    <header className="sticky top-0 z-40 w-screen border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-2 sm:px-4 gap-2 sm:gap-4 w-full">
        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo (Mobile & Desktop) */}
        <Link 
          href="/" 
          className="flex lg:hidden items-center space-x-1 font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors shrink-0"
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">EduHub</span>
        </Link>

        <Link 
          href="/" 
          className="hidden lg:flex items-center space-x-2 font-semibold text-lg text-foreground hover:text-primary transition-colors shrink-0"
        >
          <BookOpen className="h-5 w-5" />
          <span>EduHub</span>
        </Link>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/search')}
          aria-label="Open search"
          className="sm:hidden shrink-0"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Search - Desktop */}
        <div className="hidden sm:flex flex-1 max-w-2xl relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                type="search"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9 w-full bg-secondary border border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                aria-label="Search"
              />
            </div>
          </form>

          {showSuggestions && (suggestions.lessons.length > 0 || suggestions.subjects.length > 0 || loadingSuggestions) && (
            <div className="fixed top-14 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-white shadow-lg z-50 w-[calc(100vw-2rem)] sm:w-auto" style={{maxWidth: '40rem'}}>
              <div className="p-1 space-y-0.5 max-h-80 overflow-y-auto">
                {loadingSuggestions && (
                  <p className="text-xs text-muted px-2 py-1">Loading...</p>
                )}

                {suggestions.lessons.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Lessons
                    </p>
                    {suggestions.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson.slug)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors text-foreground active:bg-secondary"
                      >
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="text-xs text-muted truncate">
                          {lesson.subject?.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.subjects.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted flex items-center gap-1">
                      <Tags className="h-3 w-3" /> Subjects
                    </p>
                    {suggestions.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSelectSubject(subject.slug)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors text-foreground"
                      >
                        <div className="text-sm font-medium truncate">{subject.name}</div>
                      </button>
                    ))}
                  </div>
                )}

                {!loadingSuggestions &&
                  suggestions.lessons.length === 0 &&
                  suggestions.subjects.length === 0 && (
                    <p className="text-xs text-muted px-2 py-1">No results</p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu" className="h-9 w-9 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-foreground truncate">{user.name}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                  <p className="text-xs text-primary capitalize font-medium mt-1">
                    {profile?.role}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/bookmarks">My Bookmarks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/upload">Upload</Link>
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="bg-primary hover:bg-blue-600 text-white text-xs sm:text-sm">
              <Link href="/auth/login">
                <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

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

    setLoadingSuggestions(true);

    debounceRef.current = setTimeout(async () => {
      try {
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

        if (lessonsRes.error) throw lessonsRes.error;
        if (subjectsRes.error) throw subjectsRes.error;

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
      } catch (error) {
        setSuggestions({ lessons: [], subjects: [] });
      } finally {
        setLoadingSuggestions(false);
      }
    }, 300);

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
    <header className="sticky top-0 z-40 w-screen border-b border-border bg-white/80 backdrop-blur-sm">
      <div className="flex h-14 items-center px-2 sm:px-4 gap-2 sm:gap-4 w-full">
        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="shrink-0"
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Logo (Mobile & Desktop) */}
        <Link 
          href="/" 
          className="flex lg:hidden items-center space-x-1 font-semibold text-sm sm:text-base text-foreground hover:text-primary transition-colors shrink-0"
        >
          <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
          <span className="hidden xs:inline">EduHub</span>
        </Link>

        <Link 
          href="/" 
          className="hidden lg:flex items-center space-x-2 font-semibold text-lg text-foreground hover:text-primary transition-colors shrink-0"
        >
          <BookOpen className="h-5 w-5" />
          <span>EduHub</span>
        </Link>

        {/* Mobile Search Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/search')}
          aria-label="Open search"
          className="sm:hidden shrink-0"
        >
          <Search className="h-5 w-5" />
        </Button>

        {/* Search - Desktop */}
        <div className="hidden sm:flex flex-1 max-w-2xl relative">
          <form onSubmit={handleSearch} className="w-full">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
              <Input
                type="search"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                className="pl-9 w-full bg-secondary border border-border text-foreground placeholder:text-muted focus:border-primary focus:ring-1 focus:ring-primary/20"
                aria-label="Search"
              />
            </div>
          </form>

          {showSuggestions && (suggestions.lessons.length > 0 || suggestions.subjects.length > 0 || loadingSuggestions) && (
            <div className="fixed top-14 left-1/2 -translate-x-1/2 rounded-lg border border-border bg-white shadow-lg z-50 w-[calc(100vw-2rem)] sm:w-auto" style={{maxWidth: '40rem'}}>
              <div className="p-1 space-y-0.5 max-h-80 overflow-y-auto">
                {loadingSuggestions && (
                  <p className="text-xs text-muted px-2 py-1">Loading...</p>
                )}

                {suggestions.lessons.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Lessons
                    </p>
                    {suggestions.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson.slug)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors text-foreground active:bg-secondary"
                      >
                        <div className="text-sm font-medium truncate">{lesson.title}</div>
                        <div className="text-xs text-muted truncate">
                          {lesson.subject?.name}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.subjects.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-muted flex items-center gap-1">
                      <Tags className="h-3 w-3" /> Subjects
                    </p>
                    {suggestions.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSelectSubject(subject.slug)}
                        className="w-full text-left px-3 py-2 rounded hover:bg-secondary transition-colors text-foreground"
                      >
                        <div className="text-sm font-medium truncate">{subject.name}</div>
                      </button>
                    ))}
                  </div>
                )}

                {!loadingSuggestions &&
                  suggestions.lessons.length === 0 &&
                  suggestions.subjects.length === 0 && (
                    <p className="text-xs text-muted px-2 py-1">No results</p>
                  )}
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="flex items-center gap-1 sm:gap-2 ml-auto">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" aria-label="User menu" className="h-9 w-9 sm:h-10 sm:w-10">
                  <User className="h-4 w-4 sm:h-5 sm:w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-56 bg-white">
                <div className="px-2 py-1.5">
              {profile?.full_name || user.email}</p>
                  <p className="text-xs text-muted truncate">{user.email}</p>
                  <p className="text-xs text-primary capitalize font-medium mt-1">
                    {user.role}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/bookmarks">My Bookmarks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/upload">Upload</Link>
                </DropdownMenuItem>
                {user.role === 'admin' && (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link href="/admin">Admin</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="bg-primary hover:bg-blue-600 text-white text-xs sm:text-sm">
              <Link href="/auth/login">
                <LogIn className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Sign In</span>
              </Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

