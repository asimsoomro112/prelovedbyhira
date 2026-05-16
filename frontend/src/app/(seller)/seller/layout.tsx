"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import SellerBottomNavbar from "@/components/layout/SellerBottomNavbar";
import {
  LayoutDashboard, Package, PlusCircle, ShoppingBag,
  Wallet, History, User, ShieldCheck, Home, LogOut,
  ChevronRight, Menu, X, Bell, Search, Sparkles,
  Loader2, MessageCircle, BadgeCheck, Clock, AlertTriangle,
  ArrowLeftRight, Zap, Settings,
} from "lucide-react";
import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import NotificationDropdown from "@/components/NotificationDropdown";
import ThemeToggle from "@/components/ThemeToggle";
import Image from "next/image";
import api from "@/lib/api";

// ─── Nav items ───────────────────────────────────────────────────────────────

const NAV_SECTIONS = [
  {
    label: "Storefront",
    items: [
      { icon: Home, label: "Explore Shop", href: "/products" },
      { icon: LayoutDashboard, label: "Dashboard", href: "/seller/dashboard" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { icon: Package, label: "My Products", href: "/seller/products" },
      { icon: PlusCircle, label: "Add Product", href: "/seller/add-product" },
      { icon: ShoppingBag, label: "My Sales", href: "/seller/orders" },
      { icon: History, label: "My Purchases", href: "/customer/orders" },
    ],
  },
  {
    label: "Finance",
    items: [
      { icon: Sparkles, label: "Promotions", href: "/seller/promotions" },
      { icon: Wallet, label: "Earnings", href: "/seller/earnings" },
      { icon: History, label: "Payouts", href: "/seller/payouts" },
    ],
  },
  {
    label: "Account",
    items: [
      { icon: User, label: "Store Profile", href: "/seller/profile" },
      { icon: MessageCircle, label: "Live Support", onClick: () => useChatStore.getState().openChat() },
      { icon: ShieldCheck, label: "Verification", href: "/seller/verification" },
    ],
  },
];

// ─── Framer variants ──────────────────────────────────────────────────────────

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22 } },
  exit: { opacity: 0, transition: { duration: 0.18 } },
} as const;

const mobileAsideVariants = {
  hidden: { x: "-100%", opacity: 0.6 },
  visible: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
  exit: { x: "-100%", opacity: 0.6, transition: { type: "spring", stiffness: 300, damping: 30 } },
} as const;

const navSectionVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
} as const;

const navItemVariants = {
  hidden: { opacity: 0, x: -12, filter: "blur(3px)" },
  visible: { opacity: 1, x: 0, filter: "blur(0px)", transition: { type: "spring", stiffness: 280, damping: 22 } },
} as const;

// ─── Verification badge helper ────────────────────────────────────────────────

