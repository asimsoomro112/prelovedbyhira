import { Metadata } from 'next';
import { getProducts } from "@/lib/api-server";
import ProductListingClient from "./ProductListingClient";

export const metadata: Metadata = {
  title: "Browse Collection | ReVault Luxury Marketplace",
  description: "Explore our curated collection of authentic luxury preloved fashion. From Bridal to Formal, find your next treasure in the ReVault vault.",
};

export default async function ProductListingPage() {
  // Initial fetch on the server for the first page
  const res = await getProducts({ limit: 12, sortBy: 'newest' });
  
  const initialProducts = res?.products || [];
  const initialPagination = res?.pagination || { page: 1, totalPages: 1, total: 0 };

  return (
    <ProductListingClient 
      initialProducts={initialProducts} 
      initialPagination={initialPagination} 
    />
  );
}
