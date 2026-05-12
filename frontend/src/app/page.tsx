"use client";
import Link from 'next/link';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  RefreshCw, 
  Sparkles, 
  TrendingUp, 
  Star,
  ShoppingBag,
  Zap,
  CheckCircle2,
  Gem,
  LayoutDashboard,
  Coins,
  MessageSquareOff,
  UserCheck,
  PackageCheck,
  Cpu,
  Plus,
  Leaf,
  Globe,
  Award,
  ZapIcon
} from 'lucide-react';
import { motion, useScroll, useSpring } from "framer-motion";

const categories = [
  { name: "Shadi & Formal Suits", slug: 'SHADI-WEAR', icon: <Gem className="w-8 h-8" />, count: 320 },
  { name: "Luxury Bridal", slug: 'BRIDAL', icon: <Sparkles className="w-8 h-8" />, count: 45 },
  { name: "Kurtas & Shirts", slug: 'KURTAS', icon: <TrendingUp className="w-8 h-8" />, count: 540 },
  { name: "Designer Shoes", slug: 'SHOES', icon: <Zap className="w-8 h-8" />, count: 210 },
  { name: "Premium Watches", slug: 'WATCHES', icon: <Star className="w-8 h-8" />, count: 125 },
  { name: "Bags & Accessories", slug: 'BAGS', icon: <ShoppingBag className="w-8 h-8" />, count: 430 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen selection:bg-gold-400 selection:text-white">
      {/* 🚀 2026 HERO SECTION */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated Background Mesh */}
        <div className="absolute inset-0 bg-mesh opacity-50" />
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-gold-400/20 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-32 grid lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-2.5 glass-ultra crystal-border rounded-full shadow-gold-3d">
              <Cpu className="w-4 h-4 text-gold-400 animate-pulse" />
              <span className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">Next-Gen Preloved Ecosystem</span>
            </div>

            <h1 className="text-6xl sm:text-8xl font-display font-bold leading-[1] text-dark-900 dark:text-cream-50 tracking-tighter">
              The Future of <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-gold-300 to-gold-600 italic">Fashion Trade.</span>
            </h1>

            <p className="text-xl text-dark-700/80 dark:text-cream-50/70 max-w-xl leading-relaxed font-medium">
              A high-tech marketplace for Pakistan's elite fashion circle. Verified luxury, automated selling, and 2026-grade security.
            </p>

            <div className="flex flex-wrap gap-6">
              <Link href="/products" className="px-12 py-6 bg-gradient-to-br from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3 group">
                Shop Collection <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
              </Link>
              <Link href="/seller/dashboard" className="px-12 py-6 glass-ultra crystal-border text-dark-900 dark:text-cream-50 rounded-2xl font-bold hover:bg-gold-400/5 transition-all">
                List Your Item
              </Link>
            </div>

            <div className="pt-12 grid grid-cols-3 gap-8 border-t border-gold-400/10">
               <StatItem label="Active Members" value="25k+" />
               <StatItem label="Authentic Items" value="18k+" />
               <StatItem label="Success Rate" value="99.2%" />
            </div>
          </motion.div>

          {/* 3D Visual Concept */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, rotateY: 20 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="relative hidden lg:block perspective-1000"
          >
            <div className="relative z-10 w-full aspect-[4/5] glass-ultra crystal-border rounded-[80px] p-4 shadow-gold-3d preserve-3d">
               <div className="relative w-full h-full rounded-[60px] overflow-hidden group">
                  <img 
                    src="https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000" 
                    alt="Hero Visual" 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-dark-950 via-transparent to-transparent opacity-60" />
                  
                  {/* Floating Tech Labels */}
                  <div className="absolute bottom-10 left-10 right-10 flex flex-col gap-4">
                     <div className="glass-ultra crystal-border p-5 rounded-3xl backdrop-blur-3xl">
                        <div className="flex items-center gap-3 mb-2">
                           <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center">
                              <Star className="w-4 h-4 text-white fill-white" />
                           </div>
                           <p className="text-white font-bold text-sm">Verified Premium Item</p>
                        </div>
                        <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                           <motion.div 
                             animate={{ x: ["-100%", "100%"] }} 
                             transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                             className="w-1/3 h-full bg-gold-400" 
                           />
                        </div>
                     </div>
                  </div>
               </div>
            </div>
            {/* Background Glows */}
            <div className="absolute -top-20 -right-20 w-80 h-80 bg-gold-400/20 rounded-full blur-[100px] animate-glow" />
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-gold-400/10 rounded-full blur-[80px] animate-glow" style={{ animationDelay: '2s' }} />
          </motion.div>
        </div>
      </section>

      {/* 🏛️ VERIFIED AUTHORITY MARQUEE */}
      <section className="py-10 border-y border-gold-400/10 bg-white dark:bg-dark-950/50 overflow-hidden relative">
         <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-dark-950 to-transparent z-10" />
         <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-dark-950 to-transparent z-10" />
         <div className="flex items-center gap-16 animate-marquee whitespace-nowrap px-8">
            {['LOUIS VUITTON', 'GUCCI', 'CHANEL', 'PRADA', 'HERMÈS', 'DIOR', 'ZARA LUXE', 'SANA SAFINAZ', 'ELAN'].map((brand) => (
               <span key={brand} className="text-2xl font-display font-bold text-dark-900/10 dark:text-cream-50/10 italic tracking-widest">{brand}</span>
            ))}
            {/* Duplicate for infinite loop */}
            {['LOUIS VUITTON', 'GUCCI', 'CHANEL', 'PRADA', 'HERMÈS', 'DIOR', 'ZARA LUXE', 'SANA SAFINAZ', 'ELAN'].map((brand) => (
               <span key={brand} className="text-2xl font-display font-bold text-dark-900/10 dark:text-cream-50/10 italic tracking-widest">{brand}</span>
            ))}
         </div>
      </section>

      {/* 🌍 2026 SUSTAINABILITY IMPACT (DIGITAL PASSPORT) */}
      <section className="py-32 relative overflow-hidden bg-emerald-950/5 dark:bg-emerald-950/10 border-b border-gold-400/10">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
               <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
                  <div className="glass-ultra crystal-border rounded-[48px] p-8 space-y-6 relative z-10 shadow-emerald-500/10">
                     <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                              <Leaf className="w-5 h-5" />
                           </div>
                           <h4 className="font-bold dark:text-cream-50">Impact Passport</h4>
                        </div>
                        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-500 text-[10px] font-bold rounded-full">ID: #PRE-2026</span>
                     </div>
                     <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                           <span className="text-xs text-dark-500 dark:text-gray-400">Carbon Offset</span>
                           <span className="font-bold text-emerald-500">-12.4kg CO2</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                           <span className="text-xs text-dark-500 dark:text-gray-400">Water Saved</span>
                           <span className="font-bold text-blue-400">2,500 Liters</span>
                        </div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex justify-between items-center">
                           <span className="text-xs text-dark-500 dark:text-gray-400">Authenticity Score</span>
                           <span className="font-bold text-gold-400">99.8% A+</span>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="space-y-8">
                  <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
                     <Globe className="w-6 h-6" />
                  </div>
                  <h2 className="text-4xl lg:text-6xl font-display font-bold text-dark-900 dark:text-cream-50">
                     The Era of <br />
                     <span className="text-emerald-500 italic">Conscious Luxury.</span>
                  </h2>
                  <p className="text-lg text-dark-700/60 dark:text-cream-50/50 leading-relaxed">
                     In 2026, status isn't just about what you wear—it's about how you bought it. Every item on PrelovedByHira comes with a **Digital Impact Passport**, tracking the carbon you've saved by choosing preloved.
                  </p>
                  <div className="flex gap-4 pt-4">
                     <div className="glass-ultra crystal-border px-6 py-4 rounded-2xl flex items-center gap-3">
                        <Award className="w-5 h-5 text-gold-400" />
                        <span className="text-xs font-bold dark:text-cream-50">Verified Ethical</span>
                     </div>
                     <div className="glass-ultra crystal-border px-6 py-4 rounded-2xl flex items-center gap-3">
                        <ZapIcon className="w-5 h-5 text-emerald-500" />
                        <span className="text-xs font-bold dark:text-cream-50">Zero-Waste Trade</span>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 💰 SELLER PITCH: "NO HAGGLING / AUTOMATIC SELLING" */}
      <section className="py-32 relative overflow-hidden">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="glass-ultra crystal-border rounded-[64px] p-12 lg:p-24 shadow-gold-3d relative overflow-hidden">
               <div className="absolute top-0 right-0 w-1/3 h-full bg-gold-400/5 blur-[120px]" />
               
               <div className="grid lg:grid-cols-2 gap-20 items-center">
                  <div className="space-y-8">
                     <div className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-gold-400 text-white font-bold text-[10px] uppercase tracking-widest shadow-gold">
                        For Sellers
                     </div>
                     <h2 className="text-4xl lg:text-6xl font-display font-bold text-dark-900 dark:text-cream-50 leading-[1.1]">
                        List once. <br />
                        <span className="text-gold-400 italic">Sell Automatically.</span>
                     </h2>
                     <p className="text-lg text-dark-700/70 dark:text-cream-50/60 leading-relaxed">
                        Stop wasting time with endless bargaining on WhatsApp. List your item, set your price, and our system handles the rest. No bhes, no hassles.
                     </p>
                     
                     <div className="space-y-6">
                        <FeaturePoint icon={<MessageSquareOff />} title="Zero Bargaining" desc="Buyers pay the listed price or they don't. No more low-balling." />
                        <FeaturePoint icon={<LayoutDashboard />} title="Automated Management" desc="Track sales, orders, and payouts from your high-tech dashboard." />
                        <FeaturePoint icon={<Coins />} title="Direct Payouts" desc="Receive funds directly to your wallet after delivery is confirmed." />
                     </div>

                     <Link href="/seller/dashboard" className="inline-flex h-16 px-10 items-center bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all">
                        Start Selling Now
                     </Link>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                     <div className="space-y-6 mt-12">
                        <TechCard icon={<TrendingUp />} label="Market Demand" value="High" color="bg-emerald-500/10 text-emerald-500" />
                        <TechCard icon={<Star />} label="Seller Rating" value="4.9" color="bg-gold-400/10 text-gold-400" />
                     </div>
                     <div className="space-y-6">
                        <TechCard icon={<ShoppingBag />} label="Total Sales" value="84" color="bg-blue-500/10 text-blue-500" />
                        <TechCard icon={<CheckCircle2 />} label="Verified" value="Identity" color="bg-purple-500/10 text-purple-500" />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 💎 BENTO DISCOVERY */}
      <section className="py-32 bg-mesh/10">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="space-y-4">
                 <h2 className="text-5xl lg:text-6xl font-display font-bold text-dark-900 dark:text-cream-50">Discovery <span className="italic text-gold-400">Hub.</span></h2>
                 <p className="text-dark-700/60 dark:text-cream-50/50 max-w-md">Every category is a curated portal to premium preloved luxury.</p>
              </div>
              <Link href="/products" className="group flex items-center gap-3 text-gold-400 font-bold hover:gap-5 transition-all">
                 Explore All Categories <ArrowRight className="w-5 h-5" />
              </Link>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
             {categories.map((cat, i) => (
               <Link 
                 key={cat.slug} 
                 href={`/products?category=${cat.slug}`}
                 className="group relative h-56 glass-ultra crystal-border rounded-[40px] p-8 hover:bg-gold-400/5 transition-all overflow-hidden text-center flex flex-col items-center justify-center gap-4"
               >
                 <div className="text-gold-400 group-hover:scale-125 group-hover:-rotate-12 transition-transform duration-500">
                   {cat.icon}
                 </div>
                 <h3 className="font-bold text-sm text-dark-900 dark:text-cream-50 leading-tight">{cat.name}</h3>
                 <p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">{cat.count}+ Items</p>
                 <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-gold-400/5 rounded-full group-hover:scale-150 transition-transform duration-700" />
               </Link>
             ))}
           </div>
        </div>
      </section>

      {/* 🛠️ HOW IT WORKS (THE ROADMAP) */}
      <section className="py-32 border-y border-gold-400/10 bg-white dark:bg-dark-950 relative overflow-hidden transition-colors duration-500">
         <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
         <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center space-y-20 relative z-10">
            <div className="space-y-4">
               <h2 className="text-5xl font-display font-bold text-dark-900 dark:text-white">How It <span className="italic text-gold-400">Works.</span></h2>
               <p className="text-dark-700/60 dark:text-cream-50/40 max-w-xl mx-auto">Zero Hassle. Maximum Trust. We've automated the hard parts so you can enjoy the fashion.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12">
               <StepItem 
                 step="01" 
                 title="List Your Item" 
                 desc="Snap some clear photos, note the original price, and set your selling price. It only takes 2 minutes."
                 icon={<Plus />}
               />
               <StepItem 
                 step="02" 
                 title="Safe Escrow Wait" 
                 desc="When a buyer pays, the funds enter our highly secure Escrow vault. Your money is completely guaranteed."
                 icon={<ShieldCheck />}
               />
               <StepItem 
                 step="03" 
                 title="Ship & Earn 80%" 
                 desc="Ship the item. Once approved, 80% of the sale price instantly lands in your wallet. We handle the rest."
                 icon={<Coins />}
               />
            </div>
         </div>
      </section>

      {/* 🎭 THE DUALITY: BUYERS vs SELLERS */}
      <section className="py-32 relative">
         <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-8">
               {/* BUYERS SIDE */}
               <div className="glass-ultra crystal-border rounded-[48px] p-12 space-y-10 group hover:shadow-gold-3d transition-all">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                        <ShoppingBag className="w-8 h-8" />
                     </div>
                     <h3 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50">For <span className="italic">Buyers</span></h3>
                  </div>
                  
                  <div className="space-y-8">
                     <BenefitItem 
                        title="100% Escrow Protection" 
                        desc="Your money is held safely in our vault. The seller only gets paid after you receive and confirm the item." 
                     />
                     <BenefitItem 
                        title="Premium Quality Assurance" 
                        desc="We strictly enforce condition grading. What you see is exactly what you get, or your money back." 
                     />
                     <BenefitItem 
                        title="Seamless Secure Checkout" 
                        desc="Pay with your preferred methods instantly. No more shady bank transfers or sharing personal details." 
                     />
                  </div>
               </div>

               {/* SELLERS SIDE */}
               <div className="glass-ultra crystal-border rounded-[48px] p-12 space-y-10 group hover:shadow-gold-3d transition-all border-gold-400/20">
                  <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-2xl bg-gold-400/10 flex items-center justify-center text-gold-400">
                        <Coins className="w-8 h-8" />
                     </div>
                     <h3 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50">For <span className="italic text-gold-400">Sellers</span></h3>
                  </div>

                  <div className="space-y-8">
                     <BenefitItem 
                        title="Zero Haggling. Period." 
                        desc="Tired of lowballers? Set your price and we handle the sale. No direct messaging or endless price negotiations." 
                     />
                     <BenefitItem 
                        title="Automated Dashboard & Orders" 
                        desc="Manage inventory, track shipments, and view earnings all from a specialized seller dashboard." 
                     />
                     <BenefitItem 
                        title="Guaranteed Payouts" 
                        desc="If you ship an accurate item, your money is guaranteed. We instantly release 80% to you via your preferred method." 
                     />
                  </div>
               </div>
            </div>
         </div>
      </section>

      {/* 🏁 FINAL CALL TO ACTION */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
           <div className="relative rounded-[80px] bg-dark-950 p-16 lg:p-32 overflow-hidden text-center group crystal-border">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80')] bg-cover bg-center opacity-30 group-hover:scale-110 transition-transform duration-[4s]" />
              <div className="absolute inset-0 bg-gradient-to-b from-dark-950/20 to-dark-950" />
              
              <div className="relative z-10 space-y-12 max-w-3xl mx-auto">
                 <div className="w-20 h-20 bg-gold-400 rounded-[32px] mx-auto flex items-center justify-center shadow-gold rotate-12 group-hover:rotate-0 transition-transform duration-700">
                    <Sparkles className="w-10 h-10 text-white" />
                 </div>
                 <h2 className="text-5xl lg:text-8xl font-display font-bold text-white leading-[1] tracking-tighter">
                   Elevate Your <br />
                   <span className="italic text-gold-400">Wardrobe.</span>
                 </h2>
                 <p className="text-cream-50/60 text-xl leading-relaxed">Join the revolution of sustainable luxury. Whether buying or selling, we've got the tech to keep it premium.</p>
                 <div className="flex flex-wrap justify-center gap-6 pt-6">
                    <Link href="/register" className="px-14 py-6 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 active:scale-95 transition-all text-lg">
                       Get Started Free
                    </Link>
                    <Link href="/products" className="px-14 py-6 glass-ultra crystal-border text-white rounded-2xl font-bold hover:bg-white/5 transition-all text-lg">
                       Explore Market
                    </Link>
                 </div>
              </div>
           </div>
        </div>
      </section>
    </div>
  );
}

