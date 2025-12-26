import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { CreditCard, Truck, ShieldCheck, ChevronRight, CheckCircle } from 'lucide-react';

const Checkout = () => {
  const navigate = useNavigate();
  const { items, getCartTotal, getItemsByVendor, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const [step, setStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const vendorGroups = getItemsByVendor();
  const subtotal = getCartTotal();
  const shipping = subtotal > 50 ? 0 : 5.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
  });

  if (items.length === 0 && !orderPlaced) {
    return (
      <Layout>
        <div className="container py-12 text-center">
          <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
          <Link to="/search">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </Layout>
    );
  }

  const handlePlaceOrder = async () => {
    setIsProcessing(true);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setOrderPlaced(true);
    clearCart();
    toast.success('Order placed successfully!');
    setIsProcessing(false);
  };

  if (orderPlaced) {
    return (
      <Layout>
        <div className="container py-12 text-center max-w-lg mx-auto">
          <div className="bg-card rounded-xl p-8 shadow-card">
            <CheckCircle className="h-16 w-16 mx-auto text-marketplace-success mb-4" />
            <h1 className="text-2xl font-bold mb-2">Order Placed!</h1>
            <p className="text-muted-foreground mb-6">
              Thank you for your order. You will receive a confirmation email shortly.
            </p>
            <p className="text-sm text-muted-foreground mb-6">
              Order #ORD-{Date.now().toString().slice(-8)}
            </p>
            <div className="flex flex-col gap-2">
              <Link to="/account">
                <Button className="w-full">View Orders</Button>
              </Link>
              <Link to="/">
                <Button variant="outline" className="w-full">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-4 md:py-8 max-w-5xl">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Checkout</h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          {['Shipping', 'Payment', 'Review'].map((label, idx) => (
            <React.Fragment key={label}>
              <div
                className={`flex items-center gap-2 ${
                  step > idx + 1 ? 'text-primary' : step === idx + 1 ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step > idx + 1
                      ? 'bg-primary text-primary-foreground'
                      : step === idx + 1
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  {step > idx + 1 ? '✓' : idx + 1}
                </div>
                <span className="hidden sm:inline font-medium">{label}</span>
              </div>
              {idx < 2 && <ChevronRight className="h-4 w-4 mx-2 text-muted-foreground" />}
            </React.Fragment>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Form Section */}
          <div className="lg:col-span-2">
            {step === 1 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Shipping Information</h2>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <Input
                      id="fullName"
                      value={shippingInfo.fullName}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, fullName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, email: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={shippingInfo.phone}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, phone: e.target.value })}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      value={shippingInfo.street}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, street: e.target.value })}
                      placeholder="123 Main Street"
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      value={shippingInfo.city}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, city: e.target.value })}
                      placeholder="New York"
                    />
                  </div>
                  <div>
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      value={shippingInfo.state}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, state: e.target.value })}
                      placeholder="NY"
                    />
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={shippingInfo.zipCode}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, zipCode: e.target.value })}
                      placeholder="10001"
                    />
                  </div>
                  <div>
                    <Label htmlFor="country">Country</Label>
                    <Input
                      id="country"
                      value={shippingInfo.country}
                      onChange={(e) => setShippingInfo({ ...shippingInfo, country: e.target.value })}
                      placeholder="USA"
                    />
                  </div>
                </div>

                <Button onClick={() => setStep(2)} className="w-full mt-6">
                  Continue to Payment
                </Button>
              </div>
            )}

            {step === 2 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <div className="flex items-center gap-2 mb-6">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h2 className="text-lg font-semibold">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="card" />
                    <CreditCard className="h-5 w-5" />
                    <span className="font-medium">Credit / Debit Card</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 border border-border rounded-lg cursor-pointer hover:border-primary transition-colors">
                    <RadioGroupItem value="paypal" />
                    <span className="font-bold text-blue-600">PayPal</span>
                  </label>
                </RadioGroup>

                {paymentMethod === 'card' && (
                  <div className="mt-6 space-y-4">
                    <div>
                      <Label htmlFor="cardNumber">Card Number</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiry">Expiry Date</Label>
                        <Input id="expiry" placeholder="MM/YY" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                  </div>
                )}

                <p className="text-xs text-muted-foreground mt-4 flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4" />
                  This is a demo. No real payment will be processed.
                </p>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={() => setStep(3)} className="flex-1">
                    Review Order
                  </Button>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="bg-card rounded-xl shadow-card p-6 animate-fade-in">
                <h2 className="text-lg font-semibold mb-6">Review Your Order</h2>

                {/* Shipping Summary */}
                <div className="mb-6 p-4 bg-muted/50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">Shipping to:</p>
                      <p className="text-sm text-muted-foreground">
                        {shippingInfo.fullName}<br />
                        {shippingInfo.street}<br />
                        {shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep(1)}>
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Items */}
                <div className="space-y-4">
                  {vendorGroups.map((group) => (
                    <div key={group.vendorId}>
                      <p className="text-sm font-medium mb-2">From {group.vendorName}:</p>
                      {group.items.map(({ productId, quantity, product }) => (
                        <div key={productId} className="flex gap-3 py-2">
                          <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                          <div className="flex-1">
                            <p className="text-sm font-medium line-clamp-1">{product.title}</p>
                            <p className="text-xs text-muted-foreground">Qty: {quantity}</p>
                          </div>
                          <p className="font-medium">${(product.price * quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 mt-6">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                    Back
                  </Button>
                  <Button onClick={handlePlaceOrder} className="flex-1" disabled={isProcessing}>
                    {isProcessing ? 'Processing...' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-card rounded-xl shadow-card p-6 sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Order Summary</h2>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
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
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                
                <div className="border-t border-border pt-3 mt-3">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Checkout;
