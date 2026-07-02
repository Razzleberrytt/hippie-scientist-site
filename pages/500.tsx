import Head from 'next/head'
import Link from 'next/link'

const pageUrl = 'https://thehippiescientist.net/500/'

export default function Custom500() {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Server Error | The Hippie Scientist',
    description: 'Temporary server error page for The Hippie Scientist.',
    url: pageUrl,
    isPartOf: {
      '@type': 'WebSite',
      name: 'The Hippie Scientist',
      url: 'https://thehippiescientist.net/',
    },
  }

  return (
    <>
      <Head>
        <title>Server Error | The Hippie Scientist</title>
        <meta name="description" content="Temporary server error page for The Hippie Scientist." />
        <meta name="robots" content="noindex, follow" />
        <link rel="canonical" href={pageUrl} />
        <meta property="og:title" content="Server Error | The Hippie Scientist" />
        <meta property="og:description" content="Temporary server error page for The Hippie Scientist." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={pageUrl} />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Server Error | The Hippie Scientist" />
        <meta name="twitter:description" content="Temporary server error page for The Hippie Scientist." />
      </Head>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <main style={{ margin: '0 auto', maxWidth: 720, padding: '4rem 1.5rem', fontFamily: 'system-ui, sans-serif' }}>
        <p style={{ color: '#66736b', fontSize: 14, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
          The Hippie Scientist
        </p>
        <h1 style={{ color: '#17211b', fontSize: 40, lineHeight: 1.1, margin: '1rem 0' }}>
          Something went wrong
        </h1>
        <p style={{ color: '#46574d', fontSize: 16, lineHeight: 1.6 }}>
          Try refreshing the page, or return to the homepage and keep browsing from there.
        </p>
        <p style={{ marginTop: 28 }}>
          <Link
            href="/"
            style={{
              background: '#358f52',
              borderRadius: 999,
              color: '#ffffff',
              display: 'inline-block',
              fontSize: 14,
              fontWeight: 700,
              padding: '0.8rem 1.1rem',
              textDecoration: 'none',
            }}
          >
            Return home
          </Link>
        </p>
      </main>
    </>
  )
}
