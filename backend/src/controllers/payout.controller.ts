import { Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const getBalance = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const sellerDoc = await db.collection('sellers').doc(sellerId).get();
    
    if (!sellerDoc.exists) throw new AppError('Seller not found', 404);
    const seller = sellerDoc.data()!;

    res.json({
      totalEarnings: seller.totalEarnings || 0,
      totalPayouts: seller.totalPayouts || 0,
      pendingBalance: seller.pendingBalance || 0
    });
  } catch (error) {
    next(error);
  }
};

export const getPayoutHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    
    // In a real app, you'd fetch from a 'transactions' or 'payouts' collection
    const snapshot = await db.collection('transactions')
      .where('userId', '==', sellerId)
      .get();

    const transactions = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    transactions.sort((a: any, b: any) => (b.createdAt || 0).toString().localeCompare((a.createdAt || 0).toString()));

    res.json(transactions);
  } catch (error) {
    next(error);
  }
};

export const requestPayout = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const sellerId = req.user!.id;
    const { amount, method, details } = req.body;

    const sellerRef = db.collection('sellers').doc(sellerId);
    
    await db.runTransaction(async (transaction) => {
      const sellerDoc = await transaction.get(sellerRef);
      if (!sellerDoc.exists) throw new AppError('Seller not found', 404);
      
      const seller = sellerDoc.data()!;
      
      // Fetch platform settings for min payout check
      const settingsDoc = await db.collection('settings').doc('platform').get();
      const minPayout = settingsDoc.data()?.minPayoutAmount || 5000;

      if (amount < minPayout) {
        throw new AppError(`Minimum payout amount is Rs. ${minPayout}`, 400);
      }

      if (seller.pendingBalance < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      const payoutRef = db.collection('payouts').doc();
      transaction.set(payoutRef, {
        sellerId,
        amount,
        method,
        details,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      transaction.update(sellerRef, {
        pendingBalance: seller.pendingBalance - amount,
        updatedAt: new Date().toISOString()
      });
    });

    res.json({ message: 'Payout request submitted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getPayoutSettings = async (_req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const settingsDoc = await db.collection('settings').doc('platform').get();
    const settings = settingsDoc.data() || { minPayoutAmount: 5000 };
    res.json({ minPayoutAmount: settings.minPayoutAmount || 5000 });
  } catch (error) {
    next(error);
  }
};
