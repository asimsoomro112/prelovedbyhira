import { Metadata } from 'next';
import { getTrendingProducts, getFreshArrivals } from "@/lib/api-server";
import HomeClient from "./HomeClient";

export const metadata: Metadata = {
  title: "ReVault | Pakistan's #1 Luxury Preloved Marketplace",
  description: "Buy and sell authentic luxury Pakistani fashion. AI-curated, KYC-verified, and escrow-protected. Join the sustainable fashion revolution.",
  openGraph: {
    title: "ReVault | Luxury Preloved Marketplace",
    description: "The digital flagship for preloved Pakistani luxury. Wear Art, Own Legacy.",
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "ReVault | Luxury Preloved Marketplace",
    description: "Wear Art, Own Legacy. Pakistan's most trusted luxury resale platform.",
    images: ['/og-image.png'],
  }
};

export default async function HomePage() {
  // Fetch data on the server
  const trending = await getTrendingProducts(3);
  const arrivalsData = await getFreshArrivals(6);
  
  const arrivals = arrivalsData?.products || [];
  const productCount = arrivalsData?.pagination?.total || 1200;

  return (
    <HomeClient 
      trending={trending} 
      arrivals={arrivals} 
      productCount={productCount} 
    />
  );
}
