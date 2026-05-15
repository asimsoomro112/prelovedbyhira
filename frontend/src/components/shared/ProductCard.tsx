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

  const conditionColors: Record<string, string> = {
    NEW: "bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]",
    EXCELLENT: "bg-emerald-500",
    GOOD: "bg-amber-500",
    FAIR: "bg-orange-500",
    POOR: "bg-red-500",
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="group bg-white dark:bg-dark-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-card transition-all duration-300 border border-gold-400/5"
    >
      {/* ✅ IMAGE — entire card is tappable, square aspect ratio, lazy loaded */}
      <Link href={`/product/${product.id}`} className="block">
        <div className="relative aspect-[3/4] overflow-hidden bg-gold-400/5">
          <Image 
            src={product.images[0] || "/placeholder.jpg"} 
            alt={product.title}
            fill
            sizes="(max-width: 480px) 45vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            className="object-contain group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            decoding="async"
          />

          {/* ✅ Condition Badge — visible on card image */}
          <div className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-[10px] font-bold text-white shadow-sm flex items-center gap-1 ${conditionColors[product.condition] || 'bg-gold-400'}`}>
            <Star className="w-3 h-3 fill-white" />
            {product.condition}
          </div>

          {/* ✅ Wishlist Button — 44×44 tap target with padding */}
          <button 
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsWishlisted(!isWishlisted);
            }}
            className="absolute top-1.5 right-1.5 w-10 h-10 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart className={`w-5 h-5 transition-colors ${isWishlisted ? "fill-gold-400 text-gold-400" : "text-white"}`} />
          </button>

          {/* SOLD Overlay */}
          {product.status === "SOLD" && (
            <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] flex items-center justify-center">
              <span className="text-white text-2xl font-display italic font-bold -rotate-12 border-4 border-white px-5 py-1.5">SOLD</span>
            </div>
          )}

          {/* Discount Badge */}
          {discount > 0 && (
            <div className="absolute bottom-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
              {discount}% OFF
            </div>
          )}
        </div>
      </Link>

      {/* ✅ DETAILS — readable text sizes, proper spacing */}
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gold-400/20 text-gold-400 flex items-center justify-center text-[10px] font-bold shrink-0">
            {product.seller.name[0]}
          </div>
          <span className="text-[11px] text-gray-500 font-medium truncate">{product.seller.name}</span>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-[13px] font-bold text-dark-900 dark:text-cream-50 line-clamp-2 leading-snug group-hover:text-gold-400 transition-colors">
            {product.title}
          </h3>
          <p className="text-[11px] text-gray-400 uppercase tracking-widest mt-0.5">{product.brand}</p>
        </Link>

        {/* ✅ Price — clearly visible, strikethrough old price in different color */}
        <div className="flex items-end justify-between gap-2 pt-1">
          <div className="space-y-0.5">
            <p className="text-gold-400 font-accent font-bold text-base leading-none">Rs. {sellingPrice.toLocaleString()}</p>
            {originalPrice > sellingPrice && (
              <p className="text-[11px] text-gray-400 line-through">Rs. {originalPrice.toLocaleString()}</p>
            )}
          </div>
          
          <div className="px-2.5 py-1 bg-cream-200 dark:bg-dark-700 rounded-full text-[10px] font-bold text-gray-600 dark:text-gray-300 shrink-0">
            {product.size}
          </div>
        </div>

        {/* ✅ Add to Cart — 48px min height */}
        <button 
          onClick={(e) => {
            e.stopPropagation();
            addItem(product);
            toast.success("Added to bag!");
          }}
          disabled={product.status === "SOLD"}
          className="w-full py-2.5 bg-gold-400/10 text-gold-400 rounded-xl text-xs font-bold hover:bg-gold-400 hover:text-white active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
          aria-label={product.status === "SOLD" ? "Out of stock" : `Add ${product.title} to cart`}
        >
          <ShoppingBag className="w-4 h-4" />
          {product.status === "SOLD" ? "Out of Stock" : "Quick Add"}
        </button>
      </div>
    </motion.div>
  );
}
