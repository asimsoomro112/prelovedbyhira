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
  AlertCircle,
  Image as ImageIcon
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SellerPayoutsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [selectedAccountId, setSelectedAccountId] = useState<string>("");
  const [isAddingNew, setIsAddingNew] = useState(false);
  
  // New account form
  const [newAccType, setNewAccType] = useState("BANK");
  const [newAccTitle, setNewAccTitle] = useState("");
  const [newAccDetails, setNewAccDetails] = useState("");

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

  const { data: accounts } = useQuery({
    queryKey: ["payout-accounts"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/accounts");
      return data;
    },
  });

  const minPayout = settings?.minPayoutAmount || 0;

  const { data: payouts, isLoading } = useQuery({
    queryKey: ["seller-payouts"],
    queryFn: async () => {
      const { data } = await api.get("/payouts/history");
      return data.filter((t: any) => t.type === 'DEBIT' || t.status === 'PENDING' || t.sellerId);
    },
  });

  const addAccountMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await api.post("/payouts/accounts", payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
      toast.success("Account saved to vault! ✨");
      setIsAddingNew(false);
      setNewAccTitle("");
      setNewAccDetails("");
    }
  });

  const deleteAccountMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/payouts/accounts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payout-accounts"] });
      toast.success("Account removed.");
    }
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
      setSelectedAccountId("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit request.");
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount) return;
    
    const selectedAcc = accounts?.find((a: any) => a.id === selectedAccountId);
    if (!selectedAcc) {
      toast.error("Please select a payout account.");
      return;
    }

    requestMutation.mutate({
      amount: parseFloat(amount),
      method: selectedAcc.type,
      details: `${selectedAcc.title} - ${selectedAcc.details}`
    });
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccTitle || !newAccDetails) return;
    addAccountMutation.mutate({
      type: newAccType,
      title: newAccTitle,
      details: newAccDetails
    });
  };

  return (
    <div className="p-4 lg:p-8 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold">Payout Center</h1>
          <p className="text-gray-500">Securely withdraw your earnings to saved accounts.</p>
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
               <h2 className="text-5xl font-accent font-bold text-white">Rs. {balance?.pendingBalance?.toLocaleString() || 0}</h2>
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
                 Earnings are <span className="text-emerald-500 font-bold">automatically released</span> to your balance as soon as the buyer approves the delivery and confirms the product is correct. {minPayout > 0 && (
                   <>Minimum payout amount is <span className="text-dark-900 dark:text-white font-bold">Rs. {minPayout.toLocaleString()}</span>.</>
                 )}
               </p>
            </div>
            <div className="pt-6 border-t border-gold-400/10 mt-6">
               <div className="flex items-center gap-2 text-gold-400 text-xs font-bold uppercase">
                  <ShieldCheck className="w-4 h-4" /> Instant release upon buyer approval
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
           ) : !payouts || payouts.length === 0 ? (
             <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] border border-gold-400/10">
                <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No payout history yet</p>
             </div>
           ) : (
             payouts.map((p: any) => (
               <div key={p.id} className="bg-white dark:bg-dark-800 p-6 rounded-3xl border border-gold-400/10 flex items-center justify-between group hover:border-gold-400/30 transition-all">
                  <div className="flex items-center gap-5">
                     <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                        <ArrowUpRight className="w-6 h-6" />
                     </div>
                     <div>
                        <p className="font-bold">Rs. {p.amount.toLocaleString()}</p>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{p.method}</p>
                        <p className="text-[10px] text-gold-400/80 font-bold">{p.details}</p>
                        <p className="text-[9px] text-gray-500">{new Date(p.createdAt).toLocaleDateString()} • {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                     </div>
                  </div>
                   <div className="flex flex-col items-end gap-2">
                     <span className={`px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-widest ${p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                       {p.status}
                     </span>
                     {p.proofImage && (
                       <a href={p.proofImage} target="_blank" className="text-[10px] text-gold-400 font-bold flex items-center gap-1 hover:underline">
                         <ImageIcon className="w-3 h-3" /> View Receipt
                       </a>
                     )}
                   </div>
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
            <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-0 left-0 right-0 md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:bottom-auto w-full md:max-w-2xl bg-white dark:bg-dark-900 rounded-t-[40px] md:rounded-[48px] p-8 md:p-10 z-[110] shadow-2xl border-t md:border border-gold-400/10 overflow-y-auto max-h-[90vh]">
               <div className="flex items-center justify-between mb-8">
                  <h2 className="text-3xl font-display font-bold">New Payout</h2>
                  <button onClick={() => setIsModalOpen(false)} className="p-3 bg-gold-400/10 text-gold-400 rounded-2xl hover:scale-110 transition-transform">
                    <X className="w-6 h-6" />
                  </button>
               </div>

               {!isAddingNew ? (
                 <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Withdrawal Amount (PKR)</label>
                      <input 
                        type="number" 
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={minPayout > 0 ? `Min ${minPayout.toLocaleString()} PKR` : "Enter Amount"}
                        className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-3xl px-8 py-6 text-2xl font-accent font-bold outline-none focus:border-gold-400 transition-all"
                      />
                      <p className="text-[10px] text-gray-400 ml-2">Total Available: Rs. {balance?.pendingBalance?.toLocaleString() || 0}</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Select Payout Account</label>
                        <button 
                          type="button" 
                          onClick={() => setIsAddingNew(true)}
                          className="text-[10px] font-bold text-gold-400 uppercase tracking-widest flex items-center gap-1 hover:underline"
                        >
                          <Plus className="w-3 h-3" /> Add New Account
                        </button>
                      </div>
                      
                      <div className="grid gap-3">
                         {accounts?.length === 0 ? (
                           <div className="p-8 border-2 border-dashed border-gold-400/20 rounded-3xl text-center text-gray-400 text-sm">
                             No saved accounts found.
                           </div>
                         ) : (
                           accounts?.map((acc: any) => (
                             <div 
                               key={acc.id}
                               onClick={() => setSelectedAccountId(acc.id)}
                               className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedAccountId === acc.id ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
                             >
                               <div className="flex items-center gap-4">
                                  <div className="w-10 h-10 bg-gold-400/10 rounded-xl flex items-center justify-center text-gold-400">
                                     {acc.type === 'BANK' ? <CreditCard className="w-5 h-5" /> : acc.type === 'JAZZCASH' ? <Smartphone className="w-5 h-5" /> : <Banknote className="w-5 h-5" />}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold">{acc.title}</p>
                                     <p className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">{acc.type} • {acc.details}</p>
                                  </div>
                               </div>
                               <button 
                                 type="button"
                                 onClick={(e) => { e.stopPropagation(); deleteAccountMutation.mutate(acc.id); }}
                                 className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                               >
                                 <X className="w-4 h-4" />
                               </button>
                             </div>
                           ))
                         )}
                      </div>
                    </div>

                    <button 
                      type="submit"
                      disabled={requestMutation.isPending || !selectedAccountId}
                      className="w-full py-6 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all text-lg disabled:opacity-50 disabled:grayscale"
                    >
                      {requestMutation.isPending ? "Processing Request..." : "Request Withdrawal 🚀"}
                    </button>
                 </form>
               ) : (
                 <form onSubmit={handleAddAccount} className="space-y-6">
                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Method Type</label>
                      <div className="grid grid-cols-3 gap-4">
                        {[{id: 'BANK', icon: CreditCard, label: 'Bank'}, {id: 'JAZZCASH', icon: Smartphone, label: 'JazzCash'}, {id: 'EASYPAISA', icon: Banknote, label: 'Easypaisa'}].map((m) => (
                          <button 
                            key={m.id}
                            type="button"
                            onClick={() => setNewAccType(m.id)}
                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${newAccType === m.id ? "border-gold-400 bg-gold-400/5 text-gold-400" : "border-gold-400/10 text-gray-400"}`}
                          >
                            <m.icon className="w-5 h-5" />
                            <span className="text-[10px] font-bold uppercase">{m.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Title / Name</label>
                      <input 
                        type="text" 
                        value={newAccTitle}
                        onChange={(e) => setNewAccTitle(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-gold-400 transition-all"
                      />
                    </div>

                    <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Number / IBAN / Phone</label>
                      <input 
                        type="text" 
                        value={newAccDetails}
                        onChange={(e) => setNewAccDetails(e.target.value)}
                        placeholder={newAccType === 'BANK' ? 'Enter IBAN' : 'Enter Phone Number'}
                        className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-gold-400 transition-all"
                      />
                    </div>

                    <div className="flex gap-4 pt-4">
                      <button 
                        type="button"
                        onClick={() => setIsAddingNew(false)}
                        className="flex-1 py-4 bg-gray-100 dark:bg-dark-800 text-gray-500 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit"
                        disabled={addAccountMutation.isPending}
                        className="flex-1 py-4 bg-gold-400 text-white rounded-2xl font-bold text-sm shadow-gold hover:scale-[1.02] transition-all"
                      >
                        {addAccountMutation.isPending ? "Saving..." : "Save Account"}
                      </button>
                    </div>
                 </form>
               )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
