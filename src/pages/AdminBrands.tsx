import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { defaultBrandOptions, type BrandOption, BRAND_OPTIONS_KEY, translateBrandOptions } from '@/data/brandOptions';
import { LoadingState } from '@/components/LoadingState';
import { Seo } from '@/components/Seo';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/error';

const AdminBrands = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [brandOptions, setBrandOptions] = React.useState<BrandOption[]>([]);
  const [brandOptionsDirty, setBrandOptionsDirty] = React.useState(false);
  const [newBrandName, setNewBrandName] = React.useState('');
  const [newModelInputs, setNewModelInputs] = React.useState<Record<string, string>>({});

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_OPTIONS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as BrandOption[];
        const translated = translateBrandOptions(parsed);
        if (JSON.stringify(parsed) !== JSON.stringify(translated)) {
          localStorage.setItem(BRAND_OPTIONS_KEY, JSON.stringify(translated));
        }
        setBrandOptions(translated);
        return;
      }
      setBrandOptions(defaultBrandOptions);
    } catch {
      setBrandOptions(defaultBrandOptions);
    }
  }, []);

  if (authLoading) {
    return (
      <Layout>
        <Seo title="إدارة الماركات" description="إضافة وتعديل الماركات والموديلات." />
        <div className="container py-12">
          <LoadingState title="جاري التحقق من الجلسة" message="برجاء الانتظار..." />
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <Seo title="غير مصرح" description="هذه الصفحة للأدمن فقط." />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">الدخول كأدمن مطلوب</h1>
          <Link to="/login">
            <Button>سجل دخول كأدمن</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const updateBrandOption = (index: number, nextBrand: string) => {
    setBrandOptions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], brand: nextBrand };
      return next;
    });
    setBrandOptionsDirty(true);
  };

  const updateModelOption = (brandIndex: number, modelIndex: number, nextModel: string) => {
    setBrandOptions((prev) => {
      const next = [...prev];
      const models = [...next[brandIndex].models];
      models[modelIndex] = nextModel;
      next[brandIndex] = { ...next[brandIndex], models };
      return next;
    });
    setBrandOptionsDirty(true);
  };

  const addBrandOption = () => {
    const trimmed = newBrandName.trim();
    if (!trimmed) return;
    setBrandOptions((prev) => [...prev, { brand: trimmed, models: [] }]);
    setNewBrandName('');
    setBrandOptionsDirty(true);
  };

  const addModelOption = (brandIndex: number) => {
    const brandName = brandOptions[brandIndex]?.brand || '';
    const input = newModelInputs[brandName]?.trim();
    if (!input) return;
    setBrandOptions((prev) => {
      const next = [...prev];
      const models = [...next[brandIndex].models, input];
      next[brandIndex] = { ...next[brandIndex], models };
      return next;
    });
    setNewModelInputs((prev) => ({ ...prev, [brandName]: '' }));
    setBrandOptionsDirty(true);
  };

  const removeBrandOption = (brandIndex: number) => {
    setBrandOptions((prev) => prev.filter((_, index) => index !== brandIndex));
    setBrandOptionsDirty(true);
  };

  const removeModelOption = (brandIndex: number, modelIndex: number) => {
    setBrandOptions((prev) => {
      const next = [...prev];
      const models = next[brandIndex].models.filter((_, index) => index !== modelIndex);
      next[brandIndex] = { ...next[brandIndex], models };
      return next;
    });
    setBrandOptionsDirty(true);
  };

  const saveBrandOptions = () => {
    try {
      localStorage.setItem(BRAND_OPTIONS_KEY, JSON.stringify(brandOptions));
      setBrandOptionsDirty(false);
      toast.success('تم حفظ الماركات والموديلات');
    } catch (e: unknown) {
      toast.error(getErrorMessage(e, 'تعذر حفظ الماركات'));
    }
  };

  return (
    <Layout>
      <Seo title="إدارة الماركات" description="إضافة وتعديل الماركات والموديلات." />
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">إدارة الماركات والموديلات</h1>
            <p className="text-sm text-muted-foreground">أضف أو عدّل الماركات والموديلات المتاحة للمنتجات.</p>
          </div>
          <Link to="/admin">
            <Button variant="outline">رجوع للوحة الإدارة</Button>
          </Link>
        </div>

        <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
          <div className="grid md:grid-cols-2 gap-3">
            <div>
              <Label htmlFor="brand-new">إضافة ماركة</Label>
              <Input
                id="brand-new"
                value={newBrandName}
                onChange={(e) => setNewBrandName(e.target.value)}
                placeholder="اكتب اسم الماركة"
              />
            </div>
            <div className="flex items-end">
              <Button type="button" onClick={addBrandOption} className="w-full">
                إضافة ماركة
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            {brandOptions.map((option, brandIndex) => (
              <div key={`${option.brand}-${brandIndex}`} className="border border-border rounded-lg p-4">
                <div className="grid md:grid-cols-2 gap-3 items-end">
                  <div>
                    <Label>اسم الماركة</Label>
                    <Input
                      value={option.brand}
                      onChange={(e) => updateBrandOption(brandIndex, e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>إضافة موديل</Label>
                    <div className="flex gap-2">
                      <Input
                        value={newModelInputs[option.brand] || ''}
                        onChange={(e) => setNewModelInputs((prev) => ({
                          ...prev,
                          [option.brand]: e.target.value,
                        }))}
                        placeholder="اكتب اسم الموديل"
                      />
                      <Button type="button" variant="outline" onClick={() => addModelOption(brandIndex)}>
                        إضافة
                      </Button>
                    </div>
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="button" variant="outline" onClick={() => removeBrandOption(brandIndex)}>
                      حذف الماركة
                    </Button>
                  </div>
                </div>
                {option.models.length > 0 && (
                  <div className="mt-3 grid md:grid-cols-2 gap-3">
                    {option.models.map((model, modelIndex) => (
                      <div key={`${option.brand}-${model}-${modelIndex}`}>
                        <Label>موديل</Label>
                        <div className="flex gap-2">
                          <Input
                            value={model}
                            onChange={(e) => updateModelOption(brandIndex, modelIndex, e.target.value)}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => removeModelOption(brandIndex, modelIndex)}
                          >
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          <Button type="button" onClick={saveBrandOptions} disabled={!brandOptionsDirty}>
            {brandOptionsDirty ? 'حفظ الماركات والموديلات' : 'تم الحفظ'}
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default AdminBrands;
