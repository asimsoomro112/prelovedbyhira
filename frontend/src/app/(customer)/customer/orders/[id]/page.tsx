"use client";

import { useState } from "react";
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
  MessageSquare,
  AlertTriangle,
  Upload,
  X,
  Camera,
  Star
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
  
  // Re-upload state
  const [isReuploadModalOpen, setIsReuploadModalOpen] = useState(false);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Review state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [isReviewing, setIsReviewing] = useState(false);

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

  const handleReupload = async () => {
    if (!receiptFile) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receiptImage', receiptFile);
      await api.post(`/orders/${id}/submit-proof`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Receipt re-uploaded successfully! AI verification in progress.");
      setIsReuploadModalOpen(false);
      setReceiptFile(null);
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to upload receipt");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitReview = useMutation({
    mutationFn: async () => {
      return await api.post(`/orders/${id}/review`, { rating, comment });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["order-details", id] });
      toast.success("Thank you! Your review has been published.");
      setIsReviewModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to submit review.");
    }
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center animate-pulse text-gold-400 font-bold uppercase tracking-widest">Opening Vault...</div>;
  if (!order) return <div className="h-screen flex items-center justify-center text-gray-500">Order not found in the vault.</div>;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 lg:py-24 space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <Link href="/customer/orders" className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest hover:text-gold-400 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Back to My Orders
          </Link>
          <h1 className="text-fluid-section font-display font-bold">Order <span className="text-gold-400">Details</span></h1>
          <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Manifest ID: #{order.id.slice(-12)}</p>
        </div>
        <div className={`px-6 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${getStatusStyle(order.status)}`}>
           <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
           {order.status}
        </div>
      </div>

      {order.status === 'PAYMENT_SUBMITTED' && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-amber-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-amber-500/20 flex items-center gap-6"
        >
           <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
           </div>
           <div className="space-y-1">
              <p className="text-sm font-bold uppercase tracking-widest">Neural Audit in Progress</p>
              <p className="text-xs opacity-90 leading-relaxed">Receipt submitted successfully. Please wait for admin to verify your payment from the bank records.</p>
           </div>
        </motion.div>
      )}

      {order.paymentRejected && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-500 rounded-3xl p-6 md:p-8 text-white shadow-xl shadow-red-500/20 flex flex-col md:flex-row items-center justify-between gap-6"
        >
           <div className="flex items-center gap-4 text-center md:text-left">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
                 <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                 <p className="text-sm font-bold uppercase tracking-widest">Payment Rejection Audit</p>
                 <p className="text-xs opacity-90 leading-relaxed max-w-lg">Reason: {order.rejectionReason}</p>
              </div>
           </div>
           <button 
            onClick={() => setIsReuploadModalOpen(true)}
            className="px-8 py-4 bg-white text-red-500 rounded-2xl font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
           >
              Re-upload Receipt Now
           </button>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-12">
        
        {/* Left Side - Items & Status */}
        <div className="lg:col-span-2 space-y-12">
           {/* Product Card */}
            <div className="glass-ultra crystal-border rounded-3xl md:rounded-[40px] p-5 md:p-8 space-y-6 md:space-y-8">
              <div className="flex gap-4 md:gap-8">
                 <div className="relative w-24 md:w-32 aspect-[3/4] rounded-xl md:rounded-2xl overflow-hidden border border-gold-400/10 shrink-0">
                    <Image 
                      src={order.product?.images?.[0] || 'https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000'} 
                      alt={order.product?.title} 
                      fill 
                      className="object-cover" 
                    />
                 </div>
                 <div className="space-y-1 md:space-y-2">
                    <p className="text-[9px] md:text-[10px] font-bold text-gold-400 uppercase tracking-widest">{order.product?.brand}</p>
                    <h3 className="text-lg md:text-2xl font-bold leading-tight">{order.product?.title}</h3>
                    <p className="text-[10px] md:text-sm text-gray-500 font-medium">Cond: {order.product?.condition} • Size: {order.product?.size}</p>
                    <div className="flex items-center gap-2 pt-2">
                       <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center text-[8px] md:text-[10px] font-bold">
                          {order.seller?.user?.name?.[0]}
                       </div>
                       <span className="text-[10px] font-bold text-gray-500">Seller: {order.seller?.user?.name}</span>
                    </div>
                 </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gold-400/5">
                 {order.status === 'SHIPPED' && (
                   <button 
                    onClick={() => confirmReceipt.mutate()}
                    disabled={confirmReceipt.isPending}
                    className="w-full h-14 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                   >
                     <CheckCircle2 className="w-5 h-5" /> {confirmReceipt.isPending ? 'Processing...' : 'Confirm Delivery'}
                   </button>
                 )}
                 {order.status === 'SHIPPED' && (
                   <Link href={`/customer/orders/${order.id}/track`} className="w-full h-14 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 active:scale-95 transition-all">
                     <Truck className="w-5 h-5" /> Track Shipment
                   </Link>
                 )}
                  {order.status === 'CONFIRMED' && (
                    <button 
                      onClick={() => !order.reviewed && setIsReviewModalOpen(true)}
                      className={`w-full h-14 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${order.reviewed ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white dark:bg-dark-800 border-2 border-gold-400 text-gold-400 active:bg-gold-400/5"}`}
                    >
                      <MessageSquare className="w-5 h-5" /> {order.reviewed ? 'Review Submitted' : 'Write a Review'}
                    </button>
                  )}
                 {['PAID', 'SHIPPED'].includes(order.status) && (
                   <Link href={`/customer/orders/${order.id}/dispute`} className="w-full text-center text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline py-2 active:scale-95">
                      Need help? Open a Dispute
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
                       <span className="text-gray-500">Item Price {order.quantity > 1 && `(×${order.quantity})`}</span>
                       <div className="text-right">
                         <span className="font-bold">Rs. {((order.totalPrice || 0) - (order.shippingCost || 0)).toLocaleString()}</span>
                         {order.quantity > 1 && (
                           <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                             Unit: Rs. {order.unitPrice?.toLocaleString() || (order.sellingPrice || 0).toLocaleString()}
                           </p>
                         )}
                       </div>
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

      {/* Re-upload Modal */}
      {isReuploadModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 w-full max-w-md rounded-[40px] p-10 relative shadow-2xl border border-gold-400/10"
          >
            <button onClick={() => setIsReuploadModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-400/10 text-gold-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                   <Upload className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold">Re-upload Receipt</h3>
                <p className="text-sm text-gray-500 mt-2">Please upload a clear screenshot of your bank transfer.</p>
              </div>

              <div className="space-y-4">
                <label className="relative h-64 border-2 border-dashed border-gold-400/20 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gold-400/5 transition-all overflow-hidden bg-cream-50/50 dark:bg-dark-800/50">
                   <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                   />
                   {receiptFile ? (
                     <div className="relative w-full h-full">
                        <Image src={URL.createObjectURL(receiptFile)} alt="Receipt" fill className="object-cover" />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                           <Camera className="w-8 h-8 text-white" />
                        </div>
                     </div>
                   ) : (
                     <>
                       <Upload className="w-10 h-10 text-gold-400/40" />
                       <div className="text-center">
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Receipt Image</span>
                          <span className="text-[9px] text-gray-400/60 mt-1 block">JPG, PNG or PDF (Capture)</span>
                       </div>
                     </>
                   )}
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setIsReuploadModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold text-gray-500 active:scale-95 transition-all">Cancel</button>
                <button 
                  disabled={!receiptFile || isSubmitting}
                  onClick={handleReupload}
                  className="flex-[2] py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold disabled:opacity-50 active:scale-95 transition-all"
                >
                  {isSubmitting ? 'Uploading...' : 'Confirm Upload 🚀'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-dark-900 w-full max-w-md rounded-[40px] p-10 relative shadow-2xl border border-gold-400/10"
          >
            <button onClick={() => setIsReviewModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-gold-400/10 text-gold-400 rounded-3xl flex items-center justify-center mx-auto mb-4">
                   <Star className="w-8 h-8 fill-gold-400" />
                </div>
                <h3 className="text-2xl font-display font-bold">Share Your <span className="text-gold-400">Experience</span></h3>
                <p className="text-sm text-gray-500 mt-2">Rate your luxury purchase and help other members of the community.</p>
              </div>

              <div className="flex justify-center gap-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <button 
                    key={s} 
                    onClick={() => setRating(s)}
                    className="p-1 transition-transform active:scale-90"
                  >
                    <Star className={`w-10 h-10 ${s <= rating ? "text-gold-400 fill-gold-400" : "text-gray-200 dark:text-dark-700"}`} />
                  </button>
                ))}
              </div>

              <div className="space-y-4">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Your Feedback</label>
                <textarea 
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about the quality, packaging, and overall experience..."
                  className="w-full h-32 bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 focus:border-gold-400 rounded-2xl p-5 text-sm outline-none transition-all resize-none"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <button onClick={() => setIsReviewModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold text-gray-500 active:scale-95 transition-all">Cancel</button>
                <button 
                  disabled={submitReview.isPending}
                  onClick={() => submitReview.mutate()}
                  className="flex-[2] py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  {submitReview.isPending ? 'Publishing...' : 'Publish Review 🚀'}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
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
