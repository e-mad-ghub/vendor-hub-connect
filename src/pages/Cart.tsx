import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { getProductById } from '@/data/mockData';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight, Store } from 'lucide-react';

const Cart = () => {
  const navigate = useNavigate();
  const { items, removeFromCart, updateQuantity, getCartTotal, getItemsByVendor, clearCart } = useCart();
  const vendorGroups = getItemsByVendor();
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Add some products to get started!</p>
          <Link to="/search">
            <Button>
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Shopping Cart ({items.length} items)</h1>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {vendorGroups.map((group) => (
              <div key={group.vendorId} className="bg-card rounded-xl shadow-card overflow-hidden">
                {/* Vendor Header */}
                <div className="bg-muted/50 p-3 flex items-center gap-2 border-b border-border">
                  <Store className="h-4 w-4 text-primary" />
                  <Link
                    to={`/vendor/${group.vendorId}`}
                    className="font-medium hover:text-primary transition-colors"
                  >
                    {group.vendorName}
                  </Link>
                </div>

                {/* Items */}
                <div className="divide-y divide-border">
                  {group.items.map(({ productId, quantity, product }) => (
                    <div key={productId} className="p-4 flex gap-4">
                      <Link to={`/product/${productId}`}>
                        <img
                          src={product.images[0]}
                          alt={product.title}
                          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-lg"
                        />
                      </Link>
                      
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${productId}`}>
                          <h3 className="font-medium text-foreground hover:text-primary transition-colors line-clamp-2">
                            {product.title}
                          </h3>
                        </Link>
                        <p className="text-lg font-bold text-primary mt-1">${product.price.toFixed(2)}</p>
                        
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-border rounded-lg">
                            <button
                              onClick={() => updateQuantity(productId, quantity - 1)}
                              className="p-1.5 hover:bg-muted transition-colors"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium">{quantity}</span>
                            <button
                              onClick={() => updateQuantity(productId, quantity + 1)}
                              className="p-1.5 hover:bg-muted transition-colors"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          
                          <button
                            onClick={() => removeFromCart(productId)}
                            className="text-muted-foreground hover:text-destructive transition-colors p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium">
                    {shipping === 0 ? (
                      <span className="text-marketplace-success">FREE</span>
                    ) : (
                      `$${shipping.toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Estimated Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {subtotal < 50 && (
                <p className="text-xs text-muted-foreground mt-3">
                  Add ${(50 - subtotal).toFixed(2)} more for free shipping!
                </p>
              )}

              <Button onClick={() => navigate('/checkout')} className="w-full mt-6" size="lg">
                Proceed to Checkout
              </Button>
              
              <Link to="/search">
                <Button variant="ghost" className="w-full mt-2">
                  Continue Shopping
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Cart;
