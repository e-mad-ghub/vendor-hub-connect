import React from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';

const LAST_UPDATED = '31 يناير 2026';

const Terms = () => (
  <Layout>
    <Seo title="الشروط والأحكام" description="الشروط التي تحكم استخدامك لسوق الحرفيين." />
    <div className="container py-8 max-w-3xl">
      <h1 className="text-3xl font-bold mb-6">الشروط والأحكام</h1>
      <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
        <p>
          باستخدامك للمنصة، أنت توافق على هذه الشروط. يرجى قراءتها بعناية.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">1. الحساب والهوية</h2>
        <p>
          يجب أن يكون عمرك 18 سنة أو أكثر. أنت مسؤول عن الحفاظ على سرية بيانات الدخول.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">2. استخدام الخدمة</h2>
        <p>
          تلتزم بتقديم بيانات صحيحة عند الطلب. أي إساءة استخدام قد تؤدي لتعليق الحساب.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">3. البيانات والخصوصية</h2>
        <p>
          يتم جمع البيانات واستخدامها وفقًا لسياسة الخصوصية، بما في ذلك معلومات الاتصال وبيانات الطلبات.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">4. الكوكيز والتحليلات</h2>
        <p>
          قد نستخدم ملفات تعريف الارتباط لأغراض الأداء والتحليلات وتحسين التجربة.
        </p>

        <h2 className="text-xl font-semibold text-foreground mt-6">5. التواصل</h2>
        <p>
          لأي استفسار حول الشروط، تواصل معنا عبر البريد:
          <span className="font-semibold"> support@markethub.demo</span>
        </p>

        <p className="text-sm italic mt-8">آخر تحديث: {LAST_UPDATED}</p>
      </div>
    </div>
  </Layout>
);

export default Terms;
