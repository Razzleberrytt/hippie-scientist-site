import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import posts from '@/data/blog/posts.json'
import RelatedLinksSection from '@/components/related-links-section'
import {
  KeyValueSection,
  SectionList,
  SourcesSection,
  normalizeProfileList,
  normalizeProfileText,
  normalizeSources,
} from '@/components/profile-data-sections'
import {
  getCompoundBySlug,
  getCompounds,
  getHerbCompoundMap,
  getHerbs,
} from '@/lib/runtime-data'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

type CompoundDetail = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
  compoundClass?: string | null
  mechanisms?: unknown
  targets?: unknown
  foundIn?: unknown
  safetyNotes?: unknown
  evidenceLevel?: unknown
  evidenceType?: unknown
  confidenceTier?: unknown
  confidenceTier_v2?: unknown
  confidenceReason?: unknown
  sourceCount?: unknown
  review_status?: unknown
  source_status?: unknown
  sources?: unknown
}

type BlogPost = {
  slug: string
  title: string
  excerpt?: string
  date?: string
  readingTime?: string
}

type RelatedLinkItem = {
  href: string
  title: string
  description: string
  eyebrow?: string
}

const allPosts = posts as BlogPost[]

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getCompoundLabel = (compound: Partial<CompoundDetail>): string => {
  const preferred = compound.displayName?.trim() || compound.name?.trim()
  return preferred || formatSlugLabel(compound.slug ?? 'compound')
}

const normalizeText = (value?: string | null): string =>
  value?.replace(/\s+/g, ' ').trim() ?? ''

const getLeadText = (compound: CompoundDetail): string =>
  compound.description?.trim() ||
  compound.summary?.trim() ||
  'A full write-up for this compound is being prepared.'

const getOverviewText = (compound: CompoundDetail): string => {
  const description = compound.description?.trim() ?? ''
  const summary = compound.summary?.trim() ?? ''

  if (!description) return ''
  if (!summary) return description
  if (normalizeText(description) === normalizeText(summary)) return ''

  return description
}

const getPostSortValue = (post: BlogPost): number => {
  if (!post.date) return 0
  const value = new Date(post.date).getTime()
  return Number.isNaN(value) ? 0 : value
}

const tokenize = (...values: Array<string | null | undefined>): string[] =>
  [
    ...new Set(
      values
        .join(' ')
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .map(token => token.trim())
        .filter(token => token.length >= 3),
    ),
  ]

const getRelatedPosts = (compound: CompoundDetail): RelatedLinkItem[] => {
  const tokens = tokenize(
    compound.displayName,
    compound.name,
    compound.compoundClass,
    compound.slug,
  )

  const scored = allPosts
    .map(post => {
      const title = post.title.toLowerCase()
      const excerpt = (post.excerpt ?? '').toLowerCase()
      const slug = post.slug.toLowerCase()

      let score = 0

      for (const token of tokens) {
        if (title.includes(token)) score += 5
        if (excerpt.includes(token)) score += 3
        if (slug.includes(token)) score += 2
      }

      return { post, score }
    })
    .filter(entry => entry.score > 0)
    .sort(
      (a, b) =>
        b.score - a.score || getPostSortValue(b.post) - getPostSortValue(a.post),
    )
    .slice(0, 3)
    .map(({ post }) => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt?.trim() || 'Related blog post.',
      eyebrow: 'Blog post',
    }))

  if (scored.length > 0) return scored

  return [...allPosts]
    .sort((a, b) => getPostSortValue(b) - getPostSortValue(a))
    .slice(0, 3)
    .map(post => ({
      href: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt?.trim() || 'Recent blog post.',
      eyebrow: 'Recent post',
    }))
}


