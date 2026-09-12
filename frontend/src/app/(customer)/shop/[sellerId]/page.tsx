"use client";

import { useQuery } from "@tanstack/react-query";
import { Clock, MapPin, Package, ShieldCheck, Star, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { use } from "react";
import api from "@/lib/api";

export default function PublicShopPage({
	params,
}: {
	params: Promise<{ sellerId: string }>;
}) {
	const resolvedParams = use(params);
	const sellerId = resolvedParams.sellerId;

	const {
		data: shop,
		isLoading,
		isError,
	} = useQuery({
		queryKey: ["public-shop", sellerId],
		queryFn: async () => {
			const { data } = await api.get(`/seller/public/${sellerId}`);
			return data;
		},
		retry: false,
	});

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center bg-cream-50 dark:bg-dark-900">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-400"></div>
			</div>
		);
	}

	if (isError || !shop) {
		return (
			<div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
				<StorefrontIcon className="w-20 h-20 text-gray-300 mb-6" />
				<h2 className="text-3xl font-display font-bold">Shop Not Found</h2>
				<p className="text-gray-500 mt-2">
					This seller profile doesn't exist or is currently inactive.
				</p>
				<Link
					href="/products"
					className="mt-8 px-8 py-4 bg-gold-400 text-white rounded-pill font-bold shadow-gold"
				>
					Browse Marketplace
				</Link>
			</div>
		);
	}

	return (
		<div className="min-h-screen pb-20">
			{/* SHOP HEADER */}
			<div className="relative h-[300px] md:h-[400px]">
				{shop.coverImage ? (
					<Image
						src={shop.coverImage}
						alt="Cover"
						fill
						className="object-cover"
						priority
					/>
				) : (
					<div className="absolute inset-0 bg-gradient-to-br from-gold-400/20 via-cream-100 to-dark-900/10 dark:from-dark-800 dark:to-dark-900" />
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-dark-900/40 to-transparent" />

				<div className="absolute bottom-0 left-0 w-full translate-y-1/2 px-6 lg:px-12">
					<div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center md:items-end gap-6">
						<div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-cream-50 dark:border-dark-900 bg-white dark:bg-dark-800 shadow-card overflow-hidden relative shrink-0">
							{shop.avatar ? (
								<Image
									src={shop.avatar}
									alt={shop.shopName}
									fill
									className="object-cover"
								/>
							) : (
								<div className="w-full h-full flex items-center justify-center bg-gold-400 text-white text-4xl font-display font-bold">
									{shop.shopName[0]}
								</div>
							)}
						</div>

						<div className="flex-1 text-center md:text-left mb-2 md:mb-6">
							<div className="flex items-center justify-center md:justify-start gap-3">
								<h1 className="text-3xl md:text-4xl font-display font-bold text-dark-900 dark:text-cream-50 md:text-white drop-shadow-md">
									{shop.shopName}
								</h1>
								{shop.isVerified && (
									<ShieldCheck className="w-6 h-6 text-emerald-400 drop-shadow-md" />
								)}
							</div>
							<p className="text-gray-500 md:text-gray-300 mt-2 max-w-xl text-sm leading-relaxed drop-shadow-sm">
								{shop.bio}
							</p>
						</div>

						<div className="flex items-center gap-4 mb-2 md:mb-6">
							<div className="bg-white dark:bg-dark-800 px-6 py-3 rounded-2xl shadow-soft border border-gold-400/10 text-center">
								<div className="flex items-center justify-center gap-1 text-gold-400 font-bold text-xl">
									<Star className="w-5 h-5 fill-current" />{" "}
									{(shop.rating || 5).toFixed(1)}
								</div>
								<p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
									Rating
								</p>
							</div>
							<div className="bg-white dark:bg-dark-800 px-6 py-3 rounded-2xl shadow-soft border border-gold-400/10 text-center">
								<div className="flex items-center justify-center gap-1 text-dark-900 dark:text-cream-50 font-bold text-xl">
									<Package className="w-5 h-5 text-gray-400" />{" "}
									{shop.totalSales || 0}
								</div>
								<p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">
									Sales
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-screen-xl mx-auto px-6 mt-32 md:mt-24 space-y-16">
				{/* SELLER STATS ROW */}
				<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
					<div className="p-6 bg-cream-100 dark:bg-dark-800 rounded-3xl flex items-center gap-4">
						<MapPin className="w-8 h-8 text-gold-400" />
						<div>
							<p className="text-xs text-gray-500 font-bold uppercase">
								Location
							</p>
							<p className="font-bold">{shop.city || "Pakistan"}</p>
						</div>
					</div>
					<div className="p-6 bg-cream-100 dark:bg-dark-800 rounded-3xl flex items-center gap-4">
						<Clock className="w-8 h-8 text-gold-400" />
						<div>
							<p className="text-xs text-gray-500 font-bold uppercase">
								Response Time
							</p>
							<p className="font-bold">&lt; 2 Hours</p>
						</div>
					</div>
					<div className="p-6 bg-cream-100 dark:bg-dark-800 rounded-3xl flex items-center gap-4">
						<ShieldCheck className="w-8 h-8 text-gold-400" />
						<div>
							<p className="text-xs text-gray-500 font-bold uppercase">
								Escrow Protected
							</p>
							<p className="font-bold">100% Safe</p>
						</div>
					</div>
					<div className="p-6 bg-cream-100 dark:bg-dark-800 rounded-3xl flex items-center gap-4">
						<User className="w-8 h-8 text-gold-400" />
						<div>
							<p className="text-xs text-gray-500 font-bold uppercase">
								Joined
							</p>
							<p className="font-bold">
								{new Date(shop.joinedAt || new Date()).getFullYear()}
							</p>
						</div>
					</div>
				</div>

				{/* PRODUCTS SECTION */}
				<div className="space-y-8">
					<h2 className="text-2xl font-display font-bold flex items-center gap-2 border-b border-gold-400/10 pb-4">
						Shop Collection{" "}
						<span className="text-sm font-normal text-gray-500 ml-auto">
							{shop.products?.length || 0} items
						</span>
					</h2>

					{!shop.products || shop.products.length === 0 ? (
						<div className="text-center py-20 bg-white dark:bg-dark-800 rounded-[40px] border border-gold-400/10">
							<Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<p className="text-xl font-bold">No active listings yet</p>
							<p className="text-gray-500">Check back later for new items.</p>
						</div>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
							{shop.products.map((product: any) => (
								<Link
									key={product.id}
									href={`/product/${product.id}`}
									className="group bg-white dark:bg-dark-800 rounded-[32px] overflow-hidden shadow-soft border border-gold-400/10 hover:shadow-card transition-all"
								>
									<div className="relative aspect-[3/4] bg-cream-100 dark:bg-dark-900 overflow-hidden">
										<Image
											src={product.images?.[0] || ""}
											alt={product.title}
											fill
											className="object-cover group-hover:scale-110 transition-transform duration-700"
										/>
										<div className="absolute top-4 right-4 px-3 py-1 bg-white/90 dark:bg-dark-900/90 backdrop-blur-md rounded-lg text-[10px] font-bold uppercase shadow-sm">
											{product.condition}
										</div>
									</div>
									<div className="p-5 space-y-1">
										<h3 className="font-bold text-dark-900 dark:text-cream-50 truncate">
											{product.title}
										</h3>
										<p className="text-xs text-gray-500 truncate">
											{product.brand}
										</p>
										<p className="text-lg font-bold text-gold-400 pt-2">
											Rs. {(product.sellingPrice || 0).toLocaleString()}
										</p>
									</div>
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

function StorefrontIcon(props: any) {
	return (
		<svg
			{...props}
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth="2"
			strokeLinecap="round"
			strokeLinejoin="round"
		>
			<rect width="20" height="14" x="2" y="7" rx="2" />
			<path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
		</svg>
	);
}
