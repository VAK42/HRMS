/** @type {import('next').NextConfig} */
const nextConfig: import('next').NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:3001/api/:path*'
      }
    ];
  }
};
export default nextConfig;