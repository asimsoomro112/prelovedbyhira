"use client";

import { useCartStore } from "@/store/useCartStore";
import { useAuthStore } from "@/store/useAuthStore";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CreditCard, Truck, ShieldCheck, ShoppingBag, ArrowRight, CheckCircle2, ChevronRight, ChevronDown, ChevronUp, Lock, Plus, Upload, ImageIcon, Sparkles, AlertTriangle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import api from "@/lib/api";

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-dark-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const directId = searchParams.get("id");
  const directQty = parseInt(searchParams.get("qty") || "1");

  const [directProduct, setDirectProduct] = useState<any>(null);
  const [loadingProduct, setLoadingProduct] = useState(!!directId);

  useEffect(() => {
    if (directId) {
      api.get(`/products/${directId}`)
        .then(({ data }) => {
          setDirectProduct(data.product);
          setLoadingProduct(false);
        })
        .catch(() => setLoadingProduct(false));
    }
  }, [directId]);

  const itemsToProcess = (directId && directProduct) 
    ? [{ id: "direct", productId: directId, quantity: directQty, product: directProduct }]
    : items;
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
  const [checkoutResult, setCheckoutResult] = useState<any>(null);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);

  const BANK_ACCOUNTS = [
    {
      name: "Jazzcash",
      holder: "Muhammad Asim",
      number: "0303 3566436",
    },
    {
      name: "Mashreq Bank",
      holder: "Muhammad Asim",
      number: "089120080838",
      iban: "PK72MSHQ0000089120080838"
    },
    {
      name: "Sadapay",
      holder: "Muhammad Asim",
      number: "03191278505",
      iban: "PK53SADA0000003191278505"
    }
  ];

  const [selectedBank, setSelectedBank] = useState(BANK_ACCOUNTS[0]);

  const subtotal = itemsToProcess.reduce((acc, item) => acc + ((item.product?.sellingPrice || 0) * item.quantity), 0);
  const uniqueSellers = Array.from(new Set(itemsToProcess.map(i => i.product?.sellerId).filter(Boolean)));
  const shippingCost = uniqueSellers.length * 300;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (itemsToProcess.length === 0) {
      if (loadingProduct) {
        toast.info("Loading product details...");
        return;
      }
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
      const orderPromises = itemsToProcess.map(async (item) => {
        const sellerId = item.product?.sellerId;
        const isFirstForSeller = itemsToProcess.findIndex(i => i.product?.sellerId === sellerId) === itemsToProcess.indexOf(item);
        const itemShippingCost = isFirstForSeller ? 300 : 0;

        return api.post("/orders/create", {
          productId: item.productId,
          quantity: item.quantity,
          shippingAddress: shippingDetails,
          shippingCost: itemShippingCost,
          paymentMethod: selectedBank.name
        });
      });

      const responses = await Promise.all(orderPromises);
      const allOrders = responses.map(r => r.data.order);

      // 🚀 Step 2: Upload Receipt & Run AI Scan
      let aiVerification = null;
      if (receipt && allOrders.length > 0) {
        // We submit the proof for each order created in this checkout
        const uploadPromises = allOrders.map(async (order: any) => {
          const formData = new FormData();
          formData.append('receiptImage', receipt);
          return api.post(`/orders/${order.id}/submit-proof`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });
        });
        
        const uploadResponses = await Promise.all(uploadPromises);
        aiVerification = uploadResponses[0].data; // Use first one for the result display
      }

      setCheckoutResult(aiVerification);
      setStep(4); // Success step
      toast.success("Order request submitted to Hira Neural Vault.");
      clearCart();
    } catch (error: any) {
      console.error("Checkout Error:", error);
      toast.error(error.response?.data?.message || "Failed to place orders");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 space-y-4">
      <Lock className="w-12 h-12 text-gold-400" />
      <h2 className="text-xl font-bold text-center">Please login to checkout</h2>
      <Link href="/login" className="px-8 py-4 bg-gold-400 text-white rounded-2xl font-bold min-h-[52px] flex items-center">
        Login Now
      </Link>
    </div>
  );

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-6 py-6 lg:py-16 min-h-screen pb-32 lg:pb-16">
      <div className="grid lg:grid-cols-3 gap-8 lg:gap-16">

        {/* LEFT - CHECKOUT FLOW */}
        <div className="lg:col-span-2 space-y-6 lg:space-y-10">
          <div className="space-y-1">
            <h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">Secure <span className="italic text-gold-400">Checkout.</span></h1>
            <div className="flex items-center gap-2 text-emerald-500 font-bold text-[10px] uppercase tracking-widest">
              <Lock className="w-3 h-3" /> 256-Bit SSL Encrypted
            </div>
          </div>

          {/* ✅ PROGRESS STEPS — clear step indicator */}
          <div className="flex items-center gap-3 md:gap-6 overflow-x-auto scrollbar-none pb-2">
            <StepIndicator num={1} label="Shipping" active={step >= 1} current={step === 1} />
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            <StepIndicator num={2} label="Payment" active={step >= 2} current={step === 2} />
            <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
            <StepIndicator num={3} label="Review" active={step >= 3} current={step === 3} />
          </div>

          {/* ✅ Mobile order summary — collapsible accordion */}
          <div className="lg:hidden">
            <button 
              onClick={() => setIsSummaryOpen(!isSummaryOpen)}
              className="w-full flex items-center justify-between p-4 bg-gold-400/5 rounded-2xl border border-gold-400/10 min-h-[48px]"
              aria-expanded={isSummaryOpen}
            >
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-5 h-5 text-gold-400" />
                <span className="text-sm font-bold">Order Summary ({itemsToProcess.length} items)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-accent font-bold text-gold-400">Rs. {total.toLocaleString()}</span>
                {isSummaryOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
              </div>
            </button>
            <AnimatePresence>
              {isSummaryOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                  <div className="p-4 space-y-3 border-x border-b border-gold-400/10 rounded-b-2xl">
                    {itemsToProcess.map((item, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-gray-500 truncate mr-4">{item.product?.title || 'Item'}</span>
                        <span className="font-bold shrink-0">Rs. {((item.product?.sellingPrice || 0) * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-xs text-emerald-500 font-bold pt-2 border-t border-gold-400/10">
                      <span>Shipping</span>
                      <span>Rs. {shippingCost.toLocaleString()}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {/* ✅ STEP 1: SHIPPING — all fields stacked vertically on mobile */}
              {step === 1 && (
                <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="space-y-4">
                    <InputGroup
                      label="Full Name"
                      placeholder="Enter your name"
                      value={shippingDetails.name}
                      onChange={(e: any) => setShippingDetails({ ...shippingDetails, name: e.target.value })}
                      autoComplete="name"
                    />
                    <InputGroup
                      label="Contact Number"
                      placeholder="+92 XXX XXXXXXX"
                      value={shippingDetails.phone}
                      onChange={(e: any) => setShippingDetails({ ...shippingDetails, phone: e.target.value })}
                      inputMode="tel"
                      autoComplete="tel"
                    />
                    <InputGroup
                      label="City"
                      placeholder="e.g. Lahore"
                      value={shippingDetails.city}
                      onChange={(e: any) => setShippingDetails({ ...shippingDetails, city: e.target.value })}
                      autoComplete="address-level2"
                    />
                    <InputGroup
                      label="Shipping Address"
                      placeholder="Street, Area, Building"
                      isLarge
                      value={shippingDetails.address}
                      onChange={(e: any) => setShippingDetails({ ...shippingDetails, address: e.target.value })}
                      autoComplete="street-address"
                    />
                  </div>
                </motion.div>
              )}

              {/* STEP 2: PAYMENT */}
              {step === 2 && (
                <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-gold-400/5 rounded-2xl lg:rounded-[32px] p-5 lg:p-8 space-y-6 border border-gold-400/10">
                    <div className="space-y-1">
                      <h3 className="text-xl font-display font-bold">Bank Transfer Details</h3>
                      <p className="text-gray-500 text-sm">Transfer Rs. {total.toLocaleString()} to the platform vault.</p>
                    </div>

                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Select Bank Account</label>
                      <select 
                        className="w-full h-14 px-4 bg-white dark:bg-dark-900 border-2 border-gold-400/20 rounded-2xl outline-none focus:border-gold-400 transition-all font-bold text-sm appearance-none"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23C4A35A' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: 'right 16px center', backgroundRepeat: 'no-repeat', backgroundSize: '20px' }}
                        onChange={(e) => {
                          const bank = BANK_ACCOUNTS.find(b => b.name === e.target.value);
                          if (bank) setSelectedBank(bank);
                        }}
                      >
                        {BANK_ACCOUNTS.map(bank => (
                          <option key={bank.name} value={bank.name}>{bank.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="p-5 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/20 space-y-4 shadow-sm relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-3 opacity-10">
                         <CreditCard className="w-12 h-12 text-gold-400" />
                      </div>
                      <BankDetail label="Bank Name" value={selectedBank.name} />
                      <BankDetail label="Account Title" value={selectedBank.holder} />
                      <BankDetail label="Account Number" value={selectedBank.number} mono />
                      {selectedBank.iban && <BankDetail label="IBAN" value={selectedBank.iban} mono />}
                    </div>

                    {/* ✅ Receipt upload — large tap target */}
                    <div className="space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest" htmlFor="receipt-upload">Upload Payment Receipt</label>
                      <div
                        className="relative min-h-[120px] border-2 border-dashed border-gold-400/20 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-gold-400/50 transition-all cursor-pointer overflow-hidden group bg-white/50 dark:bg-dark-800/50 p-4"
                        onClick={() => document.getElementById('receipt-upload')?.click()}
                        role="button"
                        tabIndex={0}
                        aria-label="Upload receipt image"
                      >
                        {receiptPreview ? (
                          <div className="relative w-full h-32">
                            <Image src={receiptPreview} alt="Receipt" fill className="object-contain rounded-xl" />
                          </div>
                        ) : (
                          <>
                            <div className="w-12 h-12 bg-gold-400/10 text-gold-400 rounded-xl flex items-center justify-center">
                              <Upload className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-gray-400 text-center">Tap to select receipt screenshot</p>
                          </>
                        )}
                        <input
                          id="receipt-upload"
                          type="file"
                          accept="image/*"
                          capture="environment"
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
                </motion.div>
              )}

              {/* STEP 3: REVIEW */}
              {step === 3 && (
                <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                  <div className="bg-emerald-500/5 rounded-2xl p-5 space-y-4 border border-emerald-500/20">
                    <div className="flex items-center gap-3 text-emerald-500">
                      <CheckCircle2 className="w-6 h-6" />
                      <h3 className="font-bold uppercase tracking-widest text-xs">Ready for Verification</h3>
                    </div>
                    <p className="text-sm text-dark-700/60 dark:text-cream-50/50">Once you place the order, our AI will scan your receipt for amount and recipient matching.</p>
                  </div>
                </motion.div>
              )}

              {/* STEP 4: SUCCESS */}
              {step === 4 && (
                <motion.div key="step4" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6 py-8 text-center">
                  <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10" />
                  </div>
                  <h2 className="text-fluid-card font-display font-bold">Order Confirmed!</h2>

                  {checkoutResult?.aiVerified ? (
                    <div className="p-6 bg-emerald-500/5 border-2 border-dashed border-emerald-500/20 rounded-2xl space-y-3 max-w-lg mx-auto">
                      <div className="flex items-center justify-center gap-2 text-emerald-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <Sparkles className="w-4 h-4" /> AI Match Successful
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Hira AI has verified Rs. {total.toLocaleString()} from your receipt.</p>
                    </div>
                  ) : (
                    <div className="p-6 bg-amber-500/5 border-2 border-dashed border-amber-500/20 rounded-2xl space-y-3 max-w-lg mx-auto">
                      <div className="flex items-center justify-center gap-2 text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px]">
                        <AlertTriangle className="w-4 h-4" /> Manual Check Required
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">Receipt uploaded. Our Admin will perform a manual review shortly.</p>
                    </div>
                  )}

                  <div className="pt-6">
                    <Link href="/customer/orders" className="px-10 py-4 bg-dark-900 text-white rounded-2xl font-bold inline-flex items-center min-h-[52px]">
                      View My Orders
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ✅ DESKTOP SUMMARY — hidden on mobile (using accordion instead) */}
        {step < 4 && (
          <div className="hidden lg:block h-fit sticky top-32">
            <div className="glass-ultra crystal-border rounded-[48px] overflow-hidden shadow-gold-3d">
              <div className="bg-gold-400 p-6 text-white text-center">
                <p className="text-[10px] font-bold uppercase tracking-[0.4em] opacity-80 mb-1">Total Payable</p>
                <h2 className="text-3xl font-accent font-bold">Rs. {total.toLocaleString()}</h2>
              </div>
              <div className="p-6 space-y-4">
                {itemsToProcess.map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-sm font-medium">
                    <span className="text-gray-500 truncate mr-4">{item.product?.title || 'Unknown Item'}</span>
                    <span className="dark:text-cream-50 font-bold shrink-0">Rs. {((item.product?.sellingPrice || 0) * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                <div className="h-px bg-gold-400/10" />
                <div className="flex justify-between text-xs font-bold text-emerald-500 uppercase">
                  <span>Shipping</span>
                  <span>Rs. {shippingCost.toLocaleString()}</span>
                </div>
                <div className="pt-4 border-t border-gold-400/10">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-gold-400 mt-0.5 shrink-0" />
                    <div className="space-y-1">
                      <p className="text-[10px] font-bold uppercase tracking-widest">Escrow Lock</p>
                      <p className="text-[10px] text-gray-400 leading-relaxed">Funds only released after you verify condition.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ Desktop Action Button */}
            <div className="mt-6 space-y-4">
              <button
                onClick={() => {
                  if (step === 1) setStep(2);
                  else if (step === 2) {
                    if (!receipt) return toast.error("Please upload the payment receipt first");
                    setStep(3);
                  }
                  else if (step === 3) handlePlaceOrder();
                }}
                disabled={isProcessing}
                className="w-full h-16 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-3xl font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {step === 3 ? (isProcessing ? "Processing..." : "Place Order") : "Continue to Next Step"}
                <ArrowRight className="w-5 h-5" />
              </button>
              
              {step > 1 && (
                <button 
                  onClick={() => setStep(step - 1)}
                  className="w-full py-2 text-sm font-bold text-gray-400 hover:text-gold-400 transition-colors uppercase tracking-widest"
                >
                  Go Back
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ✅ MOBILE STICKY BOTTOM — Back/Continue buttons */}
      {step < 4 && (
        <div className="lg:hidden fixed bottom-16 left-0 right-0 z-50 bg-white/95 dark:bg-dark-950/95 backdrop-blur-2xl border-t border-gold-400/10 px-4 py-3" style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}>
          <div className="flex gap-3">
            {step > 1 && (
              <button 
                onClick={() => setStep(step - 1)} 
                className="h-14 px-6 border-2 border-gold-400/20 text-gray-500 rounded-2xl font-bold flex items-center gap-2 active:scale-95 transition-all min-h-[52px]"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
            <button
              onClick={() => {
                if (step === 1) setStep(2);
                else if (step === 2) {
                  if (!receipt) return toast.error("Please upload the payment receipt first");
                  setStep(3);
                }
                else if (step === 3) handlePlaceOrder();
              }}
              disabled={isProcessing}
              className="flex-1 h-14 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold active:scale-95 transition-all flex items-center justify-center gap-3 min-h-[52px] disabled:opacity-50"
            >
              {step === 3 ? (isProcessing ? "Processing..." : "Place Order") : "Continue"}
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepIndicator({ num, label, active, current }: { num: number; label: string; active: boolean; current: boolean }) {
  return (
    <div className={`flex items-center gap-2 shrink-0 ${active ? "text-gold-400" : "text-gray-400"}`}>
      <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center font-bold text-xs min-w-[32px] ${
        current ? "border-gold-400 bg-gold-400 text-white" : active ? "border-gold-400 bg-gold-400/10" : "border-gray-200"
      }`}>
        {active && !current ? <CheckCircle2 className="w-4 h-4" /> : num}
      </div>
      <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
    </div>
  );
}

function InputGroup({ label, placeholder, isLarge, value, onChange, inputMode, autoComplete }: { label: string; placeholder: string; isLarge?: boolean; value: string; onChange: (e: any) => void; inputMode?: string; autoComplete?: string }) {
  const id = `checkout-${label.toLowerCase().replace(/\s/g, '-')}`;
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-xs font-bold text-gray-400 uppercase tracking-widest block">{label}</label>
      {isLarge ? (
        <textarea
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full px-4 py-3 bg-white dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-colors text-base font-medium resize-none min-h-[120px]"
          style={{ fontSize: '16px' }}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          inputMode={inputMode as any}
          autoComplete={autoComplete}
          className="w-full h-14 px-4 bg-white dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl outline-none focus:border-gold-400 transition-colors text-base font-medium min-h-[48px]"
          style={{ fontSize: '16px' }}
        />
      )}
    </div>
  );
}

function BankDetail({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
