import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Store, CheckCircle, Clock } from 'lucide-react';

const VendorRegister = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, registerVendor, vendor } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ storeName: '', description: '' });

  if (vendor?.status === 'pending') {
    return (
      <Layout>
        <div className="container py-12 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <Clock className="h-16 w-16 mx-auto text-marketplace-pending mb-4" />
            <h1 className="text-2xl font-bold mb-2">طلبك قيد المراجعة</h1>
            <p className="text-muted-foreground mb-6">طلب الانضمام كبائع بيتراجع دلوقتي. هنبعتلك إشعار أول ما يتوافق عليه.</p>
            <Link to="/"><Button>رجوع للرئيسية</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (vendor?.status === 'approved') {
    return (
      <Layout>
        <div className="container py-12 max-w-lg mx-auto text-center">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <CheckCircle className="h-16 w-16 mx-auto text-marketplace-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">إنت بالفعل بائع!</h1>
            <p className="text-muted-foreground mb-6">افتح لوحة التحكم لإدارة متجرك.</p>
            <Link to="/vendor/dashboard"><Button>اذهب للوحة التحكم</Button></Link>
          </div>
        </div>
      </Layout>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('سجل الدخول الأول');
      navigate('/login');
      return;
    }
    setIsLoading(true);
    const result = await registerVendor(formData.storeName, formData.description);
    if (result.success) {
      toast.success('تم إرسال الطلب!');
    } else {
      toast.error(result.error || 'فشل الإرسال');
    }
    setIsLoading(false);
  };

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto">
        <div className="bg-card rounded-xl shadow-card p-6 md:p-8">
          <div className="text-center mb-6">
            <Store className="h-12 w-12 mx-auto text-primary mb-3" />
            <h1 className="text-2xl font-bold">انضم كبائع</h1>
            <p className="text-muted-foreground">ابدأ البيع على سوق علاء الدين النهاردة</p>
          </div>

          {!isAuthenticated && (
            <div className="bg-muted/50 p-4 rounded-lg mb-6 text-center">
              <p className="text-sm mb-2">سجل الدخول الأول عشان تكمل التسجيل كبائع</p>
              <Link to="/login"><Button size="sm">تسجيل دخول</Button></Link>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="storeName">اسم المتجر *</Label>
              <Input id="storeName" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} placeholder="اسم متجرك" required />
            </div>
            <div>
              <Label htmlFor="description">وصف المتجر *</Label>
              <Textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="احكيلنا عن متجرك..." rows={4} required />
            </div>
            <Button type="submit" className="w-full" disabled={isLoading || !isAuthenticated}>
              {isLoading ? 'جارٍ الإرسال...' : 'إرسال الطلب'}
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default VendorRegister;
