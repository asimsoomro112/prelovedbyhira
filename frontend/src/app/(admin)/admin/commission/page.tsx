"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowUpRight,
	Calendar,
	Loader2,
	PieChart,
	Search,
	TrendingUp,
} from "lucide-react";
import { useState } from "react";
import api from "@/lib/api";

export default function CommissionTrackerPage() {
	const [searchTerm, setSearchTerm] = useState("");

	const { data: orders, isLoading } = useQuery({
		queryKey: ["admin-orders-commission"],
		queryFn: async () => {
			const { data } = await api.get("/admin/orders");
			return data;
		},
	});

	// Only consider orders that have reached at least PAID status to calculate generated commission
	const commissionOrders =
		orders?.filter((o: any) =>
			["PAID", "SHIPPED", "DELIVERED", "CONFIRMED"].includes(o.status),
		) || [];

	const filteredOrders = commissionOrders.filter(
		(o: any) =>
			o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
			o.seller?.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
	);

	const totalCommission = commissionOrders.reduce(
		(sum: number, o: any) => sum + (o.platformFee || o.totalPrice * 0.2),
		0,
	);
	const thisMonthCommission = commissionOrders
		.filter(
			(o: any) => new Date(o.createdAt).getMonth() === new Date().getMonth(),
		)
		.reduce(
			(sum: number, o: any) => sum + (o.platformFee || o.totalPrice * 0.2),
			0,
		);

	return (
		<div className="space-y-8 pb-20">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div>
					<h1 className="text-4xl font-display font-bold text-dark-900 dark:text-cream-50 flex items-center gap-3">
						<PieChart className="w-10 h-10 text-emerald-500" /> Commission
						Tracker
					</h1>
					<p className="text-gray-500 mt-2">
						Track the 20% platform fee generated from all successful
						transactions.
					</p>
				</div>
			</div>

			<div className="grid md:grid-cols-2 gap-6">
				<div className="bg-white dark:bg-dark-900 p-8 rounded-[40px] border border-emerald-500/20 shadow-card relative overflow-hidden">
					<div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
					<p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
						<TrendingUp className="w-4 h-4 text-emerald-500" /> Total Lifetime
						Revenue
					</p>
					<p className="text-5xl font-accent font-bold text-emerald-500">
						Rs. {totalCommission.toLocaleString()}
					</p>
				</div>
				<div className="bg-white dark:bg-dark-900 p-8 rounded-[40px] border border-gold-400/20 shadow-card relative overflow-hidden">
					<div className="absolute top-0 right-0 w-32 h-32 bg-gold-400/10 rounded-full blur-3xl" />
					<p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2">
						<Calendar className="w-4 h-4 text-gold-400" /> Revenue This Month
					</p>
					<p className="text-5xl font-accent font-bold text-gold-400">
						Rs. {thisMonthCommission.toLocaleString()}
					</p>
				</div>
			</div>

			<div className="bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden">
				<div className="p-6 border-b border-gold-400/10 flex flex-col md:flex-row items-center justify-between gap-4">
					<h2 className="text-xl font-bold font-display">Transaction Log</h2>
					<div className="relative w-full md:w-96">
						<Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
						<input
							type="text"
							placeholder="Search by Order ID or Seller..."
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
							className="w-full bg-cream-50 dark:bg-dark-800 border-none rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 text-sm"
						/>
					</div>
				</div>

				<div className="overflow-x-auto">
					<table className="w-full text-left border-collapse">
						<thead>
							<tr className="bg-cream-50 dark:bg-dark-800/50 text-[10px] uppercase tracking-widest text-gray-500">
								<th className="p-6 font-bold">Date</th>
								<th className="p-6 font-bold">Order ID</th>
								<th className="p-6 font-bold">Seller</th>
								<th className="p-6 font-bold text-right">Order Value</th>
								<th className="p-6 font-bold text-right">Commission (20%)</th>
								<th className="p-6 font-bold text-center">Status</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gold-400/5">
							{isLoading ? (
								<tr>
									<td colSpan={6} className="p-12 text-center">
										<Loader2 className="w-8 h-8 animate-spin mx-auto text-gold-400" />
									</td>
								</tr>
							) : filteredOrders.length === 0 ? (
								<tr>
									<td colSpan={6} className="p-12 text-center text-gray-500">
										No transactions found.
									</td>
								</tr>
							) : (
								filteredOrders.map((order: any) => {
									const commission =
										order.platformFee || order.totalPrice * 0.2;
									const isConfirmed = order.status === "CONFIRMED";

									return (
										<motion.tr
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											key={order.id}
											className="hover:bg-gold-400/5 transition-colors"
										>
											<td className="p-6 text-sm text-gray-500 font-medium">
												{new Date(order.createdAt).toLocaleDateString()}
											</td>
											<td className="p-6">
												<span className="text-xs font-bold text-dark-900 dark:text-cream-50 uppercase tracking-widest">
													#{order.id.slice(-8)}
												</span>
											</td>
											<td className="p-6">
												<div className="flex items-center gap-3">
													<div className="w-8 h-8 rounded-full bg-gold-400 text-white flex items-center justify-center text-xs font-bold">
														{order.seller?.user?.name?.[0] || "S"}
													</div>
													<span className="text-sm font-bold text-gray-600 dark:text-gray-300">
														{order.seller?.user?.name || "Unknown Seller"}
													</span>
												</div>
											</td>
											<td className="p-6 text-right">
												<p className="text-sm font-bold text-gray-500">
													Rs. {order.totalPrice.toLocaleString()}
												</p>
											</td>
											<td className="p-6 text-right">
												<p
													className={`text-lg font-bold flex items-center justify-end gap-1 ${isConfirmed ? "text-emerald-500" : "text-amber-500"}`}
												>
													{isConfirmed && <ArrowUpRight className="w-4 h-4" />}
													Rs. {commission.toLocaleString()}
												</p>
											</td>
											<td className="p-6 text-center">
												<span
													className={`px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest ${
														isConfirmed
															? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
															: "bg-amber-500/10 text-amber-500 border border-amber-500/20"
													}`}
												>
													{isConfirmed ? "Realized" : "Pending Escrow"}
												</span>
											</td>
										</motion.tr>
									);
								})
							)}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
