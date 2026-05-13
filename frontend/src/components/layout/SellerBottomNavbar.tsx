"use client";

import { motion } from "framer-motion";
import { 
  LayoutDashboard, 
  Package, 
  Plus, 
  DollarSign, 
  ShoppingBag,
  ArrowLeft
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SellerBottomNavbar() {
  const pathname = usePathname();

  const tabs = [
    { id: "dashboard", label: "Vault", icon: LayoutDashboard, href: "/seller/dashboard" },
    { id: "orders", label: "Orders", icon: Package, href: "/seller/orders" },
    { 
      id: "add", 
      label: "List", 
      icon: Plus, 
      href: "/seller/add-product", 
      isFab: true 
    },
    { id: "earnings", label: "Earnings", icon: DollarSign, href: "/seller/earnings" },
    { id: "store", label: "Store", icon: ArrowLeft, href: "/" },
  ];

  return (
    <motion.div 
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      className="lg:hidden fixed bottom-6 left-6 right-6 z-[100] pointer-events-none"
    >
      <div className="relative glass-ultra crystal-border rounded-[32px] h-20 flex items-center justify-around px-2 shadow-gold-3d pointer-events-auto">
        
        {/* Active Indicator Backdrop */}
        <div className="absolute inset-x-2 h-14 pointer-events-none flex justify-around">
           {tabs.map((tab) => (
             <div key={tab.id} className="relative flex-1 flex items-center justify-center">
                {pathname === tab.href && !tab.isFab && (
                  <motion.div 
                    layoutId="activeSellerTab"
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
                href={tab.href}
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

          return (
            <Link 
              key={tab.id} 
              href={tab.href}
              className={`relative flex-1 flex flex-col items-center justify-center gap-1 transition-all duration-300 ${isActive ? "text-gold-400 scale-110" : "text-gray-500"}`}
            >
              <tab.icon className={`w-5 h-5 ${isActive ? "fill-gold-400/20" : ""}`} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}
