/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [
      {
        source: "/editorial-policy",
        destination: "/about",
        permanent: true,
      },
      {
        source: "/tools",
        destination: "/",
        permanent: true,
      },
      {
        source: "/tools/:slug*",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
