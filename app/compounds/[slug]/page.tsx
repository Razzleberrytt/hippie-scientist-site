import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundDetailPayload, getCtaGatePayload, getCompounds, getSeoPagePayload } from '@/lib/runtime-data'
import ConversionAffiliateCard from '@/components/conversion-affiliate-card'

const siteUrl = 'https://thehippiescientist.net'

type Params = { params: Promise<{ slug: string }> }

type AnyRecord = Record<string, any>

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const asList = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(clean).filter(Boolean)
  return clean(value).split(/\n|;|\|/).map(item => item.trim()).filter(Boolean)
}

const isYes = (value: unknown) => ['yes', 'true', '1', 'y'].includes(clean(value).toLowerCase())

const first = (...values: unknown[]): string => {
  for (const value of values) {
    const normalized = clean(value)
    if (normalized) return normalized
  }
  return ''
}

const titleCase = (value: string) =>
  clean(value).split(/[-_\s]+/).filter(Boolean).map(part => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const labelize = (key: string) =>
  titleCase(key.replace(/^payload_/, '').replace(/^compound_/, '').replace(/_/g, ' '))

const isUseful = (value: unknown) => {
  const text = clean(value)
  if (!text) return false
  return !/^(n\/?a|unknown|tbd|null|undefined|none)$/i.test(text)
}

const CORE_KEYS = new Set([
  'slug', 'headline', 'title', 'name', 'seo_title', 'seo_description', 'meta_title', 'meta_description',
  'decision_summary', 'recommendation', 'one_liner', 'summary', 'description', 'evidence_summary', 'evidence',
  'safety_summary', 'safety_notes', 'avoid_if', 'contraindications', 'caution_signals', 'dose_summary', 'dosage',
  'dosage_range', 'time_to_effect', 'timeToEffect', 'onset', 'duration', 'best_for', 'primary_use_case',
  'primary_effects', 'effects', 'mechanisms', 'mechanism', 'evidence_score', 'evidenceScore', 'evidence_tier',
  'evidenceTier', 'evidence_badge', 'confidence', 'confidence_label', 'sources', 'herbs',
])

function mergeCompoundData(detail: AnyRecord | undefined, compound: AnyRecord | undefined, slug: string) {
  const merged = { ...(compound ?? {}), ...(detail ?? {}) }
  return {
    raw: merged,
    slug,
    headline: first(merged.headline, merged.title, merged.name, titleCase(slug)),
    summary: first(merged.decision_summary, merged.recommendation, merged.one_liner, merged.summary, merged.description, merged.mechanism),
    evidenceSummary: first(merged.evidence_summary, merged.evidence, merged.evidence_notes),
    contextSummary: first(merged.safety_summary, merged.safety_notes, merged.context, merged.safety),
    useRange: first(merged.dose_summary, merged.dosage, merged.dosage_range),
    timeToEffect: first(merged.time_to_effect, merged.timeToEffect, merged.onset),
    duration: first(merged.duration),
    bestFor: first(merged.best_for, merged.primary_use_case, asList(merged.primary_effects)[0], asList(merged.effects)[0]),
    avoidIf: first(merged.avoid_if, merged.contraindications, merged.caution_signals),
    evidenceScore: first(merged.evidence_score, merged.evidenceScore),
    evidenceTier: first(merged.evidence_tier, merged.evidenceTier, merged.evidence_badge),
    confidence: first(merged.confidence, merged.confidence_label),
    mechanisms: asList(merged.mechanisms || merged.mechanism),
    effects: asList(merged.primary_effects || merged.effects),
    sources: asList(merged.sources || merged.source_urls || merged.pmids || merged.references),
  }
}

async function getCompoundPageData(slug: string) {
  const [payload, base] = await Promise.all([getCompoundDetailPayload(), getCompounds()])
  const detail = payload.find((p: AnyRecord) => p.slug === slug)
  const compound = base.find((c: AnyRecord) => c.slug === slug)
  if (!detail && !compound) return null
  return mergeCompoundData(detail, compound, slug)
}

export async function generateStaticParams() {
  const base = await getCompounds()
  return base.map((record: AnyRecord) => clean(record.slug)).filter(Boolean).map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [seoRows, data] = await Promise.all([getSeoPagePayload(), getCompoundPageData(slug)])
  const seo = seoRows.find((row: AnyRecord) => row.slug === slug || row.route === `/compounds/${slug}` || row.route === `compounds/${slug}`)
  const title = clean(seo?.title || seo?.meta_title || data?.headline)
  const description = clean(seo?.description || seo?.meta_description || data?.summary || data?.evidenceSummary)

  return {
    title: title ? `${title} | The Hippie Scientist` : 'Compound Profile | The Hippie Scientist',
    description: description || 'Compound profile with research notes and practical context.',
    alternates: { canonical: `/compounds/${slug}` },
    openGraph: { title: title || 'Compound Profile', description: description || 'Compound profile.', url: `${siteUrl}/compounds/${slug}`, type: 'article' },
  }
}

function StatCard({ label, value }: { label: string; value: string }) {
  if (!isUseful(value)) return null
  return (
    <div className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm'>
      <p className='text-xs font-black uppercase tracking-[0.16em] text-slate-500'>{label}</p>
      <p className='mt-1 text-sm font-black leading-6 text-slate-950'>{value}</p>
    </div>
  )
}

function InfoSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
      <h2 className='text-xl font-black text-slate-950'>{title}</h2>
      <div className='mt-3 text-sm leading-7 text-slate-700'>{children}</div>
    </section>
  )
}

function TextBlock({ title, value }: { title: string; value: string }) {
  if (!isUseful(value)) return null
  return <InfoSection title={title}><p>{value}</p></InfoSection>
}

