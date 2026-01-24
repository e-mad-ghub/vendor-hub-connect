import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useAvailabilityRequests } from '@/contexts/RequestContext';
import { getProductsByVendor, getOrdersByVendor, payoutRequests } from '@/data/mockData';
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, Store, CreditCard, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { products as productsStore } from '@/data/mockData';

const VendorDashboard = () => {
  const { vendor } = useAuth();
  const { requests, respondToRequest } = useAvailabilityRequests();
  const [products, setProducts] = React.useState(() => vendor ? getProductsByVendor(vendor.id) : []);
  const orders = vendor ? getOrdersByVendor(vendor.id) : [];
  const payouts = vendor ? payoutRequests.filter(p => p.vendorId === vendor.id) : [];
  const [quoteValues, setQuoteValues] = React.useState<Record<string, string>>({});
  const incomingRequests = vendor
    ? requests.filter(r => (!r.vendorId || r.vendorId === vendor.id) && (r.status === 'pending' || r.status === 'quoted'))
    : [];
  const [isAdding, setIsAdding] = React.useState(false);
  const [newProduct, setNewProduct] = React.useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    category: 'كهرباء',
    image: '',
  });

  const getSuggestedTotal = (requestId: string) => {
    const req = requests.find(r => r.id === requestId);
    if (!req) return 0;
    const snapshotTotal = req.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);
    return req.quotedTotal ?? snapshotTotal;
  };

  const handleSendQuote = (requestId: string) => {
    const suggested = getSuggestedTotal(requestId);
    const draftValue = quoteValues[requestId];
    const total = draftValue ? Number(draftValue) : suggested;

    if (!Number.isFinite(total) || total <= 0) {
      toast.error('حدد سعر صالح قبل الإرسال');
      return;
    }

    respondToRequest(requestId, { status: 'quoted', quotedTotal: total });
    toast.success('تم إرسال السعر للعميل');
  };

  const handleMarkUnavailable = (requestId: string) => {
    respondToRequest(requestId, { status: 'unavailable', sellerNote: 'غير متاح حالياً' });
    toast.info('تم الإبلاغ بعدم التوفر');
  };

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendor) return;
    if (!newProduct.title.trim() || !newProduct.price || !newProduct.image.trim()) {
      toast.error('اكمل البيانات المطلوبة');
      return;
    }
    const priceValue = Number(newProduct.price);
    const stockValue = Number(newProduct.stock || 0);
    if (!Number.isFinite(priceValue) || priceValue <= 0) {
      toast.error('سعر غير صالح');
      return;
    }
    const id = `p${Date.now()}`;
    const productRecord = {
      id,
      vendorId: vendor.id,
      title: newProduct.title,
      description: newProduct.description || 'بدون وصف',
      price: priceValue,
      stock: stockValue,
      category: newProduct.category,
      images: [newProduct.image],
      rating: 0,
      reviewCount: 0,
      sold: 0,
      createdAt: new Date().toISOString(),
    };
    productsStore.push(productRecord as any);
    setProducts(prev => [productRecord as any, ...prev]);
    setIsAdding(false);
    setNewProduct({ title: '', description: '', price: '', stock: '', category: 'كهرباء', image: '' });
    toast.success('تم إضافة المنتج');
  };

  if (!vendor || vendor.status !== 'approved') {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">الدخول مرفوض</h1>
          <p className="text-muted-foreground mb-6">لازم تكون بائع متوافق عليه. التسجيل للبائعين مقفول؛ اتواصل مع الأدمن لو محتاج تفعيل.</p>
          <Link to="/"><Button>رجوع للرئيسية</Button></Link>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'إجمالي المبيعات', value: `ج.م ${vendor.totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'عدد المنتجات', value: products.length, icon: Package, color: 'text-blue-600' },
    { label: 'إجمالي الطلبات', value: vendor.totalOrders, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'التقييم', value: vendor.rating.toFixed(1), icon: TrendingUp, color: 'text-amber-600' },
  ];

  const orderStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التوصيل';
      case 'shipped': return 'تم الشحن';
      case 'processing': return 'جارٍ التحضير';
      case 'pending': return 'قيد المراجعة';
      case 'cancelled': return 'ملغي';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">لوحة تحكم البائع</h1>
            <p className="text-muted-foreground">{vendor.storeName}</p>
          </div>
          <Link to={`/vendor/${vendor.id}`}><Button variant="outline"><Store className="h-4 w-4 mr-2" />عرض المتجر</Button></Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-card rounded-xl p-4 shadow-card">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${color}`}><Icon className="h-5 w-5" /></div>
                <div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className="text-xs text-muted-foreground">{label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Tabs defaultValue="products" className="space-y-4">
          <TabsList>
            <TabsTrigger value="products">المنتجات</TabsTrigger>
            <TabsTrigger value="requests">طلبات الأسعار</TabsTrigger>
            <TabsTrigger value="orders">طلبات الشراء</TabsTrigger>
            <TabsTrigger value="payouts">الدفعات</TabsTrigger>
            <TabsTrigger value="settings">إعدادات المتجر</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">منتجاتك ({products.length})</h3>
                <Button size="sm" onClick={() => setIsAdding(v => !v)}>
                  <Plus className="h-4 w-4 mr-2" />
                  {isAdding ? 'إلغاء' : 'أضف منتج'}
                </Button>
              </div>
              {isAdding && (
                <form onSubmit={handleAddProduct} className="grid md:grid-cols-2 gap-3 mb-4 p-4 border border-border rounded-lg bg-muted/30">
                  <div className="md:col-span-2">
                    <Label>اسم المنتج</Label>
                    <Input value={newProduct.title} onChange={(e) => setNewProduct(p => ({ ...p, title: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>السعر (ج.م)</Label>
                    <Input type="number" value={newProduct.price} onChange={(e) => setNewProduct(p => ({ ...p, price: e.target.value }))} required />
                  </div>
                  <div>
                    <Label>المخزون</Label>
                    <Input type="number" value={newProduct.stock} onChange={(e) => setNewProduct(p => ({ ...p, stock: e.target.value }))} />
                  </div>
                  <div>
                    <Label>الفئة</Label>
                    <Input value={newProduct.category} onChange={(e) => setNewProduct(p => ({ ...p, category: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2">
                    <Label>رابط الصورة</Label>
                    <Input value={newProduct.image} onChange={(e) => setNewProduct(p => ({ ...p, image: e.target.value }))} placeholder="https://..." required />
                  </div>
                  <div className="md:col-span-2">
                    <Label>الوصف</Label>
                    <Textarea rows={3} value={newProduct.description} onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                  </div>
                  <div className="md:col-span-2 flex justify-end">
                    <Button type="submit" size="sm">حفظ المنتج</Button>
                  </div>
                </form>
              )}
              <div className="space-y-3">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-sm text-muted-foreground">ج.م {p.price} • {p.stock} متاح</p>
                    </div>
                    <Button variant="ghost" size="sm" disabled>تعديل</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">طلبات التوفر والسعر</h3>
                <span className="text-sm text-muted-foreground">{incomingRequests.length} طلب</span>
              </div>

              {incomingRequests.length > 0 ? (
                <div className="space-y-3">
                  {incomingRequests.map(req => (
                    <div key={req.id} className="p-4 border border-border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">طلب #{req.id}</p>
                          <p className="text-xs text-muted-foreground">
                            {req.items.length} منتجات • {req.status === 'pending' ? 'بانتظار ردك' : 'سعر مرسل - مسموح بالتعديل'}
                          </p>
                          <p className="text-xs text-muted-foreground">تليفون العميل: {req.buyerPhone || 'غير متوفر'}</p>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'}`}>
                          {req.status === 'pending' ? 'بانتظار الرد' : 'سعر مرسل'}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2">
                        {req.items.map(item => (
                          <div key={item.productId} className="flex items-center gap-3 text-sm">
                            <img src={item.image} alt={item.title} className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-xs text-muted-foreground">كمية: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="mt-4 grid md:grid-cols-3 gap-3 items-center">
                        <div className="md:col-span-2 flex items-center gap-2">
                          <Input
                            type="number"
                            min="0"
                            value={quoteValues[req.id] ?? getSuggestedTotal(req.id).toString()}
                            onChange={(e) => setQuoteValues(prev => ({ ...prev, [req.id]: e.target.value }))}
                            className="flex-1"
                          />
                          <span className="text-sm text-muted-foreground">ج.م</span>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" className="flex-1" onClick={() => handleSendQuote(req.id)}>
                            إرسال السعر
                          </Button>
                          <Button size="sm" variant="outline" className="flex-1" onClick={() => handleMarkUnavailable(req.id)}>
                            غير متاح
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <Clock className="h-4 w-4" />
                  <p>مافيش طلبات حالية من العملاء.</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">أحدث الطلبات</h3>
              {orders.length > 0 ? orders.map(o => (
                <div key={o.id} className="p-3 border-b last:border-0">
                  <p className="font-medium">طلب #{o.id}</p>
                  <p className="text-sm text-muted-foreground">{orderStatusLabel(o.status)} • ج.م {o.total.toFixed(2)}</p>
                </div>
              )) : <p className="text-muted-foreground">مافيش طلبات لسه</p>}
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">طلبات الدفع</h3>
                <Button size="sm"><CreditCard className="h-4 w-4 mr-2" />اطلب دفعة</Button>
              </div>
              {payouts.map(p => (
                <div key={p.id} className="p-3 border-b last:border-0 flex justify-between">
                  <div>
                    <p className="font-medium">ج.م {p.amount}</p>
                    <p className="text-sm text-muted-foreground">{p.requestedAt}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs capitalize ${p.status === 'paid' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>
                    {p.status === 'paid' ? 'مدفوع' : p.status === 'pending' ? 'قيد المراجعة' : 'مقبول'}
                  </span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">إعدادات المتجر</h3>
              <p className="text-muted-foreground text-sm">إعدادات المتجر هتكون هنا. ده نموذج تجريبي.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
