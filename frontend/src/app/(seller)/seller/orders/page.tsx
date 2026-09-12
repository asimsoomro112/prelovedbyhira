"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronRight,
	Clock,
	MapPin,
	Package,
	Phone,
	ShieldCheck,
	ShoppingBag,
	Truck,
	X,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import api from "@/lib/api";

/* ─────────────────────────────────────────────
   Types
───────────────────────────────────────────── */
type Order = {
	id: string;
	status: string;
	totalPrice: number;
	productId: string;
	product?: { title?: string; images?: string[] };
	buyer: { name: string };
	shippingAddress: string | { address?: string; city?: string; phone?: string };
};

/* ─────────────────────────────────────────────
   Status helpers
───────────────────────────────────────────── */
function getStatusStyle(status: string) {
	const map: Record<string, string> = {
		PENDING: "bg-amber-500/10   text-amber-500",
		PAYMENT_SUBMITTED: "bg-indigo-500/10 text-indigo-500",
		PAID: "bg-blue-500/10    text-blue-500",
		SHIPPED: "bg-purple-500/10  text-purple-500",
		DELIVERED: "bg-teal-500/10    text-teal-500",
		CONFIRMED: "bg-emerald-500/10 text-emerald-500",
		DISPUTED: "bg-red-500/10     text-red-500",
	};
	return map[status] ?? "bg-gray-500/10 text-gray-500";
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
	PENDING: <Package className="w-3.5 h-3.5" />,
	PAYMENT_SUBMITTED: <Clock className="w-3.5 h-3.5" />,
	PAID: <ShieldCheck className="w-3.5 h-3.5" />,
	SHIPPED: <Truck className="w-3.5 h-3.5" />,
	DELIVERED: <ChevronRight className="w-3.5 h-3.5" />,
	CONFIRMED: <ShieldCheck className="w-3.5 h-3.5" />,
	DISPUTED: <X className="w-3.5 h-3.5" />,
};

const TABS = [
	"ALL",
	"PENDING",
	"PAID",
	"SHIPPED",
	"DELIVERED",
	"CONFIRMED",
	"DISPUTED",
] as const;

/* ─────────────────────────────────────────────
   Shipping address helper
───────────────────────────────────────────── */
function parseAddress(raw: Order["shippingAddress"]) {
	if (typeof raw === "object" && raw !== null) {
		return {
			full: [raw.address, raw.city].filter(Boolean).join(", ") || "No address",
			phone: raw.phone || "No phone",
		};
	}
	return { full: raw || "No address", phone: "See address" };
}

