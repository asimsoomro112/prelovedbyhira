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
  ChevronRight,
  Leaf,
  Droplets,
  CloudRain,
  Sparkles,
  MessageSquare,
  Compass,
  Zap,
  Tag
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import Image from "next/image";

export default function CustomerDashboard() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["customer-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/users/dashboard");
      return data;
    }
  });

  if (isLoading) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-4">
       <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
       <p className="font-display text-gold-400 font-bold uppercase tracking-[0.2em] text-xs">Opening your Vault...</p>
    </div>
  );

  const { stats, activeOrders } = dashboardData || {};

  // Sustainability Logic (Real-time calculation for UI)
  const carbonOffset = Math.round((stats?.totalSpent / 1000) * 2.5);
  const waterSaved = Math.round((stats?.totalSpent / 1000) * 150);

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 lg:py-24 space-y-20 pb-32">
      
      {/* 👑 PREMIUM WELCOME HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
        <div className="space-y-4">
           <div className="flex items-center gap-3 text-gold-400 font-bold text-[10px] uppercase tracking-[0.4em]">
              <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse" />
              Authenticated Member
           </div>
           <h1 className="text-6xl lg:text-8xl font-display font-bold text-dark-900 dark:text-cream-50 leading-none">
              Hello, <br />
              <span className="italic text-gold-400">{user?.name.split(' ')[0]}.</span>
           </h1>
        </div>
        
        <div className="flex flex-wrap gap-4">
           <Link href="/customer/wishlist" className="flex items-center gap-3 px-6 py-4 glass-ultra crystal-border rounded-2xl hover:bg-gold-400/5 transition-all group">
              <Heart className="w-5 h-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              <div className="text-left">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Wishlist</p>
                 <p className="text-sm font-bold">{stats?.wishlistCount} Items</p>
              </div>
           </Link>
           <Link href="/customer/profile" className="flex items-center gap-3 px-6 py-4 glass-ultra crystal-border rounded-2xl hover:bg-gold-400/5 transition-all group">
              <Settings className="w-5 h-5 text-gray-400 group-hover:text-gold-400 transition-colors" />
              <div className="text-left">
                 <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Vault</p>
                 <p className="text-sm font-bold">Settings</p>
              </div>
           </Link>
        </div>
      </div>

      {/* 🌍 NEURAL SUSTAINABILITY IMPACT */}
      <div className="grid md:grid-cols-3 gap-6">
         <div className="md:col-span-2 p-10 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-[48px] border border-emerald-500/20 relative overflow-hidden group">
            <Leaf className="absolute -right-10 -bottom-10 w-64 h-64 text-emerald-500/5 rotate-12 group-hover:scale-110 transition-transform duration-1000" />
            <div className="relative z-10 space-y-8">
               <div className="space-y-2">
                  <h2 className="text-3xl font-display font-bold text-emerald-600 dark:text-emerald-400">Earth Impact Score</h2>
                  <p className="text-sm text-gray-500 max-w-md">By choosing preloved luxury, you've significantly reduced the fashion industry's footprint.</p>
               </div>
               <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-emerald-500 mb-2">
                        <CloudRain className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Carbon Offset</span>
                     </div>
                     <p className="text-4xl font-accent font-bold text-emerald-600 dark:text-emerald-400">{carbonOffset}kg <span className="text-sm font-medium opacity-60">CO2</span></p>
                  </div>
                  <div className="space-y-1">
                     <div className="flex items-center gap-2 text-teal-500 mb-2">
                        <Droplets className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Water Saved</span>
                     </div>
                     <p className="text-4xl font-accent font-bold text-teal-600 dark:text-teal-400">{waterSaved.toLocaleString()}L <span className="text-sm font-medium opacity-60">H2O</span></p>
                  </div>
               </div>
            </div>
         </div>

         <div className="p-10 bg-gold-400 rounded-[48px] text-white space-y-6 flex flex-col justify-between shadow-gold-3d">
            <div className="space-y-4">
               <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6" />
               </div>
               <h3 className="text-2xl font-display font-bold leading-tight">Neural <br />Concierge</h3>
               <p className="text-xs opacity-80 leading-relaxed">Ask Hira AI about your orders, product authenticity, or styling advice.</p>
            </div>
            <Link href="/chat" className="h-14 bg-white text-gold-400 rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-cream-50 transition-all">
               <MessageSquare className="w-4 h-4" /> Start Neural Chat
            </Link>
         </div>
      </div>

      {/* 🛒 QUICK NAVIGATION & STATS */}
      <div className="grid lg:grid-cols-4 gap-8">
         <div className="lg:col-span-3 grid md:grid-cols-3 gap-6">
            <QuickStat label="Active Orders" value={stats?.activeOrdersCount || 0} icon={<Package />} />
            <QuickStat label="Style Points" value={stats?.stylePoints || 0} icon={<CheckCircle2 />} />
            <QuickStat label="Total Value" value={`Rs. ${stats?.totalSpent?.toLocaleString()}`} icon={<ShoppingBag />} />
         </div>
         <div className="bg-dark-900 rounded-[32px] p-8 flex flex-col justify-center items-center text-center space-y-4">
             <Compass className="w-8 h-8 text-gold-400" />
             <p className="text-xs font-bold text-white uppercase tracking-widest">Explore Luxury</p>
             <Link href="/products" className="text-gold-400 text-[10px] font-bold hover:underline flex items-center gap-2">
                SHOP ALL COLLECTIONS <ArrowRight className="w-3 h-3" />
             </Link>
         </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-16">
         
         {/* ACTIVE ORDERS SECTION */}
         <div className="lg:col-span-2 space-y-10">
            <div className="flex items-center justify-between">
               <div>
                  <h2 className="text-3xl font-display font-bold">In-Transit</h2>
                  <p className="text-xs text-gray-500 mt-1">Your items currently moving through the vault.</p>
               </div>
               <Link href="/customer/orders" className="px-6 py-3 bg-cream-50 dark:bg-dark-900 rounded-xl text-[10px] font-bold text-gray-500 hover:text-gold-400 transition-all">
                  Full History
               </Link>
            </div>

            <div className="space-y-8">
               {activeOrders && activeOrders.length > 0 ? (
                 activeOrders.map((order: any) => (
                   <OrderCard 
                     key={order.id}
                     order={order}
                   />
                 ))
               ) : (
                 <div className="p-20 text-center bg-cream-50 dark:bg-dark-900/50 rounded-[64px] border-2 border-dashed border-gold-400/10 space-y-6">
                    <ShoppingBag className="w-16 h-16 text-gold-400/20 mx-auto" />
                    <div className="space-y-2">
                       <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">No Active Orders</p>
                       <p className="text-xs text-gray-500 max-w-[200px] mx-auto">Your vault is ready for new additions. Explore our latest luxury drops.</p>
                    </div>
                    <Link href="/products" className="inline-flex items-center gap-3 px-10 py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all">
                       Explore Shop <Zap className="w-4 h-4" />
                    </Link>
                 </div>
               )}
            </div>
         </div>

         {/* CURATED FOR YOU / SHOP LINKS */}
         <div className="space-y-12">
            <div className="space-y-8">
               <h2 className="text-3xl font-display font-bold">Luxury Guide</h2>
               <div className="grid gap-4">
                  <ShopCategoryLink icon={<Tag />} label="New Arrivals" color="gold" href="/products?sort=newest" />
                  <ShopCategoryLink icon={<Zap />} label="Flash Sales" color="red" href="/products?onSale=true" />
                  <ShopCategoryLink icon={<ShoppingBag />} label="Designer Bags" color="blue" href="/products?category=handbags" />
                  <ShopCategoryLink icon={<Sparkles />} label="Jewelry Vault" color="emerald" href="/products?category=jewelry" />
               </div>
            </div>

            <div className="p-10 glass-ultra crystal-border rounded-[48px] bg-dark-900 text-white space-y-8 overflow-hidden relative">
               <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/20 blur-[60px] rounded-full" />
               <div className="relative z-10 space-y-6">
                  <div className="space-y-2">
                     <h3 className="text-2xl font-display font-bold">Invite & Earn</h3>
                     <p className="text-xs text-gray-400 leading-relaxed">Share the luxury with friends and get Rs. 500 Style Points on their first purchase.</p>
                  </div>
                  <button className="w-full h-14 bg-white/10 hover:bg-white/20 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-bold transition-all">
                     Get Referral Link <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
            </div>
         </div>

      </div>

    </div>
  );
}

