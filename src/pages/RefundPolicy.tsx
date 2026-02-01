import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';

const RefundPolicy = () => {
  const [policy, setPolicy] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadPolicy = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const data = await api.getCustomerServiceSettings();
      setPolicy(data.returnPolicy);
    } catch (e: any) {
      setLoadError(e?.message || 'تعذر تحميل سياسة الاسترجاع.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPolicy();
  }, [loadPolicy]);

  return (
    <Layout>
      <Seo title="سياسة الاسترجاع" description="تعرف على سياسة الاسترجاع والرد في سوق الحرفيين." />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">سياسة الاسترجاع</h1>
        {isLoading ? (
          <LoadingState title="جاري تحميل السياسة" message="برجاء الانتظار..." />
        ) : loadError ? (
          <InlineError title="تعذر تحميل السياسة" message={loadError} onRetry={loadPolicy} />
        ) : (
          <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
            {policy.split('\n\n').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};
export default RefundPolicy;
