import type { Metadata } from 'next'
import CompoundPage from '../[slug]/page'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/src/lib/seo'

const slug = 'trimethylglycine'
const title = 'Trimethylglycine Reference | The Hippie Scientist'
const description = 'Trimethylglycine reference page with evidence context, mechanism overview, safety notes, and practical research framing.'
const url = `${SITE_URL}/compounds/${slug}/`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  robots: { index: false, follow: true },
  openGraph: {
    title,
    description,
    url,
    siteName: SITE_NAME,
    type: 'article',
    images: [{ url: `${SITE_URL}${DEFAULT_OG_IMAGE}`, width: 1200, height: 630, alt: title }],
  },
  twitter: {
    card: 'summary_large_image',
    title,
    description,
    images: [`${SITE_URL}${DEFAULT_OG_IMAGE}`],
  },
}

export default async function TrimethylglycinePage() {
  return CompoundPage({ params: Promise.resolve({ slug }) })
}
