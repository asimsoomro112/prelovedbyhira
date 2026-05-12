"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsLoading(true);
    try {
      // 1. Firebase Auth Sign In
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const token = await userCredential.user.getIdToken();

      // 2. Sync with Backend Vault
      const { data } = await api.post("/auth/sync", {
        uid: userCredential.user.uid,
        email: values.email,
        name: userCredential.user.displayName || "Marketplace Member",
        role: "CUSTOMER", // Default or fetch from backend
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // 3. Update Global State
      setAuth(data.user, token);
      toast.success(`Welcome back to the Vault! ✨`);
      
      // Role-based redirection
      if (data.user.role === 'ADMIN') {
        router.push("/admin/dashboard");
      } else if (data.user.role === 'SELLER') {
        router.push("/seller/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-dark-900 rounded-[32px] shadow-card border border-gold-400/10 overflow-hidden"
      >
        <div className="p-8 space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-display font-bold">Vault Access</h1>
            <p className="text-gray-500 text-sm">Pakistan&apos;s most secure preloved marketplace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                  <Mail className="w-5 h-5" />
                </div>
                <input 
                  {...register("email")}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
                />
              </div>
              {errors.email && <p className="text-xs text-red-500 ml-1">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between ml-1">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300">Password</label>
                <Link href="/forgot-password" className="text-xs text-gold-400 font-bold hover:underline font-display">Recover Access</Link>
              </div>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
                  <Lock className="w-5 h-5" />
                </div>
                <input 
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-12 py-3.5 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 ml-1">{errors.password.message}</p>}
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100"
            >
              {isLoading ? "Synchronizing..." : "Enter the Vault"} 
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500">
            New to the platform?{" "}
            <Link href="/register" className="text-gold-400 font-bold hover:underline font-display">Request Membership</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
