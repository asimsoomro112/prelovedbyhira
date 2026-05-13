import { db } from '../config/firebase.config';

export class EscrowService {
  /**
   * Release 80% net amount to seller's balance
   */
  static async releaseFunds(orderId: string) {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) throw new Error('Order not found');

    const order = orderDoc.data()!;
    if (order.status !== 'CONFIRMED') {
      throw new Error('Order must be confirmed before releasing funds');
    }

    const platformFee = order.totalPrice * 0.20;
    const sellerEarnings = order.totalPrice - platformFee;

    const batch = db.batch();

    // 1. Update seller's balance
    const sellerRef = db.collection('sellers').doc(order.sellerId);
    const sellerDoc = await sellerRef.get();
    const sellerData = sellerDoc.data() || {};

    batch.update(sellerRef, {
      pendingBalance: (sellerData.pendingBalance || 0) + sellerEarnings,
      totalEarnings: (sellerData.totalEarnings || 0) + sellerEarnings,
      updatedAt: new Date().toISOString(),
    });

    // 2. Create transaction record
    const txnRef = db.collection('transactions').doc();
    batch.set(txnRef, {
      userId: order.sellerId,
      orderId,
      type: 'CREDIT',
      amount: sellerEarnings,
      description: `Payout released for order #${orderId.slice(0, 8)}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    });

    await batch.commit();
    return { id: orderId, ...order };
  }

  /**
   * On Dispute Resolution: Refund 100% to buyer
   */
  static async refundFunds(orderId: string) {
    const orderDoc = await db.collection('orders').doc(orderId).get();
    if (!orderDoc.exists) throw new Error('Order not found');

    const order = orderDoc.data()!;

    const batch = db.batch();

    // Create refund transaction for buyer
    const txnRef = db.collection('transactions').doc();
    batch.set(txnRef, {
      userId: order.buyerId,
      orderId,
      type: 'REFUND',
      amount: order.totalPrice,
      description: `Refund for order #${orderId.slice(0, 8)}`,
      status: 'COMPLETED',
      createdAt: new Date().toISOString(),
    });

    // Update order status
    batch.update(db.collection('orders').doc(orderId), {
      status: 'REFUNDED',
      updatedAt: new Date().toISOString(),
    });

    await batch.commit();
    return { id: orderId, ...order };
  }
}
