import React from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';

const About = () => (
  <Layout>
    <Seo title="عن سوق الحرفيين" description="تعرف على قصتنا ومميزات سوق الحرفيين." />
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">عن سوق الحرفيين</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-4">سوق الحرفيين هو نموذج لمتجر بائع واحد بيعتمد على طلبات عروض سعر عبر واتساب. ده تطبيق تجريبي للعرض فقط.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">مهمتنا</h2>
        <p className="text-muted-foreground mb-4">نوفر للعميل تجربة تسوق سهلة مع تأكيد يدوي للسعر والتوافر عبر واتساب، وخدمة عملاء سريعة.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">المزايا</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>متجر بائع واحد بفريق موحد</li>
          <li>طلب عرض سعر سريع عبر واتساب</li>
          <li>تقييمات ومراجعات العملاء</li>
          <li>لوحة إدارة لمتابعة طلبات عروض السعر</li>
        </ul>
      </div>
    </div>
  </Layout>
);

export default About;
