import { db } from '../config/firebase.config';

export class EscrowService {
  /**
   * Release 80% net amount to seller's balance
   * 🛡️ SECURITY FIX H-10: Uses Firestore transaction instead of batch
   * to prevent lost-update race conditions when multiple orders confirm simultaneously.
   */
  static async releaseFunds(orderId: string) {
    return await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');

      const order = orderDoc.data()!;
      if (order.status !== 'CONFIRMED') {
        throw new Error('Order must be confirmed before releasing funds');
      }

      const platformFee = order.totalPrice * 0.20;
      const sellerEarnings = order.totalPrice - platformFee;

      // 1. Read seller's current balance inside the transaction
      const sellerRef = db.collection('sellers').doc(order.sellerId);
      const sellerDoc = await transaction.get(sellerRef);
      const sellerData = sellerDoc.data() || {};

      // 2. Update seller's balance atomically
      transaction.update(sellerRef, {
        pendingBalance: (sellerData.pendingBalance || 0) + sellerEarnings,
        totalEarnings: (sellerData.totalEarnings || 0) + sellerEarnings,
        updatedAt: new Date().toISOString(),
      });

      // 3. Create transaction record
      const txnRef = db.collection('transactions').doc();
      transaction.set(txnRef, {
        userId: order.sellerId,
        orderId,
        type: 'CREDIT',
        amount: sellerEarnings,
        description: `Payout released for order #${orderId.slice(0, 8)}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });

      return { id: orderId, ...order };
    });
  }

  /**
   * On Dispute Resolution: Refund 100% to buyer
   * Also uses transaction for atomicity.
   */
  static async refundFunds(orderId: string) {
    return await db.runTransaction(async (transaction) => {
      const orderRef = db.collection('orders').doc(orderId);
      const orderDoc = await transaction.get(orderRef);
      if (!orderDoc.exists) throw new Error('Order not found');

      const order = orderDoc.data()!;

      // Create refund transaction for buyer
      const txnRef = db.collection('transactions').doc();
      transaction.set(txnRef, {
        userId: order.buyerId,
        orderId,
        type: 'REFUND',
        amount: order.totalPrice,
        description: `Refund for order #${orderId.slice(0, 8)}`,
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
      });

      // Update order status
      transaction.update(orderRef, {
        status: 'REFUNDED',
        updatedAt: new Date().toISOString(),
      });

      return { id: orderId, ...order };
    });
  }
}
