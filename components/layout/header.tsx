'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, User, LogOut, LogIn, Upload, Bookmark } from 'lucide-react';
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

type HeaderProps = {
  onMenuClick: () => void;
  sidebarOpen?: boolean;
};

export function Header({ onMenuClick, sidebarOpen = false }: HeaderProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-950 border-b border-gray-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Left: Logo & Menu */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
                F
              </div>
              <span className="hidden sm:inline">Faculty</span>
            </Link>
          </div>

          {/* Center: Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search lessons..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-100 dark:bg-slate-800 border-0 rounded-lg focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </form>

          {/* Right: Actions & Profile */}
          <div className="flex items-center gap-2">
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/upload')}
                  title="Upload"
                >
                  <Upload className="h-5 w-5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => router.push('/bookmarks')}
                  title="Bookmarks"
                >
                  <Bookmark className="h-5 w-5" />
                </Button>
              </>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-sm">
                      <p className="font-medium truncate">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/my-uploads')}>
                      My Uploads
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/bookmarks')}>
                      Saved Lessons
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={async () => {
                        try {
                          await fetch('/api/auth/logout', { method: 'POST' });
                          router.push('/');
                          router.refresh();
                        } catch (error) {
                          console.error('Logout error:', error);
                        }
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuItem onClick={() => router.push('/auth/login')}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Sign In
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/auth/signup')}>
                      Create Account
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
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
                  <p className="text-sm font-medium text-foreground truncate">{user?.name || user?.email}</p>
                  <p className="text-xs text-muted truncate">{user?.email}</p>
                  <p className="text-xs text-primary capitalize font-medium mt-1">
                    {isAdmin ? 'Admin' : 'Student'}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/bookmarks">My Bookmarks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/upload">Upload</Link>
                </DropdownMenuItem>
                {isAdmin && (
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

