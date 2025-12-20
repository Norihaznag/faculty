import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from './providers';
import Script from 'next/script';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://eduhub.com';

export const metadata: Metadata = {
  title: 'EduHub | University Resource Platform',
  description: 'Your comprehensive university resource platform. Access tutorials, study materials, and educational content across all subjects.',
  metadataBase: new URL(siteUrl),
  authors: [{ name: 'EduHub' }],
  creator: 'EduHub',
  publisher: 'EduHub',
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
  icons: [
    {
      rel: 'apple-touch-icon',
      sizes: '180x180',
      url: '/apple-touch-icon.png',
    },
    {
      rel: 'icon',
      sizes: '32x32',
      url: '/favicon-32x32.png',
    },
    {
      rel: 'icon',
      sizes: '16x16',
      url: '/favicon-16x16.png',
    },
  ],
  manifest: '/manifest.json',
  keywords: ['education', 'university', 'resources', 'learning', 'tutorials', 'study materials'],
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'EduHub',
    title: 'EduHub | University Resource Platform',
    description: 'Your comprehensive university resource platform. Access tutorials, study materials, and educational content across all subjects.',
    images: [
      {
        url: `${siteUrl}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'EduHub',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EduHub | University Resource Platform',
    description: 'Your comprehensive university resource platform. Access tutorials, study materials, and educational content across all subjects.',
    images: [`${siteUrl}/og-image.png`],
    creator: '@eduhub',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: siteUrl,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
        
        {/* JSON-LD Structured Data */}
        <Script
          id="jsonld-organization"
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              name: 'EduHub',
              description: 'University resource platform',
              url: siteUrl,
              sameAs: [
                'https://twitter.com/eduhub',
              ],
            }),
          }}
        />
        
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} bg-white`}>
        <Providers>{children}</Providers>
        
        {/* Service Worker Registration */}
        <Script
          id="sw-register"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', () => {
                  navigator.serviceWorker.register('/sw.js').catch(err => {
                    console.error('Service Worker registration failed:', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}

