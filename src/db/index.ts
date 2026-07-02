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
        status TEXT DEFAULT 'Draft',
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

      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        site_name TEXT NOT NULL DEFAULT 'AddisDubai',
        logo_url TEXT DEFAULT '',
        whatsapp_number TEXT NOT NULL DEFAULT '+971552734073',
        currency TEXT NOT NULL DEFAULT 'ETB',
        delivery_fee TEXT NOT NULL DEFAULT '200',
        support_email TEXT NOT NULL DEFAULT 'info@addisdubai.com',
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS purchase_tasks (
        id SERIAL PRIMARY KEY,
        order_id INTEGER NOT NULL REFERENCES orders(id),
        product_sku TEXT NOT NULL,
        product_name TEXT NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        selected_size TEXT,
        selected_color TEXT,
        supplier_id TEXT,
        supplier_price_aed INTEGER,
        purchase_status TEXT NOT NULL DEFAULT 'TO_PURCHASE',
        notes TEXT,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS import_jobs (
        id SERIAL PRIMARY KEY,
        filename TEXT NOT NULL,
        supplier TEXT DEFAULT 'Generic',
        status TEXT NOT NULL DEFAULT 'Completed',
        duration INTEGER DEFAULT 0,
        total_rows INTEGER DEFAULT 0,
        imported_count INTEGER DEFAULT 0,
        updated_count INTEGER DEFAULT 0,
        skipped_count INTEGER DEFAULT 0,
        failed_count INTEGER DEFAULT 0,
        duplicate_count INTEGER DEFAULT 0,
        error_log TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS import_job_items (
        id SERIAL PRIMARY KEY,
        job_id INTEGER NOT NULL REFERENCES import_jobs(id) ON DELETE CASCADE,
        sku TEXT,
        name TEXT,
        status TEXT NOT NULL,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS import_templates (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        mapping JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS brands (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS departments (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS subcategories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
        is_archived BOOLEAN DEFAULT false NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `;

    try {
      await pool.query(createTablesDdl);
      // Run safe migrations to add status column and set default to 'Draft'
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Draft';");
      await pool.query("ALTER TABLE products ALTER COLUMN status SET DEFAULT 'Draft';");

      // Add classification columns to products
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_id INTEGER REFERENCES suppliers(id) ON DELETE SET NULL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS subcategory_id INTEGER REFERENCES subcategories(id) ON DELETE SET NULL;");
      
      // Add Pricing Engine columns to products
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_price REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS supplier_currency TEXT DEFAULT 'AED';");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS exchange_rate_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS shipping_percentage_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS handling_percentage_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS risk_buffer_percentage_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS profit_percentage_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS fixed_fee_used REAL;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS calculated_selling_price_etb INTEGER;");
      await pool.query("ALTER TABLE products ADD COLUMN IF NOT EXISTS calculated_at TIMESTAMP;");

      // Add Pricing Engine columns to settings
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS exchange_rates JSONB DEFAULT '{\"AED\": 31.0, \"USD\": 115.0}'::jsonb;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS shipping_percentage REAL DEFAULT 20.0;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS handling_percentage REAL DEFAULT 5.0;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS risk_buffer_percentage REAL DEFAULT 3.0;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS profit_percentage REAL DEFAULT 15.0;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS fixed_fee_etb INTEGER DEFAULT 0;");
      await pool.query("ALTER TABLE settings ADD COLUMN IF NOT EXISTS rounding_rule TEXT DEFAULT 'None';");
      
      // Ensure database indexes are created
      await pool.query("CREATE INDEX IF NOT EXISTS products_sku_idx ON products (sku);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_category_idx ON products (category);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_brand_idx ON products (brand);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_status_idx ON products (status);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_supplier_id_idx ON products (supplier_id);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_brand_id_idx ON products (brand_id);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_department_id_idx ON products (department_id);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_category_id_idx ON products (category_id);");
      await pool.query("CREATE INDEX IF NOT EXISTS products_subcategory_id_idx ON products (subcategory_id);");

      // Seed default settings row if not exists
      await pool.query(`
        INSERT INTO settings (
          id, site_name, logo_url, whatsapp_number, currency, delivery_fee, support_email,
          exchange_rates, shipping_percentage, handling_percentage, risk_buffer_percentage,
          profit_percentage, fixed_fee_etb, rounding_rule
        )
        VALUES (
          1, 'AddisDubai', '', '+971552734073', 'ETB', '200', 'info@addisdubai.com',
          '{"AED": 31.0, "USD": 115.0}'::jsonb, 20.0, 5.0, 3.0, 15.0, 0, 'None'
        )
        ON CONFLICT (id) DO NOTHING;
      `);
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

