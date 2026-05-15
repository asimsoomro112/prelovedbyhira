import express, { NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { db } from '../config/firebase.config';
import { AppError } from '../middleware/errorHandler';
import { sendSellerRejectionEmail } from '../services/email.service';
import { uploadToCloudinary } from '../middleware/upload';

export const listSellers = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const getSellerDetail = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const approveSeller = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const rejectSeller = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const listPayouts = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query: any = db.collection('payouts');
    if (status) query = query.where('status', '==', status);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const payouts = await Promise.all(snapshot.docs.map(async (doc: any) => {
       const data = doc.data();
       const sellerDoc = await db.collection('users').doc(data.sellerId).get();
       const userData = sellerDoc.data();
       return { 
         id: doc.id, 
         ...data, 
         seller: {
           user: {
             name: userData?.name || 'Verified Merchant',
             email: userData?.email || 'No email'
           }
         }
       };
    }));

    res.json(payouts);
  } catch (error) {
    next(error);
  }
};

export const updatePayoutStatus = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body; // PROCESSING, COMPLETED, REJECTED

    const payoutRef = db.collection('payouts').doc(id);
    const payoutDoc = await payoutRef.get();
    if (!payoutDoc.exists) throw new AppError('Payout not found', 404);

    const payout = payoutDoc.data()!;
    let proofImageUrl = payout.proofImage || null;

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'payouts');
      proofImageUrl = url;
    }

    if (status === 'REJECTED') {
      const sellerRef = db.collection('sellers').doc(payout.sellerId);
      const sellerDoc = await sellerRef.get();
      const currentBalance = Number(sellerDoc.data()?.pendingBalance || 0);
      
      await sellerRef.update({
        pendingBalance: currentBalance + payout.amount,
        updatedAt: new Date().toISOString()
      });
    }

    await payoutRef.update({ 
      status,
      proofImage: proofImageUrl || payout.proofImage || null,
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

    // 🔄 SYNC: Update the linked transaction record status
    const transSnapshot = await db.collection('transactions').where('payoutId', '==', id).limit(1).get();
    if (!transSnapshot.empty) {
      await transSnapshot.docs[0].ref.update({ 
        status,
        updatedAt: new Date().toISOString()
      });
    }

    res.json({ message: `Payout status updated to ${status}` });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const toggleUserStatus = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
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
export const listProducts = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const productsSnapshot = await db.collection('products').get();
    const products = await Promise.all(productsSnapshot.docs.map(async (doc) => {
      const data = doc.data();
      let seller: any = null;
      
      if (data.sellerId) {
        try {
          const [sellerDoc, userDoc] = await Promise.all([
            db.collection('sellers').doc(data.sellerId).get(),
            db.collection('users').doc(data.sellerId).get()
          ]);
          seller = { 
            ...(sellerDoc.exists ? sellerDoc.data() : {}), 
            user: userDoc.exists ? userDoc.data() : { name: "Former Member" } 
          };
        } catch (err) {
          console.warn(`[Admin Vault] Missing seller link for product ${doc.id}`);
          seller = { user: { name: "Unknown Seller" } };
        }
      }

      return { 
        id: doc.id, 
        ...data, 
        seller 
      };
    }));
    res.json({ products });
  } catch (error) {
    next(error);
  }
};

export const deleteProduct = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    await db.collection('products').doc(id).delete();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    next(error);
  }
};

