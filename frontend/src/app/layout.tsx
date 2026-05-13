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
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "PrelovedByHira | Premium Fashion Marketplace",
    template: "%s | PrelovedByHira"
  },
  description: "Experience premium preloved fashion with trusted quality. Buy and sell luxury dresses, bags, and jewelry in Pakistan.",
  keywords: ["fashion", "preloved", "pakistan", "luxury", "sustainable fashion", "hira"],
  openGraph: {
    type: "website",
    locale: "en_PK",
    url: "https://prelovedbyhira.com",
    siteName: "PrelovedByHira",
    title: "PrelovedByHira | Premium Fashion Marketplace",
    description: "Preloved Fashion, Trusted by All ❤️",
    images: [{ url: "/og-image.jpg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "PrelovedByHira",
    description: "Premium Fashion Marketplace",
    images: ["/og-image.jpg"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <body className={`${inter.variable} ${playfair.variable} ${dmSerif.variable} font-body bg-mesh text-dark-900 dark:text-cream-50 antialiased selection:bg-gold-400 selection:text-white`}>
        <Providers>
          <div className="flex flex-col min-h-screen relative overflow-x-hidden">
             {/* Background Effects */}
             <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gold-400/5 blur-[120px] rounded-full animate-glow" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-gold-400/5 blur-[120px] rounded-full animate-glow" style={{ animationDelay: '2s' }} />
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
