"use client";

import { motion } from "framer-motion";
import { User, Mail, Phone, MapPin, ShieldCheck, ShoppingBag, Heart, Settings, ArrowRight, Camera } from "lucide-react";
import { useAuthStore } from "@/store/useAuthStore";
import Link from "next/link";

export default function ProfilePage() {
  const { user } = useAuthStore();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      {/* Header */}
      <div className="relative mb-12">
        <div className="h-48 bg-gradient-to-r from-gold-400 to-gold-600 rounded-[40px] shadow-gold opacity-20 absolute inset-0 -z-10" />
        <div className="pt-24 px-8 flex flex-col md:flex-row items-end gap-6">
           <div className="relative group">
              <div className="w-32 h-32 rounded-[40px] bg-white dark:bg-dark-900 border-4 border-white dark:border-dark-800 shadow-card flex items-center justify-center text-4xl font-bold text-gold-400">
                {user.name[0]}
              </div>
              <button className="absolute bottom-2 right-2 p-2 bg-gold-400 text-white rounded-xl shadow-gold hover:scale-110 transition-all opacity-0 group-hover:opacity-100">
                <Camera className="w-4 h-4" />
              </button>
           </div>
           <div className="flex-1 pb-2 space-y-1">
              <h1 className="text-3xl font-display font-bold">{user.name}</h1>
              <p className="text-gray-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" /> {user.role} Member
              </p>
           </div>
           <Link href="/customer/orders" className="mb-2 px-6 py-3 bg-white dark:bg-dark-800 rounded-pill border border-gold-400/20 text-sm font-bold shadow-soft hover:shadow-card transition-all">
             Account Settings
           </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* INFO COLUMN */}
        <div className="md:col-span-2 space-y-8">
           <section className="bg-white dark:bg-dark-900 rounded-[40px] p-10 shadow-card border border-gold-400/10 space-y-8">
              <h2 className="text-xl font-bold font-display border-b border-gold-400/10 pb-4">Personal Information</h2>
              <div className="grid sm:grid-cols-2 gap-8">
                 <InfoItem icon={<User />} label="Full Name" value={user.name} />
                 <InfoItem icon={<Mail />} label="Email Address" value={user.email} />
                 <InfoItem icon={<Phone />} label="Phone Number" value={user.phone || "+92 XXX XXXXXXX"} />
                 <InfoItem icon={<MapPin />} label="Shipping City" value="Lahore, Pakistan" />
              </div>
           </section>

           <div className="grid sm:grid-cols-2 gap-4">
              <QuickLink 
                icon={<ShoppingBag />} 
                title="Order History" 
                desc="Track and manage orders" 
                href="/customer/orders" 
                color="bg-gold-400" 
              />
              <QuickLink 
                icon={<Heart />} 
                title="My Wishlist" 
                desc="Items you saved for later" 
                href="/customer/wishlist" 
                color="bg-rose-500" 
              />
           </div>
        </div>

        {/* STATS COLUMN */}
        <div className="space-y-4">
           <div className="bg-dark-900 rounded-[40px] p-8 text-white space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/20 rounded-full blur-3xl" />
              <p className="text-[10px] font-bold text-gold-400 uppercase tracking-[4px]">Seller Center</p>
              <h3 className="text-xl font-display font-bold">Start Selling Your Wardrobe</h3>
              <p className="text-gray-400 text-sm">Join our elite community of sellers and turn your preloved items into cash.</p>
              <Link href="/seller/verification" className="w-full py-4 bg-gold-400 rounded-pill flex items-center justify-center font-bold text-sm shadow-gold">
                Setup Seller Profile <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
           </div>

           <div className="p-6 bg-emerald-500/5 rounded-[40px] border border-emerald-500/20">
              <p className="text-xs text-emerald-700 dark:text-emerald-400 leading-relaxed">
                 <span className="font-bold">Member Since:</span> {new Date().getFullYear()} <br />
                 Your account is secured with 256-bit encryption.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, label, value }: any) {
  return (
    <div className="space-y-1">
      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
        <span className="text-gold-400">{icon}</span> {label}
      </p>
      <p className="font-bold text-dark-900 dark:text-cream-50">{value}</p>
    </div>
  );
}

function QuickLink({ icon, title, desc, href, color }: any) {
  return (
    <Link href={href} className="group p-6 bg-white dark:bg-dark-800 rounded-[32px] shadow-soft border border-gold-400/10 hover:border-gold-400 transition-all">
       <div className={`w-12 h-12 rounded-2xl ${color} text-white flex items-center justify-center shadow-lg mb-4 group-hover:scale-110 transition-transform`}>
          {icon}
       </div>
       <h4 className="font-bold">{title}</h4>
       <p className="text-xs text-gray-500">{desc}</p>
    </Link>
  );
}
