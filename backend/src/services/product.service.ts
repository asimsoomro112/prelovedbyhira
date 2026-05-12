import { db } from '../config/firebase.config';
import admin from 'firebase-admin';

export class ProductService {
  static async getProducts(filters: {
    category?: string;
    brand?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    size?: string;
    search?: string;
    sortBy?: string;
    page?: number;
    limit?: number;
  }) {
    const { 
      category, minPrice, maxPrice, condition, 
      size, sortBy, page = 1, limit = 12 
    } = filters;

    let query: admin.firestore.Query = db.collection('products')
      .where('status', '==', 'ACTIVE');

    if (category) query = query.where('category', '==', category);
    if (condition) query = query.where('condition', '==', condition);
    if (size) query = query.where('size', '==', size);
    
    if (minPrice) query = query.where('sellingPrice', '>=', minPrice);
    if (maxPrice) query = query.where('sellingPrice', '<=', maxPrice);

    // Sorting
    if (sortBy === 'price_asc') query = query.orderBy('sellingPrice', 'asc');
    else if (sortBy === 'price_desc') query = query.orderBy('sellingPrice', 'desc');
    else if (sortBy === 'popular') query = query.orderBy('views', 'desc');
    else query = query.orderBy('createdAt', 'desc');

    // Pagination (approximate for Firestore)
    const snapshot = await query.limit(limit * page).get();
    const products = snapshot.docs
      .slice((page - 1) * limit)
      .map(doc => ({ id: doc.id, ...doc.data() }));

    const totalSnapshot = await db.collection('products').where('status', '==', 'ACTIVE').count().get();
    const total = totalSnapshot.data().count;

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  static async getProductById(id: string) {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) return null;

    const product = { id: doc.id, ...doc.data() } as any;

    // Increment views
    db.collection('products').doc(id).update({
      views: admin.firestore.FieldValue.increment(1)
    }).catch(console.error);

    // Fetch seller info
    const sellerDoc = await db.collection('users').doc(product.sellerId).get();
    if (sellerDoc.exists) {
      product.seller = { user: sellerDoc.data() };
    }

    return product;
  }

  static async getRelatedProducts(id: string, category: string) {
    const snapshot = await db.collection('products')
      .where('category', '==', category)
      .where('status', '==', 'ACTIVE')
      .limit(5)
      .get();

    return snapshot.docs
      .filter(doc => doc.id !== id)
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .slice(0, 4);
  }

  static async getCategoryStats() {
    const snapshot = await db.collection('products')
      .where('status', '==', 'ACTIVE')
      .get();
    
    const statsMap: Record<string, number> = {};
    snapshot.docs.forEach(doc => {
      const cat = doc.data().category;
      statsMap[cat] = (statsMap[cat] || 0) + 1;
    });

    return Object.entries(statsMap).map(([category, count]) => ({
      category,
      count
    }));
  }
}
