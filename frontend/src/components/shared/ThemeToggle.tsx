"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
	const { theme, setTheme, resolvedTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	// Avoid hydration mismatch
	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-11 h-11" />;

	const isDark = resolvedTheme === "dark";

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="w-11 h-11 rounded-xl glass-crystal border border-white/5 flex items-center justify-center text-gray-400 hover:text-gold-400 transition-all relative overflow-hidden group"
			aria-label="Toggle Theme"
		>
			<motion.div
				initial={false}
				animate={{
					y: isDark ? 0 : 40,
					opacity: isDark ? 1 : 0,
				}}
				className="absolute"
			>
				<Moon className="w-5 h-5" />
			</motion.div>

			<motion.div
				initial={false}
				animate={{
					y: isDark ? -40 : 0,
					opacity: isDark ? 0 : 1,
				}}
				className="absolute"
			>
				<Sun className="w-5 h-5" />
			</motion.div>
		</button>
	);
}
