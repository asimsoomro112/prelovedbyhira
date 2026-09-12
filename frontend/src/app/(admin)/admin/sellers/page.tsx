"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
	CheckCircle2,
	CreditCard,
	Eye,
	Search,
	ShieldCheck,
	X,
	XCircle,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";

export default function AdminSellersPage() {
	const [activeTab, setActiveTab] = useState("ALL");
	const [selectedSeller, setSelectedSeller] = useState<any>(null);
	const [rejectionReason, setRejectionReason] = useState("");
	const [showRejectInput, setShowRejectInput] = useState(false);
	const [previewImage, setPreviewImage] = useState<string | null>(null);
	const queryClient = useQueryClient();

	const { data: sellers, isLoading } = useQuery({
		queryKey: ["admin-sellers", activeTab],
		queryFn: async () => {
			const { data } = await api.get("/admin/sellers");
			const sellersList = data.sellers || [];
			return activeTab === "ALL"
				? sellersList
				: sellersList.filter((s: any) => s.verificationStatus === activeTab);
		},
	});

	const verifyMutation = useMutation({
		mutationFn: async ({
			id,
			status,
			reason,
		}: {
			id: string;
			status: string;
			reason?: string;
		}) => {
			const endpoint =
				status === "APPROVED"
					? `/admin/sellers/${id}/approve`
					: `/admin/sellers/${id}/reject`;
			const body =
				status === "REJECTED"
					? { reason: reason || "Application did not meet quality standards." }
					: {};
			return await api.put(endpoint, body);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["admin-sellers"] });
			toast.success("Seller status updated!");
			setSelectedSeller(null);
		},
	});

	return (
		<div className="p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 pb-32 lg:pb-8">
			<div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
				<div className="space-y-1">
					<h1 className="text-fluid-section font-display font-bold text-dark-900 dark:text-cream-50">
						Moderation
					</h1>
					<p className="text-gray-500 text-sm">Review vendor applications.</p>
				</div>
				<div className="flex bg-cream-100 dark:bg-dark-900/50 p-1 rounded-2xl flex-wrap">
					{[
						"ALL",
						"PENDING",
						"IDENTITY_VERIFIED",
						"SELFIE_UPLOADED",
						"APPROVED",
						"REJECTED",
					].map((tab) => (
						<button
							key={tab}
							onClick={() => setActiveTab(tab)}
							className={`px-4 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${activeTab === tab ? "bg-white dark:bg-dark-800 text-gold-400 shadow-soft" : "text-gray-400"}`}
						>
							{tab.replace("_", " ")}
						</button>
					))}
				</div>
			</div>

			<div className="bg-white dark:bg-dark-800 rounded-3xl md:rounded-[40px] shadow-soft border border-gold-400/5 overflow-hidden">
				<div className="p-4 md:p-6 border-b border-gold-400/10 flex items-center justify-between">
					<div className="relative w-full max-w-md">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4 md:w-5 md:h-5" />
						<input
							placeholder="Search sellers..."
							className="w-full bg-cream-50 dark:bg-dark-900 rounded-2xl pl-10 md:pl-12 pr-4 py-3 text-sm outline-none border border-transparent focus:border-gold-400 transition-all min-h-[44px]"
						/>
					</div>
				</div>

				<div className="hidden md:block overflow-x-auto">
					<table className="w-full text-left">
						<thead className="bg-cream-50 dark:bg-dark-900/50 text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">
							<tr>
								<th className="px-8 py-6">Seller</th>
								<th className="px-8 py-6">CNIC Number</th>
								<th className="px-8 py-6">Status</th>
								<th className="px-8 py-6">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gold-400/10">
							{isLoading
								? Array(5)
										.fill(0)
										.map((_, i) => (
											<tr
												key={i}
												className="animate-pulse h-20 bg-gold-400/5"
											/>
										))
								: sellers?.map((seller: any) => (
										<tr
											key={seller.id}
											className="hover:bg-gold-400/5 transition-all group"
										>
											<td className="px-8 py-6">
												<div className="flex items-center gap-4">
													<div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-gold-400/10 bg-zinc-800">
														{seller.user?.avatar ? (
															<Image
																src={seller.user.avatar}
																alt={seller.user?.name || "Seller"}
																fill
																className="object-cover"
															/>
														) : (
															<div className="w-full h-full flex items-center justify-center text-gold-400 font-bold">
																{seller.user?.name?.[0] || "?"}
															</div>
														)}
													</div>
													<div>
														<p className="text-sm font-bold text-dark-900 dark:text-cream-50">
															{seller.user?.name || "Anonymous Seller"}
														</p>
														<p className="text-xs text-gray-500">
															{seller.user?.email || "No email linked"}
														</p>
													</div>
												</div>
											</td>
											<td className="px-8 py-6 text-sm text-gray-500 font-bold">
												{seller.cnicNumber || "---"}
											</td>
											<td className="px-8 py-6">
												<span
													className={`px-3 py-1 rounded-pill text-[9px] font-bold ${getStatusStyle(seller.verificationStatus)}`}
												>
													{seller.verificationStatus.replace("_", " ")}
												</span>
											</td>
											<td className="px-8 py-6">
												<button
													onClick={() => setSelectedSeller(seller)}
													className="p-3 bg-gold-400/10 text-gold-400 rounded-xl hover:bg-gold-400 hover:text-white transition-all flex items-center gap-2 min-h-[44px]"
												>
													<Eye className="w-4 h-4" />{" "}
													<span className="text-[10px] font-bold uppercase tracking-widest">
														Review
													</span>
												</button>
											</td>
										</tr>
									))}
						</tbody>
					</table>
				</div>

				{/* ✅ Mobile Card View */}
				<div className="md:hidden divide-y divide-gold-400/10">
					{isLoading ? (
						<div className="p-10 text-center animate-pulse text-gray-400 text-[10px] font-bold uppercase tracking-widest">
							Scanning Vault...
						</div>
					) : (
						sellers?.map((seller: any) => (
							<div
								key={seller.id}
								className="p-5 space-y-4 active:bg-gold-400/5 transition-all"
							>
								<div className="flex justify-between items-start">
									<div className="flex items-center gap-3">
										<div className="relative w-10 h-10 rounded-full overflow-hidden border border-gold-400/10 bg-zinc-800 shrink-0">
											{seller.user?.avatar ? (
												<Image
													src={seller.user.avatar}
													alt={seller.user?.name || "Seller"}
													fill
													className="object-cover"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center text-gold-400 text-xs font-bold">
													{seller.user?.name?.[0] || "?"}
												</div>
											)}
										</div>
										<div className="min-w-0">
											<p className="text-sm font-bold text-dark-900 dark:text-cream-50 truncate">
												{seller.user?.name || "Anonymous"}
											</p>
											<p className="text-[10px] text-gray-500 truncate">
												{seller.user?.email || "No email"}
											</p>
										</div>
									</div>
									<span
										className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase tracking-widest ${getStatusStyle(seller.verificationStatus)}`}
									>
										{seller.verificationStatus.replace("_", " ")}
									</span>
								</div>
								<div className="flex justify-between items-center">
									<div className="space-y-0.5">
										<p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">
											CNIC Number
										</p>
										<p className="text-xs font-bold text-gray-600 dark:text-gray-300">
											{seller.cnicNumber || "---"}
										</p>
									</div>
									<button
										onClick={() => setSelectedSeller(seller)}
										className="px-4 py-2 bg-gold-400/10 text-gold-400 rounded-xl text-[10px] font-bold uppercase tracking-widest active:scale-95 transition-all"
									>
										Review
									</button>
								</div>
							</div>
						))
					)}
				</div>
			</div>

			{/* VERIFICATION MODAL */}
			<AnimatePresence>
				{selectedSeller && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setSelectedSeller(null)}
							className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
						/>
						<motion.div
							initial={{ opacity: 0, scale: 0.95, y: 20 }}
							animate={{ opacity: 1, scale: 1, y: 0 }}
							exit={{ opacity: 0, scale: 0.95, y: 20 }}
							className="fixed inset-x-0 bottom-0 md:inset-auto md:top-[5%] md:left-1/2 md:-translate-x-1/2 w-full md:max-w-5xl h-[95vh] md:h-auto md:max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-900 rounded-t-[40px] md:rounded-[40px] p-6 md:p-8 lg:p-12 z-[110] shadow-2xl border-t md:border border-gold-400/10 space-y-8 md:space-y-10 scrollbar-none md:scrollbar-thin transition-colors"
						>
							<div className="flex items-center justify-between sticky top-0 bg-white dark:bg-dark-900 z-10 pb-4 md:static">
								<div className="flex items-center gap-3 md:gap-4">
									<div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-gold-400/10 text-gold-400 flex items-center justify-center text-xl md:text-2xl font-bold overflow-hidden border-2 border-gold-400/10 relative shrink-0">
										{selectedSeller.user?.avatar ? (
											<img
												src={selectedSeller.user.avatar}
												alt={selectedSeller.user.name}
												className="w-full h-full object-cover"
											/>
										) : (
											selectedSeller.user?.name?.[0] || "S"
										)}
									</div>
									<div className="min-w-0">
										<h2 className="text-xl md:text-2xl font-display font-bold truncate">
											{selectedSeller.user?.name || "Seller Profile"}
										</h2>
										<div className="flex flex-wrap items-center gap-2 mt-0.5">
											<span
												className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest ${getStatusStyle(selectedSeller.verificationStatus)}`}
											>
												{selectedSeller.verificationStatus.replace("_", " ")}
											</span>
											{selectedSeller.verificationStatus ===
												"IDENTITY_VERIFIED" && (
												<span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest">
													<ShieldCheck className="w-2.5 h-2.5" /> AI Scanned
												</span>
											)}
										</div>
									</div>
								</div>
								<button
									onClick={() => setSelectedSeller(null)}
									className="p-2 md:p-3 bg-gold-400/10 text-gold-400 rounded-full hover:bg-gold-400 hover:text-white transition-all"
								>
									<X className="w-5 h-5 md:w-6 md:h-6" />
								</button>
							</div>

							<div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
								<DocumentView
									label="CNIC Front (AI Scanned)"
									src={selectedSeller.cnicFront}
									onPreview={setPreviewImage}
								/>
								<DocumentView
									label="CNIC Back (Security Check)"
									src={selectedSeller.cnicBack}
									onPreview={setPreviewImage}
								/>
								<DocumentView
									label="User Selfie (Manual Check)"
									src={
										selectedSeller.selfieUrl || selectedSeller.selfieWithCnic
									}
									isSelfie
									onPreview={setPreviewImage}
								/>
							</div>

							<div className="grid lg:grid-cols-2 gap-6 md:gap-8">
								<div className="p-6 md:p-8 bg-cream-50 dark:bg-zinc-800/50 rounded-3xl md:rounded-[32px] border border-gold-400/10 space-y-6">
									<div className="flex items-center justify-between border-b border-gold-400/10 pb-4">
										<h3 className="text-base md:text-lg font-display font-bold flex items-center gap-2">
											<CreditCard className="w-5 h-5 text-gold-400" /> Payout
											Vault
										</h3>
										<span className="text-[10px] font-bold text-emerald-500 uppercase">
											Verified Method
										</span>
									</div>
									<div className="grid grid-cols-2 gap-y-6 gap-x-8">
										<div>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
												Provider
											</p>
											<p className="text-sm font-bold text-dark-900 dark:text-cream-50">
												{selectedSeller.payoutMethod}
											</p>
										</div>
										{selectedSeller.payoutDetails?.bankName && (
											<div>
												<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
													Bank Name
												</p>
												<p className="text-sm font-bold text-emerald-500">
													{selectedSeller.payoutDetails.bankName}
												</p>
											</div>
										)}
										<div>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
												Account Holder
											</p>
											<p className="text-sm font-bold text-dark-900 dark:text-cream-50 truncate">
												{selectedSeller.payoutDetails?.accountName ||
													selectedSeller.user?.name ||
													"N/A"}
											</p>
										</div>
										<div>
											<p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1">
												Account / IBAN
											</p>
											<p className="text-sm font-display font-bold text-gold-400 tracking-wider">
												{selectedSeller.payoutDetails?.accountNumber || "N/A"}
											</p>
										</div>
									</div>
								</div>

								<div className="p-6 md:p-8 bg-zinc-900 dark:bg-black rounded-3xl md:rounded-[32px] border border-gold-400/10 flex flex-col justify-center gap-6">
									<div className="space-y-4">
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
												Extracted CNIC ID:
											</span>
											<span className="text-xl font-display font-bold text-gold-400 tracking-widest">
												{selectedSeller.cnicNumber || "PENDING"}
											</span>
										</div>
										<div className="flex items-center justify-between">
											<span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
												AI Matching Accuracy:
											</span>
											<span className="text-xs font-bold text-emerald-500 flex items-center gap-1">
												<ShieldCheck className="w-3 h-3" /> 99.9% High
												Confidence
											</span>
										</div>
									</div>
									<div className="h-px bg-white/10 w-full" />
									<p className="text-[10px] text-gray-500 leading-relaxed italic text-center">
										"Please manually compare the **User Selfie** against the
										**CNIC Front** photo before approving this vault."
									</p>
								</div>
							</div>

							{showRejectInput ? (
								<motion.div
									initial={{ opacity: 0, height: 0 }}
									animate={{ opacity: 1, height: "auto" }}
									className="space-y-4 pt-6 border-t border-red-500/10"
								>
									<label className="text-[10px] font-bold text-red-500 uppercase tracking-widest ml-1">
										Rejection Reason (Sent to Seller)
									</label>
									<textarea
										value={rejectionReason}
										onChange={(e) => setRejectionReason(e.target.value)}
										placeholder="e.g. CNIC image is blurry, please re-upload a clear photo of the front side."
										className="w-full bg-red-500/5 border-2 border-red-500/20 rounded-3xl px-6 py-4 text-sm outline-none focus:border-red-500 transition-all min-h-[120px]"
									/>
									<div className="flex gap-4">
										<button
											onClick={() => setShowRejectInput(false)}
											className="flex-1 py-4 border-2 border-gray-400/20 text-gray-500 rounded-2xl font-bold"
										>
											Cancel
										</button>
										<button
											disabled={!rejectionReason || verifyMutation.isPending}
											onClick={() =>
												verifyMutation.mutate({
													id: selectedSeller.id,
													status: "REJECTED",
													reason: rejectionReason,
												})
											}
											className="flex-[2] py-4 bg-red-500 text-white rounded-2xl font-bold shadow-lg disabled:opacity-50"
										>
											Confirm Rejection & Notify Seller
										</button>
									</div>
								</motion.div>
							) : (
								<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gold-400/10">
									<button
										onClick={() =>
											verifyMutation.mutate({
												id: selectedSeller.id,
												status: "APPROVED",
											})
										}
										className="flex-1 py-4 md:py-5 bg-emerald-500 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
									>
										<CheckCircle2 className="w-5 h-5" /> Approve Profile
									</button>
									<button
										onClick={() => setShowRejectInput(true)}
										className="flex-1 py-4 md:py-5 bg-red-500 text-white rounded-2xl font-bold shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 min-h-[48px]"
									>
										<XCircle className="w-5 h-5" /> Reject Docs
									</button>
								</div>
							)}
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* FULL IMAGE PREVIEW LIGHTBOX */}
			<AnimatePresence>
				{previewImage && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-[200] flex items-center justify-center p-4 lg:p-12 bg-black/95 backdrop-blur-md"
						onClick={() => setPreviewImage(null)}
					>
						<button className="absolute top-8 right-8 p-4 bg-white/10 text-white rounded-full hover:bg-white/20 transition-all">
							<X className="w-8 h-8" />
						</button>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className="relative w-full h-full max-w-7xl"
						>
							<Image
								src={previewImage}
								alt="Preview"
								fill
								className="object-contain"
								priority
							/>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}

function DocumentView({ label, src, isSelfie, onPreview }: any) {
	const imageSrc =
		src ||
		"https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=400";
	return (
		<div className="space-y-3">
			<p className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
				{label}
			</p>
			<div
				onClick={() => onPreview(imageSrc)}
				className={`relative aspect-[3/2] rounded-3xl overflow-hidden border-2 ${isSelfie ? "border-gold-400" : "border-gold-400/10"} hover:border-gold-400 transition-all group cursor-zoom-in shadow-lg`}
			>
				<Image
					src={imageSrc}
					alt={label}
					fill
					sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
					className="object-cover group-hover:scale-110 transition-transform duration-700"
				/>
				<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
					<Eye className="w-10 h-10 text-white" />
					<span className="text-white text-[10px] font-bold uppercase tracking-widest bg-white/20 px-4 py-1 rounded-full backdrop-blur-sm">
						View Full Document
					</span>
				</div>
				{isSelfie && (
					<div className="absolute top-4 right-4 px-3 py-1 bg-gold-400 text-white text-[8px] font-bold uppercase tracking-widest rounded-full shadow-lg">
						Manual Approval Req
					</div>
				)}
			</div>
		</div>
	);
}

function getStatusStyle(status: string) {
	switch (status) {
		case "APPROVED":
			return "bg-emerald-500/10 text-emerald-500";
		case "PENDING":
			return "bg-amber-500/10 text-amber-500";
		case "IDENTITY_VERIFIED":
			return "bg-blue-500/10 text-blue-500";
		case "SELFIE_UPLOADED":
			return "bg-purple-500/10 text-purple-500";
		case "REJECTED":
			return "bg-red-500/10 text-red-500";
		default:
			return "bg-gray-500/10 text-gray-500";
	}
}
