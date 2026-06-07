import type { Metadata } from 'next'
import { SeoEntryPage, generateSeoEntryMetadata, seoEntryPages } from '../../seo-entry-pages'
import { getGuideBySlug, getAllGuideSlugs } from '@/lib/guides'
import GuidePage from '@/components/guides/GuidePage'

type Params = Promise<{ slug: string }>

export async function generateStaticParams() {
  const seoSlugs = seoEntryPages
    .filter((page) => page.route.startsWith('guides/'))
    .map((page) => ({ slug: page.route.replace('guides/', '') }))

  const jsonSlugs = getAllGuideSlugs().map((slug) => ({ slug }))

  const seen = new Set(seoSlugs.map((p) => p.slug))
  const merged = [...seoSlugs]
  for (const p of jsonSlugs) {
    if (!seen.has(p.slug)) merged.push(p)
  }
  return merged
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (guide) {
    return {
      title: guide.seo.title,
      description: guide.seo.description,
      alternates: { canonical: guide.seo.canonical },
      openGraph: {
        title: guide.seo.title,
        description: guide.seo.description,
        url: guide.seo.canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title: guide.seo.title,
        description: guide.seo.description,
      },
    }
  }
  return generateSeoEntryMetadata(`guides/${slug}`)
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (guide) {
    return <GuidePage guide={guide} />
  }
  return <SeoEntryPage route={`guides/${slug}`} />
}
