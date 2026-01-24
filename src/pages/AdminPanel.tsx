import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/lib/api';
import { MessageCircle, FileDown, Settings, Package } from 'lucide-react';
import { toast } from 'sonner';
import { useProducts } from '@/data/productsStore';
import type { QuoteRequest } from '@/types/marketplace';

const AdminPanel = () => {
  const { user, logout } = useAuth();
  const [requests, setRequests] = React.useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const { products, createProduct, deleteProduct, editProduct } = useProducts();
  const [newProduct, setNewProduct] = React.useState({
    title: '',
    description: '',
    price: '',
    category: '',
    carBrands: '',
    imageDataUrl: '',
  });
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editingProduct, setEditingProduct] = React.useState({
    title: '',
    description: '',
    price: '',
    category: '',
    carBrands: '',
    imageDataUrl: '',
  });

  React.useEffect(() => {
    if (user?.role !== 'admin') return;
    let isMounted = true;
    setIsLoading(true);
    Promise.all([api.listQuoteRequests(), api.getWhatsAppSettings()])
      .then(([quotes, settings]) => {
        if (!isMounted) return;
        setRequests(quotes || []);
        setPhoneNumber(settings?.phoneNumber || '');
      })
      .catch(() => {
        if (!isMounted) return;
        setRequests([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [user]);

  if (user?.role !== 'admin') {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">الدخول كأدمن مطلوب</h1>
          <Link to="/login"><Button>سجل دخول كأدمن</Button></Link>
        </div>
      </Layout>
    );
  }

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const updated = await api.updateWhatsAppSettings({
        phoneNumber: phoneNumber.trim(),
      });
      setPhoneNumber(updated.phoneNumber || '');
      toast.success('تم تحديث إعدادات واتساب');
    } catch (e: any) {
      toast.error(e.message || 'تعذر حفظ الإعدادات');
    } finally {
      setSaving(false);
    }
  };

  const exportCsv = () => {
    const headers = ['id', 'customerName', 'customerPhone', 'createdAt', 'items'];
    const rows = requests.map((req) => {
      const items = req.items.map((i) => `${i.title} x ${i.quantity}`).join(' | ');
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
    const phoneDigits = request.customerPhone.replace(/\D/g, '');
    if (!phoneDigits) {
      toast.error('رقم العميل غير صالح');
      return;
    }
    await api.updateQuoteRequestStatus(request.id, 'followed_up');
    setRequests((prev) => prev.map((item) => (item.id === request.id ? { ...item, status: 'followed_up' } : item)));
    const waUrl = `https://wa.me/${phoneDigits}?text=${encodeURIComponent('أهلًا، بخصوص طلب عرض السعر عندنا...')}`;
    window.location.href = waUrl;
  };

  const cancelRequest = async (requestId: string) => {
    await api.updateQuoteRequestStatus(requestId, 'cancelled');
    setRequests((prev) => prev.map((item) => (item.id === requestId ? { ...item, status: 'cancelled' } : item)));
    toast.success('تم إلغاء الطلب');
  };

  const handleCreateProduct = () => {
    const price = Number(newProduct.price);
    if (!newProduct.title.trim()) {
      toast.error('من فضلك اكتب اسم المنتج');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('ادخل سعر صالح');
      return;
    }
    createProduct({
      title: newProduct.title.trim(),
      description: newProduct.description.trim(),
      price,
      category: newProduct.category.trim() || 'غير محدد',
      carBrands: newProduct.carBrands
        .split(',')
        .map((brand) => brand.trim())
        .filter(Boolean),
      imageDataUrl: newProduct.imageDataUrl,
    });
    setNewProduct({
      title: '',
      description: '',
      price: '',
      category: '',
      carBrands: '',
      imageDataUrl: '',
    });
    toast.success('تمت إضافة المنتج');
  };

  const startEdit = (productId: string) => {
    const product = products.find((item) => item.id === productId);
    if (!product) return;
    setEditingId(productId);
    setEditingProduct({
      title: product.title,
      description: product.description,
      price: String(product.price),
      category: product.category,
      carBrands: product.carBrands?.join(', ') || '',
      imageDataUrl: product.imageDataUrl || '',
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingProduct({
      title: '',
      description: '',
      price: '',
      category: '',
      carBrands: '',
      imageDataUrl: '',
    });
  };

  const handleSaveEdit = () => {
    if (!editingId) return;
    const price = Number(editingProduct.price);
    if (!editingProduct.title.trim()) {
      toast.error('من فضلك اكتب اسم المنتج');
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      toast.error('ادخل سعر صالح');
      return;
    }
    editProduct(editingId, {
      title: editingProduct.title.trim(),
      description: editingProduct.description.trim(),
      price,
      category: editingProduct.category.trim() || 'غير محدد',
      carBrands: editingProduct.carBrands
        .split(',')
        .map((brand) => brand.trim())
        .filter(Boolean),
      imageDataUrl: editingProduct.imageDataUrl,
    });
    toast.success('تم تحديث المنتج');
    cancelEdit();
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
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">لوحة الإدارة</h1>
          <Button variant="outline" size="sm" onClick={logout}>
            تسجيل خروج
          </Button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
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
          <TabsList>
            <TabsTrigger value="requests">طلبات عروض السعر</TabsTrigger>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="settings">إعدادات واتساب</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">سجل الطلبات</h3>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={requests.length === 0}>
                  <FileDown className="h-4 w-4 mr-2" />
                  تصدير ملف
                </Button>
              </div>
              {isLoading ? (
                <p className="text-sm text-muted-foreground">جاري التحميل...</p>
              ) : requests.length === 0 ? (
                <p className="text-sm text-muted-foreground">مافيش طلبات لسه.</p>
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
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">{req.message}</p>
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button size="sm" onClick={() => followUpRequest(req)} disabled={req.status === 'cancelled'}>
                          متابعة على واتساب
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => cancelRequest(req.id)} disabled={req.status === 'cancelled'}>
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
            <div className="bg-card rounded-xl shadow-card p-6 space-y-6">
              <div>
                <h3 className="font-semibold mb-4">{editingId ? 'تعديل المنتج' : 'إضافة منتج جديد'}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-title">اسم المنتج</Label>
                    <Input
                      id="prod-title"
                      value={editingId ? editingProduct.title : newProduct.title}
                      onChange={(e) => (editingId
                        ? setEditingProduct({ ...editingProduct, title: e.target.value })
                        : setNewProduct({ ...newProduct, title: e.target.value })
                      )}
                      placeholder="مثال: بطارية فارتا 70 أمبير"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-desc">الوصف</Label>
                    <Textarea
                      id="prod-desc"
                      value={editingId ? editingProduct.description : newProduct.description}
                      onChange={(e) => (editingId
                        ? setEditingProduct({ ...editingProduct, description: e.target.value })
                        : setNewProduct({ ...newProduct, description: e.target.value })
                      )}
                      placeholder="وصف مختصر للمنتج"
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-price">السعر</Label>
                    <Input
                      id="prod-price"
                      value={editingId ? editingProduct.price : newProduct.price}
                      onChange={(e) => (editingId
                        ? setEditingProduct({ ...editingProduct, price: e.target.value })
                        : setNewProduct({ ...newProduct, price: e.target.value })
                      )}
                      placeholder="1950"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prod-category">الفئة</Label>
                    <Input
                      id="prod-category"
                      value={editingId ? editingProduct.category : newProduct.category}
                      onChange={(e) => (editingId
                        ? setEditingProduct({ ...editingProduct, category: e.target.value })
                        : setNewProduct({ ...newProduct, category: e.target.value })
                      )}
                      placeholder="كهرباء"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-brands">الماركات المدعومة</Label>
                    <Input
                      id="prod-brands"
                      value={editingId ? editingProduct.carBrands : newProduct.carBrands}
                      onChange={(e) => (editingId
                        ? setEditingProduct({ ...editingProduct, carBrands: e.target.value })
                        : setNewProduct({ ...newProduct, carBrands: e.target.value })
                      )}
                      placeholder="تويوتا, هيونداي, نيسان"
                    />
                    <p className="text-xs text-muted-foreground mt-1">افصل الماركات بفاصلة.</p>
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="prod-image">صورة المنتج</Label>
                    <Input
                      id="prod-image"
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={(e) => handleImageChange(e.target.files?.[0] || null, !!editingId)}
                    />
                    {(editingId ? editingProduct.imageDataUrl : newProduct.imageDataUrl) && (
                      <div className="mt-3">
                        <img
                          src={editingId ? editingProduct.imageDataUrl : newProduct.imageDataUrl}
                          alt="معاينة المنتج"
                          className="h-32 w-32 rounded object-cover border border-border"
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {editingId ? (
                    <>
                      <Button onClick={handleSaveEdit}>حفظ التعديل</Button>
                      <Button variant="outline" onClick={cancelEdit}>إلغاء</Button>
                    </>
                  ) : (
                    <Button onClick={handleCreateProduct}>إضافة المنتج</Button>
                  )}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-4">كل المنتجات</h3>
                {products.length === 0 ? (
                  <p className="text-sm text-muted-foreground">مافيش منتجات لسه.</p>
                ) : (
                  <div className="space-y-3">
                    {products.map((product) => (
                      <div key={product.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-[10px] text-muted-foreground overflow-hidden">
                          {product.imageDataUrl ? (
                            <img src={product.imageDataUrl} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            'صورة'
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{product.title}</p>
                          <p className="text-xs text-muted-foreground">الوصف: {product.description}</p>
                          <p className="text-xs text-muted-foreground">السعر: ج.م {product.price.toFixed(0)}</p>
                          <p className="text-xs text-muted-foreground">الفئة: {product.category}</p>
                          <p className="text-xs text-muted-foreground">
                            الماركات: {product.carBrands && product.carBrands.length > 0 ? product.carBrands.join('، ') : 'مش متحدد'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => startEdit(product.id)}>
                            تعديل
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => deleteProduct(product.id)}>
                            حذف
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">إعدادات واتساب</h3>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="wa-phone">رقم واتساب</Label>
                  <Input
                    id="wa-phone"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="201000000000"
                  />
                </div>
              </div>
              <Button className="mt-6" onClick={handleSaveSettings} disabled={saving}>
                {saving ? 'جاري الحفظ...' : 'حفظ الإعدادات'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
