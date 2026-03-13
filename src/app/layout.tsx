import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/layout/header';
import Footer from '@/components/layout/footer';
import { CartProvider } from '@/context/cart-context';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react";

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1a3a1a',
};

export const metadata: Metadata = {
  title: {
    default: 'PS Kitchenware – Premium Stainless Steel Kitchenware Online',
    template: '%s | PS Kitchenware',
  },
  description: 'Shop premium stainless steel kitchenware at PS Kitchenware. Browse laddles, serving handi, glasses, grills, oil dispensers and more. Free delivery on bulk orders.',
  keywords: ['kitchenware', 'stainless steel', 'cooking utensils', 'PS Kitchenware', 'buy kitchenware online', 'serving handi', 'tadka pan', 'Indian kitchenware'],
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    siteName: 'PS Kitchenware',
    title: 'PS Kitchenware – Premium Stainless Steel Kitchenware Online',
    description: 'Shop premium stainless steel kitchenware. Laddles, serving handi, glasses, grills, oil dispensers and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'PS Kitchenware – Premium Stainless Steel Kitchenware Online',
    description: 'Shop premium stainless steel kitchenware. Laddles, serving handi, glasses, grills, oil dispensers and more.',
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        {/* Preconnect to Supabase storage for faster LCP image load */}
        <link rel="preconnect" href="https://bojyqtzliosixswsdejd.supabase.co" />
        <link rel="dns-prefetch" href="https://bojyqtzliosixswsdejd.supabase.co" />
      </head>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <CartProvider>
            <div className="flex flex-col min-h-screen">
              <Header />
              <main className="flex-grow">{children}</main>
              <Footer />
            </div>
          <Toaster />
        </CartProvider>
        <SpeedInsights/>
        <Analytics />
      </body>
    </html>
  );
}
