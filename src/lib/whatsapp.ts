const WHATSAPP_PHONE_CACHE_KEY = 'vhc-whatsapp-phone-digits';

export const sanitizeWhatsAppPhone = (value: string) => value.replace(/\D/g, '');

export const getCachedWhatsAppPhoneDigits = () => {
  if (typeof window === 'undefined') return '';
  return sanitizeWhatsAppPhone(window.localStorage.getItem(WHATSAPP_PHONE_CACHE_KEY) || '');
};

export const setCachedWhatsAppPhoneDigits = (phoneDigits: string) => {
  if (typeof window === 'undefined') return;
  if (!phoneDigits) return;
  window.localStorage.setItem(WHATSAPP_PHONE_CACHE_KEY, phoneDigits);
};

export const resolveWhatsAppPhoneDigits = async (
  getSettings: () => Promise<{ phoneNumber: string }>
) => {
  const cached = getCachedWhatsAppPhoneDigits();
  if (cached) return cached;

  const settings = await getSettings();
  const digits = sanitizeWhatsAppPhone(settings.phoneNumber);
  if (digits) {
    setCachedWhatsAppPhoneDigits(digits);
  }
  return digits;
};

export const preloadWhatsAppPhoneDigits = async (
  getSettings: () => Promise<{ phoneNumber: string }>
) => {
  try {
    const settings = await getSettings();
    const digits = sanitizeWhatsAppPhone(settings.phoneNumber);
    if (digits) {
      setCachedWhatsAppPhoneDigits(digits);
    }
    return digits;
  } catch {
    return '';
  }
};

export const openWhatsAppChat = (phoneDigits: string, message: string) => {
  const encodedMessage = encodeURIComponent(message);
  const webUrl = `https://wa.me/${phoneDigits}?text=${encodedMessage}`;
  const appUrl = `whatsapp://send?phone=${phoneDigits}&text=${encodedMessage}`;
  const isMobile =
    /Android|iPhone|iPad|iPod|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (!isMobile) {
    window.location.href = webUrl;
    return;
  }

  window.location.href = appUrl;
  window.setTimeout(() => {
    if (document.visibilityState === 'visible') {
      window.location.href = webUrl;
    }
  }, 700);
};
