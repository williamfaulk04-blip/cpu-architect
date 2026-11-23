import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './guided.css';
import './interior.css';
import './explorer.css';
import './gpu.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'GPU Architect | CSC 3501',
  description: 'Build a GPU layer by layer while learning about processing hardware, memory, graphics card components, and cooling systems.',
  openGraph: {
    title: 'GPU Architect | CSC 3501',
    description: 'Explore GPU architecture through interactive component assembly and educational gameplay.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Architect | CSC 3501',
    description: 'Learn GPU architecture by assembling processing, memory, board, and cooling components.',
    images: ['/og.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