function QuickStat({ label, value, icon }: any) {
  return (
    <div className="p-10 glass-ultra crystal-border rounded-[40px] space-y-6 shadow-soft hover:border-gold-400/30 transition-all bg-white dark:bg-dark-900">
       <div className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center">
          {icon}
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</p>
          <h3 className="text-3xl font-accent font-bold text-dark-900 dark:text-cream-50">{value}</h3>
       </div>
    </div>
  );
}

function ShopCategoryLink({ icon, label, color, href }: any) {
  const colorMap: any = {
    gold: "text-gold-400 bg-gold-400/10",
    red: "text-red-400 bg-red-400/10",
    blue: "text-blue-400 bg-blue-400/10",
    emerald: "text-emerald-400 bg-emerald-400/10"
  };

  return (
    <Link href={href} className="flex items-center justify-between p-6 glass-ultra crystal-border rounded-3xl hover:bg-gold-400/5 transition-all group">
       <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorMap[color]}`}>
             {icon}
          </div>
          <span className="text-sm font-bold group-hover:text-gold-400 transition-colors">{label}</span>
       </div>
       <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-gold-400 group-hover:translate-x-1 transition-all" />
    </Link>
  );
}

function OrderCard({ order }: any) {
  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'PAID': return { label: 'In Queue', step: 1, desc: 'Admin has verified your payment. Seller is preparing for shipment.' };
      case 'SHIPPED': return { label: 'On the Way', step: 3, desc: 'Your luxury item is moving through the courier network.' };
      case 'DELIVERED': return { label: 'Arrival', step: 4, desc: 'Package delivered. Please confirm receipt to release funds.' };
      default: return { label: 'Pending', step: 0, desc: 'Awaiting neural payment audit.' };
    }
  };

  const info = getStatusInfo(order.status);

  return (
    <div className="p-10 glass-ultra crystal-border rounded-[48px] space-y-10 group hover:bg-gold-400/5 transition-all shadow-soft bg-white dark:bg-dark-900">
       <div className="flex flex-col md:flex-row justify-between gap-6">
          <div className="flex gap-6">
             <div className="relative w-24 h-24 rounded-3xl overflow-hidden border border-gold-400/10 shrink-0">
                <Image 
                  src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000'} 
                  alt="Product" 
                  fill 
                  className="object-cover group-hover:scale-110 transition-transform duration-500" 
                />
             </div>
             <div className="space-y-2">
                <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">#ORD-{order.id.slice(-8).toUpperCase()}</p>
                <h4 className="text-2xl font-display font-bold">{order.product?.title}</h4>
                <div className="flex items-center gap-2">
                   <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-500" />
                   </div>
                   <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Escrow Protected</span>
                </div>
             </div>
          </div>
          <div className="md:text-right">
             <p className="text-3xl font-accent font-bold text-gold-400">Rs. {order.totalPrice?.toLocaleString()}</p>
             <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">Free Luxury Shipping</p>
          </div>
       </div>

       <div className="space-y-8">
          <div className="flex items-center justify-between">
             <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gold-400 text-white rounded-xl flex items-center justify-center shadow-gold">
                   <Truck className="w-5 h-5" />
                </div>
                <div>
                   <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Status</p>
                   <p className="text-sm font-bold">{info.label}</p>
                </div>
             </div>
             <div className="text-right">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Delivery ETA</p>
                <p className="text-sm font-bold">3-5 Working Days</p>
             </div>
          </div>

          <div className="h-2 bg-gold-400/10 rounded-full overflow-hidden flex gap-1.5">
             {[1, 2, 3, 4].map((s) => (
               <div key={s} className={`h-full flex-1 rounded-full transition-all duration-700 ${info.step >= s ? "bg-gold-400 shadow-gold" : "bg-transparent"}`} />
             ))}
          </div>
          <p className="text-xs text-gray-500 font-medium italic bg-gold-400/5 p-4 rounded-2xl border border-gold-400/10">"{info.desc}"</p>
       </div>

       <div className="flex gap-4">
          <Link href={`/customer/orders`} className="flex-1 py-5 bg-dark-900 text-white rounded-3xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-all">
             Track Details
          </Link>
          <button className="flex-1 py-5 border-2 border-gold-400 text-gold-400 rounded-3xl font-bold flex items-center justify-center gap-2 hover:bg-gold-400/5 transition-all">
             Contact Support
          </button>
       </div>
    </div>
  );
}
