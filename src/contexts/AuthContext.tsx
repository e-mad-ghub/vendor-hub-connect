import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole } from '@/types/marketplace';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const isDev = import.meta.env.DEV;

  const logAuth = (event: string, payload?: unknown) => {
    if (isDev) {
      // Dev-only trace to watch auth lifecycle transitions
      console.info(`[auth:${event}]`, payload);
    }
  };

  const login = useCallback(async (email: string, password: string) => {
    try {
      const response = await api.login(email, password);
      setUser(response.user);
      logAuth('login', { userId: response.user.id, role: response.user.role });
      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || 'فشل تسجيل الدخول' };
    }
  }, []);

  const register = useCallback(async (_email: string, _password: string, _name: string, _role: UserRole) => {
    return { success: false, error: 'التسجيل مقفول. استخدم حساب بائع أو أدمن موجود.' };
  }, []);

  const logout = useCallback(() => {
    logAuth('logout', { userId: user?.id });
    setUser(null);
    api.logout().catch(() => {});
  }, [user]);

  useEffect(() => {
    if (isDev) {
      console.info('[auth:state]', { user });
    }
  }, [isDev, user]);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      login,
      register,
      logout,
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
