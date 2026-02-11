import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';
import { Seo } from '@/components/Seo';

const Menu = () => (
  <div className="min-h-screen bg-background pb-20">
    <Seo title="القائمة" description="روابط سريعة للفئات والصفحات الأساسية." />
    <div className="container py-4">
      <h1 className="text-xl font-bold mb-4">القائمة</h1>
      <div className="space-y-2">
        <Link to="/" className="block p-3 bg-card rounded-lg">الرئيسية</Link>
        <Link to="/search" className="block p-3 bg-card rounded-lg">كل المنتجات</Link>
        <Link to="/cart" className="block p-3 bg-card rounded-lg">طلب عرض سعر عبر واتساب</Link>
        <div className="p-3 bg-card rounded-lg">
          <p className="font-medium mb-2">الفئات</p>
          {categories.map(c => (<Link key={c.id} to={`/category/${c.name}`} className="block py-2 text-muted-foreground">{c.icon} {c.name}</Link>))}
        </div>
        <Link to="/contact" className="block p-3 bg-card rounded-lg">اتصل بينا</Link>
        <Link to="/terms" className="block p-3 bg-card rounded-lg">الشروط</Link>
        <Link to="/privacy" className="block p-3 bg-card rounded-lg">الخصوصية</Link>
      </div>
    </div>
  </div>
);

export default Menu;
