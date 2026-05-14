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
  city: z.string().optional(),
  address: z.string().optional(),
  interests: z.array(z.string()).optional(),
  size: z.array(z.string()).optional(),
  onboardingCompleted: z.boolean().optional(),
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
    const avatarResult = req.file ? await uploadToCloudinary(req.file.buffer, 'avatars') : undefined;
    const avatar = avatarResult?.url;

    const updateData = {
      ...validatedData,
      ...(avatar && { avatar }),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(req.user.id).set(updateData, { merge: true });

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

    const [activeOrdersSnap, wishlistSnap, ordersSnap, userDoc] = await Promise.all([
      db.collection('orders').where('buyerId', '==', userId).where('status', 'in', ['PAID', 'SHIPPED', 'PROCESSING', 'PENDING']).get(),
      db.collection('wishlists').where('userId', '==', userId).get(),
      db.collection('orders').where('buyerId', '==', userId).get(),
      db.collection('users').doc(userId).get()
    ]);

    // Fetch product details for active orders
    const activeOrders = await Promise.all(activeOrdersSnap.docs.map(async (doc) => {
      const orderData = doc.data();
      const productDoc = await db.collection('products').doc(orderData.productId).get();
      return { 
        id: doc.id, 
        ...orderData,
        product: productDoc.exists ? productDoc.data() : { title: "Archived Luxury Item" }
      };
    }));

    const totalSpent = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);
    const wishlistCount = wishlistSnap.size;
    const userData = userDoc.data();

    res.json({
      stats: {
        activeOrdersCount: activeOrders.length,
        totalSpent,
        wishlistCount,
        stylePoints: Math.floor(totalSpent / 500) + (wishlistCount * 10), // Real dynamic calculation
        memberSince: userData?.createdAt || new Date().toISOString()
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
