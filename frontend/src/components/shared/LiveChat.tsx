"use client";

import {
	collection,
	limit,
	onSnapshot,
	orderBy,
	query,
} from "firebase/firestore";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2, MessageCircle, Send, ShieldCheck, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import api from "@/lib/api";
import { db } from "@/lib/firebase";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";

export default function LiveChat() {
	const { user, isAuthenticated } = useAuthStore();
	const isOpen = useChatStore((state) => state.isOpen);
	const closeChat = useChatStore((state) => state.closeChat);

	const [message, setMessage] = useState("");
	const [messages, setMessages] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const scrollRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (!isOpen || !user) return;

		const chatRef = collection(db, "support_chats", user.id, "messages");
		const q = query(chatRef, orderBy("timestamp", "asc"), limit(100));

		const unsubscribe = onSnapshot(
			q,
			(snapshot) => {
				const msgs = snapshot.docs.map((doc) => ({
					id: doc.id,
					...doc.data(),
				}));
				setMessages(msgs);
			},
			(error) => {
				console.error("Real-time sync error:", error);
				toast.error("Real-time sync failed. Trying to reconnect...");
			},
		);

		return () => unsubscribe();
	}, [isOpen, user]);

	// Scroll to bottom when messages change
	useEffect(() => {
		if (messages.length > 0 && isOpen) {
			setTimeout(() => {
				scrollRef.current?.scrollTo({
					top: scrollRef.current.scrollHeight,
					behavior: "smooth",
				});
			}, 100);
		}
	}, [messages.length, isOpen]);

	const handleSend = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!message.trim() || !user) return;

		const text = message;
		setMessage("");
		setIsLoading(true);

		try {
			// Use backend API to send so we can handle notifications/logic there
			await api.post("/chat/send", { text });
		} catch (_error) {
			toast.error("Failed to send message");
		} finally {
			setIsLoading(false);
		}
	};

	if (!isAuthenticated) return null;

	return (
		<div className="fixed bottom-8 right-8 z-[1000]">
			<AnimatePresence>
				{isOpen && (
					<motion.div
						initial={{ opacity: 0, y: 20, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 20, scale: 0.9 }}
						className="absolute bottom-20 right-0 w-[350px] md:w-[400px] h-[500px] bg-white dark:bg-dark-950 rounded-[32px] shadow-2xl border border-gold-400/20 overflow-hidden flex flex-col"
					>
						{/* Header */}
						<div className="p-6 bg-gradient-to-r from-gold-400 to-gold-600 text-white flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
									<ShieldCheck className="w-6 h-6" />
								</div>
								<div>
									<h4 className="font-bold text-sm">Neural Concierge</h4>
									<p className="text-[10px] opacity-80 uppercase tracking-widest font-black">
										24/7 Priority Support
									</p>
								</div>
							</div>
							<button
								onClick={closeChat}
								className="hover:rotate-90 transition-transform"
							>
								<X className="w-5 h-5" />
							</button>
						</div>

						{/* Messages */}
						<div
							ref={scrollRef}
							className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-none bg-cream-50/30 dark:bg-black/20"
						>
							{messages.length === 0 ? (
								<div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 px-10">
									<MessageCircle className="w-12 h-12 text-gold-400" />
									<p className="text-xs font-bold leading-relaxed">
										Welcome to the ReVault Vault Portal. How can we assist you
										today?
									</p>
								</div>
							) : (
								messages.map((msg) => (
									<div
										key={msg.id}
										className={`flex ${msg.senderId === user?.id ? "justify-end" : "justify-start"}`}
									>
										<div
											className={`max-w-[80%] p-4 rounded-2xl text-sm ${
												msg.senderId === user?.id
													? "bg-gold-400 text-white rounded-tr-none shadow-gold-sm"
													: "bg-white dark:bg-dark-900 border border-gold-400/10 rounded-tl-none shadow-soft"
											}`}
										>
											{msg.text}
											<p
												className={`text-[8px] mt-1 ${msg.senderId === user?.id ? "text-white/60" : "text-gray-400"}`}
											>
												{msg.timestamp
													? new Date(msg.timestamp).toLocaleTimeString([], {
															hour: "2-digit",
															minute: "2-digit",
														})
													: "Sending..."}
											</p>
										</div>
									</div>
								))
							)}
						</div>

						{/* Input */}
						<form
							onSubmit={handleSend}
							className="p-4 border-t border-gold-400/10 bg-white dark:bg-dark-950"
						>
							<div className="relative group">
								<input
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									placeholder="Type your message..."
									className="w-full h-12 bg-cream-50 dark:bg-dark-900 rounded-xl pl-4 pr-12 text-sm outline-none border border-gold-400/10 focus:border-gold-400 transition-all"
								/>
								<button
									type="submit"
									disabled={!message.trim() || isLoading}
									className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-gold-400 text-white rounded-lg flex items-center justify-center disabled:opacity-50 hover:scale-105 active:scale-95 transition-all"
								>
									{isLoading ? (
										<Loader2 className="w-4 h-4 animate-spin" />
									) : (
										<Send className="w-4 h-4" />
									)}
								</button>
							</div>
						</form>
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
