import { motion } from "framer-motion";
import {
	Check,
	CheckCircle2,
	Lock,
	Minus,
	Play,
	RotateCcw,
	ShieldCheck,
	ShoppingBag,
	Timer,
	Zap,
} from "lucide-react";
import Link from "next/link";

interface ProductActionsProps {
	product: any;
	isAuthenticated: boolean;
	qty: number;
	pulsed: boolean;
	onAddBag: (qty: number) => void;
	openVideoModal: () => void;
	actionsRef: any;
}

export function AuthItem({ label, ok }: { label: string; ok: boolean }) {
	return (
		<div className="flex items-center gap-2.5">
			<div
				className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${ok ? "bg-emerald-500/15 text-emerald-500" : "bg-red-500/10 text-red-400"}`}
			>
				{ok ? <Check className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
			</div>
			<span
				className={`text-[11px] font-bold ${ok ? "text-dark-900 dark:text-cream-50" : "text-gray-400 line-through opacity-60"}`}
			>
				{label}
			</span>
		</div>
	);
}

export function ProductActions({
	product,
	isAuthenticated,
	qty,
	pulsed,
	onAddBag,
	openVideoModal,
	actionsRef,
}: ProductActionsProps) {
	return (
		<>
			{/* ── ACTION BUTTONS ───────────────────────────────── */}
			<div ref={actionsRef} className="space-y-3">
				{/* Primary CTA */}
				<motion.div
					animate={pulsed ? { scale: [1, 1.015, 1] } : {}}
					transition={{ repeat: 2, duration: 0.65 }}
				>
					<Link
						href={
							(product.stock || 0) > 0
								? isAuthenticated
									? `/checkout?id=${product.id}&qty=${qty}`
									: `/login?redirect=/checkout?id=${product.id}&qty=${qty}`
								: "#"
						}
						onClick={(e) => (product.stock || 0) <= 0 && e.preventDefault()}
						className={`group relative flex items-center justify-center gap-3 w-full h-[60px] lg:h-[68px] rounded-2xl font-black text-base lg:text-lg shadow-gold transition-all overflow-hidden ${
							(product.stock || 0) > 0
								? "bg-gradient-to-r from-gold-400 via-gold-500 to-gold-600 text-white hover:shadow-[0_8px_30px_rgba(212,175,55,0.5)] hover:scale-[1.01] active:scale-[0.98]"
								: "bg-gray-200 dark:bg-dark-800 text-gray-400 cursor-not-allowed shadow-none"
						}`}
					>
						<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
						<Zap className="w-5 h-5 shrink-0" />
						{(product.stock || 0) > 0
							? isAuthenticated
								? "Buy Now — Secure Checkout"
								: "Login to Checkout"
							: "Out of Stock"}
						<Lock className="w-4 h-4 shrink-0 opacity-70" />
					</Link>
				</motion.div>

				{/* Secondary */}
				<button
					onClick={() => onAddBag(qty)}
					disabled={(product.stock || 0) <= 0}
					className="flex items-center justify-center gap-3 w-full h-[52px] border-2 border-gold-400/35 text-gold-500 dark:text-gold-400 rounded-2xl font-bold text-sm lg:text-base hover:border-gold-400 hover:bg-gold-400/5 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
				>
					<ShoppingBag className="w-5 h-5" />{" "}
					{(product.stock || 0) > 0 ? "Add to Bag" : "Unavailable"}
				</button>

				{product.videoUrl && (
					<button
						onClick={openVideoModal}
						className="flex items-center justify-center gap-3 w-full h-[52px] bg-white dark:bg-dark-900 border border-gold-400/10 text-dark-900 dark:text-cream-50 rounded-2xl font-bold text-sm hover:border-gold-400/30 transition-all"
					>
						<Play className="w-4 h-4 fill-gold-400 text-gold-400" /> Watch
						product film
					</button>
				)}

				{/* Micro trust row */}
				<div className="flex items-center justify-center gap-5 pt-1 flex-wrap">
					{[
						{
							icon: <Timer className="w-3 h-3" />,
							text: "Ships 24h",
							c: "text-emerald-500",
						},
						{
							icon: <Lock className="w-3 h-3" />,
							text: "Escrow",
							c: "text-gold-400",
						},
						{
							icon: <RotateCcw className="w-3 h-3" />,
							text: "Returns",
							c: "text-gray-400",
						},
					].map((t, i) => (
						<span
							key={i}
							className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${t.c}`}
						>
							{t.icon} {t.text}
						</span>
					))}
				</div>
			</div>

			{/* ── AUTHENTICITY CARD ────────────────────────────── */}
			<div className="p-5 lg:p-6 bg-white dark:bg-dark-900 rounded-2xl lg:rounded-3xl border border-gold-400/10 shadow-sm">
				<div className="flex items-center justify-between mb-4">
					<div className="flex items-center gap-2.5">
						<div className="w-8 h-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
							<ShieldCheck className="w-4 h-4 text-emerald-500" />
						</div>
						<div>
							<p className="text-[11px] font-black text-dark-900 dark:text-cream-50 uppercase tracking-wider">
								Authenticity Checklist
							</p>
							<p className="text-[9px] text-gray-400 font-medium">
								Inspected by ReVault team
							</p>
						</div>
					</div>
					<span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-[9px] font-bold text-emerald-500 uppercase tracking-widest">
						<CheckCircle2 className="w-3 h-3" /> Verified
					</span>
				</div>

				<div className="grid grid-cols-2 gap-x-6 gap-y-3">
					<AuthItem label="Original Box/Bag" ok={product.originalPacking} />
					<AuthItem label="Invoice Available" ok={product.invoiceAvailable} />
					<AuthItem label="Unaltered/Original" ok={!product.isAltered} />
					<AuthItem label="Vetted by ReVault" ok={true} />
				</div>

				<div className="mt-4 pt-4 border-t border-gold-400/8 flex items-start gap-2">
					<Lock className="w-3.5 h-3.5 text-gold-400 mt-0.5 shrink-0" />
					<p className="text-[10px] text-gray-500 font-medium leading-relaxed">
						Payment held in{" "}
						<span className="text-gold-400 font-bold">escrow</span> until you
						confirm receipt. Full refund if item doesn't match listing.
					</p>
				</div>
			</div>
		</>
	);
}
