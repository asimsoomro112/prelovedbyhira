"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Heart, Star, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    brand: string;
    sellingPrice: number;
    originalPrice: number;
    condition: string;
    size: string;
    images: string[];
    seller: { name: string; avatar?: string };
    status: string;
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isWishlisted, setIsWishlisted] = useState(false);
  const { addItem } = useCartStore();
  
  const sellingPrice = Number(product.sellingPrice);
  const originalPrice = Number(product.originalPrice);
  const discount = Math.round(((originalPrice - sellingPrice) / originalPrice) * 100);

  const conditionColors: any = {
    EXCELLENT: "bg-emerald-500",
    GOOD: "bg-amber-500",
    FAIR: "bg-orange-500",
    POOR: "bg-red-500",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -6 }}
      className="group bg-white dark:bg-dark-800 rounded-card overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 border border-gold-400/5"
    >
      {/* IMAGE AREA */}
      <div className="relative aspect-[3/4] overflow-hidden">
        <Link href={`/product/${product.id}`}>
          <Image 
            src={product.images[0] || "/placeholder.jpg"} 
            alt={product.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-700"
          />
        </Link>

        {/* Condition Badge */}
        <div className={`absolute top-3 left-3 px-3 py-1 rounded-pill text-[10px] font-bold text-white shadow-lg flex items-center gap-1 ${conditionColors[product.condition] || 'bg-gold-400'}`}>
          <Star className="w-3 h-3 fill-white" />
          {product.condition}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={() => setIsWishlisted(!isWishlisted)}
          className="absolute top-3 right-3 w-9 h-9 rounded-full glass-light flex items-center justify-center transition-all hover:scale-110 active:scale-90"
        >
          <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-gold-400 text-gold-400" : "text-white"}`} />
        </button>

        {/* SOLD Overlay */}
        {product.status === "SOLD" && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
            <span className="text-white text-3xl font-display italic font-bold -rotate-12 border-4 border-white px-6 py-2">SOLD</span>
          </div>
        )}

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="absolute bottom-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-pill shadow-lg">
            {discount}% OFF
          </div>
        )}
      </div>

      {/* DETAILS AREA */}
      <div className="p-4 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-[10px] font-bold">
            {product.seller.name[0]}
          </div>
          <span className="text-[10px] text-gray-500 font-medium truncate">{product.seller.name}</span>
        </div>

        <Link href={`/product/${product.id}`} className="block group/title">
          <h3 className="text-sm font-bold text-dark-900 dark:text-cream-50 line-clamp-2 leading-snug group-hover/title:text-gold-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-1">{product.brand}</p>
        </Link>

        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="space-y-0.5">
            <p className="text-gold-400 font-accent font-bold text-lg">Rs. {sellingPrice.toLocaleString()}</p>
            <p className="text-[11px] text-gray-400 line-through">Rs. {originalPrice.toLocaleString()}</p>
          </div>
          
          <div className="px-3 py-1 bg-cream-200 dark:bg-dark-700 rounded-pill text-[10px] font-bold text-gray-600 dark:text-gray-300">
            SIZE {product.size}
          </div>
        </div>

        <button 
          onClick={(e) => {
            e.stopPropagation();
            addItem(product.id);
            toast.success("Added to bag!");
          }}
          disabled={product.status === "SOLD"}
          className="w-full py-2.5 bg-gold-400/10 text-gold-400 rounded-xl text-xs font-bold hover:bg-gold-400 hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ShoppingBag className="w-4 h-4" />
          {product.status === "SOLD" ? "Out of Stock" : "Quick Add"}
        </button>
      </div>
    </motion.div>
  );
}
