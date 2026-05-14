import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Allow mobile network debugging
  allowedDevOrigins: ['192.168.100.72:3000', 'localhost:3000', '192.168.100.72'],
  
  // Silencing Turbopack/Webpack conflict by providing empty turbopack config
  turbopack: {},
  
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_BACKEND_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL || 'http://192.168.100.72:5000',
  },
};

export default nextConfig;
