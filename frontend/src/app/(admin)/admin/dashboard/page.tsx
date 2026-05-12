"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Store, 
  ArrowUpRight, 
  ChevronRight,
  Clock,
  FileText
} from "lucide-react";
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from 'recharts';
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

const MOCK_DATA = [
  { name: 'Mon', sales: 4000 },
  { name: 'Tue', sales: 3000 },
  { name: 'Wed', sales: 2000 },
  { name: 'Thu', sales: 2780 },
  { name: 'Fri', sales: 1890 },
  { name: 'Sat', sales: 2390 },
  { name: 'Sun', sales: 3490 },
];

export default function AdminDashboard() {
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: async () => {
      const { data } = await api.get("/admin/stats");
      return data;
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  const { stats, recentOrders, topSellers } = dashboardData || {};

  return (
    <div className="p-4 lg:p-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Admin Central</h1>
          <p className="text-gray-500">System overview and growth metrics for PrelovedByHira.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-6 py-3 bg-white dark:bg-dark-800 border border-gold-400/10 rounded-pill font-bold text-sm shadow-soft">Download Report</button>
          <button className="px-6 py-3 bg-gold-400 text-white rounded-pill font-bold text-sm shadow-gold" onClick={() => window.location.reload()}>Refresh Data</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <AdminStatCard label="Total Users" value={stats?.users?.toLocaleString()} change="Active" icon={<Users className="w-6 h-6" />} color="bg-blue-500" />
        <AdminStatCard label="Total Sellers" value={stats?.sellers?.toLocaleString()} change="Verified" icon={<Store className="w-6 h-6" />} color="bg-purple-500" />
        <AdminStatCard label="Active Products" value={stats?.products?.toLocaleString()} change="Live" icon={<ShoppingBag className="w-6 h-6" />} color="bg-gold-400" />
        <AdminStatCard label="Total Revenue" value={`Rs. ${stats?.sales?.toLocaleString()}`} change="Real-time" icon={<TrendingUp className="w-6 h-6" />} color="bg-emerald-500" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-dark-800 p-8 rounded-[40px] shadow-soft border border-gold-400/5 space-y-8 text-dark-900 dark:text-white">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-display font-bold">Revenue Overview</h2>
              <select className="bg-cream-50 dark:bg-dark-900 px-4 py-2 rounded-xl text-xs font-bold outline-none border border-gold-400/10">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={MOCK_DATA}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C4A35A" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C4A35A" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#88888810" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#888' }} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 40px -10px rgba(196,163,90,0.2)' }}
                    itemStyle={{ fontSize: '12px', fontWeight: 'bold', color: '#C4A35A' }}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#C4A35A" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-dark-800 rounded-[40px] shadow-soft border border-gold-400/5 overflow-hidden text-dark-900 dark:text-white">
             <div className="p-8 flex items-center justify-between border-b border-gold-400/10">
                <h2 className="text-xl font-display font-bold">Recent Orders</h2>
                <Link href="/admin/orders" className="text-sm font-bold text-gold-400 hover:underline">View All</Link>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-cream-50 dark:bg-dark-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                    <tr>
                      <th className="px-8 py-6">Order ID</th>
                      <th className="px-8 py-6">Buyer</th>
                      <th className="px-8 py-6">Seller</th>
                      <th className="px-8 py-6">Amount</th>
                      <th className="px-8 py-6">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gold-400/10">
                     {recentOrders?.map((order: any) => (
                       <tr key={order.id} className="hover:bg-gold-400/5 transition-all group">
                         <td className="px-8 py-6">
                           <span className="text-sm font-bold text-gold-400">#{order.id.slice(0, 8)}</span>
                         </td>
                         <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center text-xs font-bold">
                                {order.buyer.name[0]}
                              </div>
                              <span className="text-sm font-medium">{order.buyer.name}</span>
                           </div>
                         </td>
                         <td className="px-8 py-6 text-sm font-medium">{order.product.seller.user.name}</td>
                         <td className="px-8 py-6 text-sm font-bold">Rs. {order.totalPrice.toLocaleString()}</td>
                         <td className="px-8 py-6">
                            <span className={`px-3 py-1 rounded-pill text-[10px] font-bold ${order.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                              {order.status}
                            </span>
                         </td>
                       </tr>
                     ))}
                  </tbody>
                </table>
             </div>
          </div>
        </div>

        {/* Top Sellers Sidebar */}
        <div className="space-y-6">
           <div className="bg-white dark:bg-dark-800 p-8 rounded-[40px] shadow-soft border border-gold-400/5 space-y-8 text-dark-900 dark:text-white">
              <h2 className="text-xl font-display font-bold">Top Sellers</h2>
              <div className="space-y-6">
                 {topSellers?.map((seller: any) => (
                   <div key={seller.id} className="flex items-center justify-between group cursor-pointer">
                      <div className="flex items-center gap-4">
                         <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/10 group-hover:border-gold-400 transition-all">
                            <Image src={seller.user.avatar || "/placeholder.jpg"} alt={seller.user.name} fill className="object-cover" />
                         </div>
                         <div>
                            <p className="text-sm font-bold">{seller.user.name}</p>
                            <p className="text-xs text-gray-500">{seller.rating}★ Rating</p>
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-sm font-bold text-emerald-500">Rs. {Number(seller.totalEarnings).toLocaleString()}</p>
                         <p className="text-[10px] text-gray-400 font-bold uppercase">Earned</p>
                      </div>
                   </div>
                 ))}
              </div>
              <Link href="/admin/sellers" className="block w-full py-4 border-2 border-gold-400/20 text-gold-400 text-center rounded-pill font-bold hover:bg-gold-400/10 transition-all text-sm">
                View All Sellers
              </Link>
           </div>

           {/* Quick Actions */}
           <div className="p-8 bg-dark-900 text-white rounded-[40px] shadow-gold-lg border border-gold-400/20 space-y-6">
              <h2 className="text-xl font-display font-bold text-gold-400">Global Alerts</h2>
              <div className="space-y-4">
                 <AdminAlert icon={<Clock className="w-4 h-4" />} label="New Verifications" href="/admin/sellers" />
                 <AdminAlert icon={<ShoppingBag className="w-4 h-4" />} label="Pending Payouts" href="/admin/payouts" />
                 <AdminAlert icon={<FileText className="w-4 h-4" />} label="Active Disputes" color="text-red-400" href="/admin/disputes" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function AdminStatCard({ label, value, change, icon, color }: any) {
  return (
    <motion.div 
      whileHover={{ y: -4 }}
      className="bg-white dark:bg-dark-800 p-8 rounded-[32px] shadow-soft border border-gold-400/5 space-y-6 overflow-hidden relative group text-dark-900 dark:text-white"
    >
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center text-gold-400 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-3xl font-display font-bold">{value || "0"}</h3>
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 pt-2">
           <ArrowUpRight className="w-3 h-3" /> {change} <span className="text-gray-400 ml-1">Live Status</span>
        </div>
      </div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400 opacity-[0.02] rounded-full translate-x-12 -translate-y-12" />
    </motion.div>
  );
}

function AdminAlert({ icon, label, color = "text-gold-400", href = "#" }: any) {
  return (
    <Link href={href} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl group hover:bg-white/10 transition-all cursor-pointer">
       <div className="flex items-center gap-3">
          <div className={`${color} group-hover:scale-110 transition-transform`}>{icon}</div>
          <span className="text-xs font-bold text-gray-300">{label}</span>
       </div>
       <ChevronRight className="w-4 h-4 text-gray-600" />
    </Link>
  );
}
