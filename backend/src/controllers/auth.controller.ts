import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { auth, db } from '../config/firebase.config';
import { AppError } from '../middleware/errorHandler';
import { sendWelcomeEmail, sendForgotPasswordCode } from '../services/email.service';

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

    // 📧 Send Welcome Email for NEW users
    try {
      await sendWelcomeEmail(email, name);
    } catch (emailError) {
      console.warn(`[Vault Auth] Welcome email failed for ${email}:`, emailError);
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

export const forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email } = req.body;
    if (!email) throw new AppError('Email is required', 400);

    // Verify user exists in Firebase
    try {
      await auth.getUserByEmail(email);
    } catch (e) {
      // Don't reveal if user exists for security, but we need to stop
      return res.json({ message: 'If an account exists, a recovery code has been sent.' });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiry = new Date();
    expiry.setMinutes(expiry.getMinutes() + 15);

    // Save to Firestore
    await db.collection('password_resets').doc(email).set({
      code,
      expiry: expiry.toISOString(),
      createdAt: new Date().toISOString()
    });

    // Send Email
    await sendForgotPasswordCode(email, code);

    res.json({ message: 'If an account exists, a recovery code has been sent.' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) throw new AppError('All fields are required', 400);

    const resetDoc = await db.collection('password_resets').doc(email).get();
    if (!resetDoc.exists) throw new AppError('Invalid or expired code', 400);

    const { code, expiry } = resetDoc.data()!;
    
    if (code !== otp) throw new AppError('Incorrect recovery code', 400);
    if (new Date() > new Date(expiry)) throw new AppError('Recovery code has expired', 400);

    // Update Firebase Auth Password
    const userRecord = await auth.getUserByEmail(email);
    await auth.updateUser(userRecord.uid, { password: newPassword });

    // Clean up
    await db.collection('password_resets').doc(email).delete();

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    next(error);
  }
};
