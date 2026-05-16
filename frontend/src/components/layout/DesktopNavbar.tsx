"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import {
  Search, Heart, Bell, ShoppingBag, User, LogOut,
  LayoutDashboard, Settings, Package, ChevronDown,
  Sparkles, Command, Sun, Moon, Gem, TrendingUp,
  Star, Zap, X
} from "lucide-react";
import { useTheme } from "next-themes";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import NotificationBell from "./NotificationBell";

// ─── Framer variants ────────────────────────────────────────────────────────

const dropdownVariants = {
  hidden: {
    opacity: 0,
    y: -8,
    scale: 0.96,
    filter: "blur(4px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    filter: "blur(0px)",
    transition: {
      type: "spring",
      stiffness: 340,
      damping: 28,
      staggerChildren: 0.04,
    } as const,
  },
  exit: {
    opacity: 0,
    y: -6,
    scale: 0.97,
    filter: "blur(3px)",
    transition: { duration: 0.18, ease: "easeIn" } as const,
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  visible: { 
    opacity: 1, 
    x: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } as const 
  },
} as const;

// ─── Main Component ─────────────────────────────────────────────────────────

export default function DesktopNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [catOpen, setCatOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const catRef = useRef<HTMLDivElement>(null);

  const { user, logout } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();
  const { scrollY } = useScroll();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  // Close on route change / Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setCatOpen(false);
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, []);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!mounted) return null;

  return (
    <motion.nav
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 26, delay: 0.1 }}
      className="fixed top-4 left-0 right-0 z-[100] px-6 hidden lg:flex justify-center"
    >
      {/* Ambient glow behind navbar — 2026 liquid-glass style */}
      <div
        aria-hidden
        className={`
          pointer-events-none absolute inset-x-6 -inset-y-2 rounded-[40px]
          transition-opacity duration-700
          ${isScrolled ? "opacity-100" : "opacity-0"}
        `}
        style={{
          background:
            "radial-gradient(ellipse 70% 60% at 50% 0%, rgba(var(--gold-rgb,212,175,55),0.18) 0%, transparent 70%)",
          filter: "blur(18px)",
        }}
      />

      <div
        className={`
          w-full max-w-7xl h-20 rounded-[32px] flex items-center justify-between px-8
          transition-all duration-500 pointer-events-auto relative
          glass-ultra crystal-border shadow-gold-3d
          ${isScrolled ? "shadow-gold-3d" : ""}
        `}
      >
        {/* ── LOGO ─────────────────────────────────── */}
        <Link href="/" className="group shrink-0 relative flex items-center">
          <Image
            src="/logo-navbar.png"
            alt="ReVault Luxury"
            width={500}
            height={80}
            className="w-[200px] h-auto object-contain brightness-110 group-hover:scale-[1.02] transition-transform duration-300"
            priority
          />
        </Link>

        {/* ── CATEGORIES (click-based) ──────────────── */}
        <div className="flex items-center gap-8 ml-12" ref={catRef}>
          <div className="relative">
            <button
              onClick={() => setCatOpen((v) => !v)}
              className="flex items-center gap-2 text-dark-900 dark:text-cream-50 hover:text-gold-400 transition-all py-4"
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span className="text-xs font-bold uppercase tracking-widest">Categories</span>
              <motion.span
                animate={{ rotate: catOpen ? 180 : 0 }}
                transition={{ duration: 0.22, ease: "easeInOut" }}
              >
                <ChevronDown className="w-3 h-3 opacity-50" />
              </motion.span>
            </button>

            <AnimatePresence>
              {catOpen && (
                <motion.div
                  variants={dropdownVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="absolute top-[calc(100%+8px)] left-0 w-64 z-50"
                >
                  {/* Glow behind dropdown */}
                  <div
                    aria-hidden
                    className="absolute -inset-2 rounded-[36px] pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.22) 0%, transparent 70%)",
                      filter: "blur(12px)",
                    }}
                  />
                  <div className="relative glass-ultra crystal-border rounded-[28px] shadow-gold-3d p-3 bg-white dark:bg-dark-950/95 backdrop-blur-3xl">
                    <div className="space-y-0.5">
                      {[
                        { label: "Shadi & Formal", href: "/products?category=SHADI-WEAR", icon: <Gem className="w-4 h-4" /> },
                        { label: "Luxury Bridal", href: "/products?category=BRIDAL", icon: <Sparkles className="w-4 h-4" /> },
                        { label: "Kurtas & Shirts", href: "/products?category=KURTAS", icon: <TrendingUp className="w-4 h-4" /> },
                        { label: "Premium Watches", href: "/products?category=WATCHES", icon: <Star className="w-4 h-4" /> },
                        { label: "Designer Shoes", href: "/products?category=SHOES", icon: <Zap className="w-4 h-4" /> },
                        { label: "Bags & Jewelry", href: "/products?category=BAGS", icon: <ShoppingBag className="w-4 h-4" /> },
                      ].map((item) => (
                        <motion.div key={item.href} variants={itemVariants}>
                          <Link
                            href={item.href}
                            onClick={() => setCatOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-2xl text-dark-600 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/8 transition-all text-xs font-bold group/cat-item"
                          >
                            <span className="w-4 h-4 text-gold-400/70 group-hover/cat-item:text-gold-400 transition-colors">
                              {item.icon}
                            </span>
                            {item.label}
                          </Link>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── SEARCH CONSOLE ────────────────────────── */}
        <div className="flex items-center flex-1 max-w-sm mx-8">
          <div className="w-full relative group">
            {/* Liquid-glass ambient glow on focus */}
            <motion.div
              animate={{ opacity: searchFocused ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-gold-400/10 rounded-2xl blur-xl pointer-events-none"
            />
            <div
              className={`
                relative h-12 glass-crystal rounded-2xl flex items-center px-4 gap-3
                transition-all duration-300
                ${searchFocused
                  ? "crystal-border ring-1 ring-gold-400/40 shadow-[0_0_0_3px_rgba(212,175,55,0.08)]"
                  : "crystal-border"
                }
              `}
            >
              <Search className={`w-4 h-4 transition-colors duration-200 ${searchFocused ? "text-gold-400" : "text-gray-400"}`} />
              <input
                placeholder="Find your next look..."
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="bg-transparent border-none outline-none flex-1 text-sm font-medium placeholder:text-gray-500 text-dark-900 dark:text-cream-50"
              />
              <div className="flex items-center gap-1.5 px-2 py-1 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10">
                <Command className="w-3 h-3 text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400">K</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION ICONS ──────────────────────────── */}
        <div className="flex items-center gap-3 shrink-0">
          <NavAction
            icon={theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            label="Theme"
          />

          <Link href="/customer/wishlist">
            <NavAction icon={<Heart className="w-5 h-5" />} label="Wishlist" count={0} />
          </Link>

          <NotificationBell />

          <Link href="/cart" className="relative group">
            <div className="w-12 h-12 rounded-2xl glass-crystal crystal-border flex items-center justify-center hover:bg-gold-400 hover:text-white hover:border-gold-400 transition-all duration-300 group-hover:shadow-gold text-dark-900/70 dark:text-cream-50/70">
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <AnimatePresence>
                {items.length > 0 && (
                  <motion.span
                    key="cart-badge"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-gold"
                  >
                    {items.length}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>

          {/* ── PROFILE BUTTON + CLICK DROPDOWN ────── */}
          {user?.name ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                className="h-12 min-w-[48px] lg:min-w-[140px] flex items-center gap-3 p-1 pr-4 rounded-2xl bg-gold-400 hover:bg-gold-500 active:scale-[0.97] transition-all shadow-gold z-[101] select-none"
                aria-expanded={profileOpen}
                aria-haspopup="true"
              >
                {/* Avatar */}
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center font-bold overflow-hidden shrink-0 border border-white/20">
                  {user.avatar ? (
                    <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
                  ) : (
                    <span className="text-white text-lg">{user.name[0]?.toUpperCase() ?? "U"}</span>
                  )}
                </div>

                {/* Name + role */}
                <div className="hidden lg:block text-left">
                  <p className="text-[10px] font-black text-white truncate max-w-[80px] uppercase tracking-tighter leading-none">
                    {user.name.split(" ")[0]}
                  </p>
                  <p className="text-[7px] font-bold text-white/80 uppercase tracking-widest mt-1">
                    {user.role}
                  </p>
                </div>

                {/* Chevron — animates on open */}
                <motion.span
                  animate={{ rotate: profileOpen ? 180 : 0 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                  className="ml-auto"
                >
                  <ChevronDown className="w-3.5 h-3.5 text-white/80" />
                </motion.span>
              </button>

              {/* ── PROFILE DROPDOWN ─────────────────── */}
              <AnimatePresence>
                {profileOpen && (
                  <motion.div
                    variants={dropdownVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    className="absolute top-[calc(100%+10px)] right-0 w-64 z-[110]"
                  >
                    {/* Ambient glow */}
                    <div
                      aria-hidden
                      className="absolute -inset-2 rounded-[36px] pointer-events-none"
                      style={{
                        background:
                          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(212,175,55,0.26) 0%, transparent 70%)",
                        filter: "blur(14px)",
                      }}
                    />

                    <div className="relative glass-ultra crystal-border rounded-[28px] shadow-gold-3d p-4 overflow-hidden bg-white dark:bg-dark-950/95 backdrop-blur-3xl">
                      {/* Inner top shimmer — 2026 liquid glass detail */}
                      <div
                        aria-hidden
                        className="absolute top-0 left-0 right-0 h-px"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(212,175,55,0.6) 40%, rgba(255,255,255,0.4) 60%, transparent)",
                        }}
                      />

                      {/* User Info Header */}
                      <motion.div
                        variants={itemVariants}
                        className="px-4 py-3 mb-2 rounded-2xl bg-gold-400/8 border border-gold-400/15"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gold-400 flex items-center justify-center shrink-0 shadow-gold">
                            {user.avatar ? (
                              <img src={user.avatar} className="w-full h-full object-cover rounded-xl" alt={user.name} />
                            ) : (
                              <span className="text-white font-bold text-sm">{user.name[0]?.toUpperCase()}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-black text-gold-400 uppercase tracking-[0.18em] leading-none mb-1">
                              Signed in as
                            </p>
                            <p className="text-xs font-bold text-dark-900 dark:text-cream-50 truncate">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </motion.div>

                      {/* Menu Items */}
                      <div className="space-y-0.5">
                        {[
                          {
                            icon: <LayoutDashboard className="w-4 h-4" />,
                            label: "Control Panel",
                            href: user.role === "ADMIN"
                              ? "/admin/dashboard"
                              : user.role === "SELLER"
                                ? "/seller/dashboard"
                                : "/customer/dashboard",
                          },
                          {
                            icon: <Package className="w-4 h-4" />,
                            label: "My Orders",
                            href: user.role === "SELLER" ? "/seller/orders" : "/customer/orders",
                          },
                          {
                            icon: <Settings className="w-4 h-4" />,
                            label: "Account Settings",
                            href: user.role === "SELLER" ? "/seller/profile" : "/customer/profile",
                          },
                        ].map((item) => (
                          <motion.div key={item.href} variants={itemVariants}>
                            <Link
                              href={item.href}
                              onClick={() => setProfileOpen(false)}
                              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-dark-600 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/8 transition-all text-sm font-bold group/dd-link"
                            >
                              <span className="text-gold-400/60 group-hover/dd-link:text-gold-400 transition-colors">
                                {item.icon}
                              </span>
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>

                      {/* Divider */}
                      <motion.div
                        variants={itemVariants}
                        className="h-px my-3"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 50%, transparent)",
                        }}
                      />

                      {/* Sign Out */}
                      <motion.div variants={itemVariants}>
                        <button
                          onClick={() => {
                            setProfileOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/8 transition-all text-sm font-bold group/signout"
                        >
                          <LogOut className="w-4 h-4 group-hover/signout:-translate-x-0.5 transition-transform" />
                          Sign Out
                        </button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="h-12 px-8 flex items-center bg-gradient-to-r from-gold-400 to-gold-600 text-white rounded-2xl font-bold shadow-gold hover:scale-[1.03] hover:shadow-[0_0_24px_rgba(212,175,55,0.5)] active:scale-95 transition-all text-xs whitespace-nowrap"
            >
              Connect Account
            </Link>
          )}
        </div>
      </div>
    </motion.nav>
  );
}

// ─── Sub-components ─────────────────────────────────────────────────────────

function NavAction({
  icon,
  count,
  hasPulse,
  onClick,
  label,
}: {
  icon: React.ReactNode;
  count?: number;
  hasPulse?: boolean;
  onClick?: () => void;
  label?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="relative w-12 h-12 rounded-2xl glass-ultra crystal-border flex items-center justify-center hover:bg-gold-400/10 hover:border-gold-400/30 transition-all duration-300 group"
    >
      <div className="group-hover:scale-110 transition-transform text-dark-900/70 dark:text-cream-50/70 group-hover:text-gold-400">
        {icon}
      </div>
      {(count ?? 0) > 0 && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full shadow-gold" />
      )}
      {hasPulse && (
        <span className="absolute top-2 right-2 w-2 h-2 bg-gold-400 rounded-full animate-ping" />
      )}
    </button>
  );
}