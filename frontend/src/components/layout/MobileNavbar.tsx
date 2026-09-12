"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	Bell,
	ChevronRight,
	Gem,
	Grid,
	Heart,
	Home,
	LayoutDashboard,
	LogOut,
	Menu,
	Moon,
	Package,
	Plus,
	Search,
	Settings,
	ShoppingBag,
	Sparkles,
	Star,
	Sun,
	TrendingUp,
	User,
	X,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

// ─── Framer variants ─────────────────────────────────────────────────────────

const backdropVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.25 } },
	exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

const sidebarVariants = {
	hidden: { x: "-100%", opacity: 0.6 },
	visible: {
		x: 0,
		opacity: 1,
		transition: { type: "spring", stiffness: 300, damping: 30 } as const,
	},
	exit: {
		x: "-100%",
		opacity: 0.6,
		transition: { type: "spring", stiffness: 300, damping: 30 } as const,
	},
} as const;

const listContainerVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.055, delayChildren: 0.18 } as const,
	},
} as const;

const listItemVariants = {
	hidden: { opacity: 0, x: -14, filter: "blur(4px)" },
	visible: {
		opacity: 1,
		x: 0,
		filter: "blur(0px)",
		transition: { type: "spring", stiffness: 280, damping: 22 } as const,
	},
} as const;

const searchVariants = {
	hidden: { opacity: 0, y: -16, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: "spring", stiffness: 320, damping: 26 } as const,
	},
	exit: {
		opacity: 0,
		y: -12,
		scale: 0.97,
		transition: { duration: 0.16 } as const,
	},
} as const;

// ─── Main Component ──────────────────────────────────────────────────────────

