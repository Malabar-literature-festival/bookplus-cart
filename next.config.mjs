/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push({
        "puppeteer-core": "puppeteer-core",
        "@sparticuz/chromium": "@sparticuz/chromium",
      });
    }
    return config;
  },
  experimental: {
    serverActions: true,
  },
};

export default nextConfig;
