// app/herbs/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getHerbBySlug, getHerbs } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

type HerbDetail = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
  mechanisms?: unknown
  safetyNotes?: string | null
}

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

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

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
  const mechanisms = toList(herb.mechanisms)
  const safetyNotes = herb.safetyNotes?.trim() ?? ''
  const hasDetails = Boolean(overviewText || mechanisms.length > 0 || safetyNotes)

  return (
    <div className='space-y-8'>
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

        <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>{label}</h1>

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

          {mechanisms.length > 0 ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Mechanisms
              </p>

              <ul className='mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75 sm:text-base'>
                {mechanisms.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

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
          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              At a glance
            </p>

            <dl className='mt-4 space-y-4 text-sm'>
              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Type</dt>
                <dd className='text-right font-medium text-white'>Herb</dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Slug</dt>
                <dd className='text-right font-medium text-white'>{herb.slug}</dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Mechanisms listed</dt>
                <dd className='text-right font-medium text-white'>
                  {mechanisms.length}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4'>
                <dt className='text-white/55'>Safety section</dt>
                <dd className='text-right font-medium text-white'>
                  {safetyNotes ? 'Included' : 'Not yet'}
                </dd>
              </div>
            </dl>
          </section>

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
    </div>
  )
}

// app/compounds/[slug]/page.tsx
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

type CompoundDetail = {
  slug: string
  displayName?: string | null
  name?: string | null
  summary?: string | null
  description?: string | null
  compoundClass?: string | null
  mechanisms?: unknown
  safetyNotes?: string | null
}

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

const toList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .filter((item): item is string => typeof item === 'string')
      .map(item => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string' && value.trim()) {
    return [value.trim()]
  }

  return []
}

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

  return {
    title: `${label} | Compound`,
    description,
    alternates: { canonical: `/compounds/${compound.slug}` },
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
  const mechanisms = toList(compound.mechanisms)
  const safetyNotes = compound.safetyNotes?.trim() ?? ''
  const hasDetails = Boolean(
    overviewText || compoundClass || mechanisms.length > 0 || safetyNotes,
  )

  return (
    <div className='space-y-8'>
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

        <h1 className='mt-4 text-4xl font-bold tracking-tight sm:text-5xl'>{label}</h1>

        <p className='mt-4 max-w-3xl whitespace-pre-line text-base leading-7 text-white/75 sm:text-lg'>
          {leadText}
        </p>
      </section>

      <div className='grid gap-6 lg:grid-cols-[1.45fr_0.85fr]'>
        <div className='space-y-6'>
          {compoundClass ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Class
              </p>

              <p className='mt-4 text-sm leading-7 text-white/75 sm:text-base'>
                {compoundClass}
              </p>
            </section>
          ) : null}

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

          {mechanisms.length > 0 ? (
            <section className='ds-card'>
              <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
                Mechanisms
              </p>

              <ul className='mt-4 list-disc space-y-3 pl-5 text-sm leading-6 text-white/75 sm:text-base'>
                {mechanisms.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}

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
          <section className='ds-card'>
            <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
              At a glance
            </p>

            <dl className='mt-4 space-y-4 text-sm'>
              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Type</dt>
                <dd className='text-right font-medium text-white'>Compound</dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Class</dt>
                <dd className='text-right font-medium text-white'>
                  {compoundClass || 'Not listed'}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Slug</dt>
                <dd className='text-right font-medium text-white'>
                  {compound.slug}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4 border-b border-white/10 pb-3'>
                <dt className='text-white/55'>Mechanisms listed</dt>
                <dd className='text-right font-medium text-white'>
                  {mechanisms.length}
                </dd>
              </div>

              <div className='flex items-start justify-between gap-4'>
                <dt className='text-white/55'>Safety section</dt>
                <dd className='text-right font-medium text-white'>
                  {safetyNotes ? 'Included' : 'Not yet'}
                </dd>
              </div>
            </dl>
          </section>

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
    </div>
  )
}
