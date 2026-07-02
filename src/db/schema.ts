import { pgTable, serial, text, integer, boolean, timestamp, jsonb, index, real } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table (Role-Based Authentication)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
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

// Classification Tables
export const suppliers = pgTable('suppliers', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const brands = pgTable('brands', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const departments = pgTable('departments', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const categories = pgTable('categories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const subcategories = pgTable('subcategories', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  categoryId: integer('category_id').references(() => categories.id).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

// Products table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  sku: text('sku').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').notNull(), // kept for backwards compatibility
  subcategory: text('subcategory'),      // kept for backwards compatibility
  brand: text('brand'),                  // kept for backwards compatibility
  supplierId: integer('supplier_id').references(() => suppliers.id),
  brandId: integer('brand_id').references(() => brands.id),
  departmentId: integer('department_id').references(() => departments.id),
  categoryId: integer('category_id').references(() => categories.id),
  subcategoryId: integer('subcategory_id').references(() => subcategories.id),
  priceETB: integer('price_etb').notNull(),
  originalPriceETB: integer('original_price_etb'),
  supplierPrice: real('supplier_price'),
  supplierCurrency: text('supplier_currency').default('AED'),
  exchangeRateUsed: real('exchange_rate_used'),
  shippingPercentageUsed: real('shipping_percentage_used'),
  handlingPercentageUsed: real('handling_percentage_used'),
  riskBufferPercentageUsed: real('risk_buffer_percentage_used'),
  profitPercentageUsed: real('profit_percentage_used'),
  fixedFeeUsed: real('fixed_fee_used'),
  calculatedSellingPriceETB: integer('calculated_selling_price_etb'),
  calculatedAt: timestamp('calculated_at'),
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
  status: text('status').default('Draft'),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => {
  return {
    skuIdx: index('products_sku_idx').on(table.sku),
    categoryIdx: index('products_category_idx').on(table.category),
    brandIdx: index('products_brand_idx').on(table.brand),
    statusIdx: index('products_status_idx').on(table.status),
    supplierIdIdx: index('products_supplier_id_idx').on(table.supplierId),
    brandIdIdx: index('products_brand_id_idx').on(table.brandId),
    departmentIdIdx: index('products_department_id_idx').on(table.departmentId),
    categoryIdIdx: index('products_category_id_idx').on(table.categoryId),
    subcategoryIdIdx: index('products_subcategory_id_idx').on(table.subcategoryId),
  };
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

// Store Settings table (Single row system settings)
export const settings = pgTable('settings', {
  id: serial('id').primaryKey(),
  siteName: text('site_name').notNull().default('AddisDubai'),
  logoUrl: text('logo_url').default(''),
  whatsappNumber: text('whatsapp_number').notNull().default('+971552734073'),
  currency: text('currency').notNull().default('ETB'),
  deliveryFee: text('delivery_fee').notNull().default('200'),
  supportEmail: text('support_email').notNull().default('info@addisdubai.com'),
  exchangeRates: jsonb('exchange_rates').$type<Record<string, number>>().default({ AED: 31.0, USD: 115.0 }),
  shippingPercentage: real('shipping_percentage').default(20.0),
  handlingPercentage: real('handling_percentage').default(5.0),
  riskBufferPercentage: real('risk_buffer_percentage').default(3.0),
  profitPercentage: real('profit_percentage').default(15.0),
  fixedFeeETB: integer('fixed_fee_etb').default(0),
  roundingRule: text('rounding_rule').default('None'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Purchase Tasks Table for the Purchase Queue
export const purchaseTasks = pgTable('purchase_tasks', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productSku: text('product_sku').notNull(),
  productName: text('product_name').notNull(),
  quantity: integer('quantity').notNull().default(1),
  selectedSize: text('selected_size'),
  selectedColor: text('selected_color'), // Color details
  supplierId: text('supplier_id'),
  supplierPriceAED: integer('supplier_price_aed'),
  purchaseStatus: text('purchase_status').notNull().default('TO_PURCHASE'), // 'TO_PURCHASE', 'PURCHASED', 'PACKED', 'READY_FOR_SHIPMENT'
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const purchaseTasksRelations = relations(purchaseTasks, ({ one }) => ({
  order: one(orders, {
    fields: [purchaseTasks.orderId],
    references: [orders.id],
  }),
}));

// Import Jobs table for universal import log history
export const importJobs = pgTable('import_jobs', {
  id: serial('id').primaryKey(),
  filename: text('filename').notNull(),
  supplier: text('supplier').default('Generic'),
  status: text('status').notNull().default('Completed'), // 'Completed', 'Processing', 'Failed'
  duration: integer('duration').default(0), // duration in ms
  totalRows: integer('total_rows').default(0),
  importedCount: integer('imported_count').default(0),
  updatedCount: integer('updated_count').default(0),
  skippedCount: integer('skipped_count').default(0),
  failedCount: integer('failed_count').default(0),
  duplicateCount: integer('duplicate_count').default(0),
  errorLog: text('error_log'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Import Job Items table to track each item's processing result
export const importJobItems = pgTable('import_job_items', {
  id: serial('id').primaryKey(),
  jobId: integer('job_id').notNull().references(() => importJobs.id, { onDelete: 'cascade' }),
  sku: text('sku'),
  name: text('name'),
  status: text('status').notNull(), // 'Imported', 'Updated', 'Skipped', 'Failed'
  errorMessage: text('error_message'),
  createdAt: timestamp('created_at').defaultNow(),
});

// Import Templates table for mapping configuration persistence
export const importTemplates = pgTable('import_templates', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  mapping: jsonb('mapping').notNull(), // JSON mapping object
  createdAt: timestamp('created_at').defaultNow(),
});

export const importJobsRelations = relations(importJobs, ({ many }) => ({
  items: many(importJobItems),
}));

export const importJobItemsRelations = relations(importJobItems, ({ one }) => ({
  job: one(importJobs, {
    fields: [importJobItems.jobId],
    references: [importJobs.id],
  }),
}));

export const subcategoriesRelations = relations(subcategories, ({ one }) => ({
  category: one(categories, {
    fields: [subcategories.categoryId],
    references: [categories.id],
  }),
}));

export const categoriesRelations = relations(categories, ({ many }) => ({
  subcategories: many(subcategories),
}));

export const productsRelations = relations(products, ({ one }) => ({
  supplier: one(suppliers, {
    fields: [products.supplierId],
    references: [suppliers.id],
  }),
  brandRef: one(brands, {
    fields: [products.brandId],
    references: [brands.id],
  }),
  department: one(departments, {
    fields: [products.departmentId],
    references: [departments.id],
  }),
  categoryRef: one(categories, {
    fields: [products.categoryId],
    references: [categories.id],
  }),
  subcategoryRef: one(subcategories, {
    fields: [products.subcategoryId],
    references: [subcategories.id],
  }),
}));




