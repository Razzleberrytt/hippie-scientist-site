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
    const description = generateMetaDescription(guide.intro, guide.title)
    const url = `https://thehippiescientist.net/guides/${guide.slug}`
    return {
      title: `${guide.title} | The Hippie Scientist`,
      description,
      alternates: { canonical: guide.seo.canonical },
      openGraph: {
        title: guide.title,
        description,
        url,
        images: [{
          url: `/images/guides/${guide.slug}.jpg`,
          width: 1200,
          height: 630,
        }],
      },
      twitter: {
        card: 'summary_large_image',
        title: guide.title,
        description,
      },
    }
  }
  return generateSeoEntryMetadata(`guides/${slug}`)
}

function generateMetaDescription(quickAnswer: string, title: string): string {
  const firstSentence = quickAnswer.split('.')[0]
  const truncated = firstSentence ? `${firstSentence}.` : quickAnswer
  const desc = `${title}: ${truncated}`
  return desc.substring(0, 155)
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (guide) {
    return <GuidePage guide={guide} />
  }
  return <SeoEntryPage route={`guides/${slug}`} />
}
