"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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

  const [filterType, setFilterType] = useState<'ALL' | 'CREDIT' | 'DEBIT'>('ALL');
  const [showFilter, setShowFilter] = useState(false);

  const filteredTransactions = transactions?.filter((t: any) => {
    if (filterType === 'ALL') return true;
    return t.type === filterType;
  });

  const downloadCSV = () => {
    if (!transactions || transactions.length === 0) return;
    
    const headers = ["ID", "Type", "Description", "Date", "Amount", "Status"];
    const rows = transactions.map((t: any) => [
      t.id,
      t.type,
      t.description,
      new Date(t.createdAt).toLocaleDateString(),
      t.amount,
      "COMPLETED"
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((e: any[]) => e.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `earnings_report_${new Date().toLocaleDateString()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          <div className="flex gap-2 relative">
             <div className="relative">
                <button 
                  onClick={() => setShowFilter(!showFilter)}
                  className={`p-2.5 lg:p-3 rounded-xl border transition-all ${showFilter ? 'bg-gold-400 text-white border-gold-400' : 'bg-white dark:bg-dark-800 border-gold-400/10 text-gray-400 hover:text-gold-400'}`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                <AnimatePresence>
                  {showFilter && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-40 bg-white dark:bg-dark-900 border border-gold-400/10 rounded-2xl shadow-2xl z-50 overflow-hidden"
                    >
                      {['ALL', 'CREDIT', 'DEBIT'].map((type) => (
                        <button 
                          key={type}
                          onClick={() => { setFilterType(type as any); setShowFilter(false); }}
                          className={`w-full text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest hover:bg-gold-400/5 transition-colors ${filterType === type ? 'text-gold-400 bg-gold-400/5' : 'text-gray-500'}`}
                        >
                          {type === 'ALL' ? 'All Activity' : type === 'CREDIT' ? 'Earnings Only' : 'Payouts Only'}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             <button 
               onClick={downloadCSV}
               className="p-2.5 lg:p-3 bg-white dark:bg-dark-800 rounded-xl border border-gold-400/10 text-gray-400 hover:text-gold-400 transition-all active:scale-95"
             >
               <Download className="w-4 h-4" />
             </button>
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
                  ) : filteredTransactions?.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-gray-500 font-bold uppercase text-xs tracking-widest">No transactions found</td>
                    </tr>
                  ) : (
                    filteredTransactions?.map((t: any) => (
                      <tr key={t.id} className="hover:bg-gold-400/5 transition-all">
                        <td className="px-8 py-6">
                           {t.type === 'CREDIT' ? (
                             <div className="flex items-center gap-3 text-emerald-500">
                               <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center"><ArrowDownLeft className="w-4 h-4" /></div>
                               <span className="font-bold text-xs uppercase tracking-widest">Earnings</span>
                             </div>
                           ) : (
                             <div className="flex items-center gap-3 text-blue-500">
                               <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center"><ArrowUpRight className="w-4 h-4" /></div>
                               <span className="font-bold text-xs uppercase tracking-widest">Payout Request</span>
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
           ) : filteredTransactions?.length === 0 ? (
              <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[32px] border border-gold-400/10">
                <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">No transactions yet</p>
              </div>
           ) : (
             filteredTransactions?.map((t: any) => (
               <div key={t.id} className="bg-white dark:bg-dark-800 p-5 rounded-3xl border border-gold-400/10 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${t.type === 'CREDIT' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                       {t.type === 'CREDIT' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                    </div>
                    <div>
                       <p className="text-sm font-bold truncate max-w-[150px]">{t.description}</p>
                       <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[9px] font-bold uppercase tracking-widest ${t.type === 'CREDIT' ? 'text-emerald-500' : 'text-blue-500'}`}>
                             {t.type === 'CREDIT' ? 'Earnings' : 'Payout'}
                          </span>
                          <span className="text-[9px] text-gray-400 font-medium">• {new Date(t.createdAt).toLocaleDateString()}</span>
                       </div>
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
