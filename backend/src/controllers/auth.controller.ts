import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth, db } from '../config/firebase.config';
import { AppError } from '../middleware/errorHandler';

const registerSchema = z.object({
  uid: z.string(), // Firebase UID from frontend
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional(),
  role: z.enum(['CUSTOMER', 'SELLER']),
});

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { uid, name, email, phone, role } = validatedData;

    // Check if user already exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
       return res.status(200).json({ message: 'User already synced', user: userDoc.data() });
    }

    const userData = {
      id: uid,
      name,
      email,
      phone: phone || null,
      role,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.collection('users').doc(uid).set(userData);

    if (role === 'SELLER') {
      await db.collection('sellers').doc(uid).set({
        userId: uid,
        isVerified: false,
        verificationStatus: 'PENDING',
        rating: 0,
        totalSales: 0,
        totalEarnings: 0,
        pendingBalance: 0,
        createdAt: new Date().toISOString(),
      });
    }

    res.status(201).json({
      message: 'User synced with vault successfully',
      user: userData,
    });
  } catch (error) {
    next(error);
  }
};

export const getProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    const userDoc = await db.collection('users').doc(req.user.id).get();
    if (!userDoc.exists) throw new AppError('User not found', 404);
    res.json(userDoc.data());
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: any, res: Response, next: NextFunction) => {
  try {
    await db.collection('users').doc(req.user.id).update({
      ...req.body,
      updatedAt: new Date().toISOString(),
    });
    res.json({ message: 'Profile updated in vault' });
  } catch (error) {
    next(error);
  }
};
