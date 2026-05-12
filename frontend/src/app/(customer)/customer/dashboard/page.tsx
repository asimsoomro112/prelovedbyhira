"use client";

import { motion } from "framer-motion";
import { 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  ShoppingBag, 
  Clock, 
  CheckCircle2, 
  Truck,
  ArrowRight,
  ShieldCheck,
  ChevronRight
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["customer-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/users/dashboard");
      return data;
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center font-display text-gold-400">Opening your Vault...</div>;

  const { stats, activeOrders } = dashboardData || {};

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 lg:py-24 space-y-16">
      
      {/* WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-8">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-gold-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              <ShieldCheck className="w-4 h-4" /> Authenticated Member
           </div>
           <h1 className="text-6xl font-display font-bold text-dark-900 dark:text-cream-50">Hello, <span className="italic text-gold-400">{user?.name.split(' ')[0]}.</span></h1>
        </div>
        <div className="flex gap-4">
           <DashboardAction icon={<Heart />} label="Wishlist" count={stats?.wishlistCount} href="/customer/wishlist" />
           <DashboardAction icon={<MapPin />} label="Addresses" href="/customer/profile" />
           <DashboardAction icon={<Settings />} label="Settings" href="/customer/profile" />
        </div>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         <QuickStat label="Active Orders" value={stats?.activeOrdersCount} icon={<Package />} active />
         <QuickStat label="Total Spent" value={`Rs. ${(stats?.totalSpent / 1000).toFixed(1)}k`} icon={<ShoppingBag />} />
         <QuickStat label="Style Points" value="1,240" icon={<CheckCircle2 />} />
         <QuickStat label="Member Since" value={new Date(stats?.memberSince).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} icon={<Clock />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
         
         {/* ACTIVE ORDERS SECTION */}
         <div className="lg:col-span-2 space-y-8">
            <div className="flex items-center justify-between">
               <h2 className="text-3xl font-display font-bold">Active Orders</h2>
               <Link href="/customer/orders" className="text-xs font-bold text-gold-400 hover:underline flex items-center gap-2">
                  History <ChevronRight className="w-4 h-4" />
               </Link>
            </div>

            <div className="space-y-6">
               {activeOrders && activeOrders.length > 0 ? (
                 activeOrders.map((order: any) => (
                   <OrderCard 
                     key={order.id}
                     id={`#ORD-${order.id.slice(0, 8)}`}
                     item={order.product?.title || "Luxury Item"}
                     price={`Rs. ${order.totalPrice?.toLocaleString()}`}
                     status={order.status}
                     statusDesc={order.status === 'PAID' ? "Seller is preparing your luxury package." : "Your item is moving through the vault."}
                     step={order.status === 'SHIPPED' ? 3 : 1}
                   />
                 ))
               ) : (
                 <div className="p-16 text-center bg-white/5 rounded-[48px] border border-dashed border-gold-400/20">
                    <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No Active Orders</p>
                    <Link href="/" className="text-gold-400 text-[10px] font-bold mt-4 block hover:underline">Start Shopping 🛍️</Link>
                 </div>
               )}
            </div>
         </div>

         {/* STYLE SUGGESTIONS / SAVED */}
         <div className="space-y-8">
            <h2 className="text-3xl font-display font-bold">Saved Picks</h2>
            <div className="p-10 glass-ultra crystal-border rounded-[48px] bg-gold-400/5 text-center space-y-6">
               <div className="w-20 h-20 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto text-gold-400">
                  <Heart className="w-10 h-10 fill-gold-400" />
               </div>
               <div className="space-y-2">
                  <h3 className="text-xl font-bold">Your Wishlist</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">You have {stats?.wishlistCount} luxury items waiting for a price drop.</p>
               </div>
               <Link href="/customer/wishlist" className="flex items-center justify-center gap-3 h-14 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all">
                  View Moodboard <ArrowRight className="w-4 h-4" />
               </Link>
            </div>
         </div>

      </div>

    </div>
  );
}

function DashboardAction({ icon, label, count, href }: any) {
  return (
    <Link href={href} className="flex flex-col items-center gap-2 group">
       <div className="w-14 h-14 rounded-2xl glass-ultra crystal-border flex items-center justify-center text-gray-400 group-hover:text-gold-400 group-hover:bg-gold-400/5 transition-all relative">
          {icon}
          {count && <span className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-gold">{count}</span>}
       </div>
       <span className="text-[9px] font-bold uppercase tracking-widest text-gray-500">{label}</span>
    </Link>
  );
}

function QuickStat({ label, value, icon, active }: any) {
  return (
    <div className={`p-8 glass-ultra crystal-border rounded-[32px] space-y-4 shadow-soft ${active ? "bg-gold-400/5 border-gold-400/30" : ""}`}>
       <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${active ? "bg-gold-400 text-white shadow-gold" : "bg-gold-400/10 text-gold-400"}`}>
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-2xl font-accent font-bold text-dark-900 dark:text-cream-50">{value}</h3>
       </div>
    </div>
  );
}

function OrderCard({ id, item, price, status, statusDesc, step }: any) {
  return (
    <div className="p-8 glass-ultra crystal-border rounded-[40px] space-y-8 group hover:bg-gold-400/5 transition-all shadow-soft">
       <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="space-y-1">
             <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{id}</p>
             <h4 className="text-xl font-bold">{item}</h4>
          </div>
          <div className="text-right">
             <p className="text-2xl font-accent font-bold text-gold-400">{price}</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escrow Protected</p>
          </div>
       </div>

       <div className="space-y-6">
          <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
             <span className="text-gold-400">{status}</span>
             <span className="text-gray-400">Delivery ETA: 3 Days</span>
          </div>
          {/* TRACKING BAR */}
          <div className="h-2 bg-gold-400/10 rounded-full overflow-hidden flex gap-1">
             <div className={`h-full flex-1 rounded-full ${step >= 1 ? "bg-gold-400" : "bg-transparent"}`} />
             <div className={`h-full flex-1 rounded-full ${step >= 2 ? "bg-gold-400" : "bg-transparent"}`} />
             <div className={`h-full flex-1 rounded-full ${step >= 3 ? "bg-gold-400" : "bg-transparent"}`} />
             <div className={`h-full flex-1 rounded-full ${step >= 4 ? "bg-gold-400" : "bg-transparent"}`} />
          </div>
          <p className="text-xs text-gray-500 font-medium italic">"{statusDesc}"</p>
       </div>

       <button className="w-full py-4 border border-gold-400/20 rounded-2xl text-xs font-bold text-gold-400 hover:bg-gold-400 hover:text-white transition-all">
          Track Live Shipment
       </button>
    </div>
  );
}
