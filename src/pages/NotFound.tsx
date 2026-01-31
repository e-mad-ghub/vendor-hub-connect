import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.error("404 Error: User attempted to access non-existent route:", location.pathname);
    }
  }, [location.pathname]);

  return (
    <Layout>
      <Seo title="الصفحة غير موجودة" description="الصفحة المطلوبة غير متاحة." />
      <div className="container py-16 text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">عفوًا! الصفحة مش موجودة</p>
        <Link to="/" className="text-primary underline hover:text-primary/90">
          الرجوع للرئيسية
        </Link>
      </div>
    </Layout>
  );
};

export default NotFound;
