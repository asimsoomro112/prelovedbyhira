"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	ArrowUpRight,
	Gem,
	Heart,
	Home,
	LayoutDashboard,
	Plus,
	ShoppingBag,
	Sparkles,
	Star,
	TrendingUp,
	User,
	X,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

// ─── Framer variants ──────────────────────────────────────────────────────────

const navVariants = {
	hidden: { y: 120, opacity: 0 },
	visible: {
		y: 0,
		opacity: 1,
		transition: {
			type: "spring",
			stiffness: 260,
			damping: 28,
			delay: 0.15,
		} as const,
	},
} as const;

const backdropVariants = {
	hidden: { opacity: 0 },
	visible: { opacity: 1, transition: { duration: 0.22 } },
	exit: { opacity: 0, transition: { duration: 0.18 } },
} as const;

const sheetVariants = {
	hidden: { y: "100%" },
	visible: {
		y: 0,
		transition: { type: "spring", stiffness: 300, damping: 32 } as const,
	},
	exit: {
		y: "100%",
		transition: { type: "spring", stiffness: 300, damping: 32 } as const,
	},
} as const;

const sheetListVariants = {
	hidden: {},
	visible: {
		transition: { staggerChildren: 0.06, delayChildren: 0.2 } as const,
	},
} as const;

const sheetItemVariants = {
	hidden: { opacity: 0, y: 18, scale: 0.97 },
	visible: {
		opacity: 1,
		y: 0,
		scale: 1,
		transition: { type: "spring", stiffness: 280, damping: 22 } as const,
	},
} as const;

interface NavTab {
	id: string;
	label: string;
	Icon: any;
	href?: string;
	onClick?: () => void;
	isFab?: boolean;
	badge?: number;
}

// ─── Category data ────────────────────────────────────────────────────────────

