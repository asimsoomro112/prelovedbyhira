"use client";

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
	ArrowRight,
	ChevronRight,
	Filter,
	Gem,
	Heart,
	Search,
	ShoppingBag,
	Sparkles,
	Star,
	TrendingUp,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import api from "@/lib/api";

const categories = [
	// ... (rest of categories)
	{
		name: "Shadi & Formal Suits",
		slug: "SHADI-WEAR",
		icon: <Gem />,
		image:
			"https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&q=80&w=600",
		count: 320,
	},
	{
		name: "Luxury Bridal",
		slug: "BRIDAL",
		icon: <Sparkles />,
		image:
			"https://images.unsplash.com/photo-1594463750939-ebb28c3f7f75?auto=format&fit=crop&q=80&w=600",
		count: 45,
	},
	{
		name: "Kurtas & Shirts",
		slug: "KURTAS",
		icon: <TrendingUp />,
		image:
			"https://images.unsplash.com/photo-1591192921508-30113f89a9f2?auto=format&fit=crop&q=80&w=600",
		count: 540,
	},
	{
		name: "Designer Shoes",
		slug: "SHOES",
		icon: <Zap />,
		image:
			"https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=600",
		count: 210,
	},
	{
		name: "Premium Watches",
		slug: "WATCHES",
		icon: <Star />,
		image:
			"https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&q=80&w=600",
		count: 125,
	},
	{
		name: "Bags & Accessories",
		slug: "BAGS",
		icon: <ShoppingBag />,
		image:
			"https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=600",
		count: 430,
	},
];

