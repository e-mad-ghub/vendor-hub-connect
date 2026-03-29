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
  aboutContent: string;
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
  aboutContent: [
    'سوق الحرفيين موقع معمول علشان يسهّل على صاحب العربية إنه يلاقي قطعة الغيار اللي محتاجها بشكل أسرع وأوضح، من غير لفة كبيرة ولا تضييع وقت. بدل ما تفضل تدور في أكتر من مكان وتسأل كتير، تقدر تشوف القطع المتاحة، وتعرف نوعها، وتبدأ طلبك من مكان واحد.',
    'فكرة الموقع إننا نساعدك توصل للقطعة المناسبة لعربيتك، سواء كانت جديدة أو استيراد، مع مراجعة التوفر والتفاصيل قبل تأكيد الطلب. إحنا بنهتم إن المعلومات الأساسية تبقى واضحة قدامك، زي نوع القطعة، الفئة، وبعض تفاصيل التوافق، وبعد كده بنكمل معاك التأكيد النهائي عن طريق التواصل المباشر.',
    'كمان وفرنا طريقة سهلة لطلب عرض سعر أو الاستفسار عن قطعة مش موجودة ضمن النتائج، وده بيساعد العملاء اللي بيدوروا على قطع أقل انتشارًا أو محتاجين يتأكدوا من التوافق قبل الشراء. ولو القطعة مش ظاهرة على الموقع، تقدر تبعتلنا طلب مخصص وإحنا نراجع معاك التفاصيل.',
    'هدفنا إن تجربة الاستخدام تبقى بسيطة ومفهومة، من أول البحث لحد متابعة الطلب، مع توضيح بيانات التواصل وسياسات الشحن والاسترجاع بشكل واضح يخليك عارف إنت داخل على إيه قبل ما تأكد طلبك.',
  ].join('\n\n'),
  faqContent: [
    'إزاي أطلب قطعة من الموقع؟',
    'تقدر تدور على القطعة من البحث أو من خلال الفئات، وبعد ما تفتح صفحة المنتج تختار الجودة المتاحة وتضيفها للعربة أو تبدأ طلب عرض سعر.',
    'هل السعر اللي على الموقع نهائي؟',
    'بعض القطع بيكون فيها سعر مبدئي، لكن التأكيد النهائي بيتم بعد مراجعة التوفر والتفاصيل الفعلية للقطعة قبل تنفيذ الطلب.',
    'إزاي أتأكد إن القطعة تنفع لعربيتي؟',
    'الأفضل تراجع الماركة والموديل وسنة الصنع، ولو محتاج تأكيد أكتر تقدر تتواصل معانا ونراجع معاك التوافق قبل تأكيد الطلب.',
    'لو القطعة مش موجودة على الموقع أعمل إيه؟',
    'تقدر تبعتلنا طلب مخصص باسم القطعة وبيانات العربية، وإحنا نشوف المتاح ونرد عليك.',
    'إيه الفرق بين الجديد والاستيراد؟',
    'الجديد بيكون قطعة جديدة غير مستخدمة، والاستيراد غالبًا بيكون قطعة أصلية مستعملة بحالة جيدة. المتاح بيختلف من منتج للتاني.',
    'إمتى الطلب بيتأكد؟',
    'الطلب بيتأكد بعد مراجعة التوفر النهائي والاتفاق على التفاصيل الأساسية زي النوع والسعر وطريقة الاستلام أو الشحن.',
  ].join('\n\n'),
  shippingInfo: [
    'الشحن بيتم بعد ما نراجع التوفر ونأكد تفاصيل الطلب معاك بشكل نهائي. ومدة التجهيز أو التسليم ممكن تختلف حسب نوع القطعة ومكان توفرها.',
    'بعد التأكيد، بنتفق معاك على طريقة الشحن المناسبة، وبنوضحلك المدة المتوقعة وأي تفاصيل مهمة قبل الإرسال. ولو في أي تأخير أو تحديث، بنبلغك بيه أول بأول.',
    'في بعض القطع بنحتاج نراجع تفاصيل العربية أكتر قبل الشحن علشان نتأكد إن القطعة مناسبة، وده بيقلل فرص الخطأ وبيساعد إن الطلب يوصل بشكل أدق.',
    'لو عندك استفسار عن حالة الطلب أو موعد التسليم، تقدر تتواصل مع خدمة العملاء في أي وقت خلال مواعيد العمل.',
  ].join('\n\n'),
  returnPolicy: [
    'إحنا بنحاول نخلي تجربة الشراء واضحة وعادلة، علشان كده لو حصلت مشكلة في الطلب أو القطعة وصلت بشكل مختلف عن المتفق عليه، تقدر تتواصل معانا ونراجع الحالة.',
    'لازم التواصل يتم في أقرب وقت بعد الاستلام، مع توضيح المشكلة وإرسال الصور أو التفاصيل المطلوبة لو لزم الأمر، علشان نقدر نحدد الإجراء المناسب.',
    'الاسترجاع أو الاستبدال بيكون حسب حالة القطعة وطبيعة المشكلة، ومش بينطبق في حالات سوء الاستخدام أو التركيب الغلط أو أي تلف حصل بعد الاستلام.',
    'لو تمت الموافقة على الاسترجاع، بنوضح للعميل الخطوات المطلوبة وطريقة رد المبلغ أو الاستبدال حسب كل حالة.',
    'علشان نقلل أي مشاكل، بننصح دايمًا بمراجعة تفاصيل الطلب والتأكد من التوافق قبل التأكيد النهائي.',
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

export type { CustomerServiceSettings };
