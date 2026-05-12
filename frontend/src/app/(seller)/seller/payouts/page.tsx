"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  History, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  X, 
  CreditCard, 
  Banknote,
  Smartphone,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SellerPayoutsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("BANK");
  const [details, setDetails] = useState("");
  const queryClient = useQueryClient();

  const { data: balance } = useQuery({
    queryKey: ["seller-balance"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/balance");
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["payout-settings"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/settings");
      return data;
    },
  });

  const minPayout = settings?.minPayoutAmount || 5000;

  const { data: payouts, isLoading } = useQuery({
    queryKey: ["seller-payouts"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/history");
      return data.filter((t: any) => t.type === 'DEBIT' || t.status === 'PENDING');
    },
  });

  const requestMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post("/payouts/request", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-balance"] });
      queryClient.invalidateQueries({ queryKey: ["seller-payouts"] });
      toast.success("Payout request submitted! ✨");
      setIsModalOpen(false);
      setAmount("");
      setDetails("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !details) return;
    requestMutation.mutate({
      amount: parseFloat(amount),
      method,
      details
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Payout Center</h1>
          <p className="text-gray-500">Withdraw your earnings to your bank or wallet.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="px-10 py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center gap-3 hover:scale-105 active:scale-95 transition-all"
        >
          <Plus className="w-5 h-5" /> Request Payout
        </button>
      </div>

      {/* Balance Summary */}
      <div className="grid md:grid-cols-2 gap-8">
         <div className="bg-dark-900 rounded-[40px] p-10 border border-gold-400/20 relative overflow-hidden group">
            <div className="relative z-10 space-y-8">
               <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gold-400/10 rounded-2xl flex items-center justify-center text-gold-400">
                     <Banknote className="w-7 h-7" />
                  </div>
                  <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Available for Withdrawal</p>
               </div>
               <h2 className="text-5xl font-accent font-bold text-white">Rs. {balance?.pendingBalance || 0}</h2>
               <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold">
                  <ShieldCheck className="w-4 h-4" /> Securely held in Preloved Vault
               </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400 opacity-5 rounded-full translate-x-24 -translate-y-24 group-hover:scale-110 transition-transform duration-700" />
         </div>

         <div className="bg-white dark:bg-dark-800 rounded-[40px] p-10 border border-gold-400/10 flex flex-col justify-between">
            <div className="space-y-4">
               <h3 className="text-xl font-display font-bold">Withdrawal Policy</h3>
               <p className="text-gray-500 text-sm leading-relaxed">
                 Earnings are available for withdrawal <span className="text-gold-400 font-bold">3 days</span> after the buyer confirms delivery. Minimum payout amount is <span className="text-dark-900 dark:text-white font-bold">Rs. {minPayout.toLocaleString()}</span>.
               </p>
            </div>
            <div className="pt-6 border-t border-gold-400/10 mt-6">
               <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase">
                  <AlertCircle className="w-4 h-4" /> Next processing cycle: Monday
               </div>
            </div>
         </div>
      </div>

      {/* Payout History */}
      <div className="space-y-6">
        <h2 className="text-2xl font-display font-bold">Withdrawal History</h2>
        <div className="grid gap-4">
           {isLoading ? (
             Array(2).fill(0).map((_, i) => <div key={i} className="h-24 bg-white dark:bg-dark-800 rounded-3xl animate-pulse" />)
           ) : payouts?.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] border border-gold-400/10">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No payout history yet</p>
             </div>
           ) : (
             payouts?.map((p: any) => (
               <div key={p.id} className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-gold-400/10 flex items-center justify-between group hover:border-gold-400/30 transition-all">
                  <div className="flex items-center gap-5">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <ArrowUpRight className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold">Rs. {p.amount}</p>
                        <p className="text-xs text-gray-400 font-medium">{p.method} • {new Date(p.createdAt).toLocaleDateString()}</p>
                     </div>
                  </div>
                  <span className={`px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-widest ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {p.status}
                  </span>
               </div>
             ))
           )}
        </div>
      </div>

      {/* Request Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full md:max-w-xl bg-white dark:bg-dark-900 rounded-t-[40px] md:rounded-[48px] p-8 md:p-12 z-[110] shadow-2xl border-t md:border border-gold-400/10">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-display font-bold">New Payout</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gold-400/10 text-gold-400 rounded-2xl hover:scale-110 transition-transform">
                    <X className="w-6 h-6" />
                  </button>
               </div>

               <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Withdrawal Amount (PKR)</label>
                    <input 
                      type="number" 
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Min ${minPayout.toLocaleString()} PKR`}
                      className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-3xl px-8 py-6 text-2xl font-accent font-bold outline-none focus:border-gold-400 transition-all"
                    />
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Payment Method</label>
                    <div className="grid grid-cols-3 gap-4">
                       {[{id: 'BANK', icon: CreditCard, label: 'Bank'}, {id: 'JAZZCASH', icon: Smartphone, label: 'JazzCash'}, {id: 'EASYPAISA', icon: Banknote, label: 'Easypaisa'}].map((m) => (
                         <button 
                           key={m.id}
                           type="button"
                           onClick={() => setMethod(m.id)}
                           className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${method === m.id ? "border-gold-400 bg-gold-400/5 text-gold-400" : "border-gold-400/10 text-gray-400"}`}
                         >
                           <m.icon className="w-6 h-6" />
                           <span className="text-[10px] font-bold uppercase">{m.label}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Details</label>
                    <textarea 
                      value={details}
                      onChange={(e) => setDetails(e.target.value)}
                      placeholder="Bank Name, IBAN, Account Title, or Mobile Number..."
                      className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-3xl px-8 py-6 text-sm font-medium outline-none focus:border-gold-400 transition-all resize-none"
                      rows={3}
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={requestMutation.isPending}
                    className="w-full py-6 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all text-lg"
                  >
                    {requestMutation.isPending ? "Processing Request..." : "Request Withdrawal 🚀"}
                  </button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
