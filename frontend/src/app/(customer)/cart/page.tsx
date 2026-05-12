"use client";

import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function CartPage() {
  const { items, removeItem, updateQuantity } = useCartStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['cart-products', items.map(i => i.id)],
    queryFn: async () => {
      if (items.length === 0) return [];
      const responses = await Promise.all(items.map(item => api.get(`/products/${item.id}`)));
      return responses.map(r => r.data);
    },
    enabled: items.length > 0
  });

  const subtotal = products?.reduce((acc, product) => {
    const item = items.find(i => i.id === product.id);
    return acc + (product.sellingPrice * (item?.quantity || 0));
  }, 0) || 0;

  const fee = subtotal > 0 ? 500 : 0; // Flat platform fee
  const total = subtotal + fee;

  return (
    <div className="max-w-7xl mx-auto px-6 py-12 lg:py-24">
      <div className="flex flex-col lg:flex-row gap-16">
        
        {/* LEFT - ITEMS */}
        <div className="flex-1 space-y-10">
          <div className="space-y-2">
             <h1 className="text-5xl font-display font-bold text-dark-900 dark:text-cream-50">Your <span className="italic text-gold-400">Bag.</span></h1>
             <p className="text-dark-500 dark:text-gray-400 font-medium">{items.length} premium preloved items selected.</p>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-20 text-center space-y-6 glass-ultra crystal-border rounded-[48px]"
                >
                   <div className="w-20 h-20 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto text-gold-400">
                      <ShoppingBag className="w-10 h-10" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-2xl font-bold">Your bag is empty</h3>
                      <p className="text-gray-500 max-w-xs mx-auto">Discover authentic preloved luxury and fill it with style.</p>
                   </div>
                   <Link href="/products" className="inline-flex h-14 px-10 items-center bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all">
                      Start Shopping
                   </Link>
                </motion.div>
              ) : (
                products?.map((product) => {
                  const item = items.find(i => i.id === product.id);
                  return (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-6 glass-ultra crystal-border rounded-[32px] flex flex-col sm:flex-row gap-8 group"
                    >
                      <div className="relative w-full sm:w-40 aspect-[3/4] rounded-2xl overflow-hidden shadow-gold-3d">
                        <Image src={product.images[0]} alt={product.title} fill className="object-cover group-hover:scale-110 transition-transform duration-700" />
                      </div>

                      <div className="flex-1 flex flex-col justify-between py-2">
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{product.brand}</p>
                            <h3 className="text-xl font-bold text-dark-900 dark:text-cream-50">{product.title}</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-tighter">Size: {product.size} • {product.condition}</p>
                          </div>
                          <button 
                            onClick={() => removeItem(product.id)}
                            className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end">
                           <div className="flex items-center glass-crystal crystal-border rounded-xl p-1 gap-4">
                              <button 
                                onClick={() => updateQuantity(product.id, Math.max(1, (item?.quantity || 1) - 1))}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gold-400/10 text-gold-400"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">{item?.quantity}</span>
                              <button 
                                onClick={() => updateQuantity(product.id, (item?.quantity || 1) + 1)}
                                className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gold-400/10 text-gold-400"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-2xl font-accent font-bold text-gold-400">Rs. {product.sellingPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* RIGHT - SUMMARY */}
        <div className="w-full lg:w-[400px] space-y-8 sticky top-32 h-fit">
          <div className="glass-ultra crystal-border rounded-[48px] p-10 space-y-8 shadow-gold-3d">
            <h2 className="text-2xl font-display font-bold">Summary</h2>
            
            <div className="space-y-4">
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Subtotal</span>
                <span className="text-dark-900 dark:text-cream-50 font-bold">Rs. {subtotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm font-medium text-gray-500">
                <span>Platform Fee</span>
                <span className="text-dark-900 dark:text-cream-50 font-bold">Rs. {fee.toLocaleString()}</span>
              </div>
              <div className="h-px bg-gold-400/10 my-4" />
              <div className="flex justify-between items-end">
                <span className="text-lg font-bold">Total</span>
                <span className="text-3xl font-accent font-bold text-gold-400">Rs. {total.toLocaleString()}</span>
              </div>
            </div>

            <Link 
              href={items.length > 0 ? "/checkout" : "#"} 
              className={`w-full h-16 flex items-center justify-center gap-3 rounded-pill font-bold transition-all ${
                items.length > 0 
                  ? "bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-gold hover:scale-[1.02]" 
                  : "bg-gray-200 text-gray-400 cursor-not-allowed"
              }`}
            >
               Secure Checkout <ArrowRight className="w-5 h-5" />
            </Link>

            <div className="space-y-4 pt-4 border-t border-gold-400/10">
               <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  Escrow Protected Trade
               </div>
               <div className="flex items-center gap-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                  <Truck className="w-4 h-4 text-gold-400" />
                  Insured 2026 Delivery
               </div>
            </div>
          </div>

          <div className="p-6 glass-crystal crystal-border rounded-3xl text-center">
             <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest mb-2">Need Help?</p>
             <p className="text-xs text-gray-500">Our support agents are live 24/7. <span className="text-gold-400 underline">Chat Now</span></p>
          </div>
        </div>

      </div>
    </div>
  );
}
