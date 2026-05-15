import type { Metadata } from "next";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revault.pk';

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(`${API_URL}/products/${id}`, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      return {
        title: "Product Not Found",
        description: "This product may have been removed or is no longer available on ReVault.",
      };
    }

    const product = await res.json();
    const title = product.title || "Luxury Item";
    const description =
      product.description?.slice(0, 155) ||
      `${title} — Shop authenticated preloved luxury fashion at ReVault Pakistan.`;
    const price = product.sellingPrice
      ? `Rs. ${Number(product.sellingPrice).toLocaleString()}`
      : "";
    const image = product.images?.[0] || "/og-default.png";
    const category = product.category || "Fashion";
    const condition = product.condition || "Preloved";
    const brand = product.brand || "Designer";

    return {
      title: `${title} — ${brand} ${category}`,
      description: `${description}${price ? ` | ${price}` : ""} | Free shipping on ReVault.`,
      keywords: [
        title,
        brand,
        category,
        condition,
        "preloved",
        "Pakistan",
        "ReVault",
        "luxury fashion",
        `buy ${category.toLowerCase()}`,
      ],
      openGraph: {
        type: "website",
        title: `${title} | ReVault`,
        description: `${brand} ${category} — ${condition}. ${price ? `Only ${price}.` : ""} AI-verified, escrow-protected.`,
        url: `${SITE_URL}/product/${id}`,
        siteName: "ReVault",
        images: [
          {
            url: image,
            width: 1200,
            height: 1200,
            alt: title,
          },
        ],
        locale: "en_PK",
      },
      twitter: {
        card: "summary_large_image",
        title: `${title} | ReVault`,
        description: `${brand} ${category} — ${condition}. ${price ? `Only ${price}.` : ""} Shop now on ReVault.`,
        images: [image],
      },
      alternates: {
        canonical: `${SITE_URL}/product/${id}`,
      },
    };
  } catch {
    return {
      title: "ReVault — Premium Fashion",
      description:
        "Shop authenticated preloved luxury fashion at Pakistan's #1 marketplace.",
    };
  }
}

export default function ProductLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
