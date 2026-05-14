"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import ProductCard from "@/components/shared/ProductCard";
import Link from "next/link";
import api from "@/lib/api";
import { toast } from "sonner";

export default function WishlistPage() {
  const queryClient = useQueryClient();

  const { data: wishlist, isLoading } = useQuery({
    queryKey: ["wishlist"],
    queryFn: async () => {
      const { data } = await api.get("/wishlist");
      return data;
    },
  });

  const removeFromWishlist = useMutation({
    mutationFn: async (productId: string) => {
      return await api.post("/wishlist/toggle", { productId });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
      toast.success("Item removed from wishlist");
    },
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-8 md:py-12 space-y-8 md:space-y-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">My Wishlist</h1>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-widest">{wishlist?.length || 0} Items Saved</p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
           {Array(4).fill(0).map((_, i) => <div key={i} className="aspect-[3/4] bg-gold-400/5 rounded-[32px] animate-pulse" />)}
        </div>
      ) : wishlist?.length === 0 ? (
        <div className="text-center py-32 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 space-y-6">
           <div className="w-24 h-24 bg-gold-400/10 text-gold-400 rounded-full flex items-center justify-center mx-auto">
              <Heart className="w-10 h-10" />
           </div>
           <h2 className="text-2xl font-display font-bold">Your wishlist is empty</h2>
           <p className="text-gray-500 max-w-xs mx-auto">Start exploring our collection and save the styles you love!</p>
           <Link href="/products" className="inline-flex items-center gap-2 px-10 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all">
              Start Shopping <ArrowRight className="w-4 h-4" />
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <AnimatePresence>
            {wishlist?.map((product: any) => (
              <div key={product.id} className="relative group">
                <ProductCard product={product} />
                <button 
                  onClick={() => removeFromWishlist.mutate(product.id)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 w-10 h-10 bg-white/90 dark:bg-dark-900/90 backdrop-blur-sm text-red-500 rounded-full flex items-center justify-center opacity-100 transition-all shadow-lg hover:bg-red-500 hover:text-white z-10 active:scale-90"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
