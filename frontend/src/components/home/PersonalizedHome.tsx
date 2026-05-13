"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { 
  Sparkles, 
  ArrowRight, 
  ShoppingBag, 
  Heart, 
  Clock, 
  LayoutDashboard, 
  Plus, 
  TrendingUp, 
  Package, 
  Coins,
  ShieldCheck,
  Zap,
  Star,
  Users
} from "lucide-react";

export function CustomerHome({ user }: { user: any }) {
  const { data: products } = useQuery({
    queryKey: ["home-featured-products"],
    queryFn: async () => {
      const { data } = await api.get("/products?limit=4");
      return data.products || [];
    }
  });

  const { data: wishlist } = useQuery({
    queryKey: ["customer-wishlist-count"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data;
    },
    enabled: !!user
  });
  const { data: vStatus } = useQuery({
    queryKey: ["seller-verification-status"],
    queryFn: async () => {
      const { data } = await api.get("/seller/verification/status");
      return data;
    }
  });

  const isPending = vStatus?.status === 'PENDING' || vStatus?.status === 'SELFIE_UPLOADED';

  return (
    <div className="space-y-20 py-20">
      {/* 🔮 NEURAL GREETING */}
      <section className="px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto"
        >
          <h1 className="text-5xl lg:text-7xl font-display font-bold text-dark-900 dark:text-cream-50 leading-tight">
            Welcome back, <span className="text-gold-400 italic">{user.name.split(' ')[0]}.</span><br />
            The vault is <span className="relative">
              curated
              <motion.span 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -top-2 -right-6 w-8 h-8 bg-gold-400/20 blur-xl rounded-full"
              />
            </span> for you.
          </h1>
          <p className="mt-6 text-xl text-dark-700/60 dark:text-cream-50/60 max-w-2xl">
            Our AI has analyzed the latest luxury drops. Here is what matches your style profile today.
          </p>
        </motion.div>
      </section>

      {/* 🍱 BENTO DISCOVERY GRID */}
      <section className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Card 1: New Drops */}
          <div className="md:col-span-2 h-[400px] glass-ultra crystal-border rounded-[48px] p-10 flex flex-col justify-between group overflow-hidden relative shadow-gold-3d">
             <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4 text-gold-400">
                   <Zap className="w-5 h-5 fill-gold-400" />
                   <span className="text-[10px] font-bold uppercase tracking-[0.4em]">Live Drops</span>
                </div>
                <h3 className="text-3xl font-display font-bold">New arrivals in <br/><span className="text-gold-400 italic">Preloved Luxury</span></h3>
             </div>
             <div className="relative z-10 flex items-center justify-between">
                <Link href="/products" className="w-14 h-14 rounded-2xl bg-gold-400 text-white flex items-center justify-center hover:scale-110 transition-transform shadow-gold">
                   <ArrowRight className="w-6 h-6" />
                </Link>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Real-time Verified Updates</span>
             </div>
             <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 group-hover:opacity-40 transition-opacity">
                <Image 
                  src="https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?auto=format&fit=crop&q=80&w=600" 
                  alt="New Drops"
                  fill
                  className="object-cover"
                />
             </div>
          </div>

          {/* Card 2: Wishlist Pulse */}
          <div className="h-[400px] glass-ultra crystal-border rounded-[48px] p-8 flex flex-col justify-between shadow-soft">
             <div className="w-12 h-12 rounded-2xl bg-pink-500/10 text-pink-500 flex items-center justify-center">
                <Heart className="w-6 h-6 fill-pink-500/20" />
             </div>
             <div className="space-y-4">
                <h4 className="text-xl font-bold">Your <br/>Wishlist</h4>
                <p className="text-xs text-gray-500 leading-relaxed">Stay updated on price drops for your curated favorites.</p>
                <Link href="/customer/wishlist" className="text-xs font-bold text-gold-400 uppercase tracking-widest hover:gap-3 transition-all flex items-center gap-2">View List <ArrowRight className="w-3 h-3" /></Link>
             </div>
          </div>

          {/* Card 3: AI Style Match */}
          <div className="h-[400px] bg-dark-900 rounded-[48px] p-8 flex flex-col justify-between text-white shadow-2xl relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-transparent" />
             <div className="relative z-10 w-12 h-12 rounded-2xl bg-gold-400 flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
             </div>
             <div className="relative z-10 space-y-4">
                <h4 className="text-xl font-display font-bold">AI Match <br/>of the Day</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed uppercase tracking-widest font-bold">98% Style Affinity</p>
                <div className="w-full h-24 bg-white/5 rounded-2xl border border-white/10 p-3 flex items-center gap-4">
                   <div className="w-16 h-16 rounded-xl bg-white/10 shrink-0" />
                   <div className="space-y-1">
                      <div className="h-2 w-20 bg-gold-400/40 rounded-full" />
                      <div className="h-2 w-12 bg-white/20 rounded-full" />
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🛍️ FEATURED LUXURY ITEMS */}
      <section className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12">
            <div className="space-y-2">
              <h2 className="text-4xl font-display font-bold">Live <span className="text-gold-400 italic">Marketplace.</span></h2>
              <p className="text-sm text-gray-500">Real items currently available in the vault.</p>
            </div>
            <Link href="/products" className="text-gold-400 font-bold hover:underline flex items-center gap-2">View All <ArrowRight className="w-4 h-4" /></Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             {products?.map((product: any) => (
               <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="aspect-[3/4] glass-ultra crystal-border rounded-[32px] overflow-hidden relative mb-6">
                     <Image 
                       src={product.images?.[0] || 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000'} 
                       alt={product.title}
                       fill
                       className="object-cover group-hover:scale-110 transition-transform duration-700"
                     />
                     <div className="absolute top-4 right-4 z-10">
                        <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
                           <Heart className="w-5 h-5" />
                        </button>
                     </div>
                  </div>
                  <div className="space-y-2 px-2">
                     <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{product.category}</p>
                     <h3 className="font-bold text-dark-900 dark:text-cream-50 group-hover:text-gold-400 transition-colors line-clamp-1">{product.title}</h3>
                     <p className="text-lg font-display font-bold">Rs. {(product.sellingPrice || 0).toLocaleString()}</p>
                  </div>
               </Link>
             ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export function SellerHome({ user }: { user: any }) {
  const { data: statsData } = useQuery({
    queryKey: ["seller-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/seller/stats");
      return data;
    }
  });

  const { data: vStatus } = useQuery({
    queryKey: ["seller-verification-status"],
    queryFn: async () => {
      const { data } = await api.get("/seller/verification/status");
      return data;
    }
  });

  const stats = statsData?.stats || {};
  const shopHealth = statsData?.shopHealth || {};

  return (
    <div className="space-y-20 py-20 bg-mesh/5">
      {/* 🚀 MERCHANT PULSE */}
      <section className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Live Shop Status
              </div>
              <h1 className="text-5xl lg:text-7xl font-display font-bold text-dark-900 dark:text-cream-50">Boutique <span className="text-gold-400 italic">Overview.</span></h1>
            </div>
            <div className="flex flex-wrap gap-4">
               <Link href="/seller/explore" className="px-8 py-4 bg-dark-900 text-white dark:bg-cream-50 dark:text-dark-900 rounded-2xl font-bold shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                  <ShoppingBag className="w-5 h-5" /> Explore Market
               </Link>
               <Link href="/seller/add-product" className="px-8 py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center gap-2 hover:scale-105 active:scale-95 transition-all">
                  <Plus className="w-5 h-5" /> List New Item
               </Link>
               <Link href="/seller/dashboard" className="px-8 py-4 glass-ultra crystal-border rounded-2xl font-bold flex items-center gap-2 hover:bg-gold-400/5 transition-all">
                  <LayoutDashboard className="w-5 h-5" /> Full Vault
               </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <PulseCard label="Total Earnings" value={`Rs. ${(stats.totalEarnings || 0).toLocaleString()}`} icon={<Coins />} trend="Available Balance" />
             <PulseCard label="Pending Orders" value={stats.pendingOrders || "0"} icon={<Package />} trend="Requires Attention" color="text-gold-400" />
             <PulseCard label="Active Items" value={stats.activeProducts || "0"} icon={<ShoppingBag />} trend="In Marketplace" />
             <PulseCard label="Shop Rating" value={shopHealth.rating || "5.0"} icon={<Star />} trend="Merchant Standing" />
          </div>
        </div>
      </section>

      {/* 🍱 SELLER INSIGHTS (BENTO) */}
      <section className="px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: AI Price Optimizer */}
          <div className="md:col-span-2 h-[350px] bg-dark-900 rounded-[48px] p-10 flex flex-col justify-between text-white relative overflow-hidden shadow-2xl">
             <div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 to-transparent" />
             <div className="relative z-10 flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-400 flex items-center justify-center">
                   <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                   <h4 className="text-2xl font-display font-bold text-white">Merchant Intelligence</h4>
                   <p className="text-[10px] text-gold-200/80 uppercase tracking-[0.2em] font-bold">Neural Market Analysis</p>
                </div>
             </div>
             <div className="relative z-10">
                <p className="text-lg text-gray-300 max-w-lg mb-8">
                  Your store is performing at <span className="text-gold-400 font-bold">{shopHealth.responseRate || '100%'} response rate</span>. High responsiveness increases your chances of a featured spot in the marketplace.
                </p>
                <Link href="/seller/dashboard" className="px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-xs font-bold transition-all inline-block">View Full Analytics</Link>
             </div>
          </div>

          {/* Card 2: Quick Action */}
          <div className="h-[350px] glass-ultra crystal-border rounded-[48px] p-10 flex flex-col justify-between shadow-gold-3d">
             <div className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
             </div>
             <div className="space-y-4">
                <h4 className="text-2xl font-display font-bold">Identity <br/>Vault</h4>
                <p className="text-sm text-gray-500">
                  Status: <b className="capitalize">{vStatus?.status?.replace('_', ' ') || 'Checking...'}</b>
                </p>
                <Link href="/seller/verification" className="w-12 h-12 rounded-full border border-gold-400/20 flex items-center justify-center text-gold-400 hover:bg-gold-400 hover:text-white transition-all">
                   <ArrowRight className="w-5 h-5" />
                </Link>
             </div>
          </div>
        </div>
      </section>

      {/* 📦 ACTION CENTER */}
      <section className="px-6 lg:px-8 pb-10">
        <div className="max-w-7xl mx-auto glass-ultra crystal-border rounded-[48px] p-12 shadow-soft">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50">Action <span className="text-gold-400 italic">Center.</span></h3>
          </div>
          
          <div className="space-y-6">
             {stats.pendingOrders > 0 ? (
               <ActionItem 
                 icon={<Package className="text-gold-400" />} 
                 title="Orders Awaiting Shipment" 
                 desc={`You have ${stats.pendingOrders} orders that need to be processed.`} 
                 action="View Orders" 
                 href="/seller/orders"
               />
             ) : (
               <div className="p-8 text-center glass-crystal crystal-border rounded-3xl opacity-50">
                  <p className="text-sm font-bold uppercase tracking-widest text-gray-400">No pending actions. You're all caught up! ✨</p>
               </div>
             )}
          </div>
        </div>
      </section>

      {/* 🌍 MARKETPLACE DISCOVERY FOR SELLERS */}
      <section className="px-6 lg:px-8 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-12 border-t border-gold-400/10 pt-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-500/10 text-blue-500 rounded-full text-[10px] font-bold uppercase tracking-widest">
                Marketplace Pulse
              </div>
              <h2 className="text-4xl font-display font-bold text-dark-900 dark:text-cream-50">Explore the <span className="text-gold-400 italic">Vault.</span></h2>
              <p className="text-sm text-gray-500 max-w-md">See what other elite sellers are listing and find your next premium piece.</p>
            </div>
            <Link href="/products" className="group flex items-center gap-3 text-gold-400 font-bold hover:gap-5 transition-all">
              Explore All <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
             <MarketplaceGrid />
          </div>
        </div>
      </section>
    </div>
  );
}

function MarketplaceGrid() {
  const { data: products } = useQuery({
    queryKey: ["seller-marketplace-discovery"],
    queryFn: async () => {
      const { data } = await api.get("/products?limit=4");
      return data.products || [];
    }
  });

  if (!products) return <div className="col-span-4 h-40 animate-pulse bg-gray-100 rounded-3xl" />;

  return (
    <>
      {products.map((product: any) => (
        <Link href={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
          <div className="aspect-[3/4] glass-ultra crystal-border rounded-[32px] overflow-hidden relative mb-6">
            <Image 
              src={product.images?.[0] || 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000'} 
              alt={product.title}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-700"
            />
            <div className="absolute top-4 right-4 z-10">
              <button className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="space-y-2 px-2">
            <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{product.category}</p>
            <h3 className="font-bold text-dark-900 dark:text-cream-50 group-hover:text-gold-400 transition-colors line-clamp-1">{product.title}</h3>
            <p className="text-lg font-display font-bold">Rs. {(product.sellingPrice || 0).toLocaleString()}</p>
          </div>
        </Link>
      ))}
    </>
  );
}

function PulseCard({ label, value, icon, trend, color = "text-dark-900 dark:text-cream-50" }: any) {
  return (
    <div className="glass-ultra crystal-border p-8 rounded-[40px] space-y-4 shadow-soft hover:shadow-gold-3d transition-all">
       <div className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center">
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
          <p className={`text-3xl font-display font-bold ${color}`}>{value}</p>
          <p className="text-[10px] font-bold text-gold-400/60 mt-2 italic">{trend}</p>
       </div>
    </div>
  );
}

function ActionItem({ icon, title, desc, action, href }: any) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between p-6 glass-crystal crystal-border rounded-3xl gap-6">
       <div className="flex items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shadow-inner">
             {icon}
          </div>
          <div className="space-y-1">
             <h4 className="font-bold text-dark-900 dark:text-cream-50">{title}</h4>
             <p className="text-sm text-gray-500">{desc}</p>
          </div>
       </div>
       <Link href={href} className="px-6 py-3 border border-gold-400/20 rounded-xl text-xs font-bold text-gold-400 hover:bg-gold-400 hover:text-white transition-all text-center">
          {action}
       </Link>
    </div>
  );
}
