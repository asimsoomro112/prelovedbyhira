import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, shippingAddress, shippingCost = 0 } = req.body;
    const buyerId = req.user!.id;

    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists || productDoc.data()?.status !== 'ACTIVE') {
      throw new AppError('Product is not available for purchase', 400);
    }

    const product = productDoc.data()!;
    
    // 🛡️ SECURITY: Prevent self-purchase
    if (product.sellerId === buyerId) {
      throw new AppError('You cannot purchase your own product', 400);
    }

    const sellingPrice = Number(product.sellingPrice);
    const platformFee = sellingPrice * 0.20; // 20% Admin Commission
    const netAmount = sellingPrice * 0.80;   // 80% to Seller
    const totalPrice = sellingPrice + Number(shippingCost); // Customer pays Product + Shipping

    const orderData = {
      buyerId,
      sellerId: product.sellerId,
      productId,
      totalPrice,
      platformFee,
      netAmount,
      shippingCost: Number(shippingCost),
      status: 'AWAITING_PAYMENT', // New Initial Status
      shippingAddress,
      paymentProofUrl: null,
      aiVerified: false,
      adminConfirmed: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    res.status(201).json({ 
      order: { id: orderRef.id, ...orderData },
      message: 'Order created. Please upload payment receipt to finalize.'
    });
  } catch (error) {
    next(error);
  }
};

export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, success, secret } = req.body;

    // 🔒 SEC-07 Fix: Basic signature/secret verification
    if (secret !== process.env.PAYMENT_SECRET && process.env.NODE_ENV === 'production') {
      throw new AppError('Unauthorized payment callback', 401);
    }

    if (!success) {
      await db.collection('orders').doc(orderId).update({ status: 'CANCELLED' });
      return res.json({ message: 'Payment failed, order cancelled' });
    }

    await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new AppError('Order not found', 404);
      
      const order = orderDoc.data()!;
      const productRef = db.collection('products').doc(order.productId);

      transaction.update(orderRef, { status: 'PAID', updatedAt: new Date().toISOString() });
      transaction.update(productRef, { status: 'SOLD', updatedAt: new Date().toISOString() });

      const transRef = db.collection('transactions').doc();
      transaction.set(transRef, {
        userId: order.buyerId,
        orderId: orderId,
        type: 'DEBIT',
        amount: order.totalPrice,
        description: `Payment for order ${orderId}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'Payment successful, order confirmed' });
  } catch (error) {
    next(error);
  }
};

export const markAsShipped = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { trackingNumber } = req.body;

    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists || orderDoc.data()?.sellerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    await orderRef.update({ 
      status: 'SHIPPED', 
      trackingNumber,
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Order marked as shipped in vault' });
  } catch (error) {
    next(error);
  }
};

export const confirmDelivery = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const orderRef = db.collection('orders').doc(id);
    
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new AppError('Order not found', 404);
      
      const order = orderDoc.data()!;
      if (order.buyerId !== req.user!.id) {
        throw new AppError('Unauthorized', 403);
      }
      
      if (order.status !== 'SHIPPED') {
        throw new AppError('Order must be shipped before confirmation', 400);
      }

      const sellerRef = db.collection('sellers').doc(order.sellerId);
      const sellerDoc = await transaction.get(sellerRef);
      if (!sellerDoc.exists) throw new AppError('Seller not found', 404);

      // Update Order Status
      transaction.update(orderRef, { 
        status: 'CONFIRMED',
        updatedAt: new Date().toISOString()
      });

      // Credit Seller
      const netAmount = order.netAmount || 0;
      transaction.update(sellerRef, {
        pendingBalance: (sellerDoc.data()?.pendingBalance || 0) + netAmount,
        totalEarnings: (sellerDoc.data()?.totalEarnings || 0) + netAmount,
        updatedAt: new Date().toISOString()
      });

      // Create Transaction Record for Seller
      const transRef = db.collection('transactions').doc();
      transaction.set(transRef, {
        userId: order.sellerId,
        orderId: id,
        type: 'CREDIT',
        amount: netAmount,
        description: `Earnings from order ${id}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'Delivery confirmed, funds released to seller balance' });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db.collection('orders')
      .where('buyerId', '==', req.user!.id)
      .get();

    const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 🚀 Optimize: Batch fetch product and seller details
    const productRefs = ordersData.map((o: any) => db.collection('products').doc(o.productId));
    const sellerRefs = ordersData.map((o: any) => db.collection('sellers').doc(o.sellerId));
    
    const allRefs = [...productRefs, ...sellerRefs];
    const allDocs = allRefs.length > 0 ? await db.getAll(...allRefs) : [];
    
    const productDocs = allDocs.slice(0, ordersData.length);
    const sellerDocs = allDocs.slice(ordersData.length);
    
    // For sellers, we also need their user data (name, avatar)
    const sellerUserRefs = sellerDocs.map(doc => doc.exists ? db.collection('users').doc(doc.id) : null).filter(Boolean) as admin.firestore.DocumentReference[];
    const sellerUserDocs = sellerUserRefs.length > 0 ? await db.getAll(...sellerUserRefs) : [];
    
    let userDocIdx = 0;
    const orders = ordersData.map((o: any, idx: number) => {
      const pDoc = productDocs[idx];
      const sDoc = sellerDocs[idx];
      
      let sellerUserData = { name: 'Verified Merchant', avatar: '' };
      if (sDoc?.exists) {
        const uDoc = sellerUserDocs[userDocIdx++];
        if (uDoc?.exists) sellerUserData = uDoc.data() as any;
      }

      return {
        ...o,
        product: pDoc?.exists ? { id: pDoc.id, ...pDoc.data() } : { title: 'Luxury Item', images: [], brand: 'Premium' },
        seller: { id: o.sellerId, user: sellerUserData }
      };
    });

    orders.sort((a: any, b: any) => (b.createdAt || 0).toString().localeCompare((a.createdAt || 0).toString()));
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getSellerOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db.collection('orders')
      .where('sellerId', '==', req.user!.id)
      .get();

    const ordersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    
    // 🚀 Optimize: Batch fetch product and buyer details
    const productRefs = ordersData.map((o: any) => db.collection('products').doc(o.productId));
    const buyerRefs = ordersData.map((o: any) => db.collection('users').doc(o.buyerId));
    
    const allRefs = [...productRefs, ...buyerRefs];
    const allDocs = allRefs.length > 0 ? await db.getAll(...allRefs) : [];
    
    const productDocs = allDocs.slice(0, ordersData.length);
    const buyerDocs = allDocs.slice(ordersData.length);
    
    const orders = ordersData.map((o: any, idx: number) => {
      const pDoc = productDocs[idx];
      const bDoc = buyerDocs[idx];
      return {
        ...o,
        product: pDoc?.exists ? { id: pDoc.id, ...pDoc.data() } : { title: 'Unknown Product', images: [] },
        buyer: bDoc?.exists ? { id: bDoc.id, ...bDoc.data() } : { name: 'Unknown Buyer' }
      };
    });

    orders.sort((a: any, b: any) => (b.createdAt || 0).toString().localeCompare((a.createdAt || 0).toString()));
    res.json(orders);
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderDoc = await db.collection('orders').doc(id).get();
    
    if (!orderDoc.exists) {
      throw new AppError('Order not found in vault', 404);
    }
    
    const order = orderDoc.data()!;
    
    // Authorization Check: Only buyer, seller, or admin can see the order
    if (order.buyerId !== req.user!.id && order.sellerId !== req.user!.id && req.user!.role !== 'ADMIN') {
      throw new AppError('Unauthorized access to this order', 403);
    }
    
    // Join Product details
    const productDoc = await db.collection('products').doc(order.productId).get();
    const product = productDoc.exists ? { id: productDoc.id, ...productDoc.data() } : null;
    
    // Join Seller User details
    const sellerUserDoc = await db.collection('users').doc(order.sellerId).get();
    const sellerUser = sellerUserDoc.exists ? sellerUserDoc.data() : null;
    
    res.json({
      ...order,
      id: orderDoc.id,
      product,
      seller: { id: order.sellerId, user: sellerUser }
    });
  } catch (error) {
    next(error);
  }
};

