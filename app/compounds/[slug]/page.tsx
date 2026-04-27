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

              <p
