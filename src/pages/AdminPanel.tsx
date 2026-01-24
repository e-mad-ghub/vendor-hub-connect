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
import { MessageCircle, FileDown, Settings } from 'lucide-react';
import { toast } from 'sonner';

interface QuoteRequestItem {
  productId: string;
  title: string;
  quantity: number;
  price: number;
  image: string;
}

interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: QuoteRequestItem[];
  createdAt: string;
}

const AdminPanel = () => {
  const { user } = useAuth();
  const [requests, setRequests] = React.useState<QuoteRequest[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [phoneNumber, setPhoneNumber] = React.useState('');
  const [messageTemplate, setMessageTemplate] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => {
    if (user?.role !== 'admin') return;
    let isMounted = true;
    setIsLoading(true);
    Promise.all([api.listQuoteRequests(), api.getWhatsAppSettings()])
      .then(([quotes, settings]) => {
        if (!isMounted) return;
        setRequests(quotes || []);
        setPhoneNumber(settings?.phoneNumber || '');
        setMessageTemplate(settings?.messageTemplate || '');
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
        messageTemplate: messageTemplate.trim(),
      });
      setPhoneNumber(updated.phoneNumber || '');
      setMessageTemplate(updated.messageTemplate || '');
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

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-card rounded-xl p-4 shadow-card">
            <MessageCircle className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{requests.length}</p>
            <p className="text-xs text-muted-foreground">طلبات عروض السعر</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <Settings className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">{phoneNumber ? 'نشط' : 'غير مُعد'}</p>
            <p className="text-xs text-muted-foreground">إعدادات واتساب</p>
          </div>
          <div className="bg-card rounded-xl p-4 shadow-card">
            <FileDown className="h-6 w-6 text-primary mb-2" />
            <p className="text-2xl font-bold">CSV</p>
            <p className="text-xs text-muted-foreground">تصدير الطلبات</p>
          </div>
        </div>

        <Tabs defaultValue="requests" className="space-y-4">
          <TabsList>
            <TabsTrigger value="requests">طلبات عروض السعر</TabsTrigger>
            <TabsTrigger value="settings">إعدادات واتساب</TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">سجل الطلبات</h3>
                <Button size="sm" variant="outline" onClick={exportCsv} disabled={requests.length === 0}>
                  <FileDown className="h-4 w-4 mr-2" />
                  تصدير CSV
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
                        <p className="text-xs text-muted-foreground">{new Date(req.createdAt).toLocaleString()}</p>
                      </div>
                      <div className="mt-3 space-y-2 text-sm">
                        {req.items.map((item) => (
                          <div key={item.productId} className="flex items-center gap-2">
                            <img src={item.image} alt="" className="w-10 h-10 rounded object-cover" />
                            <div className="flex-1">
                              <p className="font-medium">{item.title}</p>
                              <p className="text-muted-foreground text-xs">الكمية: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-3">{req.message}</p>
                    </div>
                  ))}
                </div>
              )}
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
                <div>
                  <Label htmlFor="wa-template">قالب الرسالة الافتراضي</Label>
                  <Textarea
                    id="wa-template"
                    value={messageTemplate}
                    onChange={(e) => setMessageTemplate(e.target.value)}
                    placeholder="Hello, my name is [Customer Name]..."
                    rows={5}
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    المتغيرات المتاحة: [Customer Name], [Customer Phone], [Items]
                  </p>
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
