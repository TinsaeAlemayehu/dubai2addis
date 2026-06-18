/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Testimonial } from '../types';

export const EXCHANGE_RATE_ETB = 36.5; // Custom conversion: 1 AED = ~36.5 ETB (representing luxury import calculation)

export const CATEGORIES = [
  { id: 'new-in', name: 'New In', count: '48 Items', image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=300&q=80' },
  { id: 'dresses', name: 'Dresses', count: '124 Items', image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=300&q=80' },
  { id: 'shoes', name: 'Shoes', count: '85 Items', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=300&q=80' },
  { id: 'handbags', name: 'Handbags', count: '78 Items', image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=300&q=80' },
  { id: 'beauty', name: 'Beauty', count: '62 Items', image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=300&q=80' },
  { id: 'abayas', name: 'Abayas', count: '41 Items', image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=300&q=80' },
  { id: 'watches', name: 'Watches', count: '35 Items', image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=300&q=80' },
  { id: 'jewelry', name: 'Jewelry', count: '55 Items', image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=300&q=80' },
  { id: 'sports', name: 'Sports', count: '39 Items', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=300&q=80' },
  { id: 'accessories', name: 'Accessories', count: '92 Items', image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=300&q=80' },
];

export const PRODUCTS: Product[] = [
  // --- DRESSES ---
  {
    id: 'd1',
    name: 'Elegant Golden-Satin Pleated Evening Gown',
    description: 'Sourced from Premium Dubai Boutiques. Heavyweight silk satin blend featuring a waist-defining side ruching, structured asymmetrical neckline, and floating hemline. Perfect for special holiday gatherings and Ethiopian wedding receptions.',
    category: 'dresses',
    subcategory: 'evening-wear',
    image: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80',
    brand: 'Dubai Outlet Deals',
    priceAED: 249,
    originalPriceAED: 599,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
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
    ]
  },
  {
    id: 'd2',
    name: 'Luxury Pleated Floral Long Chiffon Dress',
    description: 'Soft micro-pleat chiffon with high-neck style panel, matching waist tie sash, and modest double-tier lining. Breathable and elegant styling direct from UAE collections.',
    category: 'dresses',
    subcategory: 'modest-wear',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
    brand: 'SHEIN',
    priceAED: 165,
    originalPriceAED: 280,
    isBestSeller: false,
    isTrending: true,
    rating: 4.7,
    reviewsCount: 24,
    sizes: ['S', 'M', 'L', 'XL'],
    colors: [
      { name: 'Floral Rose', hex: '#de5d83' },
      { name: 'Midnight Navy', hex: '#000080' }
    ],
    images: [
      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'd3',
    name: 'Emerald Green Velvet Modest Kaftan',
    description: 'High-grade premium velvet heavy drop kaftan with fine handcrafted golden Zardozi embroidery, long bell sleeves, and fluid structural silhouette.',
    category: 'dresses',
    subcategory: 'kaftans',
    image: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80',
    brand: 'New Collection',
    priceAED: 320,
    originalPriceAED: 680,
    isBestSeller: true,
    isTrending: false,
    rating: 4.8,
    reviewsCount: 19,
    sizes: ['M', 'L', 'XL', '2XL'],
    colors: [
      { name: 'Emerald Green', hex: '#004b36' },
      { name: 'Royal Gold', hex: '#d4af37' }
    ],
    images: [
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- ABAYAS / MODEST WEAR ---
  {
    id: 'ab1',
    name: 'Golden-Thread Embroidered Luxe Abaya Set',
    description: 'A masterpiece from Dubai Creek designer workshops. Intricate luxury lace and shimmering metallic embroidery patterns along the front panel and wide cuffs. Included is matching pure premium chiffon hijab wrap and sash fabric.',
    category: 'abayas',
    subcategory: 'premium-abayas',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
    brand: 'Dubai Outlet Deals',
    priceAED: 290,
    originalPriceAED: 590,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
    reviewsCount: 57,
    sizes: ['52 (S)', '54 (M)', '56 (L)', '58 (XL)', '60 (2XL)'],
    colors: [
      { name: 'Onyx Black', hex: '#0f0f10' },
      { name: 'Desert Taupe', hex: '#b38b6d' }
    ],
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- BAGS ---
  {
    id: 'b1',
    name: 'Quilted Leather Gold-Chain Shoulder Handbag',
    description: 'Classic luxury design with geometric quilted soft faux-leather, lock-twist closure, and woven gold link hardware. Beautiful day-to-night accessory representing premium Dubai fashion mall style.',
    category: 'handbags',
    subcategory: 'shoulder-bags',
    image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80',
    brand: 'Brands For Less',
    priceAED: 180,
    originalPriceAED: 360,
    isBestSeller: true,
    isTrending: true,
    rating: 4.8,
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
    ]
  },
  {
    id: 'b2',
    name: 'Luxury Crocodile-Embossed Structured Tote',
    description: 'Sleek executive handbag built with rigid structural side inserts, spacious interior velvet compartments, and gold accent feet. Elevates casual fashion instantly.',
    category: 'handbags',
    subcategory: 'tote-bags',
    image: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80',
    brand: 'New Collection',
    priceAED: 215,
    originalPriceAED: 450,
    isBestSeller: false,
    isTrending: true,
    rating: 4.6,
    reviewsCount: 16,
    sizes: ['One Size'],
    colors: [
      { name: 'Croc Dark Green', hex: '#002e1c' },
      { name: 'Crimson Burgundy', hex: '#5f1624' }
    ],
    images: [
      'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- SHOES ---
  {
    id: 's1',
    name: 'Glittering Rhinestone Ribbon Strappy Heels',
    description: 'Heads will turn at any Ethiopian celebration. Features spiral ankle wrapping, dense high-refraction glass crystals, and comfortable cushioned kitten-heel arch context.',
    category: 'shoes',
    subcategory: 'heels',
    image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80',
    brand: 'Temu Finds',
    priceAED: 195,
    originalPriceAED: 410,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
    reviewsCount: 61,
    sizes: ['37', '38', '39', '40', '41'],
    colors: [
      { name: 'Glass Crystal Gold', hex: '#dfc26a' },
      { name: 'Chop Silver', hex: '#c0c0c0' }
    ],
    images: [
      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 's2',
    name: 'Linen Ribbon Block Mules',
    description: 'Breathable, classy flat slides with elegant cross ribbon strap in sand color. Perfect for everyday office and premium brunches in Addis.',
    category: 'shoes',
    subcategory: 'mules-flats',
    image: 'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80',
    brand: 'Dubai Outlet Deals',
    priceAED: 110,
    originalPriceAED: 220,
    isBestSeller: false,
    isTrending: false,
    rating: 4.5,
    reviewsCount: 11,
    sizes: ['36', '37', '38', '39', '40'],
    colors: [
      { name: 'Tuscan Linen', hex: '#ede6d9' },
      { name: 'Jet Black Noir', hex: '#000000' }
    ],
    images: [
      'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- BEAUTY ---
  {
    id: 'bt1',
    name: 'Dubai Gold Oud & Saffron Premium EDP',
    description: 'The definitive scent of Dubai luxury. Warm, enveloping heart of rich cambodi agarwood, sweet saffron filaments, sandalwood oil base notes, and sweet damask rose highlights. Massive sillage and long lasting formula.',
    category: 'beauty',
    subcategory: 'perfumes',
    image: 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80',
    brand: 'Dubai Outlet Deals',
    priceAED: 275,
    originalPriceAED: 499,
    isBestSeller: true,
    isTrending: true,
    rating: 4.8,
    reviewsCount: 88,
    sizes: ['50ml Bottle', '100ml Bottle'],
    colors: [
      { name: 'Amber Gold Resin', hex: '#d4af37' }
    ],
    images: [
      'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'bt2',
    name: 'Luxury Snail-Mucin & Gold Peptide Age-Defying Serum',
    description: 'Formulated with authentic 24K gold dust and advanced polypeptide solutions for rapid cellular hydration and instant radiant glow.',
    category: 'beauty',
    subcategory: 'skincare',
    image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80',
    brand: 'SHEIN',
    priceAED: 135,
    originalPriceAED: 250,
    isBestSeller: false,
    isTrending: true,
    rating: 4.7,
    reviewsCount: 30,
    sizes: ['30ml Pipette'],
    colors: [
      { name: 'Gold Fluid', hex: '#f0e3bc' }
    ],
    images: [
      'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- ACCESSORIES (WATCHES / JEWELRY) ---
  {
    id: 'w1',
    name: 'Emerald Reign Golden Link Luxury Watch',
    description: 'Glistening premium watch featuring an deep imperial green dial, sunburst brush, scratchproof sapphire glass dial, and 18K triple vacuum-plated gold mesh strap. Water-resistant up to 50 meters, beautiful high-society timepiece.',
    category: 'watches',
    subcategory: 'premium-watches',
    image: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80',
    brand: 'Dubai Outlet Deals',
    priceAED: 350,
    originalPriceAED: 820,
    isBestSeller: true,
    isTrending: true,
    rating: 4.9,
    reviewsCount: 47,
    sizes: ['Adjustable Strap'],
    colors: [
      { name: 'Saudi Green & Gold', hex: '#135c38' },
      { name: 'Royal Gold', hex: '#d4af37' }
    ],
    images: [
      'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'j1',
    name: 'Floating Pearls Link Chanting Necklace Set',
    description: 'Double-row premium silver mesh base with authentic cultured river pearls and shining gold accents. Includes elegant stud-back teardrop earrings.',
    category: 'jewelry',
    subcategory: 'necklaces',
    image: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80',
    brand: 'Temu Finds',
    priceAED: 90,
    originalPriceAED: 185,
    isBestSeller: false,
    isTrending: true,
    rating: 4.6,
    reviewsCount: 22,
    sizes: ['Standard Chain'],
    colors: [
      { name: 'Ivory Pearl & Gold', hex: '#fdfef7' }
    ],
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=800&q=80'
    ]
  },
  {
    id: 'ac1',
    name: '18K Gold Plated Chunky Twist Earrings',
    description: 'Premium light-weight brass with triple gold plating. High-luster mirror polish finish that resists tarnishing. Elevate your everyday modest appearance effortlessly.',
    category: 'accessories',
    subcategory: 'earrings',
    image: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80',
    brand: 'New Collection',
    priceAED: 65,
    originalPriceAED: 140,
    isBestSeller: true,
    isTrending: false,
    rating: 4.7,
    reviewsCount: 15,
    sizes: ['One Size'],
    colors: [
      { name: 'Prism Gold', hex: '#d4af37' }
    ],
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80'
    ]
  },

  // --- SPORTS ---
  {
    id: 'sp1',
    name: 'Dubai Sport Breathable Knit Runners',
    description: 'Flexible woven upper structure with high-grade ultra-cushion rubber active sole. Sleek, stylish streetwear look keeping your daily city walks lightweight.',
    category: 'sports',
    subcategory: 'sneakers',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80',
    brand: 'New Collection',
    priceAED: 210,
    originalPriceAED: 420,
    isBestSeller: true,
    isTrending: false,
    rating: 4.8,
    reviewsCount: 33,
    sizes: ['38', '39', '40', '41', '42'],
    colors: [
      { name: 'Aero Sand Grey', hex: '#d3cfc9' },
      { name: 'Onyx Black', hex: '#1a1a1a' }
    ],
    images: [
      'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=800&q=80'
    ]
  }
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: 't1',
    name: 'Tigist Yohannes',
    location: 'Addis Ababa (Bole)',
    rating: 5,
    text: 'I ordered the Golden-Satin Pleated Evening Gown for my sister\'s wedding. The team sourced it exactly as shown on the Dubai online catalog. The material felt so expensive! They updated me via WhatsApp every step of the way until delivery at Bole.',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
    verified: true,
    date: '2 weeks ago'
  },
  {
    id: 't2',
    name: 'Mahlet Abera',
    location: 'Hawassa / Adama',
    rating: 5,
    text: 'This is a game-changer! Sourcing abayas and luxury perfumes from Dubai used to require relatives traveling back and forth. Now I can just select them from Dubai2Addis. Easy payment, fast shipping, and extremely professional support!',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=150&q=80',
    verified: true,
    date: '1 month ago'
  },
  {
    id: 't3',
    name: 'Kalkidan Dereje',
    location: 'Addis Ababa (Sarbet)',
    rating: 5,
    text: 'The Emerald Reign Golden Link Luxury Watch was sourced and delivered in under 10 days. The conversion price in ETB is very transparent. Exceptional communication, WhatsApp ordering makes it very straightforward.',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
    verified: true,
    date: '3 weeks ago'
  }
];

export const BRAND_PARTNERS = [
  { name: 'Brands For Less', tagline: 'Unbeatable Dubai mall deals' },
  { name: 'SHEIN', tagline: 'Trending global styles' },
  { name: 'Temu Finds', tagline: 'Viral lifestyle savings' },
  { name: 'Dubai Outlet', tagline: 'Premium brands discounted' },
  { name: 'New Collection', tagline: 'Exclusive UAE boutiques' }
];

export const SOCIAL_GALLERY = [
  'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=400&q=80',
  'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=400&q=80'
];
