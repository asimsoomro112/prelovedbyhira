import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createOrder = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId, shippingAddress } = req.body;
    const buyerId = req.user!.id;

    const productDoc = await db.collection('products').doc(productId).get();
    if (!productDoc.exists || productDoc.data()?.status !== 'ACTIVE') {
      throw new AppError('Product is not available for purchase', 400);
    }

    const product = productDoc.data()!;
    const totalPrice = product.sellingPrice;
    const platformFee = Number(totalPrice) * 0.20;
    const netAmount = Number(totalPrice) * 0.80;

    const orderData = {
      buyerId,
      sellerId: product.sellerId,
      productId,
      totalPrice,
      platformFee,
      netAmount,
      status: 'PENDING',
      shippingAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const orderRef = await db.collection('orders').add(orderData);

    res.status(201).json({ 
      order: { id: orderRef.id, ...orderData }, 
      paymentUrl: `https://checkout.preloved.com/pay/${orderRef.id}` 
    });
  } catch (error) {
    next(error);
  }
};

export const handlePaymentCallback = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId, success } = req.body;

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
    const orderDoc = await orderRef.get();

    if (!orderDoc.exists || orderDoc.data()?.buyerId !== req.user!.id) {
      throw new AppError('Unauthorized', 403);
    }

    await orderRef.update({ 
      status: 'CONFIRMED',
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Delivery confirmed, funds released to seller' });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const snapshot = await db.collection('orders')
      .where('buyerId', '==', req.user!.id)
      .get();

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

    const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    orders.sort((a: any, b: any) => (b.createdAt || 0).toString().localeCompare((a.createdAt || 0).toString()));
    res.json(orders);
  } catch (error) {
    next(error);
  }
};
