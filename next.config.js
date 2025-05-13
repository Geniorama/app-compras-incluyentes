/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: '**',
      },
    ],
    domains: ['cdn.sanity.io', 'comprasincluyentes.geniorama.co'],
  },
}

module.exports = nextConfig 