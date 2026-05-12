"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Package, 
  ChevronRight, 
  Clock, 
  CheckCircle2, 
  Truck, 
  AlertCircle, 
  MessageSquare,
  Search,
  ShoppingBag,
  ArrowRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

export default function MyOrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["my-orders", activeTab],
    queryFn: async () => {
      const { data } = await api.get("/orders/my-orders");
      return activeTab === "ALL" ? data : data.filter((o: any) => {
        if (activeTab === "ACTIVE") return ["PAID", "SHIPPED", "DELIVERED"].includes(o.status);
        return o.status === activeTab;
      });
    },
  });

  const confirmReceipt = useMutation({
    mutationFn: async (orderId: string) => {
      return await api.put(`/orders/${orderId}/confirm`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-orders"] });
      toast.success("Delivery confirmed! Your escrow has been released to the seller.");
    },
  });

  const tabs = ["ALL", "ACTIVE", "COMPLETED", "CANCELLED", "DISPUTED"];

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <h1 className="text-4xl font-display font-bold">My Orders</h1>
        <div className="flex bg-cream-100 dark:bg-dark-900/50 p-1 rounded-2xl overflow-x-auto scrollbar-none">
          {tabs.map((tab) => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-dark-800 text-gold-400 shadow-soft" : "text-gray-400 hover:text-gray-600"}`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <OrderSkeleton key={i} />)
        ) : orders?.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10">
            <ShoppingBag className="w-16 h-16 text-gold-400/20 mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold mb-2">No orders found</h2>
            <p className="text-gray-500 mb-8">You haven&apos;t placed any orders in this category yet.</p>
            <Link href="/products" className="px-10 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold inline-flex items-center gap-2">
               Explore Collection <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          orders?.map((order: any) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-900 rounded-[32px] p-6 lg:p-8 shadow-soft border border-gold-400/10 hover:border-gold-400/30 transition-all flex flex-col lg:flex-row gap-8 group"
            >
              <div className="relative w-full lg:w-40 aspect-[3/4] rounded-2xl overflow-hidden border border-gold-400/10 shrink-0">
                <Image src={order.product.images[0]} alt={order.product.title} fill className="object-cover" />
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                       <span className={`px-3 py-1 rounded-pill text-[10px] font-bold ${getStatusStyle(order.status)}`}>{order.status}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(-8)}</span>
                    </div>
                    <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">{order.product.title}</h3>
                    <p className="text-sm text-gold-400 font-bold uppercase tracking-widest">{order.product.brand}</p>
                  </div>
                  <div className="text-left md:text-right">
                    <p className="text-3xl font-accent font-bold text-gold-400">Rs. {order.totalPrice.toLocaleString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">Ordered on {new Date(order.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 p-4 bg-cream-50 dark:bg-dark-800 rounded-2xl border border-gold-400/5">
                   <div className="w-10 h-10 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center text-xs font-bold">
                      {order.seller.user.name[0]}
                   </div>
                   <div>
                      <p className="text-xs font-bold text-gray-500">Seller: {order.seller.user.name}</p>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-tighter">Verified Marketplace Vendor</p>
                   </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                   <Link href={`/customer/orders/${order.id}`} className="px-6 py-3 bg-white dark:bg-dark-800 border-2 border-gold-400/20 text-gold-400 rounded-pill text-sm font-bold hover:bg-gold-400/5 transition-all">
                      View Details
                   </Link>
                   
                   {order.status === 'SHIPPED' && (
                     <Link href={`/customer/orders/${order.id}/track`} className="px-6 py-3 bg-gold-400/10 text-gold-400 rounded-pill text-sm font-bold flex items-center gap-2">
                        <Truck className="w-4 h-4" /> Track Order
                     </Link>
                   )}

                   {order.status === 'DELIVERED' && (
                     <button 
                      onClick={() => confirmReceipt.mutate(order.id)}
                      className="px-6 py-3 bg-emerald-500 text-white rounded-pill text-sm font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-2 hover:scale-105 transition-all"
                     >
                        <CheckCircle2 className="w-4 h-4" /> Confirm Receipt
                     </button>
                   )}

                   {order.status === 'CONFIRMED' && (
                     <button className="px-6 py-3 bg-gold-400 text-white rounded-pill text-sm font-bold shadow-gold flex items-center gap-2 hover:scale-105 transition-all">
                        <MessageSquare className="w-4 h-4" /> Write Review
                     </button>
                   )}

                   {['PAID', 'SHIPPED', 'DELIVERED'].includes(order.status) && (
                     <Link href={`/customer/orders/${order.id}/dispute`} className="px-6 py-3 text-red-500 font-bold text-xs hover:underline ml-auto">
                        Open Dispute
                     </Link>
                   )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

function getStatusStyle(status: string) {
  switch (status) {
    case 'PENDING': return 'bg-amber-500/10 text-amber-500';
    case 'PAID': return 'bg-blue-500/10 text-blue-500';
    case 'SHIPPED': return 'bg-purple-500/10 text-purple-500';
    case 'DELIVERED': return 'bg-teal-500/10 text-teal-500';
    case 'CONFIRMED': return 'bg-emerald-500/10 text-emerald-500';
    case 'DISPUTED': return 'bg-red-500/10 text-red-500';
    case 'CANCELLED': return 'bg-gray-500/10 text-gray-500';
    default: return 'bg-gray-500/10 text-gray-500';
  }
}

function OrderSkeleton() {
  return (
    <div className="h-64 bg-white dark:bg-dark-900 rounded-[32px] animate-pulse border border-gold-400/5 flex gap-8 p-8">
       <div className="w-40 bg-gold-400/5 rounded-2xl h-full" />
       <div className="flex-1 space-y-4">
          <div className="h-6 bg-gold-400/5 rounded w-1/3" />
          <div className="h-10 bg-gold-400/5 rounded w-1/2" />
          <div className="h-20 bg-gold-400/5 rounded-2xl" />
       </div>
    </div>
  );
}
