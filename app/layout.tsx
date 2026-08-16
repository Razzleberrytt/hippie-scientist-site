import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import '@fontsource-variable/inter'
import '@fontsource-variable/fraunces/wght.css'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { NavigationSchema } from '@/components/NavigationSchema'
import { BreadcrumbSchema } from '@/components/BreadcrumbSchema'
import Footer from '../src/components/Footer'
import ScrollToTopButton from '../src/components/ScrollToTopButton'
import ClickTracker from '@/components/ClickTracker'
import CommercialIntentBridge from '@/components/CommercialIntentBridge'
import ContextualLeadMagnet from '@/components/ContextualLeadMagnet'
import EmailReturnAttribution from '@/components/EmailReturnAttribution'
import ConsentBanner from '../src/components/ConsentBanner'
import CitationDrawerLazy from '@/components/education/CitationDrawerLazy'
import GlobalTOC from '@/components/content/GlobalTOC'
import LocalizedNavigation from '@/components/localization/LocalizedNavigation'
import SpanishFooter from '@/components/localization/SpanishFooter'
import { EnglishOnly, SpanishOnly } from '@/components/localization/LocaleGate'
import { buildPageMetadata, DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL, websiteJsonLd, organizationJsonLd } from '../src/lib/seo'
import { serializeJsonLd } from '../src/lib/schema-injector'
import { DEFAULT_LOCALE, DEFAULT_OG_LOCALE, LOCALE_TEXT_DIRECTION } from '../src/lib/international-seo'
import { DarkModeProvider } from '@/lib/dark-mode-provider'
import './globals.css'
import '@/styles/foundation-readability.css'
import '@/styles/premium-library-polish.css'
import '@/styles/herb-profile-polish.css'
import '@/styles/profile-navigation-cleanup.css'
import '@/styles/navigation-responsive.css'
import '@/styles/compact-hero-typography.css'
import '@/styles/resonant-theme-lighting.css'
import '@/styles/premium-surface-details.css'
import '@/styles/accessibility-wcag-22.css'
import '@/styles/article-visual-polish.css'
import '@/styles/compact-safety-cautions.css'
import '@/styles/editorial-botanical-refresh.css'
import '@/styles/editorial-content-surfaces.css'
import '@/styles/homepage-editorial-redesign.css'
import '@/styles/homepage-responsive.css'
import '@/styles/premium-foundation.css'
import '@/styles/premium-surfaces.css'
import '@/styles/premium-typography.css'
import '@/styles/homepage-premium-final.css'
import '@/styles/visual-system-consolidation.css'
import '@/styles/visual-token-hardening.css'

const HOME_TITLE = 'The Hippie Scientist | Supplement Research'
const WEBSITE_ID = `${SITE_URL}/#website`
const ORGANIZATION_ID = `${SITE_URL}/#organization`

const siteWebsiteLd = {
  ...websiteJsonLd(),
  '@id': WEBSITE_ID,
  publisher: { '@id': ORGANIZATION_ID },
}
const siteOrgLd = {
  ...organizationJsonLd(),
  '@id': ORGANIZATION_ID,
}

const rootMetadata = buildPageMetadata({
  title: HOME_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: '/',
  image: '/og-default.jpg',
  openGraphType: 'website',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  creator: SITE_NAME,
  publisher: SITE_NAME,
  title: { default: HOME_TITLE, template: '%s' },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
  },
  ...rootMetadata,
  alternates: {
    ...rootMetadata.alternates,
    types: {
      'application/rss+xml': `${SITE_URL}/rss.xml`,
    },
  },
  openGraph: rootMetadata.openGraph
    ? {
        ...rootMetadata.openGraph,
        locale: DEFAULT_OG_LOCALE,
      }
    : rootMetadata.openGraph,
  twitter: rootMetadata.twitter,
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang={DEFAULT_LOCALE} dir={LOCALE_TEXT_DIRECTION} suppressHydrationWarning>
      <head>
        <meta
          name='ahrefs-site-verification'
          content='069cb85d929c4ec13de83c17a0c8605ab293a078d6cbf79673cad4bac683b289'
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var d=document.documentElement;var s=localStorage.getItem('theme');var dark=s==='dark';d.classList.toggle('dark',dark);d.dataset.theme=dark?'dark':'light';d.style.colorScheme=dark?'dark':'light';d.classList.add('theme-ready')}catch(e){}})();`,
          }}
        />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className='font-sans antialiased'>
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteWebsiteLd) }}
        />
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: serializeJsonLd(siteOrgLd) }}
        />
        <EnglishOnly>
          <NavigationSchema />
          <BreadcrumbSchema />
        </EnglishOnly>
        <a href='#main-content' className='skip-link'>
          Skip to main content
        </a>
        <DarkModeProvider>
          <div className='hs-shell min-h-screen bg-background text-ink transition-colors duration-300'>
            <header>
              <LocalizedNavigation />
            </header>
            <EnglishOnly>
              <Breadcrumbs />
              <CommercialIntentBridge />
            </EnglishOnly>
            <main
              id='main-content'
              data-pagefind-body
              className='pb-[calc(env(safe-area-inset-bottom)+2rem)] md:pb-8'
              tabIndex={-1}
            >
              <GlobalTOC />
              {children}
              <EnglishOnly>
                <ContextualLeadMagnet />
              </EnglishOnly>
            </main>
            <EnglishOnly>
              <Footer />
            </EnglishOnly>
            <SpanishOnly>
              <SpanishFooter />
            </SpanishOnly>
            <ScrollToTopButton />
            <EnglishOnly>
              <CitationDrawerLazy />
            </EnglishOnly>
            <ClickTracker />
            <EmailReturnAttribution />
            <ConsentBanner />
          </div>
        </DarkModeProvider>
      </body>
    </html>
  )
}
