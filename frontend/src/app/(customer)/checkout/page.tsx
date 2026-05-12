"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Create orders for each item in the cart
      for (const item of items) {
        const { data } = await api.post("/orders/create", {
          productId: item.id,
          shippingAddress: "User's Verified Address (Testing)"
        });

        // 2. Simulate immediate payment success for local testing
        await api.post("/orders/payment/callback", {
          orderId: data.order.id,
          success: true
        });
      }

      clearCart();
      toast.success("Order Placed Successfully! ✨ Items are now in your vault.");
      router.push("/customer/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Checkout failed.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return <div className="h-screen flex items-center justify-center">Please login to checkout</div>;

  return (
    <div className="max-w-screen-xl mx-auto px-6 py-12 lg:py-24 min-h-screen">
      <div className="grid lg:grid-cols-3 gap-16">
        
        {/* LEFT - CHECKOUT FLOW */}
        <div className="lg:col-span-2 space-y-12">
          <div className="space-y-2">
             <h1 className="text-5xl font-display font-bold text-dark-900 dark:text-cream-50">Secure <span className="italic text-gold-400">Checkout.</span></h1>
             <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
                <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
             </div>
          </div>

          {/* PROGRESS STEPS */}
          <div className="flex items-center gap-6">
             <StepIndicator num={1} label="Shipping" active={step >= 1} />
             <ChevronRight className="w-4 h-4 text-gray-300" />
             <StepIndicator num={2} label="Payment" active={step >= 2} />
             <ChevronRight className="w-4 h-4 text-gray-300" />
             <StepIndicator num={3} label="Review" active={step >= 3} />
          </div>

          <div className="space-y-8">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <InputGroup label="Full Name" placeholder={user.name} />
                  <InputGroup label="Contact Number" placeholder="+92 XXX XXXXXXX" />
                  <div className="md:col-span-2">
                    <InputGroup label="Shipping Address" placeholder="Street, Area, City" isLarge />
                  </div>
                </div>
                <button 
                  onClick={() => setStep(2)}
                  className="px-12 h-16 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all flex items-center gap-3"
                >
                  Continue to Payment <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <PaymentCard icon={<CreditCard />} label="Card / Wallet" active />
                  <PaymentCard icon={<Truck />} label="Cash on Delivery" />
                </div>
                <div className="glass-ultra crystal-border rounded-3xl p-8 space-y-6">
                   <InputGroup label="Card Number" placeholder="XXXX XXXX XXXX XXXX" />
                   <div className="grid grid-cols-2 gap-6">
                      <InputGroup label="Expiry" placeholder="MM / YY" />
                      <InputGroup label="CVV" placeholder="XXX" />
                   </div>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="h-16 px-8 border-2 border-gold-400/20 text-gray-400 rounded-2xl font-bold">Back</button>
                  <button 
                    onClick={() => setStep(3)}
                    className="flex-1 h-16 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    Review Order <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-8">
                <div className="glass-ultra crystal-border rounded-[32px] p-8 space-y-6 bg-emerald-500/5 border-emerald-500/20">
                   <div className="flex items-center gap-3 text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                      <h3 className="font-bold uppercase tracking-widest text-xs">Items are reserved for 15 minutes</h3>
                   </div>
                   <p className="text-sm text-dark-700/60 dark:text-cream-50/50">Your selection is exclusive. Once you click 'Place Order', our seller will be notified to ship within 24 hours.</p>
                </div>
                <div className="flex gap-4">
                  <button onClick={() => setStep(2)} className="h-16 px-8 border-2 border-gold-400/20 text-gray-400 rounded-2xl font-bold">Back</button>
                  <button 
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                    className="flex-1 h-16 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    {isProcessing ? "Processing Vault..." : "Place Guaranteed Order"}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* RIGHT - SUMMARY TICKET */}
        <div className="h-fit sticky top-32">
           <div className="glass-ultra crystal-border rounded-[48px] overflow-hidden shadow-gold-3d">
              <div className="bg-gold-400 p-8 text-white text-center">
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-2">Order Summary</p>
                 <h2 className="text-3xl font-accent font-bold">Rs. {items.reduce((acc, item) => acc + item.price, 0).toLocaleString()}</h2>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-medium">
                         <span className="text-gray-500 truncate mr-4">{item.title}</span>
                         <span className="dark:text-cream-50 font-bold shrink-0">Rs. {item.price.toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gold-400/10 my-4" />
                    <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase">
                       <span>Shipping</span>
                       <span>Free</span>
                    </div>
                 </div>
                 
                 <div className="pt-6 border-t border-gold-400/10">
                    <div className="flex items-start gap-3">
                       <ShieldCheck className="w-5 h-5 text-gold-400 mt-0.5" />
                       <div className="space-y-1">
                          <p className="text-[10px] font-bold dark:text-cream-50 uppercase tracking-widest">Escrow Lock</p>
                          <p className="text-[10px] text-gray-400 leading-relaxed font-medium">Funds only released to seller after you verify the item condition.</p>
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}

function StepIndicator({ num, label, active }: any) {
  return (
    <div className={`flex items-center gap-3 ${active ? "text-gold-400" : "text-gray-400"}`}>
       <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold text-xs ${active ? "border-gold-400 bg-gold-400/10" : "border-gray-200"}`}>
          {num}
       </div>
       <span className="text-[10px] font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function InputGroup({ label, placeholder, isLarge }: any) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
       {isLarge ? (
         <textarea placeholder={placeholder} className="w-full h-32 px-6 py-4 glass-crystal crystal-border rounded-2xl outline-none focus:border-gold-400 transition-colors text-sm font-bold resize-none" />
       ) : (
         <input placeholder={placeholder} className="w-full h-14 px-6 glass-crystal crystal-border rounded-2xl outline-none focus:border-gold-400 transition-colors text-sm font-bold" />
       )}
    </div>
  );
}

function PaymentCard({ icon, label, active }: any) {
  return (
    <button className={`p-8 glass-ultra rounded-[32px] border-2 transition-all flex flex-col items-center gap-4 group ${active ? "border-gold-400 bg-gold-400/5 shadow-gold" : "border-gold-400/10 text-gray-400 hover:border-gold-400/30"}`}>
       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${active ? "bg-gold-400 text-white" : "bg-gold-400/10 text-gold-400"}`}>
          {icon}
       </div>
       <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </button>
  );
}
