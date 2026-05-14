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

  const { data: vStatusData } = useQuery({
    queryKey: ["seller-verification-status"],
    queryFn: async () => {
      const { data } = await api.get("/seller/verification/status");
      return data.status;
    },
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center font-display text-gold-400">Initializing Vault...</div>;

  const { stats, recentOrders, shopHealth } = dashboardData || {};
  const isVerified = vStatusData === 'APPROVED' || vStatusData === 'ACTIVE';
  const isPending = vStatusData === 'PENDING';
  const isRejected = vStatusData === 'REJECTED';
  const isIdentityVerified = vStatusData === 'IDENTITY_VERIFIED';

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 lg:py-24 space-y-8 md:space-y-12 pb-32">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
        <div className="space-y-2">
           <h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">Seller <span className="italic text-gold-400">Vault.</span></h1>
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Store Performance</p>
           </div>
        </div>
        <Link href="/seller/add-product" className="w-full md:w-auto h-14 md:h-16 px-8 md:px-10 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3">
           <Package className="w-5 h-5" /> List New Item
        </Link>
      </div>

      {/* STATS BENTO GRID - 2 columns on mobile */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <StatCard label="Total Revenue" value={`Rs. ${(stats?.totalEarnings || 0).toLocaleString()}`} trend={stats?.totalEarnings > 0 ? "+12.5%" : "Stable"} icon={<DollarSign />} primary />
        <StatCard label="Active Listings" value={stats?.activeProducts || 0} trend={stats?.activeProducts > 0 ? "+1" : "Empty"} icon={<ShoppingBag />} />
        <StatCard label="Pending Orders" value={stats?.pendingOrders || 0} trend={stats?.pendingOrders > 0 ? "Action Required" : "All Clear"} icon={<Clock />} />
        <StatCard label="Trust Score" value={`${(shopHealth?.rating || 5) * 20}%`} trend="Elite" icon={<Sparkles />} />
      </div>

      <div className="grid lg:grid-cols-3 gap-8 md:gap-12">
        
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
              {!isVerified && (
                <ActionItem 
                  icon={isPending ? <Clock className="text-gold-400" /> : (isIdentityVerified ? <Sparkles className="text-gold-400" /> : <AlertTriangle className="text-amber-500" />)} 
                  title={isPending ? "Verification Pending" : isRejected ? "Verification Rejected" : (isIdentityVerified ? "Identity Verified" : "Identity Verification")} 
                  desc={isPending ? "Our team is reviewing your documents. Usually takes 24-48h." : isRejected ? "Review the feedback and retry verification." : (isIdentityVerified ? "Identity scan complete! Now please upload your selfie to finish." : "Please upload your ID to unlock withdrawals.")}
                  action={isPending ? "Check Status" : (isIdentityVerified ? "Complete Selfie" : "Verify Now")}
                  link="/seller/verification"
                />
              )}
              <ActionItem 
                icon={<Clock className="text-gold-400" />} 
                title="Pending Balance" 
                desc={`Rs. ${stats?.pendingBalance?.toLocaleString()} will be released soon.`}
                action="Details"
                link="/seller/earnings"
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
      whileTap={{ scale: 0.98 }}
      className={`p-5 md:p-8 glass-ultra crystal-border rounded-3xl md:rounded-[40px] space-y-4 md:space-y-6 shadow-soft transition-all ${primary ? "bg-gold-400/5" : ""}`}
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
          <h3 className="text-xl md:text-3xl font-accent font-bold text-dark-900 dark:text-cream-50">{value}</h3>
       </div>
    </motion.div>
  );
}

function OrderRow({ id, item, price, status, time, urgent }: any) {
  return (
    <div className="p-4 md:p-6 glass-crystal crystal-border rounded-2xl md:rounded-3xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-gold-400/5 transition-all">
       <div className="flex items-center gap-4 md:gap-6 w-full sm:w-auto">
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center font-bold text-[10px] md:text-xs shrink-0 ${urgent ? "bg-amber-500/10 text-amber-500" : "bg-gold-400/10 text-gold-400"}`}>
             {id}
          </div>
          <div className="space-y-0.5 md:space-y-1 min-w-0 flex-1">
             <h4 className="font-bold text-sm md:text-base text-dark-900 dark:text-cream-50 truncate">{item}</h4>
             <p className="text-[10px] md:text-xs text-gray-500">{time} • <span className={urgent ? "text-amber-500 font-bold" : "font-medium"}>{status}</span></p>
          </div>
       </div>
        <div className="flex items-center justify-between sm:justify-end gap-4 md:gap-6 w-full sm:auto pt-2 sm:pt-0 border-t sm:border-0 border-gold-400/5">
          <span className="text-base md:text-lg font-accent font-bold text-gold-400">{price}</span>
          <Link href="/seller/orders" className="w-10 h-10 rounded-xl glass-ultra crystal-border flex items-center justify-center opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all active:scale-90" aria-label="View Order Details">
             <ArrowUpRight className="w-5 h-5 text-gold-400" />
          </Link>
        </div>
    </div>
  );
}

function ActionItem({ icon, title, desc, action, link }: any) {
  return (
    <div className="p-5 md:p-6 glass-crystal crystal-border rounded-2xl md:rounded-3xl flex gap-4 md:gap-6 items-start">
       <div className="shrink-0 pt-1 text-gold-400">{icon}</div>
       <div className="space-y-3">
          <div className="space-y-1">
             <h4 className="text-sm font-bold text-dark-900 dark:text-cream-50">{title}</h4>
             <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
          </div>
          {link ? (
            <Link href={link} className="text-[10px] font-bold text-gold-400 uppercase tracking-widest hover:underline block">
              {action}
            </Link>
          ) : (
            <button className="text-[10px] font-bold text-gold-400 uppercase tracking-widest hover:underline">{action}</button>
          )}
       </div>
    </div>
  );
}
