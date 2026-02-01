import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';

const Terms = () => {
  const [supportEmail, setSupportEmail] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCustomerServiceSettings();
      setSupportEmail(data.supportEmail);
      setLastUpdated(data.lastUpdated);
    } catch (e: any) {
      setLoadError(e?.message || 'تعذر تحميل بيانات التواصل.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <Layout>
      <Seo title="الشروط والأحكام" description="الشروط التي تحكم استخدامك لسوق الحرفيين." />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">الشروط والأحكام</h1>
        {isLoading ? (
          <LoadingState title="جاري تحميل الشروط" message="برجاء الانتظار..." />
        ) : loadError ? (
          <InlineError title="تعذر تحميل الشروط" message={loadError} onRetry={loadSettings} />
        ) : (
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
              <span className="font-semibold"> {supportEmail}</span>
            </p>

            <p className="text-sm italic mt-8">آخر تحديث: {lastUpdated}</p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Terms;
