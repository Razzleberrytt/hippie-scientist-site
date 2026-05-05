import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Pill } from 'lucide-react'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import { DetailCard, EvidenceBadge, RoleBadge } from '@/components/ui'
import { CompoundCompareButton } from '@/components/compound-compare-button'

type Params = { params: Promise<{ slug: string }> }
type CompoundDetail = Record<string, any>

const text = (value: any) => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean).join(', ')
  return String(value || '').replace(/\s+/g, ' ').trim()
}

const list = (value: any) => {
  if (Array.isArray(value)) return value.map(text).filter(Boolean)
  return text(value)
    .split(/\n|;|\|/)
    .map((item: string) => item.trim())
    .filter(Boolean)
}

const evidenceSentence = (value?: string) => {
  const label = text(value) || 'limited'
  const normalized = label.toLowerCase()
  if (/high|strong|likely|effective/.test(normalized)) return `Classified as ${label} evidence; this is one of the stronger signals in the database.`
  if (/moderate|mixed|emerging/.test(normalized)) return `Classified as ${label} evidence; useful, but context and study quality still matter.`
  return `Classified as ${label} evidence; treat this as preliminary and review the full context before using.`
}

const pmidUrl = (id: string) => `https://pubmed.ncbi.nlm.nih.gov/${id.replace(/\D/g, '')}`


const getRelatedCompounds = async (slug: string, compound: CompoundDetail) => {
  const compounds = await getCompounds()
  const currentEffects = new Set(list(compound.effects || compound.primary_effects).map((item) => item.toLowerCase()))
  return compounds
    .filter((row: any) => row.slug && row.slug !== slug)
    .map((row: any) => ({
      slug: row.slug,
      name: row.name || row.slug,
      score: list(row.effects || row.primary_effects).reduce((acc: number, item: string) => acc + (currentEffects.has(item.toLowerCase()) ? 1 : 0), 0),
    }))
    .sort((a: any, b: any) => b.score - a.score || a.name.localeCompare(b.name))
    .slice(0, 4)
}

export async function generateStaticParams() {
  const compounds = await getCompounds()
  return compounds.map((compound: any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) return { title: 'Compound Not Found' }
  return { title: `${compound.name || slug} | Compound` }
}

export default async function Page({ params }: Params) {
  const { slug } = await params

  const raw = await getCompoundBySlug(slug)
  if (!raw) return notFound()

  const data = raw as CompoundDetail

  const name = data.displayName || data.name || slug
  const bestFor = list(data.effects || data.primary_effects).slice(0, 6)
  const mechanisms = list(data.mechanisms || data.mechanism).slice(0, 8)
  const safety = list(data.safety_flags || data.safetyNotes || data.contraindications).slice(0, 8)
  const evidence = text(data.evidence_tier || data.evidenceTier || data.evidence_grade) || 'Limited'
  const pmids = list(data.pmid_list).filter((id: string) => /\d/.test(id)).slice(0, 10)
  const updatedAt = text(data.updated_at || data.last_updated || data.lastReviewedAt)
  const relatedCompounds = await getRelatedCompounds(slug, data)

  const toc = [
    bestFor.length ? ['best-for', 'Best For'] : null,
    ['evidence', 'Evidence'],
    safety.length ? ['safety', 'Safety'] : null,
    mechanisms.length ? ['mechanisms', 'Mechanisms'] : null,
    pmids.length ? ['references', 'References'] : null,
  ].filter(Boolean) as string[][]

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <aside className="hidden lg:block">
        <nav className="sticky top-24 rounded-2xl border border-neutral-200/60 bg-white p-4 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700">On this page</p>
          <div className="mt-3 grid gap-2 text-sm">
            {toc.map(([href, label]) => <a key={href} href={`#${href}`} className="rounded-lg px-3 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black">{label}</a>)}
          </div>
        </nav>
      </aside>

      <main className="space-y-10">
        <nav className="flex gap-2 overflow-x-auto rounded-2xl border border-neutral-200 bg-white p-2 text-sm lg:hidden">
          {toc.map(([href, label]) => <a key={href} href={`#${href}`} className="min-h-10 shrink-0 rounded-lg px-3 py-2 font-medium text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-black">{label}</a>)}
        </nav>

        <DetailCard>
          <div className="flex flex-wrap items-center gap-3">
            <Pill className="text-teal-600" aria-hidden="true" />
            <h1 className="text-3xl font-bold text-ink">{name}</h1>
            {data.role ? <RoleBadge role={data.role} /> : null}
          </div>
          {data.formula ? <p className="mt-2 text-sm font-semibold text-muted">{data.formula}</p> : null}
          {updatedAt ? <p className="mt-2 text-xs text-muted">Last updated {updatedAt}</p> : null}
          <div className="mt-4">
            <CompoundCompareButton slug={slug} />
          </div>
        </DetailCard>

        {bestFor.length ? (
          <DetailCard id="best-for" title="Best For">
            <div className="flex flex-wrap gap-2">
              {bestFor.map((item: string) => <span key={item} className="rounded-full bg-neutral-100/80 px-3 py-1 text-xs font-medium text-neutral-700">{item}</span>)}
            </div>
          </DetailCard>
        ) : null}

        <DetailCard id="evidence" title="Evidence">
          <EvidenceBadge value={evidence} />
          <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">{evidenceSentence(evidence)}</p>
        </DetailCard>

        {safety.length ? (
          <DetailCard id="safety" title="Safety & Side Effects" className="border-amber-200 bg-amber-50">
            <ul className="space-y-2 text-sm leading-6 text-neutral-700">
              {safety.map((item: string) => <li key={item}>• {item}</li>)}
            </ul>
          </DetailCard>
        ) : null}

        {mechanisms.length ? (
          <DetailCard id="mechanisms" title="Mechanisms of Action">
            <details className="rounded-2xl border border-neutral-200 bg-neutral-50 p-4">
              <summary className="cursor-pointer font-semibold text-ink">View mechanisms</summary>
              <ul className="mt-3 space-y-2 text-sm leading-6 text-neutral-700">
                {mechanisms.map((item: string) => <li key={item}>• {item}</li>)}
              </ul>
            </details>
          </DetailCard>
        ) : null}



        {relatedCompounds.length ? (
          <DetailCard title="Compare with">
            <div className="grid gap-2 sm:grid-cols-2">
              {relatedCompounds.map((item: any) => (
                <Link key={item.slug} href={`/compare?c=${slug},${item.slug}`} className="rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-sm font-medium text-neutral-800 hover:border-teal-200 hover:text-teal-700">
                  Compare {name} vs {item.name}
                </Link>
              ))}
            </div>
          </DetailCard>
        ) : null}

        {pmids.length ? (
          <DetailCard id="references" title="References">
            <ul className="space-y-2 text-sm">
              {pmids.map((id: string) => (
                <li key={id}>
                  <a href={pmidUrl(id)} target="_blank" rel="noopener noreferrer" className="font-semibold text-teal-700 underline">PMID {id.replace(/\D/g, '') || id}</a>
                </li>
              ))}
            </ul>
          </DetailCard>
        ) : null}
      </main>
    </div>
  )
}
