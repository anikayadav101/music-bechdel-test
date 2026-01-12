/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  basePath: process.env.NODE_ENV === 'production' ? '/music-bechdel-test' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/music-bechdel-test' : '',
}

module.exports = nextConfig


