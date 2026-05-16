"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck, User, CreditCard, Upload, CheckCircle2,
  ArrowRight, ArrowLeft, AlertTriangle, Zap, Camera,
  Loader2, Scan, Sparkles, Lock, BadgeCheck, Clock,
  XCircle, RefreshCcw, ChevronRight, Building2, Wallet,
} from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

// ─── Schema ──────────────────────────────────────────────────────────────────

const verificationSchema = z.object({
  fullName: z.string().min(3, "Full name as per CNIC is required"),
  payoutMethod: z.enum(["JAZZCASH", "EASYPAISA", "BANK_TRANSFER"]),
  accountNumber: z.string().min(10, "Valid account number is required"),
  accountName: z.string().min(2, "Account holder name is required"),
  bankName: z.string().optional(),
});
type VerificationValues = z.infer<typeof verificationSchema>;

// ─── Framer Variants ──────────────────────────────────────────────────────────

const pageVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40, filter: "blur(6px)" } as const),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 26 } as const },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40, filter: "blur(6px)", transition: { duration: 0.18 } as const }),
};

const fieldVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } as const },
} as const;

const fieldItem = {
  hidden: { opacity: 0, y: 12, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 260, damping: 22 } as const },
} as const;

// ─── Step config ──────────────────────────────────────────────────────────────

