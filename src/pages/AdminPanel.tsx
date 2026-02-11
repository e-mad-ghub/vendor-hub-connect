import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { MessageCircle, FileDown, Settings, Package, Key } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/data/productsStore';
import { categories } from '@/data/mockData';
import { defaultBrandOptions, type BrandOption, BRAND_OPTIONS_KEY, translateBrandOptions } from '@/data/brandOptions';
import type { QuoteRequest } from '@/types/marketplace';
import { PasswordChangeForm } from '@/components/PasswordChangeForm';
import { LoadingState } from '@/components/LoadingState';
import { InlineError } from '@/components/InlineError';
import { EmptyState } from '@/components/EmptyState';
import { Seo } from '@/components/Seo';
import { sanitizePhoneInput, validatePhone } from '@/lib/validation';
import { formatCarBrands } from '@/lib/brands';

const AdminPanel = () => {
  const { user, logout, isLoading: authLoading } = useAuth();
  const [requests, setRequests] = React.useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [requestsError, setRequestsError] = React.useState<string | null>(null);
  const [settingsError, setSettingsError] = React.useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [pendingRequestIds, setPendingRequestIds] = React.useState<Set<string>>(new Set());
  const [customerService, setCustomerService] = React.useState({
    supportEmail: '',
    supportPhone: '',
    supportAddress: '',
    faqContent: '',
    shippingInfo: '',
    returnPolicy: '',
    lastUpdated: '',
  });
  const [customerServiceSaving, setCustomerServiceSaving] = React.useState(false);
  const { products, createProduct, deleteProduct, editProduct } = useProducts();
  const [newProduct, setNewProduct] = React.useState({
    title: '',
    description: '',
    newPrice: '',
    newAvailable: true,
    importedAvailable: false,
    category: '',
    imageDataUrl: '',
  });
  const [newProductBrands, setNewProductBrands] = React.useState<string[]>([]);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingProduct, setEditingProduct] = React.useState({
    title: '',
    description: '',
    newPrice: '',
    newAvailable: true,
    importedAvailable: false,
    category: '',
    imageDataUrl: '',
  });
  const [editingProductBrands, setEditingProductBrands] = React.useState<string[]>([]);

  const BRAND_OPTIONS_KEY = 'vhc_brand_options';
  const [brandOptions, setBrandOptions] = React.useState<BrandOption[]>([]);

  const loadAdminData = React.useCallback(async () => {
    if (user?.role !== 'admin') return;
    setIsLoading(true);
    setRequestsError(null);
    setSettingsError(null);
    try {
      const [quotes, settings] = await Promise.all([
        api.listQuoteRequests(),
        api.getWhatsAppSettings(),
      ]);
      setRequests(quotes || []);
      setPhoneNumber(settings?.phoneNumber || '');
      const customerServiceData = await api.getCustomerServiceSettings();
      setCustomerService(customerServiceData);
    } catch (e: any) {
      setRequests([]);
      setRequestsError(e?.message || 'تعذر تحميل الطلبات.');
      setSettingsError(e?.message || 'تعذر تحميل إعدادات واتساب.');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  React.useEffect(() => {
    loadAdminData();
  }, [loadAdminData]);

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
        <Seo title="لوحة الإدارة" description="إدارة الطلبات والمنتجات وإعدادات واتساب." />
        <div className="container py-12">
          <LoadingState title="جاري التحقق من الجلسة" message="برجاء الانتظار..." />
        </div>
      </Layout>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <Layout>
        <Seo title="لوحة الإدارة" description="الدخول كأدمن مطلوب." />
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">الدخول كأدمن مطلوب</h1>
          <Link to="/login"><Button>سجل دخول كأدمن</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleSaveSettings = async () => {
    if (saving) return;
    setSaving(true);
    try {
      const phoneValidation = validatePhone(phoneNumber);
      if (!phoneValidation.valid) {
        toast.error(phoneValidation.error || 'رقم التليفون غير صالح');
        setSaving(false);
        return;
      }
      const updated = await api.updateWhatsAppSettings({
        phoneNumber: phoneValidation.sanitized || phoneNumber.trim(),
      });
      setPhoneNumber(updated.phoneNumber || '');
      toast.success('تم تحديث إعدادات واتساب');
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveCustomerService = async () => {
    if (customerServiceSaving) return;
    if (!customerService.supportEmail.trim()) {
      toast.error('من فضلك اكتب البريد الإلكتروني للدعم');
      return;
    }
    const phoneValidation = validatePhone(customerService.supportPhone);
    if (!phoneValidation.valid) {
      toast.error(phoneValidation.error || 'رقم التليفون غير صالح');
      return;
    }
    setCustomerServiceSaving(true);
    try {
      const updated = await api.updateCustomerServiceSettings({
        ...customerService,
        supportEmail: customerService.supportEmail.trim(),
        supportPhone: phoneValidation.sanitized || customerService.supportPhone.trim(),
        supportAddress: customerService.supportAddress.trim(),
        faqContent: customerService.faqContent.trim(),
        shippingInfo: customerService.shippingInfo.trim(),
        returnPolicy: customerService.returnPolicy.trim(),
        lastUpdated: customerService.lastUpdated.trim(),
      });
      setCustomerService(updated);
      toast.success('تم تحديث بيانات خدمة العملاء');
    } catch (e: any) {
      toast.error(e?.message || 'تعذر حفظ بيانات خدمة العملاء');
    } finally {
      setCustomerServiceSaving(false);
    }
  };

  const exportCsv = () => {
    const headers = ['id', 'customerName', 'customerPhone', 'createdAt', 'items'];
    const rows = requests.map((req) => {
      const items = req.items
        .map((i) => {
          const qualityLabel = i.quality === 'imported' ? 'استيراد' : i.quality === 'new' ? 'جديد' : 'غير محدد';
          const priceLabel = typeof i.unitPrice === 'number' ? `ج.م ${i.unitPrice}` : 'سعر حسب العرض';
          return `${i.title} (${qualityLabel}) x ${i.quantity} — ${priceLabel}`;
        })
        .join(' | ');
      return [req.id, req.customerName, req.customerPhone, req.createdAt, items]
        .map((value) => `"${String(value).replace(/"/g, '""')}"`)
        .join(',');
    });
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `quote-requests-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const followUpRequest = async (request: QuoteRequest) => {
    if (pendingRequestIds.has(request.id)) return;
    const phoneDigits = request.customerPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      toast.error('رقم العميل غير صالح');
      return;
    }
    if (request.status === 'cancelled') return;
    setPendingRequestIds((prev) => {
      const next = new Set(prev);
      next.add(request.id);
      return next;
    });
    try {
      await api.updateQuoteRequestStatus(request.id, 'followed_up');
      setRequests((prev) => prev.map((item) => (item.id === request.id ? { ...item, status: 'followed_up' } : item)));
      const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent('أهلًا، بخصوص طلب عرض السعر عندنا...')}`;
      window.location.href = waUrl;
    } catch (e: any) {
      toast.error(e?.message || 'تعذر متابعة الطلب');
    } finally {
      setPendingRequestIds((prev) => {
        const next = new Set(prev);
        next.delete(request.id);
        return next;
      });
    }
  };

  const cancelRequest = async (requestId: string) => {
    if (!requestId) return;
    if (pendingRequestIds.has(requestId)) return;
    setPendingRequestIds((prev) => {
      const next = new Set(prev);
      next.add(requestId);
      return next;
    });
    try {
      await api.updateQuoteRequestStatus(requestId, 'cancelled');
      setRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'cancelled' } : item)));
      toast.success('تم إلغاء الطلب');
    } catch (e: any) {
      toast.error(e?.message || 'تعذر إلغاء الطلب');
    } finally {
      setPendingRequestIds((prev) => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleCreateProduct = () => {
    if (isLoading) return;
    if (!newProduct.title.trim()) {
      toast.error('من فضلك اكتب اسم المنتج');
      return;
    }
    if (!newProduct.newAvailable && !newProduct.importedAvailable) {
      toast.error('لازم تختار جودة متاحة على الأقل');
      return;
    }
    const price = Number(newProduct.newPrice);
    if (newProduct.newAvailable && (!Number.isFinite(price) || price <= 0)) {
      toast.error('ادخل سعر صالح للجديد');
      return;
    }
    createProduct({
      title: newProduct.title.trim(),
      description: newProduct.description.trim(),
      newAvailable: newProduct.newAvailable,
      newPrice: newProduct.newAvailable ? price : undefined,
      importedAvailable: newProduct.importedAvailable,
      category: newProduct.category.trim() || 'غير محدد',
      carBrands: newProductBrands,
      imageDataUrl: newProduct.imageDataUrl,
    });
    setNewProduct({
      title: '',
      description: '',
      newPrice: '',
      newAvailable: true,
      importedAvailable: false,
      category: '',
      imageDataUrl: '',
    });
    setNewProductBrands([]);
    toast.success('تمت إضافة المنتج');
  };

  const startEdit = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setEditingId(productId);
    setEditingProduct({
      title: product.title,
      description: product.description,
      newPrice: product.newPrice ? String(product.newPrice) : '',
      newAvailable: !!product.newAvailable,
      importedAvailable: !!product.importedAvailable,
      category: product.category,
      imageDataUrl: product.imageDataUrl || '',
    });
    setEditingProductBrands(product.carBrands || []);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingProduct({
      title: '',
      description: '',
      newPrice: '',
      newAvailable: true,
      importedAvailable: false,
      category: '',
      imageDataUrl: '',
    });
    setEditingProductBrands([]);
  };

  const handleSaveEdit = () => {
    if (isLoading) return;
    if (!editingId) return;
    if (!editingProduct.title.trim()) {
      toast.error('من فضلك اكتب اسم المنتج');
      return;
    }
    if (!editingProduct.newAvailable && !editingProduct.importedAvailable) {
      toast.error('لازم تختار جودة متاحة على الأقل');
      return;
    }
    const price = Number(editingProduct.newPrice);
    if (editingProduct.newAvailable && (!Number.isFinite(price) || price <= 0)) {
      toast.error('ادخل سعر صالح للجديد');
      return;
    }
    editProduct(editingId, {
      title: editingProduct.title.trim(),
      description: editingProduct.description.trim(),
      newAvailable: editingProduct.newAvailable,
      newPrice: editingProduct.newAvailable ? price : undefined,
      importedAvailable: editingProduct.importedAvailable,
      category: editingProduct.category.trim() || 'غير محدد',
      carBrands: editingProductBrands,
      imageDataUrl: editingProduct.imageDataUrl,
    });
    toast.success('تم تحديث المنتج');
    cancelEdit();
  };

  const toggleBrandSelection = (value: string, isEditing: boolean) => {
    const updater = (prev: string[]) => (
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
    );
    if (isEditing) {
      setEditingProductBrands(updater);
      return;
    }
    setNewProductBrands(updater);
  };


  const handleImageChange = (file: File | null, isEditing: boolean) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (isEditing) {
        setEditingProduct((prev) => ({ ...prev, imageDataUrl: result }));
      } else {
        setNewProduct((prev) => ({ ...prev, imageDataUrl: result }));
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <Layout>
      <Seo title="لوحة الإدارة" description="إدارة الطلبات والمنتجات وإعدادات واتساب." />
      <div className="container py-3 md:py-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-5 md:mb-6">
          <h1 className="text-xl md:text-2xl font-bold">لوحة الإدارة</h1>
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin/brands">
              <Button variant="outline" size="sm">إدارة الماركات</Button>
            </Link>
            <Button variant="outline" size="sm" onClick={logout}>
              تسجيل خروج
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-5 md:mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <MessageCircle className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-xs text-muted-foreground">طلبات عروض السعر</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Package className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{products.length}</p>
            <p className="text-xs text-muted-foreground">المنتجات المعروضة</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Settings className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{phoneNumber ? 'نشط' : 'غير مُعد'}</p>
            <p className="text-xs text-muted-foreground">إعدادات واتساب</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <FileDown className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">تصدير</p>
            <p className="text-xs text-muted-foreground">ملف الطلبات</p>
          </div>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList className="w-full flex flex-wrap md:flex-nowrap gap-2 overflow-x-auto">
            <TabsTrigger value="requests">طلبات عروض السعر</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="settings">إعدادات واتساب</TabsTrigger>
            <TabsTrigger value="customer-service">خدمة العملاء</TabsTrigger>
            <TabsTrigger value="security">الأمان</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">سجل الطلبات</h3>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={requests.length === 0}>
                  <FileDown className="h-4 w-4 mr-2" />
                  تصدير ملف
                </Button>
              </div>
              {isLoading ? (
                <LoadingState title="جاري تحميل الطلبات" message="برجاء الانتظار..." />
              ) : requestsError ? (
                <InlineError
                  title="تعذر تحميل الطلبات"
                  message={requestsError}
                  onRetry={loadAdminData}
                />
              ) : requests.length === 0 ? (
                <EmptyState
                  title="لا توجد طلبات بعد"
                  description="بمجرد وصول طلبات عروض السعر ستظهر هنا."
                />
              ) : (
                <div className="space-y-4">
                  {requests.map((req) => (
                    <div key={req.id} className="border border-border rounded-lg p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div>
                          <p className="font-medium">{req.customerName}</p>
                          <p className="text-xs text-muted-foreground">{req.customerPhone}</p>
                        </div>
                        <div className="text-xs text-muted-foreground text-right">
                          <p>{new Date(req.createdAt).toLocaleString()}</p>
                          <p>الحالة: {req.status === 'pending' ? 'جديد' : req.status === 'followed_up' ? 'تمت المتابعة' : 'ملغي'}</p>
                        </div>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        {req.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground">
                              صورة
                            </div>
                            <div className="flex-1">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-muted-foreground text-xs">الكمية: {item.quantity}</p>
                              <p className="text-muted-foreground text-xs">
                                الجودة: {item.quality === 'imported' ? 'استيراد' : item.quality === 'new' ? 'جديد' : 'غير محدد'}
                              </p>
                              <p className="text-muted-foreground text-xs">
                                السعر: {typeof item.unitPrice === 'number' ? `ج.م ${item.unitPrice}` : 'سعر حسب العرض'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">{req.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => followUpRequest(req)} disabled={req.status === 'cancelled' || pendingRequestIds.has(req.id)}>
                          متابعة على واتساب
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cancelRequest(req.id)} disabled={req.status === 'cancelled' || pendingRequestIds.has(req.id)}>
                          إلغاء الطلب
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="products">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">إضافة منتج جديد</h3>
                <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-title">اسم المنتج</Label>
                    <Input
                      id="prod-title"
                      value={newProduct.title}
                      onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                      placeholder="مثال: بطارية فارتا 70 أمبير"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-desc">الوصف</Label>
                    <Textarea
                      id="prod-desc"
                      value={newProduct.description}
                      onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                      placeholder="وصف مختصر للمنتج"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label>الجودة المتاحة</Label>
                    <div className="flex flex-wrap gap-3 mt-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newProduct.newAvailable}
                          onChange={(e) => setNewProduct({ ...newProduct, newAvailable: e.target.checked })}
                        />
                        جديد
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={newProduct.importedAvailable}
                          onChange={(e) => setNewProduct({ ...newProduct, importedAvailable: e.target.checked })}
                        />
                        استيراد
                      </label>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="prod-price">سعر الجديد</Label>
                    <Input
                      id="prod-price"
                      value={newProduct.newPrice}
                      onChange={(e) => setNewProduct({ ...newProduct, newPrice: e.target.value })}
                      placeholder="1950"
                      disabled={!newProduct.newAvailable}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-category">الفئة</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => setNewProduct({ ...newProduct, category: value })}
                    >
                      <SelectTrigger id="prod-category">
                        <SelectValue placeholder="اختر الفئة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="غير محدد">غير محدد</SelectItem>
                        {categories.map((cat) => (
                          <SelectItem key={cat.id} value={cat.name}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-brands">الماركات المدعومة</Label>
                    <div className="border border-border rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto">
                      {brandOptions.map((option, brandIndex) => (
                        <div key={`${option.brand}-${brandIndex}`} className="space-y-2">
                          <label className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={newProductBrands.includes(option.brand)}
                              onChange={() => toggleBrandSelection(option.brand, false)}
                            />
                            <span className="text-sm font-medium">{option.brand}</span>
                          </label>
                          {option.models.length > 0 && (
                            <div className="grid gap-2 pl-6">
                              {option.models.map((model, modelIndex) => {
                                const value = `${option.brand} - ${model}`;
                                const selected = newProductBrands.includes(value);
                                return (
                                  <label key={`${value}-${modelIndex}`} className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={selected}
                                      onChange={() => toggleBrandSelection(value, false)}
                                    />
                                    <span className="text-sm text-muted-foreground">{model}</span>
                                  </label>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">اختر ماركة أو موديل واحد أو أكثر.</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-image">صورة المنتج</Label>
                    <Input
                      id="prod-image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageChange(e.target.files?.[0] || null, false)}
                    />
                    {newProduct.imageDataUrl && (
                      <div className="mt-3">
                        <img
                          src={newProduct.imageDataUrl}
                          alt="معاينة المنتج"
                          className="h-32 w-32 rounded object-cover border border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Button onClick={handleCreateProduct}>إضافة المنتج</Button>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">كل المنتجات</h3>
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">مافيش منتجات لسه.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => {
                      const isInlineEditing = editingId === product.id;

                      return (
                        <div
                          key={product.id}
                          className={[
                            'rounded-lg border transition-all',
                            isInlineEditing
                              ? 'border-primary/40 bg-card p-4 md:p-5 shadow-card-hover space-y-4'
                              : 'border-border/50 bg-muted/50 p-3',
                          ].join(' ')}
                        >
                          {!isInlineEditing ? (
                            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                              <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                                {product.imageDataUrl ? (
                                  <img
                                    src={product.imageDataUrl}
                                    alt={product.title}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                    decoding="async"
                                  />
                                ) : (
                                  'صورة'
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{product.title}</p>
                                <p className="text-xs text-muted-foreground">الوصف: {product.description}</p>
                                <p className="text-xs text-muted-foreground">
                                  جديد: {product.newAvailable && typeof product.newPrice === 'number'
                                    ? `ج.م ${product.newPrice.toFixed(0)}`
                                    : 'غير متاح'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  استيراد: {product.importedAvailable ? 'متاح' : 'غير متاح'}
                                </p>
                                <p className="text-xs text-muted-foreground">الفئة: {product.category}</p>
                                <p className="text-xs text-muted-foreground">
                                  الماركات: {formatCarBrands(product.carBrands)}
                                </p>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" variant="outline" onClick={() => startEdit(product.id)}>
                                  تعديل
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
                                  حذف
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between gap-2">
                                <h4 className="font-semibold text-primary">تعديل المنتج: {product.title}</h4>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={handleSaveEdit}>حفظ التعديل</Button>
                                  <Button size="sm" variant="outline" onClick={cancelEdit}>إلغاء</Button>
                                </div>
                              </div>

                              <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                                <div className="md:col-span-2">
                                  <Label htmlFor={`edit-title-${product.id}`}>اسم المنتج</Label>
                                  <Input
                                    id={`edit-title-${product.id}`}
                                    value={editingProduct.title}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                                  />
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor={`edit-desc-${product.id}`}>الوصف</Label>
                                  <Textarea
                                    id={`edit-desc-${product.id}`}
                                    value={editingProduct.description}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                                    rows={4}
                                  />
                                </div>
                                <div>
                                  <Label>الجودة المتاحة</Label>
                                  <div className="flex flex-wrap gap-3 mt-2">
                                    <label className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={editingProduct.newAvailable}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, newAvailable: e.target.checked })}
                                      />
                                      جديد
                                    </label>
                                    <label className="flex items-center gap-2 text-sm">
                                      <input
                                        type="checkbox"
                                        checked={editingProduct.importedAvailable}
                                        onChange={(e) => setEditingProduct({ ...editingProduct, importedAvailable: e.target.checked })}
                                      />
                                      استيراد
                                    </label>
                                  </div>
                                </div>
                                <div>
                                  <Label htmlFor={`edit-price-${product.id}`}>سعر الجديد</Label>
                                  <Input
                                    id={`edit-price-${product.id}`}
                                    value={editingProduct.newPrice}
                                    onChange={(e) => setEditingProduct({ ...editingProduct, newPrice: e.target.value })}
                                    disabled={!editingProduct.newAvailable}
                                  />
                                </div>
                                <div>
                                  <Label htmlFor={`edit-category-${product.id}`}>الفئة</Label>
                                  <Select
                                    value={editingProduct.category}
                                    onValueChange={(value) => setEditingProduct({ ...editingProduct, category: value })}
                                  >
                                    <SelectTrigger id={`edit-category-${product.id}`}>
                                      <SelectValue placeholder="اختر الفئة" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="غير محدد">غير محدد</SelectItem>
                                      {categories.map((cat) => (
                                        <SelectItem key={cat.id} value={cat.name}>
                                          {cat.name}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor={`edit-brands-${product.id}`}>الماركات المدعومة</Label>
                                  <div id={`edit-brands-${product.id}`} className="border border-border rounded-lg p-3 space-y-3 max-h-64 overflow-y-auto">
                                    {brandOptions.map((option, brandIndex) => (
                                      <div key={`${option.brand}-${brandIndex}`} className="space-y-2">
                                        <label className="flex items-center gap-2">
                                          <input
                                            type="checkbox"
                                            checked={editingProductBrands.includes(option.brand)}
                                            onChange={() => toggleBrandSelection(option.brand, true)}
                                          />
                                          <span className="text-sm font-medium">{option.brand}</span>
                                        </label>
                                        {option.models.length > 0 && (
                                          <div className="grid gap-2 pl-6">
                                            {option.models.map((model, modelIndex) => {
                                              const value = `${option.brand} - ${model}`;
                                              const selected = editingProductBrands.includes(value);
                                              return (
                                                <label key={`${value}-${modelIndex}`} className="flex items-center gap-2">
                                                  <input
                                                    type="checkbox"
                                                    checked={selected}
                                                    onChange={() => toggleBrandSelection(value, true)}
                                                  />
                                                  <span className="text-sm text-muted-foreground">{model}</span>
                                                </label>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                                <div className="md:col-span-2">
                                  <Label htmlFor={`edit-image-${product.id}`}>صورة المنتج</Label>
                                  <Input
                                    id={`edit-image-${product.id}`}
                                    type="file"
                                    accept="image/*"
                                    capture="environment"
                                    onChange={(e) => handleImageChange(e.target.files?.[0] || null, true)}
                                  />
                                  {editingProduct.imageDataUrl && (
                                    <div className="mt-3">
                                      <img
                                        src={editingProduct.imageDataUrl}
                                        alt="معاينة المنتج"
                                        className="h-32 w-32 rounded object-cover border border-border"
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6">
              <h3 className="font-semibold mb-4">إعدادات واتساب</h3>
              {isLoading ? (
                <LoadingState title="جاري تحميل الإعدادات" message="برجاء الانتظار..." />
              ) : (
                <>
                  {settingsError && (
                    <div className="mb-4">
                      <InlineError
                        title="تعذر تحميل الإعدادات"
                        message={settingsError}
                        onRetry={loadAdminData}
                      />
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="wa-phone">رقم واتساب</Label>
                      <Input
                        id="wa-phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(sanitizePhoneInput(e.target.value))}
                        placeholder="201000000000"
                        type="tel"
                        inputMode="tel"
                        maxLength={16}
                      />
                    </div>
                  </div>
                  <Button className="mt-6" onClick={handleSaveSettings} disabled={saving}>
                    {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
                  </Button>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="customer-service">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6">
              <h3 className="font-semibold mb-4">بيانات خدمة العملاء</h3>
              <div className="grid md:grid-cols-2 gap-3 md:gap-4">
                <div>
                  <Label htmlFor="cs-email">البريد الإلكتروني</Label>
                  <Input
                    id="cs-email"
                    type="email"
                    value={customerService.supportEmail}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, supportEmail: e.target.value }))}
                    placeholder="support@example.com"
                  />
                </div>
                <div>
                  <Label htmlFor="cs-phone">رقم خدمة العملاء</Label>
                  <Input
                    id="cs-phone"
                    type="tel"
                    value={customerService.supportPhone}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, supportPhone: sanitizePhoneInput(e.target.value) }))}
                    placeholder="+20XXXXXXXXXX"
                    inputMode="tel"
                    maxLength={16}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cs-address">العنوان</Label>
                  <Input
                    id="cs-address"
                    value={customerService.supportAddress}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, supportAddress: e.target.value }))}
                    placeholder="العنوان"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cs-faq">الأسئلة الشائعة</Label>
                  <Textarea
                    id="cs-faq"
                    value={customerService.faqContent}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, faqContent: e.target.value }))}
                    placeholder="اكتب فقرة أو أكثر، وافصل بين الفقرات بسطر فاضي."
                    rows={4}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cs-shipping">معلومات الشحن</Label>
                  <Textarea
                    id="cs-shipping"
                    value={customerService.shippingInfo}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, shippingInfo: e.target.value }))}
                    placeholder="اكتب تفاصيل الشحن، وافصل بين الفقرات بسطر فاضي."
                    rows={3}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cs-return">سياسة الاسترجاع</Label>
                  <Textarea
                    id="cs-return"
                    value={customerService.returnPolicy}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, returnPolicy: e.target.value }))}
                    placeholder="اكتب سياسة الاسترجاع، وافصل بين الفقرات بسطر فاضي."
                    rows={5}
                  />
                </div>
                <div className="md:col-span-2">
                  <Label htmlFor="cs-last-updated">آخر تحديث</Label>
                  <Input
                    id="cs-last-updated"
                    value={customerService.lastUpdated}
                    onChange={(e) => setCustomerService((prev) => ({ ...prev, lastUpdated: e.target.value }))}
                    placeholder="مثال: 31 يناير 2026"
                  />
                </div>
              </div>
              <Button className="mt-6" onClick={handleSaveCustomerService} disabled={customerServiceSaving}>
                {customerServiceSaving ? 'جاري الحفظ...' : 'حفظ بيانات خدمة العملاء'}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security">
            <div className="bg-card rounded-lg md:rounded-xl shadow-card p-4 md:p-6">
              <div className="flex items-center gap-3 mb-6">
                <Key className="h-6 w-6 text-primary" />
                <h3 className="font-semibold">تغيير كلمة السر</h3>
              </div>
              <PasswordChangeForm />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
