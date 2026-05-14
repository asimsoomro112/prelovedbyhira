'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Package, 
  ArrowRight, 
  Search, 
  Filter, 
  AlertCircle, 
  X,
  CheckCircle2,
  TrendingUp,
  History,
  LayoutGrid,
  List as ListIcon,
  Tag,
  Layers,
  ChevronRight,
  Minus,
  Lock
} from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/api';
import Image from 'next/image';

export default function SellerProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/seller/products');
      setProducts(data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to de-list this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      setProducts(products.filter(p => p.id !== id));
      toast.success('Product de-listed successfully');
    } catch (error) {
      toast.error('Failed to delete product');
    }
  };

  const handleUpdateStock = async (id: string, currentStock: any, delta: number) => {
    const baseStock = parseInt(currentStock?.toString() || "0") || 0;
    const newStock = Math.max(0, baseStock + delta);
    if (newStock === baseStock) return;

    try {
      await api.put(`/products/${id}`, { stock: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast.success(`Stock updated to ${newStock}`);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleManualStockChange = async (id: string, value: string) => {
    const newStock = parseInt(value);
    if (isNaN(newStock) || newStock < 0) return;

    try {
      await api.put(`/products/${id}`, { stock: newStock });
      setProducts(products.map(p => p.id === id ? { ...p, stock: newStock } : p));
      toast.success(`Stock set to ${newStock}`);
    } catch (error) {
      toast.error('Failed to update stock');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const { id, title, description, size, category, condition, stock } = editingProduct;
      await api.put(`/products/${id}`, { title, description, size, category, condition, stock });
      
      setProducts(products.map(p => p.id === id ? { ...p, title, description, size, category, condition, stock } : p));
      setIsEditModalOpen(false);
      toast.success('Product details updated');
    } catch (error) {
      toast.error('Failed to update product details');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-gray-50 dark:bg-dark-950">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
        <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">Loading Inventory...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 pt-24 pb-24 lg:pt-32">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-gold-400">
              <Package className="w-5 h-5" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">Inventory Management</span>
            </div>
            <h1 className="text-4xl lg:text-5xl font-display font-bold text-dark-900 dark:text-cream-50 leading-tight">My <span className="italic text-gold-400">Products.</span></h1>
            <p className="text-gray-500 text-sm max-w-md">Manage your luxury listings, track stock levels, and update piece details.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex bg-white dark:bg-dark-900 rounded-2xl p-1 border border-gold-400/10 shadow-sm">
              <button onClick={() => setViewMode('list')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'list' ? 'bg-gold-400 text-white shadow-gold' : 'text-gray-400 hover:text-gold-400'}`}>
                <ListIcon className="w-5 h-5" />
              </button>
              <button onClick={() => setViewMode('grid')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'grid' ? 'bg-gold-400 text-white shadow-gold' : 'text-gray-400 hover:text-gold-400'}`}>
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
            <Link href="/seller/add-product" className="h-14 px-8 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3">
              <Plus className="w-5 h-5" /> Add New Piece
            </Link>
          </div>
        </div>

        {/* Toolbar Section */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-gold-400 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by title or brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-14 pl-12 pr-4 bg-white dark:bg-dark-900 border border-gold-400/10 rounded-2xl outline-none focus:border-gold-400/40 transition-all text-sm font-medium shadow-sm"
            />
          </div>
          <div className="flex gap-4">
             <div className="h-14 px-5 bg-white dark:bg-dark-900 border border-gold-400/10 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Active Items</p>
                   <p className="text-sm font-black text-dark-900 dark:text-cream-50">{products.filter(p => p.status === 'ACTIVE').length}</p>
                </div>
             </div>
             <div className="h-14 px-5 bg-white dark:bg-dark-900 border border-gold-400/10 rounded-2xl flex items-center gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <div>
                   <p className="text-[9px] font-bold text-gray-400 uppercase leading-none mb-0.5">Pending</p>
                   <p className="text-sm font-black text-dark-900 dark:text-cream-50">{products.filter(p => p.status === 'PENDING').length}</p>
                </div>
             </div>
          </div>
        </div>

        {/* Products Display */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-32 bg-white dark:bg-dark-900 rounded-[48px] border border-gold-400/10 shadow-sm space-y-6">
            <div className="w-24 h-24 bg-gold-400/10 text-gold-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-12 h-12" />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-display font-bold">No Pieces Found</h3>
              <p className="text-gray-500 text-sm max-w-xs mx-auto">
                {searchQuery ? `We couldn't find any items matching "${searchQuery}"` : "You haven't listed any products in the vault yet."}
              </p>
            </div>
            {!searchQuery && (
              <Link href="/seller/add-product" className="inline-flex h-14 px-10 items-center bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all">
                List Your First Item
              </Link>
            )}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProducts.map(p => (
              <motion.div 
                layout
                key={p.id} 
                className={`bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10 hover:border-gold-400/30 transition-all shadow-sm group overflow-hidden ${viewMode === 'list' ? 'flex flex-col md:flex-row items-center p-3 gap-6' : ''}`}
              >
                {/* Image Container */}
                <div className={`relative flex-shrink-0 bg-gray-50 dark:bg-dark-800 rounded-2xl overflow-hidden ${viewMode === 'list' ? 'w-24 h-24 md:w-32 md:h-32' : 'aspect-[4/3] w-full'}`}>
                   {p.images?.[0] ? (
                     <div className="relative w-full h-full">
                       <Image src={p.images[0]} alt={p.title} fill className="object-cover group-hover:scale-110 transition-transform duration-[2s]" />
                     </div>
                   ) : (
                     <div className="w-full h-full flex items-center justify-center text-gold-400/20">
                       <Package className="w-12 h-12" />
                     </div>
                   )}
                   <div className="absolute top-3 left-3 flex flex-col gap-2">
                      <span className={`px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${
                        p.status === 'ACTIVE' ? 'bg-emerald-500/80 text-white border-white/20' : 
                        p.status === 'PENDING' ? 'bg-amber-500/80 text-white border-white/20' : 
                        'bg-red-500/80 text-white border-white/20'
                      }`}>
                        {p.status}
                      </span>
                   </div>
                </div>

                {/* Content Container */}
                <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'pr-4' : 'p-6'}`}>
                   <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="min-w-0">
                         <p className="text-[10px] font-black text-gold-400 uppercase tracking-widest mb-1">{p.brand}</p>
                         <h3 className="text-lg font-bold text-dark-900 dark:text-cream-50 truncate leading-tight group-hover:text-gold-400 transition-colors">{p.title}</h3>
                      </div>
                      <div className="text-right shrink-0">
                         <p className="text-lg font-accent font-bold text-gold-400 leading-none mb-1">Rs. {p.sellingPrice.toLocaleString()}</p>
                         <p className="text-[10px] text-gray-400 font-medium line-through">Rs. {p.originalPrice.toLocaleString()}</p>
                      </div>
                   </div>

                   <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-4 pb-4 border-b border-gold-400/5">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                        <Tag className="w-3.5 h-3.5 text-gold-400" /> {p.category}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                        <History className="w-3.5 h-3.5 text-gold-400" /> {p.condition}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 font-bold">
                        <span className="w-1 h-1 bg-gold-400 rounded-full" /> Size {p.size}
                      </div>
                   </div>

                   {/* Stock Control & Actions */}
                   <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-3">
                         <div className="flex items-center bg-gray-50 dark:bg-dark-800 rounded-xl border border-gold-400/10 p-1">
                            <button 
                              onClick={() => handleUpdateStock(p.id, p.stock, -1)}
                              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-gray-400 hover:text-red-500 transition-all flex items-center justify-center active:scale-90"
                              title="Decrease Stock"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <div className="px-2 flex flex-col items-center">
                               <p className="text-[7px] font-bold text-gray-400 uppercase leading-none mb-1">Stock</p>
                               <input 
                                 type="number"
                                 min="0"
                                 value={p.stock ?? 0}
                                 onChange={(e) => {
                                   const val = e.target.value;
                                   setProducts(products.map(item => item.id === p.id ? { ...item, stock: val === '' ? '' : parseInt(val) } : item));
                                 }}
                                 onBlur={(e) => handleManualStockChange(p.id, e.target.value)}
                                 onKeyDown={(e) => e.key === 'Enter' && handleManualStockChange(p.id, (e.target as HTMLInputElement).value)}
                                 className={`w-10 bg-transparent text-center text-sm font-black outline-none border-b border-transparent focus:border-gold-400/30 transition-all ${p.stock === 0 ? 'text-red-500' : 'text-dark-900 dark:text-cream-50'}`}
                                 aria-label="Stock quantity"
                               />
                            </div>
                            <button 
                              onClick={() => handleUpdateStock(p.id, p.stock, 1)}
                              className="w-8 h-8 rounded-lg hover:bg-white dark:hover:bg-dark-700 text-gray-400 hover:text-emerald-500 transition-all flex items-center justify-center active:scale-90"
                              title="Increase Stock"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                         </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/product/${p.id}`} 
                          className="w-10 h-10 rounded-xl bg-gold-400/5 text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button 
                          onClick={() => { setEditingProduct(p); setIsEditModalOpen(true); }}
                          className="w-10 h-10 rounded-xl bg-gold-400/5 text-gray-400 hover:text-gold-400 hover:bg-gold-400/10 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(p.id)}
                          className="w-10 h-10 rounded-xl bg-red-500/5 text-red-400 hover:text-red-600 hover:bg-red-500/10 transition-all flex items-center justify-center active:scale-90"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Product Modal */}
      <AnimatePresence>
        {isEditModalOpen && editingProduct && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setIsEditModalOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white dark:bg-dark-950 rounded-[40px] shadow-2xl border border-gold-400/20 overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Modal Header */}
              <div className="px-8 py-6 border-b border-gold-400/10 flex items-center justify-between bg-gold-400/5">
                <div className="flex items-center gap-3">
                   <div className="w-10 h-10 rounded-xl bg-gold-400/20 flex items-center justify-center text-gold-400">
                     <Edit className="w-5 h-5" />
                   </div>
                   <div>
                     <h2 className="text-xl font-display font-bold text-dark-900 dark:text-cream-50">Edit Piece</h2>
                     <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Update vault listing</p>
                   </div>
                </div>
                <button onClick={() => setIsEditModalOpen(false)} className="w-10 h-10 rounded-full hover:bg-gray-100 dark:hover:bg-dark-800 flex items-center justify-center text-gray-400 transition-all">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Body */}
              <form onSubmit={handleEditSubmit} className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-none">
                 <div className="grid md:grid-cols-2 gap-6">
                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Piece Title</label>
                       <input 
                         value={editingProduct.title}
                         onChange={e => setEditingProduct({...editingProduct, title: e.target.value})}
                         className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-900 border border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-all text-sm font-medium"
                       />
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Category</label>
                       <select 
                         value={editingProduct.category}
                         onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                         className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-900 border border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-all text-sm font-bold"
                       >
                         <option value="SHADI-WEAR">Shadi & Formal</option>
                         <option value="BRIDAL">Luxury Bridal</option>
                         <option value="KURTAS">Kurtas & Shirts</option>
                         <option value="SHOES">Shoes</option>
                         <option value="WATCHES">Watches</option>
                         <option value="BAGS">Handbags</option>
                       </select>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Size</label>
                       <input 
                         value={editingProduct.size}
                         onChange={e => setEditingProduct({...editingProduct, size: e.target.value})}
                         className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-900 border border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-all text-sm font-medium"
                       />
                    </div>

                    <div className="space-y-2 opacity-60">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1 flex items-center gap-2">
                         Selling Price (Locked) <Lock className="w-2.5 h-2.5" />
                       </label>
                       <div className="w-full h-14 px-5 bg-gray-100 dark:bg-dark-800 border border-gray-200 dark:border-dark-700 rounded-2xl flex items-center text-sm font-bold text-gray-500 cursor-not-allowed">
                         Rs. {editingProduct.sellingPrice.toLocaleString()}
                       </div>
                       <p className="text-[9px] text-amber-500 font-bold mt-1 px-1 flex items-center gap-1">
                         <AlertCircle className="w-3 h-3" /> Price cannot be changed after listing.
                       </p>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Stock Quantity</label>
                       <input 
                         type="number"
                         min="0"
                         value={editingProduct.stock}
                         onChange={e => setEditingProduct({...editingProduct, stock: parseInt(e.target.value) || 0})}
                         className="w-full h-14 px-5 bg-gray-50 dark:bg-dark-900 border border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-all text-sm font-bold"
                       />
                    </div>

                    <div className="md:col-span-2 space-y-2">
                       <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block px-1">Description</label>
                       <textarea 
                         rows={4}
                         value={editingProduct.description}
                         onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                         className="w-full p-5 bg-gray-50 dark:bg-dark-900 border border-gold-400/10 rounded-3xl outline-none focus:border-gold-400 transition-all text-sm font-medium resize-none"
                       />
                    </div>
                 </div>
              </form>

              {/* Modal Footer */}
              <div className="px-8 py-6 border-t border-gold-400/10 flex items-center justify-end gap-4 bg-gray-50 dark:bg-dark-950">
                 <button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-6 py-3 text-sm font-bold text-gray-500 hover:text-dark-900 dark:hover:text-white transition-colors"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleEditSubmit}
                   disabled={isUpdating}
                   className="h-14 px-10 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                 >
                   {isUpdating ? "Saving Changes..." : "Save Changes"}
                   {!isUpdating && <CheckCircle2 className="w-5 h-5" />}
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
