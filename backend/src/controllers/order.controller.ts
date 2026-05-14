import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import admin from 'firebase-admin';
import { NotificationService } from '../services/notification.service';
import { uploadToCloudinary } from '../middleware/upload';
import * as EmailService from '../services/email.service';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, shippingAddress, shippingCost = 0, quantity = 1 } = req.body;
    const buyerId = req.user!.id;
    const qty = Math.max(1, parseInt(quantity));

    const productRef = db.collection('products').doc(productId);
    
    const result = await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      
      if (!productDoc.exists) {
        throw new AppError('Product not found in vault', 404);
      }

      const product = productDoc.data()!;
      
      if (product.status !== 'ACTIVE' || (product.stock || 0) < qty) {
        throw new AppError('Requested quantity is no longer available', 400);
      }

      // 🛡️ SECURITY: Prevent self-purchase
      if (product.sellerId === buyerId) {
        throw new AppError('You cannot purchase your own product', 400);
      }

      const unitPrice = Number(product.sellingPrice);
      const sellingPriceTotal = unitPrice * qty;
      const platformFee = sellingPriceTotal * 0.20; // 20% Admin Commission
      const netAmount = sellingPriceTotal * 0.80;   // 80% to Seller
      const totalPrice = sellingPriceTotal + Number(shippingCost);

      const orderData = {
        buyerId,
        sellerId: product.sellerId,
        productId,
        quantity: qty,
        unitPrice,
        totalPrice,
        platformFee,
        netAmount,
        shippingCost: Number(shippingCost),
        status: 'AWAITING_PAYMENT',
        shippingAddress,
        paymentProofUrl: null,
        aiVerified: false,
        adminConfirmed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const orderRef = db.collection('orders').doc();
      transaction.set(orderRef, orderData);

      // 📉 RESERVE STOCK IMMEDIATELY
      const newStock = (product.stock || 0) - qty;
      transaction.update(productRef, {
        stock: newStock,
        status: newStock <= 0 ? 'SOLD' : 'ACTIVE',
        updatedAt: new Date().toISOString()
      });

      return { id: orderRef.id, ...orderData };
    });

    // 📧 Send Emails (Outside transaction for performance)
    const buyerDoc = await db.collection('users').doc(buyerId).get();
    if (buyerDoc.exists) {
      await EmailService.sendOrderConfirmation(buyerDoc.data()!.email, { id: result.id, total: result.totalPrice });
    }

    const productDoc = await productRef.get();
    const sellerDoc = await db.collection('users').doc(result.sellerId).get();
    if (sellerDoc.exists) {
      await EmailService.sendSellerNotification(sellerDoc.data()!.email, { itemName: productDoc.data()?.title || 'Item', earnings: result.netAmount, id: result.id });
    }

    res.status(201).json({ 
      order: result,
      message: 'Order created and stock reserved. Please upload payment receipt to finalize.'
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

    // 📧 Send Shipped Email
    const order = orderDoc.data()!;
    const buyerDoc = await db.collection('users').doc(order.buyerId).get();
    if (buyerDoc.exists) {
      const productDoc = await db.collection('products').doc(order.productId).get();
      await EmailService.sendOrderStatusUpdate(buyerDoc.data()!.email, id, 'SHIPPED', productDoc.data()?.title || 'Luxury Item');
    }

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

    // 📧 Send Confirmation Email
    const orderDoc = await orderRef.get();
    const order = orderDoc.data()!;
    const buyerDoc = await db.collection('users').doc(order.buyerId).get();
    if (buyerDoc.exists) {
      const productDoc = await db.collection('products').doc(order.productId).get();
      await EmailService.sendOrderStatusUpdate(buyerDoc.data()!.email, id, 'CONFIRMED', productDoc.data()?.title || 'Luxury Item');
    }

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
      
      // 🛡️ SECURITY: Exclude payment proofs from seller view
      const { paymentProofUrl, adminReceiptUrl, ...orderData } = o;

      return {
        ...orderData,
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
    const orderDoc = await db.collection('orders').doc(id as string).get();
    
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
    let proofUrl = req.body.proofUrl;

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'receipts');
      proofUrl = url;
    }

    if (!proofUrl) throw new AppError('Payment proof (image) is required', 400);

    const orderRef = db.collection('orders').doc(id as string);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) throw new AppError('Order not found', 404);
    const order = orderDoc.data()!;

    if (order.buyerId !== req.user!.id) throw new AppError('Unauthorized', 403);

    // 🤖 AI VERIFICATION SCAN
    let aiResults: any = { isMatch: false, reason: "Neural link timeout" };
    try {
      aiResults = await AIService.verifyPaymentReceipt(proofUrl, order.totalPrice);
    } catch (err) {
      console.warn("[Hira AI] Payment audit failed, queuing for manual review.");
    }

    await orderRef.update({
      paymentProofUrl: proofUrl,
      status: 'PAYMENT_SUBMITTED',
      paymentRejected: false,
      rejectionReason: null,
      aiVerified: aiResults.isMatch,
      aiExtraction: aiResults,
      updatedAt: new Date().toISOString()
    });

    res.json({ 
      message: aiResults.isMatch 
        ? 'Confirmed! Hira AI has matched your payment receipt. Admin will perform a final review shortly.' 
        : `Receipt uploaded. ${aiResults.reason || 'AI could not automatically verify the amount.'} Admin will review it manually.`,
      aiResults
    });
  } catch (error) {
    next(error);
  }
};

