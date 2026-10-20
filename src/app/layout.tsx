import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
});

export const viewport: Viewport = {
  themeColor: '#090A0F',
};

export const metadata: Metadata = {
  title: 'Crowdprint — Cultural Intelligence for Live Event Sponsorship',
  description:
    "Autonomous sponsorship strategist agent querying Qloo's 250M+ entity Taste AI Graph, deterministic commercial rules, and grounded brand activations.",
  keywords: [
    'Qloo',
    'Taste AI Graph',
    'Festival Sponsorship',
    'Brand Activations',
    'Live Events',
    'Cultural Intelligence',
  ],
  authors: [{ name: 'Crowdprint Team' }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark scroll-smooth", geistSans.variable, geistMono.variable)}>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans bg-[#090A0F] text-[#F3F4F6] antialiased selection:bg-[#10B981]/20 selection:text-[#10B981]`}
      >
        {children}
      </body>
    </html>
  );
}
