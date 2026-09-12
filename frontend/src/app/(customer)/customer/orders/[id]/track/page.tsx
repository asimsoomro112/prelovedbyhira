"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	CheckCircle2,
	ChevronLeft,
	ExternalLink,
	MapPin,
	Package,
	ShoppingBag,
	Truck,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import api from "@/lib/api";

const STEPS = [
	{ id: "PENDING", label: "Order Placed", icon: ShoppingBag },
	{ id: "PAID", label: "Payment Confirmed", icon: CheckCircle2 },
	{ id: "SHIPPED", label: "Order Shipped", icon: Truck },
	{ id: "DELIVERED", label: "Out for Delivery", icon: MapPin },
	{ id: "CONFIRMED", label: "Order Delivered", icon: Package },
];

export default function OrderTrackingPage() {
	const { id } = useParams();

	const { data: order, isLoading } = useQuery({
		queryKey: ["order-track", id],
		queryFn: async () => {
			const { data } = await api.get(`/orders/${id}`);
			return data;
		},
	});

	if (isLoading)
		return (
			<div className="h-screen flex items-center justify-center animate-pulse text-gold-400 font-bold uppercase tracking-widest">
				Finding your package...
			</div>
		);

	if (!order)
		return (
			<div className="h-screen flex items-center justify-center text-gray-500">
				Order not found or access restricted.
			</div>
		);

	const currentStepIndex = STEPS.findIndex((s) => s.id === order.status);
	const displayIndex =
		currentStepIndex === -1
			? order.status === "CANCELLED"
				? -1
				: 0
			: currentStepIndex;

	return (
		<div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
			<div className="flex items-center justify-between">
				<Link
					href="/customer/orders"
					className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gold-400 transition-colors"
				>
					<ChevronLeft className="w-4 h-4" /> Back to Orders
				</Link>
				<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
					Order Tracking #{order.id.slice(-8)}
				</span>
			</div>

			<div className="bg-white dark:bg-dark-900 rounded-[40px] p-8 lg:p-12 shadow-card border border-gold-400/10 space-y-12">
				<div className="text-center space-y-2">
					<h1 className="text-3xl font-display font-bold">
						Where&apos;s your order?
					</h1>
					<p className="text-gray-500">
						Your style is on its way to your doorstep.
					</p>
				</div>

				{/* TRACKING TIMELINE */}
				<div className="relative space-y-12">
					{/* Vertical Line */}
					<div className="absolute left-[21px] top-4 bottom-4 w-0.5 bg-gold-400/10" />

					{STEPS.map((step, i) => {
						const Icon = step.icon;
						const isCompleted = i <= displayIndex;
						const isCurrent = i === displayIndex;

						return (
							<div key={step.id} className="relative flex gap-8 group">
								<div
									className={`w-11 h-11 rounded-full flex items-center justify-center z-10 transition-all duration-500 ${
										isCompleted
											? "bg-gold-400 text-white shadow-gold scale-110"
											: "bg-white dark:bg-dark-800 text-gray-400 border-2 border-gold-400/10"
									}`}
								>
									<Icon className="w-5 h-5" />
								</div>

								<div className="flex-1 pb-4 border-b border-gold-400/5">
									<div className="flex items-center justify-between">
										<h3
											className={`text-lg font-bold transition-colors ${isCompleted ? "text-dark-900 dark:text-cream-50" : "text-gray-400"}`}
										>
											{step.label}
										</h3>
										{isCompleted && (
											<span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
												{isCurrent ? "In Progress" : "Completed"}
											</span>
										)}
									</div>
									{isCurrent &&
										order.status === "SHIPPED" &&
										order.trackingNumber && (
											<motion.div
												initial={{ opacity: 0, height: 0 }}
												animate={{ opacity: 1, height: "auto" }}
												className="mt-4 p-5 bg-gold-400/5 border border-gold-400/20 rounded-2xl space-y-2"
											>
												<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
													Tracking Number
												</p>
												<div className="flex items-center justify-between">
													<span className="text-xl font-accent font-bold text-gold-400">
														{order.trackingNumber}
													</span>
													<button className="flex items-center gap-2 text-xs font-bold text-gold-400 hover:underline">
														Track on Courier{" "}
														<ExternalLink className="w-3 h-3" />
													</button>
												</div>
											</motion.div>
										)}
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Shipping Details Summary */}
			<div className="bg-dark-900 text-white p-8 rounded-[40px] shadow-gold-lg border border-gold-400/10 flex items-center justify-between">
				<div className="flex items-center gap-6">
					<div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center text-gold-400">
						<MapPin className="w-8 h-8" />
					</div>
					<div>
						<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
							Shipping To
						</p>
						<h4 className="text-lg font-bold">{order.shippingAddress.name}</h4>
						<p className="text-xs text-gray-500">
							{order.shippingAddress.address}, {order.shippingAddress.city}
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
