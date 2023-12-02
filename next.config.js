/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  images: {
    domains: [
      'ik.imagekit.io',
      'lh3.googleusercontent.com',
      'nftstorage.link',
      'ts-production.imgix.net',
    ],
  },
  webpack: (config) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      net: false,
      os: false,
      tls: false,
      fs: false,
    }
    return config
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/claim',
        permanent: true,
      },
    ]
  },
}

module.exports = nextConfig
