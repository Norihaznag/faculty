'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';

export function ProtectedRoute({ children, requiredRole }: { children: ReactNode; requiredRole?: string }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (requiredRole && session?.user?.role !== requiredRole && session?.user?.role !== 'admin') {
      router.push('/');
    }
  }, [status, session, requiredRole, router]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (requiredRole && session?.user?.role !== requiredRole && session?.user?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-screen">Access Denied</div>;
  }

  return <>{children}</>;
}
