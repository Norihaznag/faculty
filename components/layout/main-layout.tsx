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
  const [isDesktop, setIsDesktop] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Check if we're on desktop and restore sidebar state from localStorage
    const checkDesktop = () => {
      if (typeof window === 'undefined') return;
      
      const desktop = window.innerWidth >= 1024;
      setIsDesktop(desktop);
      
      // Only set initial state once on mount
      if (!initialized) {
        if (desktop) {
          // On desktop, restore saved state or default to open
          const savedState = localStorage.getItem('sidebarOpen');
          setSidebarOpen(savedState !== null ? savedState === 'true' : true);
        } else {
          // On mobile, default to closed
          setSidebarOpen(false);
        }
        setInitialized(true);
      }
    };

    checkDesktop();
    window.addEventListener('resize', checkDesktop);
    return () => window.removeEventListener('resize', checkDesktop);
  }, [initialized]);

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
    <div className="min-h-screen bg-white">
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isMobile={mounted && !isDesktop} />

      <div className={cn('transition-all duration-200 ease-out', sidebarOpen ? 'lg:pl-72' : 'lg:pl-0')}>
        <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

        <main className="min-h-[calc(100vh-3.5rem)] bg-white">
          {children}
        </main>
      </div>
    </div>
  );
}
