import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Menu } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { getCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();
  const cartCount = getCartCount();

  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/search', icon: Search, label: 'بحث' },
    { path: '/cart', icon: ShoppingCart, label: 'العربة', badge: cartCount },
    { path: isAuthenticated ? '/account' : '/login', icon: User, label: isAuthenticated ? 'حسابي' : 'تسجيل' },
    { path: '/menu', icon: Menu, label: 'المزيد' },
  ];

  return (
    <nav className="bottom-nav md:hidden">
      <div className="flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label, badge }) => {
          const isActive = location.pathname === path;
          
          return (
            <Link
              key={path}
              to={path}
              className={`bottom-nav-item relative ${isActive ? 'active' : ''}`}
            >
              <div className="relative">
                <Icon className="h-5 w-5" />
                {badge !== undefined && badge > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] flex items-center justify-center bg-primary text-primary-foreground text-[10px] font-semibold rounded-full px-1">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
