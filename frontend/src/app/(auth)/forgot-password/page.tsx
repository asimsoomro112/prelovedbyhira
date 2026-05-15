"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, ShieldCheck, Lock, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/lib/api";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendOTP = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/forgot-password", { email });
      toast.success("OTP sent to your email!");
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to send OTP.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = async () => {
    setIsLoading(true);
    try {
      await api.post("/auth/reset-password", { email, otp, newPassword });
      toast.success("Password reset successful! Please login.");
      setStep(4);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Reset failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-dark-900 rounded-[32px] shadow-card border border-gold-400/10 p-8 space-y-8"
      >
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-display font-bold">
            {step === 1 && "Forgot Password"}
            {step === 2 && "Verify OTP"}
            {step === 3 && "New Password"}
            {step === 4 && "Success!"}
          </h1>
          <p className="text-gray-500 text-sm">
            {step === 1 && "Enter your email to receive a reset code"}
            {step === 2 && `We've sent a 6-digit code to ${email}`}
            {step === 3 && "Create a secure new password for your account"}
            {step === 4 && "Your password has been updated successfully"}
          </p>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@revault.pk" 
                    className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" 
                  />
                </div>
              </div>
              <button 
                onClick={handleSendOTP}
                disabled={isLoading || !email}
                className="w-full bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold disabled:opacity-50"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="flex justify-center gap-2">
                {[...Array(6)].map((_, i) => (
                  <input 
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    className="w-12 h-14 bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/20 rounded-xl text-center font-bold text-lg focus:border-gold-400 outline-none transition-all"
                    onKeyUp={(e) => {
                      if (e.key === 'Backspace' && i > 0 && !(e.target as HTMLInputElement).value) {
                        (document.getElementById(`otp-${i-1}`) as HTMLInputElement)?.focus();
                      }
                    }}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val) {
                        if (i < 5) (document.getElementById(`otp-${i+1}`) as HTMLInputElement)?.focus();
                      }
                      
                      // Reconstruct full OTP
                      const otpArray = [];
                      for(let j=0; j<6; j++) {
                        otpArray.push((document.getElementById(`otp-${j}`) as HTMLInputElement)?.value || "");
                      }
                      setOtp(otpArray.join(""));
                    }}
                  />
                ))}
              </div>
              <button 
                onClick={() => otp.length === 6 && setStep(3)}
                disabled={otp.length !== 6}
                className="w-full bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold disabled:opacity-50"
              >
                Verify Code
              </button>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700 dark:text-gray-300 ml-1">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input 
                    type="password" 
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••" 
                    className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3.5 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm" 
                  />
                </div>
              </div>
              <button 
                onClick={handleReset}
                disabled={isLoading || newPassword.length < 6}
                className="w-full bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold disabled:opacity-50"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck className="w-10 h-10" />
              </div>
              <Link href="/login" className="block w-full bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold">
                Back to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>

        {step < 4 && (
          <Link href="/login" className="flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gold-400 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Login
          </Link>
        )}
      </motion.div>
    </div>
  );
}
