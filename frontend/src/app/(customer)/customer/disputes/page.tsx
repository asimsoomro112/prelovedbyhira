"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, Package } from "lucide-react";
import Link from "next/link";
import api from "@/lib/api";

export default function DisputeCenterPage() {
	const { data: disputes, isLoading } = useQuery({
		queryKey: ["customer-disputes"],
		queryFn: async () => {
			const { data } = await api.get("/disputes/my");
			return data;
		},
	});

	return (
		<div className="max-w-screen-xl mx-auto px-6 py-12 space-y-12">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div>
					<h1 className="text-4xl font-display font-bold text-red-500 flex items-center gap-3">
						<AlertTriangle className="w-10 h-10" /> Dispute Center
					</h1>
					<p className="text-gray-500 mt-2">
						Manage your open claims and issues with orders.
					</p>
				</div>
				<Link
					href="/customer/orders"
					className="px-6 py-3 bg-red-50 text-red-500 rounded-pill font-bold shadow-soft border border-red-500/20 hover:bg-red-100 transition-all"
				>
					Raise New Dispute
				</Link>
			</div>

			<div className="grid gap-6">
				{isLoading ? (
					<div className="text-center py-20">
						<div className="animate-spin w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full mx-auto" />
					</div>
				) : disputes?.length === 0 ? (
					<div className="text-center py-32 bg-white dark:bg-dark-900 rounded-[40px] border border-red-500/10">
						<CheckCircle2 className="w-16 h-16 text-emerald-500/50 mx-auto mb-6" />
						<h2 className="text-2xl font-display font-bold mb-2">
							No Disputes
						</h2>
						<p className="text-gray-500 mb-8">
							You haven't opened any disputes. Everything looks good!
						</p>
					</div>
				) : (
					disputes?.map((dispute: any) => (
						<motion.div
							key={dispute.id}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							className="bg-white dark:bg-dark-900 rounded-[32px] p-6 lg:p-8 shadow-soft border border-red-500/10 transition-all flex flex-col md:flex-row gap-8"
						>
							<div className="flex-1 space-y-4">
								<div className="flex items-center gap-3">
									<span
										className={`px-3 py-1 rounded-pill text-[10px] font-bold ${dispute.status === "OPEN" ? "bg-red-500/10 text-red-500" : "bg-gray-500/10 text-gray-500"}`}
									>
										{dispute.status}
									</span>
									<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
										#{dispute.id.slice(-8)}
									</span>
									<span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-dark-800 px-2 py-1 rounded-lg ml-auto">
										{new Date(dispute.createdAt).toLocaleDateString()}
									</span>
								</div>

								<h3 className="text-xl font-display font-bold text-dark-900 dark:text-cream-50">
									{dispute.reason}
								</h3>
								<p className="text-sm text-gray-500">{dispute.description}</p>

								<div className="flex items-center gap-2 pt-4">
									<Package className="w-4 h-4 text-gray-400" />
									<span className="text-xs font-bold text-gray-500">
										Related Order: #{dispute.orderId.slice(-8)}
									</span>
								</div>
							</div>

							{dispute.status === "CLOSED" && (
								<div className="w-full md:w-64 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl p-4 flex flex-col justify-center">
									<p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
										Resolution
									</p>
									<p className="font-bold text-sm">
										{dispute.resolution?.replace("_", " ")}
									</p>
									{dispute.adminNote && (
										<p className="text-xs text-gray-500 mt-2">
											"{dispute.adminNote}"
										</p>
									)}
								</div>
							)}
						</motion.div>
					))
				)}
			</div>
		</div>
	);
}
