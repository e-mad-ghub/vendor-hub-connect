import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';

const Menu = () => (
  <div className="min-h-screen bg-background pb-20">
    <div className="container py-4">
      <h1 className="text-xl font-bold mb-4">القائمة</h1>
      <div className="space-y-2">
        <Link to="/" className="block p-3 bg-card rounded-lg">الرئيسية</Link>
        <Link to="/search" className="block p-3 bg-card rounded-lg">كل المنتجات</Link>
        <Link to="/requests" className="block p-3 bg-card rounded-lg">تتبع حالة طلب السعر</Link>
        <div className="p-3 bg-card rounded-lg">
          <p className="font-medium mb-2">الفئات</p>
          {categories.map(c => (<Link key={c.id} to={`/category/${c.name}`} className="block py-2 text-muted-foreground">{c.icon} {c.name}</Link>))}
        </div>
        <Link to="/about" className="block p-3 bg-card rounded-lg">عنّا</Link>
        <Link to="/contact" className="block p-3 bg-card rounded-lg">اتصل بينا</Link>
        <Link to="/terms" className="block p-3 bg-card rounded-lg">الشروط</Link>
        <Link to="/privacy" className="block p-3 bg-card rounded-lg">الخصوصية</Link>
      </div>
    </div>
  </div>
);

export default Menu;
