"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Store, 
  MessageSquare, 
  CreditCard, 
  BarChart3, 
  Settings, 
  LogOut,
  Bell,
  Search,
  Command,
  Sparkles,
  Menu,
  X,
  CheckCircle2,
  XCircle,
  ChevronRight,
  ShieldAlert,
  Shield,
  Lock,
  PieChart
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import ThemeToggle from "@/components/shared/ThemeToggle";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // 🛡️ SECURITY: Prevent non-admins from staying on this layout
  useEffect(() => {
    if (isAuthenticated && user?.role !== 'ADMIN') {
      router.push('/dashboard');
    }
  }, [user, isAuthenticated, router]);

  const menuItems = [
    { icon: <LayoutDashboard />, label: "Overview", href: "/admin/dashboard" },
    { icon: <Users />, label: "Users", href: "/admin/users" },
    { icon: <Store />, label: "Sellers", href: "/admin/sellers" },
    { icon: <ShoppingBag />, label: "Products", href: "/admin/products" },
    { icon: <CreditCard />, label: "Orders", href: "/admin/orders" },
    { icon: <Lock />, label: "Escrow Manager", href: "/admin/escrow" },
    { icon: <MessageSquare />, label: "Disputes", href: "/admin/disputes" },
    { icon: <BarChart3 />, label: "Payouts", href: "/admin/payouts" },
    { icon: <PieChart />, label: "Commission", href: "/admin/commission" },
    { icon: <Settings />, label: "Settings", href: "/admin/settings" },
  ];

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  if (!user || user.role !== 'ADMIN') {
    return <div className="min-h-screen bg-black flex items-center justify-center text-gold-400 font-bold uppercase tracking-widest">Verifying Authorization...</div>;
  }

  return (
    <div className="min-h-screen bg-mesh dark:bg-black text-dark-900 dark:text-white flex p-0 lg:p-4 gap-0 lg:gap-4 transition-colors duration-500 overflow-x-hidden">
      {/* 2026 MOBILE MENU OVERLAY */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[150] lg:hidden"
            />
            <motion.aside 
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[80%] max-w-[300px] bg-white dark:bg-zinc-900 z-[160] p-6 lg:hidden flex flex-col border-r border-gold-400/20"
            >
               <div className="flex items-center justify-between mb-10">
                  <span className="text-xl font-display font-bold">Admin<span className="text-gold-400">Panel</span></span>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 bg-gold-400/10 rounded-xl text-gold-400"><X /></button>
               </div>
               <nav className="flex-1 space-y-2">
                  {menuItems.map((item) => (
                    <Link 
                      key={item.href} href={item.href} onClick={() => setIsMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm min-h-[48px] ${pathname === item.href ? "text-gold-400 bg-gold-400/10" : "text-zinc-500 active:bg-gold-400/5"}`}
                    >
                      {item.icon} {item.label}
                    </Link>
                  ))}
               </nav>
               <button onClick={handleLogout} className="mt-auto py-4 bg-red-500/10 text-red-500 rounded-2xl font-bold flex items-center justify-center gap-2 min-h-[48px]">
                  <LogOut className="w-4 h-4" /> Sign Out
               </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 2026 DESKTOP FLOATING SIDEBAR */}
      <aside className="hidden lg:flex w-72 flex-col bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl crystal-border rounded-[40px] shadow-2xl p-6 sticky top-4 h-[calc(100vh-32px)] transition-all">
        <div className="px-4 py-8 flex items-center gap-3">
           <div className="w-10 h-10 rounded-2xl bg-gold-400 flex items-center justify-center shadow-gold">
              <Sparkles className="w-5 h-5 text-white" />
           </div>
           <span className="text-xl font-display font-bold text-dark-900 dark:text-white">Admin<span className="text-gold-400">Panel</span></span>
        </div>

        <nav className="flex-1 mt-8 space-y-2 overflow-y-auto scrollbar-none px-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link 
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-4 px-5 py-4 rounded-2xl font-bold text-sm transition-all relative group
                  ${isActive ? "text-gold-400 bg-gold-400/10" : "text-zinc-500 hover:text-dark-900 dark:hover:text-white hover:bg-gold-400/5 dark:hover:bg-white/5"}
                `}
              >
                {isActive && (
                  <motion.div 
                    layoutId="adminNavActive"
                    className="absolute inset-0 bg-gold-400/10 rounded-2xl border border-gold-400/20"
                  />
                )}
                <span className={`w-5 h-5 ${isActive ? "text-gold-400" : "group-hover:scale-110 transition-transform"}`}>
                  {item.icon}
                </span>
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto p-4 space-y-4">
           <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-3xl border border-gold-400/10 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gold-400/20 text-gold-400 flex items-center justify-center font-bold">
                 {user?.name?.[0]}
              </div>
              <div className="flex-1 min-w-0">
                 <p className="text-xs font-bold truncate text-dark-900 dark:text-white">{user?.name}</p>
                 <p className="text-[8px] font-bold text-gold-400 uppercase tracking-widest">Super Admin</p>
              </div>
           </div>
           <button 
            onClick={handleLogout}
            className="w-full h-14 rounded-2xl bg-red-400/10 text-red-400 font-bold flex items-center justify-center gap-3 hover:bg-red-400 hover:text-white transition-all"
           >
              <LogOut className="w-5 h-5" /> Sign Out
           </button>
        </div>
      </aside>

      {/* CONTENT AREA */}
      <main className="flex-1 flex flex-col gap-4 overflow-hidden min-h-screen lg:min-h-0">
        {/* Top Header */}
        <header className="h-16 lg:h-20 bg-white/80 dark:bg-zinc-900/50 backdrop-blur-3xl crystal-border rounded-none lg:rounded-[32px] flex items-center justify-between px-4 lg:px-8 shadow-xl transition-all shrink-0">
           <div className="flex items-center gap-4 flex-1">
              <button onClick={() => setIsMobileMenuOpen(true)} className="lg:hidden p-3 bg-gold-400/10 text-gold-400 rounded-xl min-w-[48px] min-h-[48px] flex items-center justify-center active:scale-90 transition-transform">
                 <Menu className="w-6 h-6" />
              </button>
              <div className="relative w-full max-w-md group hidden sm:flex">
                 <div className="relative h-11 bg-zinc-100 dark:bg-black/20 rounded-xl border border-zinc-200 dark:border-white/5 flex items-center px-4 gap-3">
                    <Search className="w-4 h-4 text-gray-500" />
                    <input placeholder="Search records..." className="bg-transparent border-none outline-none flex-1 text-xs font-medium text-dark-900 dark:text-white placeholder:text-zinc-400" />
                 </div>
              </div>
           </div>
           
           <div className="flex items-center gap-2 lg:gap-4">
              <ThemeToggle />
              <button className="hidden sm:flex w-11 h-11 rounded-xl bg-zinc-100 dark:bg-zinc-800/50 border border-zinc-200 dark:border-white/5 items-center justify-center text-gray-400 hover:text-gold-400 transition-all">
                 <Bell className="w-5 h-5" />
               </button>
               <div className="w-px h-8 bg-zinc-200 dark:bg-white/10 mx-2 hidden sm:block" />
               <button className="px-4 lg:px-6 h-11 bg-gold-400 text-white rounded-xl font-bold text-[10px] lg:text-xs shadow-gold hover:scale-105 active:scale-95 transition-all truncate min-h-[44px]">
                  Broadcast
               </button>
            </div>
         </header>

         <div className="flex-1 overflow-y-auto scrollbar-none rounded-none lg:rounded-[32px] p-3 lg:p-0">
           {children}
         </div>
       </main>
    </div>
  );
}

