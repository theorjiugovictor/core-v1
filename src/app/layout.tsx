import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit' });

export const metadata: Metadata = {
  title: 'CORE | Intelligent Business Control',
  description: 'Your business, under control. The zero-friction management platform for Nigerian SMEs.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn(
        "min-h-screen bg-background font-sans antialiased",
        inter.variable,
        outfit.variable
      )}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
