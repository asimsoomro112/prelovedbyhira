"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { 
  ChevronLeft, 
  Package, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  Phone, 
  Calendar,
  ShieldCheck,
  ArrowRight,
  MessageSquare
} from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

export default function OrderDetailsPage() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order-details", id],
    queryFn: async () => {
      const { data } = await api.get(`/orders/${id}`);
      return data;
    },
  });

  const confirmReceipt = useMutation({
    mutationFn: async () => {
      return await api.put(`/orders/${id}/confirm-delivery`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
      toast.success("Delivery confirmed! Your escrow has been released.");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to confirm delivery.");
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-gold-400 font-bold uppercase tracking-widest">Opening Vault...</div>;
  if (!order) return <div className="h-screen flex items-center justify-center text-gray-500">Order not found in the vault.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/customer/orders" className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gold-400 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <h1 className="text-4xl font-display font-bold">Order <span className="text-gold-400">Details</span></h1>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Manifest ID: #{order.id.slice(-12)}</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(order.status)}`}>
           <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
           {order.status}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Left Side - Items & Status */}
        <div className="lg:col-span-2 space-y-12">
           {/* Product Card */}
           <div className="glass-ultra crystal-border rounded-[40px] p-8 space-y-8">
              <div className="flex gap-8">
                 <div className="relative w-32 aspect-[3/4] rounded-2xl overflow-hidden border border-gold-400/10 shrink-0">
                    <Image 
                      src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000'} 
                      alt={order.product?.title} 
                      fill 
                      className="object-cover" 
                    />
                 </div>
                 <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{order.product?.brand}</p>
                    <h3 className="text-2xl font-bold">{order.product?.title}</h3>
                    <p className="text-sm text-gray-500 font-medium">Condition: {order.product?.condition} • Size: {order.product?.size}</p>
                    <div className="flex items-center gap-3 pt-2">
                       <div className="w-8 h-8 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center text-[10px] font-bold">
                          {order.seller?.user?.name?.[0]}
                       </div>
                       <span className="text-xs font-bold text-gray-500">Seller: {order.seller?.user?.name}</span>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-4 pt-4 border-t border-gold-400/5">
                 {order.status === 'SHIPPED' && (
                   <button 
                    onClick={() => confirmReceipt.mutate()}
                    disabled={confirmReceipt.isPending}
                    className="flex-1 min-w-[200px] h-14 bg-emerald-500 text-white rounded-pill font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 hover:scale-105 transition-all"
                   >
                     <CheckCircle2 className="w-5 h-5" /> {confirmReceipt.isPending ? 'Processing...' : 'Confirm Delivery'}
                   </button>
                 )}
                 {order.status === 'SHIPPED' && (
                   <Link href={`/customer/orders/${order.id}/track`} className="flex-1 min-w-[200px] h-14 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center justify-center gap-2 hover:scale-105 transition-all">
                     <Truck className="w-5 h-5" /> Track Shipment
                   </Link>
                 )}
                 {order.status === 'CONFIRMED' && (
                   <button className="flex-1 min-w-[200px] h-14 bg-white dark:bg-dark-800 border-2 border-gold-400 text-gold-400 rounded-pill font-bold flex items-center justify-center gap-2 hover:bg-gold-400/5 transition-all">
                     <MessageSquare className="w-5 h-5" /> Write a Review
                   </button>
                 )}
                 {['PAID', 'SHIPPED'].includes(order.status) && (
                   <Link href={`/customer/orders/${order.id}/dispute`} className="w-full text-center text-xs font-bold text-red-500 hover:underline py-2">
                      Need to report an issue? Open a Dispute
                   </Link>
                 )}
              </div>
           </div>

           {/* Delivery Manifest */}
           <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center gap-3">
                 <MapPin className="w-6 h-6 text-gold-400" /> Shipping Manifest
              </h3>
              <div className="glass-ultra crystal-border rounded-[32px] p-8 grid md:grid-cols-2 gap-8">
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Recipient</p>
                       <p className="font-bold">{order.shippingAddress?.fullName || order.shippingAddress?.name}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Contact</p>
                       <p className="font-bold">{order.shippingAddress?.phone}</p>
                    </div>
                 </div>
                 <div className="space-y-4">
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Destination</p>
                       <p className="font-bold leading-relaxed">{order.shippingAddress?.address}, {order.shippingAddress?.city}</p>
                    </div>
                    <div>
                       <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">Method</p>
                       <p className="font-bold">Standard Insured Delivery</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        {/* Right Side - Summary */}
        <div className="space-y-8">
           <div className="glass-ultra rounded-[40px] border border-gold-400/10 overflow-hidden shadow-gold-3d">
              <div className="bg-gold-400 p-8 text-white">
                 <h3 className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-80 mb-2">Order Summary</h3>
                 <p className="text-3xl font-accent font-bold">Rs. {order.totalPrice.toLocaleString()}</p>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Item Price</span>
                       <span className="font-bold">Rs. {((order.totalPrice || 0) - (order.shippingCost || 0)).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                       <span className="text-gray-500">Shipping Cost</span>
                       <span className="font-bold">Rs. {(order.shippingCost || 0).toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-gold-400/10 my-4" />
                    <div className="flex justify-between items-center">
                       <span className="font-bold uppercase tracking-widest text-[10px]">Total Paid</span>
                       <span className="text-2xl font-accent font-bold text-gold-400">Rs. {order.totalPrice.toLocaleString()}</span>
                    </div>
                 </div>

                 <div className="pt-6 border-t border-gold-400/5 space-y-4">
                    <div className="flex items-start gap-3">
                       <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Escrow Active</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">Your funds are held safely. We only release them once you verify the item.</p>
                       </div>
                    </div>
                    <div className="flex items-start gap-3">
                       <Calendar className="w-5 h-5 text-gold-400 shrink-0" />
                       <div>
                          <p className="text-[10px] font-bold uppercase tracking-widest">Order Placed</p>
                          <p className="text-[10px] text-gray-500 leading-relaxed">{new Date(order.createdAt).toLocaleString()}</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <div className="p-8 glass-crystal rounded-[32px] border border-gold-400/10 text-center space-y-4">
              <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">Need Assistance?</p>
              <p className="text-xs text-gray-500 leading-relaxed">Our concierge team is ready to help with any order inquiries.</p>
              <button className="w-full h-12 border border-gold-400/20 rounded-xl text-xs font-bold hover:bg-gold-400/5 transition-all">
                 Live Chat Support
              </button>
           </div>
        </div>

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