function ListBlock({ title, items }: { title: string; items: string[] }) {
  const visible = items.filter(isUseful)
  if (!visible.length) return null
  return (
    <InfoSection title={title}>
      <ul className='list-disc space-y-2 pl-5'>{visible.map((item) => <li key={item}>{item}</li>)}</ul>
    </InfoSection>
  )
}

function ChipBlock({ title, items }: { title: string; items: string[] }) {
  const visible = items.filter(isUseful)
  if (!visible.length) return null
  return (
    <InfoSection title={title}>
      <div className='flex flex-wrap gap-2'>{visible.map((item) => <span key={item} className='rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700'>{item}</span>)}</div>
    </InfoSection>
  )
}

function ExtraFields({ data }: { data: AnyRecord }) {
  const entries = Object.entries(data)
    .filter(([key, value]) => !CORE_KEYS.has(key) && isUseful(value))
    .slice(0, 24)

  if (!entries.length) return null
  return (
    <InfoSection title='Additional workbook fields'>
      <dl className='grid gap-3 sm:grid-cols-2'>
        {entries.map(([key, value]) => (
          <div key={key} className='rounded-xl border border-slate-200 bg-slate-50 p-3'>
            <dt className='text-xs font-black uppercase tracking-[0.14em] text-slate-500'>{labelize(key)}</dt>
            <dd className='mt-1 text-sm font-semibold text-slate-800'>{clean(value)}</dd>
          </div>
        ))}
      </dl>
    </InfoSection>
  )
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const data = await getCompoundPageData(slug)
  if (!data) return notFound()

  const cta = await getCtaGatePayload()
  const gate = cta.find((g: AnyRecord) => g.slug === slug)
  const showCta = isYes(gate?.show_cta)

  return (
    <main className='mx-auto max-w-5xl space-y-6'>
      <nav className='flex flex-wrap gap-2 text-sm'>
        <Link href='/compounds' className='min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'>← Compounds</Link>
        <Link href='/goals' className='min-h-11 rounded-full border border-slate-200 bg-white px-4 py-2.5 font-bold text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800'>Goal guides</Link>
      </nav>

      <section className='hero-panel'>
        <div className='flex flex-wrap items-center gap-2'>
          <span className='premium-chip-green'>Compound profile</span>
          {data.evidenceTier ? <span className='premium-chip'>{data.evidenceTier}</span> : null}
          {data.confidence ? <span className='premium-chip'>{data.confidence}</span> : null}
        </div>
        <h1 className='mt-4 text-4xl font-black tracking-tight text-slate-950 sm:text-6xl'>{data.headline}</h1>
        {isUseful(data.summary) ? <p className='mt-4 max-w-3xl text-base leading-7 text-slate-700 sm:text-lg'>{data.summary}</p> : null}
      </section>

      <section className='grid gap-3 sm:grid-cols-2 lg:grid-cols-4'>
        <StatCard label='Best for' value={data.bestFor || 'General support'} />
        <StatCard label='Works in' value={data.timeToEffect || 'Varies'} />
        <StatCard label='Evidence' value={data.evidenceScore || data.evidenceTier || 'Review profile'} />
        <StatCard label='Context' value={data.contextSummary || 'Review profile'} />
      </section>

      <div className='grid gap-6 lg:grid-cols-[1.25fr_0.75fr]'>
        <div className='space-y-6'>
          <TextBlock title='Full summary' value={data.summary} />
          <TextBlock title='Research notes' value={data.evidenceSummary} />
          <ListBlock title='Mechanisms' items={data.mechanisms} />
          <ChipBlock title='Effects and use-cases' items={data.effects} />
          {(data.useRange || data.timeToEffect || data.duration) ? (
            <InfoSection title='Practical context'>
              <ul className='list-disc space-y-2 pl-5'>
                {isUseful(data.useRange) ? <li><span className='font-black'>Use range:</span> {data.useRange}</li> : null}
                {isUseful(data.timeToEffect) ? <li><span className='font-black'>Onset:</span> {data.timeToEffect}</li> : null}
                {isUseful(data.duration) ? <li><span className='font-black'>Duration:</span> {data.duration}</li> : null}
              </ul>
            </InfoSection>
          ) : null}
          <ExtraFields data={data.raw} />
        </div>

        <aside className='space-y-6'>
          {(data.avoidIf || data.contextSummary) ? (
            <section className='rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm'>
              <h2 className='text-lg font-black text-slate-950'>Context check</h2>
              {isUseful(data.avoidIf) ? <p className='mt-3 text-sm leading-6 text-amber-900'><span className='font-black'>Avoid if:</span> {data.avoidIf}</p> : null}
              {isUseful(data.contextSummary) ? <p className='mt-3 text-sm leading-6 text-slate-700'>{data.contextSummary}</p> : null}
            </section>
          ) : null}

          {data.sources.length > 0 ? (
            <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
              <h2 className='text-lg font-black text-slate-950'>Sources</h2>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-700'>{data.sources.slice(0, 8).map((source) => <li key={source}>{source}</li>)}</ul>
            </section>
          ) : null}

          <section className='rounded-2xl border border-slate-200 bg-white p-5 shadow-sm'>
            <h2 className='text-lg font-black text-slate-950'>Next step</h2>
            <p className='mt-2 text-sm leading-6 text-slate-700'>Compare this profile against related options before buying or stacking.</p>
            <div className='mt-4 grid gap-2'>
              <Link href='/compare' className='premium-button'>Compare options →</Link>
              <Link href='/compounds' className='premium-button-secondary'>Browse compounds</Link>
            </div>
          </section>

          {showCta ? <ConversionAffiliateCard name={data.headline} slug={slug} /> : null}
        </aside>
      </div>
    </main>
  )
}
