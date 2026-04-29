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
  getHerbBySlug,
  getHerbCompoundMap,
  getHerbs,
} from '@/lib/runtime-data'
import { commonSupplementFaqJsonLd } from '@/lib/seo'

type Params = { params: Promise<{ slug: string }> }

type HerbDetail = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
  mechanisms?: unknown
  safetyNotes?: unknown
  contraindications?: unknown
  interactions?: unknown
  dosage?: unknown
  preparation?: unknown
  evidenceLevel?: unknown
  confidenceTier?: unknown
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


type ProductSlot = {
  name: string
  format: string
  note: string
}

const PLACEHOLDER_FORMS = [
  'Capsules',
  'Tincture',
  'Tea cut',
  'Powder',
] as const

const getProductSlots = (label: string): ProductSlot[] =>
  PLACEHOLDER_FORMS.map((format, index) => ({
    name: `${label} ${format}`,
    format,
    note: `Placeholder example product ${index + 1}. Affiliate placement coming later.`,
  }))

const allPosts = posts as BlogPost[]

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getHerbLabel = (herb: Partial<HerbDetail>): string => {
  const preferred = herb.displayName?.trim() || herb.name?.trim()
  return preferred || formatSlugLabel(herb.slug ?? 'herb')
}

const normalizeText = (value?: string | null): string =>
  value?.replace(/\s+/g, ' ').trim() ?? ''

const getLeadText = (herb: HerbDetail): string =>
  herb.description?.trim() ||
  herb.summary?.trim() ||
  'A full write-up for this herb is being prepared.'