export const listOrders = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const { status } = req.query;
    let query: any = db.collection('orders');
    if (status) query = query.where('status', '==', status);
    
    const snapshot = await query.orderBy('createdAt', 'desc').get();
    const ordersData = snapshot.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    if (ordersData.length === 0) return res.json([]);

    // 🚀 BATCH FETCHING
    const productRefs = ordersData.map((o: any) => o.productId ? db.collection('products').doc(o.productId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const buyerRefs = ordersData.map((o: any) => o.buyerId ? db.collection('users').doc(o.buyerId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const sellerRefs = ordersData.map((o: any) => o.sellerId ? db.collection('sellers').doc(o.sellerId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    
    const allRefs = [...productRefs, ...buyerRefs, ...sellerRefs];
    const allDocs = await db.getAll(...allRefs);
    
    const productDocs = allDocs.slice(0, productRefs.length);
    const buyerDocs = allDocs.slice(productRefs.length, productRefs.length + buyerRefs.length);
    const sellerDocs = allDocs.slice(productRefs.length + buyerRefs.length);
    
    // Batch fetch seller user details
    const sellerUserRefs = sellerDocs.map((doc: any) => doc.exists ? db.collection('users').doc(doc.id) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const sellerUserDocs = sellerUserRefs.length > 0 ? await db.getAll(...sellerUserRefs) : [];
    
    // Create maps for efficient lookup
    const productMap = new Map(productDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const buyerMap = new Map(buyerDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const sellerMap = new Map(sellerDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const sellerUserMap = new Map(sellerUserDocs.map(d => [d.id, d.exists ? d.data() : null]));

    const orders = ordersData.map((o: any) => {
      const pData = productMap.get(o.productId);
      const bData = buyerMap.get(o.buyerId);
      const sData = sellerMap.get(o.sellerId);
      const suData = o.sellerId ? sellerUserMap.get(o.sellerId) : null;

      return {
        ...o,
        product: pData || { title: 'Unknown Product' },
        buyer: bData || { name: 'Unknown Member' },
        seller: { ...(sData || {}), user: suData || { name: 'Verified Merchant' } }
      };
    });

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const listDisputes = async (req: express.Request, res: express.Response, next: NextFunction) => {
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

export const getSettings = async (_req: express.Request, res: express.Response, next: NextFunction) => {
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

export const updateSettings = async (req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    const { commissionRate, maintenanceMode, sellerAutoVerify, minPayoutAmount, aiChatEnabled, emailNotifications, supportEmail } = req.body;
    
    const updateData: any = {};
    if (commissionRate !== undefined) updateData.commissionRate = commissionRate;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (sellerAutoVerify !== undefined) updateData.sellerAutoVerify = sellerAutoVerify;
    if (minPayoutAmount !== undefined) updateData.minPayoutAmount = minPayoutAmount;
    if (aiChatEnabled !== undefined) updateData.aiChatEnabled = aiChatEnabled;
    if (emailNotifications !== undefined) updateData.emailNotifications = emailNotifications;
    if (supportEmail !== undefined) updateData.supportEmail = supportEmail;

    await db.collection('settings').doc('platform').update({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Platform settings updated successfully' });
  } catch (error) {
    next(error);
  }
};

export const getDashboardStats = async (_req: express.Request, res: express.Response, next: NextFunction) => {
  try {
    // Note: In production, these should be cached or use counter aggregation
    const [userSnap, sellerSnap, productSnap, ordersSnap] = await Promise.all([
      db.collection('users').count().get(),
      db.collection('sellers').count().get(),
      db.collection('products').where('status', '==', 'ACTIVE').count().get(),
      db.collection('orders').where('status', '==', 'PAID').get()
    ]);

    const totalSales = ordersSnap.docs.reduce((acc, doc) => acc + (doc.data().totalPrice || 0), 0);

    // 🚀 PERF-01 Fix: Use batch reads for associated data
    const recentOrdersSnap = await db.collection('orders').orderBy('createdAt', 'desc').limit(5).get();
    const ordersData = recentOrdersSnap.docs.map((doc: any) => ({ id: doc.id, ...doc.data() }));

    const productRefs = ordersData.map((o: any) => o.productId ? db.collection('products').doc(o.productId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const buyerRefs = ordersData.map((o: any) => o.buyerId ? db.collection('users').doc(o.buyerId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const sellerRefs = ordersData.map((o: any) => o.sellerId ? db.collection('sellers').doc(o.sellerId) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    
    const allRefs = [...productRefs, ...buyerRefs, ...sellerRefs];
    const allDocs = allRefs.length > 0 ? await db.getAll(...allRefs) : [];
    
    const productDocs = allDocs.slice(0, productRefs.length);
    const buyerDocs = allDocs.slice(productRefs.length, productRefs.length + buyerRefs.length);
    const sellerDocs = allDocs.slice(productRefs.length + buyerRefs.length);
    
    // Batch fetch seller user details
    const sellerUserRefs = sellerDocs.map((doc: any) => doc.exists ? db.collection('users').doc(doc.id) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const sellerUserDocs = sellerUserRefs.length > 0 ? await db.getAll(...sellerUserRefs) : [];
    
    // Create maps for efficient lookup
    const productMap = new Map(productDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const buyerMap = new Map(buyerDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const sellerMap = new Map(sellerDocs.map(d => [d.id, d.exists ? d.data() : null]));
    const sellerUserMap = new Map(sellerUserDocs.map(d => [d.id, d.exists ? d.data() : null]));
    
    const recentOrders = ordersData.map((o: any) => {
       const pData = productMap.get(o.productId);
       const bData = buyerMap.get(o.buyerId);
       const sData = sellerMap.get(o.sellerId);
       
       let sellerUser = { name: 'Verified Merchant' };
       if (o.sellerId && sellerUserMap.has(o.sellerId)) {
         const uData = sellerUserMap.get(o.sellerId);
         if (uData) sellerUser = uData as any;
       }

       return { 
         ...o, 
         product: pData || { title: 'Unknown Product' },
         buyer: { name: bData?.name || 'Unknown Member' },
         seller: { user: sellerUser }
       };
    });

    const topSellersSnap = await db.collection('sellers').orderBy('totalEarnings', 'desc').limit(5).get();
    const topSellerUserRefs = topSellersSnap.docs.map((doc: any) => db.collection('users').doc(doc.id));
    const topSellerUserDocs = topSellerUserRefs.length > 0 ? await db.getAll(...topSellerUserRefs) : [];
    
    const topSellers = topSellersSnap.docs.map((doc, index) => {
       const data = doc.data();
       const userDoc = topSellerUserDocs[index];
       return { 
         id: doc.id, 
         ...data, 
         user: userDoc?.exists ? userDoc.data() : { name: 'Verified Merchant', avatar: '' } 
       };
    });

    // 📈 Generate real Revenue Chart Data (Last 7 Days)
    const chartData: { name: string; sales: number }[] = [];
    try {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const dailyData: Record<string, number> = {};
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      
      // Initialize last 7 days with 0
      for (let i = 0; i < 7; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyData[days[d.getDay()]] = 0;
      }
      
      ordersSnap.docs.forEach(doc => {
        const order = doc.data();
        const orderDate = new Date(order.createdAt);
        if (orderDate >= sevenDaysAgo) {
          const dayName = days[orderDate.getDay()];
          if (dailyData[dayName] !== undefined) {
            dailyData[dayName] += (order.totalPrice || 0);
          }
        }
      });
      
      // Convert to ordered array for Recharts
      const today = new Date().getDay();
      for (let i = 6; i >= 0; i--) {
        const dayIdx = (today - i + 7) % 7;
        const name = days[dayIdx];
        chartData.push({ name, sales: dailyData[name] || 0 });
      }
    } catch (chartError) {
      console.error("Chart aggregation error:", chartError);
    }

    res.json({
      stats: {
        users: userSnap.data().count,
        sellers: sellerSnap.data().count,
        products: productSnap.data().count,
        sales: totalSales
      },
      chartData,
      recentOrders,
      topSellers
    });
  } catch (error) {
    next(error);
  }
};
