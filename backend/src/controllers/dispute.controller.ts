import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { uploadToCloudinary } from '../middleware/upload';
import admin from 'firebase-admin';

export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, reason, description } = req.body;
    const files = req.files as Express.Multer.File[];

    // Validate order in Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists || orderDoc.data()?.buyerId !== req.user!.id) {
      throw new AppError('Order not found', 404);
    }

    const orderData = orderDoc.data()!;
    if (!['SHIPPED', 'DELIVERED'].includes(orderData.status)) {
      throw new AppError('Disputes can only be opened for shipped or delivered items', 400);
    }

    // Upload evidence images
    const uploadResults = files
      ? await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'disputes')))
      : [];
    const evidenceUrls = uploadResults.map(r => r.url);

    // Create dispute in Firestore
    const disputeRef = db.collection('disputes').doc();
    const disputeData = {
      orderId,
      buyerId: req.user!.id,
      sellerId: orderData.sellerId,
      reason,
      description,
      evidence: evidenceUrls,
      status: 'OPEN',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const batch = db.batch();

    // Create dispute
    batch.set(disputeRef, disputeData);

    // Update order status to DISPUTED
    batch.update(db.collection('orders').doc(orderId), {
      status: 'DISPUTED',
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();

    // Create notification for seller
    const notifRef = db.collection('notifications').doc();
    await notifRef.set({
      userId: orderData.sellerId,
      title: 'Dispute Opened',
      message: `A dispute has been opened for order #${orderId.slice(0, 8)}`,
      type: 'DISPUTE',
      isRead: false,
      createdAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Dispute opened successfully', dispute: { id: disputeRef.id, ...disputeData } });
  } catch (error) {
    next(error);
  }
};

export const listDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    let query: admin.firestore.Query = db.collection('disputes');

    if (req.user!.role === 'CUSTOMER') {
      query = query.where('buyerId', '==', req.user!.id);
    } else if (req.user!.role === 'SELLER') {
      query = query.where('sellerId', '==', req.user!.id);
    }
    // ADMIN sees all disputes

    const snapshot = await query.get();
    const disputes = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Fetch order info
      let orderInfo: any = {};
      try {
        const orderDoc = await db.collection('orders').doc(data.orderId).get();
        if (orderDoc.exists) orderInfo = orderDoc.data();
      } catch { /* silently fail */ }

      return { id: doc.id, ...data, order: orderInfo };
    }));

    // Sort by createdAt descending
    disputes.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json(disputes);
  } catch (error) {
    next(error);
  }
};

export const getDisputeDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const disputeDoc = await db.collection('disputes').doc(id).get();
    if (!disputeDoc.exists) throw new AppError('Dispute not found', 404);

    const data = disputeDoc.data()!;

    // Fetch related data
    const [orderDoc, buyerDoc, sellerDoc] = await Promise.all([
      db.collection('orders').doc(data.orderId).get(),
      db.collection('users').doc(data.buyerId).get(),
      db.collection('users').doc(data.sellerId).get(),
    ]);

    let productInfo: any = {};
    if (orderDoc.exists) {
      const productDoc = await db.collection('products').doc(orderDoc.data()?.productId).get();
      if (productDoc.exists) productInfo = { id: productDoc.id, ...productDoc.data() };
    }

    res.json({
      id: disputeDoc.id,
      ...data,
      order: orderDoc.exists ? { id: orderDoc.id, ...orderDoc.data(), product: productInfo } : null,
      buyer: buyerDoc.exists ? { name: buyerDoc.data()?.name } : { name: 'Unknown' },
      seller: sellerDoc.exists ? { name: sellerDoc.data()?.name } : { name: 'Unknown' },
    });
  } catch (error) {
    next(error);
  }
};

export const adminResolveDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { resolution, adminNote } = req.body; // resolution: REFUND_BUYER, RELEASE_TO_SELLER

    const disputeDoc = await db.collection('disputes').doc(id).get();
    if (!disputeDoc.exists) throw new AppError('Dispute not found', 404);

    const disputeData = disputeDoc.data()!;
    const orderRef = db.collection('orders').doc(disputeData.orderId);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new AppError('Order not found', 404);

    const orderData = orderDoc.data()!;

    const batch = db.batch();

    if (resolution === 'REFUND_BUYER') {
      // Update order status to REFUNDED
      batch.update(orderRef, {
        status: 'REFUNDED',
        updatedAt: new Date().toISOString(),
      });

      // Create refund transaction record
      const refundRef = db.collection('transactions').doc();
      batch.set(refundRef, {
        userId: orderData.buyerId,
        orderId: disputeData.orderId,
        type: 'REFUND',
        amount: orderData.totalPrice,
        description: `Refund for disputed order #${disputeData.orderId.slice(0, 8)}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });

      // Notify buyer
      const buyerNotifRef = db.collection('notifications').doc();
      batch.set(buyerNotifRef, {
        userId: orderData.buyerId,
        title: 'Dispute Resolved — Refund Issued',
        message: `Your dispute for order #${disputeData.orderId.slice(0, 8)} has been resolved. A full refund has been issued.`,
        type: 'DISPUTE',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    } else if (resolution === 'RELEASE_TO_SELLER') {
      // Update order status to CONFIRMED
      batch.update(orderRef, {
        status: 'CONFIRMED',
        updatedAt: new Date().toISOString(),
      });

      // Release funds to seller
      const platformFee = orderData.totalPrice * 0.20;
      const sellerEarnings = orderData.totalPrice - platformFee;

      const sellerRef = db.collection('sellers').doc(orderData.sellerId);
      const sellerDoc = await sellerRef.get();
      const sellerData = sellerDoc.data() || {};

      batch.update(sellerRef, {
        pendingBalance: (sellerData.pendingBalance || 0) + sellerEarnings,
        totalEarnings: (sellerData.totalEarnings || 0) + sellerEarnings,
        updatedAt: new Date().toISOString(),
      });

      // Create earnings transaction
      const earningsRef = db.collection('transactions').doc();
      batch.set(earningsRef, {
        userId: orderData.sellerId,
        orderId: disputeData.orderId,
        type: 'CREDIT',
        amount: sellerEarnings,
        description: `Funds released after dispute resolution for order #${disputeData.orderId.slice(0, 8)}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });

      // Notify seller
      const sellerNotifRef = db.collection('notifications').doc();
      batch.set(sellerNotifRef, {
        userId: orderData.sellerId,
        title: 'Dispute Resolved — Funds Released',
        message: `Dispute for order #${disputeData.orderId.slice(0, 8)} resolved in your favor. Rs. ${sellerEarnings.toLocaleString()} released.`,
        type: 'DISPUTE',
        isRead: false,
        createdAt: new Date().toISOString(),
      });
    }

    // Close the dispute
    batch.update(db.collection('disputes').doc(id), {
      status: 'CLOSED',
      resolution,
      adminNote: adminNote || '',
      resolvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();

    res.json({ message: 'Dispute resolved successfully' });
  } catch (error) {
    next(error);
  }
};
