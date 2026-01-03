import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { Store, CheckCircle, Shield } from 'lucide-react';

const VendorRegister = () => {
  const { vendor } = useAuth();

  return (
    <Layout>
      <div className="container py-8 max-w-2xl mx-auto text-center">
        <div className="bg-card rounded-xl shadow-card p-8 md:p-10">
          <div className="text-center mb-6">
            <Store className="h-12 w-12 mx-auto text-primary mb-3" />
            <h1 className="text-2xl font-bold">التسجيل كبائع غير متاح</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              المنصة شغالة مع تاجر واحد متحكم فيه حاليًا. لو محتاج صلاحيات بيع، تواصل مع الأدمن عشان يفعّل حساب البائع يدويًا.
            </p>
          </div>

          <div className="bg-muted/40 border border-border rounded-xl p-6 text-start space-y-3">
            <div className="flex items-center gap-3">
              <Shield className="h-6 w-6 text-primary" />
              <p className="font-semibold">الحسابات الجديدة مقفولة</p>
            </div>
            <p className="text-sm text-muted-foreground">
              التاجر الحالي بيتحكم فيه الأدمن. أي تحديثات أو منتجات جديدة بتتم من خلال لوحة الإدارة/لوحة البائع المعتمدة فقط.
            </p>
          </div>

          {vendor?.status === 'approved' && (
            <div className="mt-6">
              <p className="text-sm text-muted-foreground mb-3">إنت بالفعل بائع مسموح ليك.</p>
              <Link to="/vendor/dashboard">
                <Button className="w-full">
                  <CheckCircle className="h-4 w-4 ml-2" />
                  افتح لوحة تحكم البائع
                </Button>
              </Link>
            </div>
          )}

          <Link to="/" className="block mt-6">
            <Button variant="outline" className="w-full">رجوع للرئيسية</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default VendorRegister;
