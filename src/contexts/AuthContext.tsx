import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getErrorMessage } from '@/lib/error';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'user';
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  sessionExpired: boolean;
  clearSessionExpired: () => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Utility to add timeout to promises
const withTimeout = <T,>(promise: Promise<T>, timeoutMs: number = 10000): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeoutMs)
    ),
  ]);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);
  const hasUserRef = useRef(false);
  const currentUserRef = useRef<AuthUser | null>(null);
  const roleCacheRef = useRef<Map<string, AuthUser['role']>>(new Map());

  useEffect(() => {
    hasUserRef.current = !!user;
    currentUserRef.current = user;
  }, [user]);

  const clearSessionExpired = useCallback(() => {
    setSessionExpired(false);
  }, []);

  const resolveFallbackRole = useCallback((supabaseUser: SupabaseUser): AuthUser['role'] => {
    if (currentUserRef.current?.id === supabaseUser.id) {
      return currentUserRef.current.role;
    }
    return roleCacheRef.current.get(supabaseUser.id) || 'user';
  }, []);

  const checkUserRole = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser> => {
    try {
      const { data: roles, error } = await withTimeout(
        supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', supabaseUser.id),
        12000
      );

      if (error) {
        console.error('Error checking user role:', error);
        const fallbackRole = resolveFallbackRole(supabaseUser);
        return {
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          role: fallbackRole,
        };
      }

      const isAdmin = roles?.some(r => r.role === 'admin');
      const role: AuthUser['role'] = isAdmin ? 'admin' : 'user';
      roleCacheRef.current.set(supabaseUser.id, role);

      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role,
      };
    } catch (err) {
      console.error('Exception checking user role:', err);
      const fallbackRole = resolveFallbackRole(supabaseUser);
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        role: fallbackRole,
      };
    }
  }, [resolveFallbackRole]);

  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        // Check initial session with timeout
        const { data: { session } } = await withTimeout(
          supabase.auth.getSession(),
          5000
        );

        if (mounted) {
          if (session?.user) {
            const authUser = await checkUserRole(session.user);
            setUser(authUser);
          }
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Failed to get initial session:', err);
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    initializeAuth();

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      try {
        if (event === 'SIGNED_OUT' && hasUserRef.current) {
          setSessionExpired(true);
        }
        if (session?.user) {
          const authUser = await checkUserRole(session.user);
          setUser(authUser);
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error('Error in auth state change:', err);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [checkUserRole]);

  useEffect(() => {
    if (!user) return;

    const keepSessionAlive = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error || !data.session) return;
        const expiresAtMs = (data.session.expires_at || 0) * 1000;
        const remainingMs = expiresAtMs - Date.now();
        if (remainingMs < 10 * 60 * 1000) {
          await supabase.auth.refreshSession();
        }
      } catch (err) {
        console.error('Session keepalive failed:', err);
      }
    };

    const interval = window.setInterval(keepSessionAlive, 2 * 60 * 1000);
    return () => {
      window.clearInterval(interval);
    };
  }, [user]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      console.log('Attempting login for:', email);
      
      // Add timeout to login request
      const { data, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        }),
        10000
      );

      if (error) {
        const errorMsg = error.message === 'Invalid login credentials' 
          ? 'بيانات الدخول غير صحيحة' 
          : error.message;
        console.error('Login error:', errorMsg);
        return { success: false, error: errorMsg };
      }

      if (!data.user) {
        console.error('No user returned from login');
        return { success: false, error: 'فشل تسجيل الدخول' };
      }

      console.log('Login successful for user:', data.user.id);
      
      // Check role asynchronously without blocking
      checkUserRole(data.user).catch(err => {
        console.error('Failed to check user role after login:', err);
      });

      return { success: true };
    } catch (err: unknown) {
      const errorMsg = getErrorMessage(err, 'حدث خطأ');
      console.error('Login exception:', errorMsg);
      return { success: false, error: errorMsg };
    }
  }, [checkUserRole]);

  const logout = useCallback(async () => {
    try {
      hasUserRef.current = false;
      setSessionExpired(false);
      await withTimeout(supabase.auth.signOut(), 5000);
      setUser(null);
    } catch (err) {
      console.error('Logout error:', err);
      setUser(null);
    }
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await withTimeout(
        supabase.auth.updateUser({ password: newPassword }),
        10000
      );

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      return { success: false, error: getErrorMessage(err, 'حدث خطأ') };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      sessionExpired,
      clearSessionExpired,
      login,
      logout,
      changePassword,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
