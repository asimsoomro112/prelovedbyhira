import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';
import { db } from '../config/firebase.config';
import { uploadToCloudinary } from '../middleware/upload';
import { AIService } from '../services/ai.service';

export const getProducts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = {
      category: req.query.category as string,
      brand: req.query.brand as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      condition: req.query.condition as string,
      size: req.query.size as string,
      search: req.query.search as string,
      sortBy: req.query.sortBy as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 12,
    };

    const result = await ProductService.getProducts(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const product = await ProductService.getProductById(id);

    if (!product) throw new AppError('Product not found', 404);

    const related = await ProductService.getRelatedProducts(id, product.category);

    res.json({ product, related });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { title, brand, originalPrice, sellingPrice, condition, defects, usageDuration, size, category, description } = req.body;
    
    if (!req.user) throw new AppError('Unauthorized', 401);

    const files = req.files as Express.Multer.File[];
    const uploadPromises = (files || []).map(file => uploadToCloudinary(file.buffer, 'products'));
    const imageUrls = await Promise.all(uploadPromises);

    const productData = {
      sellerId: req.user.id,
      title,
      brand,
      originalPrice: parseFloat(originalPrice),
      sellingPrice: parseFloat(sellingPrice),
      condition,
      defects: defects || "",
      usageDuration: usageDuration || "",
      size,
      category,
      description,
      images: imageUrls,
      status: 'PENDING',
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const docRef = await db.collection('products').add(productData);

    res.status(201).json({ 
      message: 'Product created successfully in vault', 
      product: { id: docRef.id, ...productData } 
    });
  } catch (error) {
    next(error);
  }
};

export const updateProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const productDoc = await db.collection('products').doc(id).get();

    if (!productDoc.exists) throw new AppError('Product not found', 404);
    const product = productDoc.data()!;
    
    if (product.sellerId !== req.user?.id && req.user?.role !== 'ADMIN') {
       throw new AppError('Unauthorized', 403);
    }

    const updateData = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    await db.collection('products').doc(id).update(updateData);

    res.json({ message: 'Product updated successfully in vault' });
  } catch (error) {
    next(error);
  }
};

export const softDeleteProduct = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id as string;
    const productDoc = await db.collection('products').doc(id).get();

    if (!productDoc.exists) throw new AppError('Product not found', 404);
    const product = productDoc.data()!;
    
    if (product.sellerId !== req.user?.id && req.user?.role !== 'ADMIN') {
      throw new AppError('Unauthorized', 403);
    }

    await db.collection('products').doc(id).update({ 
      status: 'REJECTED',
      updatedAt: new Date().toISOString()
    });

    res.json({ message: 'Product de-listed successfully' });
  } catch (error) {
    next(error);
  }
};

export const adminApproveProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).update({ 
      status: 'ACTIVE',
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Product approved' });
  } catch (error) {
    next(error);
  }
};

export const adminRejectProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await db.collection('products').doc(id).update({ 
      status: 'REJECTED',
      updatedAt: new Date().toISOString()
    });
    res.json({ message: 'Product rejected' });
  } catch (error) {
    next(error);
  }
};

export const visualSearch = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.file) throw new AppError('Image is required for visual search', 400);

    const imageUrl = await uploadToCloudinary(req.file.buffer, 'search');
    const { suggestedTags, detectedCategory } = await AIService.performVisualSearch(imageUrl);

    // Query Firestore for products matching the detected category or tags
    const snapshot = await db.collection('products')
      .where('status', '==', 'ACTIVE')
      .where('category', '==', detectedCategory)
      .limit(10)
      .get();

    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    res.json({
      queryImage: imageUrl,
      detectedCategory,
      suggestedTags,
      products
    });
  } catch (error) {
    next(error);
  }
};
