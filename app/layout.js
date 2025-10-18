import "bootstrap/dist/css/bootstrap.min.css";
import "./globals.css";
import Script from 'next/script';
import { AuthProvider } from '@/contexts/AuthContext';

export const metadata = {
  title: "VecindApp - Plataforma Vecinal",
  description: "Gestiona certificados de residencia y trámites vecinales de forma digital",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://cdn.jsdelivr.net" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
      </head>
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
        {/* Bootstrap JS */}
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
