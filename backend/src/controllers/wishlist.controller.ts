import { Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;
    const { productId } = req.body;

    const wishlistRef = db.collection('wishlists').doc(userId);
    const doc = await wishlistRef.get();

    let productIds = [];
    if (doc.exists) {
      productIds = doc.data()?.productIds || [];
    }

    const isWishlisted = productIds.includes(productId);
    if (isWishlisted) {
      productIds = productIds.filter((id: string) => id !== productId);
    } else {
      productIds.push(productId);
    }

    await wishlistRef.set({ productIds, updatedAt: new Date().toISOString() }, { merge: true });
    
    res.json({ 
      message: isWishlisted ? 'Removed from your vault' : 'Saved to your vault', 
      isWishlisted: !isWishlisted 
    });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;

    const wishlistDoc = await db.collection('wishlists').doc(userId).get();
    if (!wishlistDoc.exists) {
      res.json([]);
      return;
    }

    const productIds = wishlistDoc.data()?.productIds || [];
    
    const products = await Promise.all(productIds.map(async (id: string) => {
      const pDoc = await db.collection('products').doc(id).get();
      if (!pDoc.exists) return null;
      
      const pData = pDoc.data()!;
      const sDoc = await db.collection('users').doc(pData.sellerId).get();
      
      return {
        id: pDoc.id,
        ...pData,
        seller: { user: { name: sDoc.exists ? sDoc.data()?.name : "ReVault Member" } }
      };
    }));

    res.json(products.filter(p => p !== null));
  } catch (error) {
    next(error);
  }
};

export const checkWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const { productId } = req.params;
    const doc = await db.collection('wishlists').doc(req.user.id).get();
    
    const productIds = doc.exists ? doc.data()?.productIds || [] : [];
    res.json({ isWishlisted: productIds.includes(productId) });
  } catch (error) {
    next(error);
  }
};
