"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Customer Route Error:", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 bg-gray-50 dark:bg-dark-950 text-center">
      <div className="w-20 h-20 rounded-full bg-gold-400/10 flex items-center justify-center mb-6">
        <AlertTriangle className="w-10 h-10 text-gold-400" />
      </div>
      <h2 className="text-3xl font-display font-bold text-dark-900 dark:text-cream-50 mb-3">
        Oops! Something went wrong
      </h2>
      <p className="text-gray-500 max-w-md mb-8">
        We encountered an unexpected error while loading this page. Our team has been notified.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          onClick={() => reset()}
          className="flex items-center gap-2 px-6 py-3 bg-gold-400 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-gold"
        >
          <RefreshCcw className="w-4 h-4" /> Try Again
        </button>
        <Link
          href="/products"
          className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-dark-900 border border-gold-400/20 text-gold-500 rounded-xl font-bold hover:bg-gold-400/5 transition-all"
        >
          <ShoppingBag className="w-4 h-4" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}
