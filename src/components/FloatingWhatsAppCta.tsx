import React from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import { getErrorMessage } from '@/lib/error';

const STORAGE_KEY = 'vhc-whatsapp-float-top';
const WHATSAPP_PHONE_CACHE_KEY = 'vhc-whatsapp-phone-digits';
const MOBILE_BREAKPOINT = 768;
const MOBILE_BOTTOM_OFFSET = 104;
const DESKTOP_BOTTOM_OFFSET = 28;
const EDGE_GAP = 8;
const DRAG_THRESHOLD = 6;
const DRAG_RESISTANCE = 0.35;
const REBOUND_DURATION_MS = 260;

const shouldHideOnPath = (pathname: string) =>
  pathname === '/login' || pathname === '/not-authorized' || pathname.startsWith('/admin');

const buildDirectWhatsAppTemplate = () => [
  'مرحبًا فريق سوق الحرفيين، محتاج مساعدة في قطعة غيار.',
  '',
  'من فضلكم ساعدوني في البيانات دي:',
  '• اسم القطعة: [اكتب اسم القطعة]',
  '• نوع العربية: [اكتب النوع]',
  '• الموديل: [اكتب الموديل]',
  '• سنة الصنع: [اكتب السنة]',
  '• تفاصيل إضافية: [أي ملاحظة مهمة]',
].join('\n');

