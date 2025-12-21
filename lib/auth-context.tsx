'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from './supabase';

type AuthContextType = {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, fullName: string, role: 'student' | 'teacher') => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
  isTeacher: boolean;
  isModerator: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) throw error;

        if (!isMounted) return;
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchProfile(session.user.id, isMounted);
        } else {
          if (isMounted) {
            setProfile(null);
            setLoading(false);
          }
        }
      } catch (error) {
        if (isMounted) {
          setAuthError(error instanceof Error ? error.message : 'Auth initialization failed');
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isMounted) return;
      
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchProfile(session.user.id, isMounted);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, isMountedRef: boolean) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      
      if (!isMountedRef) return;  // ← EXIT if unmounted
      
      if (data && data.is_active === false) {
        await supabase.auth.signOut();
        setProfile(null);
        setUser(null);
        setLoading(false);
        return;
      }
      
      setProfile(data || null);
      setLoading(false);
    } catch (error) {
      if (isMountedRef) {  // ← Only set error state if still mounted
        setAuthError(error instanceof Error ? error.message : 'Failed to fetch profile');
        setLoading(false);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string, fullName: string, role: 'student' | 'teacher') => {
    try {
      // Create auth user with ONLY email and password (minimal data)
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password: password.trim(),
      });
      
      if (signUpError) {
        return { error: signUpError };
      }

      // The trigger will create a basic profile when auth user is created
      // Then we update it with the full_name and role
      if (data?.user?.id) {
        // Wait for trigger to create profile
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Update the profile with full details
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ 
            full_name: fullName,
            role: role,
            email: email.toLowerCase().trim()
          })
          .eq('id', data.user.id);
        
        // Don't fail if update doesn't work - email confirmation might be required first
        if (updateError) {
          // Silently continue - profile will be updated when user confirms email
        }
      }
      
      return { error: null };
    } catch (err: any) {
      return { error: { message: err?.message || 'Signup failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const value = {
    user,
    profile,
    loading,
    error: authError,
    signIn,
    signUp,
    signOut,
    isAdmin: profile?.role === 'admin',
    isTeacher: profile?.role === 'teacher' || profile?.role === 'admin',
    isModerator: profile?.role === 'moderator' || profile?.role === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

