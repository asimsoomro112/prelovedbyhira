"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShieldCheck, Truck, MessageCircle, Star, Camera, Package } from "lucide-react";

export default function HomePage() {
  return (
    <div className="overflow-hidden">
      {/* SECTION A: HERO BANNER */}
      <section className="relative min-h-[85vh] flex items-center bg-dark-950 px-6 py-20 lg:py-0">
        {/* Animated Background Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div 
            animate={{ 
              y: [0, -30, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-gold-400 blur-[120px] rounded-full opacity-10"
          />
          <motion.div 
            animate={{ 
              y: [0, 40, 0],
              opacity: [0.05, 0.15, 0.05]
            }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-1/4 -right-20 w-[400px] h-[400px] bg-rose-500 blur-[100px] rounded-full opacity-5"
          />
        </div>

        <div className="max-w-screen-xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-pill bg-gold-400/10 border border-gold-400/20 backdrop-blur-md"
            >
              <span className="text-gold-400 text-xs font-bold uppercase tracking-widest">✨ Pakistan&apos;s #1 Marketplace</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-hero leading-tight text-white font-display"
            >
              Find Your Next <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-300 via-gold-500 to-gold-200">
                Favourite Look
              </span>
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-lg lg:text-xl text-gray-400 max-w-lg leading-relaxed"
            >
              Buy & Sell preloved fashion — Bags, Dresses, Shoes & More. Trusted by thousands across Pakistan.
            </motion.p>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/products" className="px-10 py-4 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all flex items-center gap-2 group">
                Shop Now <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/seller/add-product" className="px-10 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-pill font-bold hover:bg-white/20 transition-all">
                Sell Your Wardrobe
              </Link>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center gap-8 text-gray-500 text-sm font-medium pt-8"
            >
              <div className="flex items-center gap-2"><ShieldCheck className="text-gold-400 w-5 h-5" /> Secure Escrow</div>
              <div className="flex items-center gap-2"><Truck className="text-gold-400 w-5 h-5" /> Verified Sellers</div>
              <div className="flex items-center gap-2"><MessageCircle className="text-gold-400 w-5 h-5" /> 24/7 Support</div>
            </motion.div>
          </div>

          {/* Visual Cards */}
          <div className="hidden lg:flex justify-center relative h-[600px]">
             <motion.div 
               initial={{ rotate: -10, x: -50, opacity: 0 }}
               animate={{ rotate: -5, x: 0, opacity: 1 }}
               transition={{ delay: 0.4, type: "spring" }}
               className="absolute top-10 left-0 w-64 h-80 bg-rose-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden group"
             >
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                 <p className="text-white font-bold">Designer Dresses</p>
                 <p className="text-gold-400 text-xs uppercase">From Rs. 1500</p>
               </div>
             </motion.div>
             
             <motion.div 
               initial={{ y: 50, opacity: 0 }}
               animate={{ y: 0, opacity: 1 }}
               transition={{ delay: 0.6, type: "spring" }}
               className="absolute top-20 left-40 w-72 h-96 bg-gold-900 rounded-3xl shadow-glow border border-white/20 overflow-hidden z-10"
             >
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                 <p className="text-white text-xl font-bold font-display">Luxury Handbags</p>
                 <p className="text-gold-400 text-xs uppercase">Authenticity Guaranteed</p>
               </div>
             </motion.div>

             <motion.div 
               initial={{ rotate: 10, x: 50, opacity: 0 }}
               animate={{ rotate: 5, x: 0, opacity: 1 }}
               transition={{ delay: 0.5, type: "spring" }}
               className="absolute top-40 left-80 w-64 h-80 bg-purple-900 rounded-3xl shadow-2xl border border-white/10 overflow-hidden"
             >
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-6 flex flex-col justify-end">
                 <p className="text-white font-bold">Heels & Shoes</p>
                 <p className="text-gold-400 text-xs uppercase">Trusted Sellers</p>
               </div>
             </motion.div>
          </div>
        </div>
      </section>

      {/* SECTION B: BENTO CATEGORIES */}
      <section className="py-24 px-6 max-w-screen-xl mx-auto">
        <div className="flex items-end justify-between mb-12">
          <div className="space-y-4">
            <h2 className="text-4xl font-display text-dark-900 dark:text-cream-50">Shop by Category</h2>
            <p className="text-gray-500">Explore curated collections from top wardrobes</p>
          </div>
          <Link href="/products" className="text-gold-400 font-bold flex items-center gap-2 hover:underline">
            View All Categories <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard 
            title="Dresses" 
            emoji="👗" 
            count="240+" 
            color="bg-rose-900" 
            className="row-span-2 col-span-2 lg:col-span-2 h-[500px]" 
          />
          <CategoryCard 
            title="Bags" 
            emoji="👜" 
            count="120+" 
            color="bg-amber-900" 
            className="h-[240px]" 
          />
          <CategoryCard 
            title="Shoes" 
            emoji="👠" 
            count="85+" 
            color="bg-purple-900" 
            className="h-[240px]" 
          />
          <CategoryCard 
            title="Jewelry" 
            emoji="💍" 
            count="150+" 
            color="bg-gold-700" 
            className="col-span-2 h-[240px]" 
          />
        </div>
      </section>

      {/* SECTION C: HOW IT WORKS */}
      <section className="py-24 bg-cream-100 dark:bg-dark-900 px-6">
        <div className="max-w-screen-xl mx-auto text-center space-y-16">
          <div className="space-y-4">
            <h2 className="text-4xl font-display">How It Works</h2>
            <p className="text-gray-500">Buying and selling fashion has never been this easy</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Dashed Connector (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-px border-t-2 border-dashed border-gold-400/20 -translate-y-12 z-0" />
            
            <StepCard 
              num="01" 
              icon={<Camera className="w-8 h-8" />} 
              title="List Your Item" 
              desc="Upload photos, set your price — takes less than 2 mins." 
            />
            <StepCard 
              num="02" 
              icon={<ShieldCheck className="w-8 h-8" />} 
              title="Get Paid Safely" 
              desc="Payment held securely in escrow until buyer confirms delivery." 
            />
            <StepCard 
              num="03" 
              icon={<Package className="w-8 h-8" />} 
              title="Ship & Earn" 
              desc="We take only 20% commission — the best rate in Pakistan." 
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function CategoryCard({ title, emoji, count, color, className = "" }: any) {
  return (
    <motion.div 
      whileHover={{ y: -8, scale: 1.01 }}
      className={`${className} ${color} rounded-card p-8 flex flex-col justify-end relative overflow-hidden group cursor-pointer shadow-card`}
    >
      <div className="absolute top-8 left-8 text-6xl group-hover:scale-125 transition-transform duration-500">{emoji}</div>
      <div className="relative z-10 space-y-2">
        <h3 className="text-2xl font-bold text-white">{title}</h3>
        <p className="text-white/60 text-sm font-medium uppercase tracking-widest">{count} items</p>
      </div>
      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  );
}

function StepCard({ num, icon, title, desc }: any) {
  return (
    <motion.div 
      whileHover={{ y: -10 }}
      className="bg-white dark:bg-dark-800 p-10 rounded-modal shadow-soft relative z-10 space-y-6 border border-gold-400/5"
    >
      <span className="absolute top-6 right-8 text-6xl font-display text-gold-400/10 select-none">{num}</span>
      <div className="w-16 h-16 bg-gold-400/10 rounded-2xl flex items-center justify-center text-gold-400 mx-auto">
        {icon}
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-bold font-display">{title}</h3>
        <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
      </div>
    </motion.div>
  );
}

function ChevronRight(props: any) {
  return <ArrowRight {...props} />;
}
