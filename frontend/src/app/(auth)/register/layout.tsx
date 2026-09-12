import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create Your Account",
	description:
		"Join ReVault — Pakistan's #1 preloved luxury marketplace. Create a free account to buy or sell authenticated designer fashion. AI-verified, escrow-protected.",
	openGraph: {
		title: "Join ReVault — Start Buying & Selling Today",
		description:
			"Create your free account and access Pakistan's largest collection of preloved luxury fashion.",
		url: "/register",
	},
};

export default function RegisterLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
