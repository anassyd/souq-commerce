/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "cdn.dummyjson.com" },
      { protocol: "https", hostname: "dummyjson.com" },
      { protocol: "https", hostname: "i.imgur.com" },
    ],
  },
  // Proxy the Platzi API through our own origin so the browser never hits CORS issues.
  async rewrites() {
    return [{ source: "/api/platzi/:path*", destination: "https://api.escuelajs.co/api/v1/:path*" }];
  },
};
export default nextConfig;
