"use client";

import { motion } from "framer-motion";
import { 
  ShoppingBag, 
  TrendingUp, 
  Users, 
  DollarSign, 
  Package, 
  Clock, 
  CheckCircle2, 
  AlertTriangle,
  ChevronRight,
  ArrowUpRight,
  Sparkles
} from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function SellerDashboard() {
  const { user } = useAuthStore();

  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["seller-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/seller/stats");
      return data;
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center font-display text-gold-400">Initializing Vault...</div>;

  const { stats, recentOrders, shopHealth } = dashboardData || {};

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 lg:py-24 space-y-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
           <h1 className="text-5xl font-display font-bold text-dark-900 dark:text-cream-50">Seller <span className="italic text-gold-400">Vault.</span></h1>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Store Performance</p>
           </div>
        </div>
        <Link href="/seller/add-product" className="h-16 px-10 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all flex items-center gap-3">
           <Package className="w-5 h-5" /> List New Item
        </Link>
      </div>

      {/* STATS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Total Revenue" value={`Rs. ${(stats?.totalEarnings || 0).toLocaleString()}`} trend={stats?.totalEarnings > 0 ? "+12.5%" : "Stable"} icon={<DollarSign />} primary />
        <StatCard label="Active Listings" value={stats?.activeProducts || 0} trend={stats?.activeProducts > 0 ? "+1" : "Empty"} icon={<ShoppingBag />} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders || 0} trend={stats?.pendingOrders > 0 ? "Action Required" : "All Clear"} icon={<Clock />} />
        <StatCard label="Trust Score" value={`${(shopHealth?.rating || 5) * 20}%`} trend="Elite" icon={<Sparkles />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* RECENT ORDERS - LEFT */}
        <div className="lg:col-span-2 space-y-8">
           <div className="flex items-center justify-between">
              <h2 className="text-2xl font-display font-bold">Recent Orders</h2>
              <Link href="/seller/orders" className="text-xs font-bold text-gold-400 hover:underline flex items-center gap-2">
                 View All <ChevronRight className="w-4 h-4" />
              </Link>
           </div>

           <div className="space-y-4">
              {recentOrders && recentOrders.length > 0 ? (
                recentOrders.map((order: any) => (
                  <OrderRow 
                    key={order.id}
                    id={`#${order.id.slice(0, 4)}`} 
                    item={order.product?.title || "Luxury Item"} 
                    price={`Rs. ${order.totalPrice?.toLocaleString()}`} 
                    status={order.status} 
                    time={new Date(order.createdAt).toLocaleDateString()}
                    urgent={order.status === 'PAID'}
                  />
                ))
              ) : (
                <div className="p-12 text-center bg-white/5 rounded-[40px] border border-dashed border-gold-400/20">
                   <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest">No Recent Activity</p>
                </div>
              )}
           </div>
        </div>

        {/* NOTIFICATIONS & TIPS - RIGHT */}
        <div className="space-y-8">
           <h2 className="text-2xl font-display font-bold">Action Center</h2>
           <div className="space-y-4">
              {!user?.isVerified && (
                <ActionItem 
                  icon={<AlertTriangle className="text-amber-500" />} 
                  title="Identity Verification" 
                  desc="Please upload your ID to unlock withdrawals."
                  action="Verify Now"
                />
              )}
              <ActionItem 
                icon={<Clock className="text-gold-400" />} 
                title="Pending Balance" 
                desc={`Rs. ${stats?.pendingBalance?.toLocaleString()} will be released soon.`}
                action="Details"
              />
              <div className="p-8 glass-ultra crystal-border rounded-[32px] bg-gold-400 text-white space-y-4">
                 <Sparkles className="w-8 h-8" />
                 <h3 className="text-xl font-bold font-display">Seller Tip</h3>
                 <p className="text-xs leading-relaxed opacity-90">Adding a "Seller Honesty Note" increases conversion by 40% on preloved items.</p>
              </div>
           </div>
        </div>

      </div>

    </div>
  );
}

function StatCard({ label, value, trend, icon, primary }: any) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className={`p-8 glass-ultra crystal-border rounded-[40px] space-y-6 shadow-soft transition-all ${primary ? "bg-gold-400/5" : ""}`}
    >
       <div className="flex justify-between items-start">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${primary ? "bg-gold-400 text-white shadow-gold" : "bg-gold-400/10 text-gold-400"}`}>
             {icon}
          </div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend.startsWith('+') ? "bg-emerald-500/10 text-emerald-500" : "bg-gold-400/10 text-gold-400"}`}>
             {trend}
          </span>
       </div>
       <div className="space-y-1">
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</p>
          <h3 className="text-3xl font-accent font-bold text-dark-900 dark:text-cream-50">{value}</h3>
       </div>
    </motion.div>
  );
}

function OrderRow({ id, item, price, status, time, urgent }: any) {
  return (
    <div className="p-6 glass-crystal crystal-border rounded-3xl flex items-center justify-between group hover:bg-gold-400/5 transition-all">
       <div className="flex items-center gap-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xs ${urgent ? "bg-amber-500/10 text-amber-500" : "bg-gold-400/10 text-gold-400"}`}>
             {id}
          </div>
          <div className="space-y-1">
             <h4 className="font-bold text-dark-900 dark:text-cream-50">{item}</h4>
             <p className="text-xs text-gray-500">{time} • <span className={urgent ? "text-amber-500 font-bold" : "font-medium"}>{status}</span></p>
          </div>
       </div>
       <div className="text-right flex items-center gap-6">
          <span className="text-lg font-accent font-bold text-gold-400">{price}</span>
          <button className="w-10 h-10 rounded-xl glass-ultra crystal-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
             <ArrowUpRight className="w-5 h-5 text-gold-400" />
          </button>
       </div>
    </div>
  );
}

function ActionItem({ icon, title, desc, action }: any) {
  return (
    <div className="p-6 glass-crystal crystal-border rounded-3xl flex gap-6 items-start">
       <div className="shrink-0 pt-1">{icon}</div>
       <div className="space-y-3">
          <div className="space-y-1">
             <h4 className="text-sm font-bold text-dark-900 dark:text-cream-50">{title}</h4>
             <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
          <button className="text-[10px] font-bold text-gold-400 uppercase tracking-widest hover:underline">{action}</button>
       </div>
    </div>
  );
}
