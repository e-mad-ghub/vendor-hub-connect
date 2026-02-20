import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones, MessageCircle } from 'lucide-react';
import { categories } from '@/data/mockData';
import { useProducts } from '@/data/productsStore';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { sanitizePhoneInput, validatePhone } from '@/lib/validation';
import { Seo } from '@/components/Seo';
import { trackEvent } from '@/lib/analytics';
import { CarFitmentFilter } from '@/components/CarFitmentFilter';
import { extractFitmentOptions, filterHomeProducts } from '@/lib/fitment';
import { getErrorMessage } from '@/lib/error';
import {
  getRecentPartQueries,
  getRecentViewedProductIds,
  getSavedSearches,
  pushRecentPartQuery,
  saveSearch,
  type SavedSearch,
} from '@/lib/customerContext';

const Index = () => {
  const { products } = useProducts();
  const [searchParams, setSearchParams] = useSearchParams();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customPartName, setCustomPartName] = useState('');
  const [customCarBrand, setCustomCarBrand] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedModel, setSelectedModel] = useState('');
  const [nameQueryInput, setNameQueryInput] = useState('');
  const [debouncedNameQuery, setDebouncedNameQuery] = useState('');
  const [modelResetHint, setModelResetHint] = useState('');
  const [isOpeningWhatsApp, setIsOpeningWhatsApp] = useState(false);
  const [recentQueries, setRecentQueries] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [recentViewedIds, setRecentViewedIds] = useState<string[]>([]);

  const didInitRef = useRef(false);

  const fitmentOptions = useMemo(() => extractFitmentOptions(products), [products]);

  const availableModels = useMemo(() => {
    if (!selectedBrand) return [];
    return fitmentOptions.modelsByBrand[selectedBrand] || [];
  }, [fitmentOptions.modelsByBrand, selectedBrand]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedNameQuery(nameQueryInput);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [nameQueryInput]);

  useEffect(() => {
    if (didInitRef.current) return;

    const isSharedFilterLink = searchParams.get('shared') === '1';
    const urlBrand = isSharedFilterLink ? (searchParams.get('brand') || '') : '';
    const urlModel = isSharedFilterLink ? (searchParams.get('model') || '') : '';
    const urlQuery = isSharedFilterLink ? (searchParams.get('q') || '') : '';

    setSelectedBrand(urlBrand);
    setSelectedModel(urlBrand ? urlModel : '');
    setNameQueryInput(urlQuery);
    setDebouncedNameQuery(urlQuery);
    setRecentQueries(getRecentPartQueries());
    setSavedSearches(getSavedSearches());
    setRecentViewedIds(getRecentViewedProductIds());

    didInitRef.current = true;

    // Prevent implicit filtering from stale/non-shared URL params on home.
    if (!isSharedFilterLink && searchParams.toString()) {
      setSearchParams(new URLSearchParams(), { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!didInitRef.current) return;

    const nextParams = new URLSearchParams();
    const hasFilters = !!selectedBrand || !!selectedModel || !!nameQueryInput.trim();

    if (hasFilters) {
      nextParams.set('shared', '1');
      if (selectedBrand) nextParams.set('brand', selectedBrand);
      if (selectedModel) nextParams.set('model', selectedModel);
      if (nameQueryInput.trim()) nextParams.set('q', nameQueryInput.trim());
    }

    const currentString = searchParams.toString();
    const nextString = nextParams.toString();

    if (currentString !== nextString) {
      setSearchParams(nextParams, { replace: true });
    }
  }, [selectedBrand, selectedModel, nameQueryInput, searchParams, setSearchParams]);

  useEffect(() => {
    if (!selectedBrand) {
      setSelectedModel('');
      setModelResetHint('');
      return;
    }

    if (!selectedModel) return;

    if (!availableModels.includes(selectedModel)) {
      setSelectedModel('');
      setModelResetHint('الموديل المختار لم يعد متاحًا وتمت إعادة ضبطه تلقائيًا.');
    }
  }, [selectedBrand, selectedModel, availableModels]);

  useEffect(() => {
    if (!didInitRef.current) return;
    const normalized = debouncedNameQuery.trim();
    if (normalized.length < 2) return;
    pushRecentPartQuery(normalized);
    setRecentQueries(getRecentPartQueries());
  }, [debouncedNameQuery]);

  const filtered = useMemo(
    () =>
      filterHomeProducts(products, {
        selectedBrand,
        selectedModel,
        nameQuery: debouncedNameQuery,
        includeUncertain: false,
      }),
    [products, selectedBrand, selectedModel, debouncedNameQuery]
  );

  const filteredProducts = filtered.items;
  const productsById = useMemo(() => new Map(products.map((item) => [item.id, item])), [products]);
  const recentViewedProducts = useMemo(
    () =>
      recentViewedIds
        .map((id) => productsById.get(id))
        .filter((item): item is NonNullable<typeof item> => !!item)
        .slice(0, 2),
    [recentViewedIds, productsById]
  );
  const hasNoResults = filteredProducts.length === 0;

  const fallbackSuggestions = useMemo(() => {
    if (!hasNoResults) return [];

    const normalizedQuery = debouncedNameQuery.trim().toLowerCase();
    let candidates = [...products];

    if (selectedBrand) {
      candidates = candidates.filter((product) =>
        (product.carBrands || []).some((entry) => entry.startsWith(selectedBrand))
      );
    }

    if (normalizedQuery) {
      const queryMatches = candidates.filter((product) =>
        product.title.toLowerCase().includes(normalizedQuery)
      );
      if (queryMatches.length > 0) {
        candidates = queryMatches;
      }
    }

    return candidates.slice(0, 6);
  }, [hasNoResults, products, selectedBrand, debouncedNameQuery]);

  const featuredProducts = filteredProducts;
  const newArrivals = [...filteredProducts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const features = [
    { icon: Truck, title: 'شحن مرن', desc: 'ننسق معاك بعد تأكيد العرض' },
    { icon: Shield, title: 'طلبات موثوقة', desc: 'تأكيد يدوي للأسعار والتوافر' },
    { icon: RefreshCw, title: 'تعديلات سهلة', desc: 'عدّل السلة واطلب عرض جديد' },
    { icon: Headphones, title: 'دعم سريع', desc: 'نتواصل معاك عبر واتساب' },
  ];

  const buildCustomMessage = () => {
    const partLine = customCarBrand.trim()
      ? `${customPartName.trim()} (${customCarBrand.trim()})`
      : customPartName.trim();
    return [
      'طلب عرض سعر (طلب مخصص)',
      `الاسم: ${customerName.trim()}`,
      `رقم التليفون: ${customerPhone.trim()}`,
      '',
      'تفاصيل الطلب:',
      `• القطعة: ${partLine}`,
      `  - الماركات/الموديلات: ${customCarBrand.trim() || 'غير محدد'}`,
      '',
      'ملاحظة: من فضلك أكد السعر والتوفر. شكرًا.',
    ].join('\n');
  };

  const buildMissingPartMessage = () => {
    const fitmentLabel = selectedBrand
      ? `الماركة: ${selectedBrand}${selectedModel ? ` | الموديل: ${selectedModel}` : ''}`
      : 'الماركة/الموديل: غير محدد';

    return [
      'مرحبًا، أبحث عن قطعة غير متوفرة في النتائج الحالية.',
      fitmentLabel,
      `بحث بالاسم: ${debouncedNameQuery || 'بدون'}`,
      'من فضلك أكد التوفر والسعر عبر واتساب.',
    ].join('\n');
  };

  const handleCustomRequest = async () => {
    if (isSending) return;
    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('من فضلك اكتب الاسم ورقم التليفون');
      return;
    }
    const phoneValidation = validatePhone(customerPhone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'رقم التليفون غير صالح');
      return;
    }
    if (!customPartName.trim()) {
      toast.error('من فضلك اكتب اسم القطعة');
      return;
    }
    setIsSending(true);
    try {
      const settings = await api.getWhatsAppSettings();
      const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
      if (!phoneDigits) {
        toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
        return;
      }
      const message = buildCustomMessage();
      await api.createQuoteRequest({
        customerName: customerName.trim(),
        customerPhone: phoneValidation.sanitized || customerPhone.trim(),
        message,
        items: [
          {
            productId: `custom_${Date.now()}`,
            title: customCarBrand.trim()
              ? `${customPartName.trim()} (${customCarBrand.trim()})`
              : customPartName.trim(),
            quantity: 1,
            unitPrice: 0,
            image: '',
          },
        ],
      });
      trackEvent('Request Quote Submit', { source: 'custom', hasBrand: !!customCarBrand.trim() });
      window.location.href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'تعذر إرسال الطلب'));
    } finally {
      setIsSending(false);
    }
  };

  const handleShareFilters = async () => {
    const url = window.location.href;

    if (navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('تم نسخ رابط الفلاتر');
        return;
      } catch {
        // Fallback below.
      }
    }

    window.prompt('انسخ الرابط التالي:', url);
  };

  const clearAllFilters = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setNameQueryInput('');
    setDebouncedNameQuery('');
    setModelResetHint('');
  };

  const clearModelOnly = () => {
    setSelectedModel('');
    setModelResetHint('');
  };

  const clearCarOnly = () => {
    setSelectedBrand('');
    setSelectedModel('');
    setModelResetHint('');
  };

  const handleMissingPartWhatsApp = async () => {
    if (isOpeningWhatsApp) return;

    setIsOpeningWhatsApp(true);
    try {
      const settings = await api.getWhatsAppSettings();
      const phoneDigits = settings.phoneNumber.replace(/\D/g, '');
      if (!phoneDigits) {
        toast.error('رقم واتساب غير مُعد. تواصل مع الأدمن.');
        return;
      }

      const message = buildMissingPartMessage();
      window.location.href = `https://wa.me/${phoneDigits}?text=${encodeURIComponent(message)}`;
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'تعذر فتح واتساب'));
    } finally {
      setIsOpeningWhatsApp(false);
    }
  };

  const handleSaveCurrentSearch = () => {
    const saved = saveSearch({
      brand: selectedBrand,
      model: selectedModel,
      q: debouncedNameQuery,
    });

    if (!saved) {
      toast.error('حدد فلتر أو كلمة بحث أولاً لحفظ البحث');
      return;
    }

    setSavedSearches(getSavedSearches());
    toast.success('تم حفظ البحث. يمكنك الرجوع له لاحقًا.');
  };

  return (
    <Layout>
      <Seo
        title="الرئيسية"
        description="مع فريقنا المختص هتقدر توصل لأي قطعه غيار بتدور عليها في مصر سواء جديدة او استيراد ف ثواني من موبايلك و كمان توصلك لحد عربيتك"
      />
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary mb-4">🔥 عروض سخنة</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                دور على قطع غيار عربيتك{' '}
                <span className="text-primary">وهنوصلهالك بسرعة</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
                منتجات مختارة من فريق واحد موثوق. اطلب عرض سعر وتأكد من التوافر بسرعة عبر واتساب.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/search">
                  <Button size="lg" className="w-full sm:w-auto">
                    ابدأ التسوق
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="mt-6 bg-card rounded-xl p-4 shadow-card max-w-md mx-auto md:mx-0">
                <h3 className="font-semibold mb-2">عايز قطعة مش موجودة؟</h3>
                <p className="text-xs text-muted-foreground mb-3">
                  ابعت طلب سريع باسم القطعة والماركة المطلوبة.
                </p>
                <div className="grid gap-3">
                  <div>
                    <Label htmlFor="custom-name">اسمك</Label>
                    <Input
                      id="custom-name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="مثال: أحمد محمد"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-phone">رقم التليفون</Label>
                    <Input
                      id="custom-phone"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(sanitizePhoneInput(e.target.value))}
                      placeholder="مثال: 01XXXXXXXXX"
                      inputMode="tel"
                      maxLength={16}
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-part">اسم القطعة</Label>
                    <Input
                      id="custom-part"
                      value={customPartName}
                      onChange={(e) => setCustomPartName(e.target.value)}
                      placeholder="مثال: طلمبة بنزين"
                    />
                  </div>
                  <div>
                    <Label htmlFor="custom-brand">ماركة العربية</Label>
                    <Input
                      id="custom-brand"
                      value={customCarBrand}
                      onChange={(e) => setCustomCarBrand(e.target.value)}
                      placeholder="مثال: هيونداي"
                    />
                  </div>
                  <Button onClick={handleCustomRequest} disabled={isSending}>
                    {isSending ? 'جاري الإرسال...' : 'اطلب عرض سعر'}
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDBAELcCBZvFeMrydahzOwchiBAohWXYTgmA&s"
                alt="ميكانيكي بيصلح عربية داخل ورشة"
                className="rounded-xl shadow-card-hover object-cover w-full h-full"
                loading="lazy"
                decoding="async"
                width={960}
                height={640}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="container mt-6">
        <CategoryChips categories={categories} />
      </section>

      <CarFitmentFilter
        brands={fitmentOptions.brands}
        models={availableModels}
        selectedBrand={selectedBrand}
        selectedModel={selectedModel}
        nameQuery={nameQueryInput}
        resultCount={filteredProducts.length}
        isModelDisabled={!selectedBrand}
        onBrandChange={(value) => {
          setSelectedBrand(value);
          setSelectedModel('');
          setModelResetHint('');
        }}
        onModelChange={(value) => {
          setSelectedModel(value);
          setModelResetHint('');
        }}
        onNameQueryChange={setNameQueryInput}
        onClearModel={clearModelOnly}
        onClearAll={clearAllFilters}
        onClearCarOnly={clearCarOnly}
        onShare={handleShareFilters}
      />

      {modelResetHint && (
        <section className="container mt-3">
          <p className="text-xs text-muted-foreground">{modelResetHint}</p>
        </section>
      )}

      {(recentQueries.length > 0 || savedSearches.length > 0) && (
        <section className="container mt-4 space-y-3">
          {recentQueries.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">آخر عمليات البحث:</span>
              {recentQueries.slice(0, 6).map((query) => (
                <button
                  key={query}
                  type="button"
                  className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
                  onClick={() => setNameQueryInput(query)}
                >
                  {query}
                </button>
              ))}
            </div>
          )}

          {savedSearches.length > 0 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground">عمليات بحث محفوظة:</span>
              {savedSearches.slice(0, 4).map((saved) => {
                const label = [saved.brand, saved.model, saved.q].filter(Boolean).join(' · ') || 'بحث محفوظ';
                return (
                  <button
                    key={saved.id}
                    type="button"
                    className="inline-flex items-center rounded-full border border-border px-3 py-1 text-xs hover:bg-muted transition-colors"
                    onClick={() => {
                      setSelectedBrand(saved.brand);
                      setSelectedModel(saved.model);
                      setNameQueryInput(saved.q);
                    }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* Features */}
      <section className="container my-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {recentViewedProducts.length > 0 && (
        <section className="container my-10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">تابع من حيث توقفت</h3>
              <p className="text-sm text-muted-foreground">آخر المنتجات التي شاهدتها</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {recentViewedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {hasNoResults ? (
        <section className="container my-10">
          <div className="bg-card rounded-xl shadow-card p-6 text-center space-y-5">
            <h3 className="text-xl font-semibold">لا توجد نتائج مطابقة. جرّب تغيير الماركة/الموديل أو مسح الفلاتر.</h3>
            <div className="flex flex-wrap justify-center gap-2">
              <Button variant="outline" onClick={clearModelOnly} disabled={!selectedModel}>
                مسح الموديل فقط
              </Button>
              <Button variant="outline" onClick={clearAllFilters}>
                مسح كل الفلاتر
              </Button>
              <Button variant="outline" onClick={handleSaveCurrentSearch}>
                حفظ هذا البحث
              </Button>
              <Button onClick={handleMissingPartWhatsApp} disabled={isOpeningWhatsApp}>
                <MessageCircle className="h-4 w-4 ml-2" />
                طلب قطعة غير موجودة؟ تواصل واتساب
              </Button>
            </div>

            {fallbackSuggestions.length > 0 && (
              <div className="pt-4 border-t border-border text-right">
                <p className="text-sm text-muted-foreground mb-3">اقتراحات قريبة قد تهمك:</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {fallbackSuggestions.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>
      ) : (
        <>
          {/* Featured Products */}
          <section className="container my-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">نتايج البحث</h3>
                <p className="text-sm text-muted-foreground">المنتجات اللي طالعة حسب الفلاتر اللي اخترتها</p>
              </div>
              <Link to="/search">
                <Button variant="ghost" size="sm" className="text-primary">
                  شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>

          {/* New Arrivals */}
          <section className="container my-10">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-xl md:text-2xl font-bold text-foreground">وصلت جديد</h3>
                <p className="text-sm text-muted-foreground">أحدث منتجات تجارنا</p>
              </div>
              <Link to="/search?sort=newest">
                <Button variant="ghost" size="sm" className="text-primary">
                  شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </section>
        </>
      )}

      {/* CTA Banner */}
      <section className="container my-10">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">هل ترغب في عرض سعر دقيق وسريع؟</h3>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            أضف المنتجات المناسبة إلى السلة ثم أرسل طلب عرض السعر عبر واتساب، وسيقوم فريقنا بمراجعة التوفر وتأكيد التفاصيل قبل إتمام الاتفاق.
          </p>
          <p className="text-sm opacity-90">
            يتم التواصل والمتابعة مباشرة عبر واتساب لضمان سرعة الخدمة ودقة المعلومات.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
