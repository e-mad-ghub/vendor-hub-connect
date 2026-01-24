export type UserRole = 'customer' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
}

export interface Product {
  id: string;
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
  quantity: number;
  price: number;
}

export interface Review {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  rating: number;
  comment: string;
  images?: string[];
  helpful: number;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  subcategories?: string[];
}

export interface QuoteRequestItem {
  productId: string;
  quantity: number;
  title: string;
  image: string;
  price?: number;
}

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: QuoteRequestItem[];
  createdAt: string;
}

export interface WhatsAppSettings {
  phoneNumber: string;
  messageTemplate: string;
}
