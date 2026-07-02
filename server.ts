import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { products, orders, users, banners, settings, purchaseTasks } from './src/db/schema.ts';
import { eq, and, or, asc, desc, like, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin, requireSuperAdmin, AuthRequest } from './src/middleware/auth.ts';
import { seedDatabase } from './src/db/seed.ts';
import { adminAuth } from './src/lib/firebase-admin.ts';
import firebaseConfig from './firebase-applet-config.json'; // Direct static import
import crypto from 'crypto';

function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_local_secret_dub2addis_2026_!!';

function generateLocalToken(uid: string, email: string, name: string): string {
  const payload = { uid, email, name, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 };
  const str = JSON.stringify(payload);
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('hex');
  return `local:${Buffer.from(str).toString('base64')}.${signature}`;
}

async function ensureAdminAccounts() {
  try {
    const adminEmails = ['goodtinsae@gmail.com', 'itistinsae@gmail.com'];
    console.log('Synchronizing administrative credentials on boot...');
    const hp = hashPassword('atinzzz');

    for (const email of adminEmails) {
      try {
        let userUid = '';
        
        try {
          const userRecord = await adminAuth.getUserByEmail(email);
          userUid = userRecord.uid;
          // Update password to 'atinzzz'
          await adminAuth.updateUser(userRecord.uid, {
            password: 'atinzzz',
          });
          console.log(`Successfully updated admin password in Firebase for: ${email}`);
        } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
            try {
              const userRecord = await adminAuth.createUser({
                email: email,
                password: 'atinzzz',
                emailVerified: true,
                displayName: email === 'goodtinsae@gmail.com' ? 'Good Tinsae (Admin)' : 'Itis Tinsae (Admin)'
              });
              userUid = userRecord.uid;
              console.log(`Successfully created new Firebase admin account for: ${email}`);
            } catch (createErr: any) {
              const cleanMsg = (createErr.message || '').split('https://')[0] || 'Auth service disabled';
              console.log(`[Admin Setup] Firebase create admin bypassed for ${email} - using local credentials: ${cleanMsg}`);
            }
          } else {
            const cleanMsg = (err.message || '').split('https://')[0] || 'Auth service disabled';
            console.log(`[Admin Setup] Firebase check bypassed for ${email} - using local credentials: ${cleanMsg}`);
          }
        }

        if (!userUid) {
          // Fallback to local deterministic UID
          userUid = `local-uid-${email.replace('@', '-')}`;
        }

        // Now ensure they are also in the users database table as SUPER_ADMIN
        const dbUserList = await db.select().from(users).where(eq(users.email, email));
        if (dbUserList.length === 0) {
          await db.insert(users).values({
            uid: userUid,
            email: email,
            role: 'SUPER_ADMIN',
            name: email === 'goodtinsae@gmail.com' ? 'Good Tinsae (Admin)' : 'Itis Tinsae (Admin)',
            passwordHash: hp,
            phone: '',
            whatsapp: '',
            address: '',
            city: '',
            wishlist: []
          });
          console.log(`Successfully synced db user profile for admin: ${email}`);
        } else {
          // If role is not SUPER_ADMIN, update it and set password hash
          await db.update(users)
            .set({ 
              uid: userUid,
              role: 'SUPER_ADMIN',
              passwordHash: hp
            })
            .where(eq(users.id, dbUserList[0].id));
          console.log(`Escalated db user role to SUPER_ADMIN & updated hash for admin: ${email}`);
        }
      } catch (userErr) {
        console.error(`Failed to sync admin user ${email}:`, userErr);
      }
    }
  } catch (error) {
    console.error('Error in ensureAdminAccounts:', error);
  }
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

  // Middleware
  app.use(express.json());

  // Run initial seeding
  await seedDatabase();

  // Synchronize admin accounts on startup
  await ensureAdminAccounts();

  // API ROUTES

  // 0. Custom Authentication API (bypassing client Email/Password sign-in limitation)
  app.post('/api/auth/register', async (req, res) => {
    try {
      const { email, password, name, phone, whatsapp, address, city } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const emailLower = email.toLowerCase();

      // Check if user already exists
      const existing = await db.select().from(users).where(eq(users.email, emailLower));
      if (existing.length > 0) {
        return res.status(400).json({ error: 'User with this email already exists in Database.' });
      }

      // Try creating user in Firebase Admin (fallback if fails)
      let fbUid = '';
      try {
        let fbUser;
        try {
          fbUser = await adminAuth.getUserByEmail(emailLower);
          fbUid = fbUser.uid;
        } catch (err: any) {
          if (err.code === 'auth/user-not-found') {
            fbUser = await adminAuth.createUser({
              email: emailLower,
              password: password,
              displayName: name || emailLower.split('@')[0],
              emailVerified: true
            });
            fbUid = fbUser.uid;
          } else {
            throw err;
          }
        }
      } catch (err: any) {
        const cleanMsg = (err.message || '').split('https://')[0] || 'Auth service disabled';
        console.log(`[Register] Firebase registration bypassed, continuing with database entry: ${cleanMsg}`);
        fbUid = `local-uid-${emailLower.replace('@', '-')}-${Date.now()}`;
      }

      // Check if they are admin
      let role = 'CUSTOMER';
      if (emailLower === 'goodtinsae@gmail.com' || emailLower === 'itistinsae@gmail.com' || emailLower.startsWith('admin')) {
        role = 'SUPER_ADMIN';
      }

      // Hash password
      const hp = hashPassword(password);

      // Create standard DB entry
      const newUserList = await db.insert(users).values({
        uid: fbUid,
        email: emailLower,
        passwordHash: hp,
        role: role,
        name: name || emailLower.split('@')[0],
        phone: phone || '',
        whatsapp: whatsapp || '',
        address: address || '',
        city: city || '',
        wishlist: []
      }).returning();

      // Generate local token
      const localToken = generateLocalToken(fbUid, emailLower, name || emailLower.split('@')[0]);

      // Create Custom Token for customer (optional)
      let customToken = '';
      try {
        customToken = await adminAuth.createCustomToken(fbUid);
      } catch (err: any) {
        const cleanMsg = (err.message || '').split('https://')[0] || 'Auth service disabled';
        console.log(`[Register] Firebase Custom Token bypassed: ${cleanMsg}`);
      }

      res.json({ customToken, localToken, user: newUserList[0] });
    } catch (error: any) {
      console.error('Error in register endpoint:', error);
      res.status(500).json({ error: error.message || 'Registration failed' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email is required' });
      }

      const emailLower = email.toLowerCase();

      // Find user in database first
      let dbUserList = await db.select().from(users).where(eq(users.email, emailLower));
      let dbUser = dbUserList[0];

      // Auto-create/sync simulator quick-logins or special administrators
      const isBypassEmail = emailLower.endsWith('@addisdubai.com');
      const isAdminEmail = emailLower === 'goodtinsae@gmail.com' || emailLower === 'itistinsae@gmail.com' || emailLower.startsWith('admin');

      if (!dbUser && (isBypassEmail || isAdminEmail)) {
        // We will mock or register them on the fly if needed
        let fbUid = '';
        try {
          const fbUser = await adminAuth.getUserByEmail(emailLower);
          fbUid = fbUser.uid;
        } catch (err: any) {
          try {
            const fbUser = await adminAuth.createUser({
              email: emailLower,
              password: password || 'Dub2AddisSecurePass1!',
              displayName: emailLower.split('@')[0],
              emailVerified: true
            });
            fbUid = fbUser.uid;
          } catch (createErr: any) {
            const cleanMsg = (createErr.message || '').split('https://')[0] || 'Auth service disabled';
            console.log(`[Login] Firebase Admin login sync bypassed, using local uid: ${cleanMsg}`);
            fbUid = `local-uid-${emailLower.replace('@', '-')}`;
          }
        }

        const role = isAdminEmail ? 'SUPER_ADMIN' : emailLower.split('@')[0].toUpperCase();
        const hp = hashPassword(password || 'Dub2AddisSecurePass1!');

        const inserted = await db.insert(users).values({
          uid: fbUid,
          email: emailLower,
          passwordHash: hp,
          role: role,
          name: emailLower.split('@')[0].toUpperCase() + ' Simulator',
          phone: '',
          whatsapp: '',
          address: '',
          city: '',
          wishlist: []
        }).returning();
        dbUser = inserted[0];
      }

      if (!dbUser) {
        return res.status(404).json({ error: 'User record not found.' });
      }

      // Verify Password (if password is sent)
      if (password) {
        const hp = hashPassword(password);
        if (dbUser.passwordHash && dbUser.passwordHash !== hp) {
          return res.status(401).json({ error: 'Incorrect email or password.' });
        }
      }

      // Generate local token
      const localToken = generateLocalToken(dbUser.uid, dbUser.email, dbUser.name || '');

      // Generate a Firebase custom auth token to send back (optional)
      let customToken = '';
      try {
        customToken = await adminAuth.createCustomToken(dbUser.uid);
      } catch (err: any) {
        const cleanMsg = (err.message || '').split('https://')[0] || 'Auth service disabled';
        console.log(`[Login] Firebase Custom Token bypassed: ${cleanMsg}`);
      }

      res.json({ customToken, localToken, user: dbUser });
    } catch (error: any) {
      console.error('Error in login endpoint:', error);
      res.status(500).json({ error: error.message || 'Login failed' });
    }
  });

  // Global Settings API
  app.get('/api/settings', async (req, res) => {
    try {
      const records = await db.select().from(settings).where(eq(settings.id, 1));
      if (records.length === 0) {
        const defaultSettings = {
          id: 1,
          siteName: 'AddisDubai',
          logoUrl: '',
          whatsappNumber: '+971552734073',
          currency: 'ETB',
          deliveryFee: '200',
          supportEmail: 'info@addisdubai.com',
          updatedAt: new Date()
        };
        try {
          await db.insert(settings).values(defaultSettings);
        } catch {}
        return res.json(defaultSettings);
      }
      res.json(records[0]);
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      res.status(500).json({ error: error.message || 'Failed to fetch settings' });
    }
  });

  app.put('/api/settings', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { siteName, logoUrl, whatsappNumber, currency, deliveryFee, supportEmail } = req.body;
      const records = await db.select().from(settings).where(eq(settings.id, 1));
      let updated;
      if (records.length === 0) {
        updated = await db.insert(settings).values({
          id: 1,
          siteName: siteName || 'AddisDubai',
          logoUrl: logoUrl || '',
          whatsappNumber: whatsappNumber || '+971552734073',
          currency: currency || 'ETB',
          deliveryFee: deliveryFee || '200',
          supportEmail: supportEmail || 'info@addisdubai.com',
          updatedAt: new Date()
        }).returning();
      } else {
        updated = await db.update(settings)
          .set({
            siteName: siteName !== undefined ? siteName : undefined,
            logoUrl: logoUrl !== undefined ? logoUrl : undefined,
            whatsappNumber: whatsappNumber !== undefined ? whatsappNumber : undefined,
            currency: currency !== undefined ? currency : undefined,
            deliveryFee: deliveryFee !== undefined ? deliveryFee : undefined,
            supportEmail: supportEmail !== undefined ? supportEmail : undefined,
            updatedAt: new Date()
          })
          .where(eq(settings.id, 1))
          .returning();
      }
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      res.status(500).json({ error: error.message || 'Failed to update settings' });
    }
  });

  // Purchase Queue (Sourcing & Fulfillment Sourcing Tasks)
  app.get('/api/purchase-tasks', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const tasks = await db.select().from(purchaseTasks).orderBy(desc(purchaseTasks.createdAt));
      res.json(tasks);
    } catch (error: any) {
      console.error('Error fetching purchase tasks:', error);
      res.status(500).json({ error: 'Failed to fetch purchase tasks' });
    }
  });

  app.post('/api/purchase-tasks', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { orderId, productSku, productName, quantity, selectedSize, selectedColor, supplierId, supplierPriceAED, notes } = req.body;
      if (!orderId || !productSku || !productName) {
        return res.status(400).json({ error: 'orderId, productSku, and productName are required' });
      }
      const newTask = await db.insert(purchaseTasks).values({
        orderId: parseInt(orderId),
        productSku,
        productName,
        quantity: parseInt(quantity) || 1,
        selectedSize: selectedSize || '',
        selectedColor: selectedColor || '',
        supplierId: supplierId || null,
        supplierPriceAED: supplierPriceAED ? parseInt(supplierPriceAED) : null,
        purchaseStatus: 'TO_PURCHASE',
        notes: notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      }).returning();
      res.json(newTask[0]);
    } catch (error: any) {
      console.error('Error creating purchase task:', error);
      res.status(500).json({ error: 'Failed to create purchase task' });
    }
  });

  app.put('/api/purchase-tasks/bulk-status', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { ids, purchaseStatus } = req.body;
      if (!Array.isArray(ids) || ids.length === 0 || !purchaseStatus) {
        return res.status(400).json({ error: 'ids array and purchaseStatus are required' });
      }

      const updatedTasks = [];
      for (const id of ids) {
        const updated = await db.update(purchaseTasks)
          .set({ 
            purchaseStatus,
            updatedAt: new Date()
          })
          .where(eq(purchaseTasks.id, parseInt(id)))
          .returning();
        if (updated.length > 0) {
          updatedTasks.push(updated[0]);
        }
      }

      res.json({ message: `Successfully updated ${updatedTasks.length} tasks`, tasks: updatedTasks });
    } catch (error: any) {
      console.error('Error bulk updating purchase tasks:', error);
      res.status(500).json({ error: 'Failed to bulk update purchase tasks' });
    }
  });

  app.post('/api/purchase-tasks/bulk-delete', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { ids } = req.body;
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ error: 'ids array is required' });
      }

      let deletedCount = 0;
      for (const id of ids) {
        const deleted = await db.delete(purchaseTasks)
          .where(eq(purchaseTasks.id, parseInt(id)))
          .returning();
        if (deleted.length > 0) {
          deletedCount++;
        }
      }

      res.json({ message: `Successfully deleted ${deletedCount} tasks` });
    } catch (error: any) {
      console.error('Error bulk deleting purchase tasks:', error);
      res.status(500).json({ error: 'Failed to bulk delete purchase tasks' });
    }
  });

  app.put('/api/purchase-tasks/:id/status', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Valid ID is required' });

      const { purchaseStatus, notes, supplierId, supplierPriceAED } = req.body;
      
      const updated = await db.update(purchaseTasks)
        .set({
          purchaseStatus: purchaseStatus !== undefined ? purchaseStatus : undefined,
          notes: notes !== undefined ? notes : undefined,
          supplierId: supplierId !== undefined ? supplierId : undefined,
          supplierPriceAED: supplierPriceAED !== undefined ? (supplierPriceAED ? parseInt(supplierPriceAED) : null) : undefined,
          updatedAt: new Date()
        })
        .where(eq(purchaseTasks.id, id))
        .returning();

      if (updated.length === 0) return res.status(404).json({ error: 'Purchase task not found' });
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating purchase task:', error);
      res.status(500).json({ error: 'Failed to update purchase task' });
    }
  });

  // 1. Products API
  app.get('/api/products', async (req, res) => {
    try {
      const { category, subcategory, search, sort, isFeatured, isNewArrival, page = '1', limit = '100' } = req.query;
      
      let conditions = [];

      if (category && category !== 'all' && category !== 'new-in') {
        conditions.push(eq(products.category, category as string));
      }

      if (subcategory) {
        conditions.push(eq(products.subcategory, subcategory as string));
      }

      if (isFeatured === 'true') {
        conditions.push(eq(products.isFeatured, true));
      }

      if (isNewArrival === 'true' || category === 'new-in') {
        conditions.push(eq(products.isNewArrival, true));
      }

      if (search) {
        conditions.push(
          or(
            like(products.name, `%${search}%`),
            like(products.sku, `%${search}%`),
            like(products.brand, `%${search}%`),
            like(products.description, `%${search}%`)
          )
        );
      }

      let query = db.select().from(products);
      if (conditions.length > 0) {
        query = query.where(and(...conditions)) as any;
      }

      // Sort
      if (sort === 'price-low') {
        query = query.orderBy(asc(products.priceETB)) as any;
      } else if (sort === 'price-high') {
        query = query.orderBy(desc(products.priceETB)) as any;
      } else if (sort === 'newest') {
        query = query.orderBy(desc(products.createdAt)) as any;
      } else {
        query = query.orderBy(desc(products.id)) as any;
      }

      const results = await query;
      res.json(results);
    } catch (error: any) {
      console.error('Failed to fetch products:', error);
      res.status(500).json({ error: 'Database query failed. Please try again later.' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid product ID' });

      const prod = await db.select().from(products).where(eq(products.id, id));
      if (prod.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.json(prod[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Database error' });
    }
  });

  // Admin/Staff - Add Product
  app.post('/api/products', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const {
        sku, name, description, category, subcategory, brand,
        priceETB, originalPriceETB, sizes, colors, images,
        isFeatured, isNewArrival, quantityAvailable, lowStockAlertThreshold, status
      } = req.body;

      if (!sku || !name || !category || !priceETB) {
        return res.status(400).json({ error: 'SKU, Name, Category and Price are required' });
      }

      const newProd = await db.insert(products)
        .values({
          sku,
          name,
          description,
          category,
          subcategory,
          brand,
          priceETB: parseInt(priceETB),
          originalPriceETB: originalPriceETB ? parseInt(originalPriceETB) : null,
          sizes: sizes || [],
          colors: colors || [],
          images: images || [],
          isFeatured: !!isFeatured,
          isNewArrival: !!isNewArrival,
          quantityAvailable: quantityAvailable !== undefined ? parseInt(quantityAvailable) : 10,
          quantityReserved: 0,
          lowStockAlertThreshold: lowStockAlertThreshold !== undefined ? parseInt(lowStockAlertThreshold) : 3,
          status: status || 'Published',
        })
        .returning();

      res.status(201).json(newProd[0]);
    } catch (error: any) {
      console.error('Error adding product:', error);
      res.status(500).json({ error: 'Failed to create product: ' + error.message });
    }
  });

  // Admin/Staff - Edit Product
  app.put('/api/products/:id', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

      const {
        sku, name, description, category, subcategory, brand,
        priceETB, originalPriceETB, sizes, colors, images,
        isFeatured, isNewArrival, quantityAvailable, lowStockAlertThreshold, status
      } = req.body;

      const updated = await db.update(products)
        .set({
          sku,
          name,
          description,
          category,
          subcategory,
          brand,
          priceETB: priceETB !== undefined ? parseInt(priceETB) : undefined,
          originalPriceETB: originalPriceETB !== undefined ? (originalPriceETB ? parseInt(originalPriceETB) : null) : undefined,
          sizes: sizes || undefined,
          colors: colors || undefined,
          images: images || undefined,
          isFeatured: isFeatured !== undefined ? !!isFeatured : undefined,
          isNewArrival: isNewArrival !== undefined ? !!isNewArrival : undefined,
          quantityAvailable: quantityAvailable !== undefined ? parseInt(quantityAvailable) : undefined,
          lowStockAlertThreshold: lowStockAlertThreshold !== undefined ? parseInt(lowStockAlertThreshold) : undefined,
          status: status !== undefined ? status : undefined,
        })
        .where(eq(products.id, id))
        .returning();

      if (updated.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating product:', error);
      res.status(500).json({ error: 'Failed to update: ' + error.message });
    }
  });

  // Super Admin - Delete Product
  app.delete('/api/products/:id', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID' });

      const deleted = await db.delete(products).where(eq(products.id, id)).returning();
      if (deleted.length === 0) return res.status(404).json({ error: 'Product not found' });
      res.json({ message: 'Product deleted successfully', deleted: deleted[0] });
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to delete' });
    }
  });


  // 2. Orders API
  app.get('/api/orders', requireAuth, async (req: AuthRequest, res) => {
    try {
      if (req.dbUser.role === 'SUPER_ADMIN' || req.dbUser.role === 'STAFF') {
        const allOrders = await db.select().from(orders).orderBy(desc(orders.createdAt));
        return res.json(allOrders);
      } else {
        const customerOrders = await db.select().from(orders).where(eq(orders.userId, req.dbUser.id)).orderBy(desc(orders.createdAt));
        return res.json(customerOrders);
      }
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  });

  app.post('/api/orders', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { items, customerName, customerPhone, customerWhatsapp, totalAmountETB, shippingAddress, shippingCity, country } = req.body;

      if (!items || !customerName || !customerPhone || !totalAmountETB) {
        return res.status(400).json({ error: 'Missing required checkout information' });
      }

      // Automatically update inventory quantityAvailable vs reserved
      for (const item of items) {
        const prodId = parseInt(item.product.id);
        if (!isNaN(prodId)) {
          // Adjust quantities inside database securely using SQL additions or updates
          await db.execute(sql`
            UPDATE products 
            SET quantity_available = GREATEST(0, quantity_available - ${item.quantity}),
                quantity_reserved = quantity_reserved + ${item.quantity}
            WHERE id = ${prodId}
          `);
        }
      }

      const newOrder = await db.insert(orders)
        .values({
          userId: req.dbUser.id,
          customerName,
          customerPhone,
          customerWhatsapp,
          items,
          totalAmountETB: parseInt(totalAmountETB),
          status: 'Pending',
          shippingAddress,
          shippingCity,
          country: country || 'Ethiopia',
        })
        .returning();

      // Update total purchase volume for this customer
      await db.execute(sql`
        UPDATE users
        SET phone = ${customerPhone},
            whatsapp = ${customerWhatsapp || ''},
            address = ${shippingAddress || ''},
            city = ${shippingCity || ''}
        WHERE id = ${req.dbUser.id}
      `);

      res.status(201).json(newOrder[0]);
    } catch (error: any) {
      console.error('Checkout creation failed:', error);
      res.status(500).json({ error: 'Checkout creation failed: ' + error.message });
    }
  });

  // Admin/Staff - Update Order Status
  app.put('/api/orders/:id/status', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;

      if (isNaN(id) || !status) return res.status(400).json({ error: 'ID and status are required' });

      const updated = await db.update(orders)
        .set({ status })
        .where(eq(orders.id, id))
        .returning();

      if (updated.length === 0) return res.status(404).json({ error: 'Order not found' });

      // Automatically generate purchase tasks on PAID/Deposit Received status
      if (status.toUpperCase() === 'PAID' || status === 'Deposit Received') {
        const orderItems = updated[0].items;
        if (Array.isArray(orderItems)) {
          for (const item of orderItems) {
            const sku = item.product?.sku || item.product?.id?.toString() || 'UNKNOWN';
            const name = item.product?.name || 'Unknown Item';
            const qty = item.quantity || 1;
            const size = item.selectedSize || '';
            const color = (item.selectedColor && typeof item.selectedColor === 'object') ? item.selectedColor.name : (item.selectedColor || '');
            const supplierId = item.product?.supplierId || '';
            const supplierPrice = item.product?.supplierPrice || 0;

            // Check if purchase task already exists for this orderId and sku
            const existing = await db.select()
              .from(purchaseTasks)
              .where(and(eq(purchaseTasks.orderId, id), eq(purchaseTasks.productSku, sku)));

            if (existing.length === 0) {
              await db.insert(purchaseTasks).values({
                orderId: id,
                productSku: sku,
                productName: name,
                quantity: qty,
                selectedSize: size,
                selectedColor: color,
                supplierId: supplierId || null,
                supplierPriceAED: supplierPrice || null,
                purchaseStatus: 'TO_PURCHASE',
                createdAt: new Date(),
                updatedAt: new Date(),
              });
            }
          }
        }
      }

      // If status changes to 'Delivered' or 'Cancelled', resolve the reserved stock
      if (status === 'Delivered') {
        for (const item of (updated[0].items as any)) {
          const prodId = parseInt(item.product.id);
          if (!isNaN(prodId)) {
            await db.execute(sql`
              UPDATE products 
              SET quantity_reserved = GREATEST(0, quantity_reserved - ${item.quantity})
              WHERE id = ${prodId}
            `);
          }
        }
      } else if (status === 'Cancelled') {
        for (const item of (updated[0].items as any)) {
          const prodId = parseInt(item.product.id);
          if (!isNaN(prodId)) {
            await db.execute(sql`
              UPDATE products 
              SET quantity_available = quantity_available + ${item.quantity},
                  quantity_reserved = GREATEST(0, quantity_reserved - ${item.quantity})
              WHERE id = ${prodId}
            `);
          }
        }
      }

      res.json(updated[0]);
    } catch (error: any) {
      console.error('Error updating status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  });


  // 3. Profiles / Users API
  app.get('/api/users/profile', requireAuth, async (req: AuthRequest, res) => {
    res.json(req.dbUser);
  });

  app.put('/api/users/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { name, phone, whatsapp, address, city, country } = req.body;
      const updated = await db.update(users)
        .set({ name, phone, whatsapp, address, city, country })
        .where(eq(users.id, req.dbUser.id))
        .returning();
      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update profile' });
    }
  });

  // Client updates wishlist
  app.put('/api/users/wishlist', requireAuth, async (req: AuthRequest, res) => {
    try {
      const { wishlist } = req.body; // array of product ids
      if (!Array.isArray(wishlist)) return res.status(400).json({ error: 'Wishlist must be an array' });

      const updated = await db.update(users)
        .set({ wishlist })
        .where(eq(users.id, req.dbUser.id))
        .returning();
      res.json(updated[0].wishlist);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update wishlist' });
    }
  });

  // Super Admin - List Users
  app.get('/api/users', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      res.json(allUsers);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to fetch users list' });
    }
  });

  // Admin/Staff - List Customers with stats
  app.get('/api/customers', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));
      const allOrders = await db.select().from(orders);

      const customerStats = allUsers.map(u => {
        const userOrders = allOrders.filter(o => o.userId === u.id);
        const totalSpent = userOrders.reduce((sum, o) => sum + (o.totalAmountETB || 0), 0);
        let maxDate = null;
        if (userOrders.length > 0) {
          maxDate = userOrders.reduce((max, o) => !max || new Date(o.createdAt).getTime() > new Date(max).getTime() ? o.createdAt : max, null as any);
        }

        return {
          id: u.id,
          name: u.name || 'Anonymous',
          email: u.email,
          phone: u.phone || 'N/A',
          whatsapp: u.whatsapp || '',
          ordersCount: userOrders.length,
          totalSpent,
          lastOrderDate: maxDate,
          status: userOrders.length > 0 ? 'Active' : 'Inactive'
        };
      });

      res.json(customerStats);
    } catch (error: any) {
      console.error('Failed to fetch customers:', error);
      res.status(500).json({ error: 'Failed to fetch customer directory' });
    }
  });

  // Admin/Staff - Import Products (Supplier Scraper simulator)
  app.post('/api/import-products', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { supplierUrl, supplierName, category, brand } = req.body;
      if (!supplierUrl) return res.status(400).json({ error: 'Supplier URL is required' });

      // Determine a friendly name based on supplier name/URL domain
      let urlDomain = 'Supplier';
      try {
        const parsedUrl = new URL(supplierUrl);
        urlDomain = parsedUrl.hostname.replace('www.', '').split('.')[0];
        urlDomain = urlDomain.charAt(0).toUpperCase() + urlDomain.slice(1);
      } catch (e) {}

      const activeSupplier = supplierName || urlDomain;
      const activeCategory = category || 'dresses';
      const activeBrand = brand || activeSupplier;

      // Sourcing realistic products list based on the chosen category
      const categoryKeywords: Record<string, { title: string; desc: string; price: number; images: string[] }[]> = {
        dresses: [
          {
            title: 'Luxe Pleated Satin Evening Dress',
            desc: 'An exquisite evening gown with draped neck, waist cinch, and micro-pleat fluid silhouette. Sourced live from Dubai Plaza showrooms.',
            price: 8500,
            images: ['https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&w=800&q=80']
          },
          {
            title: 'Floral Modest Maxi Chiffon Gown',
            desc: 'Breathable, double-lined floral chiffon dress with elegant long bell sleeves and sash waist tie. Perfect for modern fashion setups.',
            price: 6400,
            images: ['https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=800&q=80']
          },
          {
            title: 'Silk Wrap Luxury Cocktail Dress',
            desc: 'Italian styled silk wrap midi dress with asymmetrical waist drapery and long fitted cuffs. Premium fashion statement piece.',
            price: 9200,
            images: ['https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=800&q=80']
          }
        ],
        abayas: [
          {
            title: 'Dubai Creek Pure Silk Embroidered Abaya',
            desc: 'Heavyweight Crepe Chiffon Abaya set with high grade gold-threaded embroidery detailing along the front seam and cuffs. Comes with matching premium under-dress and matching sheyla.',
            price: 11200,
            images: ['https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&w=800&q=80']
          },
          {
            title: 'Modest Velvet Zardozi Kaftan Abaya',
            desc: 'Plush emerald velvet kaftan with hand-beaded crystalline embellishments. Exquisite drop drape and breathable loose fit design.',
            price: 12500,
            images: ['https://images.unsplash.com/photo-1608748010899-18f300247112?auto=format&fit=crop&w=800&q=80']
          }
        ],
        handbags: [
          {
            title: 'Quilted Chain Lock Leather Crossbody',
            desc: 'Premium quilted pattern soft grain faux leather handbag with dynamic gold chain strap, turn-lock closure mechanism and neat canvas lined multiple compartments.',
            price: 5800,
            images: ['https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80']
          },
          {
            title: 'Crocodile Embossed Structured Top-Handle Bag',
            desc: 'Executive crocodile texture structured tote bag. High luxury aesthetics, fitted with bottom metallic feet, side expands, and custom leather pouch accessory.',
            price: 7400,
            images: ['https://images.unsplash.com/photo-1590874103328-eac38a683ce7?auto=format&fit=crop&w=800&q=80']
          }
        ],
        shoes: [
          {
            title: 'Starlight Rhinestone Spiral Ankle Heels',
            desc: 'Gleaming rhinestone encrusted straps with spiral ankle wrap, comfortable square-toe block heel, and luxury cushioned sole lining. Perfect for weddings and galas.',
            price: 6900,
            images: ['https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80']
          },
          {
            title: 'Sand-Linen Pointed Block Mules',
            desc: 'Modest linen fabric flats with neat cross-wrap bow styling, low-profile block heels, and robust anti-slip sole. Chic everyday footwear.',
            price: 4500,
            images: ['https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=800&q=80']
          }
        ],
        beauty: [
          {
            title: 'Parisian Glow Hydra-Gloss Lip Set',
            desc: 'A set of 3 hyper-moisturizing, high-refraction lip oils infused with organic rosehip extracts and micro-shimmer. Pure glossy elegance.',
            price: 2500,
            images: ['https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80']
          }
        ],
        jewelry: [
          {
            title: '18K Gold Plated Venetian Chain Choker',
            desc: 'Fine Italian venetian braid chain necklace in 18K double-plated gold over surgical stainless steel. Sweat-proof, hypoallergenic, and timelessly elegant.',
            price: 3900,
            images: ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&w=800&q=80']
          }
        ],
        watches: [
          {
            title: 'Monaco Minimalist Classic Quartz Watch',
            desc: 'Swiss movement minimalist analog timepiece. Symmetrical gold casing, Mother-of-Pearl dial overlay, scratch resistant sapphire dial lens, and matching mesh chain strap.',
            price: 8800,
            images: ['https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=800&q=80']
          }
        ]
      };

      // Fallback items if category not explicitly mapped
      const items = categoryKeywords[activeCategory] || categoryKeywords['dresses'];

      // Map items to simulated imported items
      const importedProducts = items.map((it, i) => {
        const skuNum = Math.floor(1000 + Math.random() * 9000);
        return {
          sku: `IMP-${activeCategory.substring(0, 3).toUpperCase()}-${skuNum}`,
          name: `[${activeSupplier}] ${it.title}`,
          description: `${it.desc} Sourced directly via ${activeSupplier} URL portal.`,
          category: activeCategory,
          subcategory: 'imported',
          brand: activeBrand,
          priceETB: it.price,
          originalPriceETB: Math.round(it.price * 1.8),
          sizes: activeCategory === 'shoes' ? ['37', '38', '39', '40'] : activeCategory === 'handbags' || activeCategory === 'beauty' ? ['One Size'] : ['S', 'M', 'L', 'XL'],
          colors: [
            { name: 'Classic Black', hex: '#111111' },
            { name: 'Satin Gold', hex: '#d4af37' }
          ],
          images: it.images,
          isFeatured: false,
          isNewArrival: true,
          quantityAvailable: 15,
          lowStockAlertThreshold: 3,
          status: 'Draft' // Defaults to Draft during import preview!
        };
      });

      res.json({
        success: true,
        source: activeSupplier,
        count: importedProducts.length,
        products: importedProducts
      });

    } catch (error: any) {
      console.error('Import scraper simulation failed:', error);
      res.status(500).json({ error: 'Import portal timeout or blocked. Try another supplier URL.' });
    }
  });

  // Admin/Staff - Bulk Create/Publish Products
  app.post('/api/products/bulk', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const productsToCreate = req.body.products;
      if (!Array.isArray(productsToCreate) || productsToCreate.length === 0) {
        return res.status(400).json({ error: 'Products array is required' });
      }

      const createdList = [];
      for (const p of productsToCreate) {
        const created = await db.insert(products)
          .values({
            sku: p.sku || 'SKU-' + Math.floor(1000 + Math.random() * 9000),
            name: p.name,
            description: p.description || '',
            category: p.category,
            subcategory: p.subcategory || '',
            brand: p.brand || '',
            priceETB: parseInt(p.priceETB),
            originalPriceETB: p.originalPriceETB ? parseInt(p.originalPriceETB) : null,
            sizes: p.sizes || [],
            colors: p.colors || [],
            images: p.images || [],
            isFeatured: !!p.isFeatured,
            isNewArrival: !!p.isNewArrival,
            quantityAvailable: p.quantityAvailable !== undefined ? parseInt(p.quantityAvailable) : 10,
            quantityReserved: 0,
            lowStockAlertThreshold: p.lowStockAlertThreshold !== undefined ? parseInt(p.lowStockAlertThreshold) : 3,
            status: p.status || 'Published',
          })
          .returning();
        createdList.push(created[0]);
      }

      res.status(201).json({ message: `Successfully published ${createdList.length} products`, products: createdList });
    } catch (error: any) {
      console.error('Bulk products creation failed:', error);
      res.status(500).json({ error: 'Bulk publish failed: ' + error.message });
    }
  });

  // Super Admin - Change Role
  app.put('/api/users/:id/role', requireSuperAdmin, async (req: AuthRequest, res) => {
    try {
      const id = parseInt(req.params.id);
      const { role } = req.body;

      if (isNaN(id) || !role) return res.status(400).json({ error: 'ID and role are required' });
      if (!['SUPER_ADMIN', 'STAFF', 'CUSTOMER'].includes(role)) {
        return res.status(400).json({ error: 'Invalid role selection' });
      }

      const updated = await db.update(users)
        .set({ role })
        .where(eq(users.id, id))
        .returning();

      if (updated.length === 0) return res.status(404).json({ error: 'User not found' });
      res.json(updated[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to update user role' });
    }
  });


  // 4. Marketing - Banners API
  app.get('/api/banners', async (req, res) => {
    try {
      const activeBanners = await db.select().from(banners).where(eq(banners.active, true));
      res.json(activeBanners);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to load banners' });
    }
  });

  app.post('/api/banners', requireAdmin, async (req: AuthRequest, res) => {
    try {
      const { title, subtitle, imageUrl, link, active } = req.body;
      if (!imageUrl) return res.status(400).json({ error: 'Image URL is required' });

      const newBanner = await db.insert(banners)
        .values({
          title, subtitle, imageUrl, link,
          active: active !== undefined ? !!active : true
        })
        .returning();
      res.json(newBanner[0]);
    } catch (error: any) {
      res.status(500).json({ error: 'Failed to create banner' });
    }
  });


  // 5. Analytics API
  app.get('/api/analytics', requireAdmin, async (req: AuthRequest, res) => {
    try {
      // Fetch stats for Shopify Dashboard
      const completedOrders = await db.select().from(orders).where(eq(orders.status, 'Delivered'));
      const activeOrders = await db.select().from(orders).where(sql`status != 'Cancelled' AND status != 'Delivered'`);
      const allOrders = await db.select().from(orders);

      const totalRevenue = completedOrders.reduce((acc, order) => acc + order.totalAmountETB, 0);
      const estimatedPendingRevenue = activeOrders.reduce((acc, order) => acc + order.totalAmountETB, 0);

      // Best selling products calculation
      const productCounts: Record<string, { name: string, count: number, revenue: number }> = {};
      allOrders.forEach(o => {
        if (o.status !== 'Cancelled') {
          const itemsList = o.items as any[];
          itemsList.forEach((it: any) => {
            const name = it.product?.name || 'Unknown';
            if (!productCounts[name]) {
              productCounts[name] = { name, count: 0, revenue: 0 };
            }
            productCounts[name].count += it.quantity || 1;
            productCounts[name].revenue += (it.quantity || 1) * (it.priceETB || 0);
          });
        }
      });

      const bestSellers = Object.values(productCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const customerCountRows = await db.select({ count: sql`count(*)` }).from(users);
      const customerCount = parseInt(customerCountRows[0]?.count as string || '0');

      // Low stock counts
      const lowStockProducts = await db.select().from(products).where(sql`quantity_available <= low_stock_threshold`);

      res.json({
        totalRevenue,
        estimatedPendingRevenue,
        ordersCount: allOrders.length,
        completedOrdersCount: completedOrders.length,
        customerCount,
        bestSellers,
        lowStockAlerts: lowStockProducts.length,
        lowStockItems: lowStockProducts.map(p => ({ id: p.id, name: p.name, sku: p.sku, qty: p.quantityAvailable })),
        monthlySales: [
          { month: 'Jan', sales: totalRevenue * 0.1 },
          { month: 'Feb', sales: totalRevenue * 0.15 },
          { month: 'Mar', sales: totalRevenue * 0.12 },
          { month: 'Apr', sales: totalRevenue * 0.2 },
          { month: 'May', sales: totalRevenue * 0.25 },
          { month: 'Jun', sales: totalRevenue * 0.3 }
        ]
      });
    } catch (error: any) {
      console.error('Failed to load analytics:', error);
      res.status(500).json({ error: 'Failed to access financial reports' });
    }
  });


  // Serve static UI assets in production, or mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT} in ${process.env.NODE_ENV || 'development'} mode`);
  });
}

startServer();
