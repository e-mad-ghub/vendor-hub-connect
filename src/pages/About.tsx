import React from 'react';
import { Layout } from '@/components/Layout';

const About = () => (
  <Layout>
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">عن سوق علاء الدين</h1>
      <div className="prose prose-gray max-w-none">
        <p className="text-muted-foreground mb-4">سوق علاء الدين هو نموذج لسوق إلكتروني متعدد التجار بيستعرض المزايا الأساسية لأي منصة حديثة. ده تطبيق تجريبي للعرض فقط.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">مهمتنا</h2>
        <p className="text-muted-foreground mb-4">نوصل المشترين بتجار موثوقين، ونقدم تجربة تسوق سلسة بأسعار منافسة وخدمة عملاء ممتازة.</p>
        <h2 className="text-xl font-semibold mt-6 mb-3">المزايا</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>سوق متعدد التجار مع بايعين موثوقين</li>
          <li>دفع آمن وعملية شراء محمية</li>
          <li>تقييمات ومراجعات العملاء</li>
          <li>لوحة تحكم للتاجر لإدارة المتجر</li>
          <li>لوحة إدارة لمتابعة المنصة</li>
        </ul>
      </div>
    </div>
  </Layout>
);

export default About;
