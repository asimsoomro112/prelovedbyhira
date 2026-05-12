import { prisma } from '../lib/prisma';
import { TransactionType, TransactionStatus } from '@prisma/client';

export class EscrowService {
  /**
   * Release 80% net amount to seller's balance
   */
  static async releaseFunds(orderId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
        include: { seller: true },
      });

      if (!order || order.status !== 'CONFIRMED') {
        throw new Error('Order must be confirmed before releasing funds');
      }

      // 1. Update seller's pending balance
      await tx.seller.update({
        where: { id: order.sellerId },
        data: {
          pendingBalance: { increment: order.netAmount },
          totalEarnings: { increment: order.netAmount },
        },
      });

      // 2. Create Transaction record for seller
      await tx.transaction.create({
        data: {
          userId: order.seller.userId,
          orderId: order.id,
          type: TransactionType.CREDIT,
          amount: order.netAmount,
          description: `Payout released for order ${order.id}`,
          status: TransactionStatus.COMPLETED,
        },
      });

      return order;
    });
  }

  /**
   * On Dispute Resolution: Refund 100% to buyer
   */
  static async refundFunds(orderId: string) {
    return await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId },
      });

      if (!order) throw new Error('Order not found');

      // Create refund transaction for buyer
      await tx.transaction.create({
        data: {
          userId: order.buyerId,
          orderId: order.id,
          type: TransactionType.CREDIT, // Refund is credit to user
          amount: order.totalPrice,
          description: `Refund for order ${order.id}`,
          status: TransactionStatus.COMPLETED,
        },
      });

      // Update order status
      await tx.order.update({
        where: { id: order.id },
        data: { status: 'REFUNDED' },
      });

      return order;
    });
  }
}
