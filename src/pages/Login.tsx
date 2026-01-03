import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [loginData, setLoginData] = useState({ email: '', password: '' });

  const demoAccounts = [
    { label: 'بائع', email: 'techhub@vendor.com' },
    { label: 'أدمن', email: 'admin@marketplace.com' },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(loginData.email, loginData.password);
    
    if (result.success) {
      toast.success('نورتنا!');
      navigate('/');
    } else {
      toast.error(result.error || 'فشل تسجيل الدخول');
    }
    
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-md mx-auto">
        <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold">أهلا بيك في سوق الحرفيين</h1>
            <p className="text-muted-foreground mt-1">
              الدخول متاح للبائع أو الأدمن فقط. العملاء مش محتاجين حساب.
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
                  placeholder="example@email.com"
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="pl-10"
                  required
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
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل دخول'}
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-border">
            <p className="text-sm font-medium mb-3 text-center">حسابات تجريبية للبائع/الأدمن</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map((acct) => (
                <Button
                  key={acct.email}
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setLoginData({ email: acct.email, password: 'password' })}
                >
                  {acct.label} ({acct.email})
                </Button>
              ))}
            </div>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-4">
            لو انت عميل، تقدر تستخدم الموقع وتطلب الأسعار بدون تسجيل دخول.
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Login;
