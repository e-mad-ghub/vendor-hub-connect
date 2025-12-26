export type UserRole = 'customer' | 'vendor' | 'admin';
export type VendorStatus = 'pending' | 'approved' | 'rejected';
export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'rejected';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Vendor {
  id: string;
  userId: string;
  storeName: string;
  logo: string;
  banner: string;
  description: string;
  status: VendorStatus;
  commissionRate?: number; // Override for default
  totalSales: number;
  totalOrders: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
}

export interface Product {
  id: string;
  vendorId: string;
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  stock: number;
  category: string;
  subcategory?: string;
  images: string[];
  rating: number;
  reviewCount: number;
  sold: number;
  tags?: string[];
  createdAt: string;
}

export interface CartItem {
  productId: string;
  vendorId: string;
  quantity: number;
  price: number;
}

export interface OrderItem {
  productId: string;
  vendorId: string;
  quantity: number;
  price: number;
  title: string;
  image: string;
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status: OrderStatus;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export interface Review {
  id: string;
  productId: string;
  vendorId?: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

export interface PayoutRequest {
  id: string;
  vendorId: string;
  amount: number;
  status: PayoutStatus;
  requestedAt: string;
  processedAt?: string;
}

export interface PlatformSettings {
  defaultCommissionRate: number;
  minPayoutAmount: number;
  currency: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface Notification {
  id: string;
  type: 'registration' | 'approval' | 'order' | 'payout' | 'review';
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
