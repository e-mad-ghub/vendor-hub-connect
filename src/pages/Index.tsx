import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { products, categories } from '@/data/mockData';

const Index = () => {
  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 6);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const features = [
    { icon: Truck, title: 'شحن مرن', desc: 'ننسق معاك بعد تأكيد العرض' },
    { icon: Shield, title: 'طلبات موثوقة', desc: 'تأكيد يدوي للأسعار والتوافر' },
    { icon: RefreshCw, title: 'تعديلات سهلة', desc: 'عدّل السلة واطلب عرض جديد' },
    { icon: Headphones, title: 'دعم سريع', desc: 'نتواصل معاك عبر واتساب' },
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary mb-4">🔥 عروض سخنة</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                اكتشف منتجات جاهزة مع{' '}
                <span className="text-primary">طلب عرض سعر عبر واتساب</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
                منتجات مختارة من فريق واحد موثوق. اطلب عرض سعر وتأكد من التوافر بسرعة عبر واتساب.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/search">
                  <Button size="lg" className="w-full sm:w-auto">
                    ابدأ التسوق
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/cart">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    اطلب عرض سعر
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <img
                src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDBAELcCBZvFeMrydahzOwchiBAohWXYTgmA&s"
                alt="ميكانيكي بيصلح عربية داخل ورشة"
                className="rounded-xl shadow-card-hover object-cover w-full h-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="container mt-6">
        <CategoryChips categories={categories} />
      </section>

      {/* Features */}
      <section className="container my-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3 p-4 bg-card rounded-lg shadow-card">
              <div className="p-2 bg-primary/10 rounded-full">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm text-foreground">{title}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Hot Deals */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">🔥 عروض ساخنة</h3>
            <p className="text-sm text-muted-foreground">عروض لفترة محدودة</p>
          </div>
          <Link to="/search?deals=true">
            <Button variant="ghost" size="sm" className="text-primary">
              شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {dealProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">منتجات مختارة</h3>
            <p className="text-sm text-muted-foreground">متختارة مخصوص ليك</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" size="sm" className="text-primary">
              شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">وصلت جديد</h3>
            <p className="text-sm text-muted-foreground">أحدث منتجات تجارنا</p>
          </div>
          <Link to="/search?sort=newest">
            <Button variant="ghost" size="sm" className="text-primary">
              شوف الكل <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="container my-10">
        <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-8 md:p-12 text-center text-primary-foreground">
          <h3 className="text-2xl md:text-3xl font-bold mb-4">جاهز تطلب عرض سعر؟</h3>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            المنصة دلوقتي شغالة كبائع واحد. أضف منتجاتك للسلة واطلب عرض سعر عبر واتساب لتأكيد السعر والتوافر.
          </p>
          <p className="text-sm opacity-90">
            التواصل والمتابعة بيتموا يدويًا عبر واتساب.
          </p>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
