import { Request, Response, NextFunction } from 'express';
import { db } from '../config/firebase.config';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

export const createReview = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { orderId, rating, comment } = req.body;

    // Validate the order in Firestore
    const orderDoc = await db.collection('orders').doc(orderId).get();

    if (!orderDoc.exists || orderDoc.data()?.buyerId !== req.user!.id) {
      throw new AppError('Order not found', 404);
    }

    const orderData = orderDoc.data()!;
    if (orderData.status !== 'CONFIRMED') {
      throw new AppError('Can only review confirmed orders', 400);
    }

    // Check if already reviewed
    const existingReview = await db.collection('reviews')
      .where('orderId', '==', orderId)
      .where('buyerId', '==', req.user!.id)
      .limit(1)
      .get();

    if (!existingReview.empty) {
      throw new AppError('You have already reviewed this order', 400);
    }

    // Create review in Firestore
    const reviewRef = db.collection('reviews').doc();
    const reviewData = {
      orderId,
      productId: orderData.productId,
      buyerId: req.user!.id,
      sellerId: orderData.sellerId,
      rating: Number(rating),
      comment: comment || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await reviewRef.set(reviewData);

    // Update seller's average rating
    const allReviews = await db.collection('reviews')
      .where('sellerId', '==', orderData.sellerId)
      .get();

    const ratings = allReviews.docs.map(doc => doc.data().rating);
    const avgRating = ratings.reduce((acc, curr) => acc + curr, 0) / ratings.length;

    await db.collection('sellers').doc(orderData.sellerId).update({
      rating: Math.round(avgRating * 10) / 10,
      totalReviews: ratings.length,
      updatedAt: new Date().toISOString(),
    });

    res.status(201).json({ message: 'Review submitted successfully', review: { id: reviewRef.id, ...reviewData } });
  } catch (error) {
    next(error);
  }
};

export const getProductReviews = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const snapshot = await db.collection('reviews')
      .where('productId', '==', productId)
      .get();

    const reviews = await Promise.all(snapshot.docs.map(async (doc) => {
      const data = doc.data();
      // Fetch buyer info
      let buyerName = 'ReVault Member';
      let buyerAvatar = '';
      try {
        const buyerDoc = await db.collection('users').doc(data.buyerId).get();
        if (buyerDoc.exists) {
          buyerName = buyerDoc.data()?.name || 'ReVault Member';
          buyerAvatar = buyerDoc.data()?.avatar || '';
        }
      } catch { /* silently fail */ }

      return {
        id: doc.id,
        ...data,
        buyer: { name: buyerName, avatar: buyerAvatar },
      };
    }));

    // Sort by createdAt descending
    reviews.sort((a: any, b: any) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
