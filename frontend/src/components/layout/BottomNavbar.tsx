"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Home, Search, Heart, User, ShoppingBag, Sparkles, ChevronDown, Gem, TrendingUp, Star, Zap, X, LayoutDashboard, Plus } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function BottomNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user } = useAuthStore();
  const { items } = useCartStore();

  // Close menu on navigation
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

  // ✅ Bottom Navigation — 4-5 tabs with icon + text labels
  const tabs = isSeller ? [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "vault", label: "Vault", icon: LayoutDashboard, href: "/seller/dashboard" },
    { id: "sell", label: "Sell", icon: Plus, href: "/seller/add-product", isFab: true },
    { id: "search", label: "Explore", icon: Sparkles, onClick: () => setIsMenuOpen(true) },
    { id: "profile", label: "Profile", icon: User, href: "/seller/profile" },
  ] : [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "browse", label: "Browse", icon: ShoppingBag, href: "/products" },
    { id: "wishlist", label: "Wishlist", icon: Heart, href: "/customer/wishlist" },
    { id: "cart", label: "Cart", icon: ShoppingBag, href: "/cart" },
    { id: "profile", label: "Account", icon: User, href: user ? "/customer/profile" : "/login" },
  ];

  const categories = [
    { label: "Shadi & Formal", href: "/products?category=SHADI-WEAR", icon: <Gem className="w-5 h-5" /> },
    { label: "Luxury Bridal", href: "/products?category=BRIDAL", icon: <Sparkles className="w-5 h-5" /> },
    { label: "Kurtas & Shirts", href: "/products?category=KURTAS", icon: <TrendingUp className="w-5 h-5" /> },
    { label: "Premium Watches", href: "/products?category=WATCHES", icon: <Star className="w-5 h-5" /> },
    { label: "Designer Shoes", href: "/products?category=SHOES", icon: <Zap className="w-5 h-5" /> },
    { label: "Bags & Jewelry", href: "/products?category=BAGS", icon: <ShoppingBag className="w-5 h-5" /> },
  ];

  return (
    <>
      <motion.nav 
        initial={{ y: 100 }}
        animate={{ y: 0 }}
        className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-none"
        role="navigation"
        aria-label="Bottom navigation"
      >
        <div className="relative glass-ultra crystal-border rounded-[32px] h-20 flex items-center justify-around px-2 shadow-gold-3d pointer-events-auto">
          
          {/* Active Indicator Backdrop */}
          <div className="absolute inset-x-2 h-14 pointer-events-none flex justify-around">
             {tabs.map((tab) => (
               <div key={tab.id} className="relative flex-1 flex items-center justify-center">
                  {((tab.href && pathname === tab.href) || (tab.id === 'search' && isMenuOpen)) && !tab.isFab && (
                    <motion.div 
                      layoutId="bottomNavActive"
                      className="absolute inset-0 bg-gold-400/10 rounded-2xl border border-gold-400/20"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
               </div>
             ))}
          </div>

          {tabs.map((tab) => {
            const isActive = tab.href ? pathname === tab.href : (tab.id === 'search' && isMenuOpen);
            const Icon = tab.icon;

            if (tab.isFab) {
              return (
                <Link 
                  key={tab.id} 
                  href={tab.href || '#'}
                  className="relative -top-8 w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex flex-col items-center justify-center shadow-gold-3d group active:scale-90 transition-transform"
                >
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <Icon className="w-8 h-8 text-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">{tab.label}</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-lg animate-pulse pointer-events-none" />
                </Link>
              );
            }

            const content = (
              <div className={`relative flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? "text-gold-400 scale-110" : "text-gray-500"}`}>
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? "fill-gold-400/20" : ""}`} />
                  {tab.id === 'cart' && items.length > 0 && (
                    <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-gold-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center shadow-gold">
                      {items.length > 9 ? '9+' : items.length}
                    </span>
                  )}
                </div>
                <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
              </div>
            );

            if (tab.onClick) {
              return (
                <button key={tab.id} onClick={tab.onClick} className="flex-1 flex items-center justify-center pointer-events-auto">
                  {content}
                </button>
              );
            }

            return (
              <Link key={tab.id} href={tab.href || '#'} className="flex-1 flex items-center justify-center pointer-events-auto">
                {content}
              </Link>
            );
          })}
        </div>
      </motion.nav>

      {/* ✅ CATEGORIES BOTTOM SHEET — slides up from bottom, max-height 90vh */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[999] lg:hidden">
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-dark-950/40 backdrop-blur-sm"
              aria-hidden="true"
            />
            
            {/* ✅ Bottom Sheet — slides up, max-height 90vh */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 bg-white dark:bg-dark-900 rounded-t-[32px] shadow-2xl max-h-[90vh] overflow-hidden flex flex-col"
              role="dialog"
              aria-modal="true"
              aria-label="Categories"
              style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
            >
              {/* Drag handle */}
              <div className="w-12 h-1.5 bg-gold-400/30 rounded-full mx-auto mt-4 mb-2" />
              
              <div className="flex justify-between items-center px-6 py-4">
                <div>
                  <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">Discover <span className="italic text-gold-400">Fashion</span></h3>
                  <p className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">Curated for 2026</p>
                </div>
                {/* ✅ Close button — 48×48 */}
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400 active:scale-90 transition-all"
                  aria-label="Close categories"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Category list */}
              <div className="flex-1 overflow-y-auto px-4 pb-6 space-y-3">
                {categories.map((cat, i) => (
                  <Link 
                    key={i} 
                    href={cat.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-4 p-4 bg-cream-50 dark:bg-dark-800 rounded-2xl active:bg-gold-400 active:text-white transition-all group min-h-[56px]"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 group-active:text-white transition-colors shrink-0">
                      {cat.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-bold text-dark-900 dark:text-cream-50 group-active:text-white">{cat.label}</h4>
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 group-active:text-white/70">Premium Verified</p>
                    </div>
                    <ChevronDown className="w-4 h-4 text-gold-400 group-active:text-white -rotate-90 shrink-0" />
                  </Link>
                ))}
              </div>

              <div className="py-3 border-t border-gold-400/10 px-6">
                 <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">Pakistan's #1 Luxury Trade</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
