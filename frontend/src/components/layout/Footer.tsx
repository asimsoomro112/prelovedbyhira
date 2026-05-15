import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    shop: [
      { label: "Dresses", href: '/products?category=DRESSES' },
      { label: "Handbags", href: '/products?category=BAGS' },
      { label: 'Traditional', href: '/products?category=DRESSES' },
      { label: 'Shoes', href: '/products?category=SHOES' },
      { label: 'New Arrivals', href: '/products?sort=newest' },
    ],
    company: [
      { label: 'About Us', href: '/about' },
      { label: 'Sell on ReVault', href: '/seller/dashboard' },
      { label: 'Order History', href: '/customer/orders' },
      { label: 'My Profile', href: '/customer/profile' },
      { label: 'Contact', href: '/contact' },
    ],
    support: [
      { label: 'Help Center', href: '/help' },
      { label: 'Shipping Info', href: '/shipping' },
      { label: 'Returns & Refunds', href: '/returns' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  };

  return (
    <footer className="bg-brand-dark text-white mt-auto">
      {/* Newsletter */}
      <div className="border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold" style={{ fontFamily: 'var(--font-heading)' }}>Stay in the Loop ✨</h3>
              <p className="text-sm text-gray-400 mt-1">Get exclusive deals and new arrivals straight to your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input type="email" inputMode="email" autoComplete="email" placeholder="Enter your email" className="flex-1 md:w-72 px-4 py-3 rounded-lg bg-white/10 border border-white/10 text-base text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-gold transition-colors min-h-[48px]" id="newsletter-email" />
              <button className="btn-primary whitespace-nowrap min-h-[48px]" id="newsletter-submit">Subscribe</button>
            </div>
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block h-12 relative">
               <Image 
                 src="/logo-navbar.png" 
                 alt="ReVault" 
                 width={150} 
                 height={40} 
                 className="h-10 w-auto object-contain brightness-200" 
               />
            </Link>
            <p className="text-sm text-gray-300 mt-3 leading-relaxed">Pakistan&apos;s premier preloved fashion marketplace. Sustainable style, affordable luxury.</p>
            <div className="flex gap-4 mt-6">
              {['Instagram', 'Facebook', 'Twitter'].map((social) => (
                <a key={social} href={`https://${social.toLowerCase()}.com`} target="_blank" rel="noopener noreferrer" className="relative group">
                  <div className="w-12 h-12 rounded-2xl overflow-hidden border border-white/10 group-hover:border-gold-400 transition-all">
                    <Image src="/logo-social.jpg" alt={social} fill className="object-cover group-hover:scale-110 transition-transform" />
                  </div>
                  <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-all uppercase tracking-widest">{social}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title}>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-brand-gold mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-300 hover:text-gold-400 transition-colors py-1 inline-block min-h-[36px] flex items-center">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom))' }}>
          <p className="text-xs text-gray-500">© {currentYear} ReVault. All rights reserved.</p>
          <p className="text-xs text-gray-500 flex items-center gap-1">
            Made with <Heart className="w-3 h-3 text-brand-gold fill-brand-gold" /> in Pakistan
          </p>
        </div>
      </div>
    </footer>
  );
}
