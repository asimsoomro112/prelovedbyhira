"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
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
  X,
  Eye,
  Zap,
  Clock,
  TrendingUp,
  Flame,
  BadgeCheck,
  Phone,
  Settings
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { useParams, useRouter } from "next/navigation";
import ProductCard from "@/components/shared/ProductCard";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";

// ─── MOBILE CRO: Live viewer count hook ───────────────────────────────────
function useLiveViewers(base = 4) {
  const [viewers, setViewers] = useState(base);
  useEffect(() => {
    const interval = setInterval(() => {
      setViewers(v => Math.max(2, v + (Math.random() > 0.5 ? 1 : -1)));
    }, 7000);
    return () => clearInterval(interval);
  }, []);
  return viewers;
}

// ─── MOBILE CRO: Touch swipe hook ─────────────────────────────────────────
function useSwipe(onLeft: () => void, onRight: () => void) {
  const startX = useRef<number | null>(null);
  const handlers = {
    onTouchStart: (e: React.TouchEvent) => { startX.current = e.touches[0].clientX; },
    onTouchEnd: (e: React.TouchEvent) => {
      if (startX.current === null) return;
      const diff = startX.current - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) diff > 0 ? onLeft() : onRight();
      startX.current = null;
    },
  };
  return handlers;
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState("description");
  const { addItem } = useCartStore();
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  // ─── MOBILE CRO STATE ──────────────────────────────────────────────────
  const [ctaPulsed, setCtaPulsed] = useState(false);
  const viewers = useLiveViewers(5);
  const [recentBuyer] = useState(() => {
    const buyers = ["Zara K.", "Hina M.", "Ayesha R.", "Sara N.", "Fatima A."];
    return buyers[Math.floor(Math.random() * buyers.length)];
  });
  const [showBuyerToast, setShowBuyerToast] = useState(false);
  const mobileImageRef = useRef<HTMLDivElement>(null);

  const { data: response, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get(`/products/${id}`);
      return data;
    },
  });

  const product = response?.product;
  const relatedProducts = response?.related || [];
  const isOwnProduct = user?.id === product?.sellerId;

  // ─── MOBILE CRO: Show FOMO buyer toast after 4s ───────────────────────
  useEffect(() => {
    const t = setTimeout(() => setShowBuyerToast(true), 4000);
    const t2 = setTimeout(() => setShowBuyerToast(false), 9000);
    return () => { clearTimeout(t); clearTimeout(t2); };
  }, []);

  // ─── MOBILE CRO: Pulse CTA after scroll ──────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setCtaPulsed(true), 2500);
    return () => clearTimeout(t);
  }, []);

  const swipeHandlers = useSwipe(
    () => product?.images?.length > 1 && setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0),
    () => product?.images?.length > 1 && setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)
  );

  if (isLoading) return (
    <div className="h-screen flex items-center justify-center bg-mesh/5">
      <div className="w-16 h-16 border-4 border-gold-400 border-t-transparent rounded-full animate-spin shadow-gold" />
    </div>
  );

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center space-y-8 bg-mesh/5">
      <div className="w-24 h-24 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-400">
        <AlertTriangle className="w-12 h-12" />
      </div>
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-bold">Product Not Found</h2>
        <p className="text-gray-500 max-w-sm">This piece may have been acquired by another collector or removed from the vault.</p>
      </div>
      <Link href="/seller/dashboard" className="px-10 py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all">Return to Dashboard</Link>
    </div>
  );

  const savings = product.originalPrice && product.sellingPrice
    ? Math.round((product.originalPrice - product.sellingPrice) / product.originalPrice * 100)
    : 0;

  return (
    <div className="min-h-screen bg-mesh/5 pb-36 lg:pb-12">

      {/* ─── MOBILE CRO: FOMO Buyer Activity Toast ─────────────────────── */}
      <AnimatePresence>
        {showBuyerToast && (
          <motion.div
            initial={{ x: -120, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -120, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className="lg:hidden fixed bottom-36 left-4 z-[150] flex items-center gap-3 bg-white dark:bg-dark-900 border border-gold-400/20 rounded-2xl px-4 py-3 shadow-2xl max-w-[260px]"
          >
            <div className="w-8 h-8 rounded-full bg-gold-400/20 flex items-center justify-center shrink-0">
              <ShoppingBag className="w-4 h-4 text-gold-400" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-dark-900 dark:text-cream-50 leading-tight">
                {recentBuyer} <span className="text-gold-400">added to wishlist</span>
              </p>
              <p className="text-[8px] text-gray-400 font-medium mt-0.5">2 minutes ago</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 py-8 lg:py-16">

        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[10px] font-bold uppercase tracking-widest text-gray-400">
          <Link href="/seller/explore" className="hover:text-gold-400 transition-colors">Marketplace</Link>
          <span>/</span>
          <span className="text-gold-400">{product.category}</span>
          <span>/</span>
          <span className="truncate max-w-[150px]">{product.title}</span>
        </div>

        {/* ─── MOBILE CRO: Live Scarcity Bar (mobile only) ─────────────── */}
        <div className="lg:hidden flex items-center justify-between mb-4 px-1">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5">
              <Flame className="w-3 h-3 text-red-500 animate-pulse" />
              <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">1 of 1 Left</span>
            </div>
            <div className="flex items-center gap-1.5 bg-dark-900/5 dark:bg-white/5 border border-gold-400/10 rounded-full px-3 py-1.5">
              <Eye className="w-3 h-3 text-gold-400" />
              <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">{viewers} viewing</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[9px] text-emerald-500 font-bold">
            <Clock className="w-3 h-3" />
            <span>Ships in 24h</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 xl:gap-24 items-start">

          {/* LEFT - MEDIA */}
          <div className="space-y-3 lg:space-y-8 lg:sticky lg:top-24">

            {/* ─── MOBILE CRO: Full-bleed swipeable image ─────────────── */}
            <div
              ref={mobileImageRef}
              onClick={() => setIsLightboxOpen(true)}
              {...swipeHandlers}
              className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[28px] lg:rounded-[56px] overflow-hidden bg-white dark:bg-dark-900 shadow-xl group border border-gold-400/5 cursor-zoom-in select-none"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedImage}
                  initial={{ opacity: 0, scale: 1.04 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.04 }}
                  transition={{ duration: 0.5 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images?.[selectedImage] || "https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000"}
                    alt={product.title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-110 transition-transform duration-1000"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Scarcity Badges */}
              <div className="absolute top-3 left-3 lg:top-8 lg:left-8 flex flex-col gap-1.5 lg:gap-3 z-10 pointer-events-none">
                <div className="px-3 py-1.5 lg:px-5 lg:py-2.5 bg-black/40 backdrop-blur-md text-white rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 lg:gap-2 shadow-xl">
                  <div className="w-1.5 h-1.5 lg:w-2 lg:h-2 bg-emerald-500 rounded-full animate-pulse" />
                  Unique
                </div>
                <div className="px-3 py-1.5 lg:px-5 lg:py-2.5 bg-gold-400/90 backdrop-blur-md text-white rounded-full text-[8px] lg:text-[10px] font-bold uppercase tracking-widest border border-white/10 flex items-center gap-1.5 lg:gap-2 shadow-xl">
                  <ShieldCheck className="w-3 h-3 lg:w-4 lg:h-4" />
                  Vetted
                </div>
              </div>

              {/* ─── MOBILE CRO: Savings badge on image ─────────────── */}
              {savings > 0 && (
                <div className="lg:hidden absolute top-3 right-3 z-10">
                  <div className="bg-emerald-500 text-white rounded-xl px-2.5 py-1.5 flex flex-col items-center shadow-lg">
                    <span className="text-[7px] font-bold uppercase tracking-widest opacity-80">Save</span>
                    <span className="text-base font-black leading-none">{savings}%</span>
                  </div>
                </div>
              )}

              {/* Interaction Overlays (desktop) */}
              <div className="hidden lg:flex absolute top-8 right-8 flex-col gap-4 z-10">
                <button className="w-14 h-14 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gold-400/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white transition-all shadow-2xl hover:scale-110 group">
                  <Heart className="w-7 h-7 group-active:fill-current" />
                </button>
                <button className="w-14 h-14 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gold-400/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white transition-all shadow-2xl hover:scale-110">
                  <Share2 className="w-7 h-7" />
                </button>
              </div>

              {/* Desktop Nav Arrows */}
              {product.images?.length > 1 && (
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 hidden lg:flex justify-between z-10">
                  <NavBtn
                    icon={<ChevronLeft className="w-8 h-8" />}
                    onClick={(e: any) => { e.stopPropagation(); setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1); }}
                  />
                  <NavBtn
                    icon={<ChevronRight className="w-8 h-8" />}
                    onClick={(e: any) => { e.stopPropagation(); setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0); }}
                  />
                </div>
              )}

              {/* ─── MOBILE CRO: Swipe dots indicator ───────────────── */}
              {product.images?.length > 1 && (
                <div className="lg:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
                  {product.images.map((_: string, i: number) => (
                    <button
                      key={i}
                      onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }}
                      className={`transition-all duration-300 rounded-full ${selectedImage === i
                          ? "w-5 h-1.5 bg-gold-400"
                          : "w-1.5 h-1.5 bg-white/40"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* THUMBNAILS (desktop only — mobile uses swipe) */}
            <div className="hidden lg:flex gap-5 overflow-x-auto scrollbar-none pb-4">
              {product.images?.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-32 h-40 rounded-[36px] overflow-hidden shrink-0 transition-all duration-300 ${selectedImage === i ? "ring-2 ring-gold-400 ring-offset-4 dark:ring-offset-dark-950 scale-90" : "opacity-40 hover:opacity-100"
                    }`}
                >
                  <Image src={img} alt="Thumb" fill sizes="128px" className="object-cover" />
                </button>
              ))}
            </div>

            {/* ─── MOBILE CRO: Thumbnail strip (compact horizontal) ─── */}
            <div className="lg:hidden flex gap-2.5 overflow-x-auto scrollbar-none pb-1">
              {product.images?.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-16 h-20 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 ${selectedImage === i
                      ? "ring-2 ring-gold-400 ring-offset-2 dark:ring-offset-dark-950 scale-95"
                      : "opacity-40 hover:opacity-80"
                    }`}
                >
                  <Image src={img} alt="Thumb" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT - INFO */}
          <div className="space-y-6 lg:space-y-12">

            {/* ─── MOBILE CRO: Compact brand + status row ──────────── */}
            <div className="space-y-4 lg:space-y-8">
              <div className="flex items-center justify-between">
                <span className="px-4 py-1.5 glass-ultra crystal-border rounded-full text-[10px] font-bold text-gold-400 uppercase tracking-[0.35em]">{product.brand}</span>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-3 h-3" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Available</span>
                </div>
              </div>

              <h1 className="text-2xl lg:text-7xl font-display font-bold text-dark-900 dark:text-cream-50 leading-[1.1] tracking-tight">
                {product.title}
              </h1>

              {/* ─── MOBILE CRO: Price block with anchoring ──────────── */}
              <div className="lg:hidden">
                {/* Price anchoring strip */}
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                  <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                    Market value Rs. {((product.originalPrice || 0) * 1.2).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-end gap-4">
                  <p className="text-4xl font-accent font-bold text-gold-400 leading-none">
                    Rs. {(product.sellingPrice || 0).toLocaleString()}
                  </p>
                  <div className="pb-0.5">
                    <p className="text-base text-gray-400 line-through decoration-gold-400/40 decoration-2 font-medium">
                      Rs. {(product.originalPrice || 0).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Zap className="w-3 h-3 text-emerald-500" />
                      <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
                        Save Rs. {((product.originalPrice || 0) - (product.sellingPrice || 0)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Desktop price (unchanged) */}
              <div className="hidden lg:flex items-end gap-10">
                <p className="text-7xl font-accent font-bold text-gold-400 leading-none">Rs. {(product.sellingPrice || 0).toLocaleString()}</p>
                <div className="pb-1">
                  <p className="text-2xl text-gray-400 line-through decoration-gold-400/40 decoration-2 font-medium">Rs. {(product.originalPrice || 0).toLocaleString()}</p>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1 bg-emerald-500/10 px-2 py-0.5 rounded-full inline-block">
                    {savings}% Elite Savings
                  </p>
                </div>
              </div>
            </div>

            {/* ─── MOBILE CRO: Quick spec pills (replaces full grid on mobile) ─── */}
            <div className="lg:hidden flex flex-wrap gap-2">
              <SpecPill icon={<Star className="w-3 h-3" />} label="Condition" value={product.condition || "GOOD"} />
              <SpecPill icon={null} label="Size" value={product.size || "M"} />
              <SpecPill icon={null} label="Category" value={product.category || "Luxury"} />
              {product.originalPacking && (
                <SpecPill icon={<BadgeCheck className="w-3 h-3 text-emerald-500" />} label="Box" value="Included" accent />
              )}
            </div>

            {/* STATS GRID — desktop only full version */}
            <div className="hidden lg:grid grid-cols-2 gap-5 w-full">
              <div className="p-8 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10 shadow-soft overflow-hidden">
                <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2 flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold-400" /> Condition
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-gold-400/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: product.condition === 'NEW' ? '100%' : product.condition === 'EXCELLENT' ? '85%' : product.condition === 'GOOD' ? '70%' : '50%' }}
                      className="h-full bg-gold-400"
                    />
                  </div>
                  <span className="text-sm font-bold text-gold-400 shrink-0">{product.condition || "GOOD"}</span>
                </div>
              </div>
              <DetailBox label="Size" value={product.size || "M"} />
              <DetailBox label="Cat." value={product.category || "Luxury"} />
              <DetailBox label="Worth" value={`Rs. ${((product.originalPrice || 0) * 1.2).toLocaleString()}`} />
            </div>

            {/* DESKTOP DESCRIPTIVE SECTION */}
            <div className="hidden lg:block space-y-12">
              {/* AUTHENTICITY CHECKLIST */}
              <div className="p-10 glass-ultra crystal-border rounded-[40px] space-y-8">
                <div className="flex items-center gap-4">
                  <ShieldCheck className="w-8 h-8 text-emerald-500" />
                  <h3 className="font-bold text-dark-900 dark:text-cream-50 uppercase tracking-[0.2em] text-sm">Elite Authenticity Checklist</h3>
                </div>
                <div className="grid grid-cols-2 gap-y-6">
                  <CheckItem label="Original Box/Bag" status={product.originalPacking} />
                  <CheckItem label="Invoice Available" status={product.invoiceAvailable} />
                  <CheckItem label="Altered / Adjusted" status={product.isAltered} inverse />
                  <CheckItem label="Vetted by Hira" status={true} />
                </div>
              </div>

              {/* SELLER CARD */}
              <div className="p-10 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-gold-soft flex items-center justify-between group transition-all hover:border-gold-400/30">
                <div className="flex items-center gap-6">
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-3 border-gold-400 shadow-gold scale-110">
                    <Image src={product.seller?.user?.avatar || "/placeholder.jpg"} alt={product.seller?.user?.name || "Seller"} fill sizes="80px" className="object-cover" />
                  </div>
                  <div className="ml-2">
                    <h3 className="font-bold text-xl flex items-center gap-2">
                      {product.seller?.user?.name || "Exclusive Boutique"} <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    </h3>
                    <div className="flex items-center gap-5 text-sm text-gray-500 font-medium mt-2">
                      <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-gold-400 text-gold-400" /> {product.seller?.rating || "5.0"}</span>
                      <span className="flex items-center gap-1.5"><ShoppingBag className="w-4 h-4 text-gold-400" /> {product.seller?.totalSales || "0"} Sales</span>
                    </div>
                  </div>
                </div>
                <Link href={`/seller/${product.sellerId || product.seller?.userId}`} className="w-14 h-14 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center hover:bg-gold-400 hover:text-white transition-all hover:scale-110">
                  <ArrowRight className="w-8 h-8" />
                </Link>
              </div>
            </div>

            {/* ─── MOBILE CRO: Trust strip (before accordions) ─────────── */}
            <div className="lg:hidden flex items-center justify-around py-4 px-2 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm">
              <MobileTrustBadge icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />} label="Escrow" sub="100% Safe" />
              <div className="w-px h-8 bg-gold-400/10" />
              <MobileTrustBadge icon={<Truck className="w-4 h-4 text-gold-400" />} label="Fast Ship" sub="24–48h" />
              <div className="w-px h-8 bg-gold-400/10" />
              <MobileTrustBadge icon={<BadgeCheck className="w-4 h-4 text-gold-400" />} label="Vetted" sub="By Hira" />
              <div className="w-px h-8 bg-gold-400/10" />
              <MobileTrustBadge icon={<History className="w-4 h-4 text-gold-400" />} label="Returns" sub="Supported" />
            </div>

            {/* MOBILE ONLY ACCORDIONS (enhanced CRO versions) */}
            <div className="lg:hidden space-y-2 pt-2">
              <MobileCROAccordion
                icon={<ShieldCheck className="w-4 h-4 text-emerald-500" />}
                title="Authenticity Guarantee"
                badge="Verified"
                badgeColor="emerald"
                content={
                  <div className="space-y-3">
                    <CheckItem label="Original Box / Bag" status={product.originalPacking} />
                    <CheckItem label="Invoice Available" status={product.invoiceAvailable} />
                    <CheckItem label="Altered / Adjusted" status={product.isAltered} inverse />
                    <CheckItem label="Vetted by Hira" status={true} />
                  </div>
                }
              />
              <MobileCROAccordion
                icon={<Truck className="w-4 h-4 text-gold-400" />}
                title="Shipping & Escrow"
                badge="Nationwide"
                badgeColor="gold"
                content={
                  <div className="space-y-2">
                    <p className="text-[11px] text-gray-500 leading-relaxed font-medium">Your payment is held safely in escrow until you confirm receipt. Insured nationwide delivery within 3–5 business days.</p>
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gold-400/10">
                      <Clock className="w-3 h-3 text-emerald-500" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Ships within 24 hours of purchase</span>
                    </div>
                  </div>
                }
              />
              <MobileCROAccordion
                icon={<MessageCircle className="w-4 h-4 text-gold-400" />}
                title="About the Seller"
                badge={`⭐ ${product.seller?.rating || "5.0"}`}
                badgeColor="gold"
                content={
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/40 shrink-0">
                      <Image src={product.seller?.user?.avatar || "/placeholder.jpg"} alt="Seller" fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-dark-900 dark:text-cream-50 flex items-center gap-1">
                        {product.seller?.user?.name || "Exclusive Boutique"} <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                      </p>
                      <p className="text-[10px] text-gray-500 font-medium mt-0.5">{product.seller?.totalSales || "0"} sales · Verified Merchant</p>
                      <Link href={`/seller/${product.sellerId || product.seller?.userId}`} className="text-[9px] font-bold text-gold-400 uppercase tracking-widest mt-1 inline-block">
                        View Profile →
                      </Link>
                    </div>
                  </div>
                }
              />
            </div>

            {/* ACTIONS (DESKTOP) */}
            <div className="hidden lg:flex flex-col gap-5">
              {isOwnProduct ? (
                <button
                  onClick={() => router.push("/seller/dashboard")}
                  className="h-20 bg-dark-900 dark:bg-cream-50 text-white dark:text-dark-900 rounded-[24px] font-bold shadow-xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-xl"
                >
                  <Settings className="w-6 h-6" /> Manage This Listing
                </button>
              ) : (
                <>
                  <button
                    onClick={() => { addItem(product.id); toast.success("Added to Bag! ✨"); }}
                    className="h-20 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-[24px] font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 text-xl"
                  >
                    <ShoppingBag className="w-6 h-6" /> Add to Shopping Bag
                  </button>
                  <Link href={`/checkout?id=${product.id}`} className="h-20 border-2 border-dark-900 dark:border-cream-50 text-dark-900 dark:text-cream-50 rounded-[24px] font-bold flex items-center justify-center hover:bg-dark-900 hover:text-white dark:hover:bg-cream-50 dark:hover:text-dark-900 transition-all text-xl">
                    Buy Piece Now
                  </Link>
                </>
              )}
            </div>

            {/* TRUST POINTS (desktop) */}
            <div className="hidden lg:flex justify-between px-4 pt-4">
              <TrustItem icon={<ShieldCheck className="w-6 h-6" />} label="Escrow Safe" />
              <TrustItem icon={<History className="w-6 h-6" />} label="Preloved Heritage" />
              <TrustItem icon={<MessageCircle className="w-6 h-6" />} label="24/7 Concierge" />
            </div>
          </div>
        </div>

        {/* TABS SECTION (desktop) */}
        <section className="mt-32 space-y-16">
          <div className="flex gap-16 border-b border-gold-400/10">
            <TabButton active={activeTab === 'description'} label="The Story & Details" onClick={() => setActiveTab('description')} />
            <TabButton active={activeTab === 'reviews'} label="Boutique Reviews" onClick={() => setActiveTab('reviews')} />
          </div>

          <div className="min-h-[400px]">
            <AnimatePresence mode="wait">
              {activeTab === 'description' && (
                <motion.div key="desc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl space-y-10">
                  <div className="prose prose-2xl dark:prose-invert max-w-none text-gray-600 dark:text-gray-400 leading-relaxed font-serif italic">
                    &quot;{product.description}&quot;
                  </div>
                  <div className="grid md:grid-cols-2 gap-10 pt-10 border-t border-gold-400/10">
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest">Material & Composition</h4>
                      <p className="text-sm font-medium">Fine luxury fabrics with authenticated branding marks.</p>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-gold-400 uppercase tracking-widest">Shipping & Handling</h4>
                      <p className="text-sm font-medium">Nationwide insured delivery within 3-5 business days.</p>
                    </div>
                  </div>
                </motion.div>
              )}
              {activeTab === 'reviews' && (
                <motion.div key="reviews" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-12">
                  <div className="grid md:grid-cols-3 gap-16">
                    <div className="text-center space-y-4 p-10 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10">
                      <p className="text-8xl font-accent font-bold text-gold-400">4.9</p>
                      <div className="flex justify-center text-gold-400 scale-125"><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /><Star className="fill-gold-400" /></div>
                      <p className="text-sm text-gray-500 font-bold uppercase tracking-widest pt-4">Boutique Trust Score</p>
                    </div>
                    <div className="md:col-span-2 space-y-6 flex flex-col justify-center">
                      <RatingBar star={5} percent={92} />
                      <RatingBar star={4} percent={8} />
                      <RatingBar star={3} percent={0} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </section>
      </div>

      {/* ════════════════════════════════════════════════════════════
          MOBILE STICKY CTA — Fully redesigned for 2026 CRO
      ════════════════════════════════════════════════════════════ */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-[100]">
        {/* ─── Urgency mini-bar ─── */}
        <div className="flex items-center justify-center gap-2 bg-red-500 py-2 px-4">
          <Flame className="w-3 h-3 text-white animate-pulse" />
          <span className="text-[9px] font-black text-white uppercase tracking-[0.2em]">
            {viewers} people viewing · Only 1 left in vault
          </span>
        </div>

        {/* ─── Main CTA bar ─── */}
        <div className="bg-white dark:bg-dark-950 border-t border-gold-400/20 px-4 pt-3 pb-safe-or-4 pb-4">
          {/* Price row */}
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Elite Price</p>
              <p className="text-xl font-accent font-bold text-gold-400 leading-tight">
                Rs. {(product.sellingPrice || 0).toLocaleString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {/* Wishlist */}
              <button
                onClick={() => { setIsWishlisted(w => !w); toast.success(isWishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️"); }}
                className={`w-11 h-11 rounded-2xl border flex items-center justify-center transition-all active:scale-90 ${isWishlisted
                    ? "bg-red-500/10 border-red-500/30 text-red-500"
                    : "bg-gold-400/5 border-gold-400/20 text-gold-400"
                  }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`} />
              </button>
              {/* WhatsApp ─── Pakistan-optimised CRO */}
              <a
                href={`https://wa.me/?text=I'm interested in: ${encodeURIComponent(product.title)} — Rs. ${product.sellingPrice}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 active:scale-90 transition-all"
              >
                <Phone className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* CTA buttons row */}
          <div className="flex gap-2.5">
            {isOwnProduct ? (
              <button
                onClick={() => router.push("/seller/dashboard")}
                className="w-full h-12 bg-dark-900 dark:bg-cream-50 text-white dark:text-dark-900 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Settings className="w-4 h-4" />
                Manage Listing
              </button>
            ) : (
              <>
                <button
                  onClick={() => { addItem(product.id); toast.success("Added to Bag! ✨"); }}
                  className="flex-1 h-12 border-2 border-gold-400 text-gold-400 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Add to Bag
                </button>

                <motion.div
                  animate={ctaPulsed ? { scale: [1, 1.03, 1] } : {}}
                  transition={{ repeat: 3, duration: 0.6 }}
                  className="flex-[1.6]"
                >
                  <Link
                    href={`/checkout?id=${product.id}`}
                    className="h-12 w-full bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-gold active:scale-95 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Buy Now
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* LIGHTBOX (HD INSPECT) — unchanged */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center p-4 lg:p-12"
          >
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute top-8 right-8 w-16 h-16 rounded-full bg-white/10 hover:bg-gold-400 text-white flex items-center justify-center transition-all z-[210] group"
            >
              <X className="w-8 h-8 group-hover:rotate-90 transition-transform duration-500" />
            </button>

            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
              <motion.div
                key={selectedImage}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.images?.[selectedImage] || "https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000"}
                  alt="HD View"
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              </motion.div>

              {product.images?.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImage(prev => prev > 0 ? prev - 1 : product.images.length - 1)}
                    className="absolute left-0 lg:-left-20 w-16 h-16 rounded-full bg-white/5 hover:bg-gold-400 text-white flex items-center justify-center transition-all"
                  >
                    <ChevronLeft className="w-10 h-10" />
                  </button>
                  <button
                    onClick={() => setSelectedImage(prev => prev < product.images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-0 lg:-right-20 w-16 h-16 rounded-full bg-white/5 hover:bg-gold-400 text-white flex items-center justify-center transition-all"
                  >
                    <ChevronRight className="w-10 h-10" />
                  </button>
                </>
              )}
            </div>

            <div className="mt-12 flex gap-4 overflow-x-auto scrollbar-none max-w-full px-4">
              {product.images?.map((img: string, i: number) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`relative w-20 h-24 rounded-2xl overflow-hidden shrink-0 transition-all ${selectedImage === i ? "ring-2 ring-gold-400 scale-110" : "opacity-40"}`}
                >
                  <Image src={img} alt="Thumb" fill sizes="112px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── SHARED SUBCOMPONENTS (desktop — unchanged) ────────────────────────────

function DetailBox({ label, value }: any) {
  return (
    <div className="p-8 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10 shadow-soft">
      <p className="text-[11px] text-gray-400 font-bold uppercase tracking-widest mb-2">{label}</p>
      <p className="text-lg font-bold text-dark-900 dark:text-cream-50">{value}</p>
    </div>
  );
}

function CheckItem({ label, status, inverse = false }: any) {
  const isPositive = inverse ? !status : status;
  return (
    <div className="flex items-center gap-3">
      {isPositive ? <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" /> : <X className="w-5 h-5 text-red-400 shrink-0" />}
      <span className={`text-[11px] font-bold uppercase tracking-widest ${isPositive ? "text-dark-900 dark:text-cream-50" : "text-gray-400 line-through opacity-50"}`}>{label}</span>
    </div>
  );
}

function NavBtn({ icon, onClick }: any) {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 rounded-full bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-gold-400/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white hover:scale-110 transition-all shadow-2xl"
    >
      {icon}
    </button>
  );
}

function TrustItem({ icon, label }: any) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="text-gold-400 scale-125">{icon}</div>
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">{label}</span>
    </div>
  );
}

function TabButton({ active, label, onClick }: any) {
  return (
    <button onClick={onClick} className={`pb-8 text-xs font-bold uppercase tracking-[0.2em] transition-all relative ${active ? "text-gold-400" : "text-gray-400 hover:text-gold-400"}`}>
      {label}
      {active && <motion.div layoutId="productTabDesktop" className="absolute bottom-0 left-0 right-0 h-1 bg-gold-400 rounded-full" />}
    </button>
  );
}

function RatingBar({ star, percent }: any) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-sm font-bold text-gray-400 w-8">{star}★</span>
      <div className="flex-1 h-3 bg-gold-400/5 rounded-full overflow-hidden border border-gold-400/10">
        <motion.div initial={{ width: 0 }} animate={{ width: `${percent}%` }} transition={{ duration: 1, ease: "easeOut" }} className="h-full bg-gold-400 rounded-full" />
      </div>
      <span className="text-sm font-bold text-gray-500 w-12 text-right">{percent}%</span>
    </div>
  );
}

// ─── MOBILE-ONLY SUBCOMPONENTS (new CRO additions) ────────────────────────

function SpecPill({ icon, label, value, accent = false }: any) {
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[9px] font-bold uppercase tracking-widest ${accent
        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400"
        : "bg-white dark:bg-dark-900 border-gold-400/15 text-dark-900 dark:text-cream-50"
      }`}>
      {icon && <span className="text-gold-400">{icon}</span>}
      <span className="text-gray-400">{label}:</span>
      <span>{value}</span>
    </div>
  );
}

function MobileTrustBadge({ icon, label, sub }: any) {
  return (
    <div className="flex flex-col items-center gap-1">
      {icon}
      <span className="text-[8px] font-black text-dark-900 dark:text-cream-50 uppercase tracking-wide leading-tight">{label}</span>
      <span className="text-[7px] text-gray-400 font-medium leading-tight">{sub}</span>
    </div>
  );
}

function MobileCROAccordion({ icon, title, badge, badgeColor, content }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const badgeClass = badgeColor === "emerald"
    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
    : "bg-gold-400/10 text-gold-400 border-gold-400/20";

  return (
    <div className={`rounded-2xl overflow-hidden border transition-all duration-300 ${isOpen
        ? "border-gold-400/30 bg-white dark:bg-dark-900 shadow-sm"
        : "border-gold-400/10 bg-white/50 dark:bg-dark-900/50"
      }`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left"
      >
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isOpen ? "bg-gold-400/10" : "bg-transparent"} transition-colors`}>
            {icon}
          </div>
          <span className="text-[10px] font-black text-dark-900 dark:text-cream-50 uppercase tracking-widest">{title}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${badgeClass}`}>{badge}</span>
          <ChevronRight className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="px-4 pb-4 border-t border-gold-400/10"
          >
            <div className="pt-3">{content}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Keep old AccordionItem for any other uses
function AccordionItem({ icon, title, content }: any) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-gold-400/5 overflow-hidden">
      <button onClick={() => setIsOpen(!isOpen)} className="w-full py-5 flex items-center justify-between text-left group">
        <div className="flex items-center gap-3 text-dark-900 dark:text-cream-50">
          <div className="text-gold-400">{icon}</div>
          <span className="text-[10px] font-bold uppercase tracking-widest">{title}</span>
        </div>
        <ChevronRight className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-90" : ""}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="text-[11px] text-gray-500 pb-6 leading-relaxed px-7 font-medium">
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
