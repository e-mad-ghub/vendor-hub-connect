import { track } from '@vercel/analytics/react';

const isDntEnabled = () => {
  if (typeof navigator === 'undefined') return false;
  const dnt = navigator.doNotTrack || (window as unknown as { doNotTrack?: string }).doNotTrack;
  return dnt === '1' || dnt === 'yes';
};

export const trackEvent = (name: string, properties?: Record<string, string | number | boolean | null>) => {
  if (!import.meta.env.PROD) return;
  if (isDntEnabled()) return;
  track(name, properties);
};

export const shouldEnableAnalytics = () => {
  if (!import.meta.env.PROD) return false;
  if (typeof navigator === 'undefined') return false;
  return !isDntEnabled();
};
