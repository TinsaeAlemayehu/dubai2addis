import { db } from './index.ts';
import { products, banners } from './schema.ts';
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
    const existingProducts = await db.select().from(products);
    if (existingProducts.length === 0) {
      console.log('Seeding products database...');
      await db.insert(products).values(initialProducts);
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
