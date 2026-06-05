const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const apiImageHost = new URL(apiUrl).hostname;
const apiImagePort = new URL(apiUrl).port;
const apiImageProtocol = new URL(apiUrl).protocol.replace(':', '');

const uploadPatterns = [
  {
    protocol: 'http',
    hostname: 'localhost',
    port: '5000',
    pathname: '/uploads/**',
  },
  {
    protocol: 'http',
    hostname: '127.0.0.1',
    port: '5000',
    pathname: '/uploads/**',
  },
  {
    protocol: apiImageProtocol,
    hostname: apiImageHost,
    port: apiImagePort,
    pathname: '/uploads/**',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: uploadPatterns,
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development', 
  },
};

console.log("Next Config Loaded");
export default nextConfig;