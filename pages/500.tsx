import Link from 'next/link'

export default function Custom500() {
  return (
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
  )
}
