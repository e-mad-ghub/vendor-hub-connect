import React from 'react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { shouldEnableAnalytics } from '@/lib/analytics';

export const AppSpeedInsights = () => {
  if (!shouldEnableAnalytics()) return null;

  return <SpeedInsights />;
};
