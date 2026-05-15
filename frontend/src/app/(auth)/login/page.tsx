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
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

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
  const syncCart = useCartStore((state) => state.syncGuestCart);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();

      const { data } = await api.post("/auth/sync", {
        uid: result.user.uid,
        email: result.user.email,
        name: result.user.displayName || "Marketplace Member",
        role: "CUSTOMER", // Google users default to CUSTOMER
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setAuth(data.user, token);
      await syncCart(); // Sync guest items
      toast.success(`Access Granted! Welcome ${data.user.name} ✨`);
      
      // Role-based redirection for Google Login
      if (data.user.role === 'ADMIN') {
        router.push("/admin/dashboard");
      } else if (data.user.role === 'SELLER') {
        router.push("/seller/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch (error: any) {
      toast.error(error.message || "Google Sign-in failed.");
    } finally {
      setIsLoading(false);
    }
  };

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
      await syncCart(); // Sync guest items
      toast.success(`Welcome back! ✨`);
      
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
            <h1 className="text-3xl font-display font-bold">Login to Platform</h1>
            <p className="text-gray-500 text-sm">Pakistan&apos;s most secure preloved marketplace</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Existing Email Form */}
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
              {isLoading ? "Synchronizing..." : "Sign In"} 
              {!isLoading && <ArrowRight className="w-5 h-5" />}
            </button>
          </form>

          <div className="relative">
             <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gold-400/10"></div></div>
             <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest"><span className="bg-white dark:bg-dark-900 px-4 text-gray-400">Or Digital Identity</span></div>
          </div>

          <button 
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full bg-white dark:bg-dark-800 border-2 border-gold-400/20 hover:border-gold-400/50 py-4 rounded-pill font-bold transition-all flex items-center justify-center gap-3 group"
          >
            <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z"/>
            </svg>
            Sign in with Google
          </button>

          <p className="text-center text-sm text-gray-500">
            New to the platform?{" "}
            <Link href="/register" className="text-gold-400 font-bold hover:underline font-display">Join Now</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
