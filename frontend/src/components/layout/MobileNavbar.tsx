"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Bell, User, ShoppingBag, Home, Heart, Grid, Search, Plus, Sparkles, ChevronRight, LayoutDashboard, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

export default function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const { theme, setTheme } = useTheme();

  // Prevent background scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  return (
    <>
      {/* Top Header */}
      <nav className="lg:hidden fixed top-0 left-0 right-0 z-[110] px-4 py-3">
        <div className="glass-ultra crystal-border rounded-[24px] h-14 flex items-center justify-between px-4 shadow-gold-3d">
          <button 
            onClick={() => setIsOpen(true)}
            className="w-10 h-10 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center active:scale-90 transition-transform"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-display font-bold text-dark-900 dark:text-cream-50">
              Preloved<span className="text-gold-400 italic">ByHira</span>
            </span>
          </Link>

          <div className="flex items-center gap-2">
            <Link href="/cart" className="relative w-10 h-10 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center active:scale-90 transition-transform">
              <ShoppingBag className="w-5 h-5" />
              {items.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-400 text-white text-[8px] font-bold rounded-full flex items-center justify-center">
                  {items.length}
                </span>
              )}
            </Link>
          </div>
        </div>
      </nav>

      {/* Floating Sidebar Drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[120]"
            />

            {/* Sidebar */}
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-4 bottom-4 left-4 w-[85%] max-w-sm glass-ultra crystal-border rounded-[40px] z-[130] overflow-hidden flex flex-col shadow-2xl"
            >
              {/* Profile Header */}
              <div className="p-8 bg-gradient-to-br from-gold-400/20 to-transparent border-b border-white/10">
                <div className="flex items-center justify-between mb-8">
                   <div className="w-16 h-16 rounded-2xl bg-gold-400 text-white flex items-center justify-center font-bold shadow-gold overflow-hidden">
                      {user?.avatar ? (
                        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-2xl uppercase">{user ? user.name[0] : <User />}</span>
                      )}
                   </div>
                   <button 
                    onClick={() => setIsOpen(false)}
                    className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors border border-white/10"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                {user ? (
                  <div>
                    <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">{user.name}</h3>
                    <p className="text-xs text-gold-600 dark:text-gold-400 font-bold uppercase tracking-[0.2em] mt-1">{user.role} MEMBER</p>
                  </div>
                ) : (
                  <div>
                    <h3 className="text-xl font-display font-bold text-dark-900 dark:text-cream-50">Welcome Guest</h3>
                    <Link 
                      href="/login" 
                      onClick={() => setIsOpen(false)} 
                      className="inline-flex items-center px-5 py-2.5 mt-4 bg-gradient-to-r from-gold-400 to-gold-600 text-white text-[10px] font-bold rounded-xl shadow-gold uppercase tracking-widest active:scale-95 transition-all"
                    >
                      Connect Account
                    </Link>
                  </div>
                )}
              </div>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto p-6 space-y-2">
                <p className="text-[10px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-[4px] px-4 mb-4">Discover</p>
                <MobileLink icon={<Home />} label="Home" href="/" onClick={() => setIsOpen(false)} />
                <MobileLink icon={<Grid />} label="Marketplace" href="/products" onClick={() => setIsOpen(false)} />
                <MobileLink icon={<Heart />} label="Wishlist" href="/customer/wishlist" onClick={() => setIsOpen(false)} />
                <MobileLink icon={<Bell />} label="Notifications" href="/notifications" onClick={() => setIsOpen(false)} />

                <div className="pt-8">
                  <p className="text-[10px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-[4px] px-4 mb-4">Account</p>
                  <MobileLink icon={<LayoutDashboard />} label="Dashboard" href={`/${user?.role.toLowerCase() || 'customer'}/dashboard`} onClick={() => setIsOpen(false)} />
                  {(user?.role === 'SELLER' || user?.role === 'ADMIN') && (
                    <MobileLink icon={<Plus />} label="List New Item" href="/seller/add-product" onClick={() => setIsOpen(false)} highlight />
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-white/10 space-y-4">
                <button 
                  onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                  className="w-full h-14 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl"
                >
                  {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  Switch to {theme === 'dark' ? 'Light' : 'Dark'}
                </button>

                {user && (
                  <button 
                    onClick={() => { logout(); setIsOpen(false); }}
                    className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-3 active:scale-95 transition-all"
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

function MobileLink({ icon, label, href, onClick, highlight }: any) {
  return (
    <Link 
      href={href} 
      onClick={onClick}
      className={`
        flex items-center justify-between p-4 rounded-2xl transition-all group
        ${highlight ? "bg-gold-400 text-white shadow-gold" : "hover:bg-gold-400/10 text-dark-600 dark:text-gray-400 hover:text-gold-400"}
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
