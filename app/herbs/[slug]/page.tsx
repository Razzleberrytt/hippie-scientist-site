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
  getClaims,
  getCompounds,
  getHerbBySlug,
  getHerbCompoundMap,
  getHerbs,
} from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
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
  primaryDomain?: unknown
  claimRows?: unknown
  evidence_grade?: unknown
  net_score?: unknown
  primary_effects?: unknown
  mechanism_summary?: unknown
  dosage_range?: unknown
  oral_form?: unknown
  contraindications_interactions?: unknown
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

const getHerbLabel = (herb: Partial<HerbDetail>): string => {
  const preferred = herb.displayName?.trim() || herb.name?.trim()
  return preferred || formatSlugLabel(herb.slug ?? 'herb')
}

const normalizeText = (value?: string | null): string =>
  value?.replace(/\s+/g, ' ').trim() ?? ''

const VAGUE_BEST_FOR_TERMS = new Set([
  'general wellness',
  'wellness',
  'overall health',
  'balance',
  'support',
])

const toBestForLine = (value: string): string => {
  const cleaned = normalizeText(value).replace(/\.$/, '')
  if (!cleaned) return ''
  const prefixed = cleaned.toLowerCase().startsWith('best for ')
    ? cleaned
    : `Best for ${cleaned.charAt(0).toLowerCase()}${cleaned.slice(1)}`
  return prefixed
}

const getBestForItems = (
  herb: HerbDetail,
  existingText: string[],
): string[] => {
  const existing = existingText.map(text => normalizeText(text).toLowerCase()).filter(Boolean)
  const primaryDomain = normalizeProfileText(herb.primaryDomain)
  const claimRows = normalizeProfileList(herb.claimRows)
  const candidates = [primaryDomain, ...claimRows]

  const results: string[] = []
  const seen = new Set<string>()
  for (const candidate of candidates) {
    const line = toBestForLine(candidate)
    const compact = normalizeText(line).toLowerCase()
    if (!compact) continue
    if ([...VAGUE_BEST_FOR_TERMS].some(term => compact.endsWith(term))) continue
    if (existing.some(text => text.includes(compact) || compact.includes(text))) continue
    if (seen.has(compact)) continue
    seen.add(compact)
    results.push(line)
    if (results.length === 3) break
  }
  return results
}

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
    .filter(entry => (entry.herbSlug || entry.herb_slug) === herb.slug)
    .map(entry => ({
      slug: entry.canonicalCompoundId || entry.compound_slug || '',
      name: entry.canonicalCompoundName || '',
    }))
    .filter(entry => validCompoundSlugs.has(entry.slug))
    .slice(0, 6)
    .map(entry => ({
      href: `/compounds/${entry.slug}`,
      title: entry.name.trim() || formatSlugLabel(entry.slug),
      description: `Explore ${entry.name.trim() || formatSlugLabel(entry.slug)} and its role in ${getHerbLabel(herb)}.`,
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
  const affiliateLinks = getHerbSearchLinks(label)
  const leadText = getLeadText(herb)
  const overviewText = getOverviewText(herb)
  const overviewItems = [
    { label: 'Name', value: normalizeProfileText(herb.name) || label },
    { label: 'Evidence grade', value: normalizeProfileText(herb.evidence_grade) },
    { label: 'Net score', value: normalizeProfileText(herb.net_score) },
    { label: 'Primary effects', value: normalizeProfileList(herb.primary_effects).join(', ') },
  ].filter(item => item.value)
  const mechanismSummary = normalizeProfileText(herb.mechanism_summary)
  const dosageItems = [
    { label: 'Dosage range', value: normalizeProfileText(herb.dosage_range) },
    { label: 'Oral form', value: normalizeProfileText(herb.oral_form) },
  ].filter(item => item.value)
  const safetyItems = [
    { label: 'Safety notes', value: normalizeProfileText(herb.safetyNotes) },
    {
      label: 'Contraindications & interactions',
      value: normalizeProfileList(herb.contraindications_interactions).join(', '),
    },
  ].filter(item => item.value)
  const claims = (await getClaims())
    .filter(item => (item.target_slug || item.targetSlug) === herb.slug)
    .map(item => normalizeProfileText(item.claim || item.text || item.title))
    .filter(Boolean)

  const relatedPosts = getRelatedPosts(herb)
  const relatedCompounds = await getRelatedCompounds(herb)
  const exploreLinks = getExploreLinks()
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
          {overviewItems.length > 0 ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Overview
              </p>
              <dl className='mt-4 space-y-3 text-sm text-white/75'>
                {overviewItems.map(item => (
                  <div key={item.label}>
                    <dt className='text-xs uppercase tracking-[0.2em] text-white/45'>{item.label}</dt>
                    <dd className='mt-1 whitespace-pre-line'>{item.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {mechanismSummary ? <SectionList title='Mechanism' items={[mechanismSummary]} /> : null}

          <KeyValueSection title='Dosage' items={dosageItems} />
          <KeyValueSection title='Safety' items={safetyItems} />
          <SectionList title='Evidence' items={claims} />
        </div>

        <aside className='space-y-6'>
          <KeyValueSection
            title='At a glance'
            items={[
              { label: 'Type', value: 'Herb' },
              { label: 'Slug', value: herb.slug },
              { label: 'Evidence claims', value: claims.length ? String(claims.length) : '' },
              { label: 'Linked compounds', value: relatedCompounds.length ? String(relatedCompounds.length) : '' },
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

          {affiliateLinks.length > 0 ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Shop forms
              </p>

              <p className='mt-2 text-xs leading-5 text-white/50'>
                As an Amazon Associate I earn from qualifying purchases.
              </p>

              <div className='mt-4 flex flex-wrap gap-2'>
                {affiliateLinks.map(link => (
                  <a
                    key={link.label}
                    href={link.url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='rounded-full border border-white/10 px-3 py-1 text-sm text-white/75 transition hover:border-white/25 hover:bg-white/5 hover:text-white'
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </section>
          ) : null}
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
