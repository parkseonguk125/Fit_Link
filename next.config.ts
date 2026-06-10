import type { NextConfig } from "next";

const serverActionOrigins = [
  "localhost:8082",
  "127.0.0.1:8082",
  "localhost:3000",
  "127.0.0.1:3000",
];

if (process.env.VERCEL_URL) {
  serverActionOrigins.push(process.env.VERCEL_URL);
}

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    serverActions: {
      allowedOrigins: serverActionOrigins,
    },
  },
  images: {
    remotePatterns: [
      { protocol: "http", hostname: "localhost", port: "9000" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "*.public.blob.vercel-storage.com" },
    ],
  },
};

export default nextConfig;
