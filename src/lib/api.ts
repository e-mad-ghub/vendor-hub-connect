const STORAGE_KEY = 'vhc_frontend_settings';
const REQUESTS_KEY = 'vhc_quote_requests';
const CUSTOMER_SERVICE_KEY = 'vhc_customer_service_settings';

type WhatsAppSettings = { phoneNumber: string };
type QuoteRequest = {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: Array<{ productId: string; title: string; quantity: number; quality?: 'new' | 'imported'; unitPrice?: number; image: string }>;
  status: 'pending' | 'cancelled' | 'followed_up';
  createdAt: string;
};

type CustomerServiceSettings = {
  supportEmail: string;
  supportPhone: string;
  supportAddress: string;
  faqContent: string;
  shippingInfo: string;
  returnPolicy: string;
  lastUpdated: string;
};

const defaultSettings: WhatsAppSettings = {
  phoneNumber: '201000000000',
};

const defaultCustomerServiceSettings: CustomerServiceSettings = {
  supportEmail: 'support@souq-elherafyeen.com',
  supportPhone: '+1 (555) 123-4567',
  supportAddress: '123 Market Street, Demo City',
  faqContent: 'لو عندك أي سؤال، تقدر تبعتلنا رسالة وسنرد عليك في أقرب وقت.',
  shippingInfo: 'الشحن يتم بعد تأكيد العرض والتوافر عبر واتساب.',
  returnPolicy: [
    'همنا تكون راضي تمامًا عن مشترياتك.',
    'استرجاع خلال ٣٠ يوم من الاستلام لمعظم المنتجات.',
    'ابدأ الاسترجاع بالتواصل معنا عبر خدمة العملاء.',
    'يتم رد المبلغ خلال ٥-٧ أيام عمل بعد استلام المنتج.',
  ].join('\n\n'),
  lastUpdated: '31 يناير 2026',
};

const loadSettings = (): WhatsAppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...defaultSettings, ...(JSON.parse(raw) as WhatsAppSettings) } : defaultSettings;
  } catch {
    return defaultSettings;
  }
};

const saveSettings = (settings: WhatsAppSettings) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
};

const loadRequests = (): QuoteRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_KEY);
    const parsed = raw ? (JSON.parse(raw) as QuoteRequest[]) : [];
    return parsed.map((req) => ({
      ...req,
      status: req.status || 'pending',
    }));
  } catch {
    return [];
  }
};

const saveRequests = (requests: QuoteRequest[]) => {
  localStorage.setItem(REQUESTS_KEY, JSON.stringify(requests));
};

const loadCustomerServiceSettings = (): CustomerServiceSettings => {
  try {
    const raw = localStorage.getItem(CUSTOMER_SERVICE_KEY);
    return raw
      ? { ...defaultCustomerServiceSettings, ...(JSON.parse(raw) as CustomerServiceSettings) }
      : defaultCustomerServiceSettings;
  } catch {
    return defaultCustomerServiceSettings;
  }
};

const saveCustomerServiceSettings = (settings: CustomerServiceSettings) => {
  localStorage.setItem(CUSTOMER_SERVICE_KEY, JSON.stringify(settings));
};

export const api = {
  getWhatsAppSettings: async (): Promise<WhatsAppSettings> => loadSettings(),
  updateWhatsAppSettings: async (payload: WhatsAppSettings): Promise<WhatsAppSettings> => {
    const next = { ...defaultSettings, ...payload };
    saveSettings(next);
    return next;
  },
  getCustomerServiceSettings: async (): Promise<CustomerServiceSettings> => loadCustomerServiceSettings(),
  updateCustomerServiceSettings: async (payload: CustomerServiceSettings): Promise<CustomerServiceSettings> => {
    const next = { ...defaultCustomerServiceSettings, ...payload };
    saveCustomerServiceSettings(next);
    return next;
  },
  listQuoteRequests: async (): Promise<QuoteRequest[]> => loadRequests(),
  createQuoteRequest: async (payload: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>): Promise<QuoteRequest> => {
    const next: QuoteRequest = {
      ...payload,
      id: `qr_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    const current = loadRequests();
    current.unshift(next);
    saveRequests(current);
    return next;
  },
  updateQuoteRequestStatus: async (id: string, status: QuoteRequest['status']): Promise<QuoteRequest | null> => {
    const current = loadRequests();
    const next = current.map((req) => (req.id === id ? { ...req, status } : req));
    saveRequests(next);
    return next.find((req) => req.id === id) || null;
  },
};
