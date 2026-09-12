"use client";

import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);

	useEffect(() => setMounted(true), []);

	if (!mounted) return <div className="w-10 h-10" />;

	const isDark = theme === "dark";

	return (
		<button
			onClick={() => setTheme(isDark ? "light" : "dark")}
			className="relative w-12 h-12 flex items-center justify-center rounded-xl bg-gold-400/10 text-gold-400 hover:scale-110 transition-all overflow-hidden group"
		>
			<motion.div
				initial={false}
				animate={{
					y: isDark ? 40 : 0,
					opacity: isDark ? 0 : 1,
				}}
				className="absolute"
			>
				<Sun className="w-5 h-5 fill-gold-400" />
			</motion.div>
			<motion.div
				initial={false}
				animate={{
					y: isDark ? 0 : -40,
					opacity: isDark ? 1 : 0,
				}}
				className="absolute"
			>
				<Moon className="w-5 h-5 fill-gold-400" />
			</motion.div>
		</button>
	);
}
