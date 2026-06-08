import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource-variable/fraunces/wght.css'
import { Navigation } from '@/components/Navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NavigationSchema } from '@/components/NavigationSchema'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'
import Footer from '@/components/Footer'
import MobileBottomNav from '@/components/mobile-bottom-nav'
import ClickTracker from '@/components/ClickTracker'
import CitationDrawerLazy from '@/components/education/CitationDrawerLazy'
import { buildPageMetadata, DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_URL, SITE_NAME, websiteJsonLd, organizationJsonLd } from '@/lib/seo'
import './globals.css'
import '@/styles/foundation-readability.css'

const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || ''

// Reusable JSON-LD from central helper (WebSite + Organization for homepage)
const siteWebsiteLd = websiteJsonLd()
const siteOrgLd = organizationJsonLd()

const rootMetadata = buildPageMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  image: '/og-default.jpg',
  openGraphType: 'website',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: DEFAULT_TITLE, template: `%s | ${SITE_NAME}` },
  description: DEFAULT_DESCRIPTION,
  ...rootMetadata,
  // ensure template wins for children
  openGraph: rootMetadata.openGraph,
  twitter: rootMetadata.twitter,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en'>
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
        {/* Pagefind Component UI JavaScript - loads after interactive */}
        <Script
          src='/pagefind/pagefind-ui.js'
          strategy='afterInteractive'
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteWebsiteLd) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(siteOrgLd) }}
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
          <header>
            <Navigation />
          </header>
          <Breadcrumbs />
          {/* This is the ONLY <main> landmark on the page (per WCAG/landmark rules).
              Page components must use <div>, <section>, <article>, etc. — NEVER another <main>. */}
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
