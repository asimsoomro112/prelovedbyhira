import { motion } from "framer-motion";
import { Info, Truck, Shield, Leaf, Ruler, Package, History, Zap, Star, Lock } from "lucide-react";
import { useState } from "react";

interface ProductDetailsProps {
  product: any;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "shipping">("desc");

  const tabs = [
    { id: "desc",     label: "Description", icon: <Info size={14} /> },
    { id: "specs",    label: "Attributes",  icon: <Ruler size={14} /> },
    { id: "shipping", label: "Shipping",    icon: <Truck size={14} /> },
  ];

  return (
    <div className="mt-12 lg:mt-16 space-y-10">
      {/* ── TABS NAVIGATION ──────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-gray-100/50 dark:bg-dark-900/50 backdrop-blur-md rounded-2xl border border-gold-400/10 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`relative flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === tab.id 
                ? "text-dark-900 dark:text-cream-50" 
                : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            }`}
          >
            {activeTab === tab.id && (
              <motion.div 
                layoutId="activeTab"
                className="absolute inset-0 bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gold-400/20"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              {tab.icon} {tab.label}
            </span>
          </button>
        ))}
      </div>

      {/* ── TAB CONTENT ──────────────────────────────────── */}
      <div className="min-h-[300px]">
        {activeTab === "desc" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="prose prose-gold dark:prose-invert max-w-none">
              <p className="text-lg lg:text-xl text-dark-800 dark:text-cream-100 font-medium leading-relaxed italic border-l-4 border-gold-400 pl-6 py-1">
                {product.description || "No detailed description provided for this luxury piece."}
              </p>
            </div>

            {/* Luxury Narrative Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
              <div className="p-6 bg-gold-400/5 rounded-[32px] border border-gold-400/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gold-400/10 flex items-center justify-center text-gold-500">
                    <Shield size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-dark-900 dark:text-cream-50">Vault Authenticity</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  This {product.brand} piece has been meticulously audited via our Neural-Verification protocol. 
                  Every stitch, fabric weave, and serial tag has been cross-referenced with luxury archives to ensure 
                  a 100% authentic resale experience.
                </p>
              </div>

              <div className="p-6 bg-emerald-500/5 rounded-[32px] border border-emerald-500/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Leaf size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest text-dark-900 dark:text-cream-50">Sustainability Impact</h4>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-medium">
                  By choosing this preloved item, you've saved approx. <span className="text-emerald-500 font-bold">12,000L of water</span> and 
                  prevented <span className="text-emerald-500 font-bold">24kg of CO2</span> emissions compared to buying new. Luxury that respects the planet.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "specs" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          >
            {[
              { label: "Category",   val: product.category,   icon: <Package size={14} /> },
              { label: "Size",       val: product.size || "Standard", icon: <Ruler size={14} /> },
              { label: "Color",      val: product.color || "Original", icon: <div className="w-3.5 h-3.5 rounded-full border border-white/20" style={{ background: product.color?.toLowerCase() }} /> },
              { label: "Material",   val: product.material || "Premium Silk/Cotton", icon: <Zap size={14} /> },
              { label: "Collection", val: "SS/2026",          icon: <Star size={14} /> },
              { label: "Authentic",  val: "Yes (Verified)",   icon: <BadgeCheck size={14} /> },
              { label: "History",    val: "1 Previous Owner", icon: <History size={14} /> },
              { label: "Condition",  val: product.condition,  icon: <Sparkles size={14} /> },
            ].map((spec, i) => (
              <div key={i} className="p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 shadow-sm flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                  {spec.icon} {spec.label}
                </div>
                <p className="text-sm font-black text-dark-900 dark:text-cream-50">{spec.val}</p>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "shipping" && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="p-8 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-sm"
          >
            <div className="max-w-2xl space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-500 shrink-0">
                  <Truck size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark-900 dark:text-cream-50">Insured Luxury Shipping</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1">
                    Every order is handled via our premium logistics network. Karachi/Lahore/Islamabad: 2-3 working days. 
                    Other cities: 4-5 working days. Fully tracked and insured until it reaches your doorstep.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 shrink-0">
                  <Lock size={24} />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-dark-900 dark:text-cream-50">Escrow Guarantee</h4>
                  <p className="text-sm text-gray-500 leading-relaxed mt-1">
                    Payment is only released to the seller after you confirm delivery. Our 7-day 'Secure Dispute' protocol 
                    protects you against items not as described.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Sub-components used inside
function BadgeCheck({ size }: { size: number }) { return <Shield size={size} className="text-emerald-500" />; }
function Sparkles({ size }: { size: number }) { return <Zap size={size} className="text-gold-400" />; }
