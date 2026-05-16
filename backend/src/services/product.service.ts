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
    lastDocId?: string; // 🛡️ M-02: Cursor for efficient pagination
  }) {
    const { 
      category, minPrice, maxPrice, condition, 
      size, sortBy, page = 1, limit = 12, lastDocId 
    } = filters;

    console.log(`[ProductService] Fetching products. Sort: ${sortBy}, Filters: ${JSON.stringify({category, condition, size})}`);

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
      
      if (level === 'simple') {
        // Simple mode: try to apply basic ordering if no complex index is required
        if (sortBy === 'price_asc') q = q.orderBy('sellingPrice', 'asc');
        else if (sortBy === 'price_desc') q = q.orderBy('sellingPrice', 'desc');
        else if (sortBy === 'popular') q = q.orderBy('views', 'desc');
        else q = q.orderBy('createdAt', 'desc');
        return q;
      }

      const hasPriceRange = (minPrice !== undefined && minPrice > 0) || (maxPrice !== undefined && maxPrice < 1000000);
      
      // Complex mode logic
      if (sortBy === 'price_asc') q = q.orderBy('sellingPrice', 'asc');
      else if (sortBy === 'price_desc') q = q.orderBy('sellingPrice', 'desc');
      else if (sortBy === 'popular') q = q.orderBy('views', 'desc');
      else q = q.orderBy('createdAt', 'desc');

      if (hasPriceRange) {
        if (minPrice && minPrice > 0) q = q.where('sellingPrice', '>=', minPrice);
        if (maxPrice && maxPrice < 1000000) q = q.where('sellingPrice', '<=', maxPrice);
      }
      return q;
    };

    let products: any[] = [];
    let total = 0;

    const mapProductsWithSellers = async (docs: admin.firestore.QueryDocumentSnapshot[]) => {
      return Promise.all(docs.map(async (doc) => {
        const data = doc.data();
        let seller: { name: string; avatar?: string } = { name: "ReVault Member" };
        
        if (data.sellerId) {
          try {
            const userDoc = await db.collection('users').doc(data.sellerId).get();
            if (userDoc.exists) {
              const userData = userDoc.data();
              seller = { 
                name: userData?.name || "ReVault Member",
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

    /**
     * 🛡️ PERFORMANCE FIX M-02: Cursor-based pagination
     * Instead of .limit(limit * page).slice(), use startAfter() to skip
     * to the correct position. This reads only `limit` docs per request
     * instead of limit*page docs.
     */
    const applyPagination = async (query: admin.firestore.Query) => {
      if (lastDocId) {
        // Cursor-based: start after the last document from previous page
        const lastDoc = await db.collection('products').doc(lastDocId).get();
        if (lastDoc.exists) {
          return query.startAfter(lastDoc).limit(limit).get();
        }
      }
      
      if (page > 1 && !lastDocId) {
        // Offset fallback for legacy page-number navigation (less efficient)
        const offsetSnapshot = await query.limit(limit * page).get();
        return {
          docs: offsetSnapshot.docs.slice((page - 1) * limit),
          size: offsetSnapshot.docs.slice((page - 1) * limit).length,
        } as any;
      }
      
      // Page 1 — just limit
      return query.limit(limit).get();
    };

    try {
      // 1. Try Full Neural Query (Filters + Price + Sort)
      const query = buildQuery('complex');
      const snapshot = await applyPagination(query);
      products = await mapProductsWithSellers(snapshot.docs);
    } catch (e1) {
      try {
        /**
         * 🛡️ SMALL COLLECTION OPTIMIZATION:
         * If complex index is missing, fetch ALL active products (up to 500)
         * and perform GLOBAL sorting + pagination in memory.
         * This ensures "Real" sorting for the user without requiring manual indices.
         */
        console.warn("[ReVault AI] Complex index missing. Using Global In-Memory Sort for accuracy.");
        
        // Fetch all active products matching simple filters
        const baseQuery = buildQuery('simple');
        const allDocsSnapshot = await baseQuery.limit(500).get();
        let allProducts = await mapProductsWithSellers(allDocsSnapshot.docs);

        // Global Sort
        if (sortBy === 'price_asc') allProducts.sort((a: any, b: any) => a.sellingPrice - b.sellingPrice);
        else if (sortBy === 'price_desc') allProducts.sort((a: any, b: any) => b.sellingPrice - a.sellingPrice);
        else if (sortBy === 'popular') allProducts.sort((a: any, b: any) => (b.views || 0) - (a.views || 0));
        else allProducts.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

        // Global Pagination
        const start = (page - 1) * limit;
        products = allProducts.slice(start, start + limit);
        total = allProducts.length;

        return {
          products,
          pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            lastDocId: products.length > 0 ? products[products.length - 1].id : null,
          },
        };
      } catch (e2) {
        // 3. Ultra-Safe: Just show active items
        console.error("[ReVault AI] Critical Query Failure, using ultra-safe mode.");
        const query = buildQuery('ultra-safe');
        const snapshot = await applyPagination(query);
        products = await mapProductsWithSellers(snapshot.docs);
      }
    }

    // 4. Final Smart Sort Fallback (In-memory sorting if Firestore ordering failed)
    if (products.length > 0) {
      if (sortBy === 'price_asc') products.sort((a, b) => a.sellingPrice - b.sellingPrice);
      else if (sortBy === 'price_desc') products.sort((a, b) => b.sellingPrice - a.sellingPrice);
      else if (sortBy === 'popular') products.sort((a, b) => (b.views || 0) - (a.views || 0));
      else if (sortBy === 'newest') products.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    try {
      // Safe Count
      let countQuery: admin.firestore.Query = db.collection('products').where('status', '==', 'ACTIVE');
      const totalSnapshot = await countQuery.count().get();
      total = totalSnapshot.data().count;
    } catch (e) {
      total = products.length;
    }

    // Include last doc ID for cursor-based pagination
    const lastProduct = products.length > 0 ? products[products.length - 1] : null;

    return {
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        lastDocId: lastProduct?.id || null, // Cursor for next page
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
