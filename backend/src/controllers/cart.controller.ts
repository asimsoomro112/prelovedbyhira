import { Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;

    const cartDoc = await db.collection('carts').doc(userId).get();
    if (!cartDoc.exists) {
      res.json({ items: [], total: 0, itemCount: 0 });
      return;
    }

    const cartData = cartDoc.data()!;
    const items = cartData.items || [];

    // 🚀 PERF-02 Fix: Use batch reads instead of N+1 sequential queries
    const productRefs = items.map((item: any) => db.collection('products').doc(item.productId));
    const productDocs = items.length > 0 ? await db.getAll(...productRefs) : [];
    
    const itemsWithDetails = await Promise.all(items.map(async (item: any, index: number) => {
      const productDoc = productDocs[index];
      if (!productDoc || !productDoc.exists) return null;
      
      const productData = productDoc.data()!;
      // Join seller data (Seller data could also be batched if needed, but we keep it simple for now)
      const sellerDoc = await db.collection('users').doc(productData.sellerId).get();
      
      return {
        ...item,
        product: {
          id: productDoc.id,
          ...productData,
          seller: { user: { name: sellerDoc.exists ? sellerDoc.data()?.name : "ReVault Member" } }
        }
      };
    }));

    const filteredItems = itemsWithDetails.filter(i => i !== null);
    const total = filteredItems.reduce((sum: number, item: any) => sum + (item.product.sellingPrice * item.quantity), 0);

    res.json({ 
      items: filteredItems, 
      total, 
      itemCount: filteredItems.reduce((sum: number, item: any) => sum + (item.quantity || 1), 0)
    });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.body;

    if (!productId || typeof productId !== 'string') {
      console.error("[CART ERROR] Invalid productId received:", productId);
      throw new AppError('Invalid product ID format', 400);
    }

    console.log(`[CART] User: ${userId} | Action: Add | Product: ${productId} | Quantity: ${quantity}`);

    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists) throw new AppError('Product not found in vault', 404);
    
    const productData = productDoc.data();
    if (productData?.status !== 'ACTIVE') throw new AppError('Product is not available for purchase', 400);

    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();

    let items = [];
    if (cartDoc.exists) {
      const data = cartDoc.data();
      items = Array.isArray(data?.items) ? data.items : [];
    }

    const existingIndex = items.findIndex((i: any) => i.productId === productId);
    if (existingIndex > -1) {
      items[existingIndex].quantity += quantity;
    } else {
      items.push({
        id: Math.random().toString(36).substring(7),
        productId,
        quantity,
        addedAt: new Date().toISOString()
      });
    }

    await cartRef.set({ items, updatedAt: new Date().toISOString() }, { merge: true });
    console.log(`[CART] Successfully added item to ${userId} bag`);
    res.json({ message: 'Added to your luxury bag' });
  } catch (error) {
    console.error("[CART ERROR] addToCart failed:", error);
    next(error);
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;
    const { itemId } = req.params;
    const { quantity } = req.body;

    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    if (!cartDoc.exists) throw new AppError('Cart not found', 404);

    const data = cartDoc.data();
    let items = Array.isArray(data?.items) ? data.items : [];

    if (quantity <= 0) {
      items = items.filter((i: any) => i.id !== itemId);
    } else {
      const itemIndex = items.findIndex((i: any) => i.id === itemId);
      if (itemIndex > -1) items[itemIndex].quantity = quantity;
    }

    await cartRef.set({ items, updatedAt: new Date().toISOString() }, { merge: true });
    res.json({ message: 'Bag updated successfully' });
  } catch (error) {
    console.error("[CART ERROR] updateCartItem failed:", error);
    next(error);
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    const userId = req.user.id;
    const { itemId } = req.params;

    const cartRef = db.collection('carts').doc(userId);
    const cartDoc = await cartRef.get();
    if (!cartDoc.exists) throw new AppError('Cart not found', 404);

    const data = cartDoc.data();
    const items = (Array.isArray(data?.items) ? data.items : []).filter((i: any) => i.id !== itemId);
    
    await cartRef.set({ items, updatedAt: new Date().toISOString() }, { merge: true });
    res.json({ message: 'Removed from your bag' });
  } catch (error) {
    console.error("[CART ERROR] removeFromCart failed:", error);
    next(error);
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) throw new AppError('Unauthorized', 401);
    await db.collection('carts').doc(req.user.id).delete();
    res.json({ message: 'Bag cleared successfully' });
  } catch (error) {
    next(error);
  }
};
