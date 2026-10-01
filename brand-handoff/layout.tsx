import type { Metadata } from 'next';
import { Archivo, IBM_Plex_Sans, IBM_Plex_Mono } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const archivo = Archivo({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-archivo',
});

const plexSans = IBM_Plex_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-plex-sans',
});

const plexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-plex-mono',
});

export const metadata: Metadata = {
  title: 'CORE | You sell. We handle the rest.',
  description:
    'Infrastructure for the smallest businesses on earth. Speak a sale, and CORE handles the accounting, the inventory and the maths.',
  icons: { icon: '/logo.svg' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          archivo.variable,
          plexSans.variable,
          plexMono.variable
        )}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