/* ─────────────────────────────────────────────
   Main Page
───────────────────────────────────────────── */
export default function SellerOrdersPage() {
	const [activeTab, setActiveTab] = useState<string>("ALL");
	const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
	const [isShippingModal, setIsShippingModal] = useState(false);
	const [trackingNumber, setTrackingNumber] = useState("");
	const queryClient = useQueryClient();

	const { data: orders, isLoading } = useQuery<Order[]>({
		queryKey: ["seller-orders", activeTab],
		queryFn: async () => {
			const { data } = await api.get("/orders/seller-orders");
			return activeTab === "ALL"
				? data
				: data.filter((o: Order) => o.status === activeTab);
		},
	});

	const shipMutation = useMutation({
		mutationFn: ({
			orderId,
			tracking,
		}: {
			orderId: string;
			tracking: string;
		}) => api.put(`/orders/${orderId}/ship`, { trackingNumber: tracking }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["seller-orders"] });
			toast.success("Order marked as shipped!");
			closeModal();
		},
		onError: (error: any) =>
			toast.error(
				error.response?.data?.message || "Failed to update order status.",
			),
	});

	function openDetails(order: Order) {
		setSelectedOrder(order);
		setIsShippingModal(false);
	}
	function openShipping(order: Order) {
		setSelectedOrder(order);
		setIsShippingModal(true);
	}
	function closeModal() {
		setSelectedOrder(null);
		setIsShippingModal(false);
		setTrackingNumber("");
	}

	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		setMounted(true);
	}, []);

	return (
		<>
			{/* ── PAGE WRAPPER ── */}
			<div className="min-h-screen px-4 pt-6 pb-40 md:pb-12 md:px-8 space-y-6 overflow-x-hidden max-w-[100vw]">
				{/* ── HEADER ── */}
				<div className="space-y-1">
					<h1 className="text-2xl md:text-3xl font-display font-bold leading-tight">
						Manage Orders
					</h1>
					<p className="text-sm text-gray-500">
						Track your sales and ship items to customers.
					</p>
				</div>

				{/* ── TAB STRIP ── */}
				<div
					className="
            -mx-4 px-4
            flex items-center gap-2
            overflow-x-auto scroll-smooth
            scrollbar-none
            [&::-webkit-scrollbar]:hidden
          "
					style={{ WebkitOverflowScrolling: "touch" }}
				>
					{TABS.map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`
                min-w-max flex items-center gap-1.5
                px-4 py-2.5 rounded-xl
                text-[11px] font-bold uppercase tracking-widest
                transition-all duration-200
                min-h-[44px]
                ${
									activeTab === tab
										? "bg-white dark:bg-dark-800 text-gold-400 shadow-soft"
										: "text-gray-400 hover:text-gray-600 active:text-gray-700"
								}
              `}
						>
							{STATUS_ICONS[tab] ?? null}
							{tab}
						</button>
					))}
				</div>

				{/* ── ORDERS LIST ── */}
				{isLoading ? (
					<div className="space-y-4">
						{Array(3)
							.fill(0)
							.map((_, i) => (
								<div
									key={i}
									className="h-40 bg-white dark:bg-dark-800 rounded-3xl animate-pulse"
								/>
							))}
					</div>
				) : !orders || orders.length === 0 ? (
					<EmptyState tab={activeTab} />
				) : (
					<div className="space-y-4">
						{orders.map((order, idx) => (
							<OrderCard
								key={order.id}
								order={order}
								index={idx}
								onDetails={() => openDetails(order)}
								onShip={() => openShipping(order)}
							/>
						))}
					</div>
				)}
			</div>

			{/* ── BOTTOM-SHEET / MODAL (via Portal) ── */}
			{mounted &&
				createPortal(
					<AnimatePresence>
						{selectedOrder && (
							<OrderSheet
								order={selectedOrder}
								isShipping={isShippingModal}
								trackingNumber={trackingNumber}
								onTrackingChange={setTrackingNumber}
								onClose={closeModal}
								onConfirmShip={() =>
									shipMutation.mutate({
										orderId: selectedOrder.id,
										tracking: trackingNumber,
									})
								}
								isPending={shipMutation.isPending}
							/>
						)}
					</AnimatePresence>,
					document.body,
				)}
		</>
	);
}

