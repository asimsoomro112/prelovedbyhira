"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, User, ShoppingBag, Home, Heart, Grid, Search, Plus, Sparkles, ChevronRight, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const router = useRouter();

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
    setIsSearchOpen(false);
  }, [pathname]);

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  }, [searchQuery, router]);

  return (
    <>
      {/* ✅ Sticky Top Header — max 56px height, 48px touch targets */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-[110] px-3 py-2" role="navigation" aria-label="Mobile navigation">
        <div className="glass-ultra crystal-border rounded-2xl h-14 flex items-center justify-between px-3 shadow-gold-3d">
          
          {/* ✅ Hamburger — 48×48 touch target */}
          <button 
            onClick={() => setIsOpen(true)}
            className="w-12 h-12 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center active:scale-90 transition-transform"
            aria-label="Open navigation menu"
            aria-expanded={isOpen}
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* ✅ Logo — max 140px on mobile */}
          <Link href="/" className="flex items-center gap-2" style={{ maxWidth: 140 }}>
            <span className="text-lg font-display font-bold text-dark-900 dark:text-cream-50 truncate">
              Preloved<span className="text-gold-400 italic">ByHira</span>
            </span>
          </Link>

          {/* ✅ Action buttons with proper touch targets */}
          <div className="flex items-center gap-1">
            {/* Search icon */}
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-12 h-12 rounded-xl flex items-center justify-center text-gray-500 active:scale-90 transition-transform"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart with badge — ✅ minimum 20px badge circle */}
            <Link 
              href="/cart" 
              className="relative w-12 h-12 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center active:scale-90 transition-transform"
              aria-label={`Shopping cart with ${items.length} items`}
            >
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-950">
                  {items.length > 9 ? '9+' : items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* ✅ Full-width search bar overlay — slides over header on mobile */}
      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden fixed top-0 left-0 right-0 z-[120] px-3 py-2"
          >
            <form onSubmit={handleSearch} className="glass-ultra crystal-border rounded-2xl h-14 flex items-center px-4 gap-3 shadow-gold-3d">
              <Search className="w-5 h-5 text-gold-400 shrink-0" />
              <input 
                autoFocus
                type="search"
                inputMode="search"
                placeholder="Search preloved luxury..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-base font-bold text-dark-900 dark:text-cream-50 placeholder:text-gray-400 min-h-[44px]"
                aria-label="Search products"
              />
              <button 
                type="button"
                onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold-400 active:scale-90 transition-all"
                aria-label="Close search"
              >
                <X className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ✅ Navigation Drawer — slides from LEFT with backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop — dismisses on tap */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120]"
              aria-hidden="true"
            />

            {/* ✅ Sidebar — slides from left, smooth transform animation */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 bottom-0 left-0 w-[85%] max-w-sm bg-white dark:bg-dark-950 z-[130] overflow-hidden flex flex-col shadow-2xl"
              role="dialog"
              aria-modal="true"
              aria-label="Navigation menu"
            >
              {/* Profile Header */}
              <div className="p-6 bg-gradient-to-br from-gold-400/20 to-transparent border-b border-white/10">
                <div className="flex items-center justify-between mb-6">
                   <div className="w-14 h-14 rounded-2xl bg-gold-400 text-white flex items-center justify-center font-bold shadow-gold overflow-hidden">
                     {user?.avatar ? (
                       <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" loading="lazy" decoding="async" />
                     ) : (
                       <span className="text-xl uppercase">{user ? user.name[0] : <User className="w-6 h-6" />}</span>
                     )}
                   </div>
                   {/* ✅ Close button — 48×48 tap target */}
                   <button 
                    onClick={() => setIsOpen(false)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10"
                    aria-label="Close navigation menu"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {user ? (
                  <div>
                    <h3 className="text-xl font-display font-bold text-dark-900 dark:text-cream-50">{user.name}</h3>
                    <p className="text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-[0.2em] mt-1">{user.role} MEMBER</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-lg font-display font-bold text-dark-900 dark:text-cream-50">Welcome Guest</h3>
                    <Link 
                      href="/login" 
                      onClick={() => setIsOpen(false)} 
                      className="inline-flex items-center px-5 py-3 mt-4 bg-gradient-to-r from-gold-400 to-gold-600 text-white text-xs font-bold rounded-xl shadow-gold uppercase tracking-widest active:scale-95 transition-all min-h-[48px]"
                    >
                      Connect Account
                    </Link>
                  </div>
                )}
              </div>

              {/* ✅ Navigation Links — all 48px+ touch targets */}
              <div className="flex-1 overflow-y-auto p-4 space-y-1">
                <p className="text-[10px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-[4px] px-4 mb-3 mt-2">Discover</p>
                <MobileLink icon={<Home className="w-5 h-5" />} label="Home" href="/" />
                <MobileLink icon={<Grid className="w-5 h-5" />} label="Marketplace" href="/products" />
                <MobileLink icon={<Heart className="w-5 h-5" />} label="Wishlist" href="/customer/wishlist" />
                <MobileLink 
                  icon={<Bell className="w-5 h-5" />} 
                  label="Notifications" 
                  href="/notifications" 
                  onClick={(e) => {
                    if (!user) {
                      e.preventDefault();
                      toast.info("Sign in Required", {
                        description: "Please connect your account to view your notifications.",
                        action: {
                          label: "Login",
                          onClick: () => router.push("/login")
                        }
                      });
                    }
                  }}
                />

                <div className="pt-6">
                  <p className="text-[10px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-[4px] px-4 mb-3">Account</p>
                  <MobileLink 
                    icon={<LayoutDashboard className="w-5 h-5" />} 
                    label="Dashboard" 
                    href={`/${user?.role?.toLowerCase() || 'customer'}/dashboard`} 
                  />
                  {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                    <MobileLink icon={<Plus className="w-5 h-5" />} label="List New Item" href="/seller/add-product" highlight />
                  )}
                </div>
              </div>

              {/* ✅ Footer actions — properly sized buttons */}
              <div className="p-4 border-t border-white/10 space-y-3 pb-safe">
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full h-14 rounded-2xl bg-cream-100 dark:bg-dark-800 text-dark-900 dark:text-cream-50 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all min-h-[48px]"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>

                {user && (
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all min-h-[48px]"
                  >
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
                )}
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ✅ Mobile navigation link — minimum 48px touch target */
function MobileLink({ icon, label, href, highlight, onClick }: { icon: React.ReactNode; label: string; href: string; highlight?: boolean; onClick?: (e: any) => void; }) {
  return (
    <Link 
      href={href} 
      onClick={onClick}      className={`
        flex items-center justify-between p-4 rounded-2xl transition-all group min-h-[48px]
        ${highlight ? "bg-gold-400 text-white shadow-gold" : "hover:bg-gold-400/10 active:bg-gold-400/15 text-dark-600 dark:text-gray-400 hover:text-gold-400"}
      `}
    >
      <div className="flex items-center gap-4">
        <span className={`${highlight ? "text-white" : "text-gray-500 group-hover:text-gold-400"} transition-colors`}>
          {icon}
        </span>
        <span className="text-sm font-display font-bold tracking-tight">{label}</span>
      </div>
      <ChevronRight className="w-4 h-4 opacity-50" />
    </Link>
  );
}
