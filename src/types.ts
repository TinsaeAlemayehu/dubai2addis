/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  description: string;
  category: string;
  subcategory: string;
  image: string;
  brand: string;
  priceAED: number;
  originalPriceAED?: number;
  isBestSeller: boolean;
  isTrending: boolean;
  rating: number;
  reviewsCount: number;
  sizes: string[];
  colors: { name: string; hex: string }[];
  images: string[]; // multi-image gallery support
}

export interface CartItem {
  id: string; // composition key "productId-size-color"
  product: Product;
  selectedSize: string;
  selectedColor: { name: string; hex: string };
  quantity: number;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  rating: number;
  text: string;
  avatar: string;
  verified: boolean;
  date: string;
}

export interface BrandPartner {
  name: string;
  tagline: string;
  logoUrl?: string;
}

export interface StoreSettings {
  siteName: string;
  logoUrl?: string;
  whatsappNumber: string;
  currency: string;
  deliveryFee: string;
  supportEmail: string;
  updatedAt?: string | Date;
}

export interface PurchaseTask {
  id: number;
  orderId: number;
  productSku: string;
  productName: string;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  supplierId?: string;
  supplierPriceAED?: number;
  purchaseStatus: 'TO_PURCHASE' | 'PURCHASED' | 'PACKED' | 'READY_FOR_SHIPMENT';
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}


