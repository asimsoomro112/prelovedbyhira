import Image from "next/image";
import Link from "next/link";
import { Star, CheckCircle2, ArrowRight, Lock, Package, Award, RotateCcw } from "lucide-react";

interface SellerProfileProps {
  product: any;
}

export function SellerProfile({ product }: SellerProfileProps) {
  return (
    <>
      {/* ── SELLER CARD ──────────────────────────────────── */}
      <div className="p-5 lg:p-6 bg-white dark:bg-dark-900 rounded-2xl lg:rounded-3xl border border-gold-400/10 shadow-sm hover:border-gold-400/25 transition-all">
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-4">Sold by</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative shrink-0">
              <div className="relative w-14 h-14 lg:w-16 lg:h-16 rounded-2xl overflow-hidden border-2 border-gold-400/30">
                <Image src={product.seller?.user?.avatar || "/placeholder.jpg"} alt={product.seller?.user?.name || "Seller"} fill sizes="64px" className="object-cover" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900" />
            </div>
            <div>
              <p className="font-bold text-dark-900 dark:text-cream-50 flex items-center gap-1.5">
                {product.seller?.user?.name || "Exclusive Boutique"}
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </p>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-1 mt-1.5">
                <span className="flex items-center gap-1 text-xs text-gray-500 font-medium">
                  <Star className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />
                  {product.seller?.rating || "5.0"}
                </span>
                <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
                <span className="text-xs text-gray-500 font-medium">
                  {product.seller?.totalSales || "120"}+ sales
                </span>

              </div>
            </div>
          </div>
          <Link
            href={`/shop/${product.sellerId || product.seller?.userId}`}
            className="w-10 h-10 rounded-xl bg-gold-400/8 border border-gold-400/20 text-gold-400 flex items-center justify-center hover:bg-gold-400 hover:text-white hover:border-transparent transition-all hover:scale-105"
          >
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      {/* ── TRUST BADGES ROW ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-2.5">
        {[
          { icon: <Lock className="w-4 h-4" />,       label: "Escrow",   sub: "100% Safe",     c: "emerald" },
          { icon: <Package className="w-4 h-4" />,    label: "24h Ship", sub: "Nationwide",    c: "gold"    },
          { icon: <Award className="w-4 h-4" />,      label: "Vetted",   sub: "By ReVault",       c: "gold"    },
          { icon: <RotateCcw className="w-4 h-4" />,  label: "Returns",  sub: "7-day policy",  c: "slate"   },
        ].map((b, i) => (
          <div key={i} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center ${
            b.c === "emerald" ? "bg-emerald-500/5 border-emerald-500/15 text-emerald-500" :
            b.c === "gold"    ? "bg-gold-400/5 border-gold-400/15 text-gold-400" :
            "bg-gray-100/60 dark:bg-dark-900 border-gray-200/60 dark:border-dark-800 text-gray-500"
          }`}>
            {b.icon}
            <p className="text-[10px] font-black uppercase tracking-wide leading-tight">{b.label}</p>
            <p className="text-[9px] opacity-65 font-medium leading-tight">{b.sub}</p>
          </div>
        ))}
      </div>
    </>
  );
}
