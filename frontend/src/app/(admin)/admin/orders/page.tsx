"use client";
import { AlertTriangle, Eye, ShieldCheck, X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminOrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [statusFilter, setStatusFilter] = useState("");

	// Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [modalMode, setModalMode] = useState<"CONFIRM" | "REJECT">("CONFIRM");
	const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchOrders = () => {
		setIsLoading(true);
		api
			.get("/admin/orders", { params: { status: statusFilter || undefined } })
			.then((r: any) => setOrders(r.data))
			.catch(() => {})
			.finally(() => setIsLoading(false));
	};

	useEffect(() => {
		fetchOrders();
	}, [fetchOrders]);

	const handleOpenModal = (id: string, mode: "CONFIRM" | "REJECT") => {
		setSelectedOrderId(id);
		setModalMode(mode);
		setRejectionReason("");
		setIsModalOpen(true);
	};

	const handleAction = async () => {
		if (!selectedOrderId) return;

		if (modalMode === "REJECT" && !rejectionReason.trim()) {
			toast.error("Please provide a reason for rejection");
			return;
		}

		setIsSubmitting(true);
		try {
			if (modalMode === "CONFIRM") {
				await api.put(`/orders/${selectedOrderId}/admin-confirm`);
				toast.success("Payment confirmed and seller notified! ✨");
			} else {
				await api.put(`/orders/${selectedOrderId}/admin-reject`, {
					reason: rejectionReason,
				});
				toast.success("Payment rejected. Customer has been notified.");
			}

			setIsModalOpen(false);
			fetchOrders();
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Action failed");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen pt-20 md:pt-28 pb-16">
			<div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8">
				<div className="flex flex-col md:flex-row md:items-end justify-between mb-8 md:mb-12 gap-6">
					<div className="space-y-1">
						<h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">
							Marketplace Orders
						</h1>
						<p className="text-gray-500 text-sm">
							Oversee neural audits and secure payments.
						</p>
					</div>
					<select
						value={statusFilter}
						onChange={(e) => setStatusFilter(e.target.value)}
						className="w-full md:w-auto bg-white dark:bg-dark-900 border-2 border-gold-400/10 rounded-2xl px-5 py-3 outline-none focus:border-gold-400 transition-all font-bold text-xs md:text-sm shadow-soft min-h-[48px]"
					>
						<option value="">All Status</option>
						<option>PENDING</option>
						<option>PAYMENT_SUBMITTED</option>
						<option>PAID</option>
						<option>SHIPPED</option>
						<option>DELIVERED</option>
						<option>CONFIRMED</option>
						<option>DISPUTED</option>
						<option>CANCELLED</option>
					</select>
				</div>

				<div className="bg-white dark:bg-dark-900 rounded-3xl md:rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
					<div className="hidden md:block overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="bg-cream-50 dark:bg-dark-950/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
									<th className="px-8 py-6">Order & Product</th>
									<th className="px-8 py-6">Participants</th>
									<th className="px-8 py-6">Financials</th>
									<th className="px-8 py-6">Status & AI Scan</th>
									<th className="px-8 py-6 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gold-400/10">
								{isLoading ? (
									<tr>
										<td
											colSpan={5}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest animate-pulse"
										>
											Retrieving vault records...
										</td>
									</tr>
								) : orders.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest"
										>
											No orders found
										</td>
									</tr>
								) : (
									orders.map((o) => (
										<tr
											key={o.id}
											className="hover:bg-gold-400/5 transition-colors group"
										>
											<td className="px-8 py-6">
												<div className="space-y-1">
													<p className="font-bold text-sm text-gold-400 font-mono">
														#{o.id.slice(-8).toUpperCase()}
													</p>
													<p className="text-[11px] text-dark-900 dark:text-cream-50 font-bold leading-tight">
														{o.product?.title || "Luxury Item"}
													</p>
													<p className="text-[9px] text-gray-400 uppercase tracking-tighter">
														{new Date(o.createdAt).toLocaleDateString()}
													</p>
												</div>
											</td>
											<td className="px-8 py-6">
												<div className="space-y-2">
													<div className="flex items-center gap-2">
														<p className="text-xs font-bold text-dark-900 dark:text-cream-50">
															<span className="text-[9px] text-gray-400 uppercase mr-1">
																B:
															</span>{" "}
															{o.buyer?.name || "Unknown Buyer"}
														</p>
													</div>
													<div className="flex items-center gap-2">
														<p className="text-[10px] text-gray-500 font-medium">
															<span className="text-[9px] text-gray-400 uppercase mr-1">
																S:
															</span>{" "}
															{o.seller?.user?.name || "Verified Merchant"}
														</p>
													</div>
												</div>
											</td>
											<td className="px-8 py-6">
												<div className="space-y-1">
													<p className="font-accent font-bold text-dark-900 dark:text-cream-50 text-base">
														Rs. {o.totalPrice?.toLocaleString()}
													</p>
													<div className="flex flex-col">
														<span className="text-[9px] font-bold text-emerald-500 uppercase">
															Comm: Rs. {o.platformFee?.toLocaleString()}
														</span>
														<span className="text-[9px] font-bold text-blue-500 uppercase">
															Ship: Rs.{" "}
															{o.shippingCost?.toLocaleString() || "0"}
														</span>
													</div>
												</div>
											</td>
											<td className="px-8 py-6">
												<div className="flex flex-col gap-2">
													<span
														className={`w-fit px-3 py-1 rounded-pill text-[9px] font-bold uppercase tracking-widest border ${
															o.status === "CONFIRMED"
																? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
																: o.status === "PAID"
																	? "bg-blue-500/10 text-blue-500 border-blue-500/20"
																	: o.status === "PAYMENT_SUBMITTED"
																		? "bg-amber-500/10 text-amber-500 border-amber-500/20"
																		: o.status === "SHIPPED"
																			? "bg-purple-500/10 text-purple-500 border-purple-500/20"
																			: "bg-gold-400/10 text-gold-400 border-gold-400/20"
														}`}
													>
														{o.status}
													</span>

													{o.aiVerified && (
														<div className="flex items-center gap-1 text-[9px] font-bold text-emerald-500 uppercase">
															<ShieldCheck className="w-3 h-3" /> AI Verified
														</div>
													)}

													{o.paymentProofUrl && (
														<a
															href={o.paymentProofUrl}
															target="_blank"
															className="inline-flex items-center gap-1 text-[9px] font-bold text-gold-400 hover:underline"
															rel="noopener"
														>
															<Eye className="w-3 h-3" /> View Customer Receipt
														</a>
													)}

													{o.paymentRejected && (
														<div className="flex flex-col gap-1">
															<span className="text-[9px] font-bold text-red-500 uppercase flex items-center gap-1">
																<AlertTriangle className="w-3 h-3" /> Rejected
															</span>
															<p className="text-[8px] text-gray-400 italic leading-tight max-w-[150px]">
																Reason: {o.rejectionReason}
															</p>
														</div>
													)}
												</div>
											</td>
											<td className="px-8 py-6 text-right">
												{o.status === "PAYMENT_SUBMITTED" && (
													<div className="flex justify-end gap-2">
														<button
															onClick={() => handleOpenModal(o.id, "REJECT")}
															className="px-4 py-2 border-2 border-red-500/20 text-red-500 rounded-xl text-[10px] font-bold hover:bg-red-500 hover:text-white transition-all min-h-[36px]"
														>
															Reject
														</button>
														<button
															onClick={() => handleOpenModal(o.id, "CONFIRM")}
															className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-bold shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all min-h-[36px]"
														>
															Confirm
														</button>
													</div>
												)}
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>

					{/* ✅ Mobile Card View */}
					<div className="md:hidden divide-y divide-gold-400/10">
						{isLoading ? (
							<div className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest animate-pulse">
								Loading...
							</div>
						) : orders.length === 0 ? (
							<div className="p-10 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">
								No orders found
							</div>
						) : (
							orders.map((o) => (
								<div
									key={o.id}
									className="p-5 space-y-4 active:bg-gold-400/5 transition-all"
								>
									<div className="flex justify-between items-start">
										<div className="space-y-1">
											<p className="font-bold text-[10px] text-gold-400 font-mono">
												#{o.id.slice(-8).toUpperCase()}
											</p>
											<p className="text-xs font-bold text-dark-900 dark:text-cream-50 leading-snug">
												{o.product?.title || "Luxury Item"}
											</p>
											<p className="text-[9px] text-gray-400 uppercase tracking-tighter">
												{new Date(o.createdAt).toLocaleDateString()}
											</p>
										</div>
										<span
											className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${
												o.status === "CONFIRMED"
													? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
													: o.status === "PAID"
														? "bg-blue-500/10 text-blue-500 border-blue-500/20"
														: o.status === "PAYMENT_SUBMITTED"
															? "bg-amber-500/10 text-amber-500 border-amber-500/20"
															: "bg-gold-400/10 text-gold-400 border-gold-400/20"
											}`}
										>
											{o.status}
										</span>
									</div>

									<div className="grid grid-cols-2 gap-4 py-3 border-y border-gold-400/5">
										<div>
											<p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
												Buyer
											</p>
											<p className="text-[11px] font-bold truncate">
												{o.buyer?.name || "Unknown"}
											</p>
										</div>
										<div>
											<p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest mb-1">
												Seller
											</p>
											<p className="text-[11px] font-medium truncate text-gray-500">
												{o.seller?.user?.name || "Verified"}
											</p>
										</div>
									</div>

									<div className="flex justify-between items-end">
										<div className="space-y-1">
											<p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
												Total Price
											</p>
											<p className="text-base font-accent font-bold text-gold-400">
												Rs. {o.totalPrice?.toLocaleString()}
											</p>
										</div>
										<div className="flex flex-col gap-2 items-end">
											{o.paymentProofUrl && (
												<a
													href={o.paymentProofUrl}
													target="_blank"
													className="flex items-center gap-1 text-[10px] font-bold text-gold-400"
													rel="noopener"
												>
													<Eye className="w-3.5 h-3.5" /> Receipt
												</a>
											)}
											{o.status === "PAYMENT_SUBMITTED" && (
												<div className="flex gap-2">
													<button
														onClick={() => handleOpenModal(o.id, "REJECT")}
														className="px-3 py-2 border border-red-500/20 text-red-500 rounded-lg text-[10px] font-bold active:bg-red-500 active:text-white transition-all min-h-[32px]"
													>
														Reject
													</button>
													<button
														onClick={() => handleOpenModal(o.id, "CONFIRM")}
														className="px-3 py-2 bg-emerald-500 text-white rounded-lg text-[10px] font-bold active:scale-95 transition-all min-h-[32px]"
													>
														Confirm
													</button>
												</div>
											)}
										</div>
									</div>
								</div>
							))
						)}
					</div>
				</div>
			</div>

			{/* Action Modal (Confirm/Reject) */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[150] flex items-center justify-center p-4 md:p-6">
					<div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-3xl md:rounded-[40px] p-6 md:p-10 relative shadow-2xl border border-gold-400/10 max-h-[90vh] overflow-y-auto">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gold-400"
						>
							<X className="w-6 h-6" />
						</button>

						<div className="space-y-6">
							<div className="text-center">
								<div
									className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-4 ${
										modalMode === "CONFIRM"
											? "bg-emerald-500/10 text-emerald-500"
											: "bg-red-500/10 text-red-500"
									}`}
								>
									{modalMode === "CONFIRM" ? (
										<ShieldCheck className="w-8 h-8" />
									) : (
										<AlertTriangle className="w-8 h-8" />
									)}
								</div>
								<h3 className="text-xl md:text-2xl font-display font-bold">
									{modalMode === "CONFIRM"
										? "Confirm Payment"
										: "Reject Payment"}
								</h3>
								<p className="text-xs md:text-sm text-gray-500 mt-2">
									{modalMode === "CONFIRM"
										? "Confirm receipt of payment from the customer."
										: "Tell the customer why their payment proof was rejected."}
								</p>
							</div>

							{modalMode === "REJECT" ? (
								<div className="space-y-2">
									<label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">
										Rejection Reason
									</label>
									<textarea
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										placeholder="e.g. Incorrect amount, blurry screenshot, or wrong bank details..."
										className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl p-4 outline-none focus:border-red-500 transition-all text-sm min-h-[120px] resize-none"
									/>
								</div>
							) : (
								<div className="bg-emerald-500/5 p-6 rounded-2xl border border-emerald-500/10">
									<p className="text-sm text-center text-gray-600 dark:text-gray-300">
										You are about to confirm that the customer's payment has
										been received in the vault. The seller will be notified to
										ship the item.
									</p>
								</div>
							)}

							<div className="flex flex-col sm:flex-row gap-3 md:gap-4">
								<button
									onClick={() => setIsModalOpen(false)}
									className="w-full sm:flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold text-gray-500 active:scale-95 transition-all min-h-[48px]"
								>
									Cancel
								</button>
								<button
									disabled={isSubmitting}
									onClick={handleAction}
									className={`w-full sm:flex-[2] py-4 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all min-h-[48px] ${
										modalMode === "CONFIRM"
											? "bg-emerald-500 shadow-emerald-500/20"
											: "bg-red-500 shadow-red-500/20"
									}`}
								>
									{isSubmitting
										? "Processing..."
										: modalMode === "CONFIRM"
											? "Confirm Payment 🚀"
											: "Reject Payment ❌"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
