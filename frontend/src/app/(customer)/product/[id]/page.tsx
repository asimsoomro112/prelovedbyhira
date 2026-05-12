"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { 
  Heart, 
  Share2, 
  Star, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight,
  ShoppingBag,
  History,
  CheckCircle2,
  AlertTriangle,
  X
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useParams } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { toast } from "sonner";

export default function ProductDetailPage() {
  const { id } = useParams();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addItem } = useCartStore();

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  if (isLoading) return <div className="h-screen flex items-center justify-center"><div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" /></div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 space-y-24">
      <div className="grid lg:grid-cols-2 gap-16 items-start">
        
        {/* LEFT - MEDIA */}
        <div className="space-y-6 sticky top-24">
          <div className="relative aspect-[3/4] rounded-[48px] overflow-hidden bg-cream-100 dark:bg-dark-800 shadow-gold-3d group perspective-1000">
            <Image 
              src={product.images[selectedImage]} 
              alt={product.title} 
              fill 
              priority
              className="object-cover transition-transform duration-700 hover:scale-110 preserve-3d" 
            />
            
            {/* Nav Arrows */}
            <div className="absolute inset-x-6 top-1/2 -translate-y-1/2 flex justify-between opacity-0 group-hover:opacity-100 transition-all duration-500">
              <button 
                onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                className="w-14 h-14 rounded-full glass-ultra crystal-border flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl"
              >
                <ChevronLeft className="w-8 h-8" />
              </button>
              <button 
                onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                className="w-14 h-14 rounded-full glass-ultra crystal-border flex items-center justify-center text-white hover:scale-110 transition-all shadow-xl"
              >
                <ChevronRight className="w-8 h-8" />
              </button>
            </div>
            
            <div className="absolute top-8 right-8 flex flex-col gap-4">
              <button className="w-14 h-14 rounded-full glass-ultra crystal-border flex items-center justify-center text-white hover:scale-110 shadow-xl"><Heart className="w-7 h-7" /></button>
              <button className="w-14 h-14 rounded-full glass-ultra crystal-border flex items-center justify-center text-white hover:scale-110 shadow-xl"><Share2 className="w-7 h-7" /></button>
            </div>
          </div>

          {/* THUMBNAILS */}
          <div className="flex gap-5 overflow-x-auto scrollbar-none pb-4">
            {product.images.map((img: string, i: number) => (
              <button 
                key={i} 
                onClick={() => setSelectedImage(i)}
                className={`relative w-28 h-36 rounded-[24px] overflow-hidden shrink-0 transition-all duration-500 ${
                  selectedImage === i ? "crystal-border ring-2 ring-gold-400 ring-offset-8 dark:ring-offset-dark-950 scale-90" : "opacity-40 hover:opacity-100"
                }`}
              >
                <Image src={img} alt="Thumb" fill className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* RIGHT - INFO */}
        <div className="space-y-12">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <span className="px-4 py-1.5 glass-ultra crystal-border rounded-full text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">{product.brand}</span>
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/10 rounded-full text-gold-400">
                <Star className="w-4 h-4 fill-gold-400" />
                <span className="text-[11px] font-bold">{product.seller.rating || "4.9"}</span>
              </div>
              {product.status === 'SOLD' && <span className="px-4 py-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full uppercase tracking-widest shadow-lg">Sold Out</span>}
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-display font-bold text-dark-900 dark:text-cream-50 leading-[1.1] tracking-tight">
              {product.title}
            </h1>

            <div className="flex items-end gap-8 pt-4">
              <p className="text-6xl font-accent font-bold text-gold-400 leading-none">Rs. {product.sellingPrice.toLocaleString()}</p>
              <div className="pb-1">
                <p className="text-xl text-gray-400 line-through decoration-gold-400/40 decoration-2">Rs. {product.originalPrice.toLocaleString()}</p>
                <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">{Math.round((product.originalPrice - product.sellingPrice)/product.originalPrice * 100)}% Savings</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div className="p-6 bg-white dark:bg-dark-900 rounded-3xl border border-gold-400/10 shadow-soft">
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-3">Condition Gauge</p>
                <div className="flex items-center gap-2">
                   <div className="flex-1 h-2 bg-gold-400/10 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: product.condition === 'NEW' ? '100%' : product.condition === 'EXCELLENT' ? '85%' : '60%' }}
                        className="h-full bg-gold-400" 
                      />
                   </div>
                   <span className="text-xs font-bold text-gold-400">{product.condition}</span>
                </div>
             </div>
             <DetailBox label="Size" value={product.size} />
             <DetailBox label="Category" value={product.category} />
             <DetailBox label="Market Value" value={`Rs. ${(product.originalPrice * 1.2).toLocaleString()}`} />
          </div>

          {/* PRELOVED AUTHENTICITY CHECKLIST */}
          <div className="p-8 glass-ultra crystal-border rounded-[32px] space-y-6">
             <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                <h3 className="font-bold text-dark-900 dark:text-cream-50 uppercase tracking-widest text-xs">Authenticity Checklist</h3>
             </div>
             <div className="grid grid-cols-2 gap-y-4">
                <CheckItem label="Original Box/Bag" status={product.originalPacking} />
                <CheckItem label="Invoice Available" status={product.invoiceAvailable} />
                <CheckItem label="Altered / Adjusted" status={product.isAltered} inverse />
                <CheckItem label="Vetted by Hira" status={true} />
             </div>
          </div>

          {product.defects && (
            <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-3xl flex gap-4">
               <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
               <div>
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-widest">Seller's Honesty Note</p>
                  <p className="text-sm text-amber-600 dark:text-amber-500 mt-1">{product.defects}</p>
               </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/checkout?id=${product.id}`} className="flex-1 h-16 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
              <ShoppingBag className="w-5 h-5" /> Buy Now
            </Link>
            <button 
              onClick={() => {
                addItem(product.id);
                toast.success("Added to your bag! ✨");
              }}
              className="flex-1 h-16 border-2 border-gold-400 text-gold-400 rounded-pill font-bold hover:bg-gold-400/10 transition-all"
            >
              Add to Bag
            </button>
          </div>

          {/* SELLER CARD */}
          <div className="p-8 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10 shadow-soft flex items-center justify-between group">
             <div className="flex items-center gap-5">
                <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-gold-400 shadow-gold">
                   <Image src={product.seller.user.avatar || "/placeholder.jpg"} alt={product.seller.user.name} fill className="object-cover" />
                </div>
                <div>
                   <h3 className="font-bold text-lg flex items-center gap-2">
                     {product.seller.user.name} <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                   </h3>
                   <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mt-1">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3 fill-gold-400 text-gold-400" /> 4.9</span>
                      <span>89 Sales</span>
                   </div>
                </div>
             </div>
             <Link href={`/seller/${product.sellerId}`} className="w-12 h-12 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center group-hover:bg-gold-400 group-hover:text-white transition-all">
                <ArrowRight className="w-6 h-6" />
             </Link>
          </div>

          {/* TRUST POINTS */}
          <div className="flex justify-between px-2">
            <TrustItem icon={<ShieldCheck className="w-5 h-5" />} label="Escrow Safe" />
            <TrustItem icon={<History className="w-5 h-5" />} label="Preloved" />
            <TrustItem icon={<MessageCircle className="w-5 h-5" />} label="24/7 Support" />
          </div>
        </div>
      </div>

      {/* TABS */}
      <section className="space-y-12">
        <div className="flex gap-12 border-b border-gold-400/10">
          <TabButton active={activeTab === 'description'} label="Description" onClick={() => setActiveTab('description')} />
          <TabButton active={activeTab === 'reviews'} label="Reviews (24)" onClick={() => setActiveTab('reviews')} />
          <TabButton active={activeTab === 'more'} label="More from Seller" onClick={() => setActiveTab('more')} />
        </div>

        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {activeTab === 'description' && (
              <motion.div key="desc" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="prose dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed text-lg">
                <p>{product.description}</p>
              </motion.div>
            )}
            {activeTab === 'reviews' && (
              <motion.div key="reviews" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                 <div className="grid md:grid-cols-3 gap-12">
                   <div className="text-center space-y-2">
                      <p className="text-6xl font-accent font-bold text-gold-400">4.9</p>
                      <div className="flex justify-center text-gold-400"><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /></div>
                      <p className="text-sm text-gray-500">Based on 24 reviews</p>
                   </div>
                   <div className="md:col-span-2 space-y-3">
                      <RatingBar star={5} percent={90} />
                      <RatingBar star={4} percent={10} />
                      <RatingBar star={3} percent={0} />
                   </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </div>
  );
}

function DetailBox({ label, value, color = "text-dark-900 dark:text-cream-50" }: any) {
  return (
    <div className="p-6 bg-white dark:bg-dark-900 rounded-3xl border border-gold-400/10 shadow-soft">
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">{label}</p>
      <p className={`text-sm font-bold ${color}`}>{value}</p>
    </div>
  );
}

function TrustItem({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-gold-400">{icon}</div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function TabButton({ active, label, onClick }: any) {
  return (
    <button 
      onClick={onClick}
      className={`pb-6 text-sm font-bold uppercase tracking-widest transition-all relative ${active ? "text-gold-400" : "text-gray-400 hover:text-gold-400"}`}
    >
      {label}
      {active && <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-400 rounded-full" />}
    </button>
  );
}

function CheckItem({ label, status, inverse = false }: any) {
  const isPositive = inverse ? !status : status;
  return (
    <div className="flex items-center gap-2">
       {isPositive ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <X className="w-4 h-4 text-red-400" />}
       <span className={`text-[10px] font-bold uppercase tracking-wider ${isPositive ? "text-dark-900 dark:text-cream-50" : "text-gray-400 line-through"}`}>{label}</span>
    </div>
  );
}

function RatingBar({ star, percent }: any) {
  return (
    <div className="flex items-center gap-4">
      <span className="text-xs font-bold text-gray-400 w-4">{star}★</span>
      <div className="flex-1 h-2 bg-gold-400/5 rounded-full overflow-hidden">
        <div className="h-full bg-gold-400 rounded-full" style={{ width: `${percent}%` }} />
      </div>
      <span className="text-xs font-bold text-gray-500 w-8">{percent}%</span>
    </div>
  );
}
