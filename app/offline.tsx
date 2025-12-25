'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function OfflinePage() {
  useEffect(() => {
    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Service Worker registration failed
      });
    }
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center space-y-4 px-4">
        <h1 className="text-4xl font-bold text-foreground">You&apos;re Offline</h1>
        <p className="text-lg text-muted-foreground max-w-md">
          We&apos;re unable to load new content right now, but you can still view cached pages.
        </p>
        <Button asChild className="mt-6">
          <Link href="/">Back to Home</Link>
        </Button>
      </div>
    </div>
  );
}

