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

