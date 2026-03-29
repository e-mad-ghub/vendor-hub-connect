import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api, type CustomerServiceSettings } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';
import { getErrorMessage } from '@/lib/error';
import { splitParagraphs } from '@/lib/utils';

const Faq = () => {
  const [settings, setSettings] = useState<CustomerServiceSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCustomerServiceSettings();
      setSettings(data);
    } catch (e: unknown) {
      setLoadError(getErrorMessage(e, 'تعذر تحميل الأسئلة الشائعة.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <Layout>
      <Seo title="الأسئلة الشائعة" description="إجابات سريعة عن الطلبات والتواصل وتأكيد التوفر في سوق الحرفيين." />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">الأسئلة الشائعة</h1>
        {isLoading ? (
          <LoadingState title="جاري تحميل الأسئلة" message="برجاء الانتظار..." />
        ) : loadError ? (
          <InlineError title="تعذر تحميل الأسئلة" message={loadError} onRetry={loadSettings} />
        ) : (
          <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
            {splitParagraphs(settings?.faqContent || '').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Faq;
