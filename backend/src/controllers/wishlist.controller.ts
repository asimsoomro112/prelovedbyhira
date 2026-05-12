import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';

export const toggleWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.body;
    const userId = req.user!.id;

    const existing = await prisma.wishlist.findFirst({
      where: { userId, productId }
    });

    if (existing) {
      await prisma.wishlist.delete({ where: { id: existing.id } });
      return res.json({ message: 'Removed from wishlist', isWishlisted: false });
    }

    await prisma.wishlist.create({
      data: { userId, productId }
    });

    res.json({ message: 'Added to wishlist', isWishlisted: true });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const wishlist = await prisma.wishlist.findMany({
      where: { userId: req.user!.id },
      include: { product: { include: { seller: { include: { user: { select: { name: true } } } } } } }
    });
    res.json(wishlist);
  } catch (error) {
    next(error);
  }
};

export const checkWishlist = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const existing = await prisma.wishlist.findFirst({
      where: { userId: req.user!.id, productId: productId as string }
    });
    res.json({ isWishlisted: !!existing });
  } catch (error) {
    next(error);
  }
};
