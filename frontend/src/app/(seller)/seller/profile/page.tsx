"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  ShieldCheck, 
  MapPin, 
  Settings,
  Camera,
  Star,
  ShoppingBag,
  ExternalLink,
  CheckCircle2,
  Loader2,
  X,
  Save
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

export default function SellerProfilePage() {
  const { user, setUser } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit form state
  const [editData, setEditData] = useState({
    boutiqueBio: "",
    phone: "",
    city: ""
  });

  // Image states
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get("/seller/profile");
      setProfile(data);
      setEditData({
        boutiqueBio: data.boutiqueBio || "",
        phone: data.phone || "",
        city: data.city || ""
      });
      setAvatarPreview(data.avatar || "");
      setCoverPreview(data.coverImage || "");
    } catch (error) {
      toast.error("Failed to load seller identity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formData = new FormData();
      formData.append("boutiqueBio", editData.boutiqueBio || "");
      formData.append("phone", editData.phone || "");
      formData.append("city", editData.city || "");
      
      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("coverImage", coverFile);

      const { data } = await api.put("/seller/profile", formData);

      toast.success("Identity Vault updated! ✨");
      
      if (data.avatar) {
        setUser({ ...user!, avatar: data.avatar });
      }

      setIsEditModalOpen(false);
      setAvatarFile(null);
      setCoverFile(null);
      fetchProfile();
    } catch (error: any) {
      console.error("Profile Update Error:", error);
      const msg = error.response?.data?.message || error.response?.data?.error || "Failed to update profile.";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    const preview = URL.createObjectURL(file);
    if (type === 'avatar') {
      setAvatarFile(file);
      setAvatarPreview(preview);
    } else {
      setCoverFile(file);
      setCoverPreview(preview);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
         <Loader2 className="w-12 h-12 text-gold-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-12 space-y-12">
      {/* Header Profile Section */}
      <div className="relative">
        <div className="h-48 lg:h-64 rounded-[40px] bg-gradient-to-br from-gold-400/20 to-gold-600/30 overflow-hidden border border-gold-400/10 relative">
           {coverPreview ? (
             <Image 
               src={coverPreview} 
               alt="Cover" 
               fill 
               sizes="(max-width: 1024px) 100vw, 1024px"
               priority
               className="object-cover" 
             />
           ) : (
             <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
           )}
           <button 
             onClick={() => document.getElementById('cover-upload')?.click()}
             className="absolute top-4 right-4 px-4 py-2 bg-black/40 backdrop-blur-md text-white rounded-xl text-xs font-bold border border-white/10 hover:bg-black/60 transition-all flex items-center gap-2"
           >
             <Camera className="w-4 h-4" /> Change Cover
           </button>
           <input type="file" id="cover-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'cover')} />
        </div>
        
        <div className="px-8 lg:px-12 -mt-20 flex flex-col lg:flex-row items-end gap-8">
           <div className="relative group">
              <div className="w-40 h-40 rounded-[40px] bg-white p-1 shadow-card border border-gold-400/20 overflow-hidden">
                 <div className="w-full h-full rounded-[38px] bg-gold-400 flex items-center justify-center text-white text-5xl font-bold shadow-inner relative overflow-hidden">
                    {avatarPreview || profile?.avatar || profile?.profileImage || profile?.profilePicture ? (
                       <Image 
                         src={avatarPreview || profile?.avatar || profile?.profileImage || profile?.profilePicture} 
                         alt={profile?.name || ""} 
                         fill 
                         sizes="160px"
                         className="object-cover" 
                       />
                    ) : (
                       <span className="uppercase">{profile?.name?.[0] || 'V'}</span>
                    )}
                 </div>
              </div>
              <button 
                onClick={() => document.getElementById('avatar-upload')?.click()}
                className="absolute bottom-2 right-2 w-10 h-10 bg-dark-900 text-white rounded-2xl flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
              >
                 <Camera className="w-5 h-5" />
              </button>
              <input type="file" id="avatar-upload" hidden accept="image/*" onChange={(e) => handleImageChange(e, 'avatar')} />
           </div>
           
           <div className="flex-1 pb-4 space-y-2">
              <div className="flex items-center gap-3">
                 <h1 className="text-4xl font-display font-bold text-dark-900 dark:text-cream-50">{profile?.name || user?.name}</h1>
                 {profile?.verificationStatus === 'ACTIVE' || profile?.verificationStatus === 'APPROVED' && (
                   <div className="px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-pill text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-emerald-500/20">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Boutique
                   </div>
                 )}
              </div>
              <p className="text-gray-500 font-medium">Boutique Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Joining Process'}</p>
           </div>

           <div className="pb-4 flex gap-4">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-3 bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl font-bold text-sm hover:bg-gold-400/5 transition-all flex items-center gap-2"
              >
                 <Settings className="w-4 h-4" /> Edit Profile
              </button>
              <button className="px-6 py-3 bg-gold-400 text-white rounded-2xl font-bold text-sm shadow-gold hover:scale-105 transition-all flex items-center gap-2">
                 View Public Store <ExternalLink className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-12">
         {/* Sidebar Details */}
         <div className="space-y-8">
            <div className="bg-white dark:bg-dark-900 p-8 rounded-[40px] shadow-card border border-gold-400/5 space-y-6">
               <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-gold-400/10 pb-4">Contact Intelligence</h3>
               <div className="space-y-4">
                  <DetailItem icon={Mail} label="Email Address" value={profile?.email || user?.email || "Not set"} />
                  <DetailItem icon={Phone} label="Contact Phone" value={profile?.phone || "Verification Pending"} />
                  <DetailItem icon={MapPin} label="Base Location" value={profile?.city || "Update in Settings"} />
                  <DetailItem icon={Calendar} label="Member Status" value={profile?.verificationStatus?.replace('_', ' ') || "PENDING"} />
               </div>
            </div>

            <div className="bg-white dark:bg-gradient-to-br dark:from-dark-900 dark:to-black p-8 rounded-[40px] shadow-card dark:shadow-2xl space-y-6 text-dark-900 dark:text-white border border-gold-400/10 dark:border-white/5 transition-all">
               <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gold-400/10 dark:border-white/10 pb-4">Performance Insights</h3>
               <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                     <p className="text-2xl font-accent font-bold text-gold-400">{profile?.rating || "5.0"}</p>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Global Rating</p>
                  </div>
                  <div className="space-y-1">
                     <p className="text-2xl font-accent font-bold text-gold-400">{profile?.totalEarnings ? `₨ ${profile.totalEarnings.toLocaleString()}` : "₨ 0"}</p>
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Total Earnings</p>
                  </div>
               </div>
            </div>
         </div>

         {/* Main Bio/Settings Area */}
         <div className="lg:col-span-2 space-y-12">
            <div className="space-y-6">
               <h3 className="text-2xl font-display font-bold flex items-center gap-3 text-dark-900 dark:text-cream-50">
                  <User className="text-gold-400" /> Boutique Bio
               </h3>
               <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-lg italic">
                  {profile?.boutiqueBio ? `"${profile.boutiqueBio}"` : "No bio provided yet. Update your profile to tell customers about your luxury collection."}
               </p>
            </div>

            <div className="space-y-8">
               <h3 className="text-2xl font-display font-bold flex items-center gap-3">
                  <ShieldCheck className="text-gold-400" /> Identity Verification
               </h3>
               <div className={`p-8 border rounded-[40px] flex items-center justify-between ${
                 profile?.verificationStatus === 'APPROVED' 
                 ? 'bg-emerald-500/5 border-emerald-500/20' 
                 : profile?.verificationStatus === 'REJECTED'
                 ? 'bg-red-500/5 border-red-500/20'
                 : 'bg-amber-500/5 border-amber-500/20'
               }`}>
                  <div className="flex items-center gap-6">
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
                       profile?.verificationStatus === 'APPROVED' 
                       ? 'bg-emerald-500/20 text-emerald-500' 
                       : profile?.verificationStatus === 'REJECTED'
                       ? 'bg-red-500/20 text-red-500'
                       : 'bg-amber-500/20 text-amber-500'
                     }`}>
                        {profile?.verificationStatus === 'REJECTED' ? <X className="w-8 h-8" /> : <ShieldCheck className="w-8 h-8" />}
                     </div>
                     <div>
                        <p className={`text-lg font-bold ${profile?.verificationStatus === 'REJECTED' ? 'text-red-500' : ''}`}>
                          {profile?.verificationStatus === 'APPROVED' ? 'Identity Verified' : 
                           profile?.verificationStatus === 'REJECTED' ? 'Verification Rejected' : 
                           'Verification In Progress'}
                        </p>
                        <p className="text-sm text-gray-500 max-w-md">
                          {profile?.verificationStatus === 'APPROVED' 
                            ? 'Your CNIC and Payout accounts have been successfully vetted.' 
                            : profile?.verificationStatus === 'REJECTED'
                            ? `Rejected: ${profile.rejectionReason || "Please re-upload clear documents."}`
                            : 'Our team is currently reviewing your uploaded identity documents.'}
                        </p>
                     </div>
                  </div>
                  {profile?.verificationStatus === 'APPROVED' ? (
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  ) : profile?.verificationStatus === 'REJECTED' ? (
                    <Link href="/seller/verification" className="px-6 py-2 bg-red-500 text-white rounded-xl text-xs font-bold shadow-lg hover:bg-red-600 transition-all">
                       Fix Now
                    </Link>
                  ) : null}
               </div>
            </div>
         </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsEditModalOpen(false)} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white dark:bg-dark-900 rounded-[48px] p-10 z-[110] shadow-2xl border border-gold-400/10">
               <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-display font-bold">Edit Boutique Profile</h2>
                  <button onClick={() => setIsEditModalOpen(false)} className="p-3 bg-gold-400/10 text-gold-400 rounded-2xl">
                    <X className="w-6 h-6" />
                  </button>
               </div>

               <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Boutique Bio</label>
                    <textarea 
                      value={editData.boutiqueBio}
                      onChange={(e) => setEditData({...editData, boutiqueBio: e.target.value})}
                      placeholder="Tell buyers about your boutique..."
                      className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-3xl px-6 py-4 text-sm font-medium outline-none focus:border-gold-400 transition-all resize-none"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Contact Phone</label>
                        <input 
                          type="text" 
                          value={editData.phone}
                          onChange={(e) => setEditData({...editData, phone: e.target.value})}
                          placeholder="e.g. 0300 1234567"
                          className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-gold-400 transition-all"
                        />
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">City</label>
                        <input 
                          type="text" 
                          value={editData.city}
                          onChange={(e) => setEditData({...editData, city: e.target.value})}
                          placeholder="e.g. Karachi"
                          className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 text-sm font-medium outline-none focus:border-gold-400 transition-all"
                        />
                     </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-5 bg-gold-400 text-white rounded-pill font-bold shadow-gold hover:scale-[1.02] transition-all flex items-center justify-center gap-3 text-lg"
                  >
                    {isSaving ? <Loader2 className="animate-spin w-6 h-6" /> : <Save className="w-6 h-6" />}
                    {isSaving ? "Saving Identity..." : "Synchronize Profile"}
                  </button>
               </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 bg-gold-400/10 text-gold-400 rounded-xl flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-sm font-bold truncate max-w-[180px]">{value || "N/A"}</p>
      </div>
    </div>
  );
}
