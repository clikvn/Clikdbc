import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner@2.0.3';

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          // Don't send email confirmation if disabled
          emailRedirectTo: undefined,
        }
      });

      // Check if there's an error but user was still created
      if (error) {
        // If user exists in response despite error, account was created
        // This can happen with 422 errors when email confirmation is enabled
        if (data?.user) {
          console.warn('Signup returned error but user was created:', error);
          // Account was created, treat as success but log the warning
          if (data.session) {
            toast.success('Account created successfully! You are now signed in.');
            return { error: null, data };
          } else if (data.user) {
            toast.success('Account created! Please check your email to verify your account.');
            return { error: null, data };
          }
        }
        // Real error - return it
        return { error };
      }

      // If session is available, user is immediately signed in (email confirmation disabled)
      if (data.session) {
        toast.success('Account created successfully! You are now signed in.');
      } else if (data.user) {
        // If no session but user exists, email confirmation is required
        toast.success('Account created! Please check your email to verify your account.');
      }

      return { error: null, data };
    } catch (error) {
      console.error('Signup exception:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        return { error };
      }

      toast.success('Signed in successfully!');
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error('Error signing out: ' + error.message);
        return;
      }
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        return { error };
      }

      toast.success('Password reset email sent! Check your inbox.');
      return { error: null };
    } catch (error) {
      return { error: error as AuthError };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

