/** @type {import('next').NextConfig} */
const nextConfig = {
  // Performance optimizations for EC2
  experimental: {
    // Disable turbopack for better compatibility on smaller instances
    turbo: false,
    // Optimize build output
    optimizeCss: true,
    // Reduce bundle size
    optimizePackageImports: ['lucide-react', 'next/image'],
  },
  
  // Compiler optimizations
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack optimizations
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Optimize client-side bundle
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      };
    }
    return config;
  },
  
  // Reduce build time by excluding unnecessary files
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/.next/**',
  ],
  
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/icons/**',
      },
      {
        protocol: 'https',
        hostname: '*.s3.*.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
}

module.exports = nextConfig
