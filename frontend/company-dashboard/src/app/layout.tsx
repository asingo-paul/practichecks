import type { Metadata, Viewport } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';

export const metadata: Metadata = {
  title: 'PractiCheck - Industrial Attachment Platform',
  description: 'Comprehensive multi-tenant SaaS platform for managing university industrial attachment programs',
  keywords: ['university', 'industrial attachment', 'internship', 'management', 'saas', 'education'],
  authors: [{ name: 'PractiCheck Team' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" 
          rel="stylesheet"
        />
      </head>
      <body className="font-sans h-full bg-gray-50 antialiased">
        <AuthProvider>
          <div id="root" className="h-full">
            {children}
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}