"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Camera, 
  Upload, 
  X, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  Star,
  ShoppingBag,
  Tag,
  AlertCircle,
  FileText,
  ShieldCheck
} from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import api from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/useAuthStore";

const productSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  brand: z.string().min(2, "Brand is required"),
  category: z.string().min(1, "Category is required"),
  originalPrice: z.number().min(1, "Original price is required"),
  sellingPrice: z.number().min(1, "Selling price is required"),
  condition: z.enum(["EXCELLENT", "GOOD", "FAIR", "POOR"]),
  defects: z.string().optional(),
  usageDuration: z.string().min(1, "Usage duration is required"),
  size: z.string().min(1, "Size is required"),
  description: z.string().min(20, "Description must be at least 20 characters"),
}).refine((data) => data.sellingPrice < data.originalPrice, {
  message: "Selling price must be less than original price",
  path: ["sellingPrice"],
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isVerified, setIsVerified] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data } = await api.get("/seller/verification/status");
        if (data.status === "ACTIVE") {
          setIsVerified(true);
        } else {
          setIsVerified(false);
        }
      } catch (error: any) {
        // If there's any error fetching status, we assume they aren't verified
        setIsVerified(false);
      } finally {
        setIsVerifying(false);
      }
    };
    checkVerification();
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { condition: "EXCELLENT" }
  });

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isVerified) {
    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-8">
        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto shadow-2xl">
          <ShieldCheck className="w-12 h-12" />
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold">Verification <span className="text-gold-400">Required.</span></h1>
          <p className="text-gray-500 leading-relaxed">
            To maintain the exclusivity of PrelovedByHira, all sellers must verify their identity. 
            Once verified, you can list unlimited luxury items in our vault.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => router.push("/seller/verification")}
            className="w-full sm:w-auto px-12 py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all"
          >
            Verify Identity Now
          </button>
          <button 
            onClick={() => router.push("/seller/dashboard")}
            className="w-full sm:w-auto px-12 py-5 border-2 border-gold-400/20 text-gray-500 rounded-pill font-bold hover:bg-gold-400/5 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (images.length + files.length > 8) {
      toast.error("Maximum 8 images allowed");
      return;
    }

    const newImages = [...images, ...files];
    const newPreviews = [...previews, ...files.map(f => URL.createObjectURL(f))];
    
    setImages(newImages);
    setPreviews(newPreviews);
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const onSubmit = async (values: ProductFormValues) => {
    if (images.length === 0) {
      toast.error("Please upload at least one image");
      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();
      images.forEach(img => formData.append("images", img));
      
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          formData.append(key, val.toString());
        }
      });

      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      toast.success("Product published successfully! It will be live after admin review.");
      router.push("/seller/dashboard");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to publish product.");
    } finally {
      setIsLoading(false);
    }
  };

  const onInvalid = (errors: any) => {
    console.error("Form Validation Errors:", errors);
    const firstError = Object.values(errors)[0] as any;
    toast.error(firstError?.message || "Please check all fields and try again.");
  };

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-12 space-y-12">
      {/* Progress Header */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-display font-bold">List New Item</h1>
          <p className="text-sm text-gray-500 font-bold uppercase tracking-widest">Step {step} of 3</p>
        </div>
        <div className="h-2 bg-gold-400/10 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "33%" }}
            animate={{ width: `${(step / 3) * 100}%` }}
            className="h-full bg-gradient-to-r from-gold-400 to-gold-600 rounded-full"
          />
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-12">
        <AnimatePresence mode="wait">
          {/* STEP 1: IMAGES */}
          {step === 1 && (
            <motion.div 
              key="step1" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                  <Camera className="text-gold-400" /> Upload Photos
                </h2>
                <p className="text-gray-500 text-sm">Add up to 8 high-quality photos. Show all angles and any defects.</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <label className="aspect-square rounded-3xl border-2 border-dashed border-gold-400/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gold-400/5 hover:border-gold-400 transition-all group">
                  <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-gray-400">Add Photos</span>
                </label>

                {previews.map((preview, i) => (
                  <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border border-gold-400/10 group">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    {i === 0 && <div className="absolute top-2 left-2 bg-gold-400 text-white text-[8px] font-bold px-2 py-1 rounded-pill shadow-gold">COVER</div>}
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="px-8 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center gap-2"
                >
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS */}
          {step === 2 && (
            <motion.div 
              key="step2" 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }} 
              exit={{ opacity: 0, x: -20 }}
              className="space-y-12"
            >
               <div className="space-y-4">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                  <FileText className="text-gold-400" /> Item Details
                </h2>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Product Title</label>
                  <input {...register("title")} placeholder="e.g. Vintage Zara Silk Dress" className="add-input" />
                  {errors.title && <p className="text-xs text-red-500">{errors.title.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Brand</label>
                  <input {...register("brand")} placeholder="e.g. Khaadi, Zara" className="add-input" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Category</label>
                  <select {...register("category")} className="add-input">
                    <option value="">Select Category</option>
                    <option value="DRESSES">Dresses & Traditional</option>
                    <option value="TOPS">Tops & Western</option>
                    <option value="BAGS">Handbags</option>
                    <option value="SHOES">Shoes</option>
                    <option value="JEWELRY">Jewelry</option>
                    <option value="MORE">Other Accessories</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Original Price (Rs.)</label>
                  <input type="number" {...register("originalPrice", { valueAsNumber: true })} className="add-input" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Selling Price (Rs.)</label>
                  <input type="number" {...register("sellingPrice", { valueAsNumber: true })} className="add-input" />
                  {errors.sellingPrice && <p className="text-xs text-red-500">{errors.sellingPrice.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Condition</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {["EXCELLENT", "GOOD", "FAIR", "POOR"].map(cond => (
                      <button 
                        key={cond} 
                        type="button" 
                        onClick={() => setValue("condition", cond as any)}
                        className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${watch("condition") === cond ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10"}`}
                      >
                        <Star className={`w-5 h-5 ${watch("condition") === cond ? "fill-gold-400 text-gold-400" : "text-gray-300"}`} />
                        <span className="text-[10px] font-bold uppercase tracking-tighter">{cond}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size</label>
                  <input {...register("size")} placeholder="e.g. Medium, EU 38" className="add-input" />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Usage Duration</label>
                  <select {...register("usageDuration")} className="add-input">
                    <option value="Brand New">Brand New</option>
                    <option value="Worn Once">Worn Once</option>
                    <option value="Worn 2-3 Times">Worn 2-3 Times</option>
                    <option value="Worn Regularly">Worn Regularly</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <textarea {...register("description")} rows={4} className="add-input resize-none" placeholder="Describe the fit, fabric, and any details..." />
                  {errors.description && <p className="text-xs text-red-500">{errors.description.message}</p>}
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Defects (Optional)</label>
                  <textarea {...register("defects")} rows={2} className="add-input resize-none border-amber-500/20 bg-amber-500/5" placeholder="Mention any marks, stains, or missing buttons..." />
                </div>
              </div>

              <div className="flex justify-between">
                <button type="button" onClick={() => setStep(1)} className="px-8 py-4 text-gold-400 font-bold flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back</button>
                <button type="button" onClick={() => setStep(3)} className="px-8 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold flex items-center gap-2">Next Step <ArrowRight className="w-5 h-5" /></button>
              </div>
            </motion.div>
          )}

          {/* STEP 3: REVIEW */}
          {step === 3 && (
            <motion.div 
              key="step3" 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              className="space-y-12"
            >
               <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-gold-400/10 text-gold-400 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-display font-bold">Review & Publish</h2>
                <p className="text-gray-500">Almost there! Review your item before it goes live.</p>
              </div>

              <div className="grid md:grid-cols-2 gap-12 bg-white dark:bg-dark-900 p-8 rounded-[40px] shadow-card border border-gold-400/5">
                 <div className="aspect-[3/4] relative rounded-3xl overflow-hidden border border-gold-400/10">
                   <Image src={previews[0]} alt="Cover" fill className="object-cover" />
                 </div>
                 <div className="space-y-6">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-gold-400 uppercase tracking-widest">{watch("brand")}</p>
                      <h3 className="text-2xl font-display font-bold">{watch("title")}</h3>
                      <div className="flex items-center gap-4 pt-2">
                        <p className="text-3xl font-accent font-bold text-gold-400">Rs. {watch("sellingPrice")}</p>
                        <p className="text-gray-400 line-through">Rs. {watch("originalPrice")}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-cream-50 dark:bg-dark-800 rounded-2xl">
                         <p className="text-[10px] text-gray-400 uppercase font-bold">Condition</p>
                         <p className="text-sm font-bold text-gold-400">{watch("condition")}</p>
                      </div>
                      <div className="p-4 bg-cream-50 dark:bg-dark-800 rounded-2xl">
                         <p className="text-[10px] text-gray-400 uppercase font-bold">Size</p>
                         <p className="text-sm font-bold text-gold-400">{watch("size")}</p>
                      </div>
                    </div>

                    <div className="p-6 bg-gold-400/5 border border-gold-400/20 rounded-3xl">
                       <div className="flex items-center gap-2 text-gold-400 mb-3">
                         <AlertCircle className="w-5 h-5" />
                         <span className="text-xs font-bold uppercase tracking-widest">Platform Fee</span>
                       </div>
                       <p className="text-xs text-gray-500 leading-relaxed">
                         PrelovedByHira takes a 20% platform fee. You will receive <span className="font-bold text-gold-400">Rs. {Math.round(watch("sellingPrice") * 0.8)}</span> from this sale.
                       </p>
                    </div>
                 </div>
              </div>

              <div className="flex justify-between items-center">
                <button type="button" onClick={() => setStep(2)} className="px-8 py-4 text-gold-400 font-bold flex items-center gap-2"><ArrowLeft className="w-5 h-5" /> Back</button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="px-12 py-5 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-pill font-bold shadow-gold hover:scale-105 active:scale-95 transition-all flex items-center gap-3"
                >
                  {isLoading ? "Publishing..." : "Publish Product 🚀"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>
    </div>
  );
}
