'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Package, ShoppingBag, User, Calendar } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => { 
    api.get('/admin/orders', { params: { status: statusFilter || undefined } })
      .then((r: any) => setOrders(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false)); 
  }, [statusFilter]);

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-display font-bold">Marketplace Orders</h1>
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)} 
            className="bg-white dark:bg-dark-900 border-2 border-gold-400/10 rounded-2xl px-6 py-3 outline-none focus:border-gold-400 transition-all font-bold text-sm shadow-soft"
          >
            <option value="">All Status</option>
            <option>PENDING</option>
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
                  <th className="px-8 py-6">Order ID</th>
                  <th className="px-8 py-6">Participants</th>
                  <th className="px-8 py-6">Financials</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6">Date</th>
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
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter truncate max-w-[120px]">{o.product?.title || 'Luxury Item'}</p>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-gold-400/10 flex items-center justify-center text-[10px] font-bold text-gold-400">{o.buyer?.name?.[0] || 'B'}</div>
                           <p className="text-xs font-bold">{o.buyer?.name || 'Unknown Buyer'}</p>
                        </div>
                        <div className="flex items-center gap-2">
                           <div className="w-6 h-6 rounded-full bg-cream-100 dark:bg-dark-800 flex items-center justify-center text-[10px] font-bold text-gray-500">{o.seller?.user?.name?.[0] || 'S'}</div>
                           <p className="text-[10px] text-gray-500 font-medium">{o.seller?.user?.name || 'Verified Merchant'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       <div className="space-y-1">
                          <p className="font-accent font-bold text-dark-900 dark:text-cream-50 text-base">Rs. {o.totalPrice?.toLocaleString()}</p>
                          <div className="flex gap-2">
                             <span className="text-[9px] font-bold text-emerald-500 uppercase">Comm: Rs. {o.platformFee?.toLocaleString()}</span>
                             <span className="text-[9px] font-bold text-blue-500 uppercase">Ship: Rs. {o.shippingCost?.toLocaleString() || '0'}</span>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-2">
                        <span className={`px-3 py-1 rounded-pill text-[9px] font-bold uppercase tracking-widest text-center ${
                          o.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 
                          o.status === 'PAID' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                          o.status === 'PAYMENT_SUBMITTED' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                          o.status === 'SHIPPED' ? 'bg-purple-500/10 text-purple-500 border border-purple-500/20' :
                          'bg-gold-400/10 text-gold-400 border border-gold-400/20'
                        }`}>
                          {o.status}
                        </span>
                        
                        {o.status === 'PAYMENT_SUBMITTED' && (
                          <button 
                            onClick={async () => {
                              if (confirm('Confirm payment receipt? AI has verified it.')) {
                                try {
                                  await api.put(`/orders/${o.id}/admin-confirm`);
                                  window.location.reload();
                                } catch (e) {
                                  alert('Failed to confirm');
                                }
                              }
                            }}
                            className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-[10px] font-bold hover:bg-emerald-600 transition-colors"
                          >
                            Confirm Payment
                          </button>
                        )}
                        
                        {o.paymentProofUrl && (
                          <a href={o.paymentProofUrl} target="_blank" className="text-[9px] font-bold text-gold-400 hover:underline text-center">View Receipt</a>
                        )}
                      </div>
                    </td>
                    <td className="px-8 py-6 text-gray-500 text-[10px] font-bold uppercase tracking-tighter">
                       <Calendar className="w-3 h-3 text-gold-400 mb-1" />
                       {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
