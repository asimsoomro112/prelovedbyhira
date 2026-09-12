import { AnimatePresence, motion } from "framer-motion";
import {
	ChevronLeft,
	ChevronRight,
	Heart,
	Share2,
	ShieldCheck,
	Upload,
	ZoomIn,
} from "lucide-react";
import Image from "next/image";

interface ProductGalleryProps {
	product: any;
	img: number;
	setImg: React.Dispatch<React.SetStateAction<number>>;
	galleryItems: any[];
	swipe: any;
	setLightbox: (v: boolean) => void;
	wishlisted: boolean;
	onWishlist: () => void;
	onShare: () => void;
	savings: number;
}

export function ProductGallery({
	product,
	img,
	setImg,
	galleryItems,
	swipe,
	setLightbox,
	wishlisted,
	onWishlist,
	onShare,
	savings,
}: ProductGalleryProps) {
	return (
		<div className="lg:sticky lg:top-28 space-y-3 lg:space-y-5">
			{/* Main image */}
			<div
				{...swipe}
				onClick={() => setLightbox(true)}
				className="relative aspect-[4/5] lg:aspect-[3/4] rounded-[24px] lg:rounded-[40px] overflow-hidden bg-white dark:bg-dark-900 cursor-zoom-in group border border-black/5 dark:border-white/5 shadow-xl select-none"
			>
				<AnimatePresence mode="wait">
					<motion.div
						key={img}
						initial={{ opacity: 0, scale: 1.04 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0 }}
						transition={{ duration: 0.45 }}
						className="absolute inset-0"
					>
						<Image
							src={
								product.images?.[img] ||
								"https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&q=80&w=1200"
							}
							alt={product.title}
							fill
							priority
							sizes="(max-width: 768px) 100vw, 55vw"
							className="object-cover group-hover:scale-[1.04] transition-transform duration-1000 ease-out"
						/>
					</motion.div>
				</AnimatePresence>

				{/* Top-left badges */}
				<div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
					<span className="flex items-center gap-1.5 px-3 py-1.5 bg-black/35 backdrop-blur-md text-white rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg">
						<span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{" "}
						Unique Piece
					</span>
					<span className="flex items-center gap-1.5 px-3 py-1.5 bg-gold-400/85 backdrop-blur-md text-white rounded-full text-[9px] lg:text-[10px] font-bold uppercase tracking-widest border border-white/10 shadow-lg">
						<ShieldCheck className="w-3 h-3" /> Vetted
					</span>
				</div>

				{/* Savings badge — top-right */}
				{savings > 0 && (
					<div className="absolute top-4 right-4 z-10 bg-emerald-500 text-white rounded-2xl px-3 py-2 shadow-lg flex flex-col items-center pointer-events-none">
						<span className="text-[7px] font-bold uppercase tracking-widest opacity-80 leading-none">
							Save
						</span>
						<span className="text-lg font-black leading-tight">{savings}%</span>
					</div>
				)}

				{/* Desktop: wishlist + share on image */}
				<div className="hidden lg:flex absolute bottom-6 right-6 flex-col gap-3 z-10">
					<button
						onClick={(e) => {
							e.stopPropagation();
							onWishlist();
						}}
						className={`w-12 h-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all shadow-xl hover:scale-110 ${wishlisted ? "bg-red-500/15 border-red-400/40 text-red-500" : "bg-white/60 dark:bg-black/40 border-white/20 text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white hover:border-transparent"}`}
					>
						<Heart
							className={`w-5 h-5 transition-all ${wishlisted ? "fill-red-500" : ""}`}
						/>
					</button>
					<button
						onClick={(e) => {
							e.stopPropagation();
							onShare();
						}}
						className="w-12 h-12 rounded-2xl bg-white/60 dark:bg-black/40 backdrop-blur-xl border border-white/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white hover:border-transparent transition-all shadow-xl hover:scale-110"
					>
						<Share2 className="w-5 h-5" />
					</button>
				</div>

				{/* Zoom hint */}
				<div className="hidden lg:flex absolute bottom-6 left-6 items-center gap-1.5 px-3 py-1.5 bg-black/30 backdrop-blur-md text-white rounded-full text-[9px] font-bold uppercase tracking-widest pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
					<ZoomIn className="w-3 h-3" /> Click to zoom
				</div>

				{/* Desktop nav arrows */}
				{galleryItems.length > 1 && (
					<div className="absolute inset-x-5 top-1/2 -translate-y-1/2 hidden lg:flex justify-between z-10 pointer-events-none">
						<button
							onClick={(e) => {
								e.stopPropagation();
								setImg((p) => (p > 0 ? p - 1 : galleryItems.length - 1));
							}}
							className="pointer-events-auto w-12 h-12 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white hover:border-transparent transition-all shadow-xl hover:scale-110 opacity-0 group-hover:opacity-100"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								setImg((p) => (p < galleryItems.length - 1 ? p + 1 : 0));
							}}
							className="pointer-events-auto w-12 h-12 rounded-full bg-white/70 dark:bg-black/50 backdrop-blur-xl border border-white/20 flex items-center justify-center text-dark-900 dark:text-white hover:bg-gold-400 hover:text-white hover:border-transparent transition-all shadow-xl hover:scale-110 opacity-0 group-hover:opacity-100"
						>
							<ChevronRight className="w-6 h-6" />
						</button>
					</div>
				)}

				{/* Mobile dots */}
				{galleryItems.length > 1 && (
					<div className="lg:hidden absolute bottom-4 inset-x-0 flex justify-center items-center gap-1.5 z-10">
						{galleryItems.map((_: any, i: number) => (
							<button
								key={i}
								onClick={(e) => {
									e.stopPropagation();
									setImg(i);
								}}
								className={`transition-all duration-300 rounded-full ${i === img ? "w-6 h-1.5 bg-gold-400" : "w-1.5 h-1.5 bg-white/50"}`}
							/>
						))}
					</div>
				)}
			</div>

			{/* Thumbnails — desktop */}
			<div className="hidden lg:flex gap-3">
				{galleryItems.map((item: any, i: number) => (
					<button
						key={i}
						onClick={() => setImg(i)}
						className={`relative w-[72px] h-24 rounded-2xl overflow-hidden shrink-0 transition-all duration-300 ${i === img ? "ring-2 ring-gold-400 ring-offset-[3px] dark:ring-offset-dark-950 scale-[0.93]" : "opacity-40 hover:opacity-80"}`}
					>
						{item.type === "video" ? (
							<div className="w-full h-full bg-dark-900 flex flex-col items-center justify-center text-gold-400">
								<Upload className="w-6 h-6" />
								<span className="text-[8px] font-black uppercase tracking-tighter mt-1">
									Video
								</span>
							</div>
						) : (
							<Image
								src={item.url}
								alt=""
								fill
								sizes="72px"
								className="object-cover"
							/>
						)}
					</button>
				))}
			</div>

			{/* Thumbnails — mobile (compact) */}
			<div className="lg:hidden flex gap-2 overflow-x-auto scrollbar-none pb-0.5">
				{product.images?.map((src: string, i: number) => (
					<button
						key={i}
						onClick={() => setImg(i)}
						className={`relative w-14 h-[72px] rounded-xl overflow-hidden shrink-0 transition-all ${i === img ? "ring-2 ring-gold-400 ring-offset-2 dark:ring-offset-dark-950 scale-[0.93]" : "opacity-35 hover:opacity-70"}`}
					>
						<Image
							src={src}
							alt=""
							fill
							sizes="56px"
							className="object-cover"
						/>
					</button>
				))}
			</div>
		</div>
	);
}
