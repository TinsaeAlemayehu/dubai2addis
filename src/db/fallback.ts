import fs from 'fs';
import path from 'path';
import { users, products, orders, banners } from './schema.ts';

const FALLBACK_DB_PATH = path.join(process.cwd(), 'src', 'db', 'fallback_db.json');

// Normalizing column names to row properties
function getRowValue(row: any, dbColName: string): any {
  if (dbColName in row) return row[dbColName];
  
  // Convert snake_case to camelCase
  const camelKey = dbColName.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
  if (camelKey in row) return row[camelKey];
  
  const manualMappings: Record<string, string> = {
    'password_hash': 'passwordHash',
    'price_etb': 'priceETB',
    'original_price_etb': 'originalPriceETB',
    'created_at': 'createdAt',
    'is_best_seller': 'isBestSeller',
    'is_trending': 'isTrending',
    'is_featured': 'isFeatured',
    'is_new_arrival': 'isNewArrival',
    'quantity_available': 'quantityAvailable',
    'quantity_reserved': 'quantityReserved',
    'low_stock_threshold': 'lowStockAlertThreshold',
    'user_id': 'userId',
    'customer_name': 'customerName',
    'customer_phone': 'customerPhone',
    'customer_whatsapp': 'customerWhatsapp',
    'total_amount_etb': 'totalAmountETB',
    'shipping_address': 'shippingAddress',
    'shipping_city': 'shippingCity',
    'image_url': 'imageUrl'
  };
  
  const mappedKey = manualMappings[dbColName];
  if (mappedKey && mappedKey in row) return row[mappedKey];

  return undefined;
}

// Evaluate Drizzle conditions
function evaluateCondition(row: any, cond: any): boolean {
  if (!cond) return true;

  if (typeof cond === 'object') {
    // 1. Handle logical operators (and, or) represented in chunks
    if (cond.chunks && Array.isArray(cond.chunks)) {
      const operator = cond.chunks.find(
        (c: any) => typeof c === 'string' && (c.trim().toLowerCase() === 'and' || c.trim().toLowerCase() === 'or')
      );
      const isOr = operator && operator.trim().toLowerCase() === 'or';
      
      const subConditions = cond.chunks.filter((c: any) => c && typeof c === 'object');
      if (subConditions.length > 0) {
        if (isOr) {
          return subConditions.some((sub: any) => evaluateCondition(row, sub));
        } else {
          return subConditions.every((sub: any) => evaluateCondition(row, sub));
        }
      }
    }

    // 2. Extract left, right, and operator from Drizzle operator objects
    let left: any = cond.left;
    let right: any = cond.right;
    let operator: string = cond.operator || '=';

    if (!left && cond.chunks && cond.chunks.length >= 3) {
      left = cond.chunks[0];
      operator = typeof cond.chunks[1] === 'string' ? cond.chunks[1].trim() : '=';
      right = cond.chunks[2];
    }

    if (left && typeof left === 'object' && left.name) {
      const dbColName = left.name;
      const val = right && typeof right === 'object' && 'value' in right ? right.value : right;
      const rowVal = getRowValue(row, dbColName);

      const op = operator.toLowerCase();
      if (op === '=' || op === 'is') {
        return String(rowVal).toLowerCase() === String(val).toLowerCase();
      }
      if (op === '!=' || op === 'not') {
        return String(rowVal).toLowerCase() !== String(val).toLowerCase();
      }
      if (op === 'like' || op === 'ilike') {
        if (rowVal === undefined || rowVal === null) return false;
        const pattern = String(val).replace(/%/g, '').toLowerCase();
        return String(rowVal).toLowerCase().includes(pattern);
      }
      if (op === '>') {
        return Number(rowVal) > Number(val);
      }
      if (op === '<') {
        return Number(rowVal) < Number(val);
      }
      if (op === '>=') {
        return Number(rowVal) >= Number(val);
      }
      if (op === '<=') {
        return Number(rowVal) <= Number(val);
      }
    }
  }

  return true;
}

