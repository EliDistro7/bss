/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'pub-a6232e7aac324e45bd42ee36e83738a3.r2.dev',
      },
    ],
  },
}

module.exports = nextConfig