const getOverviewText = (herb: HerbDetail): string => {
  const description = herb.description?.trim() ?? ''
  const summary = herb.summary?.trim() ?? ''

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

const getRelatedPosts = (herb: HerbDetail): RelatedLinkItem[] => {
  const tokens = tokenize(herb.displayName, herb.name, herb.slug)

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


const getRelatedCompounds = async (herb: HerbDetail): Promise<RelatedLinkItem[]> => {
  const [compoundMap, compounds] = await Promise.all([
    getHerbCompoundMap(),
    getCompounds(),
  ])
  const validCompoundSlugs = new Set(compounds.map(compound => compound.slug))

  return compoundMap
    .filter(entry => entry.herbSlug === herb.slug)
    .filter(entry => validCompoundSlugs.has(entry.canonicalCompoundId))
    .slice(0, 6)
    .map(entry => ({
      href: `/compounds/${entry.canonicalCompoundId}`,
      title: entry.canonicalCompoundName?.trim() || formatSlugLabel(entry.canonicalCompoundId),
      description: `Explore ${entry.canonicalCompoundName?.trim() || formatSlugLabel(entry.canonicalCompoundId)} and its role in ${getHerbLabel(herb)}.`,
      eyebrow: 'Related compound',
    }))
}

const getExploreLinks = (): RelatedLinkItem[] => [
  {
    href: '/herbs',
    title: 'Browse all herbs',
    description: 'Go back to the herb library and keep exploring plant profiles.',
    eyebrow: 'Library',
  },
  {
    href: '/compounds',
    title: 'Browse compounds',
    description: 'See active constituents, classes, and quick research notes.',
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
  const herbs = (await getHerbs()) as HerbDetail[]
  return herbs.map(herb => ({ slug: herb.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const herb = (await getHerbBySlug(slug)) as HerbDetail | null

  if (!herb) {
    return { title: 'Herb Not Found | The Hippie Scientist' }
  }

  const label = getHerbLabel(herb)
  const description = getLeadText(herb)

  return {
    title: `${label} | Herb`,
    description,
    alternates: { canonical: `/herbs/${herb.slug}` },
  }
}

export default async function HerbDetailPage({ params }: Params) {
  const { slug } = await params
  const herb = (await getHerbBySlug(slug)) as HerbDetail | null

  if (!herb) notFound()

  const label = getHerbLabel(herb)
  const leadText = getLeadText(herb)
  const overviewText = getOverviewText(herb)
  const mechanisms = normalizeProfileList(herb.mechanisms)
  const safetyNotes = normalizeProfileText(herb.safetyNotes)
  const contraindications = normalizeProfileList(herb.contraindications)
  const interactions = normalizeProfileList(herb.interactions)
  const dosage = normalizeProfileText(herb.dosage)
  const preparation = normalizeProfileText(herb.preparation)
  const evidenceLevel = normalizeProfileText(herb.evidenceLevel)
  const confidenceTier = normalizeProfileText(herb.confidenceTier)
  const sourceCount = normalizeProfileText(herb.sourceCount)
  const reviewStatus = normalizeProfileText(herb.review_status)
  const sourceStatus = normalizeProfileText(herb.source_status)
  const sources = normalizeSources(herb.sources)

  const hasDetails = Boolean(
    overviewText ||
      mechanisms.length > 0 ||
      safetyNotes ||
      contraindications.length > 0 ||
      interactions.length > 0 ||
      dosage ||
      preparation ||
      evidenceLevel ||
      confidenceTier ||
      sourceCount,
  )

  const relatedPosts = getRelatedPosts(herb)
  const relatedCompounds = await getRelatedCompounds(herb)
  const exploreLinks = getExploreLinks()
  const availableForms = [...PLACEHOLDER_FORMS]
  const exampleProducts = getProductSlots(label)
  const faqJsonLd = commonSupplementFaqJsonLd(`/herbs/${herb.slug}`)

  return (
    <div className='space-y-8'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: getHerbLabel(herb),
            description: getLeadText(herb),
            url: `https://thehippiescientist.net/herbs/${herb.slug}`,
            publisher: {
              '@type': 'Organization',
              name: 'The Hippie Scientist',
              url: 'https://thehippiescientist.net',
            },
            mainEntityOfPage: `https://thehippiescientist.net/herbs/${herb.slug}`,
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
          href='/herbs'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          ← Back to herbs
        </Link>

        <Link
          href='/compounds'
          className='rounded-full border border-white/10 px-4 py-2 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
        >
          Browse compounds
        </Link>
      </nav>

      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <div className='flex flex-wrap items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-white/50'>
          <span className='inline-flex rounded-full border border-white/15 px-3 py-1 text-white/70'>
            Herb profile
          </span>
          <span>{herb.slug}</span>
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

          <SectionList title='Contraindications' items={contraindications} />
          <SectionList title='Interactions' items={interactions} />

          <KeyValueSection
            title='Use and preparation'
            items={[
              { label: 'Dosage', value: dosage },
              { label: 'Preparation', value: preparation },
            ]}
          />

          <KeyValueSection
            title='Evidence and confidence'
            items={[
              { label: 'Evidence level', value: evidenceLevel },
              { label: 'Confidence tier', value: confidenceTier },
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
                This page is live, but the longer write-up for this herb has not
                been added yet.
              </p>
            </section>
          ) : null}
        </div>

        <aside className='space-y-6'>
          <KeyValueSection
            title='At a glance'
            items={[
              { label: 'Type', value: 'Herb' },
              { label: 'Slug', value: herb.slug },
              { label: 'Mechanisms listed', value: String(mechanisms.length) },
              {
                label: 'Contraindications',
                value: contraindications.length
                  ? String(contraindications.length)
                  : 'Not listed',
              },
              {
                label: 'Interactions',
                value: interactions.length
                  ? String(interactions.length)
                  : 'Not listed',
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

          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Available forms
            </p>

            <ul className='mt-4 space-y-2 text-sm text-white/80'>
              {availableForms.map(form => (
                <li
                  key={form}
                  className='rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2'
                >
                  {form}
                </li>
              ))}
            </ul>
          </section>

          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              Example products
            </p>

            <p className='mt-3 text-xs text-white/55'>
              Placeholder products only. No affiliate links are active yet.
            </p>

            <ul className='mt-4 space-y-3'>
              {exampleProducts.map(product => (
                <li
                  key={product.name}
                  className='rounded-xl border border-white/10 bg-white/[0.02] p-3'
                >
                  <p className='text-sm font-medium text-white/90'>{product.name}</p>
                  <p className='mt-1 text-xs uppercase tracking-[0.16em] text-white/50'>
                    {product.format}
                  </p>
                  <p className='mt-2 text-xs leading-6 text-white/70'>{product.note}</p>
                </li>
              ))}
            </ul>
          </section>
        </aside>
      </div>

      <RelatedLinksSection
        eyebrow='Related'
        title='Compounds linked to this herb'
        items={relatedCompounds}
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
