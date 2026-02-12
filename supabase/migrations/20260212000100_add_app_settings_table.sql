-- Shared key/value settings table for admin-managed frontend configuration.
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public read access so storefront visitors can read WhatsApp/customer-service settings.
CREATE POLICY "Anyone can read app settings"
ON public.app_settings
FOR SELECT
USING (true);

-- Only admins can write settings.
CREATE POLICY "Admins can insert app settings"
ON public.app_settings
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update app settings"
ON public.app_settings
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete app settings"
ON public.app_settings
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Seed default rows used by the frontend.
INSERT INTO public.app_settings (key, value_json)
VALUES
  ('whatsapp_settings', jsonb_build_object('phoneNumber', '201000000000')),
  ('customer_service_settings', jsonb_build_object(
    'supportEmail', 'support@souq-elherafyeen.com',
    'supportPhone', '+1 (555) 123-4567',
    'supportAddress', '123 Market Street, Demo City',
    'faqContent', 'لو عندك أي سؤال، تقدر تبعتلنا رسالة وسنرد عليك في أقرب وقت.',
    'shippingInfo', 'الشحن يتم بعد تأكيد العرض والتوافر عبر واتساب.',
    'returnPolicy', 'همنا تكون راضي تمامًا عن مشترياتك.' || E'\n\n' ||
      'استرجاع خلال ٣٠ يوم من الاستلام لمعظم المنتجات.' || E'\n\n' ||
      'ابدأ الاسترجاع بالتواصل معنا عبر خدمة العملاء.' || E'\n\n' ||
      'يتم رد المبلغ خلال ٥-٧ أيام عمل بعد استلام المنتج.',
    'lastUpdated', '31 يناير 2026'
  ))
ON CONFLICT (key) DO NOTHING;
