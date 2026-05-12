"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShoppingBag, 
  Search, 
  Filter, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ChevronRight,
  Package,
  X,
  MapPin,
  Phone
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [trackingNumber, setTrackingNumber] = useState("");
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["seller-orders", activeTab],
    queryFn: async () => {
      const { data } = await api.get("/orders/seller-orders");
      return activeTab === "ALL" ? data : data.filter((o: any) => o.status === activeTab);
    },
  });

  const shipMutation = useMutation({
    mutationFn: async ({ orderId, tracking }: { orderId: string, tracking: string }) => {
      return await api.put(`/orders/${orderId}/ship`, { trackingNumber: tracking });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
      toast.success("Order marked as shipped!");
      setSelectedOrder(null);
      setTrackingNumber("");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to update order status.");
    }
  });

  const tabs = ["ALL", "PAID", "SHIPPED", "DELIVERED", "CONFIRMED", "DISPUTED"];

  return (
    <div className="p-4 lg:p-8 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold">Manage Orders</h1>
          <p className="text-gray-500">Track your sales and ship your items to customers.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-cream-100 dark:bg-dark-900/50 p-1 rounded-2xl overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-6 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeTab === tab ? "bg-white dark:bg-dark-800 text-gold-400 shadow-soft" : "text-gray-400 hover:text-gray-600"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Orders Grid */}
      <div className="grid gap-6">
        {isLoading ? (
          Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-white dark:bg-dark-800 rounded-3xl animate-pulse" />)
        ) : orders?.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] border border-gold-400/10">
            <ShoppingBag className="w-12 h-12 text-gold-400/20 mx-auto mb-4" />
            <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">No orders found in {activeTab}</p>
          </div>
        ) : (
          orders?.map((order: any) => (
            <motion.div 
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-800 rounded-[32px] p-6 shadow-soft border border-gold-400/10 flex flex-col md:flex-row gap-8 relative group"
            >
              <div className="relative w-32 h-40 rounded-2xl overflow-hidden border border-gold-400/10 shrink-0">
                <Image src={order.product.images[0]} alt={order.product.title} fill className="object-cover" />
              </div>

              <div className="flex-1 space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <span className={`px-3 py-1 rounded-pill text-[10px] font-bold ${getStatusStyle(order.status)}`}>{order.status}</span>
                       <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">#{order.id.slice(-8)}</span>
                    </div>
                    <h3 className="text-xl font-display font-bold">{order.product.title}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-accent font-bold text-gold-400">Rs. {order.totalPrice}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Buyer: {order.buyer.name}</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6 p-4 bg-cream-50 dark:bg-dark-900/50 rounded-2xl border border-gold-400/5">
                   <div className="flex items-start gap-3">
                      <MapPin className="w-5 h-5 text-gold-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Shipping Address</p>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{order.shippingAddress.address}, {order.shippingAddress.city}</p>
                      </div>
                   </div>
                   <div className="flex items-start gap-3">
                      <Phone className="w-5 h-5 text-gold-400 shrink-0" />
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold uppercase">Buyer Contact</p>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-300">{order.shippingAddress.phone}</p>
                      </div>
                   </div>
                </div>

                <div className="flex justify-end gap-3 pt-2">
                   {order.status === 'PAID' && (
                     <button 
                      onClick={() => setSelectedOrder(order)}
                      className="px-6 py-3 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all flex items-center gap-2"
                     >
                        <Truck className="w-4 h-4" /> Mark as Shipped
                     </button>
                   )}
                   <button className="px-6 py-3 border-2 border-gold-400 text-gold-400 rounded-pill font-bold hover:bg-gold-400/10 transition-all flex items-center gap-2">
                      <ChevronRight className="w-4 h-4" /> Order Details
                   </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Shipping Modal */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white dark:bg-dark-900 rounded-[40px] p-10 z-[110] shadow-2xl border border-gold-400/10 space-y-8">
               <div className="text-center space-y-4">
                 <div className="w-20 h-20 bg-gold-400/10 text-gold-400 rounded-full flex items-center justify-center mx-auto">
                   <Truck className="w-10 h-10" />
                 </div>
                 <h2 className="text-3xl font-display font-bold">Ship Item</h2>
                 <p className="text-gray-500 text-sm">Enter the tracking number for courier service (TCS, Leopards, etc.) to notify the buyer.</p>
               </div>

               <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Tracking Number / Courier Info</label>
                    <input 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      placeholder="e.g. TCS-918239123" 
                      className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/20 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" 
                    />
                  </div>
                  <button 
                    onClick={() => shipMutation.mutate({ orderId: selectedOrder.id, tracking: trackingNumber })}
                    disabled={shipMutation.isPending || !trackingNumber}
                    className="w-full py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                  >
                    {shipMutation.isPending ? "Updating..." : "Confirm Shipping"}
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
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
    default: return 'bg-gray-500/10 text-gray-500';
  }
}
