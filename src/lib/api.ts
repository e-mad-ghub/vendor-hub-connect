const STORAGE_KEY = 'vhc_frontend_settings';
const REQUESTS_KEY = 'vhc_quote_requests';

type WhatsAppSettings = { phoneNumber: string };
type QuoteRequest = {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: Array<{ productId: string; title: string; quantity: number; price: number; image: string }>;
  status: 'pending' | 'cancelled' | 'followed_up';
  createdAt: string;
};

const defaultSettings: WhatsAppSettings = {
  phoneNumber: '201000000000',
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

export const api = {
  getWhatsAppSettings: async (): Promise<WhatsAppSettings> => loadSettings(),
  updateWhatsAppSettings: async (payload: WhatsAppSettings): Promise<WhatsAppSettings> => {
    const next = { ...defaultSettings, ...payload };
    saveSettings(next);
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