import { AIService } from '../services/ai.service';

export const submitPaymentProof = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { proofUrl } = req.body;

    const orderRef = db.collection('orders').doc(id);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) throw new AppError('Order not found', 404);
    const order = orderDoc.data()!;

    if (order.buyerId !== req.user!.id) throw new AppError('Unauthorized', 403);

    // 🤖 ACTUAL AI VERIFICATION
    let aiResults: any = { isMatch: false, reason: "AI extraction failed" };
    let aiVerified = false;

    try {
      aiResults = await AIService.verifyPaymentReceipt(proofUrl, { totalPrice: order.totalPrice });
      aiVerified = aiResults.isMatch;
      console.log(`[Hira AI] Neural Audit Complete. Match: ${aiVerified}`);
    } catch (err) {
      console.warn("[Hira AI] Neural Audit failed to connect, proceeding to manual queue.");
    }

    await orderRef.update({
      paymentProofUrl: proofUrl,
      status: 'PAYMENT_SUBMITTED',
      aiVerified,
      aiExtraction: aiResults, // Store what AI found for admin to see
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      message: aiVerified 
        ? 'Hira AI has verified your receipt! Admin will perform a final check before releasing the order.' 
        : 'Receipt submitted. Hira AI could not automatically verify details (Amount/Recipient), so Admin will review it manually shortly.',
      aiVerified,
      aiReason: aiResults.reason
    });
  } catch (error) {
    next(error);
  }
};

export const adminConfirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const orderRef = db.collection('orders').doc(id);
    
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new AppError('Order not found', 404);
      
      const order = orderDoc.data()!;
      const productRef = db.collection('products').doc(order.productId);

      transaction.update(orderRef, { 
        status: 'PAID', 
        adminConfirmed: true,
        updatedAt: new Date().toISOString() 
      });
      
      transaction.update(productRef, { 
        status: 'SOLD', 
        updatedAt: new Date().toISOString() 
      });

      // Create Transaction
      const transRef = db.collection('transactions').doc();
      transaction.set(transRef, {
        userId: order.buyerId,
        orderId: id,
        type: 'DEBIT',
        amount: order.totalPrice,
        description: `Manual Bank Payment for order ${id}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
    });

    res.json({ message: 'Payment confirmed by Admin. Order is now officially SOLD.' });
  } catch (error) {
    next(error);
  }
};