export const adminConfirmPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    let proofImageUrl = null;

    if (req.file) {
      const { url } = await uploadToCloudinary(req.file.buffer, 'orders');
      proofImageUrl = url;
    }

    const orderRef = db.collection('orders').doc(id as string);
    
    let sellerId = "";
    await db.runTransaction(async (transaction) => {
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new AppError('Order not found', 404);
      
      const order = orderDoc.data()!;
      sellerId = order.sellerId;
      const productRef = db.collection('products').doc(order.productId);
      const productDoc = await transaction.get(productRef);
      if (!productDoc.exists) throw new AppError('Product not found', 404);
      
      const product = productDoc.data()!;
      transaction.update(orderRef, { 
        status: 'PAID', 
        adminConfirmed: true,
        updatedAt: new Date().toISOString() 
      });

      const transRef = db.collection('transactions').doc();
      transaction.set(transRef, {
        userId: order.buyerId,
        orderId: id,
        type: 'DEBIT',
        amount: order.totalPrice,
        description: `Payment confirmed for order ${id}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });
    });

    if (sellerId) {
      await NotificationService.create({
        userId: sellerId,
        title: "Payment Confirmed! 📦",
        message: "Payment received confirmed. Now send product for shipping to the customer provided address.",
        type: "ORDER_UPDATE"
      });
    }

    // 📧 Send Payment Confirmation Email to Buyer
    const orderDoc = await orderRef.get();
    const orderData = orderDoc.data()!;
    const buyerDoc = await db.collection('users').doc(orderData.buyerId).get();
    if (buyerDoc.exists) {
      const productDoc = await db.collection('products').doc(orderData.productId).get();
      await EmailService.sendOrderStatusUpdate(buyerDoc.data()!.email, id as string, 'PAID', productDoc.data()?.title || 'Luxury Item');
    }

    res.json({ message: 'Payment confirmed. Seller notified to ship.' });
  } catch (error) {
    next(error);
  }
};

export const adminRejectPayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    if (!reason) throw new AppError('Rejection reason is required', 400);

    const orderRef = db.collection('orders').doc(id as string);
    const orderDoc = await orderRef.get();
    if (!orderDoc.exists) throw new AppError('Order not found', 404);

    const order = orderDoc.data()!;
    
    await orderRef.update({
      status: 'PENDING',
      paymentProofUrl: null,
      paymentRejected: true,
      rejectionReason: reason,
      updatedAt: new Date().toISOString()
    });

    await NotificationService.create({
      userId: order.buyerId,
      title: "Payment Rejected ❌",
      message: `Your payment for order #${(id as string).slice(-8).toUpperCase()} was rejected: ${reason}. Please upload a valid receipt.`,
      type: "ORDER_UPDATE"
    });

    // 📧 Send Rejection Email
    const buyerDoc = await db.collection('users').doc(order.buyerId).get();
    if (buyerDoc.exists) {
      await EmailService.sendPaymentRejectedEmail(buyerDoc.data()!.email, id as string, reason);
    }

    res.json({ message: 'Payment rejected. Customer notified.' });
  } catch (error) {
    next(error);
  }
};

export const submitReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Valid rating (1-5) is required', 400);
    }

    const orderRef = db.collection('orders').doc(id as string);
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists) throw new AppError('Order not found', 404);
    const order = orderDoc.data()!;

    if (order.buyerId !== req.user!.id) throw new AppError('Unauthorized', 403);
    if (order.status !== 'CONFIRMED') throw new AppError('Reviews can only be submitted for confirmed deliveries', 400);
    if (order.reviewed) throw new AppError('Review already submitted for this order', 400);

    const productRef = db.collection('products').doc(order.productId);
    const sellerRef = db.collection('sellers').doc(order.sellerId);

    await db.runTransaction(async (transaction) => {
      const productDoc = await transaction.get(productRef);
      const sellerDoc = await transaction.get(sellerRef);

      if (!productDoc.exists) throw new AppError('Product not found', 404);
      const product = productDoc.data()!;

      // Create Review Record
      const reviewRef = db.collection('reviews').doc();
      transaction.set(reviewRef, {
        orderId: id,
        productId: order.productId,
        buyerId: order.buyerId,
        sellerId: order.sellerId,
        rating: Number(rating),
        comment: comment || "",
        createdAt: new Date().toISOString()
      });

      // Update Order Status
      transaction.update(orderRef, { reviewed: true });

      // Update Product Rating
      const currentRating = product.rating || 0;
      const reviewCount = product.reviewCount || 0;
      const newReviewCount = reviewCount + 1;
      const newRating = ((currentRating * reviewCount) + Number(rating)) / newReviewCount;

      transaction.update(productRef, {
        rating: newRating,
        reviewCount: newReviewCount,
        updatedAt: new Date().toISOString()
      });

      // Update Seller Rating (Aggregation)
      if (sellerDoc.exists) {
        const sData = sellerDoc.data()!;
        const sRating = sData.rating || 0;
        const sReviewCount = sData.reviewCount || 0;
        const sNewCount = sReviewCount + 1;
        const sNewRating = ((sRating * sReviewCount) + Number(rating)) / sNewCount;

        transaction.update(sellerRef, {
          rating: sNewRating,
          reviewCount: sNewCount,
          updatedAt: new Date().toISOString()
        });
      }
    });

    res.json({ message: 'Review submitted! Your feedback helps the luxury community.' });
  } catch (error) {
    next(error);
  }
};
