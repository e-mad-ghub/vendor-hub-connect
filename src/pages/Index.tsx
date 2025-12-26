import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { ProductCard } from '@/components/ProductCard';
import { CategoryChips } from '@/components/CategoryChips';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Truck, Shield, RefreshCw, Headphones } from 'lucide-react';
import { products, categories, vendors } from '@/data/mockData';

const Index = () => {
  const featuredProducts = products.slice(0, 8);
  const dealProducts = products.filter(p => p.originalPrice).slice(0, 6);
  const newArrivals = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 6);

  const features = [
    { icon: Truck, title: 'Free Shipping', desc: 'On orders over $50' },
    { icon: Shield, title: 'Secure Payment', desc: '100% secure checkout' },
    { icon: RefreshCw, title: 'Easy Returns', desc: '30-day return policy' },
    { icon: Headphones, title: '24/7 Support', desc: 'Dedicated support' },
  ];

  return (
    <Layout>
      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-primary/10 via-primary/5 to-background">
        <div className="container py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1 text-center md:text-left">
              <Badge className="bg-primary/10 text-primary mb-4">🔥 Hot Deals</Badge>
              <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4 leading-tight">
                Discover Amazing Products from{' '}
                <span className="text-primary">Top Vendors</span>
              </h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto md:mx-0">
                Shop from thousands of verified sellers. Quality products, competitive prices, and exceptional service.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link to="/search">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Shopping
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/vendor/register">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto">
                    Become a Seller
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 hidden md:block">
              <img
                src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                alt="Shopping"
                className="rounded-xl shadow-card-hover"
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
            <h3 className="text-xl md:text-2xl font-bold text-foreground">🔥 Hot Deals</h3>
            <p className="text-sm text-muted-foreground">Limited time offers</p>
          </div>
          <Link to="/search?deals=true">
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="ml-1 h-4 w-4" />
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
            <h3 className="text-xl md:text-2xl font-bold text-foreground">Featured Products</h3>
            <p className="text-sm text-muted-foreground">Handpicked for you</p>
          </div>
          <Link to="/search">
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Top Vendors */}
      <section className="bg-muted/50 py-10">
        <div className="container">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl md:text-2xl font-bold text-foreground">Top Vendors</h3>
              <p className="text-sm text-muted-foreground">Shop from trusted sellers</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {vendors.filter(v => v.status === 'approved').map((vendor) => (
              <Link
                key={vendor.id}
                to={`/vendor/${vendor.id}`}
                className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-shadow group"
              >
                <div className="h-24 bg-cover bg-center" style={{ backgroundImage: `url(${vendor.banner})` }} />
                <div className="p-4 relative">
                  <img
                    src={vendor.logo}
                    alt={vendor.storeName}
                    className="w-16 h-16 rounded-full border-4 border-card absolute -top-8 left-4 object-cover"
                  />
                  <div className="ml-20 -mt-4">
                    <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {vendor.storeName}
                    </h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>⭐ {vendor.rating}</span>
                      <span>•</span>
                      <span>{vendor.totalOrders} orders</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="container my-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl md:text-2xl font-bold text-foreground">New Arrivals</h3>
            <p className="text-sm text-muted-foreground">Fresh from our vendors</p>
          </div>
          <Link to="/search?sort=newest">
            <Button variant="ghost" size="sm" className="text-primary">
              View All <ArrowRight className="ml-1 h-4 w-4" />
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
          <h3 className="text-2xl md:text-3xl font-bold mb-4">Ready to Start Selling?</h3>
          <p className="mb-6 opacity-90 max-w-md mx-auto">
            Join thousands of successful vendors on MarketHub. Low fees, easy setup, and millions of customers.
          </p>
          <Link to="/vendor/register">
            <Button size="lg" variant="secondary" className="bg-card text-foreground hover:bg-card/90">
              Register as Vendor
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
