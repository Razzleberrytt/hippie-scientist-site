import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'

type Params = { params: Promise<{ slug: string }> }

type CompoundDetail = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  mechanism?: string | null
  mechanisms?: unknown
  effects?: unknown
  dosage?: unknown
  dosage_range?: unknown
  evidence_tier?: string | null
  evidenceTier?: string | null
  evidenceScore?: string | null
  safety_flags?: unknown
  safetyNotes?: unknown
  contraindications?: unknown
  time_to_effect?: string | null
  timeToEffect?: string | null
}

const formatSlugLabel = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const text = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>
    return text(record.value ?? record.text ?? record.label ?? record.name ?? record.title)
  }
  return String(value).replace(/\s+/g, ' ').trim()
}

const list = (value: unknown): string[] => {
  if (value === null || value === undefined) return []
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  return text(value)
    .split(/\n|;|\|/)
    .map(item => item.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
}

const getCompoundLabel = (compound: CompoundDetail) =>
  text(compound.displayName) || text(compound.name) || formatSlugLabel(compound.slug)

export async function generateStaticParams() {
  const compounds = (await getCompounds()) as CompoundDetail[]
  return compounds.map(compound => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = (await getCompoundBySlug(slug)) as CompoundDetail | null
  if (!compound) return { title: 'Compound Not Found | The Hippie Scientist' }

  const label = getCompoundLabel(compound)
  const description = text(compound.summary) || text(compound.description) || `${label} evidence, mechanisms, dosage, and safety context.`

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
  const summary = text(compound.summary) || text(compound.description) || 'Used for targeted support depending on context and dose.'
  const effects = list(compound.effects).slice(0, 5)
  const mechanisms = [text(compound.mechanism), ...list(compound.mechanisms)].filter(Boolean).slice(0, 5)
  const safety = [...list(compound.safety_flags), ...list(compound.safetyNotes), ...list(compound.contraindications)].slice(0, 5)
  const dosage = text(compound.dosage_range) || text(compound.dosage) || 'See evidence context'
  const evidence = text(compound.evidence_tier) || text(compound.evidenceTier) || text(compound.evidenceScore) || 'Evidence tracked'
  const timeToEffect = text(compound.time_to_effect) || text(compound.timeToEffect) || 'Varies by context'

  return (
    <div className="space-y-8">
      <nav className="flex flex-wrap gap-2 text-sm">
        <Link href="/compounds" className="rounded-full border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-700 shadow-sm hover:border-teal-200 hover:bg-teal-50">
          ← Compounds
        </Link>
        <Link href="/herbs" className="rounded-full border border-neutral-200 bg-white px-4 py-2 font-semibold text-neutral-700 shadow-sm hover:border-teal-200 hover:bg-teal-50">
          Herbs
        </Link>
      </nav>

      <section className="rounded-[2rem] border border-neutral-200 bg-white p-6 shadow-card sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-teal-700">Compound profile</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">{label}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-neutral-600">{summary}</p>
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Evidence</p>
            <p className="mt-1 font-semibold text-neutral-950">{evidence}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Dose</p>
            <p className="mt-1 font-semibold text-neutral-950">{dosage}</p>
          </div>
          <div className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">Onset</p>
            <p className="mt-1 font-semibold text-neutral-950">{timeToEffect}</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-neutral-950">Best for</h2>
          {effects.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
              {effects.map(item => <li key={item}>• {item}</li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-neutral-600">Situational support depending on goal and dose.</p>}
        </section>

        <section className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card">
          <h2 className="text-xl font-bold text-neutral-950">Mechanisms</h2>
          {mechanisms.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
              {mechanisms.map(item => <li key={item}>• {item}</li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-neutral-600">Mechanisms are tracked as evidence becomes available.</p>}
        </section>

        <section className="rounded-3xl border border-amber-200 bg-amber-50 p-5 shadow-card">
          <h2 className="text-xl font-bold text-neutral-950">Safety</h2>
          {safety.length ? (
            <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
              {safety.map(item => <li key={item}>• {item}</li>)}
            </ul>
          ) : <p className="mt-3 text-sm text-neutral-600">Review interactions, medications, pregnancy, surgery, and individual risk factors.</p>}
        </section>
      </div>
    </div>
  )
}
