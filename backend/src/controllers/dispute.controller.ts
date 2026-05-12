import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';
import { OrderStatus, DisputeStatus } from '@prisma/client';
import { EscrowService } from '../services/escrow.service';
import { NotificationService } from '../services/notification.service';
import { uploadToCloudinary } from '../middleware/upload';

export const createDispute = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, reason, description } = req.body;
    const files = req.files as Express.Multer.File[];
    
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { seller: true }
    });

    if (!order || order.buyerId !== req.user!.id) throw new AppError('Order not found', 404);
    if (!['SHIPPED', 'DELIVERED'].includes(order.status)) {
      throw new AppError('Disputes can only be opened for shipped or delivered items', 400);
    }

    const evidenceUrls = files ? await Promise.all(files.map(f => uploadToCloudinary(f.buffer, 'disputes'))) : [];

    const dispute = await prisma.$transaction(async (tx) => {
      const d = await tx.dispute.create({
        data: {
          orderId,
          buyerId: req.user!.id,
          sellerId: order.seller.userId,
          reason,
          description,
          evidence: evidenceUrls,
          status: DisputeStatus.OPEN,
        },
      });

      await tx.order.update({
        where: { id: orderId },
        data: { status: OrderStatus.DISPUTED },
      });

      return d;
    });

    // Notify Seller
    const io = req.app.get('io');
    await NotificationService.create({
      userId: order.seller.userId,
      title: 'Dispute Opened',
      message: `A dispute has been opened for order ${order.id}`,
      type: 'DISPUTE',
      io
    });

    res.status(201).json({ message: 'Dispute opened successfully', dispute });
  } catch (error) {
    next(error);
  }
};

export const listDisputes = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const where: any = {};
    if (req.user!.role === 'CUSTOMER') where.buyerId = req.user!.id;
    else if (req.user!.role === 'SELLER') where.sellerId = req.user!.id;

    const disputes = await prisma.dispute.findMany({
      where,
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(disputes);
  } catch (error) {
    next(error);
  }
};

export const getDisputeDetail = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const dispute = await prisma.dispute.findUnique({
      where: { id: req.params.id as string },
      include: { order: { include: { product: true } }, buyer: { select: { name: true } }, seller: { select: { name: true } } },
    });
    if (!dispute) throw new AppError('Dispute not found', 404);
    res.json(dispute);
  } catch (error) {
    next(error);
  }
};

export const adminResolveDispute = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const { resolution, adminNote } = req.body; // resolution: REFUND_BUYER, RELEASE_TO_SELLER

    const dispute = await prisma.dispute.findUnique({ where: { id }, include: { order: true } });
    if (!dispute) throw new AppError('Dispute not found', 404);

    if (resolution === 'REFUND_BUYER') {
      await EscrowService.refundFunds(dispute.orderId);
    } else if (resolution === 'RELEASE_TO_SELLER') {
      await prisma.order.update({ where: { id: dispute.orderId }, data: { status: OrderStatus.CONFIRMED } });
      await EscrowService.releaseFunds(dispute.orderId);
    }

    await prisma.dispute.update({
      where: { id },
      data: { status: DisputeStatus.CLOSED, adminNote },
    });

    res.json({ message: 'Dispute resolved successfully' });
  } catch (error) {
    next(error);
  }
};
