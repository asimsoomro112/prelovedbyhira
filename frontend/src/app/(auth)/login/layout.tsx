import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description:
    "Sign in to your ReVault account. Access your orders, wishlist, and seller dashboard. Pakistan's trusted preloved luxury marketplace.",
  openGraph: {
    title: "Login to ReVault",
    description: "Access your preloved fashion vault. Track orders, manage listings, and more.",
    url: "/login",
  },
  robots: { index: false, follow: true },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
