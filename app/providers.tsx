'use client';

import React from 'react';
import { AuthProvider } from '@/lib/auth-context';

type ProvidersProps = {
  children: React.ReactNode;
};

export function Providers({ children }: ProvidersProps) {
  return <AuthProvider>{children}</AuthProvider>;
}


