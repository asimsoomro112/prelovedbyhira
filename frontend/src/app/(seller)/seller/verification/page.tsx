"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ShieldCheck, 
  User, 
  CreditCard, 
  Image as ImageIcon, 
  Upload, 
  CheckCircle2, 
  ArrowRight, 
  ArrowLeft,
  X,
  AlertTriangle,
  Zap,
  Camera,
  Loader2,
  Scan
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

const verificationSchema = z.object({
  fullName: z.string().min(3, "Full name as per CNIC is required"),
  payoutMethod: z.enum(["JAZZCASH", "EASYPAISA", "BANK_TRANSFER"]),
  accountNumber: z.string().min(10, "Valid account number is required"),
  accountName: z.string().min(2, "Account holder name is required"),
  bankName: z.string().optional(),
});

type VerificationValues = z.infer<typeof verificationSchema>;

export default function SellerVerificationPage() {
  const [step, setStep] = useState(1);
  const [cnicFront, setCnicFront] = useState<File | null>(null);
  const [cnicBack, setCnicBack] = useState<File | null>(null);
  const [selfie, setSelfie] = useState<File | null>(null);
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [vStatus, setVStatus] = useState<string>("");
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const { data } = await api.get("/seller/verification/status");
      setVStatus(data.status);
      if (data.status === 'IDENTITY_VERIFIED') setStep(3);
      if (data.status === 'PENDING') setStep(5);
      if (data.status === 'APPROVED' || data.status === 'ACTIVE') setStep(5);
      if (data.status === 'REJECTED') {
        setStep(6); // Step 6 for Rejection view
        setRejectionReason(data.rejectionReason);
      }
    } catch (error) {
      console.error("New seller or status fetch failed");
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleRetry = () => {
    setStep(1);
    setRejectionReason(null);
  };

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { 
      fullName: user?.name || "",
      payoutMethod: "JAZZCASH" 
    }
  });

  const enteredName = watch("fullName");

  // AI IDENTITY SCAN
  const handleAIIdentityScan = async () => {
    if (!cnicFront || !cnicBack) {
      toast.error("Please upload both sides of your CNIC");
      return;
    }

    setIsAIProcessing(true);
    try {
      const formData = new FormData();
      formData.append("cnicFront", cnicFront);
      formData.append("cnicBack", cnicBack);
      formData.append("fullNameEntered", enteredName);

      const { data } = await api.post("/seller/verify-identity", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (data.success) {
        setAiResult(data.extracted);
        toast.success("Identity Verified by Hira AI!");
        setStep(3);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "AI Verification failed. Please try again with a clearer photo.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  // FINAL SUBMISSION (SELFIE + PAYOUT)
  const onSubmit = async (values: VerificationValues) => {
    if (!selfie) {
      toast.error("Selfie is required for final approval");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("selfie", selfie);
      formData.append("payoutMethod", values.payoutMethod);
      formData.append("payoutDetails", JSON.stringify({ 
        accountNumber: values.accountNumber, 
        accountName: values.accountName,
        bankName: values.bankName || ""
      }));

      await api.post("/seller/submit-selfie", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Final step complete! Waiting for Admin approval.");
      setStep(5);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
         <Loader2 className="w-12 h-12 text-gold-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-12">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-gold-400/10 text-gold-400 rounded-full text-xs font-bold uppercase tracking-widest">
           <Zap className="w-3 h-3 fill-gold-400" /> AI Powered Verification
        </div>
        <h1 className="text-4xl lg:text-5xl font-display font-bold">Seller Verification</h1>
        <p className="text-gray-500 max-w-md mx-auto italic">Complete these steps to unlock your luxury boutique and start selling across Pakistan.</p>
      </div>

      {/* Modern Stepper */}
      <div className="flex justify-between items-center relative px-2 max-w-2xl mx-auto">
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-gold-400/10 z-0" />
        {[1, 2, 3, 4].map((s) => (
          <div key={s} className="relative z-10 flex flex-col items-center gap-3">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm transition-all rotate-45 ${step >= s ? "bg-gold-400 text-white shadow-gold" : "bg-white dark:bg-dark-800 text-gray-400 border-2 border-gold-400/10"}`}>
              <div className="-rotate-45">{step > s ? <CheckCircle2 className="w-5 h-5" /> : s}</div>
            </div>
            <span className={`text-[9px] font-bold uppercase tracking-[0.2em] mt-2 ${step >= s ? "text-gold-400" : "text-gray-400"}`}>
              {s === 1 && "Personal"}
              {s === 2 && "Identity"}
              {s === 3 && "Selfie"}
              {s === 4 && "Payout"}
            </span>
          </div>
        ))}
      </div>

      <div className="bg-white dark:bg-dark-900 p-8 lg:p-16 rounded-[48px] shadow-2xl border border-gold-400/5 relative overflow-hidden">
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold-400/5 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <form onSubmit={handleSubmit(onSubmit)} className="relative z-10">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="grid md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h3 className="text-xl font-display font-bold">Personal Details</h3>
                      <p className="text-sm text-gray-500">Ensure this matches exactly with your CNIC to avoid AI mismatch.</p>
                   </div>
                   <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Full Name (As per CNIC)</label>
                        <input {...register("fullName")} className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" />
                        {errors.fullName && <p className="text-xs text-red-500">{errors.fullName.message}</p>}
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Phone Number</label>
                        {/* @ts-ignore - phone may not be on the User interface currently */}
                        <input defaultValue={user?.phone || ""} placeholder="03XXXXXXXXX" className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" />
                      </div>
                   </div>
                </div>
                <button type="button" onClick={() => setStep(2)} className="w-full py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform">
                  Begin Identity Scan <ArrowRight className="w-5 h-5" />
                </button>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="text-center space-y-2">
                   <h3 className="text-2xl font-display font-bold">Scan Identity Document</h3>
                   <p className="text-sm text-gray-500">Upload your original CNIC. Hira AI will extract your data instantly.</p>
                </div>
                <div className="grid md:grid-cols-2 gap-8">
                   <DocUpload label="CNIC Front Side" file={cnicFront} setFile={setCnicFront} icon={<Scan className="w-6 h-6" />} />
                   <DocUpload label="CNIC Back Side" file={cnicBack} setFile={setCnicBack} icon={<Scan className="w-6 h-6" />} />
                </div>
                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 border-2 border-gold-400/20 text-gray-500 rounded-2xl font-bold hover:bg-gold-400/5 transition-all">Back</button>
                  <button type="button" disabled={isAIProcessing || !cnicFront || !cnicBack} onClick={handleAIIdentityScan} className="flex-[2] py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-3 disabled:opacity-50">
                    {isAIProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Document...
                      </>
                    ) : (
                      <>
                        Verify with Hira AI <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                <div className="p-6 bg-emerald-500/5 border border-emerald-500/20 rounded-3xl flex items-center gap-6">
                   <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-8 h-8 text-emerald-500" />
                   </div>
                   <div>
                      <p className="text-emerald-500 font-bold text-lg">Identity Verified!</p>
                      <p className="text-xs text-emerald-700/70 dark:text-emerald-400/70 font-medium">Hira AI matched your CNIC with your profile. CNIC Number: {aiResult?.cnicNumber}</p>
                   </div>
                </div>

                <div className="space-y-6">
                   <div className="text-center space-y-2">
                      <h3 className="text-2xl font-display font-bold">Upload Selfie</h3>
                      <p className="text-sm text-gray-500">Please take a clear selfie for manual Admin approval.</p>
                   </div>
                   <DocUpload label="Your Selfie" file={selfie} setFile={setSelfie} icon={<Camera className="w-6 h-6" />} isLarge />
                </div>

                <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(2)} className="flex-1 py-5 border-2 border-gold-400/20 text-gray-500 rounded-2xl font-bold hover:bg-gold-400/5 transition-all">Back</button>
                  <button type="button" onClick={() => setStep(4)} disabled={!selfie} className="flex-[2] py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2">
                    Final Step: Payout Info <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-10">
                 <div className="text-center space-y-2">
                    <h3 className="text-2xl font-display font-bold">Payout Configuration</h3>
                    <p className="text-sm text-gray-500">Where should we send your luxury earnings?</p>
                 </div>
                 <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Method</label>
                        <select {...register("payoutMethod")} className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold">
                           <option value="JAZZCASH">JazzCash</option>
                           <option value="EASYPAISA">EasyPaisa</option>
                           <option value="BANK_TRANSFER">Bank Transfer</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Name</label>
                        <input {...register("accountName")} placeholder="Full Name on Account" className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Account Number / IBAN</label>
                      <input {...register("accountNumber")} placeholder="03XXXXXXXXX or PK..." className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" />
                    </div>
                    {watch("payoutMethod") === "BANK_TRANSFER" && (
                      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Bank Name</label>
                        <input {...register("bankName")} placeholder="e.g. Meezan Bank, HBL, UBL" className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold" />
                      </motion.div>
                    )}
                 </div>
                 <div className="flex gap-4">
                  <button type="button" onClick={() => setStep(3)} className="flex-1 py-5 border-2 border-gold-400/20 text-gray-500 rounded-2xl font-bold">Back</button>
                  <button type="submit" disabled={isSubmitting} className="flex-[2] py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Application"}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
                 <div className="relative w-32 h-32 mx-auto">
                    <motion.div 
                      animate={{ rotate: 360 }} 
                      transition={{ repeat: Infinity, duration: 20, ease: "linear" }} 
                      className={`absolute inset-0 border-2 border-dashed rounded-full ${vStatus === 'APPROVED' || vStatus === 'ACTIVE' ? 'border-emerald-500' : 'border-gold-400'}`} 
                    />
                    <div className={`absolute inset-2 rounded-full flex items-center justify-center shadow-lg ${vStatus === 'APPROVED' || vStatus === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 shadow-emerald-500/20' : 'bg-gold-400/10 text-gold-400 shadow-gold-400/20'}`}>
                       <CheckCircle2 className="w-16 h-16" />
                    </div>
                 </div>
 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h2 className={`text-4xl font-display font-bold ${vStatus === 'APPROVED' || vStatus === 'ACTIVE' ? 'text-emerald-500' : 'text-gold-400'}`}>
                         {vStatus === 'APPROVED' || vStatus === 'ACTIVE' ? "Boutique Fully Verified!" : vStatus === 'PENDING' ? "Application Under Review" : "Identity Matched!"}
                       </h2>
                       <p className="text-zinc-500 dark:text-gray-400 font-medium">
                         {vStatus === 'APPROVED' || vStatus === 'ACTIVE' 
                           ? "Congratulations! Your merchant identity has been fully vetted and approved." 
                           : "Hira AI has successfully matched your profile name with your CNIC."}
                       </p>
                    </div>
 
                    <div className="grid gap-4 max-w-lg mx-auto text-left">
                       <div className="p-5 bg-gold-400/5 border border-gold-400/10 rounded-3xl flex gap-4">
                          <ShieldCheck className="w-6 h-6 text-gold-400 shrink-0" />
                          <div>
                             <p className="text-sm font-bold text-dark-900 dark:text-white mb-1">
                               {vStatus === 'APPROVED' || vStatus === 'ACTIVE' ? "Store Now Live" : "Final Team Review"}
                             </p>
                             <p className="text-[11px] text-gray-500 leading-relaxed">
                                {vStatus === 'APPROVED' || vStatus === 'ACTIVE' 
                                  ? "Aap ab products list kar saktay hain aur unki payments directly apne verified payout account mein receive kar saktay hain." 
                                  : "Hamari team ab aapki selfie aur CNIC images ko manually verify karegi taake security standards maintain rahain."}
                             </p>
                          </div>
                       </div>

                        {!(vStatus === 'APPROVED' || vStatus === 'ACTIVE') && (
                          <div className="p-5 bg-blue-500/5 border border-blue-500/10 rounded-3xl flex gap-4">
                             <AlertTriangle className="w-6 h-6 text-blue-400 shrink-0" />
                             <div>
                                <p className="text-sm font-bold text-dark-900 dark:text-white mb-1">Legal & Privacy Policy</p>
                                <p className="text-[11px] text-gray-500 leading-relaxed">Aapka data sirf legal purposes aur marketplace verification ke liye use kiya ja raha hai. Yeh frauds se bachnay aur customers ka trust maintain rakhnay ke liye zaroori hai.</p>
                             </div>
                          </div>
                        )}
                    </div>
                 </div>

                 <div className="pt-4">
                    <button type="button" onClick={() => router.push("/seller/dashboard")} className="w-full py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-[1.02] transition-transform">
                      Go to Seller Dashboard
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">Aapko email aur dashboard notification ke zariye status update mil jaye gi.</p>
                 </div>
              </motion.div>
            )}

            {step === 6 && (
              <motion.div key="s6" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-10">
                 <div className="relative w-32 h-32 mx-auto">
                    <div className="absolute inset-0 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
                       <AlertTriangle className="w-16 h-16" />
                    </div>
                 </div>
                 
                 <div className="space-y-6">
                    <div className="space-y-2">
                       <h2 className="text-4xl font-display font-bold text-red-500">Application Rejected</h2>
                       <p className="text-zinc-500 dark:text-gray-400 font-medium italic">Admin has provided feedback on your submission.</p>
                    </div>

                    <div className="p-8 bg-red-500/5 border border-red-500/20 rounded-[32px] text-left space-y-4">
                       <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest">Reason for Rejection</p>
                       <p className="text-sm font-medium text-dark-900 dark:text-cream-50 leading-relaxed">
                          {rejectionReason || "Please ensure your documents are clear and valid according to our platform standards."}
                       </p>
                    </div>
                 </div>

                 <div className="pt-4">
                    <button type="button" onClick={handleRetry} className="w-full py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-[1.02] transition-transform">
                      Retry Verification Process
                    </button>
                    <p className="text-[10px] text-gray-400 mt-4 uppercase tracking-[0.2em] font-bold">Aap apne documents dobara upload kar saktay hain.</p>
                 </div>
              </motion.div>
            )}

          </AnimatePresence>
        </form>
      </div>
    </div>
  );
}

function DocUpload({ label, file, setFile, isLarge, icon }: any) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">{label}</p>
      <label className={`relative rounded-[32px] border-2 border-dashed border-gold-400/20 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gold-400/5 hover:border-gold-400 transition-all overflow-hidden bg-cream-50/50 dark:bg-dark-800/50 ${isLarge ? "h-80" : "h-48"}`}>
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
               <div className="p-3 bg-white/20 backdrop-blur-md rounded-full text-white">
                  <Camera className="w-6 h-6" />
               </div>
            </div>
          </>
        ) : (
          <>
            <div className="w-14 h-14 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center">
              {icon || <Upload className="w-6 h-6" />}
            </div>
            <div className="text-center">
               <span className="block text-xs font-bold text-dark-900 dark:text-white uppercase tracking-widest">Select Image</span>
               <span className="text-[10px] text-gray-500 mt-1 block">PNG, JPG or WebP</span>
            </div>
          </>
        )}
      </label>
    </div>
  );
}
