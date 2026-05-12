"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { User, Mail, Phone, Lock, ArrowRight, ShoppingBag, UserCircle, Check, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(11, "Phone must be at least 11 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  role: z.enum(["CUSTOMER", "SELLER"]),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: "CUSTOMER" }
  });

  const selectedRole = watch("role");

  const onSubmit = async (values: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // 1. Firebase Auth Registration
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      
      // Update Firebase Profile
      await updateProfile(userCredential.user, {
        displayName: values.name
      });

      const token = await userCredential.user.getIdToken();

      // 2. Sync with Backend Vault
      await api.post("/auth/sync", {
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: values.role
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      toast.success("Welcome to the Preloved Vault! ✨");
      router.push("/login");
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen py-20 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-xl bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden"
      >
        <div className="p-8 lg:p-12 space-y-10">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold">Request Membership</h1>
            <p className="text-gray-500 text-sm">Join Pakistan&apos;s elite community of luxury fashion enthusiasts</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <button 
                type="button"
                onClick={() => setValue("role", "CUSTOMER")}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "CUSTOMER" ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
              >
                {selectedRole === "CUSTOMER" && <div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1"><Check className="w-3 h-3" /></div>}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRole === "CUSTOMER" ? "bg-gold-400 text-white" : "bg-cream-100 dark:bg-dark-800 text-gray-400"}`}>
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`font-bold text-sm ${selectedRole === "CUSTOMER" ? "text-gold-400" : "text-gray-500"}`}>Customer</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Ready to Shop</p>
                </div>
              </button>

              <button 
                type="button"
                onClick={() => setValue("role", "SELLER")}
                className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "SELLER" ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
              >
                {selectedRole === "SELLER" && <div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1"><Check className="w-3 h-3" /></div>}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRole === "SELLER" ? "bg-gold-400 text-white" : "bg-cream-100 dark:bg-dark-800 text-gray-400"}`}>
                  <UserCircle className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`font-bold text-sm ${selectedRole === "SELLER" ? "text-gold-400" : "text-gray-500"}`}>Seller</p>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">Ready to Sell</p>
                </div>
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Full Name</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                    <User className="w-5 h-5" />
                  </div>
                  <input {...register("name")} placeholder="Hira Ahmed" className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 ml-1">{errors.name.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Phone</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                    <Phone className="w-5 h-5" />
                  </div>
                  <input {...register("phone")} placeholder="03XXXXXXXXX" className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500 ml-1">{errors.phone.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input {...register("email")} type="email" placeholder="hira@example.com" className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" />
              </div>
              {errors.email && <p className="text-[10px] text-red-500 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    {...register("password")} 
                    type={showPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-12 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-[10px] text-red-500 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">Confirm Password</label>
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input 
                    {...register("confirmPassword")} 
                    type={showConfirmPassword ? "text" : "password"} 
                    placeholder="••••••••" 
                    className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-12 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" 
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-[10px] text-red-500 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="flex items-center gap-3 ml-1">
              <input {...register("acceptTerms")} type="checkbox" className="w-4 h-4 rounded border-gold-400/30 text-gold-400 focus:ring-gold-400" />
              <span className="text-xs text-gray-500 font-medium">I agree to the <Link href="/terms" className="text-gold-400 hover:underline">Membership Terms</Link></span>
            </div>
            {errors.acceptTerms && <p className="text-[10px] text-red-500 ml-1">{errors.acceptTerms.message}</p>}

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? "Creating Identity..." : "Request Membership"} 
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            Already a member?{" "}
            <Link href="/login" className="text-gold-400 font-bold hover:underline font-display">Enter the Vault</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
