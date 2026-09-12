/**
 * Server-side API Utilities
 * Used for React Server Components to fetch data directly from the backend.
 * These do NOT use the client-side axios interceptors or Zustand stores.
 */

const BACKEND_URL =
	process.env.NEXT_PUBLIC_BACKEND_URL || "https://revaultx.vercel.app/api";

export async function getTrendingProducts(limit = 3) {
	try {
		const res = await fetch(
			`${BACKEND_URL}/products?limit=${limit}&sortBy=popular`,
			{
				next: { revalidate: 3600 }, // Cache for 1 hour
			},
		);
		if (!res.ok) return [];
		const data = await res.json();
		return data.products || [];
	} catch (error) {
		console.warn("Failed to fetch trending products (backend down during build?)");
		return [];
	}
}

export async function getFreshArrivals(limit = 6) {
	try {
		const res = await fetch(
			`${BACKEND_URL}/products?limit=${limit}&sortBy=createdAt`,
			{
				next: { revalidate: 600 }, // Cache for 10 minutes
			},
		);
		if (!res.ok) return { products: [], pagination: { total: 0 } };
		const data = await res.json();
		return data;
	} catch (error) {
		console.warn("Failed to fetch fresh arrivals (backend down during build?)");
		return { products: [], pagination: { total: 0 } };
	}
}

export async function getProduct(id: string) {
	try {
		const res = await fetch(`${BACKEND_URL}/products/${id}`, {
			next: { revalidate: 60 }, // Cache for 1 minute
		});
		if (!res.ok) return null;
		const data = await res.json();
		return data.product;
	} catch (error) {
		console.warn(`Failed to fetch product ${id} (backend down during build?)`);
		return null;
	}
}

export async function getFeaturedProducts(limit = 4) {
	try {
		const res = await fetch(`${BACKEND_URL}/products?limit=${limit}`, {
			next: { revalidate: 1800 },
		});
		if (!res.ok) return [];
		const data = await res.json();
		return data.products || [];
	} catch (error) {
		console.warn("Failed to fetch featured products (backend down during build?)");
		return [];
	}
}

export async function getRelatedProducts(
	category?: string,
	excludeId?: string,
	limit = 4,
) {
	try {
		const url = new URL(`${BACKEND_URL}/products`);
		url.searchParams.append("limit", limit.toString());
		if (category) url.searchParams.append("category", category);

		const res = await fetch(url.toString(), {
			next: { revalidate: 3600 },
		});
		if (!res.ok) return [];
		const data = await res.json();
		const products = data.products || [];
		return products.filter((p: any) => p.id !== excludeId);
	} catch (error) {
		console.warn("Failed to fetch related products (backend down during build?)");
		return [];
	}
}

export async function getProducts(
	params: { limit?: number; category?: string; sortBy?: string } = {},
) {
	try {
		const url = new URL(`${BACKEND_URL}/products`);
		if (params.limit) url.searchParams.append("limit", params.limit.toString());
		if (params.category) url.searchParams.append("category", params.category);
		if (params.sortBy) url.searchParams.append("sortBy", params.sortBy);

		const res = await fetch(url.toString(), {
			next: { revalidate: 60 }, // Quick revalidation for listing
		});
		if (!res.ok) return { products: [], pagination: { total: 0 } };
		const data = await res.json();
		return data;
	} catch (error) {
		console.warn("Failed to fetch products (backend down during build?)");
		return { products: [], pagination: { total: 0 } };
	}
}
