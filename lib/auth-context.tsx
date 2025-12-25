'use client';

import React, { createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

type AuthContextType = {
  user: any;
  loading: boolean;
  error: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();

  const user = session?.user || null;
  const loading = status === 'loading';
  const isAdmin = (user as any)?.role === 'admin';
  const isTeacher = (user as any)?.role === 'teacher';

  const logout = async () => {
    await signOut({ redirect: true, callbackUrl: '/auth/login' });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error: null,
        isAdmin,
        isTeacher,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

