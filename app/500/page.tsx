import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Server Error | The Hippie Scientist',
  description: 'A static fallback page for temporary server errors on The Hippie Scientist.',
  alternates: { canonical: '/500' },
  robots: { index: false, follow: true },
  openGraph: {
    title: 'Server Error | The Hippie Scientist',
    description: 'A static fallback page for temporary server errors on The Hippie Scientist.',
    url: 'https://thehippiescientist.net/500',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Server Error | The Hippie Scientist',
    description: 'A static fallback page for temporary server errors on The Hippie Scientist.',
  },
}

export default function ServerErrorPage() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl flex-col justify-center px-6 py-16 text-center">
      <p className="eyebrow-label">Temporary error</p>
      <h1 className="heading-premium text-ink">Something went wrong.</h1>
      <p className="detail-reading mt-4 text-[#46574d]">
        The page could not load correctly. Return home and try again from a stable route.
      </p>
      <div className="mt-8">
        <Link className="button-primary inline-flex rounded-full px-5 py-3 text-sm" href="/">
          Back to homepage
        </Link>
      </div>
    </main>
  )
}
