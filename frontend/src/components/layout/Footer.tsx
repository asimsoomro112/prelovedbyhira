"use client";

import Link from 'next/link';
import Image from 'next/image';
import { Heart, Camera, Globe, Send, MessageCircle, Mail, ArrowUpRight } from 'lucide-react';
import { useChatStore } from '@/store/useChatStore';

export function Footer() {
  const currentYear = new Date().getFullYear();
  const openChat = useChatStore(state => state.openChat);

  const footerLinks = {
    "The Collection": [
      { label: "Bags & Handbags", href: '/products?category=Bags' },
      { label: "Luxury Watches", href: '/products?category=Watches' },
      { label: 'Jewelry & Accessories', href: '/products?category=Jewelry' },
      { label: 'Designer Shoes', href: '/products?category=Shoes' },
      { label: 'New Arrivals', href: '/products?sortBy=newest' },
    ],
    "The Ecosystem": [
      { label: 'Sell on ReVault', href: '/seller/dashboard' },
      { label: 'Escrow Protection', href: '/legal/escrow' },
      { label: 'Order Tracking', href: '/customer/dashboard' },
      { label: 'Sustainability', href: '/customer/dashboard' },
      { label: 'About ReVault', href: '/legal/privacy' },
    ],
    "Legal Vault": [
      { label: 'Terms of Service', href: '/legal/terms' },
      { label: 'Privacy Policy', href: '/legal/privacy' },
      { label: 'Escrow Policy', href: '/legal/escrow' },
      { label: 'Help Center', href: '/legal/escrow' },
    ],
  };

  return (
    <footer className="bg-black text-white relative overflow-hidden mt-20">
      {/* Decorative Gradient */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gold-400/50 to-transparent" />
      
      {/* Newsletter / Stay in the Vault */}
      <div className="border-b border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <div className="max-w-md text-center lg:text-left">
              <h3 className="text-3xl md:text-4xl font-display font-bold leading-tight">Stay in the <span className="text-gold-400 italic">Vault.</span></h3>
              <p className="text-gray-500 mt-4 text-sm tracking-wide">Be the first to secure rare preloved treasures and exclusive luxury insights.</p>
            </div>
            <div className="flex w-full lg:w-auto gap-3 glass-ultra p-2 rounded-2xl border border-white/10 group focus-within:border-gold-400 transition-all">
              <input 
                type="email" 
                placeholder="Secure your invite (email)..." 
                className="bg-transparent border-none outline-none flex-1 px-4 py-3 text-sm placeholder:text-gray-600 focus:ring-0" 
              />
              <button className="px-8 py-3 bg-gold-400 text-white rounded-xl font-bold text-sm shadow-gold hover:scale-105 active:scale-95 transition-all">
                Join Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Links */}
      <div className="max-w-7xl mx-auto px-6 py-20 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-16 lg:gap-10">
          {/* Brand Pillar */}
          <div className="lg:col-span-2 space-y-8">
            <Link href="/" className="group flex items-center">
              <Image 
                src="/logo-navbar.png" 
                alt="ReVault Luxury" 
                width={300} 
                height={60}
                className="w-[220px] h-auto object-contain brightness-125 group-hover:scale-[1.02] transition-transform"
                priority
              />
            </Link>
            <p className="text-gray-500 text-sm leading-relaxed max-w-sm">
              Pakistan's first and most secure luxury preloved marketplace. We leverage AI-verified authentication and secure escrow protection to redefine high-end fashion trade.
            </p>
            <div className="flex gap-4">
              <SocialIcon icon={<Camera size={20} />} href="#" label="Instagram" />
              <SocialIcon icon={<Send size={20} />} href="#" label="Twitter" />
              <SocialIcon icon={<Mail size={20} />} href="mailto:care@revault.pk" label="Email" />
              <button 
                onClick={openChat}
                className="w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 border border-gold-400/20 flex items-center justify-center hover:bg-gold-400 hover:text-white transition-all shadow-gold-sm"
                title="Live Support"
              >
                <MessageCircle size={20} />
              </button>
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="space-y-6">
              <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold-400/80">{title}</h4>
              <ul className="space-y-4">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-gray-400 hover:text-gold-400 transition-all flex items-center gap-2 group">
                      <span className="group-hover:translate-x-1 transition-transform">{link.label}</span>
                      <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Legal Bottom Bar */}
      <div className="border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
            <span>© {currentYear} ReVault Global</span>
            <span className="mx-2">•</span>
            <span>Neural Trade Protected</span>
          </div>
          
          <div className="flex items-center gap-6">
            <Image src="/logo-navbar.png" alt="ReVault" width={80} height={20} className="opacity-20 grayscale brightness-200" />
            <div className="flex items-center gap-1.5 text-xs text-gray-600">
               Made with <Heart className="w-3 h-3 text-red-500 fill-red-500" /> in Pakistan
            </div>
          </div>
        </div>
      </div>

      {/* Decorative mesh background */}
      <div className="absolute inset-0 bg-[url('/mesh-grid.png')] opacity-[0.03] pointer-events-none" />
    </footer>
  );
}

function SocialIcon({ icon, href, label }: any) {
  return (
    <Link 
      href={href} 
      aria-label={label}
      className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:border-gold-400 hover:text-gold-400 transition-all group overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gold-400 opacity-0 group-hover:opacity-10 transition-opacity" />
      {icon}
    </Link>
  );
}