export default function SellerExplorePage() {
	const router = useRouter();
	const [search, setSearch] = useState("");

	const { data: latestProducts } = useQuery({
		queryKey: ["seller-explore-latest"],
		queryFn: async () => {
			const { data } = await api.get("/products?limit=8");
			return data;
		},
	});

	const handleSearch = () => {
		if (search.trim()) {
			router.push(`/products?search=${encodeURIComponent(search)}`);
		} else {
			router.push(`/products`);
		}
	};

	return (
		<div className="min-h-screen pb-32 bg-white dark:bg-dark-950 transition-colors duration-500">
			{/* 🌌 IMMERSIVE SEARCH HEADER */}
			<section className="relative pt-32 pb-20 px-6 lg:px-8 overflow-hidden">
				<div className="absolute inset-0 bg-mesh opacity-30" />
				<div className="relative max-w-5xl mx-auto text-center space-y-12">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						className="space-y-4"
					>
						<h1 className="text-5xl lg:text-7xl font-display font-bold text-dark-900 dark:text-cream-50">
							Discover the <span className="text-gold-400 italic">Vault.</span>
						</h1>
						<p className="text-dark-700/60 dark:text-cream-50/60 text-lg font-medium">
							Browse Pakistan's most exclusive preloved fashion collections.
						</p>
					</motion.div>

					<div className="relative max-w-2xl mx-auto group">
						<div className="absolute inset-0 bg-gold-400/20 blur-2xl group-focus-within:bg-gold-400/40 transition-all rounded-full" />
						<div className="relative glass-ultra crystal-border rounded-[32px] h-20 flex items-center px-8 gap-4 shadow-gold-3d">
							<button onClick={handleSearch}>
								<Search className="w-6 h-6 text-gold-400 hover:scale-110 transition-transform" />
							</button>
							<input
								type="text"
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								onKeyDown={(e) => e.key === "Enter" && handleSearch()}
								placeholder="Search brands, categories, or items..."
								className="bg-transparent border-none focus:ring-0 w-full text-lg placeholder:text-gray-400 font-medium text-dark-900 dark:text-cream-50"
							/>
							<button
								onClick={() => router.push("/products")}
								className="w-12 h-12 rounded-2xl bg-gold-400 text-white flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all"
							>
								<Filter className="w-5 h-5" />
							</button>
						</div>
						<div className="flex flex-wrap justify-center gap-3 mt-6">
							{["LV", "Bridal", "Kurta", "Gucci", "Shoes"].map((tag) => (
								<span
									key={tag}
									className="px-4 py-1.5 glass-crystal crystal-border rounded-full text-[10px] font-bold text-gold-400 uppercase tracking-widest cursor-pointer hover:bg-gold-400/10 transition-colors"
								>
									{tag}
								</span>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* 🍱 VISUAL CATEGORY BENTO */}
			<section className="px-6 lg:px-8 py-20">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-center justify-between mb-12">
						<h2 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50">
							Curated <span className="text-gold-400 italic">Portals.</span>
						</h2>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
						{categories.map((cat, i) => (
							<Link
								key={cat.slug}
								href={`/products?category=${cat.slug}`}
								className={`group relative h-[300px] rounded-[48px] overflow-hidden crystal-border shadow-soft hover:shadow-gold-3d transition-all duration-500 ${i === 1 ? "md:col-span-2" : ""}`}
							>
								<img
									src={cat.image}
									className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s]"
									alt={cat.name}
								/>
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

								<div className="absolute bottom-8 left-8 right-8 flex items-end justify-between text-white">
									<div className="space-y-2">
										<div className="w-10 h-10 rounded-xl glass-ultra crystal-border flex items-center justify-center text-gold-400">
											{cat.icon}
										</div>
										<h3 className="text-2xl font-display font-bold text-white">
											{cat.name}
										</h3>
										<p className="text-[10px] font-bold text-gold-400 uppercase tracking-[0.3em]">
											{cat.count}+ Items Available
										</p>
									</div>
									<div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-gold-400 group-hover:border-gold-400 transition-all">
										<ArrowRight className="w-5 h-5" />
									</div>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* 💎 LATEST FROM THE VAULT */}
			<section className="px-6 lg:px-8 py-20">
				<div className="max-w-7xl mx-auto">
					<div className="flex items-end justify-between mb-16">
						<div className="space-y-4">
							<div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gold-400/10 text-gold-400 rounded-full text-[10px] font-bold uppercase tracking-widest border border-gold-400/20">
								<Zap className="w-3 h-3 fill-gold-400" />
								Live in the Vault
							</div>
							<h2 className="text-4xl lg:text-6xl font-display font-bold text-dark-900 dark:text-cream-50">
								Latest <span className="text-gold-400 italic">Luxury.</span>
							</h2>
						</div>
						<Link
							href="/products"
							className="text-gold-400 font-bold hover:underline flex items-center gap-2"
						>
							View All Drops <ArrowRight className="w-4 h-4" />
						</Link>
					</div>

					<div className="grid grid-cols-2 md:grid-cols-4 gap-12">
						{latestProducts?.products?.map((product: any) => (
							<Link
								href={`/product/${product.id}`}
								key={product.id}
								className="group cursor-pointer"
							>
								<div className="aspect-[3/4] glass-ultra crystal-border rounded-[40px] overflow-hidden relative mb-8 shadow-soft group-hover:shadow-gold-3d transition-all">
									<img
										src={
											product.images?.[0] ||
											"https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1000"
										}
										className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
										alt={product.title || product.name}
									/>
									<div className="absolute top-6 right-6 z-10">
										<button className="w-12 h-12 rounded-full bg-white/80 backdrop-blur-md flex items-center justify-center text-gray-400 hover:text-pink-500 transition-colors shadow-lg">
											<Heart className="w-6 h-6" />
										</button>
									</div>
									<div className="absolute inset-x-6 bottom-6 translate-y-20 group-hover:translate-y-0 transition-transform duration-500">
										<div className="glass-ultra crystal-border rounded-2xl p-4 flex items-center justify-between text-white">
											<span className="text-[10px] font-bold uppercase tracking-widest">
												Quick View
											</span>
											<ChevronRight className="w-4 h-4" />
										</div>
									</div>
								</div>
								<div className="space-y-3 px-4">
									<div className="flex items-center justify-between">
										<p className="text-[10px] font-bold text-gold-400 uppercase tracking-widest">
											{product.category}
										</p>
										<div className="flex items-center gap-1 text-gold-400">
											<Star className="w-3 h-3 fill-gold-400" />
											<span className="text-[10px] font-bold">4.9</span>
										</div>
									</div>
									<h3 className="text-xl font-display font-bold text-dark-900 dark:text-cream-50 group-hover:text-gold-400 transition-colors line-clamp-1">
										{product.title || product.name}
									</h3>
									<p className="text-2xl font-display font-bold text-gold-400">
										Rs.{" "}
										{(
											product.sellingPrice ||
											product.price ||
											0
										).toLocaleString()}
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* 🏁 DISCOVERY CTA */}
			<section className="px-6 lg:px-8 py-32">
				<div className="max-w-5xl mx-auto glass-ultra crystal-border rounded-[64px] p-20 text-center space-y-10 relative overflow-hidden">
					<div className="absolute inset-0 bg-gradient-to-br from-gold-400/10 to-transparent" />
					<h2 className="text-4xl lg:text-6xl font-display font-bold text-dark-900 dark:text-cream-50 relative z-10">
						Can't find what <br />
						you're <span className="text-gold-400 italic">looking for?</span>
					</h2>
					<p className="text-dark-700/60 dark:text-cream-50/60 max-w-lg mx-auto relative z-10 text-lg">
						Our AI Concierge can help you track down specific brands or sizes.
						We'll notify you as soon as they hit the vault.
					</p>
					<button className="relative z-10 px-12 py-5 bg-gold-400 text-white rounded-2xl font-bold shadow-gold hover:scale-105 transition-all">
						Notify Me of New Drops
					</button>
				</div>
			</section>
		</div>
	);
}
