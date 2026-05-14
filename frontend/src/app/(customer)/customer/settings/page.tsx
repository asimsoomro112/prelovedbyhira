"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Phone, MapPin, Save, ArrowLeft, Loader2, Home } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const router = useRouter();
  const { user, setUser } = useAuthStore();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await api.get("/users/profile");
        setValue("name", data.user.name || "");
        setValue("phone", data.user.phone || "");
        setValue("city", data.user.city || "");
        setValue("address", data.user.address || "");
      } catch (error) {
        toast.error("Failed to load profile details.");
      } finally {
        setIsFetching(false);
      }
    };
    
    fetchProfile();
  }, [setValue]);

  const onSubmit = async (values: ProfileFormValues) => {
    setIsLoading(true);
    try {
      const { data } = await api.put("/users/profile", values);

      // Update the auth store so navbar and other places reflect the new name
      if (user) {
        setUser({ ...user, name: data.user.name, phone: data.user.phone, city: data.user.city });
      }

      toast.success("Profile updated successfully!");
      router.push("/customer/profile");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to update profile.");
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <Link href="/customer/profile" className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gold-400 mb-8 transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden"
      >
        <div className="p-8 lg:p-12 space-y-8">
          <div className="space-y-2">
            <h1 className="text-3xl font-display font-bold">Account Settings</h1>
            <p className="text-gray-500 text-sm">Update your personal details and shipping address.</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            <div className="space-y-6 bg-cream-50 dark:bg-dark-800/50 p-6 rounded-3xl border border-gold-400/5">
              <h2 className="font-bold text-lg flex items-center gap-2 border-b border-gold-400/10 pb-3">
                <User className="w-5 h-5 text-gold-400" /> Personal Details
              </h2>
              
              <div className="grid md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Full Name</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                      <User className="w-5 h-5" />
                    </div>
                    <input {...register("name")} className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
                  </div>
                  {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Phone Number</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input {...register("phone")} placeholder="e.g. 03XXXXXXXXX" className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500 ml-1">{errors.phone.message}</p>}
                </div>
              </div>
            </div>

            <div className="space-y-6 bg-cream-50 dark:bg-dark-800/50 p-6 rounded-3xl border border-gold-400/5">
              <h2 className="font-bold text-lg flex items-center gap-2 border-b border-gold-400/10 pb-3">
                <MapPin className="w-5 h-5 text-gold-400" /> Shipping Information
              </h2>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">City</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <input {...register("city")} placeholder="e.g. Lahore, Karachi, Islamabad" className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Full Address</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-3 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                      <Home className="w-5 h-5" />
                    </div>
                    <textarea {...register("address")} rows={3} placeholder="House, Street, Area..." className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm resize-none" />
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {isLoading ? "Saving Details..." : "Save Settings"} 
            </button>
          </form>

        </div>
      </motion.div>
    </div>
  );
}
