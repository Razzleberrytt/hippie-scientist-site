import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import { Inter, Fraunces } from 'next/font/google'
import { Navigation } from '@/components/Navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NavigationSchema } from '@/components/NavigationSchema'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import ClickTracker from '@/components/ClickTracker'
import CitationDrawerLazy from '@/components/education/CitationDrawerLazy'
import './globals.css'
import '@/styles/foundation-readability.css'

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-fraunces',
})

const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || ''

const siteName = 'The Hippie Scientist'
const siteDescription =
  'Evidence-informed research on herbs, compounds, mechanisms, safety context, and practical supplement decisions.'

// Canonical production domain. Cloudflare redirects should resolve to this host.
const siteUrl = 'https://www.thehippiescientist.net'

// Enhanced JSON-LD: logo + SearchAction for Google Knowledge Panel and Sitelinks Searchbox
const websiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  image: `${siteUrl}/og-default.png`,
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${siteUrl}/search/?q={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: siteName,
  url: siteUrl,
  description: siteDescription,
  logo: {
    '@type': 'ImageObject',
    url: `${siteUrl}/logo.png`,
    width: 512,
    height: 512,
  },
  sameAs: [
    'https://twitter.com/HippieScientist',
    'https://www.instagram.com/thehippiescientist',
    'https://www.youtube.com/@HippieScientist',
  ],
}

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: siteName, template: `%s | ${siteName}` },
  description: siteDescription,
  openGraph: {
    type: 'website',
    title: siteName,
    description: siteDescription,
    siteName,
    url: siteUrl,
    images: [
      {
        url: '/og-default.png',
        width: 1200,
        height: 630,
        alt: siteName,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: siteName,
    description: siteDescription,
    images: ['/og-default.png'],
  },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' className={`${inter.variable} ${fraunces.variable}`}>
      <body className='font-sans antialiased'>
        {ga4Id && (
          <>
            <Script
              strategy='afterInteractive'
              src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
            />
            <Script strategy='afterInteractive' id='ga4-init'>
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${ga4Id}');
              `}
            </Script>
          </>
        )}
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <NavigationSchema />
        <BreadcrumbSchema />
        <a
          href='#main-content'
          className='sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-ink focus:shadow-lg'
        >
          Skip to main content
        </a>
        <div className='min-h-screen bg-background text-ink'>
          <Navigation />
          <Breadcrumbs />
          {/* This is the ONLY <main> on the page. Page components must NOT wrap their content in a second <main> tag. */}
          <main
            id='main-content'
            className='pb-[calc(env(safe-area-inset-bottom)+4rem)] md:pb-8'
          >
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <CitationDrawerLazy />
          <ClickTracker />
        </div>
      </body>
    </html>
  )
}
