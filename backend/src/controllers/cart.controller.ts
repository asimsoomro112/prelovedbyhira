import { Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AuthRequest } from '../middleware/authenticate';

export const getCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    let cart = await prisma.cart.findUnique({
      where: { userId: req.user!.id },
      include: { 
        items: { 
          include: { 
            product: { 
              include: { 
                seller: { include: { user: { select: { name: true } } } } 
              } 
            } 
          } 
        } 
      },
    });

    if (!cart) {
      cart = await prisma.cart.create({ 
        data: { userId: req.user!.id }, 
        include: { 
          items: { 
            include: { 
              product: { 
                include: { 
                  seller: { include: { user: { select: { name: true } } } } 
                } 
              } 
            } 
          } 
        } 
      });
    }

    const total = cart.items.reduce((sum: number, item: any) => sum + Number(item.product.sellingPrice) * item.quantity, 0);
    res.json({ items: cart.items, total, itemCount: cart.items.length });
  } catch (error) { 
    next(error); 
  }
};

export const addToCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { productId, quantity = 1 } = req.body;
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') { 
      res.status(404).json({ error: 'Product not available' }); 
      return; 
    }

    let cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) cart = await prisma.cart.create({ data: { userId: req.user!.id } });

    const existingItem = await prisma.cartItem.findUnique({ 
      where: { cartId_productId: { cartId: cart.id, productId } } 
    });

    if (existingItem) {
      await prisma.cartItem.update({ 
        where: { id: existingItem.id }, 
        data: { quantity: existingItem.quantity + quantity } 
      });
    } else {
      await prisma.cartItem.create({ 
        data: { cartId: cart.id, productId, quantity } 
      });
    }
    res.json({ message: 'Added to cart' });
  } catch (error) { 
    next(error); 
  }
};

export const updateCartItem = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { quantity } = req.body;
    const itemId = req.params.itemId as string;
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (!cart) { 
      res.status(404).json({ error: 'Cart not found' }); 
      return; 
    }

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }
    res.json({ message: 'Cart updated' });
  } catch (error) { 
    next(error); 
  }
};

export const removeFromCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const itemId = req.params.itemId as string;
    await prisma.cartItem.delete({ where: { id: itemId } });
    res.json({ message: 'Removed from cart' });
  } catch (error) { 
    next(error); 
  }
};

export const clearCart = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  try {
    const cart = await prisma.cart.findUnique({ where: { userId: req.user!.id } });
    if (cart) await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    res.json({ message: 'Cart cleared' });
  } catch (error) { 
    next(error); 
  }
};