const CATEGORIES = [
	{
		label: "Shadi & Formal",
		sub: "Wedding & Occasion Wear",
		href: "/products?category=SHADI-WEAR",
		icon: <Gem className="w-5 h-5" />,
	},
	{
		label: "Luxury Bridal",
		sub: "Curated Bridal Collection",
		href: "/products?category=BRIDAL",
		icon: <Sparkles className="w-5 h-5" />,
	},
	{
		label: "Kurtas & Shirts",
		sub: "Everyday & Formal Cuts",
		href: "/products?category=KURTAS",
		icon: <TrendingUp className="w-5 h-5" />,
	},
	{
		label: "Premium Watches",
		sub: "Swiss & Designer Pieces",
		href: "/products?category=WATCHES",
		icon: <Star className="w-5 h-5" />,
	},
	{
		label: "Designer Shoes",
		sub: "Luxury Footwear",
		href: "/products?category=SHOES",
		icon: <Zap className="w-5 h-5" />,
	},
	{
		label: "Bags & Jewelry",
		sub: "Statement Accessories",
		href: "/products?category=BAGS",
		icon: <ShoppingBag className="w-5 h-5" />,
	},
];

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BottomNavbar() {
	const pathname = usePathname();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [mounted, setMounted] = useState(false);
	const { user } = useAuthStore();
	const { items } = useCartStore();

	useEffect(() => setMounted(true), []);
	useEffect(() => {
		setIsMenuOpen(false);
	}, []);

	if (!mounted) return null;

	const isSeller = user?.role === "SELLER" || user?.role === "ADMIN";

	const tabs: NavTab[] = isSeller
		? [
				{ id: "home", label: "Home", Icon: Home, href: "/" },
				{
					id: "vault",
					label: "Vault",
					Icon: LayoutDashboard,
					href: "/seller/dashboard",
				},
				{
					id: "sell",
					label: "Sell",
					Icon: Plus,
					href: "/seller/add-product",
					isFab: true,
				},
				{
					id: "explore",
					label: "Explore",
					Icon: Sparkles,
					onClick: () => setIsMenuOpen(true),
				},
				{
					id: "profile",
					label: "Profile",
					Icon: User,
					href: "/seller/profile",
				},
			]
		: [
				{ id: "home", label: "Home", Icon: Home, href: "/" },
				{ id: "browse", label: "Browse", Icon: ShoppingBag, href: "/products" },
				{
					id: "wishlist",
					label: "Wishlist",
					Icon: Heart,
					href: "/customer/wishlist",
				},
				{
					id: "cart",
					label: "Cart",
					Icon: ShoppingBag,
					href: "/cart",
					badge: items.length,
				},
				{
					id: "profile",
					label: "Account",
					Icon: User,
					href: user ? "/customer/profile" : "/login",
				},
			];

	return (
		<>
			{/* ── BOTTOM NAV BAR ──────────────────────────────────── */}
			<motion.nav
				variants={navVariants}
				initial="hidden"
				animate="visible"
				className="lg:hidden fixed bottom-5 left-4 right-4 z-[110] overflow-visible pointer-events-none"
				role="navigation"
				aria-label="Bottom navigation"
			>
				{/* Ambient glow above bar */}
				<div
					aria-hidden
					className="pointer-events-none absolute -top-8 inset-x-8 h-12 opacity-60"
					style={{
						background:
							"radial-gradient(ellipse 80% 100% at 50% 100%, rgba(212,175,55,0.3) 0%, transparent 70%)",
						filter: "blur(12px)",
					}}
				/>

				<div className="relative glass-ultra crystal-border rounded-[32px] h-20 flex items-center justify-around px-2 shadow-gold-3d overflow-visible pointer-events-auto">
					{/* Inner top shimmer — liquid glass detail */}
					<div
						aria-hidden
						className="absolute top-0 left-0 right-0 h-px pointer-events-none"
						style={{
							background:
								"linear-gradient(90deg, transparent, rgba(212,175,55,0.55) 35%, rgba(255,255,255,0.35) 50%, rgba(212,175,55,0.55) 65%, transparent)",
						}}
					/>

					{tabs.map((tab) => {
						const isActive = tab.href
							? pathname === tab.href ||
								(tab.href !== "/" && pathname.startsWith(tab.href))
							: tab.id === "explore" && isMenuOpen;

						// ── FAB Button ──────────────────────────────────
						if (tab.isFab) {
							return (
								<Link
									key={tab.id}
									href={tab.href!}
									aria-label={tab.label}
									className="relative z-50 flex-shrink-0 -translate-y-9"
								>
									<motion.div
										whileTap={{ scale: 0.88 }}
										className="w-[76px] h-[76px] rounded-full flex flex-col items-center justify-center gap-1 shadow-gold-3d relative overflow-hidden"
										style={{
											background:
												"linear-gradient(135deg, #D4AF37 0%, #B8960C 60%, #A07800 100%)",
										}}
									>
										{/* FAB inner glow ring */}
										<div
											aria-hidden
											className="absolute inset-0 rounded-full pointer-events-none"
											style={{
												background:
													"radial-gradient(circle at 35% 30%, rgba(255,255,255,0.28) 0%, transparent 60%)",
											}}
										/>
										{/* Pulse ring */}
										<motion.div
											aria-hidden
											className="absolute inset-0 rounded-full border-2 border-gold-400/50"
											animate={{ scale: [1, 1.18, 1], opacity: [0.7, 0, 0.7] }}
											transition={{
												duration: 2.4,
												repeat: Infinity,
												ease: "easeInOut",
											}}
										/>
										<tab.Icon className="w-7 h-7 text-white relative z-10" />
										<span className="text-[8px] font-black text-white/90 uppercase tracking-wider relative z-10">
											{tab.label}
										</span>
									</motion.div>
								</Link>
							);
						}

						// ── Regular Tab ─────────────────────────────────
						const inner = (
							<div className="relative flex flex-col items-center justify-center gap-1">
								{/* Active pill background */}
								{isActive && (
									<motion.div
										layoutId="bottom-nav-active"
										className="absolute -inset-2 rounded-2xl bg-gold-400/12"
										transition={{ type: "spring", stiffness: 380, damping: 32 }}
									/>
								)}

								<span className="relative">
									<tab.Icon
										className={`w-5 h-5 transition-all duration-200 ${
											isActive ? "text-gold-400 scale-110" : "text-gray-500"
										}`}
									/>
									{/* Cart / notification badge */}
									{tab.badge != null && tab.badge > 0 && (
										<AnimatePresence>
											<motion.span
												key="badge"
												initial={{ scale: 0 }}
												animate={{ scale: 1 }}
												exit={{ scale: 0 }}
												className="absolute -top-2 -right-2.5 min-w-[16px] h-4 px-0.5 bg-gold-400 text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-gold border border-white dark:border-dark-950"
											>
												{tab.badge > 9 ? "9+" : tab.badge}
											</motion.span>
										</AnimatePresence>
									)}
								</span>

								<span
									className={`text-[9px] font-bold uppercase tracking-wider transition-colors duration-200 ${
										isActive ? "text-gold-400" : "text-gray-500"
									}`}
								>
									{tab.label}
								</span>
							</div>
						);

						if (tab.onClick) {
							return (
								<motion.button
									key={tab.id}
									whileTap={{ scale: 0.88 }}
									onClick={tab.onClick}
									className="flex-1 flex items-center justify-center h-full"
									aria-label={tab.label}
								>
									{inner}
								</motion.button>
							);
						}

						return (
							<motion.div
								key={tab.id}
								whileTap={{ scale: 0.88 }}
								className="flex-1 flex items-center justify-center h-full"
							>
								<Link
									href={tab.href!}
									className="flex items-center justify-center w-full h-full"
									aria-label={tab.label}
								>
									{inner}
								</Link>
							</motion.div>
						);
					})}
				</div>
			</motion.nav>

			{/* ── CATEGORIES BOTTOM SHEET ─────────────────────────── */}
			<AnimatePresence>
				{isMenuOpen && (
					<div className="fixed inset-0 z-[999] lg:hidden">
						{/* Backdrop */}
						<motion.div
							variants={backdropVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							onClick={() => setIsMenuOpen(false)}
							className="absolute inset-0 bg-dark-950/50 backdrop-blur-md"
							aria-hidden="true"
						/>

						{/* Sheet */}
						<motion.div
							variants={sheetVariants}
							initial="hidden"
							animate="visible"
							exit="exit"
							className="absolute bottom-0 left-0 right-0 rounded-t-[36px] overflow-hidden flex flex-col max-h-[92vh]"
							style={{
								background: "var(--sheet-bg, white)",
								paddingBottom: "env(safe-area-inset-bottom)",
							}}
							role="dialog"
							aria-modal="true"
							aria-label="Categories"
						>
							{/* Sheet glow at top */}
							<div
								aria-hidden
								className="pointer-events-none absolute top-0 inset-x-0 h-20 opacity-60"
								style={{
									background:
										"radial-gradient(ellipse 70% 100% at 50% 0%, rgba(212,175,55,0.22) 0%, transparent 70%)",
									filter: "blur(10px)",
								}}
							/>
							{/* Inner shimmer */}
							<div
								aria-hidden
								className="absolute top-0 left-0 right-0 h-px pointer-events-none"
								style={{
									background:
										"linear-gradient(90deg, transparent, rgba(212,175,55,0.6) 35%, rgba(255,255,255,0.4) 50%, rgba(212,175,55,0.6) 65%, transparent)",
								}}
							/>

							{/* Drag handle */}
							<div className="flex justify-center pt-4 pb-2 flex-shrink-0">
								<div className="w-10 h-1 bg-gold-400/35 rounded-full" />
							</div>

							{/* Sheet Header */}
							<div className="flex items-start justify-between px-6 pb-4 flex-shrink-0">
								<div>
									<h3 className="text-2xl font-display font-black text-dark-900 dark:text-cream-50 leading-tight">
										Discover{" "}
										<span className="italic text-gold-400">Fashion</span>
									</h3>
									<p className="text-[10px] font-bold text-gold-400/70 uppercase tracking-[0.28em] mt-1">
										Curated for 2026
									</p>
								</div>
								<motion.button
									whileTap={{ scale: 0.88 }}
									onClick={() => setIsMenuOpen(false)}
									className="w-12 h-12 rounded-2xl glass-crystal crystal-border flex items-center justify-center text-dark-900/60 dark:text-cream-50/60 hover:text-gold-400 transition-colors mt-1"
									aria-label="Close categories"
								>
									<X className="w-5 h-5" />
								</motion.button>
							</div>

							{/* Category List */}
							<div className="flex-1 overflow-y-auto px-4 pb-8">
								<motion.div
									variants={sheetListVariants}
									initial="hidden"
									animate="visible"
									className="space-y-2"
								>
									{CATEGORIES.map((cat) => (
										<motion.div key={cat.href} variants={sheetItemVariants}>
											<Link
												href={cat.href}
												onClick={() => setIsMenuOpen(false)}
											>
												<motion.div
													whileTap={{ scale: 0.97 }}
													className="flex items-center gap-4 p-4 rounded-2xl bg-cream-50 dark:bg-dark-800 transition-colors group min-h-[64px] relative overflow-hidden"
												>
													{/* Hover left glow */}
													<div
														aria-hidden
														className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl bg-gold-400 opacity-0 group-hover:opacity-100 transition-opacity"
													/>

													{/* Icon */}
													<div className="w-12 h-12 rounded-xl bg-gold-400/12 flex items-center justify-center text-gold-400 shrink-0 group-hover:bg-gold-400 group-hover:text-white transition-all duration-300">
														{cat.icon}
													</div>

													{/* Text */}
													<div className="flex-1 min-w-0">
														<p className="text-sm font-black text-dark-900 dark:text-cream-50 group-hover:text-gold-400 transition-colors">
															{cat.label}
														</p>
														<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5">
															{cat.sub}
														</p>
													</div>

													{/* Arrow */}
													<ArrowUpRight className="w-4 h-4 text-gray-400 group-hover:text-gold-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
												</motion.div>
											</Link>
										</motion.div>
									))}
								</motion.div>
							</div>

							{/* Sheet Footer */}
							<div className="flex-shrink-0 py-3 border-t border-gold-400/10">
								<p className="text-center text-[9px] font-bold text-gray-400 uppercase tracking-[0.3em]">
									Pakistan's #1 Luxury Trade
								</p>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
