import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { RatingStars } from '@/components/RatingStars';
import { getVendorById, getProductsByVendor } from '@/data/mockData';
import { Store, MapPin, Calendar, Package, ShoppingBag, MessageCircle } from 'lucide-react';

const VendorStore = () => {
  const { id } = useParams<{ id: string }>();
  const vendor = getVendorById(id || '');
  const products = vendor ? getProductsByVendor(vendor.id) : [];

  if (!vendor) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">التاجر غير موجود</h1>
          <Link to="/">
            <Button>رجوع للرئيسية</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const stats = [
    { label: 'منتجات', value: products.length, icon: Package },
    { label: 'طلبات', value: vendor.totalOrders.toLocaleString(), icon: ShoppingBag },
    { label: 'تقييم', value: vendor.rating.toFixed(1), icon: Store },
  ];

  return (
    <Layout>
      {/* Banner */}
      <div className="relative h-48 md:h-64 bg-cover bg-center" style={{ backgroundImage: `url(${vendor.banner})` }}>
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
      </div>

      <div className="container -mt-16 relative z-10">
        {/* Vendor Info Card */}
        <div className="bg-card rounded-xl p-6 shadow-card-hover">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={vendor.logo}
              alt={vendor.storeName}
              className="w-24 h-24 md:w-32 md:h-32 rounded-xl object-cover border-4 border-card shadow-lg -mt-12 md:-mt-16"
            />
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">{vendor.storeName}</h1>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                    <RatingStars rating={vendor.rating} reviewCount={vendor.reviewCount} size="md" />
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      انضم في {vendor.createdAt}
                    </span>
                  </div>
                  <p className="text-muted-foreground max-w-2xl">{vendor.description}</p>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline">
                    <MessageCircle className="h-4 w-4 mr-2" />
                    تواصل
                  </Button>
                  <Button>
                    تابع المتجر
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            {stats.map(({ label, value, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Icon className="h-5 w-5 text-primary" />
                  <span className="text-xl md:text-2xl font-bold text-foreground">{value}</span>
                </div>
                <p className="text-sm text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Products */}
        <div className="mt-8 mb-8">
          <h2 className="text-xl font-bold mb-4">كل المنتجات ({products.length})</h2>
          
          {products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-xl">
              <p className="text-muted-foreground">مافيش منتجات متاحة لسه</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VendorStore;
