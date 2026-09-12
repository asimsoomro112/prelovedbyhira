"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Camera, ChevronLeft, ShieldAlert, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import api from "@/lib/api";

const disputeSchema = z.object({
	reason: z.enum([
		"ITEM_NOT_RECEIVED",
		"ITEM_NOT_AS_DESCRIBED",
		"DAMAGED_ITEM",
		"WRONG_ITEM",
	]),
	description: z
		.string()
		.min(20, "Please provide a detailed description (min 20 chars)"),
});

type DisputeValues = z.infer<typeof disputeSchema>;

export default function DisputePage() {
	const { id } = useParams();
	const router = useRouter();
	const [images, setImages] = useState<File[]>([]);
	const [previews, setPreviews] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState(false);

	const { data: order } = useQuery({
		queryKey: ["dispute-order", id],
		queryFn: async () => {
			const { data } = await api.get(`/orders/${id}`);
			return data;
		},
	});

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<DisputeValues>({
		resolver: zodResolver(disputeSchema),
	});

	const handleImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		if (images.length + files.length > 5) {
			toast.error("Maximum 5 photos allowed");
			return;
		}
		setImages([...images, ...files]);
		setPreviews([...previews, ...files.map((f) => URL.createObjectURL(f))]);
	};

	const onSubmit = async (values: DisputeValues) => {
		setIsLoading(true);
		try {
			const formData = new FormData();
			formData.append("orderId", id as string);
			formData.append("reason", values.reason);
			formData.append("description", values.description);
			images.forEach((img) => formData.append("evidence", img));

			await api.post("/disputes/create", formData, {
				headers: { "Content-Type": "multipart/form-data" },
			});

			toast.success(
				"Dispute filed successfully. Our team will review it shortly.",
			);
			router.push("/customer/orders");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to file dispute.");
		} finally {
			setIsLoading(false);
		}
	};

	if (!order) return null;

	return (
		<div className="max-w-3xl mx-auto px-6 py-12 space-y-12">
			<div className="flex items-center justify-between">
				<Link
					href={`/customer/orders/${id}`}
					className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gold-400"
				>
					<ChevronLeft className="w-4 h-4" /> Back to Order
				</Link>
				<div className="flex items-center gap-2 text-red-500 font-bold uppercase text-[10px] tracking-widest">
					<ShieldAlert className="w-4 h-4" /> Buyer Protection Active
				</div>
			</div>

			<div className="bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden">
				<div className="p-8 lg:p-12 space-y-10">
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-display font-bold">Open a Dispute</h1>
						<p className="text-gray-500">
							Tell us what went wrong. We&apos;re here to help resolve this.
						</p>
					</div>

					{/* Order Summary */}
					<div className="p-6 bg-cream-50 dark:bg-dark-800 rounded-3xl flex items-center gap-4 border border-gold-400/5">
						<div className="relative w-16 h-20 rounded-xl overflow-hidden shrink-0">
							<Image
								src={order.product.images[0]}
								alt="Product"
								fill
								className="object-cover"
							/>
						</div>
						<div>
							<p className="text-sm font-bold">{order.product.title}</p>
							<p className="text-xs text-gray-400">
								Seller: {order.seller.user.name}
							</p>
							<p className="text-xs font-bold text-gold-400 mt-1">
								Rs. {order.totalPrice}
							</p>
						</div>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
						<div className="space-y-2">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
								Reason for Dispute
							</label>
							<select
								{...register("reason")}
								className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-2xl px-6 py-4 outline-none focus:border-gold-400 transition-all font-bold"
							>
								<option value="ITEM_NOT_RECEIVED">Item Not Received</option>
								<option value="ITEM_NOT_AS_DESCRIBED">
									Item Not As Described
								</option>
								<option value="DAMAGED_ITEM">Damaged Item</option>
								<option value="WRONG_ITEM">Wrong Item Received</option>
							</select>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
								Detailed Description
							</label>
							<textarea
								{...register("description")}
								rows={5}
								placeholder="Provide details about the issue. Be specific about any defects or differences from the listing..."
								className="w-full bg-cream-50 dark:bg-dark-800 border-2 border-gold-400/10 rounded-3xl p-6 outline-none focus:border-gold-400 transition-all resize-none text-sm"
							/>
							{errors.description && (
								<p className="text-xs text-red-500 ml-1">
									{errors.description.message}
								</p>
							)}
						</div>

						<div className="space-y-4">
							<label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">
								Evidence Photos (Up to 5)
							</label>
							<div className="grid grid-cols-3 md:grid-cols-5 gap-4">
								<label className="aspect-square rounded-2xl border-2 border-dashed border-gold-400/20 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-gold-400/5 transition-all">
									<input
										type="file"
										multiple
										accept="image/*"
										onChange={handleImage}
										className="hidden"
									/>
									<Camera className="w-6 h-6 text-gold-400" />
									<span className="text-[8px] font-bold text-gray-400 uppercase">
										Upload
									</span>
								</label>
								{previews.map((src, i) => (
									<div
										key={i}
										className="relative aspect-square rounded-2xl overflow-hidden border border-gold-400/10 group"
									>
										<Image
											src={src}
											alt="Evidence"
											fill
											className="object-cover"
										/>
										<button
											type="button"
											onClick={() => {
												setImages(images.filter((_, idx) => idx !== i));
												setPreviews(previews.filter((_, idx) => idx !== i));
											}}
											className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
										>
											<X className="w-3 h-3" />
										</button>
									</div>
								))}
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full py-5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-pill font-bold shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
						>
							{isLoading ? "Submitting Dispute..." : "Submit Dispute to Admin"}
							{!isLoading && <ArrowRight className="w-5 h-5" />}
						</button>
					</form>
				</div>
			</div>
		</div>
	);
}