function VerificationBadge({ status }: { status: string }) {
  const approved = status === "APPROVED" || status === "ACTIVE";
  const rejected = status === "REJECTED";
  const pending = status === "PENDING";

  const cfg = approved ? { color: "text-emerald-400", bg: "bg-emerald-500/10", icon: <BadgeCheck className="w-3 h-3" />, label: "Verified" }
    : rejected ? { color: "text-red-400", bg: "bg-red-500/10", icon: <AlertTriangle className="w-3 h-3" />, label: "Rejected" }
      : pending ? { color: "text-amber-400", bg: "bg-amber-500/10", icon: <Clock className="w-3 h-3" />, label: "Pending" }
        : { color: "text-orange-400", bg: "bg-orange-500/10", icon: <Zap className="w-3 h-3" />, label: "Required" };

  return (
    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${cfg.color} ${cfg.bg}`}>
      {cfg.icon}
      {cfg.label}
    </div>
  );
}

// ─── Main Layout ──────────────────────────────────────────────────────────────

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, isAuthenticated } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<string>("REQUIRED");
  const [isChecking, setIsChecking] = useState(true);
  const [mounted, setMounted] = useState(false);

  // Auth guard
  useEffect(() => {
    setMounted(true);
    const t = setTimeout(() => {
      if (!isAuthenticated) {
        router.push("/login");
      } else if (user?.role !== "SELLER" && user?.role !== "ADMIN" && pathname !== "/seller/verification") {
        router.push("/customer/dashboard");
      } else {
        setIsChecking(false);
      }
    }, 100);
    return () => clearTimeout(t);
  }, [isAuthenticated, router, user]);

  // Scroll listener
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [pathname]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "unset";
    return () => { document.body.style.overflow = "unset"; };
  }, [isMobileMenuOpen]);

  // Escape key
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setIsMobileMenuOpen(false); };
    document.addEventListener("keydown", fn);
    return () => document.removeEventListener("keydown", fn);
  }, []);

  // Fetch verification status
  useEffect(() => {
    if (!user || isChecking) return;
    api.get("/seller/profile")
      .then(({ data }) => setVerificationStatus(data.verificationStatus || "REQUIRED"))
      .catch((err) => {
        if (err.response?.status !== 401 && err.response?.status !== 403) {
          console.error("Failed to fetch seller status");
        }
      });
  }, [user, isChecking]);

  const handleLogout = () => { logout(); window.location.href = "/login"; };

  const currentPage = pathname.split("/").pop()?.replace(/-/g, " ") || "dashboard";

  // ── Loading screen ────────────────────────────────────────────────────────
  if (!mounted || isChecking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-cream-50 dark:bg-black">
        <div className="relative w-24 h-24">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            className="absolute inset-0 border-2 border-transparent border-t-gold-400 border-r-gold-400/30 rounded-full"
          />
          <div className="absolute inset-4 rounded-full bg-gold-400/10 flex items-center justify-center">
            <ShieldCheck className="w-6 h-6 text-gold-400" />
          </div>
        </div>
        <p className="text-[10px] font-black text-gold-400 uppercase tracking-[0.35em]">
          Verifying Merchant Credentials…
        </p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-cream-50 dark:bg-[#080808] text-dark-900 dark:text-white selection:bg-gold-400 selection:text-white">

      {/* ── MOBILE OVERLAY + SIDEBAR ────────────────────────────────────── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              variants={backdropVariants}
              initial="hidden" animate="visible" exit="exit"
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/65 backdrop-blur-md z-[100] lg:hidden"
              aria-hidden="true"
            />

            <motion.aside
              variants={mobileAsideVariants}
              initial="hidden" animate="visible" exit="exit"
              className="fixed left-0 top-0 bottom-0 w-[82%] max-w-[320px] z-[110] flex flex-col lg:hidden overflow-hidden bg-white dark:bg-[#0a0a0a] border-r border-gold-400/10"
              role="dialog"
              aria-modal="true"
              aria-label="Seller navigation"
            >
              <SidebarInner
                user={user}
                pathname={pathname}
                verificationStatus={verificationStatus}
                handleLogout={handleLogout}
                router={router}
                onClose={() => setIsMobileMenuOpen(false)}
                isMobile
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── DESKTOP SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="hidden lg:flex w-72 flex-col fixed inset-y-0 z-[60] overflow-hidden bg-white dark:bg-[#0a0a0a] border-r border-gold-400/10">
        {/* Sidebar ambient glow */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 right-0 h-48 opacity-40"
          style={{
            background: "radial-gradient(ellipse 80% 100% at 50% 0%, rgba(212,175,55,0.25) 0%, transparent 70%)",
            filter: "blur(20px)",
          }}
        />
        <SidebarInner
          user={user}
          pathname={pathname}
          verificationStatus={verificationStatus}
          handleLogout={handleLogout}
          router={router}
        />
      {/* ── MAIN CONTENT AREA ───────────────────────────────────────────── */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-screen relative">

        {/* Background orbs — Hidden on mobile for performance optimization */}
        <div aria-hidden className="pointer-events-none fixed top-[-15%] right-[-8%] w-[600px] h-[600px] bg-gold-400/4 blur-[130px] rounded-full hidden lg:block" />
        <div aria-hidden className="pointer-events-none fixed bottom-[-10%] left-[10%] w-[400px] h-[400px] bg-gold-400/3 blur-[100px] rounded-full hidden lg:block" />

        {/* ── CINEMATIC HEADER ──────────────────────────────────────────── */}
        <header
          className={`
            fixed top-0 right-0 z-[100] flex items-center justify-between px-4 lg:px-10
            transition-all duration-400
            w-full lg:w-[calc(100%-288px)]
            ${scrolled
              ? "h-16 lg:h-18 glass-ultra crystal-border border-l-0 border-r-0 border-t-0 shadow-gold-3d"
              : "h-16 lg:h-24 bg-transparent"
            }
          `}
        >
          {/* Left: hamburger + breadcrumb */}
          <div className="flex items-center gap-4">
            <motion.button
              whileTap={{ scale: 0.88 }}
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden w-12 h-12 rounded-2xl bg-gold-400/10 text-gold-400 flex items-center justify-center"
              aria-label="Open navigation"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            {/* Desktop breadcrumb */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.3em]">Vault Portal</span>
              <ChevronRight className="w-3 h-3 text-gold-400/60" />
              <span className="text-sm font-black text-dark-900 dark:text-white capitalize">{currentPage}</span>
            </div>
          </div>

          {/* Center: mobile logo */}
          <div className="lg:hidden absolute left-1/2 -translate-x-1/2">
            <Link href="/">
              <Image
                src="/logo-navbar.png"
                alt="ReVault"
                width={400}
                height={56}
                className="w-[140px] h-auto object-contain brightness-110"
                priority
              />
            </Link>
          </div>

          {/* Right: search + actions */}
          <div className="flex items-center gap-3">
            {/* Search — desktop only */}
            <div className="hidden md:flex items-center gap-3 glass-crystal crystal-border rounded-2xl px-4 h-10 w-56 focus-within:ring-1 focus-within:ring-gold-400/40 transition-all">
              <Search className="w-4 h-4 text-gray-400 shrink-0" />
              <input
                placeholder="Search listings…"
                className="bg-transparent border-none outline-none text-xs font-bold placeholder:text-gray-400 flex-1 text-dark-900 dark:text-cream-50"
              />
            </div>

            {/* Switch to Buying — desktop */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                localStorage.setItem(`home_mode_${user?.id}`, "CUSTOMER");
                router.push("/");
              }}
              className="hidden md:flex items-center gap-2 px-4 h-10 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] transition-all"
            >
              <ArrowLeftRight className="w-4 h-4" />
              Buyer Mode
            </motion.button>

            <ThemeToggle />
            <NotificationDropdown />
          </div>
        </header>

        {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
        <div className="flex-1 p-4 lg:p-12 relative z-10 pt-20 lg:pt-32 pb-28 lg:pb-14">
          {children}
        </div>

        {/* ── FOOTER ────────────────────────────────────────────────────── */}
        <footer className="px-6 py-5 border-t border-gold-400/8 flex flex-col md:flex-row items-center justify-between gap-3 opacity-50">
          <p className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">
            © 2026 ReVault · Merchant Vault
          </p>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <motion.div
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="w-1.5 h-1.5 bg-emerald-400 rounded-full"
              />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">Node Sync Active</span>
            </div>
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-400">v3.4.0-Stable</span>
          </div>
        </footer>
      </main>

      <SellerBottomNavbar />
    </div>
  );
}

// ─── Shared Sidebar Content (Desktop + Mobile) ────────────────────────────────

function SidebarInner({
  user, pathname, verificationStatus, handleLogout, router, onClose, isMobile,
}: {
  user: any;
  pathname: string;
  verificationStatus: string;
  handleLogout: () => void;
  router: any;
  onClose?: () => void;
  isMobile?: boolean;
}) {
  return (
    <div className="flex flex-col h-full relative">

      {/* Inner shimmer at top */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-px pointer-events-none z-10"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.5) 40%, rgba(255,255,255,0.3) 60%, transparent)",
        }}
      />

      {/* ── Logo + Close ─────────────────────────────────────────────── */}
      <div className="relative flex items-center justify-between px-8 py-7 flex-shrink-0">
        <Link href="/" onClick={onClose}>
          <Image
            src="/logo-navbar.png"
            alt="ReVault Luxury"
            width={500}
            height={80}
            className="w-[168px] h-auto object-contain brightness-110 hover:scale-[1.02] transition-transform"
            priority
          />
        </Link>
        {isMobile && (
          <motion.button
            whileTap={{ scale: 0.88 }}
            onClick={onClose}
            className="w-10 h-10 rounded-xl glass-crystal crystal-border flex items-center justify-center text-dark-900/60 dark:text-cream-50/60 hover:text-gold-400 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* ── Nav Sections ─────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 space-y-5 scrollbar-none">
        {NAV_SECTIONS.map((section) => (
          <motion.div
            key={section.label}
            variants={navSectionVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Section label */}
            <p className="text-[9px] font-black text-gray-400/60 uppercase tracking-[0.32em] px-3 mb-2">
              {section.label}
            </p>

            <div className="space-y-0.5">
              {section.items.map((item: any) => {
                const Icon = item.icon;
                const isActive = item.href
                  ? pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                  : false;

                const inner = (
                  <div
                    className={`
                      relative flex items-center gap-3 px-3 py-3 rounded-2xl transition-all group/item
                      ${isActive
                        ? "bg-gold-400 text-white shadow-gold"
                        : "text-gray-500 dark:text-gray-400 hover:text-gold-400 hover:bg-gold-400/8"
                      }
                    `}
                  >
                    {/* Active side bar */}
                    {isActive && (
                      <motion.div
                        layoutId="sidebar-active-bar"
                        className="absolute left-[-16px] w-1.5 h-7 bg-gold-400 rounded-r-full"
                        style={{ boxShadow: "0 0 12px rgba(212,175,55,0.6)" }}
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}

                    {/* Icon container */}
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center shrink-0 transition-all
                      ${isActive ? "bg-white/20" : "bg-gold-400/8 group-hover/item:bg-gold-400/15"}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>

                    <span className="text-xs font-bold tracking-tight">{item.label}</span>

                    {isActive && (
                      <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-70" />
                    )}
                  </div>
                );

                return item.href ? (
                  <motion.div key={item.href} variants={navItemVariants}>
                    <Link href={item.href} onClick={onClose}>{inner}</Link>
                  </motion.div>
                ) : (
                  <motion.div key={item.label} variants={navItemVariants}>
                    <button
                      onClick={() => { item.onClick?.(); onClose?.(); }}
                      className="w-full text-left"
                    >
                      {inner}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </nav>

      {/* ── User Profile Card ─────────────────────────────────────────── */}
      <div className="flex-shrink-0 m-4 mt-2">
        {/* Ambient glow behind card */}
        <div
          aria-hidden
          className="absolute inset-x-4 bottom-4 h-32 opacity-50 pointer-events-none"
          style={{
            background: "radial-gradient(ellipse 70% 80% at 50% 100%, rgba(212,175,55,0.2) 0%, transparent 70%)",
            filter: "blur(16px)",
          }}
        />

        <div className="relative glass-ultra crystal-border rounded-[28px] p-5 space-y-4 overflow-hidden">
          {/* Inner shimmer */}
          <div
            aria-hidden
            className="absolute top-0 left-0 right-0 h-px pointer-events-none"
            style={{
              background: "linear-gradient(90deg, transparent, rgba(212,175,55,0.45) 40%, rgba(255,255,255,0.25) 60%, transparent)",
            }}
          />

          {/* Avatar + info */}
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-xl bg-gold-400 flex items-center justify-center overflow-hidden shrink-0 border border-gold-400/30 shadow-gold">
              {user?.avatar ? (
                <Image src={user.avatar} alt={user.name} fill sizes="44px" className="object-cover" />
              ) : (
                <span className="text-white font-black text-sm">{user?.name?.[0]?.toUpperCase()}</span>
              )}
              {/* Online dot */}
              <span className="absolute bottom-0.5 right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-dark-950" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-black text-dark-900 dark:text-cream-50 truncate">{user?.name}</p>
              <VerificationBadge status={verificationStatus} />
            </div>
          </div>

          {/* Switch to Buyer Mode */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              localStorage.setItem(`home_mode_${user?.id}`, "CUSTOMER");
              router.push("/");
              onClose?.();
            }}
            className="w-full h-10 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] transition-all"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            Switch to Buyer Mode
          </motion.button>

          {/* Logout */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleLogout}
            className="w-full h-10 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" />
            Secure Logout
          </motion.button>
        </div>
      </div>
    </div>
  );
}