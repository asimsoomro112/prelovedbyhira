"use client";

import {
	motion,
	useInView,
	useMotionValue,
	useSpring,
	useTransform,
} from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
	ArrowRight,
	BadgeCheck,
	Gem,
	Heart,
	Lock,
	Package,
	Quote,
	RefreshCw,
	Star,
	Timer,
	TrendingUp,
	Users,
	Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from "react";
import { CustomerHome, SellerHome } from "@/components/home/PersonalizedHome";
import { useAuthStore } from "@/store/useAuthStore";
import { useWishlistStore } from "@/store/useWishlistStore";

// Register GSAP Plugin
if (typeof window !== "undefined") {
	gsap.registerPlugin(ScrollTrigger);
}

// ─── TOKENS ───────────────────────────────────────────────────────────────────
const T = {
	dark: {
		bg: "#06060A",
		surface: "#0E0E16",
		surfaceAlt: "#13131E",
		border: "rgba(255,255,255,0.07)",
		borderHover: "rgba(255,255,255,0.16)",
		text: "#F2EDE4",
		textMuted: "rgba(242,237,228,0.45)",
		textDim: "rgba(242,237,228,0.22)",
		gold: "#C9A227",
		goldLight: "#F0D060",
		goldGlow: "rgba(201,162,39,0.18)",
		accent: "#8B5CF6",
		accentPink: "#EC4899",
		green: "#10B981",
		red: "#EF4444",
		dressStroke: "#C9A227",
		dressSleeve: "#A78BFA",
		dressNeck: "#F472B6",
		dressPleat: "rgba(201,162,39,0.35)",
		dressFill: "rgba(139,92,246,0.09)",
	},
	light: {
		bg: "#FAF8F4",
		surface: "#FFFFFF",
		surfaceAlt: "#F3EFE8",
		border: "rgba(0,0,0,0.08)",
		borderHover: "rgba(0,0,0,0.18)",
		text: "#1A1624",
		textMuted: "rgba(26,22,36,0.5)",
		textDim: "rgba(26,22,36,0.25)",
		gold: "#A37118",
		goldLight: "#C9940A",
		goldGlow: "rgba(163,113,24,0.12)",
		accent: "#7C3AED",
		accentPink: "#DB2777",
		green: "#059669",
		red: "#DC2626",
		dressStroke: "#7C3AED",
		dressSleeve: "#9333EA",
		dressNeck: "#DB2777",
		dressPleat: "rgba(124,58,237,0.25)",
		dressFill: "rgba(124,58,237,0.06)",
	},
};

const categories = [
	{ name: "Bridal", emoji: "👰", slug: "BRIDAL", count: "120+" },
	{ name: "Formal", emoji: "👗", slug: "SHADI-WEAR", count: "450+" },
	{ name: "Kurtas", emoji: "👘", slug: "KURTAS", count: "890+" },
	{ name: "Shoes", emoji: "👠", slug: "SHOES", count: "230+" },
	{ name: "Bags", emoji: "👜", slug: "BAGS", count: "150+" },
	{ name: "Watches", emoji: "⌚", slug: "WATCHES", count: "85+" },
];

const reviews = [
	{
		name: "Ayesha Khan",
		item: "Elan Formal",
		text: "Quality was exactly as described. The escrow payment made me feel so safe. Highly recommended!",
		stars: 5,
	},
	{
		name: "Zainab Malik",
		item: "LV Bag",
		text: "The vault curation helped me pick the perfect match. Fast delivery and authentic piece.",
		stars: 5,
	},
	{
		name: "Sara Ahmed",
		item: "Bridal Lehenga",
		text: "Saved 60% vs buying new. Incredible initiative for sustainable fashion in Pakistan.",
		stars: 5,
	},
];

const protocolCards = [
	{
		icon: Lock,
		title: "Buyer Vault Escrow",
		desc: "Payment held in our secure vault. Funds released only after you confirm the item's perfection.",
		badge: "Security",
		color: "green",
	},
	{
		icon: BadgeCheck,
		title: "Admin Authentication",
		desc: "Every piece is verified online through a strict Seller KYC process and AI authenticity checks.",
		badge: "Trust",
		color: "gold",
	},
	{
		icon: Timer,
		title: "Insured Dispatch",
		desc: "Once an order is placed, items are tracked and shipped via our premium, insured logistics partners.",
		badge: "Speed",
		color: "blue",
	},
	{
		icon: RefreshCw,
		title: "Buyer Protection",
		desc: "Not as described? Open a dispute within 7 days for a full refund via our 'Secure Dispute' protocol.",
		badge: "Protection",
		color: "red",
	},
];

