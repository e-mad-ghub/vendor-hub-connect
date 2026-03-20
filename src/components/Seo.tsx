import React from 'react';
import { useLocation } from 'react-router-dom';

interface SeoProps {
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
  noIndex?: boolean;
}

const BRAND_NAME = 'سوق الحرفيين';

const getBaseUrl = () => {
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  if (envUrl && envUrl.trim()) {
    return envUrl.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return '';
};

const upsertMeta = (selector: string, attr: 'name' | 'property', value: string, content: string) => {
  let tag = document.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, value);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
};

const upsertLink = (selector: string, rel: string, href: string) => {
  let tag = document.querySelector<HTMLLinkElement>(selector);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute('href', href);
};

const upsertJsonLd = (id: string, schema: Record<string, unknown>) => {
  let tag = document.getElementById(id) as HTMLScriptElement | null;
  if (!tag) {
    tag = document.createElement('script');
    tag.type = 'application/ld+json';
    tag.id = id;
    document.head.appendChild(tag);
  }
  tag.text = JSON.stringify(schema);
};

export const Seo: React.FC<SeoProps> = ({ title, description, ogType = 'website', ogImage, noIndex = false }) => {
  const location = useLocation();

  React.useEffect(() => {
    const baseUrl = getBaseUrl();
    const pageTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;
    const url = baseUrl ? `${baseUrl}${location.pathname}${location.search}` : '';
    const imageUrl = ogImage || `https://www.souq-elherafyeen.com/og-default.png`;

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    upsertMeta('meta[property="og:site_name"]', 'property', 'og:site_name', BRAND_NAME);
    upsertMeta('meta[property="og:locale"]', 'property', 'og:locale', 'ar_EG');
    if (url) {
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
      upsertLink('link[rel="canonical"]', 'canonical', url);
    }
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noIndex
        ? 'noindex,nofollow'
        : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'
    );

    if (url) {
      upsertJsonLd('page-jsonld', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: pageTitle,
        description,
        url,
        inLanguage: 'ar-EG',
        isPartOf: {
          '@type': 'WebSite',
          name: BRAND_NAME,
          url: baseUrl || undefined,
        },
      });
    }
  }, [title, description, ogType, ogImage, noIndex, location.pathname, location.search]);

  return null;
};
