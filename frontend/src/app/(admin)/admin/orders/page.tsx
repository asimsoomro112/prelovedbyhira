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
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Retrieving orders...</td></tr>
                ) : orders.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No orders found</td></tr>
                ) : orders.map(o => (
                  <tr key={o.id} className="hover:bg-gold-400/5 transition-colors group">
                    <td className="px-8 py-6 font-bold text-sm text-gold-400">
                      #{o.id.slice(0, 8)}
                    </td>
                    <td className="px-8 py-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold flex items-center gap-2">
                          <User className="w-3 h-3 text-gold-400" /> {o.buyer.name} (Buyer)
                        </p>
                        <p className="text-xs text-gray-500 flex items-center gap-2">
                          <ShoppingBag className="w-3 h-3" /> {o.seller.user.name} (Seller)
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-accent font-bold text-dark-900 dark:text-cream-50">Rs. {o.totalPrice.toLocaleString()}</p>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Fee: Rs. {o.platformFee}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
                        o.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-500' : 
                        o.status === 'DISPUTED' ? 'bg-red-500/10 text-red-500' : 'bg-gold-400/10 text-gold-400'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-gray-500 text-xs font-medium flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
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