export default function MobileNavbar() {
	const [isOpen, setIsOpen] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");
	const [mounted, setMounted] = useState(false);

	const { user, logout } = useAuthStore();
	const { items } = useCartStore();
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const router = useRouter();

	useEffect(() => setMounted(true), []);

	// Lock body scroll when sidebar open
	useEffect(() => {
		document.body.style.overflow = isOpen ? "hidden" : "unset";
		return () => {
			document.body.style.overflow = "unset";
		};
	}, [isOpen]);

	// Close on route change
	useEffect(() => {
		setIsOpen(false);
		setIsSearchOpen(false);
	}, []);

	// Escape key closes everything
	useEffect(() => {
		const fn = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsOpen(false);
				setIsSearchOpen(false);
			}
		};
		document.addEventListener("keydown", fn);
		return () => document.removeEventListener("keydown", fn);
	}, []);

	const handleSearch = useCallback(
		(e: React.FormEvent) => {
			e.preventDefault();
			if (!searchQuery.trim()) return;
			router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
			setIsSearchOpen(false);
			setSearchQuery("");
		},
		[searchQuery, router],
	);

	if (!mounted) return null;

	const dashboardHref =
		user?.role === "ADMIN"
			? "/admin/dashboard"
			: user?.role === "SELLER"
				? "/seller/dashboard"
				: "/customer/dashboard";

	return (
		<>
			{/* ── TOP HEADER ────────────────────────────────────── */}
			<nav
				className="lg:hidden fixed top-0 left-0 right-0 z-[110] px-3 py-2"
				aria-label="Mobile navigation"
			>
				{/* Ambient gold glow — 2026 liquid-glass signature */}
				<div
					aria-hidden
					className="pointer-events-none absolute inset-x-0 -top-2 h-20 opacity-60"
					style={{
						background:
							"radial-gradient(ellipse 60% 80% at 50% 0%, rgba(212,175,55,0.2) 0%, transparent 70%)",
						filter: "blur(10px)",
					}}
				/>

				<div className="relative glass-ultra crystal-border rounded-2xl h-14 flex items-center justify-between px-3 shadow-gold-3d overflow-hidden">
					{/* Inner top shimmer */}
					<div
						aria-hidden
						className="absolute top-0 left-0 right-0 h-px pointer-events-none"
						style={{
							background:
								"linear-gradient(90deg, transparent, rgba(212,175,55,0.55) 40%, rgba(255,255,255,0.35) 60%, transparent)",
						}}
					/>

					{/* Hamburger */}
					<motion.button
						whileTap={{ scale: 0.88 }}
						onClick={() => setIsOpen(true)}
						className="w-12 h-12 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center"
						aria-label="Open navigation menu"
						aria-expanded={isOpen}
					>
						<Menu className="w-5 h-5" />
					</motion.button>

					{/* Logo */}
					<Link href="/" className="flex items-center">
						<Image
							src="/logo-navbar.png"
							alt="ReVault"
							width={400}
							height={56}
							className="w-[168px] h-auto object-contain brightness-110"
							priority
						/>
					</Link>

					{/* Right actions */}
					<div className="flex items-center gap-1">
						<motion.button
							whileTap={{ scale: 0.88 }}
							onClick={() => setIsSearchOpen(true)}
							className="w-12 h-12 rounded-xl flex items-center justify-center text-dark-900/60 dark:text-cream-50/60 hover:text-gold-400 transition-colors"
							aria-label="Open search"
						>
							<Search className="w-5 h-5" />
						</motion.button>

						<Link
							href="/cart"
							className="relative w-12 h-12 rounded-xl bg-gold-400/10 text-gold-400 flex items-center justify-center"
							aria-label={`Shopping cart, ${items.length} items`}
						>
							<motion.div whileTap={{ scale: 0.88 }}>
								<ShoppingBag className="w-5 h-5" />
							</motion.div>
							<AnimatePresence>
								{items.length > 0 && (
									<motion.span
										key="badge"
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										exit={{ scale: 0 }}
										className="absolute -top-1 -right-1 w-5 h-5 bg-gold-400 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white dark:border-dark-950 shadow-gold"
									>
										{items.length > 9 ? "9+" : items.length}
									</motion.span>
								)}
							</AnimatePresence>
						</Link>
					</div>
				</div>
			</nav>

			{/* ── SEARCH OVERLAY ────────────────────────────────── */}
			<AnimatePresence>
				{isSearchOpen && (
					<motion.div
						variants={searchVariants}
						initial="hidden"
						animate="visible"
						exit="exit"
						className="lg:hidden fixed top-0 left-0 right-0 z-[120] px-3 py-2"
					>
						<form
							onSubmit={handleSearch}
							className="glass-ultra crystal-border rounded-2xl h-14 flex items-center px-4 gap-3 shadow-gold-3d"
						>
							<Search className="w-5 h-5 text-gold-400 shrink-0" />
							<input
								type="search"
								inputMode="search"
								placeholder="Search preloved luxury..."
								value={searchQuery}
								onChange={(e) => setSearchQuery(e.target.value)}
								className="bg-transparent border-none outline-none flex-1 text-base font-bold text-dark-900 dark:text-cream-50 placeholder:text-gray-400 min-h-[44px]"
								aria-label="Search products"
							/>
							<motion.button
								whileTap={{ scale: 0.88 }}
								type="button"
								onClick={() => {
									setIsSearchOpen(false);
									setSearchQuery("");
								}}
								className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-400 hover:text-gold-400 transition-colors"
								aria-label="Close search"
							>
								<X className="w-5 h-5" />
							</motion.button>
						</form>
					</motion.div>
				)}
			</AnimatePresence>

			{/* ── SIDEBAR DRAWER ────────────────────────────────── */}
			<AnimatePresence>
				{isOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							variants={backdropVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							onClick={() => setIsOpen(false)}
							className="fixed inset-0 bg-black/65 backdrop-blur-md z-[120]"
							aria-hidden="true"
						/>

						{/* Sidebar */}
						<motion.aside
							variants={sidebarVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="fixed top-0 bottom-0 left-0 w-[85%] max-w-sm z-[130] flex flex-col overflow-hidden bg-white dark:bg-dark-950 shadow-2xl"
							role="dialog"
							aria-modal="true"
							aria-label="Navigation menu"
						>
							{/* ── Profile Header ─────────────────────────── */}
							<div
								className="relative flex-shrink-0 p-6 overflow-hidden"
								style={{
									background:
										"linear-gradient(135deg, rgba(212,175,55,0.14) 0%, transparent 60%)",
									borderBottom: "1px solid rgba(255,255,255,0.08)",
								}}
							>
								{/* Gold ambient glow inside sidebar header */}
								<div
									aria-hidden
									className="pointer-events-none absolute -top-6 -left-6 w-40 h-40 opacity-30"
									style={{
										background:
											"radial-gradient(circle, rgba(212,175,55,0.6) 0%, transparent 70%)",
										filter: "blur(20px)",
									}}
								/>
								{/* Inner shimmer line */}
								<div
									aria-hidden
									className="absolute top-0 left-0 right-0 h-px"
									style={{
										background:
											"linear-gradient(90deg, transparent, rgba(212,175,55,0.5) 40%, rgba(255,255,255,0.3) 60%, transparent)",
									}}
								/>

								{/* Top row: logo + close */}
								<div className="relative flex items-center justify-between mb-6">
									<Image
										src="/logo-navbar.png"
										alt="ReVault"
										width={400}
										height={48}
										className="w-[148px] h-auto object-contain brightness-110"
									/>
									<motion.button
										whileTap={{ scale: 0.88 }}
										onClick={() => setIsOpen(false)}
										className="w-10 h-10 rounded-xl glass-crystal crystal-border flex items-center justify-center text-dark-900/60 dark:text-cream-50/60 hover:text-gold-400 transition-colors"
										aria-label="Close menu"
									>
										<X className="w-5 h-5" />
									</motion.button>
								</div>

								{/* Profile card */}
								<div className="relative flex items-center gap-4">
									<div className="relative w-14 h-14 rounded-2xl bg-gold-400 flex items-center justify-center font-bold shadow-gold overflow-hidden shrink-0 border border-gold-400/30">
										{user?.avatar ? (
											<img
												src={user.avatar}
												alt={user.name}
												className="w-full h-full object-cover"
												loading="lazy"
												decoding="async"
											/>
										) : (
											<span className="text-white text-xl uppercase">
												{user ? user.name[0] : <User className="w-6 h-6" />}
											</span>
										)}
										{/* Online indicator */}
										{user && (
											<span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white dark:border-dark-950" />
										)}
									</div>
									<div className="min-w-0">
										<p className="text-sm font-black text-dark-900 dark:text-white truncate uppercase tracking-tight">
											{user?.name || "Guest"}
										</p>
										<p className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.18em] mt-0.5">
											{user?.role || "Luxury Member"}
										</p>
										{user?.email && (
											<p className="text-[10px] text-dark-400 dark:text-gray-500 truncate mt-0.5">
												{user.email}
											</p>
										)}
									</div>
								</div>
							</div>

							{/* ── Navigation Links ──────────────────────── */}
							<div className="flex-1 overflow-y-auto py-4 px-3 space-y-5">
								{/* Discover section */}
								<motion.div
									variants={listContainerVariants}
									initial="hidden"
									animate="visible"
								>
									<SectionLabel>Discover</SectionLabel>
									<div className="space-y-0.5 mt-2">
										<AnimLink
											variants={listItemVariants}
											icon={<Home className="w-5 h-5" />}
											label="Home"
											href="/"
											pathname={pathname}
										/>
										<AnimLink
											variants={listItemVariants}
											icon={<Grid className="w-5 h-5" />}
											label="Marketplace"
											href="/products"
											pathname={pathname}
										/>
										<AnimLink
											variants={listItemVariants}
											icon={<Heart className="w-5 h-5" />}
											label="Wishlist"
											href="/customer/wishlist"
											pathname={pathname}
										/>
										<AnimLink
											variants={listItemVariants}
											icon={<Bell className="w-5 h-5" />}
											label="Notifications"
											href="/notifications"
											pathname={pathname}
											onClick={(e: React.MouseEvent) => {
												if (!user) {
													e.preventDefault();
													toast.info("Sign in Required", {
														description:
															"Please connect your account to view notifications.",
														action: {
															label: "Login",
															onClick: () => router.push("/login"),
														},
													});
												}
											}}
										/>
									</div>
								</motion.div>

								{/* Categories section */}
								<motion.div
									variants={listContainerVariants}
									initial="hidden"
									animate="visible"
								>
									<SectionLabel>Categories</SectionLabel>
									<div className="space-y-0.5 mt-2">
										{[
											{
												label: "Shadi & Formal",
												href: "/products?category=SHADI-WEAR",
												icon: <Gem className="w-4 h-4" />,
											},
											{
												label: "Luxury Bridal",
												href: "/products?category=BRIDAL",
												icon: <Sparkles className="w-4 h-4" />,
											},
											{
												label: "Kurtas & Shirts",
												href: "/products?category=KURTAS",
												icon: <TrendingUp className="w-4 h-4" />,
											},
											{
												label: "Premium Watches",
												href: "/products?category=WATCHES",
												icon: <Star className="w-4 h-4" />,
											},
											{
												label: "Designer Shoes",
												href: "/products?category=SHOES",
												icon: <Zap className="w-4 h-4" />,
											},
											{
												label: "Bags & Jewelry",
												href: "/products?category=BAGS",
												icon: <ShoppingBag className="w-4 h-4" />,
											},
										].map((cat) => (
											<motion.div key={cat.href} variants={listItemVariants}>
												<Link
													href={cat.href}
													className="flex items-center justify-between p-3 rounded-2xl transition-all group min-h-[48px] hover:bg-gold-400/8 active:bg-gold-400/15 text-dark-600 dark:text-gray-400 hover:text-gold-400"
												>
													<div className="flex items-center gap-3">
														<span className="w-8 h-8 rounded-xl bg-gold-400/10 flex items-center justify-center text-gold-400 shrink-0">
															{cat.icon}
														</span>
														<span className="text-sm font-bold tracking-tight">
															{cat.label}
														</span>
													</div>
													<ChevronRight className="w-4 h-4 opacity-40 group-hover:opacity-80 group-hover:translate-x-0.5 transition-all" />
												</Link>
											</motion.div>
										))}
									</div>
								</motion.div>

								{/* Account section */}
								<motion.div
									variants={listContainerVariants}
									initial="hidden"
									animate="visible"
								>
									<SectionLabel>Account</SectionLabel>
									<div className="space-y-0.5 mt-2">
										<AnimLink
											variants={listItemVariants}
											icon={<LayoutDashboard className="w-5 h-5" />}
											label="Dashboard"
											href={dashboardHref}
											pathname={pathname}
										/>
										<AnimLink
											variants={listItemVariants}
											icon={<Package className="w-5 h-5" />}
											label="My Orders"
											href={
												user?.role === "SELLER"
													? "/seller/orders"
													: "/customer/orders"
											}
											pathname={pathname}
										/>
										<AnimLink
											variants={listItemVariants}
											icon={<Settings className="w-5 h-5" />}
											label="Account Settings"
											href={
												user?.role === "SELLER"
													? "/seller/profile"
													: "/customer/profile"
											}
											pathname={pathname}
										/>
										{(user?.role === "SELLER" || user?.role === "ADMIN") && (
											<AnimLink
												variants={listItemVariants}
												icon={<Plus className="w-5 h-5" />}
												label="List New Item"
												href="/seller/add-product"
												pathname={pathname}
												highlight
											/>
										)}
									</div>
								</motion.div>
							</div>

							{/* ── Footer Actions ────────────────────────── */}
							<div className="flex-shrink-0 p-4 space-y-3 border-t border-white/8">
								{/* Theme toggle */}
								<motion.button
									whileTap={{ scale: 0.97 }}
									onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
									className="w-full h-14 rounded-2xl bg-cream-100 dark:bg-dark-800 text-dark-900 dark:text-cream-50 font-bold flex items-center justify-center gap-3 transition-all min-h-[48px] hover:bg-gold-400/10 hover:text-gold-400"
								>
									{theme === "dark" ? (
										<Sun className="w-5 h-5" />
									) : (
										<Moon className="w-5 h-5" />
									)}
									Switch to {theme === "dark" ? "Light" : "Dark"}
								</motion.button>

								{/* Sign out */}
								{user && (
									<motion.button
										whileTap={{ scale: 0.97 }}
										onClick={() => {
											logout();
											setIsOpen(false);
										}}
										className="w-full h-14 rounded-2xl bg-red-500/10 text-red-500 font-bold flex items-center justify-center gap-3 transition-all min-h-[48px] hover:bg-red-500/15"
									>
										<LogOut className="w-5 h-5" />
										Sign Out
									</motion.button>
								)}

								{/* Login CTA for guests */}
								{!user && (
									<Link
										href="/login"
										className="w-full h-14 rounded-2xl bg-gradient-to-r from-gold-400 to-gold-600 text-white font-bold flex items-center justify-center gap-2 shadow-gold hover:shadow-[0_0_24px_rgba(212,175,55,0.4)] transition-all min-h-[48px]"
									>
										<Sparkles className="w-4 h-4" />
										Connect Account
									</Link>
								)}
							</div>
						</motion.aside>
					</>
				)}
			</AnimatePresence>
		</>
	);
}

