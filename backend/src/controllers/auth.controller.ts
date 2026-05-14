import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth, db } from '../config/firebase.config';
import { AppError } from '../middleware/errorHandler';

const registerSchema = z.object({
  uid: z.string(),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10).optional().nullable(),
  role: z.enum(['CUSTOMER', 'SELLER']).optional().default('CUSTOMER'),
});

export const syncUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const { uid, name, email, phone, role } = validatedData;

    // Check if user already exists in Firestore
    const userDoc = await db.collection('users').doc(uid).get();
    if (userDoc.exists) {
      // Even if user exists, ensure seller profile is correct if they are a seller
      if (role === 'SELLER') {
        const sellerRef = db.collection('sellers').doc(uid);
        const sellerDoc = await sellerRef.get();
        if (!sellerDoc.exists || (sellerDoc.data()?.verificationStatus === 'PENDING' && !sellerDoc.data()?.selfieUrl)) {
          await sellerRef.set({
            userId: uid,
            isVerified: false,
            verificationStatus: 'REQUIRED',
            rating: 5.0,
            totalSales: 0,
            totalEarnings: 0,
            pendingBalance: 0,
            createdAt: new Date().toISOString(),
          }, { merge: true });
        }
      }
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
      const sellerRef = db.collection('sellers').doc(uid);
      const sellerDoc = await sellerRef.get();
      
      if (!sellerDoc.exists || (sellerDoc.data()?.verificationStatus === 'PENDING' && !sellerDoc.data()?.selfieUrl)) {
        await sellerRef.set({
          userId: uid,
          isVerified: false,
          verificationStatus: 'REQUIRED',
          rating: 0,
          totalSales: 0,
          totalEarnings: 0,
          pendingBalance: 0,
          createdAt: new Date().toISOString(),
        }, { merge: true });
      }
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
    // Whitelist allowed fields to prevent privilege escalation
    const { name, phone, bio } = req.body;
    const updateData: any = { updatedAt: new Date().toISOString() };
    if (name !== undefined) updateData.name = name;
    if (phone !== undefined) updateData.phone = phone;
    if (bio !== undefined) updateData.bio = bio;

    await db.collection('users').doc(req.user.id).update(updateData);
    res.json({ message: 'Profile updated in vault' });
  } catch (error) {
    next(error);
  }
};
