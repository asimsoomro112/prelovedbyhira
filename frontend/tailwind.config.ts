import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	darkMode: "class",
	theme: {
		extend: {
			colors: {
				gold: {
					50: "#FDF8ED",
					100: "#F9EDCC",
					200: "#F2D98A",
					300: "#EAC44A",
					400: "#C4A35A", // Brand Primary
					500: "#A8843A",
					600: "#8B6820",
					700: "#6B4E10",
				},
				dark: {
					950: "#090909", // OLED Black
					900: "#111111",
					800: "#1A1A1A",
					700: "#252525",
					600: "#2E2E2E",
					500: "#3A3A3A",
				},
				cream: {
					50: "#FFFDF9",
					100: "#FDF8F0",
					200: "#F5EFE0",
					300: "#EDE4CF",
				},
				semantic: {
					success: "#22C55E",
					warning: "#F59E0B",
					error: "#EF4444",
					info: "#3B82F6",
				},
				condition: {
					excellent: "#10B981",
					good: "#F59E0B",
					fair: "#F97316",
					poor: "#EF4444",
				},
			},
			fontFamily: {
				display: ["var(--font-playfair)", "serif"], // Heading
				body: ["var(--font-inter)", "sans-serif"], // Body
				accent: ["var(--font-dm-serif)", "serif"], // Prices/Labels
			},
			borderRadius: {
				card: "20px",
				pill: "9999px",
				modal: "28px",
				input: "14px",
			},
			boxShadow: {
				soft: "0 2px 20px rgba(0,0,0,0.06)",
				card: "0 8px 32px rgba(0,0,0,0.12)",
				gold: "0 4px 24px rgba(196,163,90,0.25)",
				glow: "0 0 40px rgba(196,163,90,0.15)",
			},
			animation: {
				shimmer: "shimmer 1.5s infinite linear",
				float: "float 6s ease-in-out infinite",
			},
			keyframes: {
				shimmer: {
					"0%": { backgroundPosition: "-200% 0" },
					"100%": { backgroundPosition: "200% 0" },
				},
				float: {
					"0%, 100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-20px)" },
				},
			},
		},
	},
	plugins: [],
};

export default config;
