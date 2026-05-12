import { Request, Response, NextFunction } from 'express';
import { ProductCategory } from '@prisma/client';

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const categories = Object.values(ProductCategory);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};