// ─── Helper Sub-components ───────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
	return (
		<p className="text-[10px] font-bold text-dark-400 dark:text-gray-500 uppercase tracking-[0.3em] px-3">
			{children}
		</p>
	);
}

function AnimLink({
	icon,
	label,
	href,
	pathname,
	highlight,
	onClick,
	variants,
}: {
	icon: React.ReactNode;
	label: string;
	href: string;
	pathname: string;
	highlight?: boolean;
	onClick?: (e: React.MouseEvent) => void;
	variants: any;
}) {
	const isActive =
		pathname === href || (href !== "/" && pathname.startsWith(href));

	return (
		<motion.div variants={variants}>
			<Link
				href={href}
				onClick={onClick}
				className={`
          flex items-center justify-between p-4 rounded-2xl transition-all group min-h-[48px]
          ${
						highlight
							? "bg-gold-400 text-white shadow-gold"
							: isActive
								? "bg-gold-400/12 text-gold-400"
								: "hover:bg-gold-400/8 active:bg-gold-400/14 text-dark-600 dark:text-gray-400 hover:text-gold-400"
					}
        `}
			>
				<div className="flex items-center gap-3">
					<span
						className={`transition-colors ${
							highlight
								? "text-white"
								: isActive
									? "text-gold-400"
									: "text-gray-400 group-hover:text-gold-400"
						}`}
					>
						{icon}
					</span>
					<span className="text-sm font-bold tracking-tight">{label}</span>
				</div>
				<ChevronRight
					className={`w-4 h-4 transition-all ${
						isActive || highlight
							? "opacity-80 translate-x-0.5"
							: "opacity-30 group-hover:opacity-70 group-hover:translate-x-0.5"
					}`}
				/>
			</Link>
		</motion.div>
	);
}
