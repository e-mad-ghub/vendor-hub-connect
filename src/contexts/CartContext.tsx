import React, { createContext, useContext, useState, useCallback } from 'react';
import { CartItem, Product } from '@/types/marketplace';
import { getProductById } from '@/data/productsStore';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quality: 'new' | 'imported', quantity?: number) => void;
  removeFromCart: (productId: string, quality: 'new' | 'imported') => void;
  updateQuantity: (productId: string, quality: 'new' | 'imported', quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getDetailedItems: () => (CartItem & { product: Product })[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = useCallback((product: Product, quality: 'new' | 'imported', quantity: number = 1) => {
    const unitPrice = quality === 'new' ? (product.newPrice || 0) : 0;
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id && item.quality === quality);
      
      if (existing) {
        return prev.map(item =>
          item.productId === product.id && item.quality === quality
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      return [...prev, {
        productId: product.id,
        quantity,
        quality,
        unitPrice,
      }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string, quality: 'new' | 'imported') => {
    setItems(prev => prev.filter(item => !(item.productId === productId && item.quality === quality)));
  }, []);

  const updateQuantity = useCallback((productId: string, quality: 'new' | 'imported', quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId, quality);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.productId === productId && item.quality === quality
        ? { ...item, quantity }
        : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return new Set(items.map(item => item.productId)).size;
  }, [items]);

  const getDetailedItems = useCallback(() => {
    return items.reduce<(CartItem & { product: Product })[]>((acc, item) => {
      const product = getProductById(item.productId);
      if (!product) return acc;
      acc.push({ ...item, product });
      return acc;
    }, []);
  }, [items]);

  return (
    <CartContext.Provider value={{
      items,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      getCartTotal,
      getCartCount,
      getDetailedItems,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
