import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import {
  getCompoundBySlug,
  getCompounds,
  getHerbCompoundMap,
  getHerbs,
} from '@/lib/runtime-data'
import { getCompoundSearchLinks } from '@/lib/affiliate'
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
  contraindications?: unknown
  interactions?: unknown
  evidenceLevel?: unknown
  confidenceTier?: unknown
}

const formatSlugLabel = (slug: string): string =>
  slug.split('-').filter(Boolean).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ')

const text = (v: unknown): string =>
  v === null || v === undefined
    ? ''
    : Array.isArray(v)
    ? v.map(text).filter(Boolean).join(', ')
    : typeof v === 'object'
    ? text((v as any).value ?? (v as any).text ?? (v as any).label ?? (v as any).name)
    : String(v).replace(/\s+/g, ' ').trim()

const list = (v: unknown): string[] =>
  v === null || v === undefined
    ? []
    : Array.isArray(v)
    ? v.map(text).filter(Boolean)
    : typeof v === 'string'
    ? v.split(/\n|;|\|/).map(s => s.trim()).filter(Boolean)
    : text(v)
    ? [text(v)]
    : []

const unique = (items: string[]): string[] => [...new Set(items.map(text).filter(Boolean))]

export async function generateStaticParams() {
  const compounds = (await getCompounds()) as CompoundDetail[]
  return compounds.map(c => ({ slug: c.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const compound = (await getCompoundBySlug(slug)) as CompoundDetail | null
  if (!compound) return { title: 'Compound Not Found' }
  return { title: `${text(compound.displayName) || formatSlugLabel(compound.slug)} | Compound` }
}

export default async function CompoundDetailPage({ params }: Params) {
  const { slug } = await params
  const compound = (await getCompoundBySlug(slug)) as CompoundDetail | null
  if (!compound) notFound()

  const label = text(compound.displayName) || text(compound.name) || formatSlugLabel(compound.slug)
  const lead = text(compound.summary) || text(compound.description)
  const affiliateLinks = getCompoundSearchLinks(label)
  const mechanisms = unique(list(compound.mechanisms))
  const safety = unique([text(compound.safetyNotes), ...list(compound.contraindications), ...list(compound.interactions)])

  const [map, herbs] = await Promise.all([getHerbCompoundMap(), getHerbs()])
  const herbSet = new Set(herbs.map((h: any) => h.slug))
  const relatedHerbs = map
    .filter((e: any) => e.canonicalCompoundId === compound.slug && herbSet.has(e.herbSlug))
    .slice(0, 6)
    .map((e: any) => ({ slug: e.herbSlug, name: e.herbName }))

  const faqJsonLd = commonSupplementFaqJsonLd(`/compounds/${compound.slug}`)

  return (
    <div className='space-y-5'>
      {faqJsonLd ? <script type='application/ld+json' dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} /> : null}

      <nav className='flex gap-2 text-sm text-white/60'>
        <Link href='/compounds' className='rounded-full border border-white/10 px-4 py-2 hover:bg-white/5'>← Compounds</Link>
        <Link href='/herbs' className='rounded-full border border-white/10 px-4 py-2 hover:bg-white/5'>Herbs</Link>
      </nav>

      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6'>
        <h1 className='text-4xl font-black text-white'>{label}</h1>
        <p className='mt-3 text-white/70'>{lead}</p>
      </section>

      <div className='grid gap-5 lg:grid-cols-[1.35fr_0.85fr]'>
        <main className='space-y-5'>
          {mechanisms.length ? (
            <div className='rounded-3xl border border-white/10 p-5'>
              <h2 className='font-bold text-white'>Mechanisms</h2>
              <ul className='mt-3 list-disc pl-5 text-white/70'>
                {mechanisms.map(m => <li key={m}>{m}</li>)}
              </ul>
            </div>
          ) : null}

          {safety.length ? (
            <div className='rounded-3xl border border-white/10 p-5'>
              <h2 className='font-bold text-white'>Safety</h2>
              <ul className='mt-3 list-disc pl-5 text-white/70'>
                {safety.map(s => <li key={s}>{s}</li>)}
              </ul>
            </div>
          ) : null}
        </main>

        <aside className='space-y-5'>
          <div className='rounded-3xl border border-blue-300/20 bg-blue-300/10 p-5'>
            <p className='text-xs uppercase text-blue-100'>Find supplements</p>
            <h2 className='text-xl font-bold text-white'>Buy {label}</h2>
            <div className='mt-4 space-y-2'>
              {affiliateLinks.map(l => (
                <a key={l.label} href={l.url} target='_blank' rel='noopener noreferrer' className='block rounded-xl border border-blue-300/30 p-3 text-blue-100 hover:bg-blue-300/20'>
                  {l.label}
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {relatedHerbs.length ? (
        <div className='rounded-3xl border border-white/10 p-5'>
          <h2 className='text-white font-bold'>Related herbs</h2>
          <div className='mt-3 grid grid-cols-2 gap-2'>
            {relatedHerbs.map(h => (
              <Link key={h.slug} href={`/herbs/${h.slug}`} className='border p-2 rounded-lg hover:bg-white/5'>
                {h.name}
              </Link>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
