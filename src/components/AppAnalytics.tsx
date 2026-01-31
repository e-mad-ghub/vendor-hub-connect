import React from 'react';
import { Analytics } from '@vercel/analytics/react';
import { shouldEnableAnalytics } from '@/lib/analytics';

export const AppAnalytics = () => {
  if (!shouldEnableAnalytics()) return null;

  return (
    <Analytics
      mode="production"
      beforeSend={(event) => (shouldEnableAnalytics() ? event : null)}
    />
  );
};
