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

    // Normalize category filters to match DB Enums (UPPERCASE)
    let normalizedCategory: string | string[] | undefined = category;
    if (category) {
      if (Array.isArray(category)) {
        normalizedCategory = (category as string[]).map(c => c.toUpperCase());
      } else {
        normalizedCategory = (category as string).toUpperCase();
      }
    }

    const buildQuery = (level: 'complex' | 'simple' | 'ultra-safe') => {
      let q: admin.firestore.Query = db.collection('products')
        .where('status', '==', 'ACTIVE');

      if (level === 'ultra-safe') return q; // Just Active products, no order, no filters

      if (normalizedCategory) {
        if (Array.isArray(normalizedCategory)) {
          q = q.where('category', 'in', normalizedCategory);
        } else {
          q = q.where('category', '==', normalizedCategory);
        }
      }

      if (condition) q = q.where('condition', '==', condition);
      if (size) q = q.where('size', '==', size);
      
      if (level === 'simple') return q; // Filters + Active, but no Price Range/Ordering

      const hasPriceRange = (minPrice !== undefined && minPrice > 0) || (maxPrice !== undefined && maxPrice < 1000000);
      
      if (hasPriceRange) {
        if (minPrice && minPrice > 0) q = q.where('sellingPrice', '>=', minPrice);
        if (maxPrice && maxPrice < 1000000) q = q.where('sellingPrice', '<=', maxPrice);
        
        if (sortBy === 'price_desc') q = q.orderBy('sellingPrice', 'desc');
        else q = q.orderBy('sellingPrice', 'asc');
      } else {
        if (sortBy === 'price_asc') q = q.orderBy('sellingPrice', 'asc');
        else if (sortBy === 'price_desc') q = q.orderBy('sellingPrice', 'desc');
        else if (sortBy === 'popular') q = q.orderBy('views', 'desc');
        else q = q.orderBy('createdAt', 'desc');
      }
      return q;
    };

    let products: any[] = [];
    let total = 0;

    const mapProductsWithSellers = async (docs: admin.firestore.QueryDocumentSnapshot[]) => {
      return Promise.all(docs.map(async (doc) => {
        const data = doc.data();
        let seller: { name: string; avatar?: string } = { name: "Preloved Member" };
        
        if (data.sellerId) {
          try {
            const userDoc = await db.collection('users').doc(data.sellerId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              seller = { 
                name: userData?.name || "Preloved Member",
                avatar: userData?.avatar || ""
              };
            }
          } catch (err) {
            // Silently fail seller fetch
          }
        }

        return { 
          id: doc.id, 
          ...data,
          seller,
          sellingPrice: data.sellingPrice || 0,
          images: data.images || []
        };
      }));
    };

    try {
      // 1. Try Full Neural Query (Filters + Price + Sort)
      const query = buildQuery('complex');
      const snapshot = await query.limit(limit * page).get();
      const docs = snapshot.docs.slice((page - 1) * limit);
      products = await mapProductsWithSellers(docs);
    } catch (e1) {
      try {
        // 2. Fallback: Filtered Query (No Price/Sort)
        console.warn("[Hira AI] Complex index missing, falling back to simple filtered search.");
        const query = buildQuery('simple');
        const snapshot = await query.limit(limit * page).get();
        const docs = snapshot.docs.slice((page - 1) * limit);
        products = await mapProductsWithSellers(docs);
      } catch (e2) {
        // 3. Ultra-Safe: Just show active items
        console.error("[Hira AI] Critical Query Failure, using ultra-safe mode.");
        const query = buildQuery('ultra-safe');
        const snapshot = await query.limit(limit * page).get();
        const docs = snapshot.docs.slice((page - 1) * limit);
        products = await mapProductsWithSellers(docs);
      }
    }

    try {
      // Safe Count
      let countQuery: admin.firestore.Query = db.collection('products').where('status', '==', 'ACTIVE');
      const totalSnapshot = await countQuery.count().get();
      total = totalSnapshot.data().count;
    } catch (e) {
      total = products.length;
    }

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
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