const getRelatedHerbs = async (compound: CompoundDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, herbs] = await Promise.all([getHerbCompoundMap(), getHerbs()])
  const validHerbSlugs = new Set(herbs.map(herb => herb.slug))

  return compoundMap
    .filter(entry => entry.canonicalCompoundId === compound.slug)
    .filter(entry => validHerbSlugs.has(entry.herbSlug))
    .slice(0, 6)
    .map(entry => ({
      href: `/herbs/${entry.herbSlug}`,
      title: entry.herbName?.trim() || formatSlugLabel(entry.herbSlug),
      description: `See how ${entry.herbName?.trim() || formatSlugLabel(entry.herbSlug)} relates to ${getCompoundLabel(compound)}.`,
      eyebrow: 'Related herb',
    }))
}

const getExploreLinks = (): RelatedLinkItem[] => [
  {
    href: '/compounds',
    title: 'Browse all compounds',
    description: 'Go back to the compound library and keep exploring profiles.',
    eyebrow: 'Library',
  },
  {
    href: '/herbs',
    title: 'Browse herbs',
    description: 'See plant profiles, summaries, and quick reference notes.',
    eyebrow: 'Library',
  },
  {
    href: '/blog',
    title: 'Read the blog',
    description: 'Open short explainers, comparisons, and research-minded articles.',
    eyebrow: 'Writing',
  },
]

