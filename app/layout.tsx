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
  metadataBase: new URL('https://cpu-architect-csc3501.fancy-crane-7139.chatgpt.site'),
  title: 'GPU Architect | CSC 3501',
  description: 'Build a GPU layer by matching its components to their functions in this Phaser.js learning game.',
  openGraph: {
    title: 'GPU Architect | CSC 3501',
    description: 'Assemble the processing layer of a GPU in a Phaser.js learning game.',
    images: ['/og.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GPU Architect | CSC 3501',
    description: 'Assemble the processing layer of a GPU in a Phaser.js learning game.',
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
