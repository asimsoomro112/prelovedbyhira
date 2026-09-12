"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import {
	AlertTriangle,
	ArrowLeft,
	Loader2,
	MapPin,
	Phone,
	Plus,
	Save,
	User,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

const profileSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	phone: z.string().optional(),
	city: z.string().optional(),
	address: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function AccountSettingsPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [isFetching, setIsFetching] = useState(true);
	const router = useRouter();
	const { user, setUser } = useAuthStore();

	const {
		register,
		handleSubmit,
		setValue,
		getValues,
		formState: { errors },
	} = useForm<ProfileFormValues>({
		resolver: zodResolver(profileSchema),
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const { data } = await api.get("/users/profile");
				setValue("name", data.user.name || "");
				setValue("phone", data.user.phone || "");
				setValue("city", data.user.city || "");
				setValue("address", data.user.address || "");
			} catch (_error) {
				toast.error("Failed to load profile details.");
			} finally {
				setIsFetching(false);
			}
		};

		fetchProfile();
	}, [setValue]);

	const onSubmit = async (values: ProfileFormValues) => {
		setIsLoading(true);
		try {
			const { data } = await api.put("/users/profile", values);

			// Update the auth store so navbar and other places reflect the new details
			if (user) {
				setUser({
					...user,
					name: data.user.name,
					phone: data.user.phone,
					city: data.user.city,
					address: data.user.address,
				});
			}

			toast.success("Profile updated successfully!");
			router.push("/customer/profile");
		} catch (error: any) {
			toast.error(error.response?.data?.message || "Failed to update profile.");
		} finally {
			setIsLoading(false);
		}
	};

	if (isFetching) {
		return (
			<div className="min-h-[60vh] flex items-center justify-center">
				<Loader2 className="w-8 h-8 animate-spin text-gold-400" />
			</div>
		);
	}

	return (
		<div className="max-w-3xl mx-auto px-6 py-12">
			<Link
				href="/customer/profile"
				className="inline-flex items-center text-sm font-bold text-gray-500 hover:text-gold-400 mb-8 transition-colors"
			>
				<ArrowLeft className="w-4 h-4 mr-2" /> Back to Profile
			</Link>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden"
			>
				<div className="p-8 lg:p-12 space-y-8">
					<div className="space-y-2">
						<h1 className="text-3xl font-display font-bold">
							Account Settings
						</h1>
						<p className="text-gray-500 text-sm">
							Update your personal details and shipping address.
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="space-y-6 bg-cream-50 dark:bg-dark-800/50 p-6 rounded-3xl border border-gold-400/5">
							<h2 className="font-bold text-lg flex items-center gap-2 border-b border-gold-400/10 pb-3">
								<User className="w-5 h-5 text-gold-400" /> Personal Details
							</h2>

							<div className="grid md:grid-cols-2 gap-5">
								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
										Full Name
									</label>
									<div className="relative group">
										<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
											<User className="w-5 h-5" />
										</div>
										<input
											{...register("name")}
											className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
										/>
									</div>
									{errors.name && (
										<p className="text-[10px] text-red-500 ml-1">
											{errors.name.message}
										</p>
									)}
								</div>

								<div className="space-y-2">
									<label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
										Phone Number
									</label>
									<div className="relative group">
										<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
											<Phone className="w-5 h-5" />
										</div>
										<input
											{...register("phone")}
											placeholder="e.g. 03XXXXXXXXX"
											className="w-full bg-white dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
										/>
									</div>
									{errors.phone && (
										<p className="text-[10px] text-red-500 ml-1">
											{errors.phone.message}
										</p>
									)}
								</div>
							</div>
						</div>

						<div className="space-y-6 bg-cream-50 dark:bg-dark-800/50 p-6 rounded-3xl border border-gold-400/5">
							<h2 className="font-bold text-lg flex items-center gap-2 border-b border-gold-400/10 pb-3">
								<MapPin className="w-5 h-5 text-gold-400" /> Address Book
							</h2>

							<div className="space-y-4">
								{(user as any)?.addresses?.map((addr: any) => (
									<div
										key={addr.id}
										className="p-4 bg-white dark:bg-dark-900 rounded-2xl border border-gold-400/10 flex justify-between items-start group relative"
									>
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="text-[10px] font-bold uppercase tracking-widest bg-gold-400/10 text-gold-400 px-2 py-0.5 rounded-full">
													{addr.label || "Other"}
												</span>
												{addr.isDefault && (
													<span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full">
														Default
													</span>
												)}
											</div>
											<p className="text-sm font-bold">{addr.name}</p>
											<p className="text-xs text-gray-500">{addr.phone}</p>
											<p className="text-xs text-gray-500">
												{addr.address}, {addr.city}
											</p>
										</div>
										<button
											type="button"
											onClick={async () => {
												const newAddresses = (user as any).addresses.filter(
													(a: any) => a.id !== addr.id,
												);
												try {
													const { data } = await api.put("/users/profile", {
														addresses: newAddresses,
													});
													setUser({
														...user,
														addresses: data.user.addresses,
													} as any);
													toast.success("Address removed");
												} catch (_e) {
													toast.error("Failed to remove address");
												}
											}}
											className="p-2 text-gray-400 hover:text-red-500 transition-colors"
										>
											<AlertTriangle className="w-4 h-4" />
										</button>
									</div>
								))}

								<button
									type="button"
									onClick={() => {
										const name = prompt("Receiver Name") || "";
										const phone = prompt("Phone Number") || "";
										const city = prompt("City") || "";
										const address = prompt("Full Address") || "";
										const label = prompt("Label (Home, Work, etc.)") || "Home";

										if (!name || !phone || !city || !address) {
											toast.error(
												"All fields are required to add a new address",
											);
											return;
										}

										const newAddr = {
											id: Math.random().toString(36).substr(2, 9),
											name,
											phone,
											city,
											address,
											label,
											isDefault: !(user as any)?.addresses?.length,
										};

										const currentAddresses = (user as any)?.addresses || [];
										const newAddresses = [...currentAddresses, newAddr];

										onSubmit({
											...getValues(),
											addresses: newAddresses,
										} as any);
									}}
									className="w-full py-4 border-2 border-dashed border-gold-400/20 rounded-2xl text-xs font-bold text-gold-400 hover:bg-gold-400/5 transition-all flex items-center justify-center gap-2"
								>
									<Plus className="w-4 h-4" /> Add New Address
								</button>
							</div>
						</div>

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{isLoading ? (
								<Loader2 className="w-5 h-5 animate-spin" />
							) : (
								<Save className="w-5 h-5" />
							)}
							{isLoading ? "Saving Details..." : "Save Settings"}
						</button>
					</form>
				</div>
			</motion.div>
		</div>
	);
}