const STEPS = [
  { n: 1, label: "Profile", icon: <User className="w-4 h-4" /> },
  { n: 2, label: "Identity", icon: <Scan className="w-4 h-4" /> },
  { n: 3, label: "Selfie", icon: <Camera className="w-4 h-4" /> },
  { n: 4, label: "Payout", icon: <Wallet className="w-4 h-4" /> },
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function SellerVerificationPage() {
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
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

  useEffect(() => { checkStatus(); }, []);

  const checkStatus = async () => {
    try {
      const { data } = await api.get("/seller/verification/status");
      setVStatus(data.status);
      if (data.status === "IDENTITY_VERIFIED") goTo(3);
      if (data.status === "PENDING") goTo(5);
      if (data.status === "APPROVED" || data.status === "ACTIVE") goTo(5);
      if (data.status === "REJECTED") {
        goTo(6);
        setRejectionReason(data.rejectionReason);
      }
    } catch {
      setVStatus("REQUIRED");
      setStep(1);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const goTo = (n: number) => {
    setDirection(n > step ? 1 : -1);
    setStep(n);
  };

  const handleRetry = () => { setRejectionReason(null); goTo(1); };

  const { register, handleSubmit, watch, formState: { errors } } = useForm<VerificationValues>({
    resolver: zodResolver(verificationSchema),
    defaultValues: { fullName: user?.name || "", payoutMethod: "JAZZCASH" },
  });

  const enteredName = watch("fullName");
  const payoutMethod = watch("payoutMethod");

  // ── AI Scan ──────────────────────────────────────────────────────────────
  const handleAIIdentityScan = async () => {
    if (!cnicFront || !cnicBack) { toast.error("Please upload both sides of your CNIC"); return; }
    setIsAIProcessing(true);
    try {
      const fd = new FormData();
      fd.append("cnicFront", cnicFront);
      fd.append("cnicBack", cnicBack);
      fd.append("fullNameEntered", enteredName);
      const { data } = await api.post("/seller/verify-identity", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      if (data.success) {
        setAiResult(data.extracted);
        toast.success("Identity Verified by ReVault AI!");
        goTo(3);
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || "AI Verification failed. Try with a clearer photo.");
    } finally {
      setIsAIProcessing(false);
    }
  };

  // ── Final Submit ─────────────────────────────────────────────────────────
  const onSubmit = async (values: VerificationValues) => {
    if (!selfie) { toast.error("Selfie is required for final approval"); return; }
    setIsSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("selfie", selfie);
      fd.append("payoutMethod", values.payoutMethod);
      fd.append("payoutDetails", JSON.stringify({
        accountNumber: values.accountNumber,
        accountName: values.accountName,
        bankName: values.bankName || "",
      }));
      await api.post("/seller/submit-selfie", fd, { headers: { "Content-Type": "multipart/form-data" } });
      toast.success("Final step complete! Waiting for Admin approval.");
      goTo(5);
    } catch (e: any) {
      toast.error(e.response?.data?.message || "Submission failed.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────
  if (isLoadingStatus) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
        <div className="relative w-20 h-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.6, ease: "linear" }}
            className="absolute inset-0 border-2 border-transparent border-t-gold-400 rounded-full"
          />
          <div className="absolute inset-3 rounded-full bg-gold-400/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gold-400" />
          </div>
        </div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.3em]">Checking Status…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto px-4 py-10 lg:py-16 space-y-14">

      {/* ── Page Header ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 240, damping: 24 }}
        className="text-center space-y-5"
      >
        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold-400/25 bg-gold-400/8 text-gold-400 text-[10px] font-black uppercase tracking-[0.3em]">
          <Zap className="w-3 h-3 fill-gold-400" />
          AI-Powered Verification
          <Sparkles className="w-3 h-3" />
        </div>
        <h1 className="text-4xl lg:text-6xl font-display font-black tracking-tight text-dark-900 dark:text-cream-50">
          Become a <span className="text-gold-400 italic">Verified</span> Seller
        </h1>
        <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
          Complete these steps to unlock your luxury boutique and start selling premium fashion across Pakistan.
        </p>
      </motion.div>

      {/* ── Stepper ─────────────────────────────────────────────────────── */}
      {step <= 4 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative max-w-xl mx-auto"
        >
          {/* Connecting track */}
          <div className="absolute top-5 left-6 right-6 h-px bg-gold-400/10 z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-gold-400 to-gold-600 origin-left"
              animate={{ scaleX: (step - 1) / 3 }}
              transition={{ type: "spring", stiffness: 120, damping: 20 }}
            />
          </div>

          <div className="relative z-10 flex justify-between">
            {STEPS.map(({ n, label, icon }) => {
              const done = step > n;
              const active = step === n;
              return (
                <div key={n} className="flex flex-col items-center gap-3">
                  <motion.div
                    animate={
                      done ? { backgroundColor: "rgba(212,175,55,1)", scale: 1 } :
                        active ? { backgroundColor: "rgba(212,175,55,0.2)", scale: 1.1 } :
                          { backgroundColor: "rgba(255,255,255,0.05)", scale: 1 }
                    }
                    transition={{ type: "spring", stiffness: 300, damping: 24 }}
                    className={`
                      w-10 h-10 rounded-2xl flex items-center justify-center
                      border transition-colors duration-300
                      ${done ? "border-gold-400 text-white shadow-gold" :
                        active ? "border-gold-400/60 text-gold-400" :
                          "border-white/10 text-gray-500"}
                    `}
                  >
                    {done ? <CheckCircle2 className="w-4 h-4" /> : icon}
                  </motion.div>
                  <span className={`text-[9px] font-black uppercase tracking-[0.22em] transition-colors ${active || done ? "text-gold-400" : "text-gray-500"}`}>
                    {label}
                  </span>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ── Main Card ───────────────────────────────────────────────────── */}
      <div className="relative">
        {/* Ambient glow behind card */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-4 opacity-50"
          style={{
            background: "radial-gradient(ellipse 70% 60% at 50% 20%, rgba(212,175,55,0.18) 0%, transparent 70%)",
            filter: "blur(24px)",
          }}
        />

        <div className="relative glass-ultra crystal-border rounded-[48px] overflow-hidden shadow-gold-3d">
          {/* Inner top shimmer */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.6) 35%, rgba(255,255,255,0.4) 50%, rgba(212,175,55,0.6) 65%, transparent)",
            }}
          />
          {/* Corner decoration glow */}
          <div aria-hidden className="absolute top-0 right-0 w-80 h-80 bg-gold-400/4 blur-[80px] rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="px-8 py-12 lg:px-16 lg:py-16 relative z-[1]">
              <AnimatePresence mode="wait" custom={direction}>

                {/* ── Step 1: Personal Info ──────────────────────────── */}
                {step === 1 && (
                  <motion.div
                    key="s1"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-10"
                  >
                    <StepHeading
                      tag="Step 1 of 4"
                      title="Personal Details"
                      sub="Ensure this matches exactly with your CNIC to avoid AI mismatch."
                    />

                    <motion.div variants={fieldVariants} initial="hidden" animate="visible" className="grid md:grid-cols-2 gap-6">
                      <motion.div variants={fieldItem}>
                        <FloatLabel label="Full Name (as per CNIC)" error={errors.fullName?.message}>
                          <input
                            {...register("fullName")}
                            placeholder=" "
                            className="peer w-full bg-transparent border-none outline-none pt-6 pb-2 px-1 text-sm font-bold text-dark-900 dark:text-cream-50"
                          />
                        </FloatLabel>
                      </motion.div>
                      <motion.div variants={fieldItem}>
                        <FloatLabel label="Phone Number">
                          {/* @ts-ignore */}
                          <input
                            defaultValue={user?.phone || ""}
                            placeholder=" "
                            className="peer w-full bg-transparent border-none outline-none pt-6 pb-2 px-1 text-sm font-bold text-dark-900 dark:text-cream-50"
                          />
                        </FloatLabel>
                      </motion.div>
                    </motion.div>

                    {/* Info strip */}
                    <div className="flex items-start gap-4 p-5 rounded-2xl bg-gold-400/5 border border-gold-400/15">
                      <Lock className="w-5 h-5 text-gold-400 shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-500 leading-relaxed">
                        Aapki personal information end-to-end encrypted hai aur sirf verification ke liye use hogi. Hum kabhi aapka data third parties ke saath share nahi karte.
                      </p>
                    </div>

                    <PrimaryButton onClick={() => goTo(2)} type="button">
                      Begin Identity Scan <ArrowRight className="w-5 h-5" />
                    </PrimaryButton>
                  </motion.div>
                )}

                {/* ── Step 2: CNIC Upload ────────────────────────────── */}
                {step === 2 && (
                  <motion.div
                    key="s2"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-10"
                  >
                    <StepHeading
                      tag="Step 2 of 4 — AI Scan"
                      title="Identity Document"
                      sub="Upload your original CNIC. ReVault AI will extract your data instantly."
                    />

                    <motion.div
                      variants={fieldVariants}
                      initial="hidden"
                      animate="visible"
                      className="grid md:grid-cols-2 gap-6"
                    >
                      <motion.div variants={fieldItem}>
                        <DocUpload label="CNIC Front Side" file={cnicFront} setFile={setCnicFront} icon={<Scan className="w-6 h-6" />} />
                      </motion.div>
                      <motion.div variants={fieldItem}>
                        <DocUpload label="CNIC Back Side" file={cnicBack} setFile={setCnicBack} icon={<Scan className="w-6 h-6" />} />
                      </motion.div>
                    </motion.div>

                    {/* AI notice */}
                    <div className="flex items-center gap-3 p-4 rounded-2xl border border-gold-400/20 bg-gold-400/5">
                      <div className="w-8 h-8 rounded-xl bg-gold-400/15 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-gold-400" />
                      </div>
                      <p className="text-xs text-gray-500">
                        <span className="font-bold text-gold-400">ReVault AI</span> will extract your CNIC number and cross-match your entered name. Images are deleted immediately after processing.
                      </p>
                    </div>

                    <div className="flex gap-4">
                      <GhostButton onClick={() => goTo(1)} type="button">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </GhostButton>
                      <PrimaryButton
                        onClick={handleAIIdentityScan}
                        type="button"
                        disabled={isAIProcessing || !cnicFront || !cnicBack}
                      >
                        {isAIProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Analyzing Document…
                          </>
                        ) : (
                          <>
                            Verify with ReVault AI
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </PrimaryButton>
                    </div>

                    {/* AI Processing overlay */}
                    <AnimatePresence>
                      {isAIProcessing && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="absolute inset-0 rounded-[48px] z-20 flex flex-col items-center justify-center gap-6 backdrop-blur-md bg-dark-950/60"
                        >
                          <div className="relative w-24 h-24">
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
                              className="absolute inset-0 border-2 border-transparent border-t-gold-400 border-r-gold-400/40 rounded-full"
                            />
                            <div className="absolute inset-3 rounded-full bg-gold-400/10 flex items-center justify-center">
                              <Scan className="w-8 h-8 text-gold-400" />
                            </div>
                          </div>
                          <div className="text-center space-y-2">
                            <p className="font-black text-white text-lg">Analyzing Document</p>
                            <p className="text-xs text-gold-400/70 uppercase tracking-[0.25em]">ReVault AI at work…</p>
                          </div>
                          <div className="flex gap-1.5">
                            {[0, 1, 2].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
                                transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
                                className="w-2 h-2 bg-gold-400 rounded-full"
                              />
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}

                {/* ── Step 3: Selfie ─────────────────────────────────── */}
                {step === 3 && (
                  <motion.div
                    key="s3"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-10"
                  >
                    <StepHeading
                      tag="Step 3 of 4"
                      title="Liveness Check"
                      sub="Please take a clear selfie. Our admin team will manually verify it for security."
                    />

                    {/* AI verified badge */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="flex items-center gap-5 p-5 rounded-3xl bg-emerald-500/6 border border-emerald-500/20"
                    >
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center shrink-0">
                        <BadgeCheck className="w-7 h-7 text-emerald-500" />
                      </div>
                      <div>
                        <p className="font-black text-emerald-500">Identity Verified</p>
                        <p className="text-xs text-emerald-600/70 dark:text-emerald-400/60 mt-0.5">
                          CNIC matched successfully {aiResult?.cnicNumber ? `· ${aiResult.cnicNumber}` : ""}
                        </p>
                      </div>
                    </motion.div>

                    <DocUpload
                      label="Clear Selfie Photo"
                      file={selfie}
                      setFile={setSelfie}
                      icon={<Camera className="w-6 h-6" />}
                      isLarge
                    />

                    {/* Tips */}
                    <div className="grid grid-cols-3 gap-3">
                      {["Good lighting", "Face centered", "No glasses"].map((tip) => (
                        <div key={tip} className="p-3 rounded-2xl bg-gold-400/5 border border-gold-400/10 text-center">
                          <p className="text-[10px] font-bold text-gold-400 uppercase tracking-wider">{tip}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <GhostButton onClick={() => goTo(2)} type="button">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </GhostButton>
                      <PrimaryButton onClick={() => goTo(4)} type="button" disabled={!selfie}>
                        Payout Setup <ArrowRight className="w-5 h-5" />
                      </PrimaryButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 4: Payout ─────────────────────────────────── */}
                {step === 4 && (
                  <motion.div
                    key="s4"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="space-y-10"
                  >
                    <StepHeading
                      tag="Step 4 of 4 — Final"
                      title="Payout Configuration"
                      sub="Where should we send your luxury earnings? All transactions are processed within 3 business days."
                    />

                    <motion.div variants={fieldVariants} initial="hidden" animate="visible" className="space-y-6">
                      {/* Payout method selector */}
                      <motion.div variants={fieldItem}>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em] mb-3">Payment Method</p>
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: "JAZZCASH", label: "JazzCash", icon: <Zap className="w-5 h-5" /> },
                            { value: "EASYPAISA", label: "EasyPaisa", icon: <Wallet className="w-5 h-5" /> },
                            { value: "BANK_TRANSFER", label: "Bank", icon: <Building2 className="w-5 h-5" /> },
                          ].map(({ value, label, icon }) => {
                            const selected = payoutMethod === value;
                            return (
                              <label
                                key={value}
                                className={`
                                  relative cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2
                                  ${selected
                                    ? "border-gold-400 bg-gold-400/10 text-gold-400"
                                    : "border-white/10 bg-white/3 text-gray-500 hover:border-gold-400/30"}
                                `}
                              >
                                <input {...register("payoutMethod")} type="radio" value={value} className="sr-only" />
                                {icon}
                                <span className="text-[10px] font-black uppercase tracking-wider">{label}</span>
                                {selected && (
                                  <motion.div
                                    layoutId="payout-selected"
                                    className="absolute inset-0 rounded-2xl border-2 border-gold-400 pointer-events-none"
                                    transition={{ type: "spring", stiffness: 340, damping: 28 }}
                                  />
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </motion.div>

                      <motion.div variants={fieldItem} className="grid md:grid-cols-2 gap-6">
                        <FloatLabel label="Account Holder Name" error={errors.accountName?.message}>
                          <input
                            {...register("accountName")}
                            placeholder=" "
                            className="peer w-full bg-transparent border-none outline-none pt-6 pb-2 px-1 text-sm font-bold text-dark-900 dark:text-cream-50"
                          />
                        </FloatLabel>
                        <FloatLabel label="Account Number / IBAN" error={errors.accountNumber?.message}>
                          <input
                            {...register("accountNumber")}
                            placeholder=" "
                            className="peer w-full bg-transparent border-none outline-none pt-6 pb-2 px-1 text-sm font-bold text-dark-900 dark:text-cream-50"
                          />
                        </FloatLabel>
                      </motion.div>

                      <AnimatePresence>
                        {payoutMethod === "BANK_TRANSFER" && (
                          <motion.div
                            variants={fieldItem}
                            initial="hidden"
                            animate="visible"
                            exit={{ opacity: 0, y: -8 }}
                          >
                            <FloatLabel label="Bank Name" error={errors.bankName?.message}>
                              <input
                                {...register("bankName")}
                                placeholder=" "
                                className="peer w-full bg-transparent border-none outline-none pt-6 pb-2 px-1 text-sm font-bold text-dark-900 dark:text-cream-50"
                              />
                            </FloatLabel>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>

                    <div className="flex gap-4">
                      <GhostButton onClick={() => goTo(3)} type="button">
                        <ArrowLeft className="w-4 h-4" /> Back
                      </GhostButton>
                      <PrimaryButton type="submit" disabled={isSubmitting}>
                        {isSubmitting
                          ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting…</>
                          : <><BadgeCheck className="w-5 h-5" /> Complete Application</>
                        }
                      </PrimaryButton>
                    </div>
                  </motion.div>
                )}

                {/* ── Step 5: Pending / Approved ─────────────────────── */}
                {step === 5 && (
                  <motion.div
                    key="s5"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col items-center text-center space-y-12 py-6"
                  >
                    {/* Animated status orb */}
                    {(() => {
                      const approved = vStatus === "APPROVED" || vStatus === "ACTIVE";
                      return (
                        <>
                          <div className="relative w-40 h-40">
                            {/* Outer pulse ring */}
                            <motion.div
                              animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0, 0.5] }}
                              transition={{ repeat: Infinity, duration: 2.8, ease: "easeInOut" }}
                              className={`absolute inset-0 rounded-full border-2 ${approved ? "border-emerald-500" : "border-gold-400"}`}
                            />
                            {/* Spinning dashed ring */}
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
                              className={`absolute inset-2 border-2 border-dashed rounded-full ${approved ? "border-emerald-500/40" : "border-gold-400/40"}`}
                            />
                            {/* Center icon */}
                            <div className={`absolute inset-6 rounded-full flex items-center justify-center ${approved ? "bg-emerald-500/10" : "bg-gold-400/10"}`}>
                              {approved
                                ? <BadgeCheck className="w-12 h-12 text-emerald-500" />
                                : <Clock className="w-12 h-12 text-gold-400" />
                              }
                            </div>
                          </div>

                          <div className="space-y-3 max-w-md">
                            <h2 className={`text-4xl font-display font-black ${approved ? "text-emerald-500" : "text-gold-400"}`}>
                              {approved ? "Boutique Verified!" : "Under Review"}
                            </h2>
                            <p className="text-sm text-gray-500 leading-relaxed">
                              {approved
                                ? "Congratulations! Your boutique is now live. You can list products and receive payments directly to your verified account."
                                : "ReVault AI matched your CNIC. Our team is now manually reviewing your selfie and documents."}
                            </p>
                          </div>

                          <div className="w-full max-w-lg space-y-4 text-left">
                            <StatusCard
                              icon={approved ? <BadgeCheck className="w-5 h-5 text-emerald-500" /> : <ShieldCheck className="w-5 h-5 text-gold-400" />}
                              title={approved ? "Store Now Live" : "Admin Review in Progress"}
                              sub={approved
                                ? "Aap ab products list kar saktay hain aur payments directly apne payout account mein receive kar saktay hain."
                                : "Hamari team aapki selfie aur CNIC images ko manually verify kar rahi hai. 1-2 business days lagte hain."
                              }
                              color={approved ? "emerald" : "gold"}
                            />
                            {!approved && (
                              <StatusCard
                                icon={<Lock className="w-5 h-5 text-blue-400" />}
                                title="Privacy & Security"
                                sub="Aapka data sirf legal purposes aur marketplace verification ke liye use kiya ja raha hai. Yeh frauds se bachnay aur customers ka trust maintain rakhnay ke liye zaroori hai."
                                color="blue"
                              />
                            )}
                          </div>

                          <PrimaryButton onClick={() => router.push("/seller/dashboard")} type="button">
                            <LayoutDashboard className="w-5 h-5" />
                            Go to Dashboard
                          </PrimaryButton>
                          <p className="text-[9px] text-gray-400 uppercase tracking-[0.25em] font-bold">
                            Email aur dashboard notification ke zariye update milegi
                          </p>
                        </>
                      );
                    })()}
                  </motion.div>
                )}

                {/* ── Step 6: Rejected ───────────────────────────────── */}
                {step === 6 && (
                  <motion.div
                    key="s6"
                    custom={direction}
                    variants={pageVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    className="flex flex-col items-center text-center space-y-12 py-6"
                  >
                    {/* Rejected orb */}
                    <div className="relative w-40 h-40">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ repeat: Infinity, duration: 3 }}
                        className="absolute inset-0 rounded-full border-2 border-red-500/40"
                      />
                      <div className="absolute inset-6 rounded-full bg-red-500/10 flex items-center justify-center">
                        <XCircle className="w-12 h-12 text-red-500" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h2 className="text-4xl font-display font-black text-red-500">Application Rejected</h2>
                      <p className="text-sm text-gray-500 italic">Admin ne aapke submission pe feedback diya hai.</p>
                    </div>

                    {/* Rejection reason card */}
                    <div className="w-full max-w-lg p-6 rounded-3xl bg-red-500/5 border border-red-500/20 text-left space-y-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <p className="text-[10px] font-black text-red-500 uppercase tracking-[0.25em]">Reason for Rejection</p>
                      </div>
                      <p className="text-sm text-dark-900 dark:text-cream-50 leading-relaxed font-medium">
                        {rejectionReason || "Please ensure your documents are clear and valid according to our platform standards."}
                      </p>
                    </div>

                    <div className="w-full max-w-lg">
                      <PrimaryButton onClick={handleRetry} type="button">
                        <RefreshCcw className="w-5 h-5" />
                        Retry Verification
                      </PrimaryButton>
                      <p className="text-[9px] text-gray-400 uppercase tracking-[0.25em] font-bold mt-4">
                        Aap apne documents dobara upload kar saktay hain
                      </p>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepHeading({ tag, title, sub }: { tag: string; title: string; sub: string }) {
  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-gold-400 uppercase tracking-[0.28em]">{tag}</p>
      <h2 className="text-3xl font-display font-black text-dark-900 dark:text-cream-50 leading-tight">{title}</h2>
      <p className="text-sm text-gray-500 leading-relaxed max-w-md">{sub}</p>
    </div>
  );
}

function FloatLabel({
  label, error, children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <div className="relative group">
        {/* Input container */}
        <div className="relative w-full rounded-2xl bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/12 px-5 py-1 focus-within:border-gold-400 transition-colors duration-200">
          {children}
          {/* Floating label - Must come AFTER children to use 'peer' */}
          <label className="
            absolute left-5 top-1/2 -translate-y-1/2
            text-xs font-bold text-gray-400 uppercase tracking-widest
            pointer-events-none transition-all duration-200
            peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:text-xs
            peer-[:not(:placeholder-shown)]:top-3 peer-[:not(:placeholder-shown)]:-translate-y-0 peer-[:not(:placeholder-shown)]:text-[9px]
            peer-focus:top-3 peer-focus:-translate-y-0 peer-focus:text-[9px] peer-focus:text-gold-400
          ">
            {label}
          </label>
        </div>
        {/* Focus glow */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none opacity-0 group-focus-within:opacity-100 transition-opacity"
          style={{ boxShadow: "0 0 0 4px rgba(212,175,55,0.08)" }}
        />
      </div>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[10px] text-red-500 font-bold pl-2"
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}

function DocUpload({
  label, file, setFile, isLarge, icon,
}: {
  label: string;
  file: File | null;
  setFile: (f: File) => void;
  isLarge?: boolean;
  icon: React.ReactNode;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)); }
  };

  return (
    <div className="space-y-3">
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.25em]">{label}</p>
      <label
        className={`
          relative group flex flex-col items-center justify-center gap-4 cursor-pointer overflow-hidden
          rounded-3xl border-2 border-dashed transition-all duration-300
          ${preview
            ? "border-gold-400/40 bg-gold-400/5"
            : "border-gold-400/15 bg-cream-50/50 dark:bg-dark-800/50 hover:border-gold-400/50 hover:bg-gold-400/5"
          }
          ${isLarge ? "h-72" : "h-52"}
        `}
      >
        <input type="file" accept="image/*" onChange={handleFile} className="hidden" />

        {preview ? (
          <>
            <Image src={preview} alt="Preview" fill className="object-cover rounded-3xl" />
            {/* Hover overlay to re-upload */}
            <div className="absolute inset-0 bg-dark-950/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-white">
                <Camera className="w-5 h-5" />
              </div>
              <p className="text-white text-xs font-bold">Change Photo</p>
            </div>
            {/* Success chip */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-emerald-500/90 backdrop-blur-md rounded-full text-white text-[10px] font-bold whitespace-nowrap shadow-lg">
              <CheckCircle2 className="w-3.5 h-3.5" /> Uploaded
            </div>
          </>
        ) : (
          <>
            {/* Dashed upload zone */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center"
            >
              {icon}
            </motion.div>
            <div className="text-center space-y-1">
              <p className="text-xs font-black text-dark-900 dark:text-cream-50 uppercase tracking-widest">
                Select Image
              </p>
              <p className="text-[10px] text-gray-400">PNG, JPG or WebP · Max 10MB</p>
            </div>
            {/* Animated dashed border */}
            <motion.div
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{ repeat: Infinity, duration: 2.5 }}
              className="absolute inset-3 rounded-2xl border border-dashed border-gold-400/20 pointer-events-none"
            />
          </>
        )}
      </label>
    </div>
  );
}

function PrimaryButton({
  children, onClick, type = "button", disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      whileHover={{ scale: disabled ? 1 : 1.015 }}
      type={type}
      onClick={onClick}
      disabled={disabled}
      className="w-full py-5 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-black tracking-wide shadow-gold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-shadow hover:shadow-[0_0_36px_rgba(212,175,55,0.45)] text-sm uppercase"
    >
      {children}
    </motion.button>
  );
}

function GhostButton({
  children, onClick, type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.97 }}
      type={type}
      onClick={onClick}
      className="flex-1 py-5 rounded-2xl font-bold text-sm text-gray-500 border-2 border-white/10 hover:border-gold-400/25 hover:text-gold-400 transition-all flex items-center justify-center gap-2"
    >
      {children}
    </motion.button>
  );
}

function StatusCard({
  icon, title, sub, color,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  color: "gold" | "emerald" | "blue";
}) {
  const bg = color === "emerald" ? "bg-emerald-500/5 border-emerald-500/20"
    : color === "blue" ? "bg-blue-500/5 border-blue-500/10"
      : "bg-gold-400/5 border-gold-400/15";
  return (
    <div className={`p-5 rounded-3xl border flex gap-4 ${bg}`}>
      <div className="shrink-0 mt-0.5">{icon}</div>
      <div className="space-y-1">
        <p className="text-sm font-black text-dark-900 dark:text-cream-50">{title}</p>
        <p className="text-[11px] text-gray-500 leading-relaxed">{sub}</p>
      </div>
    </div>
  );
}

// LayoutDashboard import for step 5 button
import { LayoutDashboard } from "lucide-react";