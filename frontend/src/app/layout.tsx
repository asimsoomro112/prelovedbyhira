import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display, DM_Serif_Display } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import NavbarWrapper from "@/components/layout/NavbarWrapper";
import AIConcierge from "@/components/shared/AIConcierge";
import { Toaster } from "sonner";

const inter = Inter({ 
  subsets: ["latin"], 
  variable: "--font-inter",
  display: 'swap',
});

const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  variable: "--font-playfair",
  style: ['normal', 'italic'],
  display: 'swap',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-dm-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFDF9" },
    { media: "(prefers-color-scheme: dark)", color: "#090909" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://revault.pk';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ReVault — Pakistan's #1 Preloved Luxury Marketplace",
    template: "%s | ReVault",
  },
  description:
    "Buy & sell authenticated preloved luxury fashion in Pakistan. Designer dresses, handbags, shoes & jewelry — verified by AI, protected by escrow. Join 10,000+ members.",
  keywords: [
    "preloved fashion Pakistan",
    "luxury marketplace",
    "second hand designer clothes",
    "ReVault",
    "buy sell preloved",
    "sustainable fashion Pakistan",
    "preloved dresses",
    "luxury handbags Pakistan",
    "thrift fashion",
    "authenticated fashion",
    "escrow marketplace",
    "preloved jewelry",
    "designer shoes Pakistan",
  ],
  authors: [{ name: "ReVault", url: SITE_URL }],
  creator: "ReVault",
  publisher: "ReVault",
  formatDetection: { telephone: true, email: true },
  alternates: {
    canonical: SITE_URL,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: SITE_URL,
    siteName: "ReVault",
    title: "ReVault — Pakistan's #1 Preloved Luxury Marketplace",
    description:
      "Authenticated preloved fashion — designer dresses, bags, shoes & jewelry. AI-verified, escrow-protected. Shop with confidence.",
    images: [
      {
        url: "/og-default.png",
        width: 1200,
        height: 630,
        alt: "ReVault — Premium Preloved Fashion Marketplace",
        type: "image/png",
      },
      {
        url: "/logo-social.jpg",
        width: 800,
        height: 800,
        alt: "ReVault Logo",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "ReVault — Pakistan's #1 Preloved Luxury Marketplace",
    description:
      "Buy & sell authenticated luxury fashion. AI-verified, escrow-protected. Join the vault.",
    images: ["/og-default.png"],
    creator: "@revaborhira",
  },
  icons: {
    icon: [
      { url: "/favicon.jpg", sizes: "any" },
    ],
    apple: [
      { url: "/favicon.jpg", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
  category: "shopping",
  other: {
    "google-site-verification": process.env.NEXT_PUBLIC_GOOGLE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;0,700;1,400;1,700&family=Jost:wght@300;400;500;600;700;900&display=swap" rel="stylesheet" />
        <link rel="preconnect" href="https://res.cloudinary.com" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": `${SITE_URL}/#organization`,
                  name: "ReVault",
                  url: SITE_URL,
                  logo: {
                    "@type": "ImageObject",
                    url: `${SITE_URL}/logo-social.jpg`,
                    width: 800,
                    height: 800,
                  },
                  description:
                    "Pakistan's #1 authenticated preloved luxury fashion marketplace. AI-verified, escrow-protected.",
                  foundingDate: "2026",
                  sameAs: [
                    "https://instagram.com/revaborhira",
                  ],
                  contactPoint: {
                    "@type": "ContactPoint",
                    email: "care@revault.pk",
                    contactType: "customer support",
                    availableLanguage: ["English", "Urdu"],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${SITE_URL}/#website`,
                  url: SITE_URL,
                  name: "ReVault",
                  publisher: { "@id": `${SITE_URL}/#organization` },
                  potentialAction: {
                    "@type": "SearchAction",
                    target: {
                      "@type": "EntryPoint",
                      urlTemplate: `${SITE_URL}/products?search={search_term_string}`,
                    },
                    "query-input": "required name=search_term_string",
                  },
                },
              ],
            }),
          }}
        />
      </head>
      <body 
        className={`${inter.variable} ${playfair.variable} ${dmSerif.variable} font-body bg-mesh text-dark-900 dark:text-cream-50 antialiased selection:bg-gold-400 selection:text-white`}
        suppressHydrationWarning
      >
        <Providers>
          <div className="flex flex-col min-h-screen min-h-[100dvh] relative overflow-x-hidden">
             {/* Background Effects - Optimized for performance */}
             <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/10 md:bg-gold-400/5 blur-[80px] md:blur-[120px] rounded-full animate-glow opacity-50 md:opacity-100" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-400/10 md:bg-gold-400/5 blur-[80px] md:blur-[120px] rounded-full animate-glow opacity-50 md:opacity-100" style={{ animationDelay: '2s' }} />
             </div>

             <div className="relative z-10 flex flex-col min-h-screen">
                <NavbarWrapper>
                   <main className="flex-grow">
                     {children}
                   </main>
                </NavbarWrapper>
                <AIConcierge />
             </div>
          </div>
          <Toaster 
            richColors 
            position="top-center" 
            toastOptions={{
              className: "glass-ultra crystal-border !rounded-2xl !p-4",
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
