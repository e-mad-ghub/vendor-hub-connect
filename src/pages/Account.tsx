import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { User, Heart, LogOut, ShoppingBag } from 'lucide-react';

const Account = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const quoteRequests: [] = [];

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

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'أدمن';
      default: return 'عميل';
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
            <TabsTrigger value="orders">طلبات عروض السعر</TabsTrigger>
            <TabsTrigger value="wishlist">المفضلة</TabsTrigger>
            <TabsTrigger value="settings">الإعدادات</TabsTrigger>
          </TabsList>

          <TabsContent value="orders">
            <div className="bg-card rounded-xl shadow-card">
              {quoteRequests.length > 0 ? (
                <div className="divide-y divide-border">{/* Placeholder for future */}</div>
              ) : (
                <div className="p-8 text-center">
                  <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">مافيش طلبات عروض سعر لسه</p>
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
