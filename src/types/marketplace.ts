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
  category: string;
  carBrands?: string[];
  imageDataUrl?: string;
  ownerId?: string;
  ownerName?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
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
}

export type QuoteRequestStatus = 'pending' | 'cancelled' | 'followed_up';

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: Array<{ productId: string; title: string; quantity: number; price: number; image: string }>;
  status: QuoteRequestStatus;
  createdAt: string;
}