const D = {
	outline:
		"M200 58C186 51 172 55 163 66C154 74 145 84 140 93C131 102 120 116 109 132L97 182C105 187 115 190 128 190C139 210 142 232 144 252C112 345 52 470 6 655Q200 682 394 655C348 470 288 345 256 252C258 232 261 210 272 190C285 190 295 187 303 182L291 132C280 116 269 102 260 93C255 84 246 74 237 66C228 55 214 51 200 58Z",
	neckArc: "M163 66Q182 48 200 54Q218 48 237 66",
	sleeveL:
		"M140 93C128 106 116 122 109 140L97 182L128 190C122 172 117 152 120 134C124 118 132 106 138 98",
	sleeveR:
		"M260 93C272 106 284 122 291 140L303 182L272 190C278 172 283 152 280 134C276 118 268 106 262 98",
	waist: "M144 252Q200 268 256 252Q200 260 144 252",
	pleat1: "M152 258C116 358 66 478 18 640",
	pleat2: "M170 255C147 348 112 465 72 630",
	pleat3: "M188 253C174 340 152 458 122 620",
	pleat4: "M212 253C226 340 248 458 278 620",
	pleat5: "M230 255C253 348 288 465 328 630",
	pleat6: "M248 258C284 358 334 478 382 640",
	neckEmb:
		"M168 69Q180 59 190 66Q196 58 200 56Q204 58 210 66Q220 59 232 69M174 74L178 67M226 74L222 67M184 70Q192 63 200 66Q208 63 216 70",
	bodiceMotif:
		"M195 116Q200 106 205 116Q212 127 205 136Q200 142 195 136Q188 127 195 116M200 142L200 172M193 140Q196 150 200 152Q204 150 207 140M196 106L200 98L204 106",
	hemL: "M6 655Q50 668 100 663Q150 674 200 670",
	hemR: "M200 670Q250 674 300 663Q350 668 394 655",
	dupatta:
		"M109 132C72 152 50 192 36 234C20 276 12 328 16 378C20 416 42 448 32 492",
	dupattaEnd: "M32 492Q16 524 20 554Q10 576 6 604M16 378Q4 410 8 442",
};

const THREADS = Array.from({ length: 32 }, (_, i) => ({
	id: i,
	x: Number((160 + Math.sin(i * 0.77) * 155).toFixed(2)),
	y: Number((180 + Math.cos(i * 0.61) * 220).toFixed(2)),
	len: 16 + (i % 6) * 9,
	ang: Number((i * 41.2).toFixed(2)),
	del: i * 0.065,
}));

function useMouseTilt(strength = 18) {
	const x = useMotionValue(0);
	const y = useMotionValue(0);
	const rotateX = useSpring(
		useTransform(y, [-0.5, 0.5], [strength, -strength]),
		{ stiffness: 300, damping: 30 },
	);
	const rotateY = useSpring(
		useTransform(x, [-0.5, 0.5], [-strength, strength]),
		{ stiffness: 300, damping: 30 },
	);
	const onMove = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
			const rect = e.currentTarget.getBoundingClientRect();
			x.set((e.clientX - rect.left) / rect.width - 0.5);
			y.set((e.clientY - rect.top) / rect.height - 0.5);
		},
		[x, y],
	);
	const onLeave = useCallback(() => {
		x.set(0);
		y.set(0);
	}, [x, y]);
	return { rotateX, rotateY, onMove, onLeave };
}

function Counter({ value, c }: { value: string; c: typeof T.dark }) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true });
	return (
		<motion.span
			ref={ref}
			initial={{ opacity: 0, y: 20 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			style={{
				color: c.gold,
				fontFamily: "'Cormorant Garamond', serif",
				fontStyle: "italic",
			}}
			className="text-4xl md:text-5xl font-bold"
		>
			{value}
		</motion.span>
	);
}

function TiltCard({
	children,
	className,
	style,
}: {
	children: React.ReactNode;
	className?: string;
	style?: React.CSSProperties;
}) {
	const { rotateX, rotateY, onMove, onLeave } = useMouseTilt(12);
	return (
		<motion.div
			onMouseMove={onMove}
			onMouseLeave={onLeave}
			style={{ rotateX, rotateY, transformPerspective: 1200, ...style }}
			whileHover={{ scale: 1.03, z: 20 }}
			className={className}
		>
			{children}
		</motion.div>
	);
}

function ProtocolCard({
	icon: Icon,
	title,
	desc,
	badge,
	color,
	c,
	i,
}: {
	icon: any;
	title: string;
	desc: string;
	badge: string;
	color: string;
	c: typeof T.dark;
	i: number;
}) {
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-80px" });
	const accentMap: Record<string, string> = {
		green: c.green,
		gold: c.gold,
		blue: "#60A5FA",
		red: c.red,
	};
	const accent = accentMap[color] ?? c.gold;
	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, y: 40 }}
			animate={inView ? { opacity: 1, y: 0 } : {}}
			transition={{ delay: i * 0.1, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
			className="h-full"
		>
			<TiltCard
				style={{
					background: c.surface,
					borderRadius: 32,
					border: `1px solid ${c.border}`,
					padding: "2.5rem",
					display: "flex",
					flexDirection: "column",
					gap: "1.5rem",
					cursor: "default",
					height: "100%",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
							width: 56,
							height: 56,
							borderRadius: 16,
							background: `${accent}18`,
							border: `1px solid ${accent}30`,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							color: accent,
						}}
					>
						<Icon size={24} />
					</div>
					<span
						style={{
							padding: "5px 14px",
							borderRadius: 100,
							fontSize: 10,
							fontWeight: 800,
							letterSpacing: "0.1em",
							textTransform: "uppercase",
							background: `${accent}14`,
							border: `1px solid ${accent}28`,
							color: accent,
						}}
					>
						{badge}
					</span>
				</div>
				<div>
					<h3
						style={{
							fontFamily: "'Cormorant Garamond', serif",
							fontSize: "1.5rem",
							fontWeight: 700,
							color: c.text,
							marginBottom: "0.5rem",
							lineHeight: 1.2,
						}}
					>
						{title}
					</h3>
					<p
						style={{ fontSize: "0.88rem", lineHeight: 1.7, color: c.textMuted }}
					>
						{desc}
					</p>
				</div>
			</TiltCard>
		</motion.div>
	);
}

