"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Lock, ShieldCheck, Search, ArrowRight, Loader2, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";
import Image from "next/image";

export default function EscrowManagerPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin-orders-escrow"],
    queryFn: async () => {
      const { data } = await api.get("/admin/orders");
      return data;
    },
  });

  const forceRelease = useMutation({
    mutationFn: async (orderId: string) => {
      await api.put(`/orders/${orderId}/confirm`); // Using the buyer confirm delivery endpoint or admin resolve
      // Note: In a real system, admin would have a dedicated forced release endpoint 
      // but for now we can rely on the existing confirmation mechanism or disputes.
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders-escrow"] });
      toast.success("Funds forcefully released to seller");
    }
  });

  const escrowOrders = orders?.filter((o: any) => 
    ["PAID", "SHIPPED", "DELIVERED", "DISPUTED"].includes(o.status)
  ) || [];

  const filteredOrders = escrowOrders.filter((o: any) => 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.product?.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalEscrowHeld = escrowOrders.reduce((sum: number, o: any) => sum + (o.netAmount || o.totalPrice * 0.8), 0);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-display font-bold text-dark-900 dark:text-cream-50 flex items-center gap-3">
             <Lock className="w-10 h-10 text-gold-400" /> Escrow Manager
          </h1>
          <p className="text-gray-500 mt-2">Monitor and manage funds currently held in platform escrow.</p>
        </div>
        
        <div className="bg-white dark:bg-dark-900 p-6 rounded-3xl border border-gold-400/20 shadow-soft w-full md:w-auto min-w-[250px]">
           <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total Held in Escrow</p>
           <p className="text-3xl font-accent font-bold text-gold-400">Rs. {totalEscrowHeld.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden">
        <div className="p-6 border-b border-gold-400/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative w-full md:w-96">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Order ID or Product..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-cream-50 dark:bg-dark-800 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 text-sm"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cream-50 dark:bg-dark-800/50 text-[10px] uppercase tracking-widest text-gray-500">
                <th className="p-6 font-bold">Order Details</th>
                <th className="p-6 font-bold">Buyer</th>
                <th className="p-6 font-bold">Seller</th>
                <th className="p-6 font-bold">Status</th>
                <th className="p-6 font-bold text-right">Escrow Amount</th>
                <th className="p-6 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gold-400/5">
              {isLoading ? (
                <tr><td colSpan={6} className="p-12 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-gold-400" /></td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan={6} className="p-12 text-center text-gray-500">No funds currently held in escrow.</td></tr>
              ) : (
                filteredOrders.map((order: any) => {
                  const escrowAmount = order.netAmount || order.totalPrice * 0.8;
                  
                  return (
                    <motion.tr 
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      key={order.id} 
                      className="hover:bg-gold-400/5 transition-colors"
                    >
                      <td className="p-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 bg-dark-800">
                             {order.product?.images?.[0] && <Image src={order.product.images[0]} alt="Product" fill className="object-cover" />}
                          </div>
                          <div>
                            <p className="font-bold text-sm text-dark-900 dark:text-cream-50">{order.product?.title || 'Unknown'}</p>
                            <p className="text-[10px] text-gray-400 tracking-widest uppercase">#{order.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-6 text-sm font-bold text-gray-600 dark:text-gray-300">
                        {order.buyer?.name || 'Unknown'}
                      </td>
                      <td className="p-6 text-sm font-bold text-gray-600 dark:text-gray-300">
                        {order.seller?.user?.name || 'Unknown'}
                      </td>
                      <td className="p-6">
                        <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest ${
                          order.status === 'DISPUTED' ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 
                          'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="p-6 text-right">
                        <p className="text-lg font-bold text-gold-400">Rs. {escrowAmount.toLocaleString()}</p>
                      </td>
                      <td className="p-6 text-center">
                        {order.status === 'DISPUTED' ? (
                          <Link href="/admin/disputes" className="px-4 py-2 bg-red-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest">
                            Resolve Dispute
                          </Link>
                        ) : order.status === 'DELIVERED' ? (
                          <button 
                            onClick={() => {
                              if(confirm("Force release funds to seller? This overrides buyer confirmation.")) {
                                forceRelease.mutate(order.id);
                              }
                            }}
                            disabled={forceRelease.isPending}
                            className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-600 transition-colors disabled:opacity-50"
                          >
                            Force Release
                          </button>
                        ) : (
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Awaiting Delivery</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
