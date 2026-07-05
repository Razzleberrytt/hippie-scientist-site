import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces/wght.css'
import { Navigation } from '@/components/Navigation'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NavigationSchema } from '@/components/NavigationSchema'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'
import Footer from '../src/components/Footer'
import MobileBottomNav from '../src/components/mobile-bottom-nav'
import ScrollToTopButton from '../src/components/ScrollToTopButton'
import ClickTracker from '@/components/ClickTracker'
import ConsentBanner from '../src/components/ConsentBanner'
import CitationDrawerLazy from '@/components/education/CitationDrawerLazy'
import GlobalTOC from '@/components/content/GlobalTOC'
import { buildPageMetadata, DEFAULT_DESCRIPTION, SITE_URL, websiteJsonLd, organizationJsonLd } from '../src/lib/seo'
import { DarkModeProvider } from '@/lib/dark-mode-provider'
import DarkModeToggle from '@/components/DarkModeToggle'
import './globals.css'
import '@/styles/foundation-readability.css'
import '@/styles/premium-library-polish.css'
import '@/styles/herb-profile-polish.css'
import '@/styles/compact-hero-typography.css'
import '@/styles/resonant-theme-lighting.css'
import '@/styles/premium-surface-details.css'
import '@/styles/accessibility-wcag-22.css'

const HOME_TITLE = 'The Hippie Scientist | Supplement Research'

// Reusable JSON-LD from central helper (WebSite + Organization for homepage)
const siteWebsiteLd = websiteJsonLd()
const siteOrgLd = organizationJsonLd()

const rootMetadata = buildPageMetadata({
  title: HOME_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  image: '/og-default.jpg',
  openGraphType: 'website',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: HOME_TITLE, template: '%s' },
  description: DEFAULT_DESCRIPTION,
  ...rootMetadata,
  openGraph: rootMetadata.openGraph,
  twitter: rootMetadata.twitter,
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang='en' suppressHydrationWarning>
      {/* Inline script runs before React hydration to prevent dark mode flash */}
      <head>
        <link rel="preconnect" href="https://m.media-amazon.com" />
        <link rel="preconnect" href="https://images-na.ssl-images-amazon.com" />
        <link rel="dns-prefetch" href="https://www.amazon.com" />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme');var p=window.matchMedia('(prefers-color-scheme: dark)').matches;var dark=s==='dark'||((s===null||s==='system')&&p);d.classList.toggle('dark',dark);d.dataset.theme=dark?'dark':'light';d.style.colorScheme=dark?'dark':'light';d.classList.add('theme-ready')}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className='font-sans antialiased'>
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
        <a href='#main-content' className='skip-link'>
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
            data-pagefind-body
            className='pb-[calc(env(safe-area-inset-bottom)+9rem)] md:pb-8'
            tabIndex={-1}
          >
            <GlobalTOC />
            {children}
          </main>
          <Footer />
          <MobileBottomNav />
          <ScrollToTopButton />
          <CitationDrawerLazy />
          <ClickTracker />
          <ConsentBanner />
          {/* Dark mode toggle — fixed fallback plus nav controls, accessible via keyboard */}
          <div className='fixed bottom-[6.5rem] right-4 z-[86] md:hidden'>
            <DarkModeToggle />
          </div>
        </div>
        </DarkModeProvider>
      </body>
    </html>
  )
}
