import React from 'react';
import { Link } from 'react-router-dom';
import { categories } from '@/data/mockData';

const Menu = () => (
  <div className="min-h-screen bg-background pb-20">
    <div className="container py-4">
      <h1 className="text-xl font-bold mb-4">Menu</h1>
      <div className="space-y-2">
        <Link to="/" className="block p-3 bg-card rounded-lg">Home</Link>
        <Link to="/search" className="block p-3 bg-card rounded-lg">All Products</Link>
        <div className="p-3 bg-card rounded-lg">
          <p className="font-medium mb-2">Categories</p>
          {categories.map(c => (<Link key={c.id} to={`/category/${c.name}`} className="block py-2 text-muted-foreground">{c.icon} {c.name}</Link>))}
        </div>
        <Link to="/vendor/register" className="block p-3 bg-card rounded-lg text-primary font-medium">Sell on MarketHub</Link>
        <Link to="/about" className="block p-3 bg-card rounded-lg">About</Link>
        <Link to="/contact" className="block p-3 bg-card rounded-lg">Contact</Link>
        <Link to="/terms" className="block p-3 bg-card rounded-lg">Terms</Link>
        <Link to="/privacy" className="block p-3 bg-card rounded-lg">Privacy</Link>
      </div>
    </div>
  </div>
);

export default Menu;
