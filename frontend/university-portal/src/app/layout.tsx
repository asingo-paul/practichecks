import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PractiCheck - University Portal',
  description: 'University industrial attachment management portal',
  keywords: ['university', 'industrial attachment', 'internship', 'student portal'],
  authors: [{ name: 'PractiCheck Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#1e40af',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full bg-gray-50 antialiased`}>
        <div id="root" className="h-full">
          {children}
        </div>
      </body>
    </html>
  );
}