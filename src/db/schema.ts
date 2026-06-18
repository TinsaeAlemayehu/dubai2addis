import { pgTable, serial, text, integer, boolean, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Role-Based Authentication)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  role: text('role').notNull().default('CUSTOMER'), // 'SUPER_ADMIN', 'STAFF', 'CUSTOMER'
  name: text('name'),
  phone: text('phone'),
  whatsapp: text('whatsapp'),
  address: text('address'),
  city: text('city'),
  country: text('country').default('Ethiopia'),
  wishlist: jsonb('wishlist').$type<string[]>().default([]), // Array of product ids
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(),
  subcategory: text('subcategory'),
  brand: text('brand'),
  priceETB: integer('price_etb').notNull(),
  originalPriceETB: integer('original_price_etb'),
  rating: text('rating').default('4.5'),
  reviewsCount: integer('reviews_count').default(12),
  sizes: jsonb('sizes').$type<string[]>().default([]), // e.g. ["S", "M", "L"]
  colors: jsonb('colors').$type<{ name: string; hex: string }[]>().default([]), // e.g. [{name: "Red", hex: "#ff0000"}]
  images: jsonb('images').$type<string[]>().default([]), // image URLs
  isBestSeller: boolean('is_best_seller').default(false),
  isTrending: boolean('is_trending').default(false),
  isFeatured: boolean('is_featured').default(false),
  isNewArrival: boolean('is_new_arrival').default(false),
  quantityAvailable: integer('quantity_available').default(10),
  quantityReserved: integer('quantity_reserved').default(0),
  lowStockAlertThreshold: integer('low_stock_threshold').default(3),
  createdAt: timestamp('created_at').defaultNow(),
});

// Orders table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id),
  customerName: text('customer_name').notNull(),
  customerPhone: text('customer_phone').notNull(),
  customerWhatsapp: text('customer_whatsapp'),
  items: jsonb('items').notNull(), // JSON list of items purchased
  totalAmountETB: integer('total_amount_etb').notNull(),
  status: text('status').notNull().default('Pending'), // 'Pending', 'Deposit Pending', 'Deposit Received', 'Purchased in Dubai', 'Shipped', 'Arrived in Ethiopia', 'Out for Delivery', 'Delivered', 'Cancelled'
  shippingAddress: text('shipping_address'),
  shippingCity: text('shipping_city'),
  country: text('country').default('Ethiopia'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Marketing Banners table
export const banners = pgTable('banners', {
  id: serial('id').primaryKey(),
  title: text('title'),
  subtitle: text('subtitle'),
  imageUrl: text('image_url').notNull(),
  link: text('link'),
  active: boolean('active').default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

// Define Relationships
export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
}));
