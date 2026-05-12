import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../middleware/upload';

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(10).optional(),
  bio: z.string().optional(),
});

export const getProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const doc = await db.collection('users').doc(req.user.id).get();
    if (!doc.exists) throw new AppError('User not found', 404);

    res.json({ user: { id: doc.id, ...doc.data() } });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);

    const validatedData = updateProfileSchema.parse(req.body);
    const avatar = req.file ? await uploadToCloudinary(req.file.buffer, 'avatars') : undefined;

    const updateData = {
      ...validatedData,
      ...(avatar && { avatar }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(req.user.id).update(updateData);

    const updatedDoc = await db.collection('users').doc(req.user.id).get();
    res.json({ 
      message: 'Profile updated in vault successfully', 
      user: { id: updatedDoc.id, ...updatedDoc.data() } 
    });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;

    const [activeOrdersSnap, wishlistSnap, ordersSnap] = await Promise.all([
      db.collection('orders').where('customerId', '==', userId).where('status', 'in', ['PAID', 'SHIPPED', 'PROCESSING']).get(),
      db.collection('wishlist').doc(userId).get(),
      db.collection('orders').where('customerId', '==', userId).get()
    ]);

    const activeOrders = activeOrdersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const totalSpent = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);
    const wishlistCount = wishlistSnap.exists ? (wishlistSnap.data()?.productIds?.length || 0) : 0;

    res.json({
      stats: {
        activeOrdersCount: activeOrders.length,
        totalSpent,
        wishlistCount,
        memberSince: (await db.collection('users').doc(userId).get()).data()?.createdAt
      },
      activeOrders
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    
    await db.collection('users').doc(req.user.id).update({
      isActive: false,
      deletedAt: new Date().toISOString(),
    });

    res.json({ message: 'Account deactivated in vault' });
  } catch (error) {
    next(error);
  }
};
