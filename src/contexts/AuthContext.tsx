import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, UserRole, Vendor } from '@/types/marketplace';
import { vendors } from '@/data/mockData';
import { api } from '@/lib/api';

interface AuthContextType {
  user: User | null;
  vendor: Vendor | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  registerVendor: (storeName: string, description: string) => Promise<{ success: boolean; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [vendor, setVendor] = useState<Vendor | null>(null);
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
      if (response.vendor) setVendor(response.vendor);
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
    setVendor(null);
    api.logout().catch(() => {});
  }, [user]);

  const registerVendor = useCallback(async (storeName: string, description: string) => {
    logAuth('registerVendor:block');
    return { success: false, error: 'التسجيل للبائعين مغلق - تواصل مع الأدمن لو محتاج صلاحية' };
  }, [user]);

  useEffect(() => {
    if (isDev) {
      console.info('[auth:state]', { user, vendor });
    }
  }, [isDev, user, vendor]);

  return (
    <AuthContext.Provider value={{
      user,
      vendor,
      isAuthenticated: !!user,
      login,
      register,
      logout,
      registerVendor,
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
