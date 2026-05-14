"use client";

import { useCartStore } from "@/store/useCartStore";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, ShieldCheck, Truck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";

export default function CartPage() {
  const { items, removeItem, updateItem } = useCartStore();

  const { data: products, isLoading } = useQuery({
    queryKey: ['cart-products', items.map(i => i.productId)],
    queryFn: async () => {
      if (items.length === 0) return [];
      const responses = await Promise.all(items.map(item => api.get(`/products/${item.productId}`)));
      // The API returns { product, related }, we only need the product in the cart
      return responses.map(r => r.data.product);
    },
    enabled: items.length > 0
  });

  const subtotal = products?.reduce((acc, product) => {
    const item = items.find(i => i.productId === product.id);
    return acc + (product.sellingPrice * (item?.quantity || 0));
  }, 0) || 0;

  // 🚚 Shipping Logic: Rs. 300 per unique seller
  const uniqueSellers = products ? Array.from(new Set(products.map(p => p.sellerId))) : [];
  const shippingCost = uniqueSellers.length * 300;
  const total = subtotal + shippingCost;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 lg:py-16 pb-40 lg:pb-16">
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
        
        {/* LEFT - ITEMS */}
        <div className="flex-1 space-y-6 lg:space-y-10">
          <div className="space-y-1">
             <h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">Your <span className="italic text-gold-400">Bag.</span></h1>
             <p className="text-dark-500 dark:text-gray-400 text-sm font-medium">{items.length} premium preloved items selected.</p>
          </div>

          <div className="space-y-4">
            <AnimatePresence mode="popLayout">
              {items.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="py-16 text-center space-y-6 bg-cream-50 dark:bg-dark-900 rounded-3xl border border-gold-400/10"
                >
                   <div className="w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center mx-auto text-gold-400">
                      <ShoppingBag className="w-8 h-8" />
                   </div>
                   <div className="space-y-2">
                      <h3 className="text-xl font-bold">Your bag is empty</h3>
                      <p className="text-gray-500 text-sm max-w-xs mx-auto">Discover authentic preloved luxury and fill it with style.</p>
                   </div>
                   <Link href="/products" className="inline-flex h-14 px-8 items-center bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all min-h-[52px]">
                      Start Shopping
                   </Link>
                </motion.div>
              ) : (
                products?.map((product) => {
                  const item = items.find(i => i.productId === product.id);
                  return (
                    <motion.div 
                      key={product.id}
                      layout
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="p-4 md:p-6 bg-white dark:bg-dark-800 rounded-2xl lg:rounded-[32px] border border-gold-400/10 flex gap-4 md:gap-6 group shadow-sm"
                    >
                      {/* ✅ Item image: 80×80 fixed on left */}
                      <div className="relative w-20 h-20 md:w-32 md:h-40 rounded-xl md:rounded-2xl overflow-hidden shrink-0 bg-gold-400/5">
                        <Image 
                          src={product.images[0]} 
                          alt={product.title} 
                          fill 
                          sizes="(max-width: 768px) 80px, 128px"
                          className="object-cover" 
                          loading="lazy"
                          decoding="async"
                        />
                      </div>

                      {/* Details on right */}
                      <div className="flex-1 flex flex-col justify-between py-0.5 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <div className="space-y-0.5 min-w-0">
                            <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{product.brand}</p>
                            <h3 className="text-sm md:text-lg font-bold text-dark-900 dark:text-cream-50 line-clamp-2">{product.title}</h3>
                            <p className="text-[11px] text-gray-500 font-medium">Size: {product.size} • {product.condition}</p>
                          </div>
                          {/* ✅ Remove button — 44×44 tap target */}
                          <button 
                            onClick={() => removeItem(item!.id)}
                            className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center hover:bg-red-500 hover:text-white active:scale-90 transition-all shrink-0"
                            aria-label={`Remove ${product.title} from cart`}
                          >
                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                          </button>
                        </div>

                        <div className="flex justify-between items-end mt-3">
                           {/* ✅ Quantity stepper — 44px height, +/- buttons 36×36 */}
                           <div className="flex items-center bg-cream-50 dark:bg-dark-700 rounded-xl p-1 gap-1">
                              <button 
                                onClick={() => updateItem(item!.id, Math.max(1, (item?.quantity || 1) - 1))}
                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gold-400/10 text-gold-400 active:scale-90 transition-all"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="text-sm font-bold w-6 text-center" aria-label={`Quantity: ${item?.quantity}`}>{item?.quantity}</span>
                              <button 
                                onClick={() => updateItem(item!.id, (item?.quantity || 1) + 1)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-gold-400/10 text-gold-400 active:scale-90 transition-all"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                           </div>
                           <p className="text-lg md:text-2xl font-accent font-bold text-gold-400">Rs. {product.sellingPrice.toLocaleString()}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ✅ DESKTOP SUMMARY — sticky on desktop */}
        <div className="hidden lg:block w-[400px] space-y-8 sticky top-32 h-fit">
          <CartSummary subtotal={subtotal} shippingCost={shippingCost} total={total} itemCount={items.length} />
        </div>
      </div>

      {/* ✅ MOBILE STICKY BOTTOM BAR — shows total + checkout button */}
      {items.length > 0 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-white/95 dark:bg-dark-950/95 backdrop-blur-2xl border-t border-gold-400/10 px-4 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Total</p>
              <p className="text-xl font-accent font-bold text-gold-400">Rs. {total.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400">{items.length} items + shipping</p>
            </div>
          </div>
          <Link 
            href="/checkout" 
            className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl font-bold transition-all bg-gradient-to-r from-gold-400 to-gold-600 text-white shadow-gold active:scale-95 min-h-[52px]"
          >
             Secure Checkout <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      )}
    </div>
  );
}

function CartSummary({ subtotal, shippingCost, total, itemCount }: { subtotal: number; shippingCost: number; total: number; itemCount: number }) {
  return (
    <>
      <div className="glass-ultra crystal-border rounded-[48px] p-10 space-y-8 shadow-gold-3d">
        <h2 className="text-2xl font-display font-bold">Summary</h2>
        
        <div className="space-y-4">
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Subtotal</span>
            <span className="text-dark-900 dark:text-cream-50 font-bold">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-500">
            <span>Shipping (Rs. 300/seller)</span>
            <span className="text-dark-900 dark:text-cream-50 font-bold">Rs. {shippingCost.toLocaleString()}</span>
          </div>
          <div className="h-px bg-gold-400/10 my-4" />
          <div className="flex justify-between items-end">
            <span className="text-lg font-bold">Total</span>
            <span className="text-3xl font-accent font-bold text-gold-400">Rs. {total.toLocaleString()}</span>
          </div>
        </div>

        <Link 
          href={itemCount > 0 ? "/checkout" : "#"} 
          className={`w-full h-16 flex items-center justify-center gap-3 rounded-pill font-bold transition-all ${
            itemCount > 0 
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
    </>
  );
}