/* ─────────────────────────────────────────────
   OrderCard
───────────────────────────────────────────── */
function OrderCard({
	order,
	index,
	onDetails,
	onShip,
}: {
	order: Order;
	index: number;
	onDetails: () => void;
	onShip: () => void;
}) {
	const { full: address } = parseAddress(order.shippingAddress);
	const imgSrc =
		order.product?.images?.[0] ||
		"https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=600";

	return (
		<motion.article
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: index * 0.05, duration: 0.3 }}
			className="
        bg-white dark:bg-dark-800
        rounded-[28px] overflow-hidden
        border border-gold-400/10
        shadow-soft
        transition-all duration-300
        hover:border-gold-400/30
      "
		>
			{/* ── TOP ROW: image + core info ── */}
			<div className="flex gap-4 p-4">
				{/* Thumbnail — fixed small on mobile, a bit bigger on md */}
				<div className="relative w-20 h-20 md:w-28 md:h-28 rounded-2xl overflow-hidden shrink-0 border border-gold-400/10">
					<Image
						src={imgSrc}
						alt={order.product?.title || "Product"}
						fill
						sizes="(max-width: 768px) 80px, 112px"
						className="object-cover"
					/>
				</div>

				{/* Info */}
				<div className="flex-1 min-w-0 flex flex-col justify-between gap-2">
					{/* Status + ID */}
					<div className="flex flex-wrap items-center gap-2">
						<span
							className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStatusStyle(order.status)}`}
						>
							{STATUS_ICONS[order.status]}
							{order.status === "PAYMENT_SUBMITTED"
								? "Audit in Progress"
								: order.status}
						</span>
						<span className="text-[10px] font-mono text-gray-400">
							#{order.id.slice(-6)}
						</span>
					</div>

					{/* Title */}
					<h3 className="text-base font-display font-bold leading-snug line-clamp-2">
						{order.product?.title || "Unknown Product"}
					</h3>

					{/* Price + Buyer */}
					<div className="flex items-center justify-between gap-2">
						<p className="text-lg font-accent font-bold text-gold-400">
							Rs.&nbsp;{order.totalPrice.toLocaleString()}
						</p>
						<p className="text-[11px] text-gray-400 font-bold truncate max-w-[120px]">
							{order.buyer.name}
						</p>
					</div>
				</div>
			</div>

			{/* ── ADDRESS STRIP ── */}
			<div className="mx-4 mb-3 flex items-start gap-2 px-3 py-2.5 bg-cream-50 dark:bg-dark-900/50 rounded-xl border border-gold-400/5">
				<MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
				<p className="text-xs text-gray-500 leading-relaxed [overflow-wrap:anywhere] line-clamp-1 flex-1">
					{address}
				</p>
			</div>

			{/* ── PAID NOTICE ── */}
			{order.status === "PAID" && (
				<div className="mx-4 mb-3 flex items-start gap-3 p-3 bg-emerald-500/5 border border-dashed border-emerald-500/20 rounded-2xl">
					<ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
					<p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium leading-relaxed">
						Payment confirmed! Ship the item and add tracking below.
					</p>
				</div>
			)}

			{/* ── PAYMENT SUBMITTED NOTICE ── */}
			{order.status === "PAYMENT_SUBMITTED" && (
				<div className="mx-4 mb-3 flex items-start gap-3 p-3 bg-indigo-500/5 border border-dashed border-indigo-500/20 rounded-2xl">
					<Clock className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
					<p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium leading-relaxed">
						Payment submitted by customer. Please wait for admin verification
						before shipping.
					</p>
				</div>
			)}

			{/* ── ACTION BUTTONS ── */}
			{/*
        On mobile: full-width stacked buttons.
        On sm+: side-by-side.
        Each button is min 48px tall for touch.
      */}
			<div className="flex flex-col sm:flex-row gap-2 p-4 pt-1">
				{order.status === "PAID" && (
					<button
						onClick={onShip}
						className="
              flex-1 flex items-center justify-center gap-2
              min-h-[48px] px-5
              bg-emerald-500 text-white
              rounded-2xl font-bold text-sm
              shadow-lg shadow-emerald-500/20
              active:scale-95 transition-all duration-150
            "
					>
						<Truck className="w-4 h-4" />
						Ship Now
					</button>
				)}
				<button
					onClick={onDetails}
					className="
            flex-1 flex items-center justify-center gap-2
            min-h-[48px] px-5
            border-2 border-gold-400 text-gold-400
            rounded-2xl font-bold text-sm
            hover:bg-gold-400/10 active:scale-95 transition-all duration-150
          "
				>
					<ChevronRight className="w-4 h-4" />
					View Details
				</button>
			</div>
		</motion.article>
	);
}

/* ─────────────────────────────────────────────
   OrderSheet
   — Bottom sheet on mobile, centered modal on md+
───────────────────────────────────────────── */
function OrderSheet({
	order,
	isShipping,
	trackingNumber,
	onTrackingChange,
	onClose,
	onConfirmShip,
	isPending,
}: {
	order: Order;
	isShipping: boolean;
	trackingNumber: string;
	onTrackingChange: (v: string) => void;
	onClose: () => void;
	onConfirmShip: () => void;
	isPending: boolean;
}) {
	const { full: address, phone } = parseAddress(order.shippingAddress);

	return (
		<>
			{/* Backdrop */}
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				exit={{ opacity: 0 }}
				onClick={onClose}
				className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200]"
			/>

			{/*
        Sheet:
        - Mobile (< md): slides up from bottom, fills width, rounded top corners
        - Desktop (md+): centered modal with max-w-md
      */}
			<motion.div
				initial={{ y: "100%", opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				exit={{ y: "100%", opacity: 0 }}
				transition={{ type: "spring", damping: 30, stiffness: 320 }}
				className="
          fixed z-[500]
          bottom-0 left-0 right-0 
          bg-white dark:bg-dark-900 
          rounded-t-[40px] shadow-2xl
          border-t border-gold-400/10
          max-h-[85vh] overflow-y-auto scrollbar-none
          md:bottom-auto md:top-1/2 md:left-1/2 
          md:-translate-x-1/2 md:-translate-y-1/2 
          md:rounded-[40px] md:max-w-md md:w-full
        "
				style={{
					paddingBottom: "calc(env(safe-area-inset-bottom, 16px) + 100px)",
					zIndex: 9999,
				}}
			>
				{/* Drag handle (mobile only) */}
				<div className="flex justify-center pt-4 pb-1 md:hidden">
					<div className="w-10 h-1 bg-gray-200 dark:bg-dark-700 rounded-full" />
				</div>

				<div className="px-6 pt-4 pb-6 md:p-10 space-y-6">
					{/* ── HEADER ── */}
					<div className="flex items-start justify-between gap-4">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 bg-gold-400/10 text-gold-400 rounded-2xl flex items-center justify-center shrink-0">
								{isShipping ? (
									<Truck className="w-6 h-6" />
								) : (
									<Package className="w-6 h-6" />
								)}
							</div>
							<div>
								<h2 className="text-xl font-display font-bold leading-tight">
									{isShipping ? "Ship Item" : "Order Details"}
								</h2>
								<p className="text-xs text-gray-400 mt-0.5">
									#{order.id.slice(-8)}
								</p>
							</div>
						</div>
						{/* Close button — 44×44 touch target */}
						<button
							onClick={onClose}
							className="w-11 h-11 flex items-center justify-center rounded-xl bg-gray-100 dark:bg-dark-800 text-gray-500 active:scale-95 transition-all shrink-0"
							aria-label="Close"
						>
							<X className="w-5 h-5" />
						</button>
					</div>

					{/* ── DETAILS CARD ── */}
					<div className="bg-cream-50 dark:bg-dark-800 rounded-2xl border border-gold-400/10 overflow-hidden">
						{/* Amount row */}
						<div className="flex items-center justify-between px-4 py-3 border-b border-gold-400/5">
							<span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">
								Order Amount
							</span>
							<span className="text-xl font-accent font-bold text-gold-400">
								Rs.&nbsp;{order.totalPrice.toLocaleString()}
							</span>
						</div>

						{/* Buyer */}
						<div className="px-4 py-3 border-b border-gold-400/5">
							<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
								Buyer
							</p>
							<p className="text-sm font-bold">
								{order.buyer?.name || "Preloved Member"}
							</p>
						</div>

						{/* Address */}
						<div className="flex items-start gap-3 px-4 py-3 border-b border-gold-400/5">
							<MapPin className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
							<div>
								<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
									Shipping Address
								</p>
								<p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 [overflow-wrap:anywhere]">
									{address}
								</p>
							</div>
						</div>

						{/* Phone */}
						<div className="flex items-start gap-3 px-4 py-3">
							<Phone className="w-4 h-4 text-gold-400 shrink-0 mt-0.5" />
							<div>
								<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
									Contact
								</p>
								<p className="text-sm font-medium text-gray-600 dark:text-gray-300">
									{phone}
								</p>
							</div>
						</div>
					</div>

					{/* ── TRACKING FORM (shipping mode only) ── */}
					{isShipping && (
						<div className="space-y-3">
							<label
								htmlFor="tracking"
								className="block text-xs font-bold text-gray-500 uppercase tracking-widest"
							>
								Tracking Number / Courier Info
							</label>
							{/* font-size 16px prevents iOS auto-zoom on focus */}
							<input
								id="tracking"
								value={trackingNumber}
								onChange={(e) => onTrackingChange(e.target.value)}
								placeholder="e.g. TCS-918239123"
								autoComplete="off"
								className="
                  w-full min-h-[52px]
                  bg-cream-50 dark:bg-dark-800
                  border-2 border-gold-400/20
                  focus:border-gold-400
                  rounded-2xl px-4
                  text-base font-bold
                  outline-none transition-all
                "
								style={{
									fontSize: "16px",
								}} /* explicit 16px — prevents iOS zoom */
							/>
						</div>
					)}

					{/* ── ACTION BUTTONS ── */}
					<div className="flex flex-col gap-3">
						{isShipping && (
							<button
								onClick={onConfirmShip}
								disabled={isPending || !trackingNumber.trim()}
								className="
                  w-full min-h-[52px] flex items-center justify-center gap-2
                  bg-gold-400 text-white
                  rounded-2xl font-bold text-base
                  shadow-gold
                  active:scale-95 transition-all
                  disabled:opacity-50 disabled:pointer-events-none
                "
							>
								<Truck className="w-5 h-5" />
								{isPending ? "Updating…" : "Confirm Shipping"}
							</button>
						)}
						<button
							onClick={onClose}
							className="
                w-full min-h-[52px] flex items-center justify-center
                border-2 border-gold-400 text-gold-400
                rounded-2xl font-bold text-base
                hover:bg-gold-400/5 active:scale-95 transition-all
              "
						>
							{isShipping ? "Cancel" : "Close"}
						</button>
					</div>
				</div>
			</motion.div>
		</>
	);
}

/* ─────────────────────────────────────────────
   EmptyState
───────────────────────────────────────────── */
function EmptyState({ tab }: { tab: string }) {
	return (
		<div
			className="
      flex flex-col items-center justify-center
      py-16 px-6 text-center
      bg-white dark:bg-dark-800
      rounded-[32px] border border-gold-400/10
    "
		>
			<div className="w-16 h-16 bg-gold-400/10 rounded-full flex items-center justify-center mb-4">
				<ShoppingBag className="w-8 h-8 text-gold-400/40" />
			</div>
			<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400 max-w-[200px] leading-relaxed">
				No orders found{tab !== "ALL" ? ` in ${tab}` : ""}
			</p>
		</div>
	);
}
