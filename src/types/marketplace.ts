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
  newAvailable?: boolean;
  newPrice?: number;
  importedAvailable?: boolean;
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
  quality: 'new' | 'imported';
  unitPrice: number;
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
  quality?: 'new' | 'imported';
  unitPrice?: number;
}

export type QuoteRequestStatus = 'pending' | 'cancelled' | 'followed_up';

export interface QuoteRequest {
  id: string;
  customerName: string;
  customerPhone: string;
  message: string;
  items: QuoteRequestItem[];
  status: QuoteRequestStatus;
  createdAt: string;
}

export interface WhatsAppSettings {
  phoneNumber: string;
}

// Availability request types for price quote flow
export type AvailabilityRequestStatus = 'pending' | 'quoted' | 'accepted' | 'declined' | 'cancelled' | 'unavailable';

export interface AvailabilityRequestItem {
  productId: string;
  quantity: number;
  title: string;
  image: string;
  price?: number;
}

export interface AvailabilityRequest {
  id: string;
  status: AvailabilityRequestStatus;
  requestedAt: string;
  respondedAt?: string;
  cartSignature: string;
  items: AvailabilityRequestItem[];
  buyerPhone: string;
  customerId?: string;
  vendorId?: string;
  vendorName?: string;
  quotedTotal?: number;
  sellerNote?: string;
  buyerNote?: string;
}
