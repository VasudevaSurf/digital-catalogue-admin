/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["localhost", "res.cloudinary.com"],
  },
  env: {
    ADMIN_SECRET_KEY: process.env.ADMIN_SECRET_KEY,
  },
};

module.exports = nextConfig;
