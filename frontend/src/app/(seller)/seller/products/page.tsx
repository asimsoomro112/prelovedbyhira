'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { 
    api.get('/seller/products')
      .then((r: any) => setProducts(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false)); 
  }, []);

  const handleDelete = async (id: string) => { 
    if (!confirm('Delete this product?')) return; 
    try { 
      await api.delete(`/seller/products/${id}`); 
      setProducts(products.filter(p => p.id !== id)); 
      toast.success('Product deleted successfully'); 
    } catch { 
      toast.error('Failed to delete product'); 
    } 
  };

  if (isLoading) return <div className="min-h-screen pt-28 flex items-center justify-center"><div className="w-10 h-10 border-2 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="min-h-screen pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">My Products</h1>
          <Link href="/seller/add-product" className="px-6 py-3 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Link>
        </div>
        
        {products.length === 0 ? (
          <div className="text-center py-20 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10">
            <p className="text-gray-500 mb-4 font-bold uppercase text-xs tracking-widest">No products yet</p>
            <Link href="/seller/add-product" className="px-10 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold inline-block">Add Your First Product</Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {products.map(p => (
              <div key={p.id} className="bg-white dark:bg-dark-900 p-4 rounded-[24px] border border-gold-400/10 flex items-center gap-4 hover:border-gold-400/30 transition-all shadow-soft">
                <div className="w-16 h-16 rounded-xl bg-gold-400/5 overflow-hidden flex-shrink-0">
                  {p.images?.[0] && <img src={p.images[0]} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm line-clamp-1">{p.title}</p>
                  <p className="text-xs text-gray-500 font-medium">{p.category} • Rs. {p.sellingPrice.toLocaleString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-pill text-[10px] font-bold ${p.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                  {p.status}
                </span>
                <div className="flex gap-1">
                  <Link href={`/product/${p.id}`} className="p-2 rounded-lg hover:bg-gold-400/10 text-gray-400 hover:text-gold-400 transition-all">
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
