import './globals.css';
import type { Metadata } from 'next';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Life Legacy',
  description: 'Drošs digitālais seifs atmiņām un vēstījumiem',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="lv">
      <body className="min-h-dvh bg-white text-gray-900 antialiased">
        <Header />
        <main className="py-8">{children}</main>
      </body>
    </html>
  );
}
