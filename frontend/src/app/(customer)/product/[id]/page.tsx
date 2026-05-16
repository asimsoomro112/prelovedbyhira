"use client";

/**
 * ProductDetailPage — Premium Preloved Marketplace PDP
 * Complete ground-up redesign for maximum CRO + trust + conversion.
 * Mobile-first, Gen Z audience, luxury editorial aesthetic.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  Heart, Share2, Star, ShieldCheck, Truck, MessageCircle,
  ArrowRight, ChevronLeft, ChevronRight, ShoppingBag,
  CheckCircle2, AlertTriangle, X, Eye, Zap, Clock,
  TrendingUp, Flame, BadgeCheck, Phone, Lock, Award,
  Users, Timer, ZoomIn, RotateCcw, Package, Tag,
  Check, Minus, Plus, Upload, Play, Volume2, VolumeX, Pause
} from "lucide-react";
import api from "@/lib/api";
import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { toast } from "sonner";
import { ProductGallery } from "./components/ProductGallery";
import { ProductInfo } from "./components/ProductInfo";
import { ProductActions } from "./components/ProductActions";
import { SellerProfile } from "./components/SellerProfile";


// ─────────────────────────────────────────────────────────────────────────────
// HOOKS
// ─────────────────────────────────────────────────────────────────────────────

function useLiveViewers(base = 5) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const t = setInterval(() => setV(n => Math.max(2, n + (Math.random() > 0.5 ? 1 : -1))), 7000);
    return () => clearInterval(t);
  }, []);
  return v;
}

function useSwipe(onLeft: () => void, onRight: () => void) {
  const x = useRef<number | null>(null);
  return {
    onTouchStart: (e: React.TouchEvent) => { x.current = e.touches[0].clientX; },
    onTouchEnd:   (e: React.TouchEvent) => {
      if (x.current === null) return;
      const d = x.current - e.changedTouches[0].clientX;
      if (Math.abs(d) > 48) d > 0 ? onLeft() : onRight();
      x.current = null;
    },
  };
}

function useInView(cb: (v: boolean) => void, deps: any[] = []) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!ref.current) return;
    const o = new IntersectionObserver(([e]) => cb(e.isIntersecting), { threshold: 0 });
    o.observe(ref.current);
    return () => o.disconnect();
  }, deps); // eslint-disable-line
  return ref;
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────────────────────────────────────

const BUYERS = ["Zara K.", "Hina M.", "Ayesha R.", "Sara N.", "Fatima A.", "Maryam T.", "Sana B.", "Nadia Q."];
const rb = () => BUYERS[Math.floor(Math.random() * BUYERS.length)];

const CONDITION: Record<string, { grade: string; label: string; pct: number; desc: string; color: string }> = {
  NEW:       { grade: "A+", label: "Brand New",  pct: 100, desc: "Never worn · Tags still attached",  color: "emerald" },
  EXCELLENT: { grade: "A",  label: "Excellent",  pct: 85,  desc: "Like new · Barely worn",             color: "gold"    },
  GOOD:      { grade: "B",  label: "Good",       pct: 65,  desc: "Light signs of wear",                color: "amber"   },
  FAIR:      { grade: "C",  label: "Fair",       pct: 40,  desc: "Visible wear · Still functional",    color: "orange"  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function ProductDetailPage() {
  const { id }      = useParams();
  const { addItem } = useCartStore();
  const { isAuthenticated } = useAuthStore();

  const [img, setImg]               = useState(0);
  const [tab, setTab]               = useState("description");
  const [lightbox, setLightbox]     = useState(false);
  const [wishlisted, setWishlisted] = useState(false);
  const [pulsed, setPulsed]         = useState(false);
  const [sticky, setSticky]         = useState(false);
  const [qty, setQty]               = useState(1);

  const viewers        = useLiveViewers(6);
  const [mobBuyer]     = useState(rb);
  const [deskBuyer]    = useState(rb);
  const [showMobFomo, setShowMobFomo]   = useState(false);
  const [showDeskFomo, setShowDeskFomo] = useState(false);

  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [isVideoMuted, setIsVideoMuted]         = useState(true);
  const [isVideoPlaying, setIsVideoPlaying]     = useState(true);
  const [videoProgress, setVideoProgress]       = useState(0);
  const [showSkipBtn, setShowSkipBtn]           = useState(false);
  const [hasSeenVideo, setHasSeenVideo]         = useState(false);
  const [urgencyCount]                          = useState(() => Math.floor(Math.random() * 3) + 1);

  const videoRef = useRef<HTMLVideoElement>(null);
  const actionsRef = useInView(useCallback((v: boolean) => setSticky(!v), []), []);

  const { data: res, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: async () => { const { data } = await api.get(`/products/${id}`); return data; },
  });

  const product = res?.product;

  const galleryItems = [
    ...(product?.videoUrl ? [{ type: 'video', url: product.videoUrl }] : []),
    ...(product?.images || []).map((url: string) => ({ type: 'image', url }))
  ];

  useEffect(() => {
    const a = setTimeout(() => setShowMobFomo(true),  4500);
    const b = setTimeout(() => setShowMobFomo(false), 9500);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    const a = setTimeout(() => setShowDeskFomo(true),  6500);
    const b = setTimeout(() => setShowDeskFomo(false), 13000);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setPulsed(true), 3000);
    return () => clearTimeout(t);
  }, []);

  const swipe = useSwipe(
    () => product?.images?.length > 1 && setImg(p => p < product.images.length - 1 ? p + 1 : 0),
    () => product?.images?.length > 1 && setImg(p => p > 0 ? p - 1 : product.images.length - 1),
  );

  const onWishlist = () => {
    setWishlisted(w => !w);
    toast.success(wishlisted ? "Removed from wishlist" : "Saved to wishlist ❤️");
  };

  const onAddBag = (quantity = 1) => {
    addItem(product, quantity);
    toast.success(`${quantity} item(s) added to your bag`);
  };

  const onShare = async () => {
    try { await navigator.share({ title: product?.title, url: window.location.href }); }
    catch { navigator.clipboard.writeText(window.location.href); toast.success("Link copied!"); }
  };

  useEffect(() => {
    const seen = localStorage.getItem(`pdp_video_seen_${id}`);
    if (seen) setHasSeenVideo(true);
    
    if (!seen && product?.videoUrl) {
      const timer = setTimeout(() => openVideoModal(), 1500);
      return () => clearTimeout(timer);
    }
  }, [id, product?.videoUrl]);

  const openVideoModal = () => {
    setIsVideoModalOpen(true);
    setIsVideoPlaying(true);
    setVideoProgress(0);
    setShowSkipBtn(false);
    setTimeout(() => setShowSkipBtn(true), 3000);
    localStorage.setItem(`pdp_video_seen_${id}`, 'true');
    setHasSeenVideo(true);
  };

  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setIsVideoPlaying(false);
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isVideoPlaying) videoRef.current.pause();
    else videoRef.current.play();
    setIsVideoPlaying(!isVideoPlaying);
  };

  const onVideoTimeUpdate = () => {
    if (!videoRef.current) return;
    const p = (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setVideoProgress(p);
    if (p >= 100) closeVideoModal();
  };

  if (isLoading) return <Skeleton />;

  if (!product) return (
    <div className="h-screen flex flex-col items-center justify-center gap-6 bg-gray-50 dark:bg-dark-950">
      <div className="w-20 h-20 rounded-full bg-gold-400/10 flex items-center justify-center">
        <AlertTriangle className="w-10 h-10 text-gold-400" />
      </div>
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-display font-bold">Piece Not Found</h2>
        <p className="text-gray-500 text-sm">This item may have already been sold or removed.</p>
      </div>
      <Link href="/products" className="px-8 py-3.5 bg-gold-400 text-white rounded-2xl font-bold text-sm hover:scale-105 transition-all shadow-gold">
        Browse Marketplace
      </Link>
    </div>
  );

  const cond    = CONDITION[product.condition] ?? CONDITION.GOOD;
  const savings = product.originalPrice && product.sellingPrice
    ? Math.round((product.originalPrice - product.sellingPrice) / product.originalPrice * 100) : 0;
  const savedRs = (product.originalPrice || 0) - (product.sellingPrice || 0);
  const mktVal  = Math.round((product.originalPrice || 0) * 1.2);

  return (
    <>
      {/* ── FOMO TOASTS ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showMobFomo && (
          <motion.div
            initial={{ x: -160, opacity: 0 }} animate={{ x: 0, opacity: 1 }}
            exit={{ x: -160, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
            className="lg:hidden fixed bottom-[148px] left-4 z-[160] flex items-center gap-3 bg-white dark:bg-dark-900 border border-gold-400/20 rounded-2xl px-4 py-3 shadow-2xl max-w-[260px]"
          >
            <div className="w-8 h-8 rounded-full bg-gold-400/15 flex items-center justify-center shrink-0 text-gold-400 font-black text-sm">
              {mobBuyer.charAt(0)}
            </div>
            <div>
              <p className="text-[10px] font-bold text-dark-900 dark:text-cream-50 leading-tight">
                <span className="text-gold-400">{mobBuyer}</span> just saved this
              </p>
              <p className="text-[8px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                <span className="w-1 h-1 bg-emerald-500 rounded-full" /> 3 minutes ago
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeskFomo && (
          <motion.div
            initial={{ y: 16, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            exit={{ y: 16, opacity: 0 }} transition={{ type: "spring", damping: 22 }}
            className="hidden lg:flex fixed bottom-8 left-8 z-[160] items-center gap-4 bg-white dark:bg-dark-900 border border-gold-400/15 rounded-3xl px-5 py-4 shadow-2xl max-w-[310px]"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center shrink-0 text-white font-black text-sm shadow-gold">
              {deskBuyer.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-bold text-dark-900 dark:text-cream-50">
                <span className="text-gold-400">{deskBuyer}</span> is viewing this piece
              </p>
              <p className="text-[9px] text-gray-400 mt-0.5 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                Just now · {viewers} people viewing
              </p>
            </div>
            <button onClick={() => setShowDeskFomo(false)} className="w-6 h-6 rounded-full bg-gray-100 dark:bg-dark-800 flex items-center justify-center text-gray-400 hover:text-gray-700 shrink-0">
              <X className="w-3 h-3" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── DESKTOP STICKY HEADER ──────────────────────────────────────── */}
      <AnimatePresence>
        {sticky && (
          <motion.header
            initial={{ y: -72 }} animate={{ y: 0 }} exit={{ y: -72 }}
            transition={{ type: "spring", damping: 26, stiffness: 260 }}
            className="hidden lg:flex fixed top-0 inset-x-0 z-[130] bg-white/92 dark:bg-dark-950/92 backdrop-blur-xl border-b border-gold-400/12 shadow-lg"
          >
            <div className="max-w-screen-xl mx-auto px-12 h-[68px] flex items-center justify-between w-full gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-gold-400/20 shrink-0">
                  <Image src={product.images?.[0] || "/placeholder.jpg"} alt="" fill sizes="48px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold truncate max-w-[280px] text-dark-900 dark:text-cream-50">{product.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-base font-accent font-bold text-gold-400">Rs. {(product.sellingPrice || 0).toLocaleString()}</span>
                    {savings > 0 && <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">−{savings}%</span>}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-2 text-[10px] font-bold text-red-500">
                  <Flame className="w-3.5 h-3.5 animate-pulse" /> {viewers} viewing · {urgencyCount} left
                </div>
                <button onClick={() => onAddBag(qty)} className="h-10 px-5 border-2 border-gold-400/40 text-gold-500 rounded-xl font-bold text-xs hover:border-gold-400 hover:bg-gold-400/5 transition-all flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4" /> Bag
                </button>
                <Link 
                  href={isAuthenticated 
                    ? `/checkout?id=${product.id}&qty=${qty}` 
                    : `/login?redirect=/checkout?id=${product.id}&qty=${qty}`
                  } 
                  className="h-10 px-6 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-xl font-black text-xs shadow-gold hover:shadow-gold-lg active:scale-[0.95] transition-all flex items-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5" /> {isAuthenticated ? 'Buy Now' : 'Login to Checkout'}
                </Link>
              </div>
            </div>
          </motion.header>
        )}
      </AnimatePresence>

      {/* ── MAIN ───────────────────────────────────────────────────────── */}
      <main className="min-h-screen bg-gray-50 dark:bg-dark-950 pb-36 lg:pb-20">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-6 lg:py-12">

          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="flex items-center gap-2 mb-5 lg:mb-8 text-[10px] font-bold uppercase tracking-widest text-gray-400">
            <Link href="/products" className="hover:text-gold-400 transition-colors">Marketplace</Link>
            <ChevronRight className="w-3 h-3" />
            <Link href={`/products?category=${product.category}`} className="hover:text-gold-400 transition-colors text-gold-400/70">{product.category}</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="truncate max-w-[180px] text-gray-500">{product.title}</span>
          </nav>

          {/* ── MOBILE SCARCITY BAR ──────────────────────────────────── */}
          <div className="lg:hidden flex items-center justify-between mb-4 px-0.5">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-red-500/10 border border-red-500/20 rounded-full px-3 py-1.5 text-[9px] font-black text-red-500 uppercase tracking-widest">
                <Flame className="w-3 h-3 animate-pulse" /> {urgencyCount} of {urgencyCount} Left
              </span>
              <span className="flex items-center gap-1.5 bg-white dark:bg-dark-900 border border-gold-400/15 rounded-full px-3 py-1.5 text-[9px] font-bold text-gray-500">
                <Eye className="w-3 h-3 text-gold-400" /> {viewers} viewing
              </span>
            </div>
            <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-500">
              <Timer className="w-3 h-3" /> Ships 24h
            </span>
          </div>

          {/* ── DESKTOP SCARCITY BAR ────────────────────────────────── */}
          <div className="hidden lg:flex items-center justify-between mb-8 px-6 py-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 bg-red-500/8 border border-red-500/15 rounded-full px-4 py-2 text-[10px] font-black text-red-500 uppercase tracking-widest">
                <Flame className="w-3.5 h-3.5 animate-pulse" /> Only {urgencyCount} Remaining in Vault
              </span>
              <div className="flex items-center gap-2.5">
                <div className="flex -space-x-2">
                  {[...Array(Math.min(viewers, 4))].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-gold-300 to-gold-500 border-2 border-white dark:border-dark-900 shadow-sm" />
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 font-medium">
                  <span className="font-black text-dark-900 dark:text-cream-50">{viewers}</span> people viewing right now
                </p>
              </div>
            </div>
            <div className="flex items-center gap-5">
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-500 uppercase tracking-widest"><Timer className="w-3.5 h-3.5" /> Ships in 24h</span>
              <span className="text-gray-200 dark:text-gray-700">|</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gold-400 uppercase tracking-widest"><Lock className="w-3.5 h-3.5" /> Escrow Protected</span>
              <span className="text-gray-200 dark:text-gray-700">|</span>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-gray-500 uppercase tracking-widest"><RotateCcw className="w-3.5 h-3.5" /> Free Returns</span>
            </div>
          </div>

          {/* ── MAIN GRID ───────────────────────────────────────────── */}
          <div className="grid lg:grid-cols-[1fr_460px] xl:grid-cols-[1fr_500px] gap-6 lg:gap-10 xl:gap-16 items-start">


            {/* ── LEFT: IMAGE GALLERY ────────────────────────────── */}
            <ProductGallery 
              product={product} 
              img={img} 
              setImg={setImg} 
              galleryItems={galleryItems} 
              swipe={swipe} 
              setLightbox={setLightbox} 
              wishlisted={wishlisted} 
              onWishlist={onWishlist} 
              onShare={onShare} 
              savings={savings} 
            />

            {/* ── RIGHT: PRODUCT INFO ────────────────────────────── */}
            <article className="space-y-5 lg:space-y-6">


              <ProductInfo 
                product={product} 
                cond={cond} 
                mktVal={mktVal} 
                savedRs={savedRs} 
                savings={savings} 
                qty={qty} 
                setQty={setQty} 
              />


              <ProductActions 
                product={product} 
                isAuthenticated={isAuthenticated} 
                qty={qty} 
                pulsed={pulsed} 
                onAddBag={onAddBag} 
                openVideoModal={openVideoModal} 
                actionsRef={actionsRef} 
              />


              <SellerProfile product={product} />
            </article>
          </div>

          {/* ── PRODUCT TABS ─────────────────────────────────────────── */}
          <section className="mt-16 lg:mt-24" aria-label="Product details">
            <div className="flex gap-1 bg-white dark:bg-dark-900 rounded-2xl p-1.5 border border-gold-400/10 shadow-sm mb-8 overflow-x-auto scrollbar-none">
              {[
                { key: "description", label: "Details" },
                { key: "condition",   label: "Condition Report" },
                { key: "shipping",    label: "Shipping & Returns" },
              ].map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`relative px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap shrink-0 ${
                    tab === t.key
                      ? "bg-gold-400 text-white shadow-gold"
                      : "text-gray-500 hover:text-gold-400 hover:bg-gold-400/5"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {tab === "description" && (
                <motion.div key="desc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="max-w-3xl space-y-8">
                  <blockquote className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed font-serif italic border-l-2 border-gold-400 pl-6">
                    "{product.description}"
                  </blockquote>
                  <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-gold-400/10">
                    {[
                      { label: "Brand",     value: product.brand },
                      { label: "Category",  value: product.category },
                      { label: "Size",      value: product.size || "M" },
                      { label: "Condition", value: cond.label },
                    ].map((r, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest w-20 shrink-0">{r.label}</span>
                        <span className="text-sm font-bold text-dark-900 dark:text-cream-50">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {tab === "condition" && (
                <motion.div key="cond" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="max-w-3xl">
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      { label: "Overall Condition",    value: cond.label,                              ok: true },
                      { label: "Original Packaging",   value: product.originalPacking ? "Yes" : "No",  ok: !!product.originalPacking },
                      { label: "Invoice Available",    value: product.invoiceAvailable ? "Yes" : "No", ok: !!product.invoiceAvailable },
                      { label: "Any Alterations",      value: product.isAltered ? "Yes" : "None",      ok: !product.isAltered },
                    ].map((r, i) => (
                      <div key={i} className={`flex items-center justify-between p-4 rounded-2xl border ${r.ok ? "bg-emerald-500/5 border-emerald-500/15" : "bg-red-500/5 border-red-500/15"}`}>
                        <span className="text-xs font-bold text-dark-900 dark:text-cream-50">{r.label}</span>
                        <span className={`flex items-center gap-1.5 text-xs font-bold ${r.ok ? "text-emerald-500" : "text-red-400"}`}>
                          {r.ok ? <CheckCircle2 className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />} {r.value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 font-medium mt-6 leading-relaxed">
                    All items are personally inspected and graded by our team. Condition grades follow industry-standard guidelines for preloved fashion.
                  </p>
                </motion.div>
              )}

              {tab === "shipping" && (
                <motion.div key="ship" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="max-w-3xl space-y-4">
                  {[
                    { icon: <Timer className="w-5 h-5 text-emerald-500" />,   title: "Ships within 24 hours", body: "Your order is dispatched the next business day after payment confirmation." },
                    { icon: <Lock className="w-5 h-5 text-gold-400" />,       title: "Escrow Protection",      body: "Your payment is held securely. Funds only release when you confirm receipt and authenticity." },
                    { icon: <Package className="w-5 h-5 text-gold-400" />,    title: "Nationwide Delivery",    body: "Insured door-to-door shipping across Pakistan in 3–5 business days." },
                    { icon: <RotateCcw className="w-5 h-5 text-gray-400" />,  title: "7-Day Return Policy",   body: "Not satisfied? Return within 7 days for a full refund — no questions asked." },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-dark-800 flex items-center justify-center shrink-0">{s.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-dark-900 dark:text-cream-50">{s.title}</p>
                        <p className="text-xs text-gray-500 font-medium mt-0.5 leading-relaxed">{s.body}</p>
                      </div>
                    </div>
                  ))}
                </motion.div>
              )}

              {tab === "reviews" && (
                <motion.div key="rev" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3 }} className="text-center py-16 bg-white dark:bg-dark-900 rounded-[32px] border border-gold-400/10 shadow-sm">
                   <div className="w-20 h-20 bg-gold-400/10 text-gold-400 rounded-full flex items-center justify-center mx-auto mb-6">
                     <Star className="w-10 h-10" />
                   </div>
                   <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">No Reviews Yet</h3>
                   <p className="text-gray-500 text-sm mt-3 max-w-xs mx-auto">Only verified buyers can leave reviews after a successful transaction. Your feedback will help build seller trust.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        </div>
      </main>

      {/* ── MOBILE STICKY CTA ────────────────────────────────────────── */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-[110]">
        {/* Urgency strip */}
        <div className="flex items-center justify-center gap-2 bg-red-500 py-2 px-4">
          <Flame className="w-3 h-3 text-white animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.18em]">
            {viewers} people viewing · Only 1 left
          </span>
        </div>
        {/* CTA Bar */}
        <div className="bg-white dark:bg-dark-950 border-t border-gold-400/15 px-4 pt-3 pb-[env(safe-area-inset-bottom,16px)] pb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">Elite Price</p>
              <p className="text-2xl font-accent font-bold text-gold-400 leading-none">Rs. {(product.sellingPrice || 0).toLocaleString()}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onWishlist}
                className={`w-11 h-11 rounded-xl border flex items-center justify-center transition-all active:scale-90 ${wishlisted ? "bg-red-500/10 border-red-400/30 text-red-500" : "bg-gray-50 dark:bg-dark-900 border-gray-200 dark:border-dark-700 text-gray-500"}`}
              >
                <Heart className={`w-5 h-5 ${wishlisted ? "fill-red-500" : ""}`} />
              </button>

            </div>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={() => onAddBag(qty)}
              className="flex-1 h-[50px] border-2 border-gold-400/35 text-gold-500 dark:text-gold-400 rounded-2xl font-bold text-xs uppercase tracking-wider active:scale-[0.95] transition-all flex items-center justify-center gap-2"
            >
              <ShoppingBag className="w-4 h-4" /> Bag
            </button>
            <motion.div
              animate={pulsed && (product.stock || 0) > 0 ? { scale: [1, 1.03, 1] } : {}}
              transition={{ repeat: 3, duration: 0.6 }}
              className="flex-[1.7]"
            >
              <Link
                href={(product.stock || 0) > 0 ? `/checkout?id=${product.id}&qty=${qty}` : "#"}
                onClick={e => (product.stock || 0) <= 0 && e.preventDefault()}
                className={`flex items-center justify-center gap-2 h-[50px] w-full rounded-2xl font-black text-sm uppercase tracking-wider transition-all ${(product.stock || 0) > 0 ? "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white shadow-gold active:scale-[0.95]" : "bg-gray-200 dark:bg-dark-800 text-gray-400 cursor-not-allowed"}`}
              >
                <Zap className="w-4 h-4" /> {(product.stock || 0) > 0 ? "Buy Now" : "Sold Out"}
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* ── LIGHTBOX ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-black/96 backdrop-blur-3xl flex flex-col items-center justify-center p-4 lg:p-12"
          >
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-gold-400 text-white flex items-center justify-center transition-all group z-10"
            >
              <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
            </button>
            <div className="relative w-full h-full max-w-5xl flex items-center justify-center">
              <motion.div key={img} initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} className="relative w-full h-full">
                <Image src={product.images?.[img] || "/placeholder.jpg"} alt="HD" fill sizes="100vw" className="object-contain" />
              </motion.div>
              {product.images?.length > 1 && (
                <>
                  <button onClick={() => setImg(p => p > 0 ? p - 1 : product.images.length - 1)} className="absolute left-0 lg:-left-16 w-14 h-14 rounded-full bg-white/8 hover:bg-gold-400 text-white flex items-center justify-center transition-all">
                    <ChevronLeft className="w-8 h-8" />
                  </button>
                  <button onClick={() => setImg(p => p < product.images.length - 1 ? p + 1 : 0)} className="absolute right-0 lg:-right-16 w-14 h-14 rounded-full bg-white/8 hover:bg-gold-400 text-white flex items-center justify-center transition-all">
                    <ChevronRight className="w-8 h-8" />
                  </button>
                </>
              )}
            </div>
            <div className="mt-8 flex gap-3 overflow-x-auto scrollbar-none px-4 shrink-0">
              {product.images?.map((src: string, i: number) => (
                <button key={i} onClick={() => setImg(i)} className={`relative w-16 h-20 rounded-xl overflow-hidden shrink-0 transition-all ${i === img ? "ring-2 ring-gold-400 scale-110" : "opacity-35 hover:opacity-70"}`}>
                  <Image src={src} alt="" fill sizes="64px" className="object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* ── CINEMATIC VIDEO MODAL ────────────────────────────────────── */}
      <AnimatePresence>
        {isVideoModalOpen && (
          <>
            {/* Cinematic Letterbox Bars */}
            <motion.div 
              initial={{ height: 0 }} animate={{ height: "6vh" }} exit={{ height: 0 }}
              className="fixed top-0 inset-x-0 z-[10000] bg-black pointer-events-none"
            />
            <motion.div 
              initial={{ height: 0 }} animate={{ height: "6vh" }} exit={{ height: 0 }}
              className="fixed bottom-0 inset-x-0 z-[10000] bg-black pointer-events-none"
            />

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/90 backdrop-blur-3xl p-4 lg:p-8"
              onClick={closeVideoModal}
            >
              <motion.div
                initial={{ scale: 0.9, y: 40, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="relative w-full max-w-5xl bg-dark-950 rounded-[32px] overflow-hidden border border-white/10 shadow-2xl"
                onClick={e => e.stopPropagation()}
              >
                {/* Video Container */}
                <div className="relative aspect-video bg-black group">
                  <video
                    ref={videoRef}
                    src={product.videoUrl}
                    autoPlay
                    muted={isVideoMuted}
                    playsInline
                    onTimeUpdate={onVideoTimeUpdate}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Floating Label */}
                  <div className="absolute top-6 left-6 px-4 py-2 bg-black/40 backdrop-blur-md border border-white/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white/60 pointer-events-none">
                    {product.brand} — Cinematic Film
                  </div>

                  {/* Play/Pause Large Overlay */}
                  <button 
                    onClick={togglePlay}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-xl border border-white/20 flex items-center justify-center text-white scale-90 hover:scale-100 transition-transform">
                      {isVideoPlaying ? <Pause className="w-8 h-8 fill-white" /> : <Play className="w-8 h-8 fill-white ml-1" />}
                    </div>
                  </button>

                  {/* Sound Toggle */}
                  <button
                    onClick={() => setIsVideoMuted(!isVideoMuted)}
                    className="absolute bottom-6 right-6 w-10 h-10 rounded-full bg-black/40 backdrop-blur-md border border-white/15 flex items-center justify-center text-white hover:bg-black/60 transition-all z-10"
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>

                  {/* Progress Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/10 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-gold-400 to-gold-600 shadow-[0_0_8px_rgba(212,175,55,0.6)]"
                      style={{ width: `${videoProgress}%` }}
                    />
                  </div>
                </div>

                {/* Modal Footer */}
                <div className="p-6 lg:p-8 bg-dark-900 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-white/5">
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="text-xl font-display font-bold text-cream-50 leading-tight">{product.title}</h3>
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-widest">
                      Spatial Luxury · Vetted Condition · Rs. {product.sellingPrice?.toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    <AnimatePresence>
                      {showSkipBtn && (
                        <motion.button
                          initial={{ opacity: 0, x: 10 }}
                          animate={{ opacity: 1, x: 0 }}
                          onClick={closeVideoModal}
                          className="h-10 px-6 bg-transparent border border-white/10 text-gray-400 rounded-xl text-xs font-bold hover:text-white hover:border-white/30 transition-all"
                        >
                          Skip film
                        </motion.button>
                      )}
                    </AnimatePresence>
                    <button
                      onClick={closeVideoModal}
                      className="w-10 h-10 rounded-xl bg-red-500/10 text-red-400 flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

function AuthItem({ label, ok }: { label: string; ok: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/10 text-red-400"}`}>
        {ok ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
      </div>
      <span className={`text-[11px] font-bold ${ok ? "text-dark-900 dark:text-cream-50" : "text-gray-400 line-through opacity-60"}`}>{label}</span>
    </div>
  );
}

function Skeleton() {
  const pulse = "animate-pulse bg-gray-200 dark:bg-dark-800 rounded-2xl";
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-950 pb-32 lg:pb-16">
      <div className="max-w-screen-xl mx-auto px-4 lg:px-12 py-6 lg:py-12">
        <div className={`${pulse} h-4 w-64 rounded-full mb-8`} />
        <div className="grid lg:grid-cols-[1fr_460px] gap-10">
          <div className={`${pulse} aspect-[4/5] lg:aspect-[3/4]`} />
          <div className="space-y-5">
            <div className={`${pulse} h-8 w-32 rounded-full`} />
            <div className={`${pulse} h-14 w-full`} />
            <div className={`${pulse} h-6 w-48`} />
            <div className={`${pulse} h-28 w-full`} />
            <div className={`${pulse} h-[60px] w-full`} />
            <div className={`${pulse} h-[52px] w-full`} />
            <div className={`${pulse} h-36 w-full`} />
            <div className={`${pulse} h-24 w-full`} />
          </div>
        </div>
      </div>
    </div>
  );
}