// Helper to determine table name string from schema objects
function getTableName(table: any): string {
  if (table === users) return 'users';
  if (table === products) return 'products';
  if (table === orders) return 'orders';
  if (table === banners) return 'banners';
  
  if (table && typeof table === 'object') {
    const name = table[Symbol.for('drizzle:Name')] || table.tableName || (table._ && table._.name);
    if (name) return name;
  }
  return '';
}

// Load DB Store
export function loadStore(): any {
  if (!fs.existsSync(FALLBACK_DB_PATH)) {
    const initialStore = {
      users: [],
      products: [
        {
          id: 1,
          sku: 'DRESS-GOLD-01',
          name: 'Elegant Golden-Satin Pleated Evening Gown',
          description: 'Sourced from Premium Dubai Boutiques. Heavyweight silk satin blend featuring a waist-defining side ruching, structured asymmetrical neckline, and floating hemline. Perfect for special holiday gatherings and Ethiopian wedding receptions.',
          category: 'dresses',
          subcategory: 'evening-wear',
          brand: 'Dubai luxury boutique',
          priceETB: 9089,
          originalPriceETB: 21864,
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
          lowStockAlertThreshold: 3,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          sku: 'DRESS-FLORAL-02',
          name: 'Luxury Pleated Floral Long Chiffon Dress',
          description: 'Soft micro-pleat chiffon with high-neck style panel, matching waist tie sash, and modest double-tier lining. Breathable and elegant styling direct UAE collections.',
          category: 'dresses',
          subcategory: 'modest-wear',
          brand: 'SHEIN Luxe Dubai',
          priceETB: 6023,
          originalPriceETB: 10220,
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
          lowStockAlertThreshold: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 3,
          sku: 'DRESS-GREEN-03',
          name: 'Emerald Green Velvet Modest Kaftan',
          description: 'High-grade premium velvet heavy drop kaftan with fine handcrafted golden Zardozi embroidery, long bell sleeves, and fluid structural silhouette.',
          category: 'dresses',
          subcategory: 'kaftans',
          brand: 'Dubai Outlet Deals',
          priceETB: 11680,
          originalPriceETB: 24820,
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
          lowStockAlertThreshold: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 4,
          sku: 'ABAYA-GOLD-01',
          name: 'Golden-Thread Embroidered Luxe Abaya Set',
          description: 'A masterpiece from Dubai Creek designer workshops. Intricate luxury lace and shimmering metallic embroidery patterns along the front panel and wide cuffs. Included is matching pure premium chiffon hijab wrap and sash fabric.',
          category: 'abayas',
          subcategory: 'premium-abayas',
          brand: 'Dubai Creek Couture',
          priceETB: 10585,
          originalPriceETB: 21535,
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
          lowStockAlertThreshold: 3,
          createdAt: new Date().toISOString()
        },
        {
          id: 5,
          sku: 'BAG-QUILT-01',
          name: 'Quilted Leather Gold-Chain Shoulder Handbag',
          description: 'Classic luxury design with geometric quilted soft faux-leather, lock-twist closure, and woven gold link hardware. Beautiful day-to-night accessory representing premium Dubai fashion mall style.',
          category: 'handbags',
          subcategory: 'shoulder-bags',
          brand: 'Brands For Less Dubai',
          priceETB: 6570,
          originalPriceETB: 13140,
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
          quantityAvailable: 2,
          quantityReserved: 0,
          lowStockAlertThreshold: 3,
          createdAt: new Date().toISOString()
        },
        {
          id: 6,
          sku: 'BAG-TOTE-02',
          name: 'Luxury Crocodile-Embossed Structured Tote',
          description: 'Sleek executive handbag built with rigid structural side inserts, spacious interior velvet compartments, and gold accent feet. Elevates casual fashion instantly.',
          category: 'handbags',
          subcategory: 'tote-bags',
          brand: 'Dubai Outlet Deals',
          priceETB: 7848,
          originalPriceETB: 16425,
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
          lowStockAlertThreshold: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 7,
          sku: 'SHOES-HEELS-01',
          name: 'Glittering Rhinestone Ribbon Strappy Heels',
          description: 'Heads will turn at any Ethiopian celebration. Features spiral ankle wrapping, dense high-refraction glass crystals, and comfortable cushioned kitten-heel arch context.',
          category: 'shoes',
          subcategory: 'heels',
          brand: 'ZARA Dubai Mall',
          priceETB: 7118,
          originalPriceETB: 14963,
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
          quantityAvailable: 1,
          quantityReserved: 0,
          lowStockAlertThreshold: 2,
          createdAt: new Date().toISOString()
        },
        {
          id: 8,
          sku: 'SHOES-MULES-02',
          name: 'Linen Ribbon Block Mules',
          description: 'Breathable, classy flat slides with elegant cross ribbon strap in sand color. Perfect for everyday office and premium brunches in Addis Ababa.',
          category: 'shoes',
          subcategory: 'mules-flats',
          brand: 'Dubai Outlet Deals',
          priceETB: 4015,
          originalPriceETB: 8030,
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
          lowStockAlertThreshold: 2,
          createdAt: new Date().toISOString()
        }
      ],
      orders: [],
      banners: [
        {
          id: 1,
          title: 'DUBAI TO ADDIS ABABA',
          subtitle: 'MODEST LUXURY IMPORTED AT METICULOUS PRICING',
          imageUrl: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1600&q=80',
          link: '#catalog',
          active: true,
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'THE ROYAL ABAYA CONTEXT',
          subtitle: 'GOLDEN THREAD EMBROIDERY SOURCED LIVE FROM DUBAI MALL OUTLETS',
          imageUrl: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=1600&q=80',
          link: '#catalog',
          active: true,
          createdAt: new Date().toISOString()
        }
      ]
    };
    fs.mkdirSync(path.dirname(FALLBACK_DB_PATH), { recursive: true });
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(initialStore, null, 2));
    return initialStore;
  }
  
  try {
    const raw = fs.readFileSync(FALLBACK_DB_PATH, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to read fallback DB file:', err);
    return { users: [], products: [], orders: [], banners: [] };
  }
}

