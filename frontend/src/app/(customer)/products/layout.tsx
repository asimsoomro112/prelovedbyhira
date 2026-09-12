import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Shop Preloved Luxury Fashion",
	description:
		"Browse 1000+ authenticated preloved designer dresses, handbags, shoes & jewelry. AI-verified quality, escrow-protected payments. Shop Pakistan's finest preloved fashion.",
	keywords: [
		"preloved dresses Pakistan",
		"designer handbags sale",
		"buy preloved fashion",
		"luxury shoes Pakistan",
		"second hand jewelry",
		"ReVault shop",
	],
	openGraph: {
		title: "Shop Preloved Luxury Fashion | ReVault",
		description:
			"Browse authenticated preloved fashion — designer dresses, bags, shoes & jewelry. AI-verified, escrow-protected.",
		url: "/products",
	},
};

export default function ProductsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
