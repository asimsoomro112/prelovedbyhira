"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Tag, Plus, Trash2, Calendar, Percent, Loader2, Sparkles } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const promoSchema = z.object({
  code: z.string().min(3).max(15).regex(/^[A-Z0-9]+$/, "Use uppercase letters and numbers only"),
  discountPercentage: z.number().min(5).max(90),
  maxUses: z.number().min(1),
  expiresAt: z.string()
});

type PromoFormValues = z.infer<typeof promoSchema>;

export default function PromotionsPage() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);

  const { data: promotions, isLoading } = useQuery({
    queryKey: ["my-promotions"],
    queryFn: async () => {
      const { data } = await api.get("/promotions/my");
      return data;
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<PromoFormValues>({
    resolver: zodResolver(promoSchema)
  });

  const createMutation = useMutation({
    mutationFn: async (values: PromoFormValues) => {
      await api.post("/promotions/create", values);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-promotions"] });
      toast.success("Discount code created successfully!");
      setIsCreating(false);
      reset();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to create code");
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/promotions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-promotions"] });
      toast.success("Code deleted successfully");
    }
  });

  return (
    <div className="max-w-screen-xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-display font-bold flex items-center gap-3">
            <Tag className="w-8 h-8 text-gold-400" /> Marketing & Promotions
          </h1>
          <p className="text-gray-500 text-sm mt-1">Create discount codes to boost your sales.</p>
        </div>
        <button 
          onClick={() => setIsCreating(!isCreating)}
          className="px-6 py-3 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all flex items-center gap-2 w-max"
        >
          {isCreating ? "Cancel" : <><Plus className="w-4 h-4" /> New Code</>}
        </button>
      </div>

      {isCreating && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="bg-white dark:bg-dark-900 rounded-[32px] p-8 shadow-card border border-gold-400/20"
        >
          <form onSubmit={handleSubmit((values) => createMutation.mutate(values))} className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Promo Code</label>
              <input 
                {...register("code")} 
                placeholder="e.g. SUMMER20" 
                className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl p-4 outline-none focus:border-gold-400 transition-all font-bold uppercase" 
              />
              {errors.code && <p className="text-[10px] text-red-500 ml-1">{errors.code.message}</p>}
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Discount %</label>
              <div className="relative">
                <Percent className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input 
                  type="number" 
                  {...register("discountPercentage", { valueAsNumber: true })} 
                  className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl pl-12 pr-4 py-4 outline-none focus:border-gold-400 transition-all font-bold" 
                />
              </div>
              {errors.discountPercentage && <p className="text-[10px] text-red-500 ml-1">{errors.discountPercentage.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Max Uses</label>
              <input 
                type="number" 
                {...register("maxUses", { valueAsNumber: true })} 
                placeholder="e.g. 50"
                className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl p-4 outline-none focus:border-gold-400 transition-all font-bold" 
              />
              {errors.maxUses && <p className="text-[10px] text-red-500 ml-1">{errors.maxUses.message}</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1">Expiry Date</label>
              <input 
                type="date" 
                {...register("expiresAt")} 
                className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl p-4 outline-none focus:border-gold-400 transition-all font-bold" 
              />
              {errors.expiresAt && <p className="text-[10px] text-red-500 ml-1">{errors.expiresAt.message}</p>}
            </div>

            <div className="md:col-span-2 lg:col-span-4 mt-2">
               <button 
                 type="submit" 
                 disabled={createMutation.isPending}
                 className="w-full py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-95 transition-all disabled:opacity-50"
               >
                 {createMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                 Generate Discount Code
               </button>
            </div>
          </form>
        </motion.div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
           <div className="col-span-full flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-gold-400" /></div>
        ) : promotions?.length === 0 ? (
          <div className="col-span-full text-center py-32 bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10">
            <Tag className="w-16 h-16 text-gold-400/20 mx-auto mb-6" />
            <h2 className="text-2xl font-display font-bold mb-2">No Active Promotions</h2>
            <p className="text-gray-500">Create a discount code to attract more buyers.</p>
          </div>
        ) : (
          promotions?.map((promo: any) => (
            <motion.div 
              key={promo.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-900 p-8 rounded-[32px] border border-gold-400/10 shadow-soft relative group"
            >
              <button 
                onClick={() => deleteMutation.mutate(promo.id)}
                className="absolute top-4 right-4 p-2 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              
              <div className="mb-6">
                <span className="px-4 py-2 bg-emerald-500/10 text-emerald-500 rounded-lg text-sm font-bold uppercase tracking-widest border border-emerald-500/20 inline-block">
                  {promo.code}
                </span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-end">
                  <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Discount</p>
                  <p className="text-3xl font-display font-bold text-gold-400">{promo.discountPercentage}% OFF</p>
                </div>
                
                <div className="h-px w-full bg-gold-400/10" />
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" /> Uses</span>
                  <span className="font-bold">{promo.uses} / {promo.maxUses}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" /> Expires</span>
                  <span className={`font-bold ${new Date(promo.expiresAt) < new Date() ? 'text-red-500' : ''}`}>
                    {new Date(promo.expiresAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
