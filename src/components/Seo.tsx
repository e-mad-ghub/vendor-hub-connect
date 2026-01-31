import React from 'react';
import { useLocation } from 'react-router-dom';

interface SeoProps {
  title: string;
  description: string;
  ogType?: string;
  ogImage?: string;
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

export const Seo: React.FC<SeoProps> = ({ title, description, ogType = 'website', ogImage }) => {
  const location = useLocation();

  React.useEffect(() => {
    const baseUrl = getBaseUrl();
    const pageTitle = title.includes(BRAND_NAME) ? title : `${title} | ${BRAND_NAME}`;
    const url = baseUrl ? `${baseUrl}${location.pathname}${location.search}` : '';
    const imageUrl = ogImage || (baseUrl ? `${baseUrl}/og-default.svg` : '/og-default.svg');

    document.title = pageTitle;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta('meta[property="og:title"]', 'property', 'og:title', pageTitle);
    upsertMeta('meta[property="og:description"]', 'property', 'og:description', description);
    upsertMeta('meta[property="og:type"]', 'property', 'og:type', ogType);
    if (url) {
      upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    }
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', imageUrl);

    upsertMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
    upsertMeta('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    upsertMeta('meta[name="twitter:image"]', 'name', 'twitter:image', imageUrl);
  }, [title, description, ogType, ogImage, location.pathname, location.search]);

  return null;
};
