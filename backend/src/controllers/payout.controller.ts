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
      const minPayout = settingsDoc.data()?.minPayoutAmount || 0;

      if (amount < minPayout) {
        throw new AppError(`Minimum payout amount is Rs. ${minPayout}`, 400);
      }

      if (seller.pendingBalance < amount) {
        throw new AppError('Insufficient balance', 400);
      }

      // If method is JAZZCASH or EASYPAISA, we ensure details is just the phone number for consistency
      // but we trust the frontend for now.

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
    const settings = settingsDoc.data();
    res.json({ minPayoutAmount: settings?.minPayoutAmount || 0 });
  } catch (error) {
    next(error);
  }
};

export const getSavedAccounts = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const snapshot = await db.collection('payout_accounts').where('userId', '==', userId).get();
    const accounts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(accounts);
  } catch (error) {
    next(error);
  }
};

export const saveAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { type, details, title } = req.body;

    if (!type || !details || !title) {
      throw new AppError('Type, details, and title are required', 400);
    }

    const accountRef = db.collection('payout_accounts').doc();
    const accountData = {
      userId,
      type, // BANK, JAZZCASH, EASYPAISA
      details,
      title,
      createdAt: new Date().toISOString()
    };

    await accountRef.set(accountData);
    res.status(201).json({ id: accountRef.id, ...accountData });
  } catch (error) {
    next(error);
  }
};

export const deleteSavedAccount = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const id = req.params.id as string;

    const accountRef = db.collection('payout_accounts').doc(id);
    const accountDoc = await accountRef.get();

    if (!accountDoc.exists || accountDoc.data()?.userId !== userId) {
      throw new AppError('Account not found or unauthorized', 404);
    }

    await accountRef.delete();
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
};
