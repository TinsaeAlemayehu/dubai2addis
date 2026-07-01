import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const { Pool } = pkg;
import * as schema from './schema.ts';
import { DrizzleEmulator } from './fallback.ts';

// Function to create a new connection pool.
export const createPool = () => {
  const connectionString = process.env.DATABASE_URL;
  if (connectionString) {
    const isLocal = connectionString.includes('localhost') || connectionString.includes('127.0.0.1');
    return new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
      connectionTimeoutMillis: 3000, // Faster timeout
    });
  }

  return new Pool({
    host: process.env.SQL_HOST,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database: process.env.SQL_DB_NAME,
    connectionTimeoutMillis: 3000, // Faster timeout
  });
};

// Create a pool instance.
const pool = createPool();

let isSqlConnected = false;
let realDb: any = null;

// Prevent unhandled pool-level errors from crashing the application
pool.on('error', (err) => {
  console.error('Unexpected error on idle SQL pool client:', err);
  isSqlConnected = false;
});

// Try to test the real connection on startup
pool.query('SELECT 1')
  .then(async () => {
    console.log('Successfully connected to PostgreSQL database! Ensuring schema exists...');
    
    const createTablesDdl = `
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password_hash TEXT,
        role TEXT NOT NULL DEFAULT 'CUSTOMER',
        name TEXT,
        phone TEXT,
        whatsapp TEXT,
        address TEXT,
        city TEXT,
        country TEXT DEFAULT 'Ethiopia',
        wishlist JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        sku TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL,
        subcategory TEXT,
        brand TEXT,
        price_etb INTEGER NOT NULL,
        original_price_etb INTEGER,
        rating TEXT DEFAULT '4.5',
        reviews_count INTEGER DEFAULT 12,
        sizes JSONB DEFAULT '[]'::jsonb,
        colors JSONB DEFAULT '[]'::jsonb,
        images JSONB DEFAULT '[]'::jsonb,
        is_best_seller BOOLEAN DEFAULT false,
        is_trending BOOLEAN DEFAULT false,
        is_featured BOOLEAN DEFAULT false,
        is_new_arrival BOOLEAN DEFAULT false,
        quantity_available INTEGER DEFAULT 10,
        quantity_reserved INTEGER DEFAULT 0,
        low_stock_threshold INTEGER DEFAULT 3,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        customer_name TEXT NOT NULL,
        customer_phone TEXT NOT NULL,
        customer_whatsapp TEXT,
        items JSONB NOT NULL,
        total_amount_etb INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Pending',
        shipping_address TEXT,
        shipping_city TEXT,
        country TEXT DEFAULT 'Ethiopia',
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS banners (
        id SERIAL PRIMARY KEY,
        title TEXT,
        subtitle TEXT,
        image_url TEXT NOT NULL,
        link TEXT,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    try {
      await pool.query(createTablesDdl);
      console.log('Database tables verified/created successfully.');
      isSqlConnected = true;
      realDb = drizzle(pool, { schema });

      // Run database seeding dynamically to prevent circular imports
      const { seedDatabase } = await import('./seed.ts');
      await seedDatabase();
    } catch (ddlErr: any) {
      console.error('Failed to verify/create tables. Falling back to local database. Error:', ddlErr.message);
      isSqlConnected = false;
    }
  })
  .catch((err) => {
    console.warn('PostgreSQL connection not available. Using local JSON fallback database. Error:', err.message);
    isSqlConnected = false;
  });

const fallbackDb = new DrizzleEmulator();

// Initialize Drizzle with the pool and schema.
// Export the active db via a dynamic proxy!
export const db = new Proxy({}, {
  get(target, prop, receiver) {
    if (isSqlConnected && realDb) {
      return Reflect.get(realDb, prop, receiver);
    } else {
      return Reflect.get(fallbackDb, prop, receiver);
    }
  }
}) as any;

