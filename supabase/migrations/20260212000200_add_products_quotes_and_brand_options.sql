-- Product catalog persisted in DB (single source of truth).
CREATE TABLE IF NOT EXISTS public.app_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  new_available BOOLEAN NOT NULL DEFAULT true,
  new_price NUMERIC,
  imported_available BOOLEAN NOT NULL DEFAULT false,
  category TEXT NOT NULL DEFAULT 'غير محدد',
  car_brands JSONB NOT NULL DEFAULT '[]'::jsonb,
  image_data_url TEXT NOT NULL DEFAULT '',
  owner_id TEXT,
  owner_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.app_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read products"
ON public.app_products
FOR SELECT
USING (true);

CREATE POLICY "Admins can insert products"
ON public.app_products
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update products"
ON public.app_products
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete products"
ON public.app_products
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Quote requests persisted in DB.
CREATE TABLE IF NOT EXISTS public.quote_requests (
  id TEXT PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  message TEXT NOT NULL,
  items_json JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.quote_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can create quote requests"
ON public.quote_requests
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

CREATE POLICY "Admins can view quote requests"
ON public.quote_requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update quote requests"
ON public.quote_requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete quote requests"
ON public.quote_requests
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Brand/model options under app_settings.
INSERT INTO public.app_settings (key, value_json)
VALUES (
  'brand_options',
  '[
    {"brand":"نيسان","models":["قشقاي","صني","سنترا"]},
    {"brand":"رينو","models":["كادجار"]},
    {"brand":"تويوتا","models":["كورولا"]},
    {"brand":"ميتسوبيشي","models":["إكليبس كروس"]},
    {"brand":"فولكسفاجن","models":["تيجوان"]},
    {"brand":"سكودا","models":["كودياك"]},
    {"brand":"كوبرا","models":[]},
    {"brand":"أوبل","models":[]},
    {"brand":"بيجو","models":[]},
    {"brand":"سيتروين","models":[]},
    {"brand":"هيونداي","models":["إلنترا","توسان"]},
    {"brand":"كيا","models":["سيراتو","سبورتاج"]},
    {"brand":"فيات","models":["تيبو"]},
    {"brand":"سوزوكي","models":["سويفت","فيتارا"]},
    {"brand":"شيري","models":["تيجو 4","أريزو 5","تيجو 7","تيجو 8"]},
    {"brand":"إم جي","models":["زد إس","آر إكس 5"]},
    {"brand":"جيلي","models":["كولراي","ستاراي","أوكافانجو"]},
    {"brand":"شانجان","models":[]}
  ]'::jsonb
)
ON CONFLICT (key) DO NOTHING;
