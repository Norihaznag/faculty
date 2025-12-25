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