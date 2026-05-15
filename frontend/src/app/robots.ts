import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://revault.pk';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/seller/',
          '/customer/',
          '/api/',
          '/checkout',
          '/onboarding',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
