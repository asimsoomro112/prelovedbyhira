import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	images: {
		unoptimized: true,
		remotePatterns: [
			{ protocol: "https", hostname: "res.cloudinary.com" },
			{ protocol: "https", hostname: "images.unsplash.com" },
			{ protocol: "https", hostname: "i.ibb.co" },
			{ protocol: "https", hostname: "ibb.co" },
			{ protocol: "https", hostname: "image.ibb.co" },
			{ protocol: "https", hostname: "i.pravatar.cc" },
		],
	},
	// Silencing Turbopack/Webpack conflict by providing empty turbopack config
	turbopack: {},

	env: {
		NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
		NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
	},

	async headers() {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "X-XSS-Protection",
						value: "1; mode=block",
					},
					{
						key: "Strict-Transport-Security",
						value: "max-age=31536000; includeSubDomains; preload",
					},
				],
			},
		];
	},
};

export default nextConfig;
