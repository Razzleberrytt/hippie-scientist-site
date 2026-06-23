import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Script from 'next/script'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces/wght.css'
import { Navigation } from '@/components/Navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NavigationSchema } from '@/components/NavigationSchema'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'
import Footer from '../src/components/Footer'
import MobileBottomNav from '../src/components/mobile-bottom-nav'
import ClickTracker from '@/components/ClickTracker'
import CitationDrawerLazy from '@/components/education/CitationDrawerLazy'
import { buildPageMetadata, DEFAULT_TITLE, DEFAULT_DESCRIPTION, SITE_URL, SITE_NAME, websiteJsonLd, organizationJsonLd } from '../src/lib/seo'
import { DarkModeProvider } from '@/lib/dark-mode-provider'
import DarkModeToggle from '@/components/DarkModeToggle'
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
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* Inline script runs before React hydration to prevent dark mode flash */}
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=s==='dark'||((s===null||s==='system')&&p);d.classList.toggle('dark',dark);d.dataset.theme=dark?'dark':'light';d.style.colorScheme=dark?'dark':'light';d.classList.add('theme-ready')}catch(e){}})();`,
          }}
        />
      </head>
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
        <DarkModeProvider>
        <div className='min-h-screen bg-background text-ink transition-colors duration-300'>
          <header>
            <Navigation />
          </header>
          <Breadcrumbs />
          {/* This is the ONLY <main> landmark on the page (per WCAG/landmark rules).
              Page components must use <div>, <section>, <article>, etc. — NEVER another <main>. */}
          <main
            id='main-content'
            className='pb-[calc(env(safe-area-inset-bottom)+7rem)] md:pb-8'
          >
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <CitationDrawerLazy />
          <ClickTracker />
          {/* Dark mode toggle — fixed fallback plus nav controls, accessible via keyboard */}
          <div className='fixed bottom-20 right-4 z-40 md:bottom-6 md:hidden'>
            <DarkModeToggle />
          </div>
        </div>
        </DarkModeProvider>
      </body>
    </html>
  )
}
