import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { vendors, orders, payoutRequests, platformSettings } from '@/data/mockData';
import { Users, Store, ShoppingBag, DollarSign, Check, X, Settings } from 'lucide-react';

const AdminPanel = () => {
  const { user } = useAuth();
  const pendingVendors = vendors.filter(v => v.status === 'pending');
  const pendingPayouts = payoutRequests.filter(p => p.status === 'pending');
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);

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

  const stats = [
    { label: 'إجمالي التجار', value: vendors.length, icon: Store },
    { label: 'إجمالي الطلبات', value: orders.length, icon: ShoppingBag },
    { label: 'الإيراد', value: `ج.م ${totalRevenue.toFixed(0)}`, icon: DollarSign },
    { label: 'طلبات المراجعة', value: pendingVendors.length, icon: Users },
  ];

  const statusLabel = (status: string) => {
    switch (status) {
      case 'approved': return 'مقبول';
      case 'pending': return 'قيد المراجعة';
      case 'rejected': return 'مرفوض';
      case 'paid': return 'مدفوع';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl font-bold mb-6">لوحة الإدارة</h1>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {stats.map(({ label, value, icon: Icon }) => (
            <div key={label} className="bg-card rounded-xl p-4 shadow-card">
              <Icon className="h-6 w-6 text-primary mb-2" />
              <p className="text-2xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          ))}
        </div>

        <Tabs defaultValue="vendors" className="space-y-4">
          <TabsList>
            <TabsTrigger value="vendors">التجار</TabsTrigger>
            <TabsTrigger value="payouts">الدفعات</TabsTrigger>
            <TabsTrigger value="settings">إعدادات المنصة</TabsTrigger>
          </TabsList>

          <TabsContent value="vendors">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">كل التجار</h3>
              <div className="space-y-3">
                {vendors.map(v => (
                  <div key={v.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img src={v.logo} alt={v.storeName} className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1">
                      <p className="font-medium">{v.storeName}</p>
                      <p className="text-xs text-muted-foreground">عمولة: {v.commissionRate || platformSettings.defaultCommissionRate}%</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs capitalize ${v.status === 'approved' ? 'bg-green-100 text-green-800' : v.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'}`}>{statusLabel(v.status)}</span>
                    {v.status === 'pending' && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-green-600"><Check className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-red-600"><X className="h-4 w-4" /></Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">طلبات الدفع</h3>
              {payoutRequests.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">ج.م {p.amount}</p>
                    <p className="text-sm text-muted-foreground">التاجر: {vendors.find(v => v.id === p.vendorId)?.storeName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs capitalize ${p.status === 'paid' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{statusLabel(p.status)}</span>
                    {p.status === 'pending' && <Button size="sm">موافقة</Button>}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">إعدادات المنصة</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>العمولة الافتراضية</span>
                  <span className="font-bold">{platformSettings.defaultCommissionRate}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                  <span>أقل دفعة</span>
                  <span className="font-bold">ج.م {platformSettings.minPayoutAmount}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default AdminPanel;
