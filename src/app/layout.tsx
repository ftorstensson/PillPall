import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Using Inter as a common sans-serif font
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Geist, Geist_Mono } from 'next/font/google';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'PillPal - Your Medication Companion', // Updated from PillWise
  description: 'PillPal helps you manage medications, track mood, and stay on schedule.', // Updated
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
