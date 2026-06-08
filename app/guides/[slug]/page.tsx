import type { Metadata } from 'next'
import { SeoEntryPage, generateSeoEntryMetadata, seoEntryPages } from '../../seo-entry-pages'
import { getGuideBySlug, getAllGuideSlugs } from '@/lib/guides'
import type { GuideData } from '@/lib/schemas/guide-schemas'
import { buildSeoEntrySchemaGraph } from '@/lib/schema-graph'
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

function buildGuideFaqs(guide: GuideData): Array<{ question: string; answer: string }> {
  const questions = [
    {
      question: `What is ${guide.title}?`,
      answer: guide.intro,
    },
  ]

  if (guide.evidenceHighlights.length > 0) {
    questions.push({
      question: `What is the evidence for ${guide.title}?`,
      answer: guide.evidenceHighlights
        .map(item => `${item.claim}${item.context ? ` (${item.context})` : ''}.`)
        .join(' '),
    })
  }

  if (guide.safetyNotes?.length) {
    questions.push({
      question: `What safety notes matter for ${guide.title}?`,
      answer: guide.safetyNotes.map(note => note.text).join(' '),
    })
  }

  return questions
}

export default async function Page({ params }: { params: Params }) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (guide) {
    const schemaGraph = buildSeoEntrySchemaGraph({
      route: `/guides/${guide.slug}`,
      title: guide.seo.title || guide.title,
      description: guide.seo.description || generateMetaDescription(guide.intro, guide.title),
      h1: guide.title,
      faqs: buildGuideFaqs(guide),
    })

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaGraph) }}
        />
        <GuidePage guide={guide} />
      </>
    )
  }
  return <SeoEntryPage route={`guides/${slug}`} />
}