export function saveStore(store: any): void {
  try {
    fs.writeFileSync(FALLBACK_DB_PATH, JSON.stringify(store, null, 2));
  } catch (err) {
    console.error('Failed to save fallback DB:', err);
  }
}

function applySorting(items: any[], orderFns: any[]) {
  if (!orderFns || orderFns.length === 0) return;
  const orderFn = orderFns[0];
  if (!orderFn) return;

  let direction = 'desc';
  let colName = 'id';

  if (typeof orderFn === 'object') {
    if (orderFn.direction) direction = orderFn.direction;
    if (orderFn.expression && orderFn.expression.name) {
      colName = orderFn.expression.name;
    } else if (orderFn.name) {
      colName = orderFn.name;
    } else {
      const str = String(orderFn);
      if (str.includes('asc') || str.includes('ASC')) direction = 'asc';
      if (str.includes('desc') || str.includes('DESC')) direction = 'desc';
      
      const match = str.match(/"([^"]+)"/);
      if (match) colName = match[1];
    }
  }

  items.sort((a, b) => {
    let valA = getRowValue(a, colName);
    let valB = getRowValue(b, colName);

    if (colName === 'id' || colName === 'price_etb' || colName === 'priceETB' || colName === 'reviews_count' || colName === 'reviewsCount') {
      valA = Number(valA || 0);
      valB = Number(valB || 0);
    } else if (colName === 'created_at' || colName === 'createdAt') {
      valA = new Date(valA || 0).getTime();
      valB = new Date(valB || 0).getTime();
    } else {
      valA = String(valA || '').toLowerCase();
      valB = String(valB || '').toLowerCase();
    }

    if (valA < valB) return direction === 'asc' ? -1 : 1;
    if (valA > valB) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

function insertRows(tableName: string, payload: any): any[] {
  const store = loadStore();
  const tableData = store[tableName] || [];
  const rowsToInsert = Array.isArray(payload) ? payload : [payload];
  const inserted: any[] = [];

  for (const row of rowsToInsert) {
    const newRow = { ...row };
    if (newRow.id === undefined) {
      const maxId = tableData.reduce((max: number, r: any) => Math.max(max, Number(r.id || 0)), 0);
      newRow.id = maxId + 1;
    }
    if (!newRow.createdAt && !newRow.created_at) {
      newRow.createdAt = new Date().toISOString();
    }
    tableData.push(newRow);
    inserted.push(newRow);
  }

  store[tableName] = tableData;
  saveStore(store);
  return inserted;
}

function updateRows(tableName: string, payload: any, condition: any): any[] {
  const store = loadStore();
  const tableData = store[tableName] || [];
  const updated: any[] = [];

  for (const row of tableData) {
    if (evaluateCondition(row, condition)) {
      for (const [key, val] of Object.entries(payload)) {
        if (val !== undefined) {
          row[key] = val;
        }
      }
      updated.push(row);
    }
  }

  store[tableName] = tableData;
  saveStore(store);
  return updated;
}

function deleteRows(tableName: string, condition: any): any[] {
  const store = loadStore();
  const tableData = store[tableName] || [];
  const kept: any[] = [];
  const deleted: any[] = [];

  for (const row of tableData) {
    if (evaluateCondition(row, condition)) {
      deleted.push(row);
    } else {
      kept.push(row);
    }
  }

  store[tableName] = kept;
  saveStore(store);
  return deleted;
}

function executeRawSql(sqlObj: any): any {
  let text = '';
  let values: any[] = [];
  
  if (sqlObj && typeof sqlObj === 'object') {
    if (typeof sqlObj.toQuery === 'function') {
      try {
        const compiled = sqlObj.toQuery();
        text = compiled.text;
        values = compiled.values;
      } catch (err) {
        text = String(sqlObj);
      }
    } else if (sqlObj.queryChunks) {
      text = sqlObj.queryChunks.map((c: any) => {
        if (typeof c === 'string') return c;
        if (c && typeof c === 'object') {
          if ('value' in c) {
            values.push(c.value);
            return '$' + values.length;
          }
          if (c.name) return `"${c.name}"`;
        }
        return '';
      }).join(' ');
    } else {
      text = String(sqlObj);
    }
  } else {
    text = String(sqlObj);
  }

  const normalizedText = text.replace(/\s+/g, ' ').trim();
  const store = loadStore();

  // 1. UPDATE products SET quantity_available = GREATEST...
  if (normalizedText.includes('UPDATE products') && normalizedText.includes('quantity_available = GREATEST') && normalizedText.includes('quantity_reserved = quantity_reserved +')) {
    const qty = Number(values[0]);
    const prodId = Number(values[2]);
    const productsList = store.products || [];
    for (const p of productsList) {
      if (Number(p.id) === prodId) {
        p.quantityAvailable = Math.max(0, Number(p.quantityAvailable || 0) - qty);
        p.quantityReserved = Number(p.quantityReserved || 0) + qty;
      }
    }
    store.products = productsList;
    saveStore(store);
    return { rowCount: 1 };
  }

  // 2. UPDATE products SET quantity_reserved = GREATEST...
  if (normalizedText.includes('UPDATE products') && normalizedText.includes('quantity_reserved = GREATEST')) {
    const qty = Number(values[0]);
    const prodId = Number(values[1]);
    const productsList = store.products || [];
    for (const p of productsList) {
      if (Number(p.id) === prodId) {
        p.quantityReserved = Math.max(0, Number(p.quantityReserved || 0) - qty);
      }
    }
    store.products = productsList;
    saveStore(store);
    return { rowCount: 1 };
  }

  // 3. UPDATE products SET quantity_available = quantity_available + ...
  if (normalizedText.includes('UPDATE products') && normalizedText.includes('quantity_available = quantity_available +')) {
    const qty = Number(values[0]);
    const prodId = Number(values[2]);
    const productsList = store.products || [];
    for (const p of productsList) {
      if (Number(p.id) === prodId) {
        p.quantityAvailable = Number(p.quantityAvailable || 0) + qty;
        p.quantityReserved = Math.max(0, Number(p.quantityReserved || 0) - qty);
      }
    }
    store.products = productsList;
    saveStore(store);
    return { rowCount: 1 };
  }

  // 4. UPDATE users SET phone = ...
  if (normalizedText.includes('UPDATE users SET') && normalizedText.includes('phone =') && normalizedText.includes('whatsapp =') && normalizedText.includes('address =')) {
    const phone = values[0];
    const whatsapp = values[1];
    const address = values[2];
    const city = values[3];
    const userId = Number(values[4]);
    
    const usersList = store.users || [];
    for (const u of usersList) {
      if (Number(u.id) === userId) {
        u.phone = phone;
        u.whatsapp = whatsapp;
        u.address = address;
        u.city = city;
      }
    }
    store.users = usersList;
    saveStore(store);
    return { rowCount: 1 };
  }

  // 5. select count(*) from users
  if (normalizedText.includes('select count(*)') || normalizedText.includes('count(*)')) {
    const count = (store.users || []).length;
    return [{ count }];
  }

  console.warn(`Unrecognized raw SQL query: "${normalizedText}". Returning empty result.`);
  return [];
}

export class DrizzleEmulator {
  select(fields?: any) {
    return {
      from: (table: any) => {
        const tableName = getTableName(table);
        const store = loadStore();
        let items = store[tableName] || [];
        
        const builder = {
          where: (condition: any) => {
            items = items.filter((item: any) => evaluateCondition(item, condition));
            return builder;
          },
          orderBy: (...orderFns: any[]) => {
            applySorting(items, orderFns);
            return builder;
          },
          then: (onfulfilled?: any, onrejected?: any) => {
            if (fields && 'count' in fields) {
              return Promise.resolve([{ count: items.length }]).then(onfulfilled, onrejected);
            }
            return Promise.resolve(items).then(onfulfilled, onrejected);
          },
          catch: (onrejected?: any) => {
            return Promise.resolve(items).catch(onrejected);
          }
        };
        return builder;
      }
    };
  }

  insert(table: any) {
    return {
      values: (payload: any) => {
        const tableName = getTableName(table);
        const insertedRows = insertRows(tableName, payload);
        const builder = {
          returning: () => {
            return insertedRows;
          },
          then: (onfulfilled?: any, onrejected?: any) => {
            return Promise.resolve(insertedRows).then(onfulfilled, onrejected);
          }
        };
        return builder;
      }
    };
  }

  update(table: any) {
    return {
      set: (payload: any) => {
        const tableName = getTableName(table);
        const builder = {
          where: (condition: any) => {
            const updatedRows = updateRows(tableName, payload, condition);
            const subBuilder = {
              returning: () => {
                return updatedRows;
              },
              then: (onfulfilled?: any, onrejected?: any) => {
                return Promise.resolve(updatedRows).then(onfulfilled, onrejected);
              }
            };
            return subBuilder;
          }
        };
        return builder;
      }
    };
  }

  delete(table: any) {
    return {
      where: (condition: any) => {
        const tableName = getTableName(table);
        const deletedRows = deleteRows(tableName, condition);
        const subBuilder = {
          returning: () => {
            return deletedRows;
          },
          then: (onfulfilled?: any, onrejected?: any) => {
            return Promise.resolve(deletedRows).then(onfulfilled, onrejected);
          }
        };
        return subBuilder;
      }
    };
  }

  execute(sqlObj: any) {
    const result = executeRawSql(sqlObj);
    return Promise.resolve(result);
  }
}
