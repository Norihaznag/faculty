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
  sidebarOpen?: boolean;
};

export function Header({ onMenuClick, sidebarOpen = false }: HeaderProps) {
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
        console.error('Search error:', error);
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
    <header className="sticky top-0 z-40 w-full border-b border-border bg-slate-950/95 backdrop-blur-sm supports-[backdrop-filter]:bg-slate-950/80">
      <div className="flex h-16 items-center px-4 gap-4">
        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          aria-label="Toggle sidebar"
          className="shrink-0 lg:hidden hover:bg-white/10"
        >
          <Menu className="h-5 w-5 text-white" />
        </Button>

        {/* Logo (Desktop Only) */}
        <Link 
          href="/" 
          className="hidden lg:flex items-center space-x-2 text-white font-bold text-lg hover:text-primary transition-colors"
        >
          <BookOpen className="h-6 w-6 text-primary" />
          <span>EduHub</span>
        </Link>

        {/* Search */}
        <div className="flex-1 max-w-2xl relative">
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search lessons, subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  if (searchQuery.trim()) setShowSuggestions(true);
                }}
                className="pl-9 w-full bg-slate-800 border-slate-700 text-white placeholder:text-slate-400 focus:border-primary/50 focus:ring-1 focus:ring-primary/20"
                aria-label="Search"
              />
            </div>
          </form>

          {showSuggestions && (suggestions.lessons.length > 0 || suggestions.subjects.length > 0 || loadingSuggestions) && (
            <div className="absolute mt-2 w-full rounded-lg border border-slate-700 bg-slate-900 shadow-xl z-50">
              <div className="p-1 space-y-0.5 max-h-80 overflow-y-auto smooth-scroll">
                {loadingSuggestions && (
                  <p className="text-xs text-muted-foreground px-2 py-1">Loading...</p>
                )}

                {suggestions.lessons.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-primary flex items-center gap-1">
                      <BookOpen className="h-3 w-3" /> Lessons
                    </p>
                    {suggestions.lessons.map((lesson) => (
                      <button
                        key={lesson.id}
                        type="button"
                        onClick={() => handleSelectLesson(lesson.slug)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-white active:bg-slate-700"
                      >
                        <div className="text-sm font-medium">{lesson.title}</div>
                        <div className="text-xs text-slate-400">
                          {lesson.subject?.name ? `Faculty: ${lesson.subject.name}` : 'Lesson'}
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {suggestions.subjects.length > 0 && (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold text-primary flex items-center gap-1">
                      <Tags className="h-3 w-3" /> Faculties
                    </p>
                    {suggestions.subjects.map((subject) => (
                      <button
                        key={subject.id}
                        type="button"
                        onClick={() => handleSelectSubject(subject.slug)}
                        className="w-full text-left px-3 py-2 rounded-md hover:bg-slate-800 transition-colors text-white active:bg-slate-700"
                      >
                        <div className="text-sm font-medium">{subject.name}</div>
                        <div className="text-xs text-slate-400">Faculty</div>
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

        {/* User Menu */}
        <div className="flex items-center gap-2">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-white/10" aria-label="User menu">
                  <User className="h-5 w-5 text-white" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium text-white">{profile?.full_name}</p>
                  <p className="text-xs text-slate-400">{profile?.email}</p>
                  <p className="text-xs text-primary capitalize mt-1 font-medium">
                    {profile?.role}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="text-white focus:bg-slate-800 cursor-pointer">
                  <Link href="/bookmarks">My Bookmarks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="text-white focus:bg-slate-800 cursor-pointer">
                  <Link href="/upload">Upload Content</Link>
                </DropdownMenuItem>
                {profile?.role === 'admin' && (
                  <DropdownMenuItem asChild className="text-white focus:bg-slate-800 cursor-pointer">
                    <Link href="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={handleSignOut} className="text-red-400 focus:bg-slate-800 cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="default" size="sm" asChild className="bg-primary hover:bg-accent text-white">
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
