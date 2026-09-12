"use client";

import { AlertTriangle, Home, RefreshCcw } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

export default function ErrorBoundary({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Seller Route Error:", error);
	}, [error]);

	return (
		<div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-dark-950 text-center">
			<div className="w-20 h-20 rounded-full bg-gold-400/10 flex items-center justify-center mb-6">
				<AlertTriangle className="w-10 h-10 text-gold-400" />
			</div>
			<h2 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50 mb-3">
				Seller Dashboard Error
			</h2>
			<p className="text-gray-500 max-w-md mb-8">
				We encountered a problem loading your seller workspace.
			</p>
			<div className="flex flex-wrap items-center justify-center gap-4">
				<button
					onClick={() => reset()}
					className="flex items-center gap-2 px-6 py-3 bg-dark-900 dark:bg-cream-50 text-cream-50 dark:text-dark-900 rounded-xl font-bold hover:scale-105 transition-all"
				>
					<RefreshCcw className="w-4 h-4" /> Try Again
				</button>
				<Link
					href="/seller/dashboard"
					className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-900 border border-gray-200 dark:border-white/10 rounded-xl font-bold hover:bg-gray-50 dark:hover:bg-dark-800 transition-all"
				>
					<Home className="w-4 h-4" /> Seller Dashboard
				</Link>
			</div>
		</div>
	);
}
