import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getProductsByVendor, getOrdersByVendor, payoutRequests } from '@/data/mockData';
import { Package, ShoppingBag, DollarSign, TrendingUp, Plus, Store, Settings, CreditCard } from 'lucide-react';

const VendorDashboard = () => {
  const { user, vendor } = useAuth();
  const products = vendor ? getProductsByVendor(vendor.id) : [];
  const orders = vendor ? getOrdersByVendor(vendor.id) : [];
  const payouts = vendor ? payoutRequests.filter(p => p.vendorId === vendor.id) : [];

  if (!vendor || vendor.status !== 'approved') {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-6">You need to be an approved vendor to access this page.</p>
          <Link to="/vendor/register"><Button>Register as Vendor</Button></Link>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'Total Sales', value: `$${vendor.totalSales.toLocaleString()}`, icon: DollarSign, color: 'text-green-600' },
    { label: 'Products', value: products.length, icon: Package, color: 'text-blue-600' },
    { label: 'Orders', value: vendor.totalOrders, icon: ShoppingBag, color: 'text-purple-600' },
    { label: 'Rating', value: vendor.rating.toFixed(1), icon: TrendingUp, color: 'text-amber-600' },
  ];

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Vendor Dashboard</h1>
            <p className="text-muted-foreground">{vendor.storeName}</p>
          </div>
          <Link to={`/vendor/${vendor.id}`}><Button variant="outline"><Store className="h-4 w-4 mr-2" />View Store</Button></Link>
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
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="payouts">Payouts</TabsTrigger>
            <TabsTrigger value="settings">Store Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Your Products ({products.length})</h3>
                <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Product</Button>
              </div>
              <div className="space-y-3">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                    <img src={p.images[0]} alt={p.title} className="w-12 h-12 rounded object-cover" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{p.title}</p>
                      <p className="text-sm text-muted-foreground">${p.price} • {p.stock} in stock</p>
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">Recent Orders</h3>
              {orders.length > 0 ? orders.map(o => (
                <div key={o.id} className="p-3 border-b last:border-0">
                  <p className="font-medium">Order #{o.id}</p>
                  <p className="text-sm text-muted-foreground">{o.status} • ${o.total.toFixed(2)}</p>
                </div>
              )) : <p className="text-muted-foreground">No orders yet</p>}
            </div>
          </TabsContent>

          <TabsContent value="payouts">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold">Payout Requests</h3>
                <Button size="sm"><CreditCard className="h-4 w-4 mr-2" />Request Payout</Button>
              </div>
              {payouts.map(p => (
                <div key={p.id} className="p-3 border-b last:border-0 flex justify-between">
                  <div>
                    <p className="font-medium">${p.amount}</p>
                    <p className="text-sm text-muted-foreground">{p.requestedAt}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs capitalize ${p.status === 'paid' ? 'bg-green-100 text-green-800' : p.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">Store Settings</h3>
              <p className="text-muted-foreground text-sm">Store settings would be configurable here. This is a demo prototype.</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default VendorDashboard;
