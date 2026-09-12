"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	createUserWithEmailAndPassword,
	signInWithPopup,
	updateProfile,
} from "firebase/auth";
import { motion } from "framer-motion";
import {
	ArrowRight,
	Check,
	Eye,
	EyeOff,
	Lock,
	Mail,
	Phone,
	ShoppingBag,
	User,
	UserCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import * as z from "zod";
import api from "@/lib/api";
import { auth, googleProvider } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useCartStore } from "@/store/useCartStore";

const registerSchema = z
	.object({
		name: z.string().min(2, "Name must be at least 2 characters"),
		email: z.string().email("Invalid email address"),
		phone: z.string().min(11, "Phone must be at least 11 digits"),
		password: z.string().min(8, "Password must be at least 8 characters"),
		confirmPassword: z.string(),
		role: z.enum(["CUSTOMER", "SELLER"]),
		acceptTerms: z.literal(true, {
			errorMap: () => ({ message: "You must accept the terms and conditions" }),
		}),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Passwords do not match",
		path: ["confirmPassword"],
	});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const [isLoading, setIsLoading] = useState(false);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const redirect = searchParams.get("redirect");

	const setAuth = useAuthStore((state) => state.setAuth);
	const syncCart = useCartStore((state) => state.syncGuestCart);

	const {
		register,
		handleSubmit,
		watch,
		setValue,
		formState: { errors },
	} = useForm<RegisterFormValues>({
		resolver: zodResolver(registerSchema),
		defaultValues: { role: "CUSTOMER" },
	});

	const selectedRole = watch("role");

	const handleGoogleRegister = async () => {
		setIsLoading(true);
		try {
			const result = await signInWithPopup(auth, googleProvider);
			const token = await result.user.getIdToken();

			const { data } = await api.post(
				"/auth/sync",
				{
					uid: result.user.uid,
					name: result.user.displayName || "Marketplace Member",
					email: result.user.email,
					role: selectedRole || "CUSTOMER",
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			setAuth(data.user, token);
			await syncCart(); // Sync guest items

			toast.success("Welcome to ReVault! ✨");

			// ✅ M-06: Handle redirect param
			if (redirect) {
				router.push(redirect);
				return;
			}

			// Redirect based on role: Sellers go to Vault, Customers go to Onboarding
			if (selectedRole === "SELLER") {
				router.push("/seller/dashboard");
			} else {
				router.push("/onboarding");
			}
		} catch (error: any) {
			toast.error(error.message || "Google Registration failed.");
		} finally {
			setIsLoading(false);
		}
	};

	const onSubmit = async (values: RegisterFormValues) => {
		setIsLoading(true);
		try {
			// 1. Firebase Auth Registration
			const userCredential = await createUserWithEmailAndPassword(
				auth,
				values.email,
				values.password,
			);

			// Update Firebase Profile
			await updateProfile(userCredential.user, {
				displayName: values.name,
			});

			const token = await userCredential.user.getIdToken();

			// 3. Update Global State
			const { data } = await api.post(
				"/auth/sync",
				{
					uid: userCredential.user.uid,
					name: values.name,
					email: values.email,
					phone: values.phone,
					role: values.role,
				},
				{
					headers: { Authorization: `Bearer ${token}` },
				},
			);

			setAuth(data.user, token);
			await syncCart(); // Sync guest items

			toast.success("Welcome to ReVault! ✨");

			// ✅ M-06: Handle redirect param
			if (redirect) {
				router.push(redirect);
				return;
			}

			// Redirect based on role: Sellers go to Vault, Customers go to Onboarding
			if (values.role === "SELLER") {
				router.push("/seller/dashboard");
			} else {
				router.push("/onboarding");
			}
		} catch (error: any) {
			toast.error(error.message || "Registration failed.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="min-h-screen py-20 flex items-center justify-center p-4">
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-xl bg-white dark:bg-dark-900 rounded-[40px] shadow-card border border-gold-400/10 overflow-hidden"
			>
				<div className="p-8 lg:p-12 space-y-10">
					<div className="text-center space-y-2">
						<h1 className="text-3xl font-display font-bold">
							Join the Platform
						</h1>
						<p className="text-gray-500 text-sm">
							Join Pakistan&apos;s elite community of luxury fashion enthusiasts
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
						<div className="grid grid-cols-2 gap-4">
							<button
								type="button"
								onClick={() => setValue("role", "CUSTOMER")}
								className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "CUSTOMER" ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
							>
								{selectedRole === "CUSTOMER" && (
									<div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1">
										<Check className="w-3 h-3" />
									</div>
								)}
								<div
									className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRole === "CUSTOMER" ? "bg-gold-400 text-white" : "bg-cream-100 dark:bg-dark-800 text-gray-400"}`}
								>
									<ShoppingBag className="w-6 h-6" />
								</div>
								<div className="text-center">
									<p
										className={`font-bold text-sm ${selectedRole === "CUSTOMER" ? "text-gold-400" : "text-gray-500"}`}
									>
										Customer
									</p>
									<p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
										Ready to Shop
									</p>
								</div>
							</button>

							<button
								type="button"
								onClick={() => setValue("role", "SELLER")}
								className={`p-6 rounded-3xl border-2 transition-all flex flex-col items-center gap-3 relative overflow-hidden ${selectedRole === "SELLER" ? "border-gold-400 bg-gold-400/5" : "border-gold-400/10 hover:border-gold-400/30"}`}
							>
								{selectedRole === "SELLER" && (
									<div className="absolute top-3 right-3 bg-gold-400 text-white rounded-full p-1">
										<Check className="w-3 h-3" />
									</div>
								)}
								<div
									className={`w-12 h-12 rounded-2xl flex items-center justify-center ${selectedRole === "SELLER" ? "bg-gold-400 text-white" : "bg-cream-100 dark:bg-dark-800 text-gray-400"}`}
								>
									<UserCircle className="w-6 h-6" />
								</div>
								<div className="text-center">
									<p
										className={`font-bold text-sm ${selectedRole === "SELLER" ? "text-gold-400" : "text-gray-500"}`}
									>
										Seller
									</p>
									<p className="text-[10px] text-gray-400 mt-1 uppercase tracking-tighter">
										Ready to Sell
									</p>
								</div>
							</button>
						</div>

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
										placeholder="Zoya Ahmed"
										className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
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
									Phone
								</label>
								<div className="relative group">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
										<Phone className="w-5 h-5" />
									</div>
									<input
										{...register("phone")}
										placeholder="03XXXXXXXXX"
										className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
									/>
								</div>
								{errors.phone && (
									<p className="text-[10px] text-red-500 ml-1">
										{errors.phone.message}
									</p>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
								Email Address
							</label>
							<div className="relative group">
								<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
									<Mail className="w-5 h-5" />
								</div>
								<input
									{...register("email")}
									type="email"
									placeholder="user@revault.pk"
									className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-4 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
								/>
							</div>
							{errors.email && (
								<p className="text-[10px] text-red-500 ml-1">
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="grid md:grid-cols-2 gap-5">
							<div className="space-y-2">
								<label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
									Password
								</label>
								<div className="relative group">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
										<Lock className="w-5 h-5" />
									</div>
									<input
										{...register("password")}
										type={showPassword ? "text" : "password"}
										placeholder="••••••••"
										className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-12 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowPassword(!showPassword)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
									>
										{showPassword ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
								{errors.password && (
									<p className="text-[10px] text-red-500 ml-1">
										{errors.password.message}
									</p>
								)}
							</div>

							<div className="space-y-2">
								<label className="text-xs font-bold text-gray-700 dark:text-gray-300 ml-1 uppercase tracking-wider">
									Confirm Password
								</label>
								<div className="relative group">
									<div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-gold-400 transition-colors">
										<Lock className="w-5 h-5" />
									</div>
									<input
										{...register("confirmPassword")}
										type={showConfirmPassword ? "text" : "password"}
										placeholder="••••••••"
										className="w-full bg-cream-50 dark:bg-dark-800 border border-gold-400/20 rounded-2xl pl-12 pr-12 py-3 outline-none focus:ring-2 focus:ring-gold-400/50 transition-all text-sm"
									/>
									<button
										type="button"
										onClick={() => setShowConfirmPassword(!showConfirmPassword)}
										className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gold-400 transition-colors"
									>
										{showConfirmPassword ? (
											<EyeOff className="w-5 h-5" />
										) : (
											<Eye className="w-5 h-5" />
										)}
									</button>
								</div>
								{errors.confirmPassword && (
									<p className="text-[10px] text-red-500 ml-1">
										{errors.confirmPassword.message}
									</p>
								)}
							</div>
						</div>

						<div className="flex items-center gap-3 ml-1">
							<input
								{...register("acceptTerms")}
								type="checkbox"
								className="w-4 h-4 rounded border-gold-400/30 text-gold-400 focus:ring-gold-400"
							/>
							<span className="text-xs text-gray-500 font-medium">
								I agree to the{" "}
								<Link href="/terms" className="text-gold-400 hover:underline">
									Membership Terms
								</Link>
							</span>
						</div>
						{errors.acceptTerms && (
							<p className="text-[10px] text-red-500 ml-1">
								{errors.acceptTerms.message}
							</p>
						)}

						<button
							type="submit"
							disabled={isLoading}
							className="w-full bg-gradient-to-r from-gold-400 to-gold-600 text-white py-4 rounded-pill font-bold shadow-gold hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
						>
							{isLoading ? "Creating Identity..." : "Create Account"}
							{!isLoading && <ArrowRight className="w-5 h-5" />}
						</button>
					</form>

					<div className="relative">
						<div className="absolute inset-0 flex items-center">
							<div className="w-full border-t border-gold-400/10"></div>
						</div>
						<div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
							<span className="bg-white dark:bg-dark-900 px-4 text-gray-400">
								Or Instant Membership
							</span>
						</div>
					</div>

					<button
						onClick={handleGoogleRegister}
						disabled={isLoading}
						className="w-full bg-white dark:bg-dark-800 border-2 border-gold-400/20 hover:border-gold-400/50 py-4 rounded-pill font-bold transition-all flex items-center justify-center gap-3 group"
					>
						<svg
							className="w-5 h-5 group-hover:scale-110 transition-transform"
							viewBox="0 0 24 24"
						>
							<path
								fill="#4285F4"
								d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							/>
							<path
								fill="#34A853"
								d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							/>
							<path
								fill="#FBBC05"
								d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81.38z"
							/>
							<path
								fill="#EA4335"
								d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 8.82-4.53z"
							/>
						</svg>
						Sign up with Google
					</button>

					<p className="text-center text-sm text-gray-500">
						Already a member?{" "}
						<Link
							href="/login"
							className="text-gold-400 font-bold hover:underline font-display"
						>
							Sign In
						</Link>
					</p>
				</div>
			</motion.div>
		</div>
	);
}
