"use client";
import {
	Camera,
	CheckCircle,
	Eye,
	Image as ImageIcon,
	Upload,
	Wallet,
	X,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminPayoutsPage() {
	const [payouts, setPayouts] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(true);

	// Proof Modal State
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedPayoutId, setSelectedPayoutId] = useState<string | null>(null);
	const [proofFile, setProofFile] = useState<File | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const fetchPayouts = useCallback(() => {
		setIsLoading(true);
		api
			.get("/admin/payouts")
			.then((r: any) => setPayouts(r.data))
			.catch(() => {})
			.finally(() => setIsLoading(false));
	}, []);

	useEffect(() => {
		fetchPayouts();
	}, [fetchPayouts]);

	const handleOpenModal = (id: string) => {
		setSelectedPayoutId(id);
		setProofFile(null);
		setIsModalOpen(true);
	};

	const handlePayout = async (id: string, status: string) => {
		if (status === "COMPLETED" && !proofFile) {
			toast.error("Please upload proof of payment");
			return;
		}

		setIsSubmitting(true);
		try {
			const formData = new FormData();
			formData.append("status", status);
			if (proofFile) formData.append("proofImage", proofFile);

			await api.put(`/admin/payouts/${id}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			fetchPayouts();
			setIsModalOpen(false);
			toast.success(`Payout ${status.toLowerCase()} successfully`);
		} catch {
			toast.error("Failed to update payout");
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen pt-28 pb-16">
			<div className="max-w-6xl mx-auto px-6 lg:px-8">
				<div className="flex justify-between items-center mb-12">
					<div>
						<h1 className="text-4xl font-display font-bold">Seller Payouts</h1>
						<p className="text-gray-500">
							Review and process withdrawal requests from marketplace sellers.
						</p>
					</div>
					<div className="w-16 h-16 bg-gold-400/10 rounded-3xl flex items-center justify-center text-gold-400">
						<Wallet className="w-8 h-8" />
					</div>
				</div>

				<div className="bg-white dark:bg-dark-900 rounded-[40px] border border-gold-400/10 shadow-card overflow-hidden">
					<div className="overflow-x-auto">
						<table className="w-full text-left">
							<thead>
								<tr className="bg-cream-50 dark:bg-dark-950/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
									<th className="px-8 py-6">Seller & Account Details</th>
									<th className="px-8 py-6">Amount</th>
									<th className="px-8 py-6">Status</th>
									<th className="px-8 py-6 text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="divide-y divide-gold-400/10">
								{isLoading ? (
									<tr>
										<td
											colSpan={5}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest"
										>
											Loading payouts...
										</td>
									</tr>
								) : payouts.length === 0 ? (
									<tr>
										<td
											colSpan={5}
											className="p-20 text-center text-gray-400 font-bold uppercase text-xs tracking-widest"
										>
											No pending payouts
										</td>
									</tr>
								) : (
									payouts.map((p) => (
										<tr
											key={p.id}
											className="hover:bg-gold-400/5 transition-colors group"
										>
											<td className="px-8 py-6">
												<div className="flex flex-col gap-1">
													<p className="font-bold text-dark-900 dark:text-cream-50">
														{p.seller?.user?.name || "Unknown Seller"}
													</p>
													<div className="flex items-center gap-2">
														<span className="text-[10px] bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded-full font-bold">
															{p.method}
														</span>
														<p className="text-xs text-gray-500 font-medium">
															{p.details}
														</p>
													</div>
													<p className="text-[9px] text-gray-400 uppercase tracking-tighter">
														{p.seller?.user?.email}
													</p>
												</div>
											</td>
											<td className="px-8 py-6">
												<p className="font-accent font-bold text-gold-400 text-lg">
													Rs. {p.amount.toLocaleString()}
												</p>
											</td>
											<td className="px-8 py-6">
												<div className="flex flex-col gap-1">
													<span
														className={`inline-flex w-fit px-4 py-1.5 rounded-pill text-[10px] font-bold uppercase tracking-wider ${
															p.status === "COMPLETED"
																? "bg-emerald-500/10 text-emerald-500"
																: p.status === "REJECTED"
																	? "bg-red-500/10 text-red-500"
																	: "bg-amber-500/10 text-amber-500"
														}`}
													>
														{p.status}
													</span>
													{p.proofImage && (
														<a
															href={p.proofImage}
															target="_blank"
															className="text-[10px] text-gold-400 font-bold flex items-center gap-1 hover:underline"
															rel="noopener"
														>
															<Eye className="w-3 h-3" /> View Proof
														</a>
													)}
												</div>
											</td>
											<td className="px-8 py-6 text-right">
												{p.status === "PENDING" && (
													<div className="flex justify-end gap-2">
														<button
															onClick={() => handleOpenModal(p.id)}
															title="Approve with Proof"
															className="p-3 bg-emerald-500/10 text-emerald-500 rounded-2xl hover:bg-emerald-500 hover:text-white transition-all shadow-sm"
														>
															<CheckCircle className="w-5 h-5" />
														</button>
														<button
															onClick={() => {
																if (confirm("Reject this payout?"))
																	handlePayout(p.id, "REJECTED");
															}}
															title="Reject Payout"
															className="p-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all shadow-sm"
														>
															<XCircle className="w-5 h-5" />
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
				</div>
			</div>

			{/* Proof Upload Modal */}
			{isModalOpen && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-6">
					<div className="bg-white dark:bg-dark-900 w-full max-w-md rounded-[40px] p-10 relative shadow-2xl border border-gold-400/10">
						<button
							onClick={() => setIsModalOpen(false)}
							className="absolute top-8 right-8 p-2 text-gray-400 hover:text-gold-400"
						>
							<X className="w-6 h-6" />
						</button>

						<div className="space-y-6">
							<div className="text-center">
								<div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4">
									<Upload className="w-8 h-8" />
								</div>
								<h3 className="text-2xl font-display font-bold">
									Upload Payout Proof
								</h3>
								<p className="text-sm text-gray-500 mt-2">
									Upload the transfer receipt or screenshot to notify the
									seller.
								</p>
							</div>

							<div className="space-y-4">
								<label className="relative h-64 border-2 border-dashed border-gold-400/20 rounded-[32px] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-gold-400/5 transition-all overflow-hidden">
									<input
										type="file"
										accept="image/*"
										className="hidden"
										onChange={(e) => setProofFile(e.target.files?.[0] || null)}
									/>
									{proofFile ? (
										<div className="relative w-full h-full">
											<Image
												src={URL.createObjectURL(proofFile)}
												alt="Proof"
												fill
												className="object-cover"
											/>
											<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
												<Camera className="w-8 h-8 text-white" />
											</div>
										</div>
									) : (
										<>
											<ImageIcon className="w-12 h-12 text-gold-400/20" />
											<span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
												Select Receipt Image
											</span>
										</>
									)}
								</label>
							</div>

							<div className="flex gap-4">
								<button
									onClick={() => setIsModalOpen(false)}
									className="flex-1 py-4 bg-gray-100 dark:bg-dark-800 rounded-2xl font-bold text-gray-500"
								>
									Cancel
								</button>
								<button
									disabled={!proofFile || isSubmitting}
									onClick={() =>
										selectedPayoutId &&
										handlePayout(selectedPayoutId, "COMPLETED")
									}
									className="flex-[2] py-4 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg shadow-emerald-500/20 disabled:opacity-50"
								>
									{isSubmitting ? "Processing..." : "Confirm Payout 🚀"}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
