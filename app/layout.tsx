import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import './guided.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://cpu-architect-csc3501.fancy-crane-7139.chatgpt.site'),
  title: 'CPU Architect | CSC 3501',
  description: 'Build a processor by placing its core components in this Phaser.js learning game.',
  openGraph: {
    title: 'CPU Architect | CSC 3501',
    description: 'Build, connect, and execute in a Phaser.js processor assembly game.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CPU Architect | CSC 3501',
    description: 'Build, connect, and execute in a Phaser.js processor assembly game.',
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
