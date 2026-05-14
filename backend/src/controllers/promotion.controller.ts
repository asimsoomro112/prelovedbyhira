import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createPromotion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { code, discountPercentage, expiresAt, maxUses } = req.body;
    
    // Check if code exists
    const existing = await db.collection('promotions').where('code', '==', code.toUpperCase()).get();
    if (!existing.empty) {
      throw new AppError('Discount code already exists', 400);
    }

    const promoRef = db.collection('promotions').doc();
    const promoData = {
      code: code.toUpperCase(),
      sellerId: req.user!.id,
      discountPercentage: Number(discountPercentage),
      expiresAt: new Date(expiresAt).toISOString(),
      maxUses: Number(maxUses || 0),
      uses: 0,
      isActive: true,
      createdAt: new Date().toISOString(),
    };

    await promoRef.set(promoData);

    res.status(201).json({ message: 'Promotion created', promotion: { id: promoRef.id, ...promoData } });
  } catch (error) {
    next(error);
  }
};

export const getSellerPromotions = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db.collection('promotions').where('sellerId', '==', req.user!.id).get();
    const promotions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // Sort manually since we might not have a composite index
    promotions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    res.json(promotions);
  } catch (error) {
    next(error);
  }
};

export const deletePromotion = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const docRef = db.collection('promotions').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists || doc.data()?.sellerId !== req.user!.id) {
      throw new AppError('Promotion not found or unauthorized', 404);
    }
    
    await docRef.delete();
    res.json({ message: 'Promotion deleted successfully' });
  } catch (error) {
    next(error);
  }
};
