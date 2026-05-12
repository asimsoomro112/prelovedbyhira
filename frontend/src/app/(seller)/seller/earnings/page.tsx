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
    <div className="p-4 lg:p-8 space-y-12">
      <div>
        <h1 className="text-3xl font-display font-bold">Earnings & Finances</h1>
        <p className="text-gray-500">Manage your income and withdrawal history.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <EarningCard 
          label="Total Earnings" 
          value={`Rs. ${balance?.totalEarnings || 0}`} 
          icon={<TrendingUp className="w-6 h-6" />} 
          color="bg-emerald-500" 
        />
        <EarningCard 
          label="Total Payouts" 
          value={`Rs. ${balance?.totalPayouts || 0}`} 
          icon={<CreditCard className="w-6 h-6" />} 
          color="bg-blue-500" 
        />
        <EarningCard 
          label="Available Balance" 
          value={`Rs. ${balance?.pendingBalance || 0}`} 
          icon={<Wallet className="w-6 h-6" />} 
          color="bg-gold-400" 
          highlight
        />
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-display font-bold">Transaction History</h2>
          <div className="flex gap-2">
             <button className="p-3 bg-white dark:bg-dark-800 rounded-2xl border border-gold-400/10 text-gray-400 hover:text-gold-400 transition-all"><Filter className="w-4 h-4" /></button>
             <button className="p-3 bg-white dark:bg-dark-800 rounded-2xl border border-gold-400/10 text-gray-400 hover:text-gold-400 transition-all"><Download className="w-4 h-4" /></button>
          </div>
        </div>

        <div className="bg-white dark:bg-dark-800 rounded-[40px] shadow-soft border border-gold-400/5 overflow-hidden">
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
                             {t.type === 'CREDIT' ? '+' : '-'} Rs. {t.amount}
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
      </div>
    </div>
  );
}

function EarningCard({ label, value, icon, color, highlight }: any) {
  return (
    <motion.div 
      whileHover={{ y: -6 }}
      className={`p-8 rounded-[32px] border shadow-soft space-y-6 relative overflow-hidden ${highlight ? "bg-dark-900 text-white border-gold-400/20" : "bg-white dark:bg-dark-800 border-gold-400/10"}`}
    >
      <div className={`w-14 h-14 ${color} bg-opacity-10 rounded-2xl flex items-center justify-center ${highlight ? "text-gold-400" : "text-gold-400"}`}>
        {icon}
      </div>
      <div className="space-y-1 relative z-10">
        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em]">{label}</p>
        <h3 className="text-3xl font-accent font-bold">{value}</h3>
      </div>
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400 opacity-5 rounded-full translate-x-12 -translate-y-12" />
      )}
    </motion.div>
  );
}
