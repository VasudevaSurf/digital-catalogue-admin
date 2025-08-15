/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "your-domain.com"],
  },
  env: {
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
  },
};

module.exports = nextConfig;
