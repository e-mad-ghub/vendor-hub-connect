import React from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
    __vhcAdsScriptLoaded?: boolean;
    __vhcAdsScriptLoading?: boolean;
  }
}

const ADS_ENABLED = import.meta.env.VITE_ENABLE_ADS === 'true';
const ADS_DEMO = import.meta.env.VITE_ENABLE_ADS_DEMO === 'true';
const ADSENSE_CLIENT = (import.meta.env.VITE_ADSENSE_CLIENT || '').trim();
const ADS_SCRIPT_ID = 'vhc-adsense-script';

type AdSlotProps = {
  slot: string;
  className?: string;
  minHeight?: number;
};

const ensureAdSenseScript = async () => {
  if (!ADS_ENABLED || !ADSENSE_CLIENT) return false;
  if (window.__vhcAdsScriptLoaded) return true;

  const existing = document.getElementById(ADS_SCRIPT_ID) as HTMLScriptElement | null;
  if (existing) {
    if (window.__vhcAdsScriptLoading) {
      await new Promise<void>((resolve) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => resolve(), { once: true });
      });
    }
    return !!window.__vhcAdsScriptLoaded;
  }

  window.__vhcAdsScriptLoading = true;

  await new Promise<void>((resolve) => {
    const script = document.createElement('script');
    script.id = ADS_SCRIPT_ID;
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(ADSENSE_CLIENT)}`;
    script.crossOrigin = 'anonymous';
    script.onload = () => {
      window.__vhcAdsScriptLoaded = true;
      window.__vhcAdsScriptLoading = false;
      resolve();
    };
    script.onerror = () => {
      window.__vhcAdsScriptLoaded = false;
      window.__vhcAdsScriptLoading = false;
      resolve();
    };
    document.head.appendChild(script);
  });

  return !!window.__vhcAdsScriptLoaded;
};

export const AdSlot: React.FC<AdSlotProps> = ({ slot, className = '', minHeight = 120 }) => {
  const adRef = React.useRef<HTMLModElement | null>(null);

  React.useEffect(() => {
    let active = true;

    const mountAd = async () => {
      if (!ADS_ENABLED || !ADSENSE_CLIENT || !slot || !adRef.current) return;
      const loaded = await ensureAdSenseScript();
      if (!loaded || !active || !adRef.current) return;

      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch {
        // Ignore repeated/late mount errors from AdSense runtime.
      }
    };

    void mountAd();
    return () => {
      active = false;
    };
  }, [slot]);

  if (!ADS_ENABLED) return null;

  if (!ADSENSE_CLIENT || !slot) {
    if (!ADS_DEMO) return null;
    return (
      <div
        className={`rounded-xl border border-dashed border-border bg-muted/40 px-4 py-5 text-center text-xs text-muted-foreground ${className}`}
        style={{ minHeight }}
      >
        مساحة إعلانية تجريبية
      </div>
    );
  }

  return (
    <div className={className}>
      <ins
        ref={adRef}
        className="adsbygoogle block overflow-hidden rounded-xl border border-border/60 bg-card"
        style={{ minHeight }}
        data-ad-client={ADSENSE_CLIENT}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
};
