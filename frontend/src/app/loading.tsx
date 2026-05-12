"use client";

import { motion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[200] bg-mesh flex items-center justify-center">
      <div className="relative">
        {/* Outer Glow */}
        <div className="absolute inset-0 bg-gold-400/20 blur-[60px] animate-pulse" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative glass-ultra crystal-border rounded-[40px] p-12 flex flex-col items-center gap-6 shadow-gold-3d"
        >
          <div className="relative w-20 h-20">
             <div className="absolute inset-0 border-4 border-gold-400/20 rounded-full" />
             <motion.div 
               animate={{ rotate: 360 }}
               transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
               className="absolute inset-0 border-4 border-t-gold-400 rounded-full"
             />
             <div className="absolute inset-0 flex items-center justify-center">
                <ShoppingBag className="w-8 h-8 text-gold-400 animate-bounce" />
             </div>
          </div>
          
          <div className="flex flex-col items-center">
             <h2 className="text-2xl font-display font-bold text-gold-400 tracking-tight">
               Preloved<span className="italic">ByHira</span>
             </h2>
             <div className="flex gap-1.5 mt-2">
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{ 
                      duration: 1, 
                      repeat: Infinity, 
                      delay: i * 0.2 
                    }}
                    className="w-1.5 h-1.5 bg-gold-400 rounded-full"
                  />
                ))}
             </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
