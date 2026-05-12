import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AppError } from '../middleware/errorHandler';
import { sendSellerRejectionEmail } from '../services/email.service';

export const listSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, limit = '20' } = req.query;
    const limitNum = parseInt(limit as string);

    let query: any = db.collection('sellers');
    if (status) {
      query = query.where('verificationStatus', '==', status);
    }

    const snapshot = await query.limit(limitNum).get();
    const sellers = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      const userDoc = await db.collection('users').doc(doc.id).get();
      return {
        id: doc.id,
        ...data,
        user: userDoc.data()
      };
    }));

    res.json({ sellers });
  } catch (error) {
    next(error);
  }
};

export const getSellerDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const sellerDoc = await db.collection('sellers').doc(id).get();
    if (!sellerDoc.exists) throw new AppError('Seller not found', 404);

    const userDoc = await db.collection('users').doc(id).get();
    
    res.json({ 
      seller: { 
        id: sellerDoc.id, 
        ...sellerDoc.data(), 
        user: userDoc.data() 
      } 
    });
  } catch (error) {
    next(error);
  }
};

export const approveSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await db.collection('sellers').doc(id).update({
      verificationStatus: 'APPROVED',
      isVerified: true,
      updatedAt: new Date().toISOString(),
    });

    await db.collection('users').doc(id).update({
      role: 'SELLER'
    });

    res.json({ message: 'Seller approved successfully' });
  } catch (error) {
    next(error);
  }
};

export const rejectSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { reason } = req.body;

    if (!reason) throw new AppError('Rejection reason is required', 400);

    const sellerDoc = await db.collection('sellers').doc(id).get();
    const userDoc = await db.collection('users').doc(id).get();
    
    await db.collection('sellers').doc(id).update({
      verificationStatus: 'REJECTED',
      rejectionReason: reason,
      updatedAt: new Date().toISOString(),
    });

    if (userDoc.exists) {
      await sendSellerRejectionEmail(userDoc.data()!.email, userDoc.data()!.name, reason);
    }

    res.json({ message: 'Seller rejected and notification sent' });
  } catch (error) {
    next(error);
  }
};

export const listPayouts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query: any = db.collection('payouts');
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const payouts = await Promise.all(snapshot.docs.map(async (doc: any) => {
       const data = doc.data();
       const sellerDoc = await db.collection('users').doc(data.sellerId).get();
       return { id: doc.id, ...data, sellerName: sellerDoc.data()?.name };
    }));

    res.json(payouts);
  } catch (error) {
    next(error);
  }
};

