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
  ShieldCheck,
  Clock,
  Layers
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
  stock: z.number().min(1, "Stock must be at least 1"),
  description: z.string().min(20, "Description must be at least 20 characters"),
  originalPacking: z.boolean().default(false),
  invoiceAvailable: z.boolean().default(false),
}).refine((data) => data.sellingPrice < data.originalPrice, {
  message: "Selling price must be less than original price",
  path: ["sellingPrice"],
});

type ProductFormValues = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const [step, setStep] = useState(1);
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [vStatus, setVStatus] = useState<string>("NONE");
  const router = useRouter();
  const { user } = useAuthStore();

  useEffect(() => {
    const checkVerification = async () => {
      try {
        const { data } = await api.get("/seller/verification/status");
        setVStatus(data.status);
      } catch (error: any) {
        setVStatus("NONE");
      } finally {
        setIsVerifying(false);
      }
    };
    checkVerification();
  }, []);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: { condition: "EXCELLENT", stock: 1, originalPacking: false, invoiceAvailable: false }
  });

  if (isVerifying) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-gold-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (vStatus !== "APPROVED" && vStatus !== "ACTIVE") {
    const isPending = vStatus === 'PENDING';
    const isRejected = vStatus === 'REJECTED';

    return (
      <div className="max-w-2xl mx-auto py-24 px-6 text-center space-y-8">
        <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto shadow-2xl ${isPending ? "bg-gold-400/10 text-gold-400" : "bg-red-500/10 text-red-500"}`}>
          {isPending ? <Clock className="w-12 h-12" /> : <ShieldCheck className="w-12 h-12" />}
        </div>
        <div className="space-y-4">
          <h1 className="text-4xl font-display font-bold">
            Verification <span className={isPending ? "text-gold-400" : "text-red-500"}>{isPending ? "Under Review." : "Required."}</span>
          </h1>
          <p className="text-gray-500 leading-relaxed">
            {isPending 
              ? "Hamari team aapke documents review kar rahi hai. Verification complete hone ke baad aap products list kar saken gay." 
              : "To maintain the exclusivity of PrelovedByHira, all sellers must verify their identity before listing items."}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button 
            onClick={() => router.push(isPending ? "/seller/dashboard" : "/seller/verification")}
            className="w-full sm:w-auto px-12 py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-105 transition-all"
          >
            {isPending ? "Back to Dashboard" : isRejected ? "Retry Verification" : "Verify Identity Now"}
          </button>
          {!isPending && (
            <button 
              onClick={() => router.push("/seller/dashboard")}
              className="w-full sm:w-auto px-12 py-5 border-2 border-gold-400/20 text-gray-500 rounded-pill font-bold hover:bg-gold-400/5 transition-all"
            >
              Back to Dashboard
            </button>
          )}
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

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast.error("Video size must be less than 50MB");
        return;
      }
      setVideo(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const removeVideo = () => {
    setVideo(null);
    setVideoPreview(null);
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
      if (video) {
        formData.append("video", video);
      }
      
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
    <div className="max-w-4xl mx-auto px-4 py-8 md:p-12 space-y-8 md:space-y-12">
      {/* Progress Header */}
      <div className="space-y-4 md:space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-fluid-section font-display font-bold">List Item</h1>
          <p className="text-[10px] md:text-sm text-gray-500 font-bold uppercase tracking-widest">Step {step} / 3</p>
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
                  <div key={i} className="relative aspect-square rounded-3xl overflow-hidden border border-gold-400/10 group bg-white dark:bg-dark-900">
                    <Image src={preview} alt="Preview" fill className="object-cover" />
                    {i === 0 && <div className="absolute top-2 left-2 bg-gold-400 text-white text-[8px] font-bold px-2 py-1 rounded-full shadow-gold z-10">COVER</div>}
                    <button 
                      type="button" 
                      onClick={() => removeImage(i)}
                      className="absolute top-2 right-2 w-9 h-9 md:w-8 md:h-8 rounded-full bg-red-500 text-white flex items-center justify-center lg:opacity-0 group-hover:opacity-100 transition-all z-20 shadow-lg active:scale-90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>

              {/* ✅ VIDEO UPLOAD SECTION */}
              <div className="space-y-4 pt-4">
                <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                  <Upload className="text-gold-400" /> Cinematic Preview (Video)
                </h2>
                <p className="text-gray-500 text-sm">Upload a short video (max 50MB) to show the luxury detail in motion.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {!videoPreview ? (
                    <label className="aspect-video rounded-[32px] border-2 border-dashed border-gold-400/30 flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-gold-400/5 hover:border-gold-400 transition-all group overflow-hidden">
                      <input type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
                      <div className="w-14 h-14 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Upload className="w-7 h-7" />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300">Upload Video</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">MP4, MOV up to 50MB</p>
                      </div>
                    </label>
                  ) : (
                    <div className="relative aspect-video rounded-[32px] overflow-hidden border border-gold-400/20 group bg-black">
                      <video src={videoPreview} className="w-full h-full object-cover" controls />
                      <button 
                        type="button" 
                        onClick={removeVideo}
                        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center lg:opacity-0 group-hover:opacity-100 transition-all z-20 shadow-xl active:scale-90"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button 
                  type="button" 
                  onClick={() => setStep(2)}
                  className="w-full sm:w-auto px-8 py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 active:scale-95 transition-all text-sm min-h-[52px]"
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Layers className="w-3 h-3" /> Stock Quantity
                  </label>
                  <input type="number" {...register("stock", { valueAsNumber: true })} className="add-input" min={1} />
                  {errors.stock && <p className="text-xs text-red-500">{errors.stock.message}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Size</label>
                  <input {...register("size")} placeholder="e.g. Medium, EU 38" className="add-input" />
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

                <div className="space-y-2 md:col-span-2">
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

                <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold">Original Packaging</span>
                      <span className="text-[10px] text-gray-400">Box, bag, or original tags included?</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setValue("originalPacking", !watch("originalPacking"))}
                      className={`w-12 h-6 rounded-full transition-all relative ${watch("originalPacking") ? "bg-gold-400" : "bg-gray-200 dark:bg-dark-800"}`}
                    >
                      <motion.div 
                        animate={{ x: watch("originalPacking") ? 24 : 4 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10">
                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-bold">Invoice Available</span>
                      <span className="text-[10px] text-gray-400">Original receipt or digital proof?</span>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setValue("invoiceAvailable", !watch("invoiceAvailable"))}
                      className={`w-12 h-6 rounded-full transition-all relative ${watch("invoiceAvailable") ? "bg-gold-400" : "bg-gray-200 dark:bg-dark-800"}`}
                    >
                      <motion.div 
                        animate={{ x: watch("invoiceAvailable") ? 24 : 4 }}
                        className="absolute top-1 left-0 w-4 h-4 bg-white rounded-full shadow-sm"
                      />
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-4">
                <button type="button" onClick={() => setStep(1)} className="w-full sm:w-auto px-8 py-4 text-gold-400 font-bold flex items-center justify-center gap-2 min-h-[48px] active:bg-gold-400/5 rounded-2xl transition-all">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button type="button" onClick={() => setStep(3)} className="w-full sm:w-auto px-8 py-4 bg-gold-400 text-white rounded-2xl font-bold shadow-gold flex items-center justify-center gap-2 min-h-[52px] active:scale-95 transition-all text-sm">
                  Next Step <ArrowRight className="w-5 h-5" />
                </button>
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
                         <p className="text-[10px] text-gray-400 uppercase font-bold">Stock</p>
                         <p className="text-sm font-bold text-gold-400">{watch("stock")} Units</p>
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

              <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-4 pt-4 pb-12">
                <button type="button" onClick={() => setStep(2)} className="w-full sm:w-auto px-8 py-4 text-gold-400 font-bold flex items-center justify-center gap-2 min-h-[48px] active:bg-gold-400/5 rounded-2xl transition-all">
                  <ArrowLeft className="w-5 h-5" /> Back
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full sm:w-auto px-12 py-5 bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold active:scale-95 transition-all flex items-center justify-center gap-3 min-h-[56px] text-base"
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
