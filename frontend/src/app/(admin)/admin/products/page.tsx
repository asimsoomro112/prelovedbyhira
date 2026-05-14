"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  Filter, 
  Trash2, 
  Eye, 
  Tag, 
  ShoppingBag,
  MoreVertical,
  X,
  AlertTriangle,
  CheckCircle2,
  Package,
  Check,
  Ban
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminProductsPage() {
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const { data } = await api.get("/admin/products");
      return data.products || [];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/products/admin/${id}/approve`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product approved for sale! ✨");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.put(`/products/admin/${id}/reject`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.error("Product rejected from vault.");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await api.delete(`/admin/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product removed from the vault.");
      setSelectedProduct(null);
    }
  });

  const filteredProducts = productsData?.filter((p: any) => {
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "ALL" || p.status === activeTab;
    return matchesSearch && matchesTab;
  });

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 pb-32 lg:pb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">Vault</h1>
          <p className="text-gray-500 text-sm">Moderate luxury listings.</p>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 overflow-x-auto pb-2 scrollbar-none snap-x">
        {["ALL", "PENDING", "ACTIVE", "REJECTED", "SOLD"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 md:px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all snap-start shrink-0 min-h-[40px] ${
              activeTab === tab 
                ? "bg-gold-400 text-white shadow-gold" 
                : "bg-white dark:bg-dark-900 text-gray-400 border border-gold-400/10 hover:border-gold-400/30"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

        <div className="bg-white dark:bg-dark-800 rounded-3xl md:rounded-[40px] shadow-soft border border-gold-400/5 overflow-hidden text-dark-900 dark:text-white">
          <div className="p-4 md:p-6 border-b border-gold-400/10 flex flex-col sm:flex-row items-center justify-between gap-4">
             <div className="relative w-full max-w-md">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
               <input 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search products..." 
                 className="w-full bg-cream-50 dark:bg-dark-900 rounded-2xl pl-10 md:pl-12 pr-4 py-3 text-sm outline-none border border-transparent focus:border-gold-400 transition-all font-medium min-h-[44px]" 
               />
             </div>
             <div className="hidden sm:flex items-center gap-4">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredProducts?.length || 0} Items</p>
             </div>
          </div>

          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-cream-50 dark:bg-dark-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
                <tr>
                  <th className="px-8 py-6">Product</th>
                  <th className="px-8 py-6">Seller</th>
                  <th className="px-8 py-6">Price</th>
                  <th className="px-8 py-6">Status</th>
                  <th className="px-8 py-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-400/10">
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => <tr key={i} className="animate-pulse h-20 bg-gold-400/5" />)
                ) : filteredProducts?.map((product: any) => (
                  <tr key={product.id} className="hover:bg-gold-400/5 transition-all group">
                     <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border border-gold-400/10">
                            <Image src={product.images[0] || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                          </div>
                          <div>
                             <p className="text-sm font-bold truncate max-w-[200px]">{product.title}</p>
                             <p className="text-[10px] text-gold-400 font-bold uppercase">{product.brand}</p>
                          </div>
                        </div>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-medium">{product.seller?.user?.name || "Member"}</p>
                     </td>
                     <td className="px-8 py-6">
                        <p className="text-sm font-bold text-emerald-500">Rs. {product.sellingPrice.toLocaleString()}</p>
                     </td>
                     <td className="px-8 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                          product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                          product.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                          product.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                          'bg-gray-500/10 text-gray-500'
                        }`}>
                          {product.status}
                        </span>
                     </td>
                     <td className="px-8 py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {product.status === 'PENDING' && (
                            <>
                              <button 
                                onClick={() => approveMutation.mutate(product.id)}
                                className="p-3 bg-emerald-500/10 text-emerald-500 rounded-xl hover:bg-emerald-500 hover:text-white transition-all min-h-[44px]"
                                title="Approve"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => rejectMutation.mutate(product.id)}
                                className="p-3 bg-amber-500/10 text-amber-500 rounded-xl hover:bg-amber-500 hover:text-white transition-all min-h-[44px]"
                                title="Reject"
                              >
                                <Ban className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          <Link 
                            href={`/product/${product.id}`} 
                            target="_blank"
                            className="p-3 bg-gold-400/10 text-gold-400 rounded-xl hover:bg-gold-400 hover:text-white transition-all min-h-[44px]"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => setSelectedProduct(product)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all min-h-[44px]"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                     </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* ✅ Mobile Card View */}
          <div className="md:hidden divide-y divide-gold-400/10">
             {isLoading ? (
                <div className="p-10 text-center animate-pulse text-gray-400 text-[10px] font-bold uppercase tracking-widest">Scanning Vault...</div>
             ) : filteredProducts?.length === 0 ? (
                <div className="p-10 text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">Empty Vault</div>
             ) : filteredProducts?.map((product: any) => (
                <div key={product.id} className="p-4 space-y-4 active:bg-gold-400/5 transition-all">
                   <div className="flex gap-4">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gold-400/10 shrink-0">
                         <Image src={product.images[0] || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                         <div className="flex justify-between items-start">
                            <div className="min-w-0">
                               <p className="text-sm font-bold truncate leading-tight mb-0.5">{product.title}</p>
                               <p className="text-[10px] text-gold-400 font-bold uppercase tracking-widest">{product.brand}</p>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold ${
                              product.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : 
                              product.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                              'bg-gray-500/10 text-gray-500'
                            }`}>
                              {product.status}
                            </span>
                         </div>
                         <div className="flex justify-between items-end mt-2">
                            <div>
                               <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Price</p>
                               <p className="text-sm font-bold text-emerald-500">Rs. {product.sellingPrice.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                               {product.status === 'PENDING' && (
                                 <>
                                   <button 
                                     onClick={() => approveMutation.mutate(product.id)}
                                     className="w-9 h-9 bg-emerald-500/10 text-emerald-500 rounded-lg flex items-center justify-center active:scale-90"
                                   >
                                     <Check className="w-4 h-4" />
                                   </button>
                                   <button 
                                     onClick={() => rejectMutation.mutate(product.id)}
                                     className="w-9 h-9 bg-amber-500/10 text-amber-500 rounded-lg flex items-center justify-center active:scale-90"
                                   >
                                     <Ban className="w-4 h-4" />
                                   </button>
                                 </>
                               )}
                               <button 
                                 onClick={() => setSelectedProduct(product)}
                                 className="w-9 h-9 bg-red-500/10 text-red-500 rounded-lg flex items-center justify-center active:scale-90"
                               >
                                 <Trash2 className="w-4 h-4" />
                               </button>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             ))}
          </div>
        </div>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {selectedProduct && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedProduct(null)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-32px)] max-w-md bg-white dark:bg-dark-900 rounded-3xl md:rounded-[40px] p-6 md:p-8 z-[110] shadow-2xl border border-gold-400/10 space-y-6">
               <div className="w-14 h-14 md:w-16 md:h-16 bg-red-500/10 text-red-500 rounded-2xl md:rounded-full flex items-center justify-center mx-auto">
                  <AlertTriangle className="w-7 h-7 md:w-8 md:h-8" />
               </div>
               <div className="text-center space-y-2">
                  <h2 className="text-xl md:text-2xl font-display font-bold">Remove Product?</h2>
                  <p className="text-xs md:text-sm text-gray-500">This will permanently remove <span className="font-bold text-dark-900 dark:text-cream-50">{selectedProduct.title}</span>. This action cannot be undone.</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-3 pt-2 md:pt-4">
                  <button onClick={() => setSelectedProduct(null)} className="w-full sm:flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold hover:bg-gray-200 transition-all text-sm min-h-[48px]">Cancel</button>
                  <button 
                    onClick={() => deleteMutation.mutate(selectedProduct.id)}
                    className="w-full sm:flex-1 py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg shadow-red-500/20 active:scale-95 transition-all text-sm min-h-[48px]"
                  >
                    Delete Now
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
