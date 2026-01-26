import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkUserRole = useCallback(async (supabaseUser: SupabaseUser): Promise<AuthUser | null> => {
    // Check if user has admin role
    const { data: roles, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id);

    if (error) {
      console.error('Error checking user role:', error);
      return null;
    }

    const isAdmin = roles?.some(r => r.role === 'admin');

    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      role: isAdmin ? 'admin' : 'user',
    };
  }, []);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const authUser = await checkUserRole(session.user);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    // Then check initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const authUser = await checkUserRole(session.user);
        setUser(authUser);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [checkUserRole]);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        return { success: false, error: error.message === 'Invalid login credentials' ? 'بيانات الدخول غير صحيحة' : error.message };
      }

      if (!data.user) {
        return { success: false, error: 'فشل تسجيل الدخول' };
      }

      // Check if user has admin role
      const authUser = await checkUserRole(data.user);
      if (!authUser || authUser.role !== 'admin') {
        await supabase.auth.signOut();
        return { success: false, error: 'الدخول متاح للأدمن فقط' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ' };
    }
  }, [checkUserRole]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const changePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'حدث خطأ' };
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
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
