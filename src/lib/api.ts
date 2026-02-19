import { supabase } from '@/integrations/supabase/client';
import { defaultBrandOptions, translateBrandOptions, type BrandOption } from '@/data/brandOptions';

const WHATSAPP_SETTINGS_DB_KEY = 'whatsapp_settings';
const CUSTOMER_SERVICE_SETTINGS_DB_KEY = 'customer_service_settings';
const BRAND_OPTIONS_DB_KEY = 'brand_options';

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

const readSettingFromDb = async <T extends Record<string, unknown>>(
  key: string,
  defaults: T,
): Promise<T> => {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value_json')
    .eq('key', key)
    .maybeSingle();

  if (error) throw error;

  const rawValue = data?.value_json;
  if (rawValue && typeof rawValue === 'object' && !Array.isArray(rawValue)) {
    return { ...defaults, ...(rawValue as Partial<T>) };
  }

  return defaults;
};

const writeSettingToDb = async <T extends Record<string, unknown>>(
  key: string,
  payload: T,
  defaults: T,
): Promise<T> => {
  const next = { ...defaults, ...payload };
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value_json: next }, { onConflict: 'key' });

  if (error) throw error;
  return next;
};

export const api = {
  getWhatsAppSettings: async (): Promise<WhatsAppSettings> =>
    readSettingFromDb(WHATSAPP_SETTINGS_DB_KEY, defaultSettings),
  updateWhatsAppSettings: async (payload: WhatsAppSettings): Promise<WhatsAppSettings> => {
    return writeSettingToDb(WHATSAPP_SETTINGS_DB_KEY, payload, defaultSettings);
  },
  getCustomerServiceSettings: async (): Promise<CustomerServiceSettings> =>
    readSettingFromDb(CUSTOMER_SERVICE_SETTINGS_DB_KEY, defaultCustomerServiceSettings),
  updateCustomerServiceSettings: async (payload: CustomerServiceSettings): Promise<CustomerServiceSettings> => {
    return writeSettingToDb(
      CUSTOMER_SERVICE_SETTINGS_DB_KEY,
      payload,
      defaultCustomerServiceSettings,
    );
  },
  getBrandOptions: async (): Promise<BrandOption[]> => {
    const { data, error } = await supabase
      .from('app_settings')
      .select('value_json')
      .eq('key', BRAND_OPTIONS_DB_KEY)
      .maybeSingle();

    if (error) throw error;

    const value = data?.value_json;
    if (Array.isArray(value)) {
      return translateBrandOptions(value as BrandOption[]);
    }

    return defaultBrandOptions;
  },
  updateBrandOptions: async (options: BrandOption[]): Promise<BrandOption[]> => {
    const sanitized = translateBrandOptions(options);
    const { error } = await supabase
      .from('app_settings')
      .upsert({ key: BRAND_OPTIONS_DB_KEY, value_json: sanitized }, { onConflict: 'key' });

    if (error) throw error;
    return sanitized;
  },
  listQuoteRequests: async (): Promise<QuoteRequest[]> => {
    const { data, error } = await supabase
      .from('quote_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    return (data || []).map((row) => ({
      id: row.id,
      customerName: row.customer_name,
      customerPhone: row.customer_phone,
      message: row.message,
      items: Array.isArray(row.items_json)
        ? (row.items_json as QuoteRequest['items'])
        : [],
      status: (row.status as QuoteRequest['status']) || 'pending',
      createdAt: row.created_at,
    }));
  },
  createQuoteRequest: async (payload: Omit<QuoteRequest, 'id' | 'createdAt' | 'status'>): Promise<QuoteRequest> => {
    const next: QuoteRequest = {
      ...payload,
      id: `qr_${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('quote_requests')
      .insert({
        id: next.id,
        customer_name: next.customerName,
        customer_phone: next.customerPhone,
        message: next.message,
        items_json: next.items,
        status: next.status,
        created_at: next.createdAt,
      });
    if (error) throw error;

    return next;
  },
  updateQuoteRequestStatus: async (id: string, status: QuoteRequest['status']): Promise<QuoteRequest | null> => {
    const { data, error } = await supabase
      .from('quote_requests')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      customerName: data.customer_name,
      customerPhone: data.customer_phone,
      message: data.message,
      items: Array.isArray(data.items_json) ? (data.items_json as QuoteRequest['items']) : [],
      status: (data.status as QuoteRequest['status']) || 'pending',
      createdAt: data.created_at,
    };
  },
};
