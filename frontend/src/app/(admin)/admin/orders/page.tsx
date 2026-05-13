'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, ShoppingBag, User, Calendar, ShieldCheck, CheckCircle2, Eye, X, Upload, Camera, ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  // Confirmation Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchOrders = () => {
    setIsLoading(true);
    api.get('/admin/orders', { params: { status: statusFilter || undefined } })
      .then((r: any) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  };

  useEffect(() => { fetchOrders(); }, [statusFilter]);

  const handleOpenConfirm = (id: string) => {
    setSelectedOrderId(id);
    setReceiptFile(null);
    setIsModalOpen(true);
  };

  const handleConfirmPayment = async () => {
    if (!selectedOrderId) return;
    if (!receiptFile) {
      toast.error('Please upload bank receipt proof');
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('receiptImage', receiptFile);

      await api.put(`/orders/${selectedOrderId}/admin-confirm`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Payment confirmed and seller notified! ✨');
      setIsModalOpen(false);
      fetchOrders();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to confirm payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl font-display font-bold">Marketplace Orders</h1>
            <p className="text-gray-500">Oversee neural audits and facilitate secure payments.</p>
          </div>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="bg-white dark:bg-dark-900 border-2 border-gold-400/10 rounded-2xl px-6 py-3 outline-none focus:border-gold-400 transition-all font-bold text-sm shadow-soft"
          >
            <option value="">All Status</option>
            <option>PENDING</option>
            <option>PAYMENT_SUBMITTED</option>
            <option>PAID</option>
            <option>SHIPPED</option>
            <option>DELIVERED</option>
            <option>CONFIRMED</option>
            <option>DISPUTED</option>
            <option>CANCELLED</option>
          </select>
        </div>

        <div className="bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream-50 dark:bg-dark-950/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Order & Product</th>
                  <th className="px-8 py-6">Participants</th>
                  <th className="px-8 py-6">Financials</th>
                  <th className="px-8 py-6">Status & AI Scan</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/10">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest animate-pulse">Retrieving vault records...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No orders found</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-gold-400/5 transition-colors group">
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="font-bold text-sm text-gold-400 font-mono">#{o.id.slice(-8).toUpperCase()}</p>
                          <p className="text-[11px] text-dark-900 dark:text-cream-50 font-bold leading-tight">{o.product?.title || 'Luxury Item'}</p>
                          <p className="text-[9px] text-gray-400 uppercase tracking-tighter">{new Date(o.createdAt).toLocaleDateString()}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                           <p className="text-xs font-bold text-dark-900 dark:text-cream-50"><span className="text-[9px] text-gray-400 uppercase mr-1">B:</span> {o.buyer?.name || 'Unknown Buyer'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <p className="text-[10px] text-gray-500 font-medium"><span className="text-[9px] text-gray-400 uppercase mr-1">S:</span> {o.seller?.user?.name || 'Verified Merchant'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="font-accent font-bold text-dark-900 dark:text-cream-50 text-base">Rs. {o.totalPrice?.toLocaleString()}</p>
                          <div className="flex flex-col">
                             <span className="text-[9px] font-bold text-emerald-500 uppercase">Comm: Rs. {o.platformFee?.toLocaleString()}</span>
                             <span className="text-[9px] font-bold text-blue-500 uppercase">Ship: Rs. {o.shippingCost?.toLocaleString() || '0'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`w-fit px-3 py-1 rounded-pill text-[9px] font-bold uppercase tracking-widest border ${
                          o.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                          o.status === 'PAID' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20' :
                          o.status === 'PAYMENT_SUBMITTED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                          o.status === 'SHIPPED' ? 'bg-purple-500/10 text-purple-500 border-purple-500/20' :
                          'bg-gold-400/10 text-gold-400 border-gold-400/20'
                        }`}>
                          {o.status}
                        </span>
                        
                        {o.aiVerified && (
                          <div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
                            <ShieldCheck className="w-3 h-3" /> AI Verified
                          </div>
                        )}

                        {o.paymentProofUrl && (
                          <a href={o.paymentProofUrl} target="_blank" className="inline-flex items-center gap-1 text-[9px] font-bold text-gold-400 hover:underline">
                            <Eye className="w-3 h-3" /> View Customer Receipt
                          </a>
                        )}
                        
                        {o.adminReceiptUrl && (
                          <a href={o.adminReceiptUrl} target="_blank" className="inline-flex items-center gap-1 text-[9px] font-bold text-blue-500 hover:underline">
                            <CheckCircle2 className="w-3 h-3" /> View Admin Receipt
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                       {o.status === 'PAYMENT_SUBMITTED' && (
                         <button 
                           onClick={() => handleOpenConfirm(o.id)}
                           className="px-6 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all"
                         >
                           Confirm & Upload Proof
                         </button>
                       )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-[40px] p-10 relative shadow-2xl border border-gold-400/10">
            <button onClick={() => setIsModalOpen(false)} className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gold-400">
              <X className="w-6 h-6" />
            </button>
            
            <div className="space-y-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
                   <ShieldCheck className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-display font-bold">Confirm Payment</h3>
                <p className="text-sm text-gray-500 mt-2">Please upload the official bank/wallet receipt as proof for the seller.</p>
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
                          <span className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest">Select Admin Receipt</span>
                          <span className="text-[9px] text-gray-400/60 mt-1 block">JPG, PNG or PDF (Capture)</span>
                       </div>
                     </>
                   )}
                </label>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setIsModalOpen(false)} className="flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold text-gray-500">Cancel</button>
                <button 
                  disabled={!receiptFile || isSubmitting}
                  onClick={handleConfirmPayment}
                  className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                >
                  {isSubmitting ? 'Verifying...' : 'Confirm & Notify Seller 🚀'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
