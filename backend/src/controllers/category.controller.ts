import { Request, Response, NextFunction } from 'express';

// Static categories matching the platform's product categories
const PRODUCT_CATEGORIES = [
  'SHADI_WEAR',
  'BRIDAL',
  'KURTAS',
  'SHOES',
  'WATCHES',
  'BAGS',
  'JEWELRY',
  'LUXURY_HANDBAGS',
  'DESIGNER',
  'FORMAL',
  'CASUAL',
  'ACCESSORIES',
  'OTHER',
];

export const getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    res.json(PRODUCT_CATEGORIES);
  } catch (error) {
    next(error);
  }
};
