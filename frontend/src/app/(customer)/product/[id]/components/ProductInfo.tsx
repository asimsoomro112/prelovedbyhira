import { motion } from "framer-motion";
import { BadgeCheck, Star, Heart, TrendingUp, Zap, Tag, Minus, Plus } from "lucide-react";

interface ProductInfoProps {
  product: any;
  cond: { grade: string; label: string; pct: number; desc: string; color: string };
  mktVal: number;
  savedRs: number;
  savings: number;
  qty: number;
  setQty: React.Dispatch<React.SetStateAction<number>>;
}

export function ProductInfo({
  product,
  cond,
  mktVal,
  savedRs,
  savings,
  qty,
  setQty
}: ProductInfoProps) {
  return (
    <>
      {/* Brand + Status */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <span className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-dark-900 border border-gold-400/20 rounded-full text-[11px] font-black text-gold-400 uppercase tracking-[0.3em] shadow-sm">
          <BadgeCheck className="w-3.5 h-3.5" /> {product.brand}
        </span>
        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[9px] font-black uppercase tracking-widest ${
          (product.stock || 0) > 0 
            ? "bg-emerald-500/8 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" 
            : "bg-red-500/8 text-red-600 dark:text-red-400 border-red-500/20"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full animate-pulse ${(product.stock || 0) > 0 ? "bg-emerald-500" : "bg-red-500"}`} />
          {(product.stock || 0) > 0 ? `In Stock` : "Out of Stock"}
        </span>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-[1.6rem] lg:text-[2.4rem] xl:text-5xl font-display font-bold text-dark-900 dark:text-cream-50 leading-[1.1] tracking-tight">
          {product.title}
        </h1>

        {/* Rating + social proof row */}
        <div className="flex items-center flex-wrap gap-x-4 gap-y-2 mt-3">
          <div className="flex items-center gap-1.5">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 5 ? "fill-gold-400 text-gold-400" : "fill-gold-400/20 text-gold-400/20"}`} />
              ))}
            </div>
            <span className="text-sm font-bold text-dark-900 dark:text-cream-50">5.0</span>
          </div>
          <span className="text-gray-300 dark:text-gray-600 text-sm">·</span>
          <span className="flex items-center gap-1.5 text-xs text-gray-500 font-medium">
            <Heart className="w-3.5 h-3.5 text-gold-400" />
            <span className="font-bold text-dark-900 dark:text-cream-50">12</span> saved this
          </span>
        </div>
      </div>

      {/* ── PRICE BLOCK ──────────────────────────────────── */}
      <div className="p-5 lg:p-6 bg-white dark:bg-dark-900 rounded-2xl lg:rounded-3xl border border-gold-400/10 shadow-sm space-y-2">
        {/* Market value anchor */}
        <div className="flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
            Retail market value: Rs. {mktVal.toLocaleString()}
          </span>
        </div>
        <div className="flex items-end gap-4 flex-wrap">
          <p className="text-4xl lg:text-5xl font-accent font-bold text-gold-400 leading-none">
            Rs. {(product.sellingPrice || 0).toLocaleString()}
          </p>
          <div className="pb-0.5 space-y-1">
            <p className="text-lg text-gray-400 line-through decoration-red-400/50 decoration-2 font-medium leading-none">
              Rs. {(product.originalPrice || 0).toLocaleString()}
            </p>
            {savedRs > 0 && (
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-emerald-500" />
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  You save Rs. {savedRs.toLocaleString()} ({savings}% off)
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── CONDITION + SIZE ─────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        {/* Condition */}
        <div className="p-4 lg:p-5 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm space-y-2.5">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Star className="w-3 h-3 text-gold-400" /> Condition
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-black text-dark-900 dark:text-cream-50">{cond.label}</p>
              <p className="text-[9px] text-gray-400 font-medium mt-0.5">{cond.desc}</p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${
              cond.color === "emerald" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              : cond.color === "gold" ? "bg-gold-400/10 text-gold-500 border border-gold-400/20"
              : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}>
              {cond.grade}
            </div>
          </div>
          <div className="h-1.5 bg-gray-100 dark:bg-dark-800 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${cond.pct}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className={`h-full rounded-full ${
                cond.color === "emerald" ? "bg-emerald-500" : cond.color === "gold" ? "bg-gold-400" : "bg-amber-500"
              }`}
            />
          </div>
        </div>

        {/* Size */}
        <div className="p-4 lg:p-5 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm space-y-2.5">
          <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
            <Tag className="w-3 h-3 text-gold-400" /> Size · {product.category}
          </p>
          <div className="flex items-center justify-between gap-2">
            <p className={`font-accent font-bold text-dark-900 dark:text-cream-50 truncate ${
              (product.size || "").length > 6 ? "text-xl lg:text-2xl" : "text-3xl lg:text-4xl"
            }`}>
              {product.size || "M"}
            </p>
            <div className="text-right shrink-0">
              <p className="text-[9px] text-gray-400 font-medium">International</p>
              <p className="text-[9px] text-gold-400 font-bold mt-0.5">Size Guide →</p>
            </div>
          </div>
          {product.color && (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full border border-gray-200 dark:border-gray-700 bg-gray-200" style={{ background: product.color?.toLowerCase() }} />
              <span className="text-[10px] text-gray-500 font-medium">{product.color}</span>
            </div>
          )}
        </div>
      </div>

      {/* ── QUANTITY SELECTOR ─────────────────────────────── */}
      {(product.stock || 0) > 1 && (
        <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Select Quantity</span>
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setQty(Math.max(1, qty - 1))}
              className="w-10 h-10 rounded-xl border border-gold-400/20 flex items-center justify-center text-gold-400 hover:bg-gold-400/5 active:scale-90 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-xl font-accent font-bold w-4 text-center">{qty}</span>
            <button 
              onClick={() => setQty(Math.min(product.stock || 1, qty + 1))}
              className="w-10 h-10 rounded-xl border border-gold-400/20 flex items-center justify-center text-gold-400 hover:bg-gold-400/5 active:scale-90 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
