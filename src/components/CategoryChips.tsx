import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '@/types/marketplace';

interface CategoryChipsProps {
  categories: Category[];
  activeCategory?: string;
}

export const CategoryChips: React.FC<CategoryChipsProps> = ({ categories, activeCategory }) => {
  return (
    <div className="flex gap-2 overflow-x-auto hide-scrollbar py-2">
      <Link
        to="/search"
        className={`category-chip ${!activeCategory ? 'active' : ''}`}
      >
        الكل
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.id}
          to={`/category/${encodeURIComponent(cat.name)}`}
          className={`category-chip whitespace-nowrap ${activeCategory === cat.name ? 'active' : ''}`}
        >
          <span className="mr-1">{cat.icon}</span>
          {cat.name}
        </Link>
      ))}
    </div>
  );
};