export const updatePayoutStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // PROCESSING, COMPLETED, REJECTED

    const payoutRef = db.collection('payouts').doc(id);
    const payoutDoc = await payoutRef.get();
    if (!payoutDoc.exists) throw new AppError('Payout not found', 404);

    const payout = payoutDoc.data()!;

    if (status === 'REJECTED') {
      await db.collection('sellers').doc(payout.sellerId).update({
        pendingBalance: Number((await db.collection('sellers').doc(payout.sellerId).get()).data()?.pendingBalance || 0) + payout.amount
      });
    }

    await payoutRef.update({ 
      status,
      updatedAt: new Date().toISOString(),
      ...(status === 'COMPLETED' && { processedAt: new Date().toISOString() })
    });

    if (status === 'COMPLETED') {
      const sellerRef = db.collection('sellers').doc(payout.sellerId);
      const seller = (await sellerRef.get()).data();
      await sellerRef.update({
        totalPayouts: (seller?.totalPayouts || 0) + payout.amount
      });
    }

    res.json({ message: `Payout status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { role, search } = req.query;
    let query: any = db.collection('users');

    if (role) {
      query = query.where('role', '==', role);
    }

    const snapshot = await query.get();
    let users = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (search) {
      const s = (search as string).toLowerCase();
      users = users.filter((u: any) => 
        u.name?.toLowerCase().includes(s) || u.email?.toLowerCase().includes(s)
      );
    }

    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const toggleUserStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userRef = db.collection('users').doc(id);
    const userDoc = await userRef.get();

    if (!userDoc.exists) throw new AppError('User not found', 404);

    const currentStatus = userDoc.data()?.isActive ?? true;
    await userRef.update({ 
      isActive: !currentStatus,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: `User ${!currentStatus ? 'activated' : 'suspended'} successfully` });
  } catch (error) {
    next(error);
  }
};
export const listProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = await Promise.all(productsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      const sellerDoc = await db.collection('sellers').doc(data.sellerId).get();
      const userDoc = await db.collection('users').doc(data.sellerId).get();
      return { 
        id: doc.id, 
        ...data, 
        seller: { ...sellerDoc.data(), user: userDoc.data() } 
      };
    }));
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).delete();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query: any = db.collection('orders');
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const orders = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      const [buyerDoc, sellerDoc] = await Promise.all([
        db.collection('users').doc(data.buyerId).get(),
        db.collection('sellers').doc(data.sellerId).get()
      ]);
      const sellerUserDoc = await db.collection('users').doc(data.sellerId).get();
      
      return {
        id: doc.id,
        ...data,
        buyer: buyerDoc.data(),
        seller: { ...sellerDoc.data(), user: sellerUserDoc.data() }
      };
    }));
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const listDisputes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db.collection('disputes').orderBy('createdAt', 'desc').get();
    const disputes = await Promise.all(snapshot.docs.map(async (doc: any) => {
      const data = doc.data();
      const orderDoc = await db.collection('orders').doc(data.orderId).get();
      const orderData = orderDoc.data();
      
      const [buyerDoc, sellerDoc, productDoc] = await Promise.all([
        db.collection('users').doc(orderData?.buyerId).get(),
        db.collection('sellers').doc(orderData?.sellerId).get(),
        db.collection('products').doc(orderData?.productId).get()
      ]);
      const sellerUserDoc = await db.collection('users').doc(orderData?.sellerId).get();

      return {
        id: doc.id,
        ...data,
        order: {
          ...orderData,
          customer: buyerDoc.data(),
          seller: { ...sellerDoc.data(), user: sellerUserDoc.data() },
          product: productDoc.data()
        }
      };
    }));
    res.json(disputes);
  } catch (error) {
    next(error);
  }
};

export const getSettings = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const settingsDoc = await db.collection('settings').doc('platform').get();
    if (!settingsDoc.exists) {
      // Default settings
      const defaults = {
        commissionRate: 20,
        maintenanceMode: false,
        sellerAutoVerify: false,
        minPayoutAmount: 5000,
        aiChatEnabled: true,
        emailNotifications: true,
        supportEmail: 'care@hira.pk',
        updatedAt: new Date().toISOString()
      };
      await db.collection('settings').doc('platform').set(defaults);
      return res.json(defaults);
    }
    res.json(settingsDoc.data());
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = req.body;
    await db.collection('settings').doc('platform').update({
      ...settings,
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Platform settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // Note: In production, these should be cached or use counter aggregation
    const [userSnap, sellerSnap, productSnap, ordersSnap] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('sellers').count().get(),
      db.collection('products').where('status', '==', 'ACTIVE').count().get(),
      db.collection('orders').where('status', '==', 'PAID').get()
    ]);

    const totalSales = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);

    const recentOrdersSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    const recentOrders = await Promise.all(recentOrdersSnap.docs.map(async (doc) => {
       const data = doc.data();
       const buyerDoc = await db.collection('users').doc(data.buyerId).get();
       return { 
         id: doc.id, 
         ...data, 
         buyer: { name: buyerDoc.data()?.name || 'Unknown Member' } 
       };
    }));

    const topSellersSnap = await db.collection('sellers').orderBy('totalEarnings', 'desc').limit(5).get();
    const topSellers = await Promise.all(topSellersSnap.docs.map(async (doc) => {
       const data = doc.data();
       const userDoc = await db.collection('users').doc(doc.id).get();
       return { id: doc.id, ...data, user: userDoc.data() };
    }));

    res.json({
      stats: {
        users: userSnap.data().count,
        sellers: sellerSnap.data().count,
        products: productSnap.data().count,
        sales: totalSales
      },
      recentOrders,
      topSellers
    });
  } catch (error) {
    next(error);
  }
};
