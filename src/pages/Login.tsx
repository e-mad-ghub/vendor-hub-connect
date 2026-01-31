import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { LoadingState } from '@/components/LoadingState';
import { Seo } from '@/components/Seo';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const toastShownRef = useRef(false);

  useEffect(() => {
    if (toastShownRef.current) return;
    const state = location.state as { reason?: string } | null;
    if (state?.reason === 'expired') {
      toast.error('انتهت الجلسة، من فضلك سجّل الدخول مرة أخرى.');
      toastShownRef.current = true;
    } else if (state?.reason === 'auth') {
      toast.error('تسجيل الدخول مطلوب للوصول إلى هذه الصفحة.');
      toastShownRef.current = true;
    }
  }, [location.state]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    
    if (!loginData.email.trim() || !loginData.password.trim()) {
      toast.error('من فضلك اكتب الإيميل وكلمة السر');
      return;
    }

    setIsLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast.success('نورتنا!');
      navigate('/admin');
    } else {
      toast.error(result.error || 'فشل تسجيل الدخول');
    }
    
    setIsLoading(false);
  };

  if (authLoading) {
    return (
      <Layout>
        <Seo title="تسجيل دخول الأدمن" description="سجّل دخولك للوصول إلى لوحة الإدارة." />
        <div className="container py-12">
          <LoadingState title="جاري التحقق من الجلسة" message="برجاء الانتظار..." />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo title="تسجيل دخول الأدمن" description="سجّل دخولك للوصول إلى لوحة الإدارة." />
      <div className="container py-8 md:py-12 max-w-md mx-auto">
        <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">دخول الأدمن</h1>
            <p className="text-muted-foreground mt-1">
              الدخول متاح للأدمن فقط. العملاء مش محتاجين حساب.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="login-email">الإيميل</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-10"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="login-password">كلمة السر</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="pl-10"
                  required
                  autoComplete="current-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري تسجيل الدخول...
                </>
              ) : (
                'تسجيل دخول'
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-6">
            لو انت عميل، تقدر تستخدم الموقع وتطلب الأسعار بدون تسجيل دخول.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
