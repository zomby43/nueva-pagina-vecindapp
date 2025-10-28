/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimizaciones de rendimiento
  swcMinify: true,

  // Deshabilitar optimización de CSS en desarrollo para evitar pérdida de estilos
  experimental: {
    optimizeCss: false,
  },

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
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ]
      },
    ];
  },

  // Optimización de compilación
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
};

module.exports = nextConfig;