export async function generateStaticParams() {
  const compounds = (await getCompounds()) as CompoundDetail[]
  return compounds.map(compound => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = (await getCompoundBySlug(slug)) as CompoundDetail | null

  if (!compound) {
    return { title: 'Compound Not Found | The Hippie Scientist' }
  }

  const label = getCompoundLabel(compound)
  const description = getLeadText(compound)
  const canonicalPath = `/compounds/${compound.slug}`

  return {
    title: `${label} | Compound`,
    description,
    alternates: { canonical: canonicalPath },
    openGraph: {
      url: canonicalPath,
    },
  }
}

export default async function CompoundDetailPage({ params }: Params) {
  const { slug } = await params
  const compound = (await getCompoundBySlug(slug)) as CompoundDetail | null

  if (!compound) notFound()

  const label = getCompoundLabel(compound)
  const leadText = getLeadText(compound)
  const overviewText = getOverviewText(compound)
  const compoundClass = compound.compoundClass?.trim() ?? ''
  const mechanisms = normalizeProfileList(compound.mechanisms)
  const targets = normalizeProfileList(compound.targets)
  const foundIn = normalizeProfileList(compound.foundIn)
  const safetyNotes = normalizeProfileText(compound.safetyNotes)
  const evidenceLevel = normalizeProfileText(compound.evidenceLevel)
  const evidenceType = normalizeProfileText(compound.evidenceType)
  const confidenceTier = normalizeProfileText(compound.confidenceTier)
  const confidenceTierV2 = normalizeProfileText(compound.confidenceTier_v2)
  const confidenceReason = normalizeProfileText(compound.confidenceReason)
  const sourceCount = normalizeProfileText(compound.sourceCount)
  const reviewStatus = normalizeProfileText(compound.review_status)
  const sourceStatus = normalizeProfileText(compound.source_status)
  const sources = normalizeSources(compound.sources)

  const hasDetails = Boolean(
    overviewText ||
      compoundClass ||
      mechanisms.length > 0 ||
      targets.length > 0 ||
      foundIn.length > 0 ||
      safetyNotes ||
      evidenceLevel ||
      evidenceType ||
      confidenceTier ||
      confidenceTierV2 ||
      confidenceReason ||
      sourceCount,
  )

  const relatedPosts = getRelatedPosts(compound)
  const relatedHerbs = await getRelatedHerbs(compound)
  const exploreLinks = getExploreLinks()
  const faqJsonLd = commonSupplementFaqJsonLd(`/compounds/${compound.slug}`)

  return (
    <div className='space-y-8'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: getCompoundLabel(compound),
            description: getLeadText(compound),
            url: `https://thehippiescientist.net/compounds/${compound.slug}`,
            publisher: {
              '@type': 'Organization',
              name: 'The Hippie Scientist',
              url: 'https://thehippiescientist.net',
            },
            mainEntityOfPage: `https://thehippiescientist.net/compounds/${compound.slug}`,
          }),
        }}
      />
      {faqJsonLd ? (
        <script
          type='application/ld+json'
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      ) : null}
      <nav className='flex flex-wrap gap-3 text-sm text-white/60'>
        <Link
          href='/compounds'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          ← Back to compounds
        </Link>

        <Link
          href='/herbs'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          Browse herbs
        </Link>
      </nav>

      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <div className='flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
          <span className='inline-flex rounded-full border border-white/15 px-3 py-1 text-white/70'>
            Compound profile
          </span>
          {compoundClass ? <span>{compoundClass}</span> : <span>{compound.slug}</span>}
        </div>

        <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>
          {label}
        </h1>

        <p className='mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-white/75 sm:text-lg'>
          {leadText}
        </p>
      </section>

      <div className='grid gap-6 lg:grid-cols-[1.45fr_0.85fr]'>
        <div className='space-y-6'>
          <KeyValueSection
            title='Classification'
            items={[{ label: 'Class', value: compoundClass }]}
          />

          {overviewText ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Overview
              </p>

              <p className='mt-4 whitespace-pre-line text-sm leading-7 text-white/75 sm:text-base'>
                {overviewText}
              </p>
            </section>
          ) : null}

          <SectionList title='Mechanisms' items={mechanisms} />
          <SectionList title='Targets' items={targets} />
          <SectionList title='Found in' items={foundIn} />

          {safetyNotes ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Safety notes
              </p>

              <p className='mt-4 whitespace-pre-line text-sm leading-7 text-white/75 sm:text-base'>
                {safetyNotes}
              </p>
            </section>
          ) : null}

          <KeyValueSection
            title='Evidence and confidence'
            items={[
              { label: 'Evidence level', value: evidenceLevel },
              { label: 'Evidence type', value: evidenceType },
              { label: 'Confidence tier', value: confidenceTier },
              { label: 'Confidence tier v2', value: confidenceTierV2 },
              { label: 'Confidence reason', value: confidenceReason },
              { label: 'Source count', value: sourceCount },
              { label: 'Review status', value: reviewStatus },
              { label: 'Source status', value: sourceStatus },
            ]}
          />

          <SourcesSection sources={sources} />

          {!hasDetails ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                More details
              </p>

              <p className='mt-4 text-sm leading-7 text-white/75 sm:text-base'>
                This page is live, but the longer write-up for this compound has
                not been added yet.
              </p>
            </section>
          ) : null}
        </div>

        <aside className='space-y-6'>
          <KeyValueSection
            title='At a glance'
            items={[
              { label: 'Type', value: 'Compound' },
              { label: 'Class', value: compoundClass || 'Not listed' },
              { label: 'Slug', value: compound.slug },
              { label: 'Mechanisms listed', value: String(mechanisms.length) },
              {
                label: 'Targets listed',
                value: targets.length ? String(targets.length) : 'Not listed',
              },
              {
                label: 'Found in',
                value: foundIn.length ? String(foundIn.length) : 'Not listed',
              },
              {
                label: 'Safety section',
                value: safetyNotes ? 'Included' : 'Not yet',
              },
            ]}
          />

          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Reminder
            </p>

            <p className='mt-4 text-sm leading-7 text-white/75'>
              This site is for education and research context. It is not personal
              medical advice.
            </p>
          </section>
        </aside>
      </div>

      <RelatedLinksSection
        eyebrow='Related'
        title='Herbs containing this compound'
        items={relatedHerbs}
      />

      <RelatedLinksSection
        eyebrow='Related writing'
        title='Posts worth reading next'
        items={relatedPosts}
      />

      <RelatedLinksSection
        eyebrow='Keep exploring'
        title='More to explore'
        items={exploreLinks}
      />
    </div>
  )
}
