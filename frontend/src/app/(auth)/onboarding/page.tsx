"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Shirt, Watch, MapPin, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  
  const [preferences, setPreferences] = useState({
    interests: [] as string[],
    size: [] as string[],
    city: ""
  });

  const toggleInterest = (interest: string) => {
    setPreferences(prev => ({
      ...prev,
      interests: prev.interests.includes(interest) 
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const toggleSize = (size: string) => {
    setPreferences(prev => ({
      ...prev,
      size: prev.size.includes(size)
        ? prev.size.filter(s => s !== size)
        : [...prev.size, size]
    }));
  };

  const handleComplete = async () => {
    setIsLoading(true);
    try {
      await api.patch("/users/profile", {
        ...preferences,
        onboardingCompleted: true
      });
      toast.success("Profile personalized successfully!");
      if (user?.role === "SELLER") {
        router.push("/seller/dashboard");
      } else {
        router.push("/customer/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-dark-900 flex items-center justify-center p-4">
      <div className="w-full max-w-xl">
        {/* Progress Bar */}
        <div className="mb-8 flex justify-center gap-2">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-2 w-16 rounded-full transition-all ${s <= step ? 'bg-gold-400' : 'bg-gold-400/20'}`} 
            />
          ))}
        </div>

        <motion.div 
          className="bg-white dark:bg-dark-800 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden relative min-h-[400px]"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 space-y-8 absolute inset-0"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-display font-bold">Kya dhundh rahe ho?</h1>
                  <p className="text-gray-500 text-sm">Select your interests to personalize your feed.</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => toggleInterest("Clothes")}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative ${preferences.interests.includes("Clothes") ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
                  >
                    {preferences.interests.includes("Clothes") && <div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>}
                    <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-dark-900 flex items-center justify-center text-gold-400">
                      <Shirt className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Clothes</span>
                  </button>

                  <button 
                    onClick={() => toggleInterest("Accessories")}
                    className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative ${preferences.interests.includes("Accessories") ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
                  >
                    {preferences.interests.includes("Accessories") && <div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1"><CheckCircle2 className="w-4 h-4" /></div>}
                    <div className="w-12 h-12 rounded-2xl bg-cream-100 dark:bg-dark-900 flex items-center justify-center text-gold-400">
                      <Watch className="w-6 h-6" />
                    </div>
                    <span className="font-bold">Accessories</span>
                  </button>
                </div>

                <button 
                  onClick={() => setStep(2)}
                  disabled={preferences.interests.length === 0}
                  className="w-full bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 absolute bottom-8 left-0 right-0 mx-8 md:mx-12 w-auto"
                >
                  Continue <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 space-y-8 absolute inset-0"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-display font-bold">Apna size batao</h1>
                  <p className="text-gray-500 text-sm">Select sizes to find items that fit perfectly.</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button 
                      key={size}
                      onClick={() => toggleSize(size)}
                      className={`py-4 rounded-2xl border-2 font-bold transition-all ${preferences.size.includes(size) ? "border-gold-400 bg-gold-400 text-white shadow-gold" : "border-gold-400/20 text-gray-500 hover:border-gold-400/50"}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                  <button 
                    onClick={() => setStep(1)}
                    className="p-4 rounded-full border border-gold-400/20 text-gray-500 hover:text-gold-400 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => setStep(3)}
                    disabled={preferences.size.length === 0}
                    className="flex-1 bg-gold-400 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    Continue <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-8 md:p-12 space-y-8 absolute inset-0"
              >
                <div className="text-center space-y-2">
                  <h1 className="text-3xl font-display font-bold">Location?</h1>
                  <p className="text-gray-500 text-sm">We'll show you local sellers first for faster delivery.</p>
                </div>

                <div className="space-y-4 pt-4">
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <select 
                      value={preferences.city}
                      onChange={(e) => setPreferences({ ...preferences, city: e.target.value })}
                      className="w-full bg-cream-50 dark:bg-dark-900 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-4 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm font-medium appearance-none"
                    >
                      <option value="" disabled>Select your city</option>
                      <option value="Karachi">Karachi</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                      <option value="Rawalpindi">Rawalpindi</option>
                      <option value="Faisalabad">Faisalabad</option>
                      <option value="Multan">Multan</option>
                      <option value="Peshawar">Peshawar</option>
                      <option value="Quetta">Quetta</option>
                    </select>
                  </div>
                </div>

                <div className="absolute bottom-8 left-8 right-8 flex gap-4">
                  <button 
                    onClick={() => setStep(2)}
                    className="p-4 rounded-full border border-gold-400/20 text-gray-500 hover:text-gold-400 transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={handleComplete}
                    disabled={!preferences.city || isLoading}
                    className="flex-1 bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Start Exploring"}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
