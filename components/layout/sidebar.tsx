'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Compass, Bookmark, Upload, LogIn, ChevronDown, BookOpen, Building2 } from 'lucide-react';
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
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(
    { main: true, user: true }
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const mainNavItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/explore', label: 'Explore Universities', icon: Building2 },
    { href: '/resources', label: 'Browse Lessons', icon: BookOpen },
  ];

  const userNavItems = user
    ? [
        { href: '/my-uploads', label: 'My Uploads', icon: Upload },
        { href: '/bookmarks', label: 'Saved Lessons', icon: Bookmark },
      ]
    : [
        { href: '/auth/login', label: 'Sign In', icon: LogIn },
      ];

  const NavLink = ({ href, label, icon: Icon }: any) => {
    const isActive = pathname === href || (pathname.startsWith(href) && href !== '/');
    return (
      <Link href={href}>
        <button
          onClick={isMobile ? onClose : undefined}
          className={cn(
            'w-full px-3 py-2 rounded-md text-sm font-medium flex items-center gap-3 transition-colors',
            isActive
              ? 'bg-blue-600 text-white'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800'
          )}
        >
          <Icon className="h-4 w-4 flex-shrink-0" />
          <span>{label}</span>
        </button>
      </Link>
    );
  };

  const SectionHeader = ({ label, section }: { label: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide hover:bg-gray-100 dark:hover:bg-slate-800 rounded-md transition-colors"
    >
      {label}
      <ChevronDown
        className={cn(
          'h-3 w-3 transition-transform',
          expandedSections[section] && 'rotate-180'
        )}
      />
    </button>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/50 z-30 lg:hidden transition-opacity',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar - W3Schools Style */}
      <aside
        className={cn(
          'fixed lg:sticky top-14 left-0 w-56 h-[calc(100vh-56px)] bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-700 z-40 transition-transform duration-300 lg:translate-x-0',
          isMobile && !isOpen && '-translate-x-full'
        )}
      >
        <ScrollArea className="h-full">
          <nav className="p-4 space-y-6">
            {/* Main Section */}
            <div className="space-y-2">
              <SectionHeader label="Main" section="main" />
              {expandedSections.main && (
                <div className="space-y-1 pl-1">
                  {mainNavItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              )}
            </div>

            {/* User Section */}
            <div className="space-y-2">
              <SectionHeader label="My Learning" section="user" />
              {expandedSections.user && (
                <div className="space-y-1 pl-1">
                  {userNavItems.map((item) => (
                    <NavLink key={item.href} {...item} />
                  ))}
                </div>
              )}
            </div>

            {/* Upload CTA */}
            {user && (
              <div className="pt-4 border-t border-gray-200 dark:border-slate-700">
                <Link href="/upload" className="block">
                  <Button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-9 text-sm font-medium transition-colors"
                    onClick={isMobile ? onClose : undefined}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Lesson
                  </Button>
                </Link>
              </div>
            )}
          </nav>
        </ScrollArea>
      </aside>
    </>
  );
}