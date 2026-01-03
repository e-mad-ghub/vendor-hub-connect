import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { getOrdersByCustomer } from '@/data/mockData';
import { User, Package, Heart, MapPin, Settings, LogOut, ChevronRight, ShoppingBag } from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();
  const { user, vendor, logout } = useAuth();
  const orders = user ? getOrdersByCustomer(user.id) : [];

  if (!user) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">سجل الدخول الأول</h1>
          <Link to="/login">
            <Button>تسجيل دخول</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: Package, label: 'طلباتي', count: orders.length },
    { icon: Heart, label: 'المفضلة', count: 0 },
    { icon: MapPin, label: 'العناوين' },
    { icon: Settings, label: 'الإعدادات' },
  ];

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'vendor': return 'بائع';
      case 'admin': return 'أدمن';
      default: return 'عميل';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered': return 'text-marketplace-success bg-green-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'processing': return 'text-amber-600 bg-amber-100';
      default: return 'text-muted-foreground bg-muted';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'delivered': return 'تم التوصيل';
      case 'shipped': return 'تم الشحن';
      case 'processing': return 'جارٍ التحضير';
      default: return status;
    }
  };

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        {/* Profile Header */}
        <div className="bg-card rounded-xl shadow-card p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-8 w-8 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-bold">{user.name}</h1>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize mt-1">
                حساب {getRoleLabel(user.role)} • عضو من {user.createdAt}
              </p>
            </div>
          </div>

          {/* Role-specific actions */}
          <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
            {user.role === 'vendor' && (
              <Link to="/vendor/dashboard">
                <Button size="sm">لوحة تحكم البائع</Button>
              </Link>
            )}
            {user.role === 'admin' && (
              <Link to="/admin">
                <Button size="sm">لوحة الإدارة</Button>
              </Link>
            )}
            <Button size="sm" variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل خروج
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="orders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="orders">الطلبات</TabsTrigger>
            <TabsTrigger value="wishlist">المفضلة</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card">
              {orders.length > 0 ? (
                <div className="divide-y divide-border">
                  {orders.map((order) => (
                    <div key={order.id} className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-medium">طلب رقم {order.id}</p>
                          <p className="text-sm text-muted-foreground">{order.createdAt}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      
                      <div className="flex gap-2 overflow-x-auto hide-scrollbar">
                        {order.items.map((item) => (
                          <img
                            key={item.productId}
                            src={item.image}
                            alt={item.title}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                        ))}
                      </div>
                      
                      <div className="flex items-center justify-between mt-3">
                        <p className="font-semibold">ج.م {order.total.toFixed(2)}</p>
                        <Button variant="ghost" size="sm">
                          عرض التفاصيل <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">مافيش طلبات لسه</p>
                  <Link to="/search">
                    <Button className="mt-4">ابدأ التسوق</Button>
                  </Link>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="wishlist">
            <div className="bg-card rounded-xl shadow-card p-8 text-center">
              <Heart className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">قائمة المفضلة فاضية</p>
              <Link to="/search">
                <Button className="mt-4">تصفح المنتجات</Button>
              </Link>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            <div className="bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold mb-4">إعدادات الحساب</h3>
              <p className="text-muted-foreground text-sm">
                إعدادات الحساب هتكون هنا. ده نموذج تجريبي.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Account;
