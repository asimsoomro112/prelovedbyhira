import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	const baseUrl =
		process.env.NEXT_PUBLIC_SITE_URL || "https://revaultx.vercel.app";

	return {
		rules: [
			{
				userAgent: "*",
				allow: "/",
				disallow: [
					"/admin/",
					"/seller/",
					"/customer/",
					"/api/",
					"/checkout",
					"/onboarding",
				],
			},
		],
		sitemap: `${baseUrl}/sitemap.xml`,
	};
}
