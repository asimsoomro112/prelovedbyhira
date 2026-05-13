"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useState } from "react";
import { motion } from "framer-motion";
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, Lock } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [shippingDetails, setShippingDetails] = useState({
    name: user?.name || "",
    phone: "",
    address: "",
    city: ""
  });

  const [receipt, setReceipt] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);

  const subtotal = items.reduce((acc, item) => acc + ((item.product?.sellingPrice || 0) * item.quantity), 0);
  const uniqueSellers = Array.from(new Set(items.map(i => i.product?.sellerId).filter(Boolean)));
  const shippingCost = uniqueSellers.length * 300;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }
    if (!shippingDetails.address || !shippingDetails.phone) {
      toast.error("Please provide complete shipping details");
      setStep(1);
      return;
    }

    setIsProcessing(true);
    try {
      // 🚀 Step 1: Create Orders (One per product)
      const orderPromises = items.map(async (item, index) => {
        const sellerId = item.product?.sellerId;
        // Check if this is the FIRST item for this seller in the cart to charge shipping
        const isFirstForSeller = items.findIndex(i => i.product?.sellerId === sellerId) === items.indexOf(item);
        const itemShippingCost = isFirstForSeller ? 300 : 0;

        return api.post("/orders/create", {
          productId: item.productId,
          shippingAddress: shippingDetails,
          shippingCost: itemShippingCost,
        });
      });

      const responses = await Promise.all(orderPromises);
      const allOrders = responses.map(r => r.data.order);

      // 🚀 Step 2: Upload Receipt if exists
      if (receipt && allOrders.length > 0) {
        // In a real app, upload to Cloudinary first. 
        // Here we use the mock URL provided earlier or implement real upload if needed.
        const proofUrl = "https://res.cloudinary.com/dzr3qqsz1/image/upload/v1715560000/receipt_placeholder.png";
        
        // Link proof to the first order (system will track it)
        await api.post(`/orders/${allOrders[0].id}/submit-proof`, { proofUrl });
      }

      toast.success("Orders placed successfully! Please wait for Admin confirmation.");
      clearCart();
      router.push("/customer/orders");
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.response?.data?.message || "Failed to place orders");
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
                  <InputGroup 
                    label="Full Name" 
                    placeholder="Enter your name"
                    value={shippingDetails.name}
                    onChange={(e: any) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                  />
                  <InputGroup 
                    label="Contact Number" 
                    placeholder="+92 XXX XXXXXXX" 
                    value={shippingDetails.phone}
                    onChange={(e: any) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                  />
                  <InputGroup 
                    label="City" 
                    placeholder="e.g. Lahore" 
                    value={shippingDetails.city}
                    onChange={(e: any) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                  />
                  <div className="md:col-span-2">
                    <InputGroup 
                      label="Shipping Address" 
                      placeholder="Street, Area, Building" 
                      isLarge 
                      value={shippingDetails.address}
                      onChange={(e: any) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                    />
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
                <div className="glass-ultra crystal-border rounded-[40px] p-10 space-y-8 bg-gold-400/5">
                   <div className="space-y-2">
                      <h3 className="text-2xl font-display font-bold">Bank Transfer Details</h3>
                      <p className="text-gray-500 text-sm">Please transfer the total amount to the account below.</p>
                   </div>
                   
                   <div className="p-6 bg-white dark:bg-dark-900 rounded-3xl border border-gold-400/20 space-y-4">
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Bank Name</span>
                         <span className="text-sm font-bold">Meezan Bank</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Title</span>
                         <span className="text-sm font-bold">Preloved By Hira</span>
                      </div>
                      <div className="flex justify-between items-center">
                         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Account Number</span>
                         <span className="text-sm font-bold font-mono">0123-456789-0101</span>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Upload Payment Receipt / Screenshot</label>
                      <div 
                        className="relative h-48 border-2 border-dashed border-gold-400/20 rounded-[32px] flex flex-col items-center justify-center gap-4 hover:border-gold-400/50 transition-all cursor-pointer overflow-hidden group"
                        onClick={() => document.getElementById('receipt-upload')?.click()}
                      >
                         {receiptPreview ? (
                           <Image src={receiptPreview} alt="Receipt" fill className="object-cover opacity-50 group-hover:opacity-70 transition-opacity" />
                         ) : (
                           <>
                             <div className="w-14 h-14 bg-gold-400/10 text-gold-400 rounded-2xl flex items-center justify-center">
                               <Plus className="w-6 h-6" />
                             </div>
                             <p className="text-xs font-bold text-gray-400">Tap to upload receipt</p>
                           </>
                         )}
                         <input 
                           id="receipt-upload" 
                           type="file" 
                           hidden 
                           onChange={(e) => {
                             const file = e.target.files?.[0];
                             if (file) {
                               setReceipt(file);
                               setReceiptPreview(URL.createObjectURL(file));
                             }
                           }} 
                         />
                      </div>
                   </div>
                </div>

                <div className="flex gap-4">
                  <button onClick={() => setStep(1)} className="h-16 px-8 border-2 border-gold-400/20 text-gray-400 rounded-2xl font-bold">Back</button>
                  <button 
                    onClick={() => {
                      if (!receipt) return toast.error("Please upload the payment receipt first");
                      setStep(3);
                    }}
                    className="flex-1 h-16 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all flex items-center justify-center gap-3"
                  >
                    Continue to Review <ArrowRight className="w-5 h-5" />
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
                 <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-2">Total Payable</p>
                 <h2 className="text-3xl font-accent font-bold">Rs. {total.toLocaleString()}</h2>
              </div>
              <div className="p-8 space-y-6">
                 <div className="space-y-4">
                    {items.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm font-medium">
                         <span className="text-gray-500 truncate mr-4">{item.product?.title || 'Unknown Item'}</span>
                         <span className="dark:text-cream-50 font-bold shrink-0">Rs. {((item.product?.sellingPrice || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="h-px bg-gold-400/10 my-4" />
                    <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase">
                       <span>Shipping Cost</span>
                       <span>Rs. {shippingCost.toLocaleString()}</span>
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

function InputGroup({ label, placeholder, isLarge, value, onChange }: any) {
  return (
    <div className="space-y-3">
       <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</label>
       {isLarge ? (
         <textarea 
          value={value}
          onChange={onChange}
          placeholder={placeholder} 
          className="w-full h-32 px-6 py-4 glass-crystal crystal-border rounded-2xl outline-none focus:border-gold-400 transition-colors text-sm font-bold resize-none" 
         />
       ) : (
         <input 
          value={value}
          onChange={onChange}
          placeholder={placeholder} 
          className="w-full h-14 px-6 glass-crystal crystal-border rounded-2xl outline-none focus:border-gold-400 transition-colors text-sm font-bold" 
         />
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
