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
      lastDocId: req.query.lastDocId as string | undefined, // 🛡️ M-02: Cursor for pagination
    };

    const result = await ProductService.getProducts(filters);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getProductsBulk = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ids } = req.query;
    if (!ids || !Array.isArray(ids)) {
      throw new AppError('Product IDs are required as an array', 400);
    }

    if (ids.length === 0) return res.json([]);
    if (ids.length > 30) throw new AppError('Cannot fetch more than 30 products at once', 400);

    const snapshot = await db.collection('products')
      .where('__name__', 'in', ids)
      .get();

    const products = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    res.json(products);
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
    const { 
      title, brand, originalPrice, sellingPrice, condition, 
      defects, usageDuration, size, category, description, 
      stock = 1, originalPacking, invoiceAvailable 
    } = req.body;
    
    if (!req.user) throw new AppError('Unauthorized', 401);

    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFiles = files['images'] || [];
    const videoFiles = files['video'] || [];

    const imageUploadResults = await Promise.all(imageFiles.map(file => uploadToCloudinary(file.buffer, 'products', false)));
    const videoUploadResults = await Promise.all(videoFiles.map(file => uploadToCloudinary(file.buffer, 'products', true)));

    const imageUrls = imageUploadResults.map(r => r.url);
    const videoUrl = videoUploadResults.length > 0 ? videoUploadResults[0].url : null;

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
      stock: parseInt(stock as string) || 1,
      originalPacking: originalPacking === 'true' || originalPacking === true,
      invoiceAvailable: invoiceAvailable === 'true' || invoiceAvailable === true,
      images: imageUrls,
      videoUrl: videoUrl,
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

    const updateData: any = {
      ...req.body,
      updatedAt: new Date().toISOString(),
    };

    // 🔒 RESTRICTION: Sellers cannot edit price after listing to prevent order conflicts
    if (req.user?.role === 'SELLER') {
      delete updateData.sellingPrice;
      delete updateData.originalPrice;
      delete updateData.sellerId; // Also prevent sellerId tampering
    }

    // 📦 Auto-activate if stock added to a SOLD item
    if (updateData.stock > 0 && product.status === 'SOLD') {
      updateData.status = 'ACTIVE';
    }

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

    // 🔒 RESTRICTION: Prevent deletion if there are active orders
    const activeOrders = await db.collection('orders')
      .where('productId', '==', id)
      .where('status', 'in', ['AWAITING_PAYMENT', 'PAYMENT_SUBMITTED', 'PAID', 'SHIPPED', 'DELIVERED'])
      .limit(1)
      .get();

    if (!activeOrders.empty) {
      throw new AppError('Cannot delete a product with active orders. Please fulfill or resolve the current transactions first.', 400);
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
    const id = req.params.id as string;
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
    const id = req.params.id as string;
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

    const uploadRes = await uploadToCloudinary(req.file.buffer, 'search');
    const imageUrl = uploadRes.url;
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
