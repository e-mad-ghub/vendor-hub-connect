import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, User, Menu, X, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { categories } from '@/data/mockData';
export const Header: React.FC = () => {
  const navigate = useNavigate();
  const {
    getCartCount
  } = useCart();
  const {
    isAuthenticated,
    user,
    logout
  } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const cartCount = getCartCount();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  return <header className="sticky top-0 z-50">
      {/* Main Header */}
      <div className="marketplace-header text-marketplace-header-foreground">
        <div className="container py-2 md:py-3">
          {/* Top Row */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                ​Alaadin<span className="text-primary">​Market</span>
              </h1>
            </Link>

            {/* Search Bar - Desktop */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-2xl">
              <div className="flex w-full">
                <Input type="search" placeholder="Search products, brands, and more..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-r-none border-r-0 bg-background text-foreground focus-visible:ring-0 focus-visible:ring-offset-0" />
                <Button type="submit" className="rounded-l-none px-6">
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </form>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-4">
              {isAuthenticated ? <div className="flex items-center gap-2">
                  <Link to="/account" className="flex items-center gap-2 hover:text-primary transition-colors">
                    <User className="h-5 w-5" />
                    <span className="text-sm">{user?.name}</span>
                  </Link>
                  {user?.role === 'vendor' && <Link to="/vendor/dashboard">
                      <Button variant="outline" size="sm" className="ml-2 border-primary/30 text-marketplace-header-foreground hover:bg-primary/10">
                        Vendor Dashboard
                      </Button>
                    </Link>}
                  {user?.role === 'admin' && <Link to="/admin">
                      <Button variant="outline" size="sm" className="ml-2 border-primary/30 text-marketplace-header-foreground hover:bg-primary/10">
                        Admin Panel
                      </Button>
                    </Link>}
                </div> : <Link to="/login">
                  <Button variant="ghost" className="text-marketplace-header-foreground hover:bg-primary/10">
                    <User className="h-5 w-5 mr-2" />
                    Login
                  </Button>
                </Link>}
              
              <Link to="/cart" className="relative">
                <Button variant="ghost" className="text-marketplace-header-foreground hover:bg-primary/10">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && <span className="absolute -top-1 -right-1 min-w-[20px] h-5 flex items-center justify-center bg-primary text-primary-foreground text-xs font-semibold rounded-full px-1">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>}
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Search */}
          <form onSubmit={handleSearch} className="mt-2 md:hidden">
            <div className="flex">
              <Input type="search" placeholder="Search products..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="rounded-r-none border-r-0 bg-background text-foreground focus-visible:ring-0" />
              <Button type="submit" className="rounded-l-none px-4">
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Nav - Desktop */}
      <div className="hidden md:block bg-marketplace-nav text-marketplace-header-foreground">
        <div className="container">
          <div className="flex items-center gap-6 py-2 overflow-x-auto hide-scrollbar">
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors">
                  <Menu className="h-4 w-4" />
                  All Categories
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <div className="py-4">
                  <h2 className="font-semibold text-lg mb-4">Categories</h2>
                  <div className="space-y-1">
                    {categories.map(cat => <Link key={cat.id} to={`/category/${encodeURIComponent(cat.name)}`} className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-muted transition-colors" onClick={() => setIsMenuOpen(false)}>
                        <span className="text-xl">{cat.icon}</span>
                        <span className="font-medium">{cat.name}</span>
                      </Link>)}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
            
            {categories.slice(0, 6).map(cat => <Link key={cat.id} to={`/category/${encodeURIComponent(cat.name)}`} className="text-sm whitespace-nowrap hover:text-primary transition-colors">
                {cat.name}
              </Link>)}
            
            <Link to="/vendor/register" className="text-sm whitespace-nowrap text-primary font-medium hover:underline">
              Sell on MarketHub
            </Link>
          </div>
        </div>
      </div>
    </header>;
};