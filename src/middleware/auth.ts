import { Request, Response, NextFunction } from 'express';
import { adminAuth, DecodedIdToken } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

export const requireAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    req.user = decodedToken;

    // Get or create database user
    const email = decodedToken.email || '';
    let dbUserList = await db.select().from(users).where(eq(users.uid, decodedToken.uid));

    if (dbUserList.length === 0) {
      // First registered user or specific email is Super Admin
      let role = 'CUSTOMER';
      if (email === 'goodtinsae@gmail.com' || email.toLowerCase().startsWith('admin')) {
        role = 'SUPER_ADMIN';
      } else {
        // If there are zero users in the database, make them Super Admin
        const allUsers = await db.select().from(users);
        if (allUsers.length === 0) {
          role = 'SUPER_ADMIN';
        }
      }

      const newUser = await db.insert(users)
        .values({
          uid: decodedToken.uid,
          email: email,
          role: role,
          name: decodedToken.name || 'Anonymous Customer',
          phone: '',
          whatsapp: '',
          address: '',
          city: '',
          wishlist: []
        })
        .returning();
      req.dbUser = newUser[0];
    } else {
      req.dbUser = dbUserList[0];
    }

    next();
  } catch (error) {
    console.error('Error verifying Firebase ID token:', error);
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
};

export const requireAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, () => {
    if (!req.dbUser || (req.dbUser.role !== 'SUPER_ADMIN' && req.dbUser.role !== 'STAFF')) {
      return res.status(403).json({ error: 'Forbidden: Admin or Staff privileges required' });
    }
    next();
  });
};

export const requireSuperAdmin = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  await requireAuth(req, res, () => {
    if (!req.dbUser || req.dbUser.role !== 'SUPER_ADMIN') {
      return res.status(403).json({ error: 'Forbidden: Super Admin privileges required' });
    }
    next();
  });
};