const openWhatsAppChat = (phoneDigits: string, message: string) => {
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

export const FloatingWhatsAppCta: React.FC = () => {
  const { pathname } = useLocation();
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const draggingRef = React.useRef(false);
  const dragMovedRef = React.useRef(false);
  const dragPointerIdRef = React.useRef<number | null>(null);
  const reboundTimerRef = React.useRef<number | null>(null);
  const reboundTargetTopRef = React.useRef<number | null>(null);
  const dragStartedOnButtonRef = React.useRef(false);
  const dragOffsetRef = React.useRef({ x: 0, y: 0 });
  const openInFlightRef = React.useRef(false);
  const dragStartXRef = React.useRef(0);
  const dragStartYRef = React.useRef(0);
  const startTopRef = React.useRef(0);
  const [topPx, setTopPx] = React.useState<number | null>(null);
  const [dragOffset, setDragOffset] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isRebounding, setIsRebounding] = React.useState(false);
  const [isOpening, setIsOpening] = React.useState(false);
  const [cachedPhoneDigits, setCachedPhoneDigits] = React.useState('');

  const setDragOffsetWithRef = React.useCallback((next: { x: number; y: number }) => {
    dragOffsetRef.current = next;
    setDragOffset(next);
  }, []);

  const getViewportHeight = React.useCallback(() => {
    if (typeof window === 'undefined') return 0;
    return window.visualViewport?.height ?? window.innerHeight;
  }, []);

  const getTopBounds = React.useCallback(() => {
    const minTop = EDGE_GAP;
    const height = rootRef.current?.offsetHeight ?? 80;
    const maxTop = Math.max(minTop, getViewportHeight() - height - EDGE_GAP);
    return { minTop, maxTop };
  }, [getViewportHeight]);

  const applyVerticalResistance = React.useCallback((rawTop: number) => {
    const { minTop, maxTop } = getTopBounds();

    if (rawTop < minTop) {
      return minTop + (rawTop - minTop) * DRAG_RESISTANCE;
    }

    if (rawTop > maxTop) {
      return maxTop + (rawTop - maxTop) * DRAG_RESISTANCE;
    }

    return rawTop;
  }, [getTopBounds]);

  const clampTop = React.useCallback((candidate: number) => {
    const { minTop, maxTop } = getTopBounds();
    return Math.min(Math.max(candidate, minTop), maxTop);
  }, [getTopBounds]);

  const getDefaultTop = React.useCallback(() => {
    const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
    const bottomOffset = isMobile ? MOBILE_BOTTOM_OFFSET : DESKTOP_BOTTOM_OFFSET;
    const height = rootRef.current?.offsetHeight ?? 80;
    return clampTop(getViewportHeight() - bottomOffset - height);
  }, [clampTop, getViewportHeight]);

  React.useEffect(() => {
    const init = () => {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      const parsed = raw ? Number(raw) : Number.NaN;
      if (Number.isFinite(parsed)) {
        setTopPx(clampTop(parsed));
      } else {
        setTopPx(getDefaultTop());
      }
    };

    const raf = window.requestAnimationFrame(init);
    return () => window.cancelAnimationFrame(raf);
  }, [clampTop, getDefaultTop]);

  React.useEffect(() => {
    if (topPx === null) return;
    window.localStorage.setItem(STORAGE_KEY, String(topPx));
  }, [topPx]);

  React.useEffect(() => {
    const cached = window.localStorage.getItem(WHATSAPP_PHONE_CACHE_KEY) || '';
    if (cached) {
      setCachedPhoneDigits(cached.replace(/\D/g, ''));
    }
  }, []);

  React.useEffect(() => {
    let isActive = true;

    const preloadWhatsAppPhone = async () => {
      try {
        const settings = await api.getWhatsAppSettings();
        const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
        if (!phoneDigits || !isActive) return;
        setCachedPhoneDigits(phoneDigits);
        window.localStorage.setItem(WHATSAPP_PHONE_CACHE_KEY, phoneDigits);
      } catch {
        // Keep silent: this is a non-blocking prefetch path.
      }
    };

    void preloadWhatsAppPhone();
    return () => {
      isActive = false;
    };
  }, []);

  React.useEffect(() => {
    if (topPx === null) return;
    const onResize = () => setTopPx((current) => (current === null ? null : clampTop(current)));
    window.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('resize', onResize);
    window.visualViewport?.addEventListener('scroll', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('resize', onResize);
      window.visualViewport?.removeEventListener('scroll', onResize);
    };
  }, [clampTop, topPx]);

  React.useEffect(() => () => {
    if (reboundTimerRef.current !== null) {
      window.clearTimeout(reboundTimerRef.current);
    }
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (topPx === null) return;
    const target = event.target as HTMLElement | null;
    dragStartedOnButtonRef.current = !!target?.closest('[data-whatsapp-cta-button="true"]');
    if (reboundTimerRef.current !== null) {
      window.clearTimeout(reboundTimerRef.current);
      reboundTimerRef.current = null;
    }
    reboundTargetTopRef.current = null;
    setIsRebounding(false);
    setIsDragging(true);
    draggingRef.current = true;
    dragMovedRef.current = false;
    dragPointerIdRef.current = event.pointerId;
    dragStartXRef.current = event.clientX;
    dragStartYRef.current = event.clientY;
    startTopRef.current = topPx;
    setDragOffsetWithRef({ x: 0, y: 0 });
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    if (dragPointerIdRef.current !== event.pointerId) return;
    const deltaX = event.clientX - dragStartXRef.current;
    const deltaY = event.clientY - dragStartYRef.current;
    const dragDistance = Math.hypot(deltaX, deltaY);
    if (dragDistance > DRAG_THRESHOLD) {
      dragMovedRef.current = true;
    }
    const rawTop = startTopRef.current + deltaY;
    const softenedTop = applyVerticalResistance(rawTop);
    setDragOffsetWithRef({ x: deltaX, y: softenedTop - startTopRef.current });
  };

  const onPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragPointerIdRef.current !== event.pointerId) return;
    draggingRef.current = false;
    setIsDragging(false);
    dragPointerIdRef.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    const releaseDeltaX = event.clientX - dragStartXRef.current;
    const releaseDeltaY = event.clientY - dragStartYRef.current;
    const releaseRawTop = startTopRef.current + releaseDeltaY;
    const releaseSoftenedTop = applyVerticalResistance(releaseRawTop);
    const releaseOffset = {
      x: releaseDeltaX,
      y: releaseSoftenedTop - startTopRef.current,
    };

    const currentVisualTop = releaseSoftenedTop;
    const targetTop = clampTop(currentVisualTop);
    const endOffsetY = targetTop - startTopRef.current;

    reboundTargetTopRef.current = targetTop;
    setDragOffsetWithRef(releaseOffset);
    setIsRebounding(true);
    window.requestAnimationFrame(() => {
      setDragOffsetWithRef({ x: 0, y: endOffsetY });
    });

    reboundTimerRef.current = window.setTimeout(() => {
      setIsRebounding(false);
      const pendingTop = reboundTargetTopRef.current;
      if (pendingTop !== null) {
        setTopPx(pendingTop);
      }
      reboundTargetTopRef.current = null;
      setDragOffsetWithRef({ x: 0, y: 0 });
      reboundTimerRef.current = null;
    }, REBOUND_DURATION_MS);

    if (!dragMovedRef.current && dragStartedOnButtonRef.current) {
      void handleOpenWhatsApp();
    }

    dragStartedOnButtonRef.current = false;
  };

  const handleOpenWhatsApp = async () => {
    if (openInFlightRef.current || isOpening) return;
    openInFlightRef.current = true;
    setIsOpening(true);

    try {
      let phoneDigits = cachedPhoneDigits;
      if (!phoneDigits) {
        const settings = await api.getWhatsAppSettings();
        phoneDigits = settings.phoneNumber.replace(/\D/g, '');
        if (phoneDigits) {
          setCachedPhoneDigits(phoneDigits);
          window.localStorage.setItem(WHATSAPP_PHONE_CACHE_KEY, phoneDigits);
        }
      }
      if (!phoneDigits) {
        toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
        return;
      }

      const message = buildDirectWhatsAppTemplate();
      const requestPayload = {
        customerName: 'زائر الموقع - واتساب مباشر',
        customerPhone: 'غير محدد',
        message: `طلب مباشر عبر زر واتساب\nالمسار: ${pathname}\n\n${message}`,
        items: [
          {
            productId: 'direct-whatsapp-request',
            title: 'طلب مباشر عبر واتساب',
            quantity: 1,
            image: '',
          },
        ],
      };

      void api.createQuoteRequest(requestPayload).catch((error: unknown) => {
        console.error('Failed to track floating WhatsApp request:', error);
      });

      openWhatsAppChat(phoneDigits, message);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, 'تعذر فتح واتساب'));
    } finally {
      openInFlightRef.current = false;
      setIsOpening(false);
    }
  };

  if (shouldHideOnPath(pathname) || topPx === null) {
    return null;
  }

  return (
    <div
      ref={rootRef}
      className="fixed right-2 md:right-4 z-[60] select-none cursor-grab active:cursor-grabbing touch-none"
      style={{
        top: `${topPx}px`,
        transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0)`,
        transition: isDragging || !isRebounding
          ? 'none'
          : `transform ${REBOUND_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`,
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <p className="mb-1.5 mr-1 block max-w-32 md:max-w-36 rounded-full border border-border/70 bg-card/80 px-2 py-1 text-[10px] md:text-[11px] text-foreground shadow-card backdrop-blur-sm pointer-events-none text-right">
        اسأل خبراءنا مباشرة
      </p>

      <button
        type="button"
        onClick={() => {
          void handleOpenWhatsApp();
        }}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            void handleOpenWhatsApp();
          }
        }}
        className="h-12 w-12 md:h-14 md:w-14 rounded-full bg-[#25D366]/95 text-white shadow-card hover:brightness-95 active:scale-95 transition"
        aria-label="تواصل عبر واتساب"
        title="تواصل عبر واتساب"
        data-whatsapp-cta-button="true"
      >
        <span className="sr-only">تواصل عبر واتساب</span>
        <svg viewBox="0 0 24 24" className="mx-auto h-6 w-6 md:h-7 md:w-7 fill-current" aria-hidden="true">
          <path d="M19.05 4.94A9.9 9.9 0 0 0 12.02 2C6.5 2 2 6.5 2 12.02c0 1.76.46 3.48 1.34 5L2 22l5.14-1.31a10 10 0 0 0 4.88 1.25h.01c5.52 0 10.02-4.5 10.02-10.02 0-2.68-1.04-5.2-3-7zM12.03 20.2h-.01a8.2 8.2 0 0 1-4.18-1.15l-.3-.18-3.05.78.82-2.98-.2-.31a8.16 8.16 0 0 1-1.25-4.34C3.86 7.5 7.52 3.84 12.03 3.84c2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 0 1 2.39 5.78c0 4.51-3.66 8.19-8.16 8.19zm4.48-6.12c-.25-.13-1.48-.73-1.71-.81-.23-.08-.4-.13-.56.13-.17.25-.65.81-.8.98-.15.17-.3.19-.55.06-.25-.13-1.07-.39-2.03-1.24-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.38.11-.5.11-.1.25-.27.38-.4.13-.13.17-.23.25-.38.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.86-.2-.48-.41-.42-.56-.42h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.02 2.61.13.17 1.78 2.72 4.31 3.81.6.27 1.08.43 1.45.55.61.19 1.17.16 1.62.1.49-.08 1.48-.6 1.69-1.18.21-.58.21-1.08.15-1.18-.06-.1-.23-.16-.48-.29z" />
        </svg>
      </button>
    </div>
  );
};
