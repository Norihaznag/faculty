'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Sidebar } from './sidebar';
import { Header } from './header';

type MainLayoutProps = {
  children: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(true); // Default to true to match server
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if we're on desktop and restore sidebar state from localStorage
    const checkDesktop = () => {
      if (typeof window === 'undefined') return;
      
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      if (desktop) {
        // On desktop, restore saved state or default to open
        const savedState = localStorage.getItem('sidebarOpen');
        setSidebarOpen(savedState !== null ? savedState === 'true' : true);
      } else {
        // On mobile, default to closed
        setSidebarOpen(false);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => {
      const newState = !prev;
      // Save to localStorage if desktop
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        localStorage.setItem('sidebarOpen', String(newState));
      }
      return newState;
    });
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
    // Save to localStorage if desktop
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      localStorage.setItem('sidebarOpen', 'false');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Fixed Header - Full Width */}
      <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar + Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - W3Schools style */}
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isMobile={!isDesktop} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-white dark:bg-slate-950">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

