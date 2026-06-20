import { Request, Response, NextFunction } from 'express';
import { adminAuth, DecodedIdToken } from '../lib/firebase-admin.ts';
import { db } from '../db/index.ts';
import { users } from '../db/schema.ts';
import { eq } from 'drizzle-orm';

export interface AuthRequest extends Request {
  user?: DecodedIdToken;
  dbUser?: any;
}

import crypto from 'crypto';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_local_secret_dub2addis_2026_!!';

export function verifyLocalToken(token: string): { uid: string; email: string; name: string } | null {
  if (!token.startsWith('local:')) return null;
  try {
    const parts = token.slice(6).split('.');
    if (parts.length !== 2) return null;
    const [payloadBase64, signature] = parts;
    const str = Buffer.from(payloadBase64, 'base64').toString('utf8');
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(str).digest('hex');
    if (signature !== expectedSignature) return null;
    const payload = JSON.parse(str);
    if (payload.exp < Date.now()) return null;
    return payload;
  } catch (err) {
    return null;
  }
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
    let decodedToken: any = null;

    if (token.startsWith('local:')) {
      const payload = verifyLocalToken(token);
      if (!payload) {
        return res.status(401).json({ error: 'Unauthorized: Invalid local custom token' });
      }
      decodedToken = {
        uid: payload.uid,
        email: payload.email,
        name: payload.name
      };
    } else {
      decodedToken = await adminAuth.verifyIdToken(token);
    }

    req.user = decodedToken;

    // Get or create database user
    const email = decodedToken.email || '';
    const emailLower = email.toLowerCase();
    let dbUserList = await db.select().from(users).where(eq(users.uid, decodedToken.uid));

    if (dbUserList.length === 0) {
      // First registered user or specific email is Super Admin
      let role = 'CUSTOMER';
      if (
        emailLower === 'goodtinsae@gmail.com' ||
        emailLower === 'itistinsae@gmail.com' ||
        emailLower.startsWith('admin')
      ) {
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
          name: decodedToken.name || emailLower.split('@')[0] || 'Anonymous Customer',
          phone: '',
          whatsapp: '',
          address: '',
          city: '',
          wishlist: []
        })
        .returning();
      req.dbUser = newUser[0];
    } else {
      let dbUser = dbUserList[0];
      // Auto-escalation if they are logging in with admin e-mails but don't have SUPER_ADMIN role yet
      if (
        (emailLower === 'goodtinsae@gmail.com' || emailLower === 'itistinsae@gmail.com') &&
        dbUser.role !== 'SUPER_ADMIN'
      ) {
        const updatedUser = await db.update(users)
           .set({ role: 'SUPER_ADMIN' })
          .where(eq(users.id, dbUser.id))
          .returning();
        dbUser = updatedUser[0];
      }
      req.dbUser = dbUser;
    }

    next();
  } catch (error) {
    console.error('Error verifying ID token:', error);
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