function StatItem({ label, value }: any) {
  return (
    <div className="space-y-2">
      <p className="text-4xl font-display font-bold text-gold-400 leading-none">{value}</p>
      <p className="text-[10px] font-bold text-dark-500 dark:text-cream-50/40 uppercase tracking-widest">{label}</p>
    </div>
  );
}

function TrustBadge({ icon, label }: any) {
  return (
    <div className="flex items-center gap-3 text-dark-900 dark:text-cream-50">
       <span className="w-6 h-6 text-gold-400">{icon}</span>
       <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function FeaturePoint({ icon, title, desc }: any) {
  return (
    <div className="flex gap-5">
       <div className="w-12 h-12 rounded-2xl glass-ultra crystal-border flex items-center justify-center text-gold-400 shrink-0">
          {icon}
       </div>
       <div className="space-y-1">
          <h4 className="font-bold text-dark-900 dark:text-cream-50">{title}</h4>
          <p className="text-sm text-dark-700/60 dark:text-cream-50/40 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function TechCard({ icon, label, value, color }: any) {
  return (
    <div className="glass-ultra crystal-border p-8 rounded-[40px] space-y-4 hover:scale-105 transition-all group">
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</p>
          <p className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">{value}</p>
       </div>
    </div>
  );
}

function StepItem({ step, title, desc, icon }: any) {
  return (
    <div className="space-y-10 group text-center md:text-left">
       <div className="relative inline-block">
          <div className="w-24 h-24 glass-ultra crystal-border rounded-[32px] flex items-center justify-center text-gold-400 shadow-gold-3d group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
             <div className="w-10 h-10">{icon}</div>
          </div>
          <div className="absolute -top-4 -right-4 w-12 h-12 glass-ultra crystal-border rounded-2xl flex items-center justify-center text-xl font-display font-bold text-gold-400 shadow-lg">
             {step}
          </div>
       </div>
       <div className="space-y-4">
          <h3 className="text-2xl font-display font-bold text-dark-900 dark:text-cream-50">{title}</h3>
          <p className="text-sm text-dark-700/60 dark:text-cream-50/50 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}

function BenefitItem({ title, desc }: any) {
  return (
    <div className="flex gap-4 group">
       <div className="mt-1.5 w-2 h-2 rounded-full bg-gold-400 shrink-0 group-hover:scale-150 transition-transform" />
       <div className="space-y-2">
          <h4 className="text-lg font-bold text-dark-900 dark:text-cream-50 leading-tight">{title}</h4>
          <p className="text-sm text-dark-700/60 dark:text-cream-50/40 leading-relaxed">{desc}</p>
       </div>
    </div>
  );
}
