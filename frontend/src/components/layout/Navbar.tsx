"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Search, 
  ShoppingBag, 
  Heart, 
  User, 
  Menu, 
  X, 
  Moon, 
  Sun,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "next-themes";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import NotificationBell from "./NotificationBell";
import { useEffect } from "react";

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const { itemCount, fetchCart } = useCartStore();
  const pathname = usePathname();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const isSeller = user?.role === "SELLER";
  const isAdmin = user?.role === "ADMIN";

  return (
    <nav className="sticky top-0 z-[100] w-full bg-white/80 dark:bg-dark-950/80 backdrop-blur-xl border-b border-gold-400/10">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-8">
          
          {/* Logo & Navigation */}
          <div className="flex items-center gap-12">
            <Link href="/" className="font-display italic text-2xl shrink-0 group">
              Preloved<span className="font-bold not-italic text-gold-400 group-hover:tracking-wider transition-all duration-500">ByHira</span>
            </Link>

            <div className="hidden lg:flex items-center gap-8">
              <Link href="/products" className={`text-[10px] font-bold uppercase tracking-[0.2em] hover:text-gold-400 transition-colors ${pathname === '/products' ? 'text-gold-400' : 'text-gray-500'}`}>
                Shop
              </Link>
              <Link href="/products?category=Bridal" className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 hover:text-gold-400 transition-colors">
                Bridal
              </Link>
              <Link href="/products?onSale=true" className="text-[10px] font-bold uppercase tracking-[0.2em] text-red-500 hover:text-red-600 transition-colors">
                Flash Sale
              </Link>
            </div>
          </div>

          {/* Search Bar (Desktop) */}
          <div className="hidden md:flex flex-1 max-w-xl relative group">
            <div className={`absolute inset-0 bg-gold-400/5 rounded-full transition-all duration-500 ${isSearchFocused ? "opacity-100 scale-105" : "opacity-0"}`} />
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 group-focus-within:text-gold-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search vintage dresses, silk kurtas, jewelry..."
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-cream-50 dark:bg-dark-900 border border-gold-400/10 rounded-full pl-14 pr-6 py-3.5 text-sm outline-none focus:border-gold-400/50 transition-all placeholder:text-gray-400 font-medium"
            />
            
            {/* Search Autocomplete Placeholder */}
            <AnimatePresence>
              {isSearchFocused && searchQuery.length > 2 && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-full left-0 right-0 mt-4 bg-white dark:bg-dark-900 rounded-[32px] shadow-card border border-gold-400/10 p-6 z-50"
                >
                  <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-4">Trending Searches</p>
                  <div className="space-y-2">
                     {["Silk Dresses", "Vintage Jewelry", "Bridal Wear"].map(s => (
                       <button key={s} className="w-full text-left p-3 hover:bg-gold-400/5 rounded-xl text-sm font-medium transition-colors flex items-center justify-between">
                          {s} <ArrowUpRight className="w-4 h-4 text-gray-400" />
                       </button>
                     ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 lg:gap-5">
            {/* Theme Toggle */}
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2.5 rounded-full hover:bg-gold-400/10 text-gray-600 dark:text-gray-300 transition-all"
            >
              <Sun className="w-5 h-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute top-2.5 left-2.5 w-5 h-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </button>

            {user ? (
              <>
                <NotificationBell />
                <Link href="/customer/wishlist" className="hidden lg:block p-2.5 hover:bg-gold-400/10 rounded-full text-gray-600 dark:text-gray-300">
                  <Heart className="w-6 h-6" />
                </Link>

                <Link href="/cart" className="relative p-2.5 hover:bg-gold-400/10 rounded-full text-gray-600 dark:text-gray-300 transition-all group">
                   <ShoppingBag className="w-6 h-6 group-hover:scale-110 transition-transform" />
                   {itemCount > 0 && (
                     <span className="absolute top-1.5 right-1.5 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-950 animate-bounce-subtle">
                       {itemCount}
                     </span>
                   )}
                </Link>
                
                <div className="h-6 w-px bg-gold-400/20 hidden lg:block" />

                {/* User Menu */}
                <div className="relative group">
                  <button className="flex items-center gap-3 p-1 pr-3 bg-gold-400/10 rounded-full hover:bg-gold-400/20 transition-all border border-gold-400/5">
                    <div className="w-8 h-8 rounded-full bg-gold-400 text-white flex items-center justify-center font-bold">
                      {user.name[0]}
                    </div>
                    <span className="hidden lg:block text-sm font-bold text-gray-700 dark:text-cream-50">{user.name.split(' ')[0]}</span>
                  </button>

                  <div className="absolute right-0 top-full mt-4 w-64 bg-white dark:bg-dark-900 rounded-[32px] shadow-card border border-gold-400/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 p-3 z-50">
                    <div className="p-4 border-b border-gold-400/5 mb-2">
                       <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{user.role}</p>
                       <p className="text-sm font-bold text-dark-900 dark:text-cream-50 truncate">{user.email}</p>
                    </div>
                    {isSeller && (
                      <Link href="/seller/dashboard" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gold-400/5 text-sm font-bold transition-all">
                        <LayoutDashboard className="w-5 h-5 text-gold-400" /> Seller Dashboard
                      </Link>
                    )}
                    {isAdmin && (
                      <Link href="/admin/dashboard" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gold-400/5 text-sm font-bold transition-all">
                        <LayoutDashboard className="w-5 h-5 text-gold-400" /> Admin Panel
                      </Link>
                    )}
                    <Link href="/customer/profile" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gold-400/5 text-sm font-bold transition-all">
                      <User className="w-5 h-5 text-gold-400" /> My Profile
                    </Link>
                    <Link href="/customer/orders" className="flex items-center gap-3 p-4 rounded-2xl hover:bg-gold-400/5 text-sm font-bold transition-all">
                      <ShoppingBag className="w-5 h-5 text-gold-400" /> Order History
                    </Link>
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-3 p-4 rounded-2xl hover:bg-red-500/5 text-red-500 text-sm font-bold transition-all mt-2 border-t border-gold-400/5"
                    >
                      <LogOut className="w-5 h-5" /> Logout
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="hidden lg:block text-sm font-bold text-gray-500 hover:text-gold-400 transition-colors">Login</Link>
                <Link href="/register" className="px-6 py-2.5 bg-gold-400 text-white rounded-pill text-sm font-bold shadow-gold hover:scale-105 transition-all">Join Now</Link>
              </div>
            )}

            {/* Mobile Toggle */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden p-2.5 bg-gold-400/10 text-gold-400 rounded-full"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsMobileMenuOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]" />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] bg-white dark:bg-dark-900 z-[120] p-8 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-12">
                 <Link href="/" className="font-display italic text-2xl">Preloved<span className="text-gold-400">ByHira</span></Link>
                 <button onClick={() => setIsMobileMenuOpen(false)} className="p-3 bg-gold-400/10 text-gold-400 rounded-2xl"><X className="w-6 h-6" /></button>
              </div>
              
              <div className="space-y-8">
                 {/* Mobile Search */}
                 <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input placeholder="Search..." className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl pl-12 pr-4 py-4 text-sm font-bold" />
                 </div>

                 <nav className="space-y-2">
                    <MobileNavLink href="/products" label="Browse All" />
                    <MobileNavLink href="/products?category=Dresses" label="Dresses" />
                    <MobileNavLink href="/products?category=Bags" label="Bags" />
                    <MobileNavLink href="/products?category=Shoes" label="Shoes" />
                 </nav>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </nav>
  );
}

function MobileNavLink({ href, label }: { href: string, label: string }) {
  return (
    <Link href={href} className="flex items-center justify-between p-5 rounded-2xl hover:bg-gold-400/5 transition-all group">
      <span className="font-display font-bold text-xl text-gray-700 dark:text-cream-50 group-hover:text-gold-400">{label}</span>
      <ArrowUpRight className="w-5 h-5 text-gray-300 group-hover:text-gold-400 transition-all" />
    </Link>
  );
}

function ArrowUpRight(props: any) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M7 17l10-10M7 7h10v10"/></svg>
  );
}
