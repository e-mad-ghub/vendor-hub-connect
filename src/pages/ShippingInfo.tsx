import React, { useCallback, useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import { Seo } from '@/components/Seo';
import { api, type CustomerServiceSettings } from '@/lib/api';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';
import { getErrorMessage } from '@/lib/error';
import { splitParagraphs } from '@/lib/utils';

const ShippingInfo = () => {
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
      setLoadError(getErrorMessage(e, 'تعذر تحميل معلومات الشحن.'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return (
    <Layout>
      <Seo title="الشحن والتسليم" description="تعرف على طريقة الشحن والتسليم وتأكيد التوفر قبل إتمام الطلب." />
      <div className="container py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">الشحن والتسليم</h1>
        {isLoading ? (
          <LoadingState title="جاري تحميل معلومات الشحن" message="برجاء الانتظار..." />
        ) : loadError ? (
          <InlineError title="تعذر تحميل معلومات الشحن" message={loadError} onRetry={loadSettings} />
        ) : (
          <div className="prose prose-gray max-w-none text-muted-foreground space-y-4">
            {splitParagraphs(settings?.shippingInfo || '').map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ShippingInfo;
