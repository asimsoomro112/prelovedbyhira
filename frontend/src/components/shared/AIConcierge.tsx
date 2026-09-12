"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
	AlertTriangle,
	Image as ImageIcon,
	Package,
	Send,
	ShieldCheck,
	ShoppingBag,
	Sparkles,
	X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";

interface Message {
	id: string;
	role: "user" | "assistant";
	content: string;
	type?: "text" | "card" | "action";
	data?: any;
}

export default function AIConcierge() {
	const [isOpen, setIsOpen] = useState(false);
	const [messages, setMessages] = useState<Message[]>([
		{
			id: "1",
			role: "assistant",
			content:
				"Assalam-o-Alaikum! I am ReVault's AI Concierge. Main aapki kaise madad kar sakti hoon today?",
			type: "text",
		},
	]);
	const [input, setInput] = useState("");
	const [isTyping, setIsTyping] = useState(false);
	const { user } = useAuthStore();
	const pathname = usePathname();
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (scrollRef.current) {
			scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
		}
	}, []);

	// 🛡️ VISIBILITY LOGIC: Hide on Admin and Seller portals
	const isAdminPath = pathname?.startsWith("/admin");
	const isSellerPath = pathname?.startsWith("/seller");
	const isUserAdmin = user?.role === "ADMIN";
	const isUserSeller = user?.role === "SELLER";

	if (
		isAdminPath ||
		isSellerPath ||
		isUserAdmin ||
		(isUserSeller && isSellerPath)
	) {
		return null;
	}

	const handleSend = async () => {
		if (!input.trim()) return;

		const userMsg: Message = {
			id: Date.now().toString(),
			role: "user",
			content: input,
		};
		setMessages((prev) => [...prev, userMsg]);
		setInput("");
		setIsTyping(true);

		try {
			// Neural Handshake with Backend AI
			const { data } = await api.post("/ai/chat", {
				message: input,
				// Gemini history must start with user and alternate.
				// We filter out the initial greeting to ensure it starts correctly.
				history: messages
					.filter((m) => m.id !== "1")
					.map((m) => ({ role: m.role, content: m.content })),
			});

			const response: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content: data.response,
				type: "text",
			};

			setMessages((prev) => [...prev, response]);
		} catch (_error) {
			const errorMsg: Message = {
				id: (Date.now() + 1).toString(),
				role: "assistant",
				content:
					"Maafi chahti hoon, mera server connection unstable hai. Please check back in a moment! 💎",
			};
			setMessages((prev) => [...prev, errorMsg]);
		} finally {
			setIsTyping(false);
		}
	};

	return (
		<>
			{/* 🔮 THE NEURAL ORB TRIGGER */}
			<motion.button
				onClick={() => setIsOpen(true)}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
				className="fixed bottom-24 sm:bottom-10 right-6 z-[200] w-16 h-16 rounded-full bg-gradient-to-br from-gold-400 to-gold-600 shadow-gold flex items-center justify-center group overflow-hidden"
			>
				<div className="absolute inset-0 bg-white/20 blur-xl animate-pulse" />
				<Sparkles className="w-8 h-8 text-white relative z-10 group-hover:rotate-12 transition-transform" />
				<div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
			</motion.button>

			{/* 🎭 CONCIERGE INTERFACE */}
			<AnimatePresence>
				{isOpen && (
					<div className="fixed inset-0 z-[250] flex items-end justify-center sm:justify-end sm:p-6 pointer-events-none">
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							onClick={() => setIsOpen(false)}
							className="absolute inset-0 bg-dark-950/40 backdrop-blur-md pointer-events-auto"
						/>

						<motion.div
							initial={{ y: "100%", opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							exit={{ y: "100%", opacity: 0 }}
							transition={{ type: "spring", damping: 30, stiffness: 300 }}
							className="relative w-full sm:max-w-md h-[100dvh] sm:h-[600px] glass-ultra crystal-border sm:rounded-[48px] rounded-t-[32px] shadow-2xl flex flex-col pointer-events-auto overflow-hidden"
						>
							{/* HEADER */}
							<div className="p-6 sm:p-8 bg-gradient-to-br from-gold-400/10 to-gold-600/10 border-b border-gold-400/10 flex items-center justify-between shrink-0">
								<div className="flex items-center gap-4">
									<div className="relative w-12 h-12 rounded-2xl bg-gold-400 flex items-center justify-center shadow-gold">
										<Sparkles className="w-6 h-6 text-white" />
										<span className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-dark-900" />
									</div>
									<div>
										<h3 className="text-lg sm:text-xl font-display font-bold text-dark-900 dark:text-cream-50">
											ReVault AI{" "}
											<span className="italic text-gold-400">Concierge</span>
										</h3>
										<p className="text-[9px] font-bold text-gold-400 uppercase tracking-widest mt-1">
											2026 Neural Assistant
										</p>
									</div>
								</div>
								<button
									onClick={() => setIsOpen(false)}
									className="w-12 h-12 rounded-2xl hover:bg-gold-400/10 flex items-center justify-center text-gray-400 transition-colors"
								>
									<X className="w-8 h-8 sm:w-6 sm:h-6" />
								</button>
							</div>

							{/* CHAT AREA */}
							<div
								ref={scrollRef}
								className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 scrollbar-none touch-pan-y"
							>
								{messages.map((msg) => (
									<motion.div
										key={msg.id}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[90%] sm:max-w-[85%] p-4 sm:p-5 rounded-[24px] ${
												msg.role === "user"
													? "bg-gold-400 text-white shadow-gold rounded-tr-none"
													: "glass-crystal crystal-border text-dark-800 dark:text-cream-50 rounded-tl-none"
											}`}
										>
											<p className="text-sm font-medium leading-relaxed">
												{msg.content}
											</p>

											{msg.type === "card" && (
												<div className="mt-4 p-4 bg-white/10 rounded-xl border border-white/20">
													<div className="flex items-center gap-3 mb-3">
														<Package className="w-4 h-4" />
														<span className="text-[10px] font-bold uppercase tracking-widest">
															{msg.data.title}
														</span>
													</div>
													<div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
														<div
															className="h-full bg-white rounded-full"
															style={{ width: `${msg.data.progress}%` }}
														/>
													</div>
													<p className="text-[10px] mt-2 font-bold opacity-80 uppercase">
														{msg.data.status}
													</p>
												</div>
											)}
										</div>
									</motion.div>
								))}
								{isTyping && (
									<div className="flex justify-start">
										<div className="glass-crystal crystal-border p-4 rounded-2xl flex gap-1">
											<span
												className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"
												style={{ animationDelay: "0ms" }}
											/>
											<span
												className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"
												style={{ animationDelay: "150ms" }}
											/>
											<span
												className="w-1.5 h-1.5 bg-gold-400 rounded-full animate-bounce"
												style={{ animationDelay: "300ms" }}
											/>
										</div>
									</div>
								)}
							</div>

							{/* INPUT AREA */}
							<div className="p-4 sm:p-6 bg-gradient-to-t from-gold-400/5 to-transparent border-t border-gold-400/10 shrink-0 pb-safe">
								<div className="flex gap-2 mb-4 overflow-x-auto scrollbar-none pb-1">
									<QuickAction
										label="Track Order"
										icon={<Package className="w-3 h-3" />}
										onClick={() => setInput("Track my order")}
									/>
									<QuickAction
										label="List Item"
										icon={<ShoppingBag className="w-3 h-3" />}
										onClick={() => setInput("I want to sell something")}
									/>
									<QuickAction
										label="Complaint"
										icon={<AlertTriangle className="w-3 h-3" />}
										onClick={() => setInput("I have an issue")}
									/>
								</div>
								<div className="relative group">
									<div className="absolute inset-0 bg-gold-400/5 rounded-2xl blur-lg group-hover:bg-gold-400/10 transition-colors" />
									<div className="relative glass-crystal crystal-border rounded-2xl h-14 flex items-center px-4 gap-3 focus-within:border-gold-400/50 transition-all">
										<button className="text-gray-400 hover:text-gold-400 min-w-[32px] flex items-center justify-center">
											<ImageIcon className="w-5 h-5" />
										</button>
										<input
											value={input}
											onChange={(e) => setInput(e.target.value)}
											onKeyPress={(e) => e.key === "Enter" && handleSend()}
											placeholder="Message ReVault..."
											className="bg-transparent border-none outline-none flex-1 text-sm font-bold text-dark-900 dark:text-cream-50 placeholder:text-gray-500"
										/>
										<button
											onClick={handleSend}
											className="w-11 h-11 rounded-xl bg-gold-400 text-white flex items-center justify-center shadow-gold hover:scale-105 active:scale-95 transition-all shrink-0"
										>
											<Send className="w-5 h-5" />
										</button>
									</div>
								</div>
							</div>

							{/* TRUST FOOTER */}
							<div className="px-8 py-3 bg-dark-900 flex items-center justify-center gap-2">
								<ShieldCheck className="w-3 h-3 text-gold-400" />
								<span className="text-[10px] font-bold text-white uppercase tracking-[0.4em]">
									Encrypted AI Exchange • 2026 Protocol
								</span>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}

function QuickAction({ label, icon, onClick }: any) {
	return (
		<button
			onClick={onClick}
			className="flex items-center gap-2 px-4 py-2.5 glass-crystal crystal-border rounded-xl text-[10px] font-bold uppercase tracking-widest text-zinc-500 dark:text-zinc-400 hover:text-gold-400 hover:border-gold-400 transition-all whitespace-nowrap active:scale-95"
		>
			{icon} {label}
		</button>
	);
}
