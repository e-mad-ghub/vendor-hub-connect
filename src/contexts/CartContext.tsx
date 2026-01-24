import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartItem, Product } from '@/types/marketplace';
import { getProductById } from '@/data/productsStore';

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  getDetailedItems: () => (CartItem & { product: Product })[];
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const isDev = import.meta.env.DEV;

  const logCart = (event: string, payload: unknown) => {
    if (isDev) {
      // Dev-only trace to observe cart transitions during manual testing
      console.info(`[cart:${event}]`, payload);
    }
  };

  const addToCart = useCallback((product: Product, quantity: number = 1) => {
    logCart('add', { productId: product.id, quantity });
    setItems(prev => {
      const existing = prev.find(item => item.productId === product.id);
      
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      
      const next = [...prev, {
        productId: product.id,
        quantity,
        price: product.price,
      }];
      logCart('add:newItem', next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    logCart('remove', { productId });
    setItems(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    logCart('updateQuantity', { productId, quantity });
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    
    setItems(prev => prev.map(item =>
      item.productId === productId
        ? { ...item, quantity }
        : item
    ));
  }, [removeFromCart]);

  const clearCart = useCallback(() => {
    logCart('clear', {});
    setItems([]);
  }, []);

  useEffect(() => {
    if (isDev) {
      console.info('[cart:state]', items);
    }
  }, [isDev, items]);

  const getCartTotal = useCallback(() => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  }, [items]);

  const getCartCount = useCallback(() => {
    return items.reduce((count, item) => count + item.quantity, 0);
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
