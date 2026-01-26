import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Lock, Key, Loader2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

const SetupAdmin = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    setupKey: '',
  });

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();

    const hasEmail = !!formData.email.trim();
    const hasPassword = !!formData.password.trim();

    if (!formData.setupKey.trim()) {
      toast.error('من فضلك ادخل مفتاح الإعداد');
      return;
    }

    if ((hasEmail && !hasPassword) || (!hasEmail && hasPassword)) {
      toast.error('الإيميل وكلمة السر لازم يكونوا مع بعض');
      return;
    }

    if (hasPassword && formData.password.length < 6) {
      toast.error('كلمة السر لازم تكون 6 حروف على الأقل');
      return;
    }

    if (hasPassword && formData.password !== formData.confirmPassword) {
      toast.error('كلمتين السر مش متطابقين');
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('setup-admin', {
        body: {
          email: formData.email.trim(),
          password: formData.password,
          setupKey: formData.setupKey.trim(),
        },
      });

      if (error) {
        toast.error(error.message || 'فشل إنشاء الحساب');
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      toast.success('تم إنشاء حساب الأدمن بنجاح! سجل دخول الآن');
      navigate('/login');
    } catch (err: any) {
      toast.error(err.message || 'حدث خطأ');
    }

    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 max-w-md mx-auto">
        <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
          <div className="text-center mb-6">
            <ShieldCheck className="h-12 w-12 text-primary mx-auto mb-3" />
            <h1 className="text-2xl font-bold">إعداد حساب الأدمن</h1>
            <p className="text-muted-foreground mt-1">
              أنشئ أول حساب أدمن للموقع
            </p>
          </div>

          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <Label htmlFor="setup-key">مفتاح الإعداد</Label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="setup-key"
                  type="password"
                  placeholder="مفتاح الإعداد السري"
                  value={formData.setupKey}
                  onChange={(e) => setFormData({ ...formData, setupKey: e.target.value })}
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                المفتاح الافتراضي: setup-first-admin-2024
              </p>
            </div>

            <div>
              <Label htmlFor="admin-email">إيميل الأدمن (اختياري)</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="pl-10"
                  autoComplete="email"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                اتركه فارغًا لو الإيميل متخزن في السيرفر.
              </p>
            </div>

            <div>
              <Label htmlFor="admin-password">كلمة السر (اختيارية)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="pl-10"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                6 حروف على الأقل. اتركها فارغة لو كلمة السر متخزنة في السيرفر.
              </p>
            </div>

            <div>
              <Label htmlFor="confirm-password">تأكيد كلمة السر (اختياري)</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="pl-10"
                  minLength={6}
                  autoComplete="new-password"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  جاري الإنشاء...
                </>
              ) : (
                'إنشاء حساب الأدمن'
              )}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SetupAdmin;
