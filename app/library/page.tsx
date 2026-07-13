import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Evidence Library — Supplements, Science & Mental Health',
  description:
    'One evidence library for guides, articles, and explainers covering ADHD, sleep, anxiety, focus, mental health, herbs, supplements, and research literacy.',
  alternates: { canonical: `${SITE_URL}/library/` },
  openGraph: {
    title: 'Evidence Library — The Hippie Scientist',
    description:
      'Browse citation-rich guides, mental health explainers, supplement comparisons, and science foundations in one organized library.',
    url: `${SITE_URL}/library/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

export { default } from '../guides/page'
