"use client";

import { motion } from "framer-motion";
import { FileText, Gavel, Lock, Shield } from "lucide-react";
import { usePathname } from "next/navigation";

export default function LegalLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const pathname = usePathname();

	return (
		<div className="min-h-screen bg-mesh dark:bg-black py-10 lg:py-16 print:py-0 print:bg-white">
			{/* Print-only styles to hide nav/footer/buttons */}
			<style jsx global>{`
        @media print {
          nav, footer, .glass-ultra.crystal-border.rounded-3xl, button, .AIConcierge, .LiveChat {
            display: none !important;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            color-adjust: exact !important;
            transform: none !important;
            animation: none !important;
            transition: none !important;
          }
          .prose {
            max-width: none !important;
            color: black !important;
          }
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .glass-ultra {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            transform: none !important;
          }
          motion-div, [style*="transform"] {
            transform: none !important;
          }
        }
      `}</style>

			<div className="max-w-4xl mx-auto px-6 print:px-0 print:max-w-none">
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					className="glass-ultra crystal-border rounded-[48px] overflow-hidden shadow-2xl bg-white/80 dark:bg-dark-900/80 backdrop-blur-3xl"
				>
					{/* Header Section */}
					<div className="p-6 md:p-12 border-b border-gold-400/10 bg-gradient-to-br from-gold-400/5 to-transparent text-center relative overflow-hidden">
						<div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-gold-400 to-transparent" />
						<div className="w-20 h-20 bg-gold-400/10 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl">
							<Shield className="w-10 h-10 text-gold-400" />
						</div>
						<h1 className="text-4xl md:text-6xl font-display font-bold text-dark-900 dark:text-cream-50">
							{pathname === "/legal/terms"
								? "Terms of Service"
								: pathname === "/legal/privacy"
									? "Privacy Policy"
									: pathname === "/legal/escrow"
										? "Escrow Policy"
										: "Legal Vault"}
							<span className="text-gold-400 italic">.</span>
						</h1>
						<div className="mt-4 flex items-center justify-center gap-3">
							<span className="h-px w-8 bg-gold-400/30" />
							<p className="text-gold-400 uppercase tracking-[0.3em] text-[10px] font-black">
								2026 Trust & Compliance Protocol
							</p>
							<span className="h-px w-8 bg-gold-400/30" />
						</div>
					</div>

					<div className="p-6 md:p-12 prose prose-gold dark:prose-invert max-w-none">
						{children}
					</div>

					{/* Footer Support */}
					<div className="p-8 bg-gold-400/5 border-t border-gold-400/10 flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="flex items-center gap-4">
							<div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
								<Lock className="w-6 h-6 text-emerald-500" />
							</div>
							<div>
								<p className="text-sm font-bold text-dark-900 dark:text-cream-50">
									Encrypted Legal Data
								</p>
								<p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">
									End-to-End Secure
								</p>
							</div>
						</div>
						<button
							onClick={() => window.print()}
							className="px-8 py-4 bg-dark-900 text-white dark:bg-gold-400 rounded-2xl font-bold text-sm shadow-xl hover:scale-105 transition-all"
						>
							Download PDF Copy
						</button>
					</div>
				</motion.div>

				{/* Quick Nav */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
					<LegalNavCard
						icon={<FileText />}
						label="Terms"
						href="/legal/terms"
						active={pathname === "/legal/terms"}
					/>
					<LegalNavCard
						icon={<Lock />}
						label="Privacy"
						href="/legal/privacy"
						active={pathname === "/legal/privacy"}
					/>
					<LegalNavCard
						icon={<Gavel />}
						label="Escrow Policy"
						href="/legal/escrow"
						active={pathname === "/legal/escrow"}
					/>
				</div>
			</div>
		</div>
	);
}

function LegalNavCard({ icon, label, href, active }: any) {
	return (
		<a
			href={href}
			className={`p-6 glass-ultra crystal-border rounded-3xl flex items-center gap-4 transition-all group ${
				active
					? "bg-gold-400/20 border-gold-400 shadow-[0_0_30px_rgba(201,162,39,0.2)]"
					: "hover:bg-gold-400/5"
			}`}
		>
			<div
				className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
					active
						? "bg-gold-400 text-white scale-110 shadow-gold"
						: "bg-gold-400/10 text-gold-400 group-hover:scale-110"
				}`}
			>
				{icon}
			</div>
			<span className={`font-bold text-sm ${active ? "text-gold-400" : ""}`}>
				{label}
			</span>
		</a>
	);
}
