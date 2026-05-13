'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { Wallet, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminPayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayouts = () => { 
    setIsLoading(true); 
    api.get('/admin/payouts')
      .then((r: any) => setPayouts(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false)); 
  };

  useEffect(() => { fetchPayouts(); }, []);

  const handlePayout = async (id: string, status: string) => { 
    try { 
      await api.put(`/admin/payouts/${id}`, { status }); 
      fetchPayouts(); 
      toast.success(`Payout ${status.toLowerCase()} successfully`); 
    } catch { 
      toast.error('Failed to update payout'); 
    } 
  };

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h1 className="text-4xl font-display font-bold mb-12">Seller Payouts</h1>

        <div className="bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-cream-50 dark:bg-dark-950/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                  <th className="px-8 py-6">Seller</th>
                  <th className="px-8 py-6">Amount</th>
                  <th className="px-8 py-6">Method</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/10">
                {isLoading ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">Loading payouts...</td></tr>
                ) : payouts.length === 0 ? (
                  <tr><td colSpan={5} className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest">No pending payouts</td></tr>
                ) : payouts.map(p => (
                  <tr key={p.id} className="hover:bg-gold-400/5 transition-colors group">
                    <td className="px-8 py-6">
                      <p className="font-bold text-dark-900 dark:text-cream-50">{p.seller?.user?.name || 'Unknown Seller'}</p>
                      <p className="text-xs text-gray-500">{p.seller?.user?.email || 'N/A'}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="font-accent font-bold text-gold-400 text-lg">Rs. {p.amount.toLocaleString()}</p>
                    </td>
                    <td className="px-8 py-6 text-sm font-bold text-gray-500">
                      {p.method}
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
                        p.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 
                        p.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' : 'bg-amber-500/10 text-amber-500'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      {p.status === 'PENDING' && (
                        <div className="flex justify-end gap-2">
                          <button onClick={() => handlePayout(p.id, 'COMPLETED')} className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                            <CheckCircle className="w-5 h-5" />
                          </button>
                          <button onClick={() => handlePayout(p.id, 'REJECTED')} className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm">
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      )}
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
