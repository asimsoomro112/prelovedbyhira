"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  AlertTriangle, 
  Search, 
  MessageSquare, 
  ArrowRight, 
  X, 
  CheckCircle2, 
  Image as ImageIcon,
  History,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

export default function AdminDisputesPage() {
  const [activeTab, setActiveTab] = useState("OPEN");
  const [selectedDispute, setSelectedDispute] = useState<any>(null);
  const [adminNote, setAdminNote] = useState("");
  const queryClient = useQueryClient();

  const { data: disputes, isLoading } = useQuery({
    queryKey: ["admin-disputes", activeTab],
    queryFn: async () => {
      const { data } = await api.get("/admin/disputes");
      return activeTab === "ALL" ? data : data.filter((d: any) => d.status === activeTab);
    },
  });

  const resolveMutation = useMutation({
    mutationFn: async ({ id, action, note }: { id: string, action: string, note: string }) => {
      const endpoint = action === 'REFUND' ? `/admin/disputes/${id}/approve-refund` : `/admin/disputes/${id}/reject`;
      return await api.put(endpoint, { adminNote: note });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-disputes"] });
      toast.success("Dispute resolved successfully!");
      setSelectedDispute(null);
      setAdminNote("");
    },
  });

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
           </div>
           <div>
              <h1 className="text-3xl font-display font-bold">Dispute Resolution</h1>
              <p className="text-gray-500">Manage order conflicts and protect marketplace integrity.</p>
           </div>
        </div>
        <div className="flex bg-cream-100 dark:bg-dark-900/50 p-1 rounded-2xl">
          {["ALL", "OPEN", "UNDER_REVIEW", "RESOLVED"].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white dark:bg-dark-800 text-gold-400 shadow-soft" : "text-gray-400"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-40 bg-white dark:bg-dark-800 rounded-[40px] animate-pulse" />)
        ) : disputes?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] border border-gold-400/10">
            <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No active disputes in {activeTab}</p>
          </div>
        ) : (
          disputes?.map((dispute: any) => (
            <motion.div 
              key={dispute.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 p-8 rounded-[40px] shadow-soft border border-gold-400/5 flex flex-col md:flex-row items-center gap-10 hover:border-gold-400/20 transition-all cursor-pointer group"
              onClick={() => setSelectedDispute(dispute)}
            >
              <div className="text-center space-y-1 shrink-0">
                 <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Order Amount</p>
                 <p className="text-2xl font-accent font-bold text-gold-400">Rs. {dispute.order.totalPrice}</p>
                 <span className={`inline-block px-3 py-1 rounded-pill text-[8px] font-bold mt-2 ${getStatusStyle(dispute.status)}`}>{dispute.status}</span>
              </div>

              <div className="flex-1 space-y-4">
                 <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-red-500 uppercase tracking-widest px-2 py-0.5 bg-red-500/10 rounded-md">{dispute.reason}</span>
                    <span className="text-xs text-gray-400 font-medium">#{dispute.id.slice(-8)} • {new Date(dispute.createdAt).toLocaleDateString()}</span>
                 </div>
                 <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {dispute.description}
                 </p>
                 <div className="flex items-center gap-12">
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 text-[10px] font-bold">B</div>
                       <span className="text-xs font-bold text-gray-500">Buyer: {dispute.order.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                       <div className="w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400 text-[10px] font-bold">S</div>
                       <span className="text-xs font-bold text-gray-500">Seller: {dispute.order.seller.user.name}</span>
                    </div>
                 </div>
              </div>

              <div className="w-12 h-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center group-hover:bg-gold-400 group-hover:text-white transition-all shrink-0">
                 <ArrowRight className="w-6 h-6" />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* DISPUTE DETAIL MODAL */}
      <AnimatePresence>
        {selectedDispute && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedDispute(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed top-[5%] left-1/2 -translate-x-1/2 w-full max-w-5xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-900 rounded-[40px] p-8 lg:p-12 z-[110] shadow-2xl border border-gold-400/10 space-y-12 scrollbar-thin">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                     <AlertTriangle className="w-8 h-8 text-red-500" />
                     <h2 className="text-2xl font-display font-bold">Review Dispute #{selectedDispute.id.slice(-8)}</h2>
                  </div>
                  <button onClick={() => setSelectedDispute(null)} className="p-3 bg-gold-400/10 text-gold-400 rounded-full hover:bg-gold-400 hover:text-white transition-all"><X className="w-6 h-6" /></button>
               </div>

               <div className="grid lg:grid-cols-3 gap-12">
                  <div className="lg:col-span-2 space-y-10">
                     {/* Evidence Gallery */}
                     <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <ImageIcon className="w-4 h-4" /> Evidence Gallery
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {selectedDispute.evidence.map((img: string, i: number) => (
                             <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border border-gold-400/10">
                                <Image src={img} alt="Evidence" fill className="object-cover" />
                             </div>
                           ))}
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                           <MessageSquare className="w-4 h-4" /> Description from Buyer
                        </h3>
                        <div className="p-8 bg-cream-50 dark:bg-dark-800 rounded-[32px] text-gray-600 dark:text-gray-300 leading-relaxed italic">
                           &quot;{selectedDispute.description}&quot;
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8">
                     <div className="bg-white dark:bg-dark-950 p-8 rounded-[32px] border border-gold-400/10 space-y-6">
                        <h3 className="text-sm font-bold uppercase tracking-widest">Order Details</h3>
                        <div className="flex items-center gap-4">
                           <div className="relative w-16 h-20 rounded-xl overflow-hidden">
                              <Image src={selectedDispute.order.product.images[0]} alt="Product" fill className="object-cover" />
                           </div>
                           <div>
                              <p className="text-sm font-bold truncate w-40">{selectedDispute.order.product.title}</p>
                              <p className="text-xs text-gold-400 font-bold">Rs. {selectedDispute.order.totalPrice}</p>
                           </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-gold-400/10">
                           <InfoRow label="Status" value={selectedDispute.order.status} />
                           <InfoRow label="Buyer" value={selectedDispute.order.customer.name} />
                           <InfoRow label="Seller" value={selectedDispute.order.seller.user.name} />
                        </div>
                     </div>

                     <div className="space-y-4">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Admin Resolution</h3>
                        <textarea 
                          value={adminNote}
                          onChange={(e) => setAdminNote(e.target.value)}
                          placeholder="Add internal notes about this resolution..." 
                          className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl p-4 text-sm outline-none focus:border-gold-400 transition-all h-32 resize-none"
                        />
                     </div>

                     <div className="space-y-3">
                        <button 
                          onClick={() => resolveMutation.mutate({ id: selectedDispute.id, action: 'REFUND', note: adminNote })}
                          className="w-full py-4 bg-red-500 text-white rounded-pill font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                           <ArrowDownLeft className="w-4 h-4" /> Refund Buyer (100%)
                        </button>
                        <button 
                          onClick={() => resolveMutation.mutate({ id: selectedDispute.id, action: 'RELEASE', note: adminNote })}
                          className="w-full py-4 bg-emerald-500 text-white rounded-pill font-bold shadow-lg hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                        >
                           <ArrowUpRight className="w-4 h-4" /> Release Escrow to Seller
                        </button>
                        <button className="w-full py-4 border-2 border-gold-400 text-gold-400 rounded-pill font-bold hover:bg-gold-400/10 transition-all">
                           Partial Resolution
                        </button>
                     </div>
                  </div>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function InfoRow({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-xs">
       <span className="text-gray-500 font-medium">{label}</span>
       <span className="font-bold text-dark-900 dark:text-cream-50">{value}</span>
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'OPEN': return 'bg-red-500/10 text-red-500';
    case 'UNDER_REVIEW': return 'bg-amber-500/10 text-amber-500';
    case 'RESOLVED': return 'bg-emerald-500/10 text-emerald-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
}
