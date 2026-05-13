"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Search, Heart, Bell, ShoppingBag, User, LogOut, LayoutDashboard, Settings, Package, SearchIcon, ChevronDown, Sparkles, Command, Sun, Moon, Gem, TrendingUp, Star, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";

export default function DesktopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // 3D Perspective shifts based on scroll
  const navY = useTransform(scrollY, [0, 100], [20, 0]);
  const navScale = useTransform(scrollY, [0, 100], [0.95, 1]);
  const navBlur = useTransform(scrollY, [0, 100], [0, 40]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <motion.nav
      className="fixed top-4 left-0 right-0 z-[100] px-6 hidden lg:flex justify-center"
    >
      <div className={`
        w-full max-w-7xl h-20 rounded-[32px] flex items-center justify-between px-8 transition-all duration-500 pointer-events-auto
        glass-ultra crystal-border shadow-gold-3d
      `}>
        {/* LOGO AREA */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shadow-gold group-hover:rotate-[10deg] transition-transform duration-500">
            <ShoppingBag className="w-5 h-5 text-white" />
            <div className="absolute inset-0 bg-white/20 rounded-2xl blur-lg animate-pulse" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-display font-bold leading-none tracking-tight text-dark-900 dark:text-cream-50">
              Preloved<span className="text-gold-400 italic">ByHira</span>
            </span>
            <span className="text-[8px] font-bold text-dark-400 dark:text-gray-400 uppercase tracking-[4px] mt-1">Luxury 2026</span>
          </div>
        </Link>

        {/* NAVIGATION LINKS */}
        <div className="flex items-center gap-8 ml-12">
          <div className="relative group/cat">
            <button className="flex items-center gap-2 text-dark-900 dark:text-cream-50 hover:text-gold-400 transition-all py-4">
               <Sparkles className="w-4 h-4 text-gold-400" />
               <span className="text-xs font-bold uppercase tracking-widest">Categories</span>
               <ChevronDown className="w-3 h-3 opacity-50 group-hover/cat:rotate-180 transition-transform" />
            </button>
            
            {/* CATEGORIES DROPDOWN */}
            <div className="absolute top-[80%] left-0 pt-6 w-64 opacity-0 translate-y-4 pointer-events-none group-hover/cat:opacity-100 group-hover/cat:translate-y-0 group-hover/cat:pointer-events-auto transition-all duration-500 z-50">
               <div className="glass-ultra crystal-border rounded-[32px] shadow-gold-3d p-4">
                 <div className="space-y-1">
                    <CategoryItem label="Shadi & Formal" href="/products?category=SHADI-WEAR" icon={<Gem className="w-4 h-4" />} />
                    <CategoryItem label="Luxury Bridal" href="/products?category=BRIDAL" icon={<Sparkles className="w-4 h-4" />} />
                    <CategoryItem label="Kurtas & Shirts" href="/products?category=KURTAS" icon={<TrendingUp className="w-4 h-4" />} />
                    <CategoryItem label="Premium Watches" href="/products?category=WATCHES" icon={<Star className="w-4 h-4" />} />
                    <CategoryItem label="Designer Shoes" href="/products?category=SHOES" icon={<Zap className="w-4 h-4" />} />
                    <CategoryItem label="Bags & Jewelry" href="/products?category=BAGS" icon={<ShoppingBag className="w-4 h-4" />} />
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* SEARCH CONSOLE (COMMAND-K STYLE) */}
        <div className="flex items-center flex-1 max-w-sm mx-8">
          <div className="w-full relative group">
             <div className="absolute inset-0 bg-gold-400/5 rounded-2xl blur-xl group-hover:bg-gold-400/10 transition-colors" />
             <div className="relative h-12 glass-crystal rounded-2xl crystal-border flex items-center px-4 gap-3">
                <Search className="w-4 h-4 text-gold-400" />
                <input 
                  placeholder="Find your next look..." 
                  className="bg-transparent border-none outline-none flex-1 text-sm font-medium placeholder:text-gray-500 text-dark-900 dark:text-cream-50"
                />
                <div className="flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                   <Command className="w-3 h-3 text-gray-500" />
                   <span className="text-[10px] font-bold text-gray-500">K</span>
                </div>
             </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3 shrink-0">
          <NavAction 
            icon={theme === 'dark' ? <Sun /> : <Moon />} 
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            label="Theme" 
          />
          <Link href="/customer/wishlist">
            <NavAction icon={<Heart />} label="Wishlist" count={0} />
          </Link>
          <NavAction icon={<Bell />} label="Notifs" count={3} hasPulse />
          
          <Link href="/cart" className="relative group">
            <div className="w-12 h-12 rounded-2xl glass-crystal crystal-border flex items-center justify-center hover:bg-gold-400 hover:text-white transition-all duration-500">
               <ShoppingBag className="w-5 h-5" />
               {items.length > 0 && (
                 <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-gold">
                   {items.length}
                 </span>
               )}
            </div>
          </Link>

          {(user && user.name) ? (
            <div className="relative group/user flex items-center">
              <button 
                type="button"
                className="h-12 min-w-[48px] lg:min-w-[140px] flex items-center gap-3 p-1 pr-4 rounded-2xl bg-gold-400 hover:bg-gold-600 transition-all shadow-gold z-[101]"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center font-bold overflow-hidden shrink-0 border border-white/20">
                   {user.avatar ? (
                     <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                   ) : (
                     <span className="text-white text-lg">{user.name[0]?.toUpperCase() || 'U'}</span>
                   )}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-white truncate max-w-[80px] uppercase tracking-tighter leading-none">{user.name.split(' ')[0]}</p>
                  <p className="text-[7px] font-bold text-white/80 uppercase tracking-widest mt-1">{user.role}</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-white/80 group-hover/user:rotate-180 transition-transform shrink-0" />
              </button>

              {/* DROPDOWN MENU - ABSOLUTE PIXELS POSITIONING */}
              <div className="absolute top-20 right-0 w-64 glass-ultra crystal-border rounded-[32px] opacity-0 pointer-events-none group-hover/user:opacity-100 group-hover/user:pointer-events-auto transition-all duration-300 shadow-gold-3d p-4 z-[110]">
                 <div className="space-y-1">
                    <div className="px-4 py-2 mb-2 border-b border-white/10">
                       <p className="text-[8px] font-bold text-gold-400 uppercase tracking-[0.2em]">Signed in as</p>
                       <p className="text-xs font-bold text-dark-900 dark:text-cream-50 truncate">{user.email}</p>
                    </div>
                    <DropdownLink icon={<LayoutDashboard />} label="Control Panel" href={user.role === 'ADMIN' ? '/admin/dashboard' : (user.role === 'SELLER' ? '/seller/dashboard' : '/customer/dashboard')} />
                    <DropdownLink icon={<Package />} label="My Orders" href={user.role === 'SELLER' ? '/seller/orders' : '/customer/orders'} />
                    <DropdownLink icon={<Settings />} label="Account Settings" href={user.role === 'SELLER' ? '/seller/profile' : '/customer/profile'} />
                    <div className="h-px bg-white/10 my-3" />
                    <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all text-sm font-bold">
                       <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                 </div>
              </div>
            </div>
          ) : (
            <Link href="/login" className="h-12 px-8 flex items-center bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all text-xs whitespace-nowrap">
              Connect Account
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

function NavAction({ icon, count, hasPulse, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className="relative w-12 h-12 rounded-2xl glass-ultra crystal-border flex items-center justify-center hover:bg-gold-400/10 transition-all group border border-white/10"
    >
      <div className="group-hover:scale-110 transition-transform text-dark-900/70 dark:text-cream-50/70 group-hover:text-gold-400">
        {icon}
      </div>
      {count > 0 && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full shadow-gold" />
      )}
      {hasPulse && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full animate-ping" />
      )}
    </button>
  );
}

function CategoryItem({ label, href, icon }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-dark-600 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/5 transition-all text-xs font-bold">
       <span className="w-4 h-4 opacity-70 group-hover/cat:opacity-100 transition-opacity">{icon}</span>
       {label}
    </Link>
  );
}

function DropdownLink({ icon, label, href }: any) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3 rounded-2xl text-dark-600 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/5 transition-all text-sm font-bold">
       <span className="w-5 h-5">{icon}</span>
       {label}
    </Link>
  );
}
