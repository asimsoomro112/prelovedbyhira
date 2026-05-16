/**
 * Server-side API Utilities
 * Used for React Server Components to fetch data directly from the backend.
 * These do NOT use the client-side axios interceptors or Zustand stores.
 */

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000/api';

export async function getTrendingProducts(limit = 3) {
  const res = await fetch(`${BACKEND_URL}/products?limit=${limit}&sortBy=popular`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}

export async function getFreshArrivals(limit = 6) {
  const res = await fetch(`${BACKEND_URL}/products?limit=${limit}&sortBy=createdAt`, {
    next: { revalidate: 600 }, // Cache for 10 minutes
  });
  if (!res.ok) return { products: [], pagination: { total: 1200 } };
  return res.json();
}

export async function getProduct(id: string) {
  const res = await fetch(`${BACKEND_URL}/products/${id}`, {
    next: { revalidate: 60 }, // Cache for 1 minute
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.product;
}

export async function getFeaturedProducts(limit = 4) {
  const res = await fetch(`${BACKEND_URL}/products?limit=${limit}`, {
    next: { revalidate: 1800 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  return data.products || [];
}
export async function getRelatedProducts(category?: string, excludeId?: string, limit = 4) {
  const url = new URL(`${BACKEND_URL}/products`);
  url.searchParams.append('limit', limit.toString());
  if (category) url.searchParams.append('category', category);
  
  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 },
  });
  if (!res.ok) return [];
  const data = await res.json();
  const products = data.products || [];
  return products.filter((p: any) => p.id !== excludeId);
}

export async function getProducts(params: { limit?: number; category?: string; sortBy?: string } = {}) {
  const url = new URL(`${BACKEND_URL}/products`);
  if (params.limit) url.searchParams.append('limit', params.limit.toString());
  if (params.category) url.searchParams.append('category', params.category);
  if (params.sortBy) url.searchParams.append('sortBy', params.sortBy);

  const res = await fetch(url.toString(), {
    next: { revalidate: 60 }, // Quick revalidation for listing
  });
  if (!res.ok) return { products: [], pagination: { total: 0 } };
  return res.json();
}
