import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Seo } from '@/components/Seo';

const NotAuthorized = () => {
  return (
    <Layout>
      <Seo title="غير مصرح" description="لا تملك الصلاحيات المطلوبة للوصول إلى هذه الصفحة." />
      <div className="container py-12 text-center">
        <h1 className="text-2xl font-bold mb-3">غير مصرح لك بالدخول</h1>
        <p className="text-muted-foreground mb-6">
          ليس لديك الصلاحيات المطلوبة للوصول إلى هذه الصفحة.
        </p>
        <Link to="/">
          <Button>العودة للرئيسية</Button>
        </Link>
      </div>
    </Layout>
  );
};

export default NotAuthorized;
