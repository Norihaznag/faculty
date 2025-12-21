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
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] min-h-screen bg-background">
      {/* Overlay for mobile */}
      {mounted && !isDesktop && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          onClick={closeSidebar}
          role="presentation"
        />
      )}

      {/* Fixed Header */}
      <Header onMenuClick={toggleSidebar} sidebarOpen={sidebarOpen} />

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} isMobile={!isDesktop} />

      {/* Main Content */}
      <main className="col-span-1 pt-16 bg-background min-h-screen">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
