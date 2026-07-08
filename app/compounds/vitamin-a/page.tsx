import type { Metadata } from 'next'
import CompoundPage from '../[slug]/page'
import { DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/src/lib/seo'

const slug = ['vitamin', 'a'].join('-')
const title = 'Profile Reference | The Hippie Scientist'
const description = 'Reference profile with overview and details.'
const url = `${SITE_URL}/compounds/${slug}/`

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: url },
  robots: { index: true, follow: true },
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

export default async function ProfilePage() {
  return CompoundPage({ params: Promise.resolve({ slug }) })
}
