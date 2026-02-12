import React from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';

const LAST_UPDATED = '31 يناير 2026';

const Privacy = () => (
  <Layout>
    <Seo title="سياسة الخصوصية" description="تعرف على كيفية جمع واستخدام بياناتك في سوق الحرفيين." />
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">سياسة الخصوصية</h1>
      <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
        <p>
          خصوصيتك تهمنا. توضح هذه السياسة أنواع البيانات التي نجمعها وكيفية استخدامها وحمايتها.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">البيانات التي نجمعها</h2>
        <p>
          نجمع البيانات التي تقدمها لنا مباشرة مثل الاسم ورقم الهاتف والبريد الإلكتروني، بالإضافة إلى
          تفاصيل الطلبات ورسائل الدعم.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">كيفية استخدام البيانات</h2>
        <p>
          نستخدم البيانات لمعالجة الطلبات، التواصل معك، تحسين تجربة المستخدم، والامتثال للمتطلبات القانونية.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">الكوكيز والتحليلات</h2>
        <p>
          قد نستخدم ملفات تعريف الارتباط وتقنيات مشابهة لتحسين الأداء وتقديم تجربة أفضل. يمكنك تعطيل الكوكيز
          من إعدادات المتصفح.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">مشاركة البيانات</h2>
        <p>
          لا نبيع بياناتك. قد نشاركها مع مزودي الخدمات فقط عند الحاجة لتقديم الخدمة وبأقل قدر ممكن.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">التواصل</h2>
        <p>
          لو عندك أي استفسار بخصوص الخصوصية، تواصل معنا عبر البريد:
          <span className="font-semibold"> support@souq-elherafyeen.com</span>
        </p>

        <p className="text-sm italic mt-8">آخر تحديث: {LAST_UPDATED}</p>
      </div>
    </div>
  </Layout>
);

export default Privacy;
