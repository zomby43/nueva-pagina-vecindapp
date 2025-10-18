/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  swcMinify: true,

  // Configuración de imágenes
  images: {
    domains: ['localhost'],
    formats: ['image/avif', 'image/webp'],
  },

  // Headers de seguridad y cache para mejorar el rendimiento
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ]
      },
    ];
  },
};

module.exports = nextConfig;
