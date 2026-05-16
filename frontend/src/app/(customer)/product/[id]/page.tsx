import { Metadata, ResolvingMetadata } from 'next';
import { getProduct, getRelatedProducts } from "@/lib/api-server";
import ProductDetailClient from "./ProductDetailClient";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);
  
  if (!product) {
    return {
      title: 'Product Not Found | ReVault',
    };
  }

  const previousImages = (await parent).openGraph?.images || [];

  return {
    title: `${product.title} | ${product.brand} | ReVault`,
    description: product.description || `Buy ${product.title} by ${product.brand} on ReVault. Authentic luxury preloved fashion.`,
    openGraph: {
      title: `${product.title} | ReVault`,
      description: product.description,
      images: [product.images?.[0] || '/og-image.png', ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description: product.description,
      images: [product.images?.[0] || '/og-image.png'],
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  // Fetch related products for the recommendation section
  const related = await getRelatedProducts(product.category, id);

  // 🚀 2026 Premium SEO: JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.title,
    "image": product.images || [],
    "description": product.description,
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Luxury Brand"
    },
    "offers": {
      "@type": "Offer",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL}/product/${id}`,
      "priceCurrency": "PKR",
      "price": product.price,
      "itemCondition": "https://schema.org/UsedCondition",
      "availability": product.status === 'ACTIVE' ? "https://schema.org/InStock" : "https://schema.org/OutOfStock"
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} related={related} />
    </>
  );
}