function ProductCard({
	item,
	highlight,
	c,
}: {
	item: any;
	highlight?: boolean;
	c: typeof T.dark;
}) {
	const { rotateX, rotateY, onMove, onLeave } = useMouseTilt(8);
	const ref = useRef(null);
	const inView = useInView(ref, { once: true, margin: "-60px" });
	const router = useRouter();
	const { toggleItem, isWishlisted } = useWishlistStore();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const wishlisted = mounted ? isWishlisted(item.id) : false;
	return (
		<motion.div
			ref={ref}
			initial={{ opacity: 0, scale: 0.94 }}
			animate={inView ? { opacity: 1, scale: 1 } : {}}
			transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
		>
			<motion.div
				onMouseMove={onMove}
				onMouseLeave={onLeave}
				style={{ rotateX, rotateY, transformPerspective: 1000 }}
				className={`group relative rounded-[40px] overflow-hidden cursor-pointer ${highlight ? "h-[560px]" : "aspect-[3/4]"}`}
				onClick={() => router.push(`/product/${item.id}`)}
				whileHover={{ scale: 1.02 }}
				transition={{ duration: 0.3 }}
			>
				<div className="absolute inset-0 z-0">
					<Image
						src={
							item.images?.[0] ||
							"https://images.unsplash.com/photo-1583394838336-acd977736f90?q=80&w=600"
						}
						alt={item.title}
						fill
						sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
						className="object-contain transition-transform duration-1000 group-hover:scale-110"
					/>
					<div
						className="absolute inset-0"
						style={{
							background:
								"linear-gradient(to top, rgba(6,6,10,0.95) 0%, rgba(6,6,10,0.3) 50%, transparent 100%)",
						}}
					/>
				</div>
				<button
					onClick={(e) => {
						e.stopPropagation();
						toggleItem({
							id: item.id,
							title: item.title,
							brand: item.brand,
							sellingPrice: item.sellingPrice,
							images: item.images,
						});
					}}
					className="absolute top-6 right-6 z-20 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center transition-all active:scale-90 hover:bg-white/20"
				>
					<Heart
						className={`w-6 h-6 transition-colors ${wishlisted ? "fill-gold-400 text-gold-400" : "text-white"}`}
					/>
				</button>
				<div className="absolute top-5 left-5 z-10 flex flex-col gap-2">
					<span
						style={{
							padding: "5px 14px",
							borderRadius: 100,
							fontSize: 9,
							fontWeight: 800,
							letterSpacing: "0.2em",
							textTransform: "uppercase",
							background:
								item.condition === "NEW" ? "#10B981" : "rgba(0,0,0,0.5)",
							backdropFilter: "blur(8px)",
							border:
								item.condition === "NEW"
									? "1px solid #34D399"
									: `1px solid ${c.border}`,
							color: item.condition === "NEW" ? "#fff" : c.gold,
							boxShadow:
								item.condition === "NEW"
									? "0 0 15px rgba(16, 185, 129, 0.4)"
									: "none",
						}}
					>
						{item.condition}
					</span>
					{highlight && (
						<span
							style={{
								padding: "5px 14px",
								borderRadius: 100,
								fontSize: 9,
								fontWeight: 800,
								letterSpacing: "0.1em",
								textTransform: "uppercase",
								background: "rgba(239,68,68,0.7)",
								color: "#fff",
								display: "flex",
								alignItems: "center",
								gap: 5,
							}}
						>
							<TrendingUp size={10} /> Most Wanted
						</span>
					)}
				</div>
				<div className="absolute bottom-0 inset-x-0 p-7 z-10 space-y-3">
					<div>
						<p
							style={{
								fontSize: 9,
								fontWeight: 800,
								letterSpacing: "0.35em",
								textTransform: "uppercase",
								color: c.gold,
								marginBottom: 4,
							}}
						>
							{item.brand || "Premium Brand"}
						</p>
						<h3
							style={{
								fontFamily: "'Cormorant Garamond', serif",
								fontSize: "1.6rem",
								fontWeight: 700,
								color: "#fff",
								lineHeight: 1.15,
							}}
						>
							{item.title}
						</h3>
					</div>
					<div
						style={{
							display: "flex",
							alignItems: "flex-end",
							justifyContent: "space-between",
						}}
					>
						<div className="flex-1">
							<p
								style={{
									fontFamily: "'Cormorant Garamond', serif",
									fontSize: "2rem",
									fontWeight: 700,
									color: c.gold,
									lineHeight: 1,
								}}
							>
								Rs. {item.sellingPrice?.toLocaleString()}
							</p>
							{item.originalPrice > item.sellingPrice && (
								<p
									style={{
										fontSize: 13,
										color: "rgba(255,255,255,0.3)",
										textDecoration: "line-through",
										marginTop: 2,
									}}
								>
									Rs. {item.originalPrice?.toLocaleString()}
								</p>
							)}
						</div>
						<motion.div
							whileHover={{ scale: 1.15, rotate: -12 }}
							className="w-11 h-11 rounded-2xl flex items-center justify-center"
							style={{ background: c.gold, color: "#000" }}
						>
							<ArrowRight size={18} />
						</motion.div>
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
}

export default function HomeClient({
	trending,
	arrivals,
	productCount,
}: {
	trending: any[];
	arrivals: any[];
	productCount: number;
}) {
	const { user } = useAuthStore();
	const { resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => {
		setMounted(true);
	}, []);
	const theme = (!mounted || resolvedTheme !== "light" ? "dark" : "light") as
		| "dark"
		| "light";
	const c = theme === "dark" ? T.dark : T.light;
	const sectionRef = useRef<HTMLElement>(null);
	const scrollYProgress = useMotionValue(0);
	const smoothProgress = useSpring(scrollYProgress, {
		stiffness: 60,
		damping: 25,
	});

	useLayoutEffect(() => {
		const ctx = gsap.context(() => {
			ScrollTrigger.create({
				trigger: sectionRef.current,
				start: "top top",
				end: "+=350%",
				pin: true,
				scrub: 1,
				onUpdate: (self) => {
					scrollYProgress.set(self.progress);
				},
			});
		});
		return () => ctx.revert();
	}, [scrollYProgress]);

	const mk = (a: number, b: number) =>
		useTransform(smoothProgress, [a, b], [0, 1]);
	const pOutline = mk(0.03, 0.28);
	const pSleeves = mk(0.08, 0.33);
	const pNeckArc = mk(0.12, 0.36);
	const pWaist = mk(0.16, 0.4);
	const pPleats = mk(0.2, 0.5);
	const pNeckEmb = mk(0.3, 0.55);
	const pBodice = mk(0.35, 0.6);
	const pDupatta = mk(0.42, 0.68);
	const pHem = mk(0.52, 0.78);
	const threadAlpha = useTransform(smoothProgress, [0, 0.06, 0.22], [1, 1, 0]);
	const dressFill = useTransform(smoothProgress, [0.52, 0.82], [0, 1]);
	const glowScale = useTransform(smoothProgress, [0.2, 0.8], [0.5, 1.4]);
	const glowAlpha = useTransform(smoothProgress, [0.2, 0.7], [0, 0.6]);

	const stats = [
		{
			value: `${productCount.toLocaleString()}+`,
			label: "Verified Pieces",
			icon: Package,
		},
		{ value: "1,000+", label: "Happy Customers", icon: Users },
		{ value: "98.7%", label: "Auth Rate", icon: BadgeCheck },
		{ value: "24hr", label: "Avg Dispatch", icon: Timer },
	];

	const [viewMode, setViewMode] = useState<string | null>(null);

	useEffect(() => {
		if (user) {
			const savedMode = localStorage.getItem(`home_mode_${user.id}`);
			setViewMode(savedMode || user.role);
		}
	}, [user]);

	// Handle global switch requests from PersonalizedHome components
	useEffect(() => {
		(window as any).setHomeMode = (mode: string) => {
			if (user) {
				localStorage.setItem(`home_mode_${user.id}`, mode);
				setViewMode(mode);
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		};
		return () => {
			delete (window as any).setHomeMode;
		};
	}, [user]);

	if (viewMode === "SELLER") return <SellerHome user={user} />;
	if (viewMode === "CUSTOMER") return <CustomerHome user={user} />;

	// Fallback to role if viewMode not yet set
	if (user?.role === "SELLER" && !viewMode) return <SellerHome user={user} />;
	if (user?.role === "CUSTOMER" && !viewMode)
		return <CustomerHome user={user} />;

	return (
		<div
			style={{
				background: c.bg,
				color: c.text,
				overflowX: "hidden",
				transition: "background 0.5s, color 0.5s",
			}}
			className="min-h-screen selection:bg-amber-400/30"
		>
			{/* ── SECTION 1: HERO (TEXT + BUTTONS) ──────────────── */}
			<section
				className="w-full min-h-[85vh] flex flex-col items-center justify-center relative px-6 text-center"
				style={{ background: c.bg }}
			>
				<div
					style={{
						position: "absolute",
						inset: 0,
						background:
							theme === "dark"
								? "radial-gradient(ellipse 80% 60% at 50% 0%, #1a0a2e 0%, #06060A 65%)"
								: "radial-gradient(ellipse 80% 60% at 50% 0%, #ede8ff 0%, #FAF8F4 65%)",
					}}
				/>
				<div
					className="absolute inset-0 opacity-[0.025]"
					style={{
						backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
						backgroundRepeat: "repeat",
						backgroundSize: "128px",
					}}
				/>

				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
					className="relative z-10 max-w-5xl space-y-8 md:space-y-12"
				>
					<div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-ultra"
						style={{
							border: `1px solid ${c.gold}40`,
							background: `${c.gold}12`,
						}}
					>
						<motion.div
							animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
							transition={{ repeat: Infinity, duration: 2 }}
							style={{
								width: 6,
								height: 6,
								borderRadius: "50%",
								background: c.gold,
							}}
						/>
						<span className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500">
							Pakistan's #1 Luxury Resale
						</span>
					</div>

					<h1
						className="text-[clamp(3.5rem,10vw,9rem)] leading-[0.85] font-bold tracking-tighter"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						Wear Art.
						<br />
						<em
							style={{
								backgroundImage:
									theme === "dark"
										? "linear-gradient(90deg, #C9A227, #F0D060, #C9A227)"
										: "linear-gradient(90deg, #7C3AED, #DB2777, #A37118)",
								WebkitBackgroundClip: "text",
								backgroundClip: "text",
								WebkitTextFillColor: "transparent",
								display: "inline-block",
							}}
						>
							Own Legacy.
						</em>
					</h1>

					<p className="text-[clamp(1.1rem,2.2vw,1.4rem)] text-dark-400 max-w-xl mx-auto font-light leading-relaxed opacity-80">
						The digital flagship for preloved Pakistani luxury.
						<br />
						AI-curated, KYC-verified, and escrow-protected.
					</p>

					<div className="flex flex-wrap items-center justify-center gap-5 md:gap-8 pt-4">
						<Link
							href="/products"
							className="group relative px-12 py-6 bg-gold-500 text-white rounded-2xl font-bold overflow-hidden transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-gold-500/20"
						>
							Shop Collection <ArrowRight size={20} />
							<motion.div
								animate={{ x: ["-100%", "200%"] }}
								transition={{
									duration: 2.5,
									repeat: Infinity,
									ease: "easeInOut",
									repeatDelay: 1,
								}}
								style={{
									position: "absolute",
									inset: 0,
									background:
										"linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
									transform: "skewX(-20deg)",
								}}
							/>
						</Link>
						<Link
							href="/register"
							className="px-12 py-6 rounded-2xl border border-white/10 font-bold hover:bg-white/5 transition-all flex items-center gap-3 backdrop-blur-md"
						>
							Start Selling <Zap size={18} />
						</Link>
					</div>
				</motion.div>
			</section>

			{/* ── SECTION 2: ANIMATED DRESS VAULT (GSAP PINNED) ── */}
			<section
				ref={sectionRef}
				className="w-full h-screen overflow-hidden relative"
				style={{ background: c.bg }}
			>
				<motion.div
					style={{
						position: "absolute",
						top: "20%",
						left: "50%",
						translateX: "-50%",
						width: 600,
						height: 600,
						borderRadius: "50%",
						background:
							theme === "dark"
								? "radial-gradient(circle, rgba(139,92,246,0.2) 0%, transparent 70%)"
								: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)",
						filter: "blur(80px)",
						scale: glowScale,
						opacity: glowAlpha,
						pointerEvents: "none",
					}}
				/>

				<div className="w-full h-full flex flex-col items-center justify-center relative">
					<div className="relative w-full h-full flex items-center justify-center pointer-events-none">
						<motion.svg
							viewBox="0 0 400 700"
							className="w-auto h-[85vh] max-h-[700px] overflow-visible"
						>
							<defs>
								<filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
									<feGaussianBlur stdDeviation="2.5" result="b" />
									<feMerge>
										<feMergeNode in="b" />
										<feMergeNode in="SourceGraphic" />
									</feMerge>
								</filter>
								<linearGradient
									id="fillGrad"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
								>
									<stop
										offset="0%"
										stopColor={theme === "dark" ? "#8B5CF6" : "#7C3AED"}
										stopOpacity="0.7"
									/>
									<stop
										offset="45%"
										stopColor={theme === "dark" ? "#EC4899" : "#DB2777"}
										stopOpacity="0.4"
									/>
									<stop
										offset="100%"
										stopColor={theme === "dark" ? "#C9A227" : "#A37118"}
										stopOpacity="0.5"
									/>
								</linearGradient>
								<linearGradient
									id="threadGrad"
									x1="0%"
									y1="0%"
									x2="100%"
									y2="100%"
								>
									<stop offset="0%" stopColor={c.gold} stopOpacity="0.9" />
									<stop
										offset="100%"
										stopColor={c.dressSleeve}
										stopOpacity="0.6"
									/>
								</linearGradient>
							</defs>

							<motion.g style={{ opacity: threadAlpha }}>
								{THREADS.map((t) => (
									<motion.line
										key={t.id}
										x1={t.x}
										y1={t.y}
										x2={Number(
											(t.x + Math.cos((t.ang * Math.PI) / 180) * t.len).toFixed(
												2,
											),
										)}
										y2={Number(
											(t.y + Math.sin((t.ang * Math.PI) / 180) * t.len).toFixed(
												2,
											),
										)}
										stroke="url(#threadGrad)"
										strokeWidth="1.4"
										strokeLinecap="round"
										animate={{
											opacity: [0, 0.7, 0.4],
											x: [0, Math.sin(t.id) * 6, 0],
											y: [0, Math.cos(t.id) * 6, 0],
										}}
										transition={{
											delay: t.del,
											duration: 2.8,
											repeat: Infinity,
											repeatType: "reverse",
										}}
									/>
								))}
							</motion.g>

							<motion.path
								d={D.outline}
								fill="url(#fillGrad)"
								style={{ fillOpacity: dressFill }}
							/>
							<motion.path
								d={D.outline}
								fill="none"
								stroke={c.dressStroke}
								strokeWidth="2.2"
								filter="url(#glow)"
								style={{ pathLength: pOutline }}
							/>
							{[D.sleeveL, D.sleeveR].map((p, i) => (
								<motion.path
									key={i}
									d={p}
									fill="none"
									stroke={c.dressSleeve}
									strokeWidth="1.6"
									style={{ pathLength: pSleeves }}
								/>
							))}
							<motion.path
								d={D.neckArc}
								fill="none"
								stroke={c.dressNeck}
								strokeWidth="1.8"
								style={{ pathLength: pNeckArc }}
							/>
							<motion.path
								d={D.waist}
								fill="none"
								stroke={c.dressStroke}
								strokeWidth="2.4"
								style={{ pathLength: pWaist }}
							/>
							{[D.pleat1, D.pleat2, D.pleat3, D.pleat4, D.pleat5, D.pleat6].map(
								(p, i) => (
									<motion.path
										key={i}
										d={p}
										fill="none"
										stroke={c.dressPleat}
										strokeWidth="0.9"
										style={{ pathLength: pPleats }}
									/>
								),
							)}
							<motion.path
								d={D.neckEmb}
								fill="none"
								stroke={c.dressNeck}
								strokeWidth="1"
								style={{ pathLength: pNeckEmb }}
							/>
							<motion.path
								d={D.bodiceMotif}
								fill="none"
								stroke={c.dressStroke}
								strokeWidth="1.1"
								style={{ pathLength: pBodice }}
							/>
							<motion.path
								d={D.dupatta}
								fill="none"
								stroke={c.dressSleeve}
								strokeWidth="1.8"
								strokeDasharray="5 8"
								style={{ pathLength: pDupatta }}
							/>
							{[D.hemL, D.hemR].map((p, i) => (
								<motion.path
									key={i}
									d={p}
									fill="none"
									stroke={c.dressStroke}
									strokeWidth="1.6"
									style={{ pathLength: pHem }}
								/>
							))}
						</motion.svg>
					</div>
				</div>
			</section>

			<section className="px-6 lg:px-8 py-20 overflow-hidden">
				<div className="max-w-7xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							viewport={{ once: true }}
							className="space-y-8 order-2 lg:order-1 text-center lg:text-left"
						>
							<div className="space-y-4">
								<p className="text-[10px] md:text-[12px] font-black uppercase tracking-[0.6em] text-gold-400">
									Authentic • Curated • Trusted • Timeless
								</p>
								<h3 className="text-4xl md:text-6xl font-display font-bold text-dark-900 dark:text-white leading-[1.1]">
									Welcome to the <br />
									<span className="italic text-gold-400">Digital Vault</span> of
									Luxury.
								</h3>
							</div>
							<p className="text-dark-600 dark:text-gray-400 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
								Every masterpiece in our collection is AI-verified and
								physically authenticated, ensuring your investment remains
								timeless. Step into a world where quality is never compromised.
							</p>
							<div className="pt-4 flex flex-wrap gap-4 justify-center lg:justify-start">
								<button className="px-8 py-4 bg-gold-400 text-black font-bold rounded-2xl hover:bg-gold-500 transition-all active:scale-95 shadow-lg shadow-gold-400/20">
									Enter The Vault
								</button>
							</div>
						</motion.div>
						<motion.div
							initial={{ opacity: 0, scale: 0.9, x: 30 }}
							whileInView={{ opacity: 1, scale: 1, x: 0 }}
							viewport={{ once: true }}
							className="relative order-1 lg:order-2"
						>
							<div className="relative aspect-square w-full max-w-[500px] mx-auto group">
								<div className="absolute inset-0 bg-gold-400/10 dark:bg-gold-400/20 blur-[100px] rounded-full group-hover:bg-gold-400/30 transition-colors" />
								<div className="relative z-10 w-full h-full rounded-[48px] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] dark:shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] bg-black p-0 border-none">
									<Image
										src="/hero-vault.png"
										alt="The ReVault Door"
										width={1000}
										height={1000}
										priority={true}
										className="w-full h-full object-contain transition-transform duration-[10s] group-hover:scale-105"
									/>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			<section
				style={{
					background: c.surface,
					borderTop: `1px solid ${c.border}`,
					borderBottom: `1px solid ${c.border}`,
					padding: "2.5rem 1.5rem",
				}}
			>
				<div
					style={{
						maxWidth: 1280,
						margin: "0 auto",
						display: "grid",
						gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
						gap: "2rem",
					}}
				>
					{stats.map(({ value, label, icon: Icon }, i) => (
						<motion.div
							key={i}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.1, duration: 0.6 }}
							viewport={{ once: true }}
							className="flex flex-col items-center gap-6 text-center"
						>
							<Icon size={18} className="text-gold-500 mb-1" />
							<Counter value={value} c={c} />
							<p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-dark-500">
								{label}
							</p>
						</motion.div>
					))}
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem" }}>
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8 }}
						viewport={{ once: true }}
						className="text-center mb-20"
					>
						<p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 mb-4">
							Built on Trust
						</p>
						<h2
							className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight leading-[1.05]"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							The <span className="italic text-gold-500">Preloved</span>{" "}
							Protocol.
						</h2>
						<p className="mt-4 text-dark-400 font-light">
							Direct from trusted merchants, secured by our digital verification
							vault.
						</p>
					</motion.div>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
						{protocolCards.map((card, i) => (
							<ProtocolCard key={i} {...card} c={c} i={i} />
						))}
					</div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem", background: c.surfaceAlt }}>
				<div className="max-w-7xl mx-auto">
					<div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
						<motion.div
							initial={{ opacity: 0, x: -30 }}
							whileInView={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.7 }}
							viewport={{ once: true }}
						>
							<div className="flex items-center gap-2 mb-3">
								<motion.div
									animate={{ scale: [1, 1.3, 1], opacity: [1, 0.5, 1] }}
									transition={{ repeat: Infinity, duration: 1 }}
									className="w-2 h-2 rounded-full bg-red-500"
								/>
								<span className="text-[9px] font-black uppercase tracking-[0.4em] text-red-500">
									Live Market Hits
								</span>
							</div>
							<h2
								className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight leading-[1.05]"
								style={{ fontFamily: "'Cormorant Garamond', serif" }}
							>
								Most <span className="italic text-gold-500">Wanted.</span>
							</h2>
						</motion.div>
						<Link
							href="/products"
							className="px-7 py-3 border border-white/10 rounded-xl text-[11px] font-bold uppercase tracking-widest hover:bg-white/5 transition-all flex items-center gap-2"
						>
							Explore Vault <ArrowRight size={14} />
						</Link>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{trending.map((item: any) => (
							<ProductCard key={item.id} item={item} highlight c={c} />
						))}
					</div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem" }}>
				<div className="max-w-7xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 30 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.7 }}
						viewport={{ once: true }}
						className="mb-16"
					>
						<h2
							className="text-[clamp(2rem,4.5vw,4.5rem)] font-bold tracking-tight"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Fresh <span className="italic text-gold-500">Vaults.</span>
						</h2>
						<div className="mt-4 h-1 w-16 bg-gradient-to-r from-gold-500 to-transparent rounded-full" />
					</motion.div>
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{arrivals.map((item: any) => (
							<ProductCard key={item.id} item={item} c={c} />
						))}
					</div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem", background: c.surfaceAlt }}>
				<div className="max-w-7xl mx-auto text-center">
					<h2
						className="text-[clamp(2rem,4vw,4rem)] font-bold mb-16"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						Explore by <span className="italic text-gold-500">Category.</span>
					</h2>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
						{categories.map((cat, i) => (
							<motion.div
								key={cat.slug}
								initial={{ opacity: 0, scale: 0.9 }}
								whileInView={{ opacity: 1, scale: 1 }}
								transition={{ delay: i * 0.05 }}
								viewport={{ once: true }}
							>
								<Link href={`/products?category=${cat.slug}`}>
									<motion.div
										whileHover={{
											y: -6,
											borderColor: `${c.gold}60`,
											background: `${c.gold}08`,
										}}
										className="h-52 rounded-[32px] border border-white/5 bg-surface flex flex-col items-center justify-center gap-5 cursor-pointer transition-all"
									>
										<span className="text-5xl">{cat.emoji}</span>
										<div className="text-center">
											<p className="text-[11px] font-black uppercase tracking-widest">
												{cat.name}
											</p>
										</div>
									</motion.div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem", background: c.surface }}>
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-20">
					<motion.div
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="flex-1"
					>
						<p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 mb-4">
							Seller Advantage
						</p>
						<h2
							className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight leading-[1.05] mb-8"
							style={{ fontFamily: "'Cormorant Garamond', serif" }}
						>
							Merchant{" "}
							<span className="italic text-gold-500">Intelligence.</span>
						</h2>
						<p className="text-dark-400 text-lg font-light mb-8 leading-relaxed">
							Monetize your luxury wardrobe with Pakistan's most sophisticated
							resale engine. We handle the digital KYC, AI-assisted pricing, and
							insured logistics while you curate your legacy.
						</p>
						<div className="grid grid-cols-2 gap-6">
							{[
								{
									title: "Neural Pricing",
									desc: "AI-driven market data for optimal value.",
								},
								{
									title: "Identity Vault",
									desc: "KYC-verified status for instant trust.",
								},
								{
									title: "Doorstep Pickup",
									desc: "Insured logistics from your home.",
								},
								{
									title: "Fast Payouts",
									desc: "Secure transfers in under 24 hours.",
								},
							].map((item, i) => (
								<div key={i} className="space-y-2">
									<h4 className="font-bold text-gold-500 text-sm">
										{item.title}
									</h4>
									<p className="text-xs text-dark-500 leading-relaxed">
										{item.desc}
									</p>
								</div>
							))}
						</div>
						<div className="pt-10">
							<Link
								href="/register"
								className="px-8 py-4 bg-gold-500 text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-105 transition-all shadow-gold inline-flex items-center gap-3"
							>
								Become a Merchant <ArrowRight size={14} />
							</Link>
						</div>
					</motion.div>
					<motion.div
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						viewport={{ once: true }}
						className="flex-1 relative h-[500px] w-full rounded-[48px] overflow-hidden glass-ultra border border-white/5"
					>
						<Image
							src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&q=80&w=1000"
							alt="Merchant Dashboard"
							fill
							sizes="(max-width: 768px) 100vw, 50vw"
							className="object-cover opacity-50"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-dark-950 to-transparent" />
						<div className="absolute bottom-10 left-10 right-10 p-8 glass-crystal border border-white/10 rounded-3xl">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
									<TrendingUp size={20} className="text-emerald-500" />
								</div>
								<div>
									<p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
										Global Status
									</p>
									<p className="text-sm font-bold text-emerald-500">
										Shop Health: Elite 99.8%
									</p>
								</div>
							</div>
							<p className="text-xs text-gray-300 leading-relaxed italic">
								"The AI pricing suggested 15% higher than I expected, and it
								sold in 2 hours. Truly next-level." — Verified Merchant
							</p>
						</div>
					</motion.div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem" }}>
				<div className="max-w-7xl mx-auto text-center">
					<p className="text-[9px] font-black uppercase tracking-[0.4em] text-gold-500 mb-4">
						Collector Stories
					</p>
					<h2
						className="text-[clamp(2.5rem,5vw,5rem)] font-bold tracking-tight leading-[1.05] mb-20"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						Voices of <span className="italic text-gold-500">Trust.</span>
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{reviews.map((rev, i) => (
							<motion.div
								key={i}
								initial={{ opacity: 0, y: 40 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ delay: i * 0.1 }}
								viewport={{ once: true }}
							>
								<TiltCard className="h-full bg-surface border border-white/5 rounded-[36px] p-10 relative text-left">
									<Quote
										size={48}
										className="absolute top-8 right-8 text-white/5"
									/>
									<div className="flex gap-1 mb-6">
										{[...Array(5)].map((_, j) => (
											<Star
												key={j}
												size={14}
												className="fill-gold-500 text-gold-500"
											/>
										))}
									</div>
									<p
										className="text-xl italic font-light leading-relaxed mb-8"
										style={{ fontFamily: "'Cormorant Garamond', serif" }}
									>
										"{rev.text}"
									</p>
									<div className="flex items-center gap-4 pt-6 border-t border-white/5">
										<div
											className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-xl font-bold text-gold-500"
											style={{ fontFamily: "'Cormorant Garamond', serif" }}
										>
											{rev.name[0]}
										</div>
										<div>
											<p className="font-bold text-sm">{rev.name}</p>
											<p className="text-[10px] font-black uppercase tracking-widest text-gold-500">
												Verified Buyer of {rev.item}
											</p>
										</div>
									</div>
								</TiltCard>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			<section style={{ padding: "8rem 1.5rem", background: c.surfaceAlt }}>
				<div className="max-w-3xl mx-auto text-center">
					<Gem size={40} className="text-gold-500 mx-auto mb-8" />
					<h2
						className="text-[clamp(2.5rem,6vw,6rem)] font-bold tracking-tighter leading-[0.95] mb-8"
						style={{ fontFamily: "'Cormorant Garamond', serif" }}
					>
						Your next
						<br />
						<span className="italic text-gold-500">treasure awaits.</span>
					</h2>
					<p className="text-dark-400 text-lg font-light mb-12 max-w-lg mx-auto">
						Join thousands of collectors who trust the Vault. Buy, sell, and
						curate luxury fashion — sustainably.
					</p>
					<div className="flex flex-wrap justify-center gap-4">
						<Link
							href="/products"
							className="px-12 py-5 bg-gold-500 text-white rounded-2xl font-bold uppercase tracking-widest text-sm hover:scale-105 transition-all shadow-2xl"
						>
							Explore the Vault
						</Link>
						<Link
							href="/register"
							className="px-12 py-5 border border-white/10 rounded-2xl font-bold text-sm hover:bg-white/5 transition-all"
						>
							Join for Free
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
