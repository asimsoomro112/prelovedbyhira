"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  PlusCircle, 
  ShoppingBag, 
  Wallet, 
  History, 
  User, 
  ShieldCheck, 
  Home, 
  LogOut,
  ChevronRight,
  Menu,
  X,
  Bell,
  Search,
  Settings
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";

const menuItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/seller/dashboard" },
  { icon: Package, label: "My Products", href: "/seller/products" },
  { icon: PlusCircle, label: "Add Product", href: "/seller/add-product" },
  { icon: ShoppingBag, label: "Orders", href: "/seller/orders" },
  { icon: Wallet, label: "Earnings", href: "/seller/earnings" },
  { icon: History, label: "Payouts", href: "/seller/payouts" },
  { icon: User, label: "Store Profile", href: "/seller/profile" },
  { icon: ShieldCheck, label: "Verification", href: "/seller/verification" },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  return (
    <div className="flex min-h-screen bg-cream-50 dark:bg-black text-dark-900 dark:text-white selection:bg-gold-400 selection:text-white transition-colors duration-500">
      
      {/* 2026 MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-xl z-[100] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white/80 dark:bg-dark-950/80 backdrop-blur-2xl z-[110] p-6 lg:hidden flex flex-col shadow-2xl border-r border-gold-400/10"
            >
               <div className="flex items-center justify-between mb-10">
                  <span className="font-display italic text-2xl tracking-tight">
                    Preloved<span className="font-bold not-italic text-gold-400">Vault</span>
                  </span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gold-400/10 rounded-xl text-gold-400">
                    <X className="w-5 h-5" />
                  </button>
               </div>

               <nav className="flex-1 space-y-2 overflow-y-auto scrollbar-none">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link 
                        key={item.href} 
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${
                          isActive 
                          ? "bg-gold-400 text-white shadow-gold" 
                          : "text-gray-500 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        <span className="text-sm font-bold tracking-wide">{item.label}</span>
                      </Link>
                    );
                  })}
               </nav>

               <div className="pt-6 border-t border-gold-400/10 mt-6 space-y-3">
                  <div className="flex items-center justify-between px-2 mb-4">
                     <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Theme Mode</span>
                     <ThemeToggle />
                  </div>
                  <Link href="/" className="flex items-center gap-4 p-4 rounded-2xl text-gold-400 font-bold text-sm hover:bg-gold-400/5">
                    <Home className="w-5 h-5" /> Back to Store
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center gap-4 p-4 rounded-2xl text-red-500 font-bold text-sm hover:bg-red-500/5">
                    <LogOut className="w-5 h-5" /> Sign Out
                  </button>
               </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* LUXURY SIDEBAR (Desktop) */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 bg-white dark:bg-dark-950 border-r border-gold-400/10 z-[60] transition-colors duration-500">
        <div className="p-10">
          <Link href="/" className="font-display italic text-2xl tracking-tighter group">
            Preloved<span className="font-bold not-italic text-gold-400 group-hover:text-gold-500 transition-colors">ByHira</span>
          </Link>
        </div>

        <nav className="flex-1 px-6 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link 
                key={item.href} 
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl transition-all group relative ${
                  isActive 
                  ? "bg-gold-400 text-white shadow-gold" 
                  : "text-gray-500 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/5"
                }`}
              >
                <div className="flex items-center gap-4">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:text-gold-400'}`} />
                  <span className="text-sm font-bold tracking-tight">{item.label}</span>
                </div>
                {isActive && (
                  <motion.div 
                    layoutId="sidebarActive" 
                    className="absolute left-[-24px] w-2 h-8 bg-gold-400 rounded-r-full shadow-[0_0_15px_rgba(193,155,90,0.5)]" 
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-8 border-t border-gold-400/10 m-4 rounded-[32px] bg-gold-400/5 space-y-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white dark:bg-dark-800 p-1 shadow-sm border border-gold-400/10 overflow-hidden relative">
                 {user?.avatar ? (
                   <Image src={user.avatar} alt={user.name} fill className="object-cover" />
                 ) : (
                   <div className="w-full h-full bg-gold-400 flex items-center justify-center text-white font-bold">{user?.name?.[0]}</div>
                 )}
              </div>
              <div className="min-w-0">
                 <p className="text-xs font-bold truncate">{user?.name}</p>
                 <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-0.5">Verified</p>
              </div>
           </div>
           <button 
             onClick={handleLogout}
             className="w-full py-3 bg-white dark:bg-dark-900 border border-gold-400/20 rounded-xl text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all"
           >
              Secure Logout
           </button>
        </div>
      </aside>

      {/* MAIN VIEWPORT */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative">
         {/* Background Orbs */}
         <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-gold-400/5 blur-[120px] rounded-full pointer-events-none" />
         
         {/* CINEMATIC HEADER */}
         <header className={`px-8 lg:px-12 flex items-center justify-between fixed top-0 right-0 z-[100] transition-all duration-300 ${scrolled ? 'bg-white/80 dark:bg-black/80 backdrop-blur-2xl border-b border-gold-400/10 h-20' : 'bg-transparent h-24'} ${isMobileMenuOpen ? 'hidden' : 'flex'} w-full lg:w-[calc(100%-288px)]`}>
            <div className="flex items-center gap-6">
               <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-gold-400/10 text-gold-400 rounded-xl">
                  <Menu className="w-6 h-6" />
               </button>
               <div className="hidden lg:flex items-center gap-3">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">Vault Portal</span>
                  <ChevronRight className="w-3 h-3 text-gold-400" />
                  <span className="text-sm font-bold text-dark-900 dark:text-white capitalize">
                    {pathname.split('/').pop()?.replace('-', ' ')}
                  </span>
               </div>
            </div>

            <div className="flex items-center gap-4 lg:gap-6">
               <div className="hidden md:flex items-center bg-white dark:bg-dark-900/50 border border-gold-400/10 rounded-2xl px-4 py-2 w-64 focus-within:border-gold-400 transition-all">
                  <Search className="w-4 h-4 text-gray-400" />
                  <input placeholder="Search listings..." className="bg-transparent border-none outline-none text-xs ml-3 w-full" />
               </div>
               
               <div className="flex items-center gap-2">
                  <ThemeToggle />
                  <NotificationDropdown />
               </div>
            </div>
         </header>

         <div className="flex-1 p-6 lg:p-12 relative z-10 pt-28 lg:pt-32">
            {children}
         </div>

         {/* Footer Subtle Stats */}
         <footer className="p-8 border-t border-gold-400/5 opacity-50 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400">© 2026 PrelovedByHira • Merchant Vault</p>
            <div className="flex items-center gap-8">
               <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Node Sync Active</span>
               </div>
               <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">v3.4.0-Stable</span>
            </div>
         </footer>
      </main>
    </div>
  );
}
