"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { Home, Search, Plus, Heart, User, ShoppingBag, Sparkles, ChevronDown, Gem, TrendingUp, Star, Zap, X, LayoutDashboard } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { AnimatePresence } from "framer-motion";

export default function BottomNavbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const isVisible = true;

  const { user } = useAuthStore();

  const allTabs = [
    { id: "home", label: "Home", icon: Home, href: "/" },
    { id: "categories", label: "Categories", icon: Sparkles, onClick: () => setIsMenuOpen(true) },
    { id: "vault", label: "Vault", icon: LayoutDashboard, href: "/seller/dashboard" },
    { 
      id: "shop", 
      label: "Shop", 
      icon: ShoppingBag, 
      href: "/products", 
      isFab: true 
    },
    { 
      id: "sell", 
      label: "Sell", 
      icon: Plus, 
      href: "/seller/add-product", 
      isFab: true 
    },
    { id: "search", label: "Search", icon: Search, onClick: () => setIsSearchOpen(!isSearchOpen) },
    { id: "profile", label: "Profile", icon: User, href: user?.role === 'SELLER' ? "/seller/profile" : "/customer/profile" },
  ];

  const tabs = allTabs.filter(tab => {
    const isSeller = user?.role === 'SELLER' || user?.role === 'ADMIN';

    if (tab.id === 'shop') return !isSeller;
    if (tab.id === 'sell') return isSeller;
    if (tab.id === 'vault') return isSeller;
    if (tab.id === 'categories') return !isSeller;
    
    return true;
  });

  const categories = [
    { label: "Shadi & Formal", href: "/products?category=SHADI-WEAR", icon: <Gem /> },
    { label: "Luxury Bridal", href: "/products?category=BRIDAL", icon: <Sparkles /> },
    { label: "Kurtas & Shirts", href: "/products?category=KURTAS", icon: <TrendingUp /> },
    { label: "Premium Watches", href: "/products?category=WATCHES", icon: <Star /> },
    { label: "Designer Shoes", href: "/products?category=SHOES", icon: <Zap /> },
    { label: "Bags & Jewelry", href: "/products?category=BAGS", icon: <ShoppingBag /> },
  ];

  return (
    <>
      {/* 🔍 HORIZONTAL SEARCH BAR (MOBILE) */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.95 }}
            className="lg:hidden fixed bottom-32 left-6 right-6 z-[100]"
          >
             <div className="glass-ultra crystal-border rounded-2xl h-16 flex items-center px-6 gap-4 shadow-gold-3d">
                <Search className="w-5 h-5 text-gold-400" />
                <input 
                  autoFocus
                  placeholder="Search preloved luxury..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-dark-900 dark:text-cream-50 placeholder:text-gray-500"
                />
                <button onClick={() => setIsSearchOpen(false)} className="text-gray-400 hover:text-gold-400 font-bold text-[10px] uppercase tracking-widest">Close</button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        initial={{ y: 100 }}
        animate={{ y: isVisible ? 0 : 100 }}
        transition={{ duration: 0.5, ease: "circOut" }}
        className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-none"
      >
        <div className="relative glass-ultra crystal-border rounded-[32px] h-20 flex items-center justify-around px-2 shadow-gold-3d pointer-events-auto">
          {/* Active Indicator Backdrop */}
          <div className="absolute inset-x-2 h-14 pointer-events-none flex justify-around">
             {tabs.map((tab) => (
               <div key={tab.id} className="relative flex-1 flex items-center justify-center">
                  {pathname === tab.href && !tab.isFab && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gold-400/10 rounded-2xl border border-gold-400/20"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.6 }}
                    />
                  )}
               </div>
             ))}
          </div>

          {/* Tab Items */}
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            
            if (tab.isFab) {
              return (
                <Link 
                  key={tab.id} 
                  href={tab.href || '#'}
                  className="relative -top-8 w-20 h-20 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex flex-col items-center justify-center shadow-gold-3d group active:scale-90 transition-transform"
                >
                  <div className="relative z-10 flex flex-col items-center gap-1">
                    <tab.icon className="w-8 h-8 text-white" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-tighter">{tab.label}</span>
                  </div>
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-lg animate-pulse pointer-events-none" />
                </Link>
              );
            }

            const content = (
              <>
                <tab.icon className={`w-5 h-5 ${isActive ? "fill-gold-400/20" : ""}`} />
                <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
              </>
            );

            if (tab.onClick) {
              return (
                <button 
                  key={tab.id} 
                  onClick={tab.onClick}
                  className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${(isActive || (tab.id === 'search' && isSearchOpen)) ? "text-gold-400 scale-110" : "text-gray-500"}`}
                >
                  {content}
                </button>
              );
            }

            return (
              <Link 
                key={tab.id} 
                href={tab.href || '#'}
                className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? "text-gold-400 scale-110" : "text-gray-500"}`}
              >
                {content}
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* MOBILE CATEGORIES PANEL */}
      <AnimatePresence>
        {isMenuOpen && (
          <div className="fixed inset-0 z-[999] lg:hidden">
            {/* Backdrop with higher blur for focus */}
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="absolute inset-0 bg-dark-950/40 backdrop-blur-xl transition-all duration-700"
            />
            
            {/* The Sheet */}
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 32, stiffness: 280 }}
              className="absolute bottom-0 left-0 right-0 glass-ultra crystal-border rounded-t-[50px] p-8 pb-16 shadow-2xl min-h-[70vh] flex flex-col"
            >
              {/* Ergonomic Handle */}
              <div className="w-16 h-1.5 bg-gold-400/30 rounded-full mx-auto mb-10" />
              
              <div className="flex justify-between items-center mb-12 px-2">
                <div className="space-y-1">
                  <h3 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50 tracking-tight">Discover <span className="italic text-gold-400">Fashion</span></h3>
                  <p className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">Curated for 2026</p>
                </div>
                <button 
                  onClick={() => setIsMenuOpen(false)} 
                  className="w-12 h-12 rounded-2xl glass-crystal crystal-border flex items-center justify-center text-gold-400 active:scale-90 transition-all shadow-gold-3d"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* LIST-STYLE CATEGORIES FOR BETTER ALIGNMENT */}
              <div className="space-y-4 flex-1 overflow-y-auto scrollbar-none pb-10">
                {categories.map((cat, i) => (
                  <Link 
                    key={i} 
                    href={cat.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-6 p-5 glass-crystal crystal-border rounded-[32px] active:bg-gold-400 active:text-white transition-all group shadow-soft"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400 group-active:text-white transition-colors shrink-0">
                      <div className="w-6 h-6">{cat.icon}</div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-base font-bold text-dark-900 dark:text-cream-50 leading-none group-active:text-white">{cat.label}</h4>
                      <p className="text-[9px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-widest mt-2 group-active:text-white/70 italic">Premium Verified Collection</p>
                    </div>
                    <div className="w-10 h-10 rounded-full border border-gold-400/20 flex items-center justify-center group-active:border-white/20">
                      <ChevronDown className="w-4 h-4 text-gold-400 group-active:text-white -rotate-90" />
                    </div>
                  </Link>
                ))}
              </div>

              <div className="pt-6 border-t border-gold-400/10">
                 <p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.5em]">Pakistan's #1 Luxury Trade</p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
