"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownLeft, 
  History,
  Download,
  Filter,
  CreditCard
} from "lucide-react";
import api from "@/lib/api";

export default function SellerEarningsPage() {
  const { data: balance, isLoading: balanceLoading } = useQuery({
    queryKey: ["seller-balance"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/balance");
      return data;
    },
  });

  const { data: transactions, isLoading: transLoading } = useQuery({
    queryKey: ["seller-transactions"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/history");
      return data;
    },
  });

  return (
    <div className="p-4 lg:p-8 space-y-8 lg:space-y-12">
      <div className="space-y-1">
        <h1 className="text-3xl font-display font-bold">Earnings & Finances</h1>
        <p className="text-gray-500 text-sm">Manage your income and withdrawal history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        <EarningCard 
          label="Total Earnings" 
          value={`Rs. ${balance?.totalEarnings?.toLocaleString() || 0}`} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="bg-emerald-500" 
        />
        <EarningCard 
          label="Total Payouts" 
          value={`Rs. ${balance?.totalPayouts?.toLocaleString() || 0}`} 
          icon={<CreditCard className="w-6 h-6" />} 
          color="bg-blue-500" 
        />
        <EarningCard 
          label="Available Balance" 
          value={`Rs. ${balance?.pendingBalance?.toLocaleString() || 0}`} 
          icon={<Wallet className="w-6 h-6" />} 
          color="bg-gold-400" 
          highlight
        />
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl lg:text-2xl font-display font-bold">Transaction History</h2>
          <div className="flex gap-2">
             <button className="p-2.5 lg:p-3 bg-white dark:bg-dark-800 rounded-xl border border-gold-400/10 text-gray-400 hover:text-gold-400 transition-all"><Filter className="w-4 h-4" /></button>
             <button className="p-2.5 lg:p-3 bg-white dark:bg-dark-800 rounded-xl border border-gold-400/10 text-gray-400 hover:text-gold-400 transition-all"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block bg-white dark:bg-dark-800 rounded-[40px] shadow-soft border border-gold-400/5 overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-cream-50 dark:bg-dark-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <tr>
                    <th className="px-8 py-6">Type</th>
                    <th className="px-8 py-6">Description</th>
                    <th className="px-8 py-6">Date</th>
                    <th className="px-8 py-6">Amount</th>
                    <th className="px-8 py-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gold-400/10">
                  {transLoading ? (
                    Array(3).fill(0).map((_, i) => <tr key={i} className="animate-pulse h-16 bg-gold-400/5" />)
                  ) : transactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">No transactions yet</td>
                    </tr>
                  ) : (
                    transactions?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gold-400/5 transition-all">
                        <td className="px-8 py-6">
                           {t.type === 'CREDIT' ? (
                             <div className="flex items-center gap-3 text-emerald-500">
                               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4" /></div>
                               <span className="font-bold text-xs uppercase tracking-widest">Credit</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-3 text-blue-500">
                               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
                               <span className="font-bold text-xs uppercase tracking-widest">Debit</span>
                             </div>
                           )}
                        </td>
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-dark-900 dark:text-cream-50">{t.description}</p>
                          <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Order #{t.orderId?.slice(-8) || 'N/A'}</p>
                        </td>
                        <td className="px-8 py-6 text-sm text-gray-500 font-medium">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="px-8 py-6">
                           <span className={`text-lg font-accent font-bold ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-blue-500'}`}>
                             {t.type === 'CREDIT' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                           </span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-pill text-[10px] font-bold">COMPLETED</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
           </div>
        </div>

        {/* Mobile List View */}
        <div className="md:hidden space-y-4">
           {transLoading ? (
             Array(3).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-dark-800 rounded-3xl animate-pulse" />)
           ) : transactions?.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[32px] border border-gold-400/10">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No transactions yet</p>
              </div>
           ) : (
             transactions?.map((t: any) => (
               <div key={t.id} className="bg-white dark:bg-dark-800 p-5 rounded-3xl border border-gold-400/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                       {t.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="text-sm font-bold truncate max-w-[150px]">{t.description}</p>
                       <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-accent font-bold ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-blue-500'}`}>
                      {t.type === 'CREDIT' ? '+' : '-'} Rs. {t.amount.toLocaleString()}
                    </p>
                    <p className="text-[9px] text-emerald-500 font-bold uppercase tracking-widest">COMPLETED</p>
                  </div>
               </div>
             ))
           )}
        </div>
      </div>
    </div>
  );
}

function EarningCard({ label, value, icon, color, highlight }: any) {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className={`p-6 lg:p-8 rounded-[32px] border shadow-soft space-y-6 relative overflow-hidden transition-colors ${
        highlight 
        ? "bg-gold-500 dark:bg-dark-900 text-white border-gold-400/20 shadow-gold" 
        : "bg-white dark:bg-dark-800 border-gold-400/10 text-dark-900 dark:text-white"
      }`}
    >
      <div className={`w-14 h-14 ${color} bg-opacity-20 rounded-2xl flex items-center justify-center ${highlight ? "text-white" : "text-gold-400"}`}>
        {icon}
      </div>
      <div className="space-y-1 relative z-10">
        <p className={`text-[10px] font-bold uppercase tracking-[0.2em] ${highlight ? "text-gold-100/80" : "text-gray-400"}`}>
          {label}
        </p>
        <h3 className="text-2xl lg:text-3xl font-accent font-bold leading-none">{value}</h3>
      </div>
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full translate-x-12 -translate-y-12" />
      )}
    </motion.div>
  );
}
