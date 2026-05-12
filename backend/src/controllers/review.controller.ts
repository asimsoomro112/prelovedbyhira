import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';
import { AppError } from '../middleware/errorHandler';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, rating, comment } = req.body;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { product: true }
    });

    if (!order || order.buyerId !== req.user!.id) throw new AppError('Order not found', 404);
    if (order.status !== 'CONFIRMED') throw new AppError('Can only review confirmed orders', 400);

    const review = await prisma.$transaction(async (tx) => {
      const r = await tx.review.create({
        data: {
          orderId,
          productId: order.productId,
          buyerId: req.user!.id,
          sellerId: order.sellerId,
          rating,
          comment,
        },
      });

      // Update seller's average rating
      const allReviews = await tx.review.findMany({
        where: { sellerId: order.sellerId },
        select: { rating: true }
      });

      const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;

      await tx.seller.update({
        where: { id: order.sellerId },
        data: { rating: avgRating }
      });

      return r;
    });

    res.status(201).json({ message: 'Review submitted successfully', review });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const reviews = await prisma.review.findMany({
      where: { productId: productId as string },
      include: { buyer: { select: { name: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
