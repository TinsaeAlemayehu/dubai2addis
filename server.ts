import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/db/index.ts';
import { products, orders, users, banners } from './src/db/schema.ts';
import { eq, and, or, asc, desc, like, sql } from 'drizzle-orm';
import { requireAuth, requireAdmin, requireSuperAdmin, AuthRequest } from './src/middleware/auth.ts';
import { seedDatabase } from './src/db/seed.ts';
import firebaseConfig from './firebase-applet-config.json'; // Direct static import

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json());

  // Run initial seeding
  await seedDatabase();

  // API ROUTES

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
        isFeatured, isNewArrival, quantityAvailable, lowStockAlertThreshold
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
        isFeatured, isNewArrival, quantityAvailable, lowStockAlertThreshold
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
