/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        port: '',
        pathname: '/api/**',
      },
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/icons/**',
      },
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/blog-images/**',
      },
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/insight-videos/**',
      },
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/knowledge-videos/**',
      },
      {
        protocol: 'https',
        hostname: 'my-cross-stock-icons.s3.ap-south-1.amazonaws.com',
        port: '',
        pathname: '/knowledge-blogs/**',
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
