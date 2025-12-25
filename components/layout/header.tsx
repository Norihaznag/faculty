'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Menu, User, LogOut, LogIn, Upload, X } from 'lucide-react';
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
    <header className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-700 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* Left: Menu & Logo */}
          <div className="flex items-center gap-3 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={onMenuClick}
              className="lg:hidden h-8 w-8 p-0"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <Link href="/" className="flex items-center gap-2 font-bold text-lg flex-shrink-0 hover:opacity-80 transition-opacity">
              <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-indigo-700 rounded flex items-center justify-center text-white text-xs font-bold">
                F
              </div>
              <span className="hidden sm:inline text-gray-900 dark:text-white">Faculty</span>
            </Link>
          </div>

          {/* Center: Search */}
          <form onSubmit={handleSearch} className="flex-1 max-w-sm">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 bg-gray-50 dark:bg-slate-800 border-gray-300 dark:border-slate-700 rounded-md text-sm focus-visible:ring-2 focus-visible:ring-blue-500"
              />
            </div>
          </form>

          {/* Right: Profile Menu */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {user && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/upload')}
                className="hidden sm:flex h-8 gap-2"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload</span>
              </Button>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {user ? (
                  <>
                    <div className="px-2 py-1.5 text-xs text-gray-500">
                      <p className="font-medium truncate text-gray-700 dark:text-gray-300">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/upload')} className="sm:hidden">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Lesson
                    </DropdownMenuItem>
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

