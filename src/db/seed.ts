import { db } from './index.ts';
import { products, banners, suppliers, brands, departments, categories, subcategories } from './schema.ts';
import { sql } from 'drizzle-orm';

// Convert AED to ETB using the established exchange rate of 36.5
const EXCHANGE_RATE = 36.5;

const initialProducts = [
  {
    sku: 'DRESS-GOLD-01',
    name: 'Elegant Golden-Satin Pleated Evening Gown',
    description: 'Sourced from Premium Dubai Boutiques. Heavyweight silk satin blend featuring a waist-defining side ruching, structured asymmetrical neckline, and floating hemline. Perfect for special holiday gatherings and Ethiopian wedding receptions.',
    category: 'dresses',
    subcategory: 'evening-wear',
    brand: 'Dubai luxury boutique',
    priceETB: Math.round(249 * EXCHANGE_RATE),
    originalPriceETB: Math.round(599 * EXCHANGE_RATE),
    rating: '4.9',
    reviewsCount: 38,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Satin Gold', hex: '#d4af37' },
      { name: 'Imperial Red', hex: '#8b0000' },
      { name: 'Classic Noir', hex: '#111111' }
    ],
    images: [
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: false,
    quantityAvailable: 15,
    quantityReserved: 0,
    lowStockAlertThreshold: 3
  },
  {
    sku: 'DRESS-FLORAL-02',
    name: 'Luxury Pleated Floral Long Chiffon Dress',
    description: 'Soft micro-pleat chiffon with high-neck style panel, matching waist tie sash, and modest double-tier lining. Breathable and elegant styling direct from UAE collections.',
    category: 'dresses',
    subcategory: 'modest-wear',
    brand: 'SHEIN Luxe Dubai',
    priceETB: Math.round(165 * EXCHANGE_RATE),
    originalPriceETB: Math.round(280 * EXCHANGE_RATE),
    rating: '4.7',
    reviewsCount: 24,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Floral Rose', hex: '#de5d83' },
      { name: 'Midnight Navy', hex: '#000080' }
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: false,
    isTrending: true,
    isFeatured: false,
    isNewArrival: true,
    quantityAvailable: 12,
    quantityReserved: 1,
    lowStockAlertThreshold: 2
  },
  {
    sku: 'DRESS-GREEN-03',
    name: 'Emerald Green Velvet Modest Kaftan',
    description: 'High-grade premium velvet heavy drop kaftan with fine handcrafted golden Zardozi embroidery, long bell sleeves, and fluid structural silhouette.',
    category: 'dresses',
    subcategory: 'kaftans',
    brand: 'Dubai Outlet Deals',
    priceETB: Math.round(320 * EXCHANGE_RATE),
    originalPriceETB: Math.round(680 * EXCHANGE_RATE),
    rating: '4.8',
    reviewsCount: 19,
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Emerald Green', hex: '#004b36' },
      { name: 'Royal Gold', hex: '#d4af37' }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: true,
    isTrending: false,
    isFeatured: true,
    isNewArrival: false,
    quantityAvailable: 8,
    quantityReserved: 0,
    lowStockAlertThreshold: 2
  },
  {
    sku: 'ABAYA-GOLD-01',
    name: 'Golden-Thread Embroidered Luxe Abaya Set',
    description: 'A masterpiece from Dubai Creek designer workshops. Intricate luxury lace and shimmering metallic embroidery patterns along the front panel and wide cuffs. Included is matching pure premium chiffon hijab wrap and sash fabric.',
    category: 'abayas',
    subcategory: 'premium-abayas',
    brand: 'Dubai Creek Couture',
    priceETB: Math.round(290 * EXCHANGE_RATE),
    originalPriceETB: Math.round(590 * EXCHANGE_RATE),
    rating: '4.9',
    reviewsCount: 57,
    sizes: ['52 (S)', '54 (M)', '56 (L)', '58 (XL)', '60 (2XL)'],
    colors: [
      { name: 'Onyx Black', hex: '#0f0f10' },
      { name: 'Desert Taupe', hex: '#b38b6d' }
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: false,
    quantityAvailable: 10,
    quantityReserved: 2,
    lowStockAlertThreshold: 3
  },
  {
    sku: 'BAG-QUILT-01',
    name: 'Quilted Leather Gold-Chain Shoulder Handbag',
    description: 'Classic luxury design with geometric quilted soft faux-leather, lock-twist closure, and woven gold link hardware. Beautiful day-to-night accessory representing premium Dubai fashion mall style.',
    category: 'handbags',
    subcategory: 'shoulder-bags',
    brand: 'Brands For Less Dubai',
    priceETB: Math.round(180 * EXCHANGE_RATE),
    originalPriceETB: Math.round(360 * EXCHANGE_RATE),
    rating: '4.8',
    reviewsCount: 42,
    sizes: ['One Size'],
    colors: [
      { name: 'Hermes Orange', hex: '#e25822' },
      { name: 'Onyx Noir', hex: '#111111' },
      { name: 'Camel Tan', hex: '#a17a4c' }
    ],
    images: [
      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: true,
    quantityAvailable: 2, // low stock testing
    quantityReserved: 0,
    lowStockAlertThreshold: 3
  },
  {
    sku: 'BAG-TOTE-02',
    name: 'Luxury Crocodile-Embossed Structured Tote',
    description: 'Sleek executive handbag built with rigid structural side inserts, spacious interior velvet compartments, and gold accent feet. Elevates casual fashion instantly.',
    category: 'handbags',
    subcategory: 'tote-bags',
    brand: 'Dubai Outlet Deals',
    priceETB: Math.round(215 * EXCHANGE_RATE),
    originalPriceETB: Math.round(450 * EXCHANGE_RATE),
    rating: '4.6',
    reviewsCount: 16,
    sizes: ['One Size'],
    colors: [
      { name: 'Croc Dark Green', hex: '#002e1c' },
      { name: 'Crimson Burgundy', hex: '#5f1624' }
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: false,
    isTrending: true,
    isFeatured: false,
    isNewArrival: false,
    quantityAvailable: 6,
    quantityReserved: 0,
    lowStockAlertThreshold: 2
  },
  {
    sku: 'SHOES-HEELS-01',
    name: 'Glittering Rhinestone Ribbon Strappy Heels',
    description: 'Heads will turn at any Ethiopian celebration. Features spiral ankle wrapping, dense high-refraction glass crystals, and comfortable cushioned kitten-heel arch context.',
    category: 'shoes',
    subcategory: 'heels',
    brand: 'ZARA Dubai Mall',
    priceETB: Math.round(195 * EXCHANGE_RATE),
    originalPriceETB: Math.round(410 * EXCHANGE_RATE),
    rating: '4.9',
    reviewsCount: 61,
    sizes: ['37', '38', '39', '40', '41'],
    colors: [
      { name: 'Glass Crystal Gold', hex: '#dfc26a' },
      { name: 'Chop Silver', hex: '#c0c0c0' }
    ],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: true,
    isTrending: true,
    isFeatured: true,
    isNewArrival: false,
    quantityAvailable: 1, // out of stock testing soon
    quantityReserved: 0,
    lowStockAlertThreshold: 2
  },
  {
    sku: 'SHOES-MULES-02',
    name: 'Linen Ribbon Block Mules',
    description: 'Breathable, classy flat slides with elegant cross ribbon strap in sand color. Perfect for everyday office and premium brunches in Addis Ababa.',
    category: 'shoes',
    subcategory: 'mules-flats',
    brand: 'Dubai Outlet Deals',
    priceETB: Math.round(110 * EXCHANGE_RATE),
    originalPriceETB: Math.round(220 * EXCHANGE_RATE),
    rating: '4.5',
    reviewsCount: 11,
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Tuscan Linen', hex: '#ede6d9' },
      { name: 'Jet Black Noir', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80'
    ],
    isBestSeller: false,
    isTrending: false,
    isFeatured: false,
    isNewArrival: true,
    quantityAvailable: 14,
    quantityReserved: 0,
    lowStockAlertThreshold: 2
  }
];

const initialBanners = [
  {
    title: 'DUBAI TO ADDIS ABABA',
    subtitle: 'MODEST LUXURY IMPORTED AT METICULOUS PRICING',
    imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
    link: '#catalog',
    active: true
  },
  {
    title: 'THE ROYAL ABAYA CONTEXT',
    subtitle: 'GOLDEN THREAD EMBROIDERY SOURCED LIVE FROM DUBAI MALL OUTLETS',
    imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
    link: '#catalog',
    active: true
  }
];

export async function seedDatabase() {
  try {
    // 1. Seed Suppliers
    const existingSuppliers = await db.select().from(suppliers);
    if (existingSuppliers.length === 0) {
      console.log('Seeding default suppliers...');
      await db.insert(suppliers).values([
        { id: 1, name: 'Shein' },
        { id: 2, name: 'Temu' },
        { id: 3, name: 'Amazon' },
        { id: 4, name: 'AliExpress' },
        { id: 5, name: 'Noon' },
        { id: 6, name: 'Custom Supplier' }
      ]);
    }

    // 2. Seed Brands
    const existingBrands = await db.select().from(brands);
    if (existingBrands.length === 0) {
      console.log('Seeding default brands...');
      await db.insert(brands).values([
        { id: 1, name: 'Nike' },
        { id: 2, name: 'Adidas' },
        { id: 3, name: 'Puma' },
        { id: 4, name: 'Gucci' },
        { id: 5, name: 'Rolex' }
      ]);
    }

    // 3. Seed Departments
    const existingDepts = await db.select().from(departments);
    if (existingDepts.length === 0) {
      console.log('Seeding default departments...');
      await db.insert(departments).values([
        { id: 1, name: 'Women' },
        { id: 2, name: 'Men' },
        { id: 3, name: 'Kids' },
        { id: 4, name: 'Unisex' }
      ]);
    }

    // 4. Seed Categories
    const existingCats = await db.select().from(categories);
    if (existingCats.length === 0) {
      console.log('Seeding default categories...');
      await db.insert(categories).values([
        { id: 1, name: 'Dresses' },
        { id: 2, name: 'Shoes' },
        { id: 3, name: 'Bags' },
        { id: 4, name: 'Perfumes' },
        { id: 5, name: 'Watches' },
        { id: 6, name: 'Accessories' }
      ]);
    }

    // 5. Seed Subcategories
    const existingSubs = await db.select().from(subcategories);
    if (existingSubs.length === 0) {
      console.log('Seeding default subcategories...');
      await db.insert(subcategories).values([
        // Shoes
        { id: 1, name: 'Sneakers', categoryId: 2 },
        { id: 2, name: 'Running Shoes', categoryId: 2 },
        { id: 3, name: 'Sandals', categoryId: 2 },
        { id: 4, name: 'Boots', categoryId: 2 },
        { id: 5, name: 'Slippers', categoryId: 2 },
        { id: 6, name: 'Heels', categoryId: 2 },
        { id: 7, name: 'Formal Shoes', categoryId: 2 },
        // Dresses
        { id: 8, name: 'Casual', categoryId: 1 },
        { id: 9, name: 'Maxi', categoryId: 1 },
        { id: 10, name: 'Mini', categoryId: 1 },
        { id: 11, name: 'Party', categoryId: 1 },
        { id: 12, name: 'Evening', categoryId: 1 },
        { id: 13, name: 'Abaya', categoryId: 1 },
        { id: 14, name: 'Wedding', categoryId: 1 },
        // Bags
        { id: 15, name: 'Handbags', categoryId: 3 },
        { id: 16, name: 'Backpacks', categoryId: 3 },
        { id: 17, name: 'Shoulder Bags', categoryId: 3 },
        { id: 18, name: 'Crossbody Bags', categoryId: 3 },
        { id: 19, name: 'Wallets', categoryId: 3 },
        { id: 20, name: 'Travel Bags', categoryId: 3 },
        // Watches
        { id: 21, name: 'Smart Watches', categoryId: 5 },
        { id: 22, name: 'Sports', categoryId: 5 },
        { id: 23, name: 'Luxury', categoryId: 5 },
        { id: 24, name: 'Analog', categoryId: 5 },
        { id: 25, name: 'Digital', categoryId: 5 },
        // Accessories
        { id: 26, name: 'Sunglasses', categoryId: 6 },
        { id: 27, name: 'Jewelry', categoryId: 6 },
        { id: 28, name: 'Hats', categoryId: 6 },
        { id: 29, name: 'Belts', categoryId: 6 },
        { id: 30, name: 'Scarves', categoryId: 6 }
      ]);
    }

    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      console.log('Seeding products database...');
      // Link the initial seed products to the brand, category, department, subcategory IDs
      const populatedProducts = initialProducts.map((p, idx) => {
        let supplierId = 6; // Custom
        let brandId = 3; // Puma
        if (p.brand?.toLowerCase().includes('shein')) {
          supplierId = 1;
          brandId = 4; // Gucci or custom brand mapping
        } else if (p.brand?.toLowerCase().includes('zara')) {
          brandId = 4;
        }

        let categoryId = 1; // Dresses
        let subcategoryId = 8; // Casual
        if (p.category === 'shoes') {
          categoryId = 2;
          subcategoryId = p.subcategory === 'heels' ? 6 : 1;
        } else if (p.category === 'handbags') {
          categoryId = 3;
          subcategoryId = 15;
        } else if (p.category === 'watches') {
          categoryId = 5;
          subcategoryId = 23;
        }

        return {
          ...p,
          supplierId,
          brandId,
          departmentId: 1, // Women
          categoryId,
          subcategoryId,
          // Set status as Published for seeded products
          status: 'Published'
        };
      });
      await db.insert(products).values(populatedProducts);
      console.log('Products seeded successfully.');
    }

    const existingBanners = await db.select().from(banners);
    if (existingBanners.length === 0) {
      console.log('Seeding banners database...');
      await db.insert(banners).values(initialBanners);
      console.log('Banners seeded successfully.');
    }
  } catch (error) {
    console.error('Database seeding failed:', error);
  }
}
