import Link from 'next/link'
import { notFound } from 'next/navigation'
import { bestPages } from '@/data/best'
import { supplementComparisons } from '@/data/comparisons'
import { getCompounds, getStacks } from '@/lib/runtime-data'

export async function generateStaticParams() {
  return bestPages.map((page) => ({ slug: page.slug }))
}

const roleForIndex = (index: number) => {
  if (index === 0) return 'Anchor'
  if (index <= 2) return 'Amplifier'
  return 'Support'
}

const roleBadgeClass: Record<string, string> = {
  Anchor: 'border-emerald-300/50 bg-emerald-300/15 text-emerald-100',
  Amplifier: 'border-cyan-300/45 bg-cyan-300/10 text-cyan-100',
  Support: 'border-violet-300/45 bg-violet-300/10 text-violet-100',
}

const extractField = (meta: any, keys: string[]) => {
  for (const key of keys) {
    const value = meta?.[key]
    if (typeof value === 'string' && value.trim()) return value.trim()
  }
  return ''
}

export default async function Page({ params }: any) {
  const { slug } = await params
  const config = bestPages.find((p) => p.slug === slug)
  if (!config) return notFound()

  const [compounds, stacks] = await Promise.all([getCompounds(), getStacks()])

  const items = compounds
    .filter((c: any) => config.compoundCandidates.includes(c.slug))
    .map((c: any, index: number) => {
      const dosage = extractField(c.meta, ['typicalDose', 'dose', 'dosage', 'typical_dose']) || 'See compound profile'
      const timing = extractField(c.meta, ['timing', 'whenToTake', 'schedule']) || 'Based on tolerance and routine'
      const role = roleForIndex(index)

      return {
        slug: c.slug,
        title: c.displayName || c.name,
        summary: c.summary || 'Evidence-aware option used in this goal stack.',
        href: `/compounds/${c.slug}`,
        dosage,
        timing,
        role,
      }
    })

  const stackHref = stacks.find((s: any) => {
    const key = String(s.goal_slug || s.goal || s.slug || '').toLowerCase()
    return key === slug
  })?.slug

  const relatedComparisons = supplementComparisons.filter((cmp) =>
    cmp.a.candidates.some(c => config.compoundCandidates.includes(c)) ||
    cmp.b.candidates.some(c => config.compoundCandidates.includes(c))
  ).slice(0, 3)

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 pb-12">
      <section className="relative overflow-hidden rounded-3xl border border-white/15 bg-slate-950 px-5 py-6 text-white shadow-[0_24px_70px_rgba(2,6,23,0.5)] sm:px-7">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.24),transparent_42%),radial-gradient(circle_at_25%_15%,rgba(59,130,246,0.2),transparent_35%)]" />
        <div className="relative space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-cyan-100/80">Goal-based stack</p>
          <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl">{config.title}</h1>
          <p className="text-sm text-slate-200/90 sm:text-base">{config.description}</p>

          <Link
            href={stackHref ? `/stacks/${stackHref}` : '/stacks'}
            className="mt-2 block rounded-2xl border border-emerald-300/40 bg-emerald-300/20 px-5 py-4 text-center text-base font-black text-emerald-50 backdrop-blur-sm transition active:scale-[0.99]"
          >
            Open full stack →
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {items.map((item) => (
          <article
            key={item.slug}
            className="rounded-3xl border border-white/20 bg-slate-900/80 p-4 text-white shadow-[0_16px_45px_rgba(15,23,42,0.35)] backdrop-blur-sm"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <h2 className="text-xl font-extrabold leading-tight">{item.title}</h2>
              <span className={`shrink-0 rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.14em] ${roleBadgeClass[item.role]}`}>
                {item.role}
              </span>
            </div>

            <p className="text-sm text-slate-200/90">{item.summary}</p>

            <dl className="mt-4 grid grid-cols-1 gap-3 text-sm">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Dosage</dt>
                <dd className="mt-1 text-slate-100">{item.dosage}</dd>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <dt className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-300">Timing</dt>
                <dd className="mt-1 text-slate-100">{item.timing}</dd>
              </div>
            </dl>

            <Link href={item.href} className="mt-4 inline-flex text-sm font-bold text-cyan-200">
              Review full compound card →
            </Link>
          </article>
        ))}
      </section>

      {relatedComparisons.length > 0 && (
        <section className="rounded-3xl border border-slate-200/70 bg-white/80 p-5 backdrop-blur-sm">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500">Fast decisions</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Compare likely alternatives</h2>
          <div className="mt-3 flex flex-col gap-2">
            {relatedComparisons.map(c => (
              <Link key={c.slug} href={`/compare/${c.slug}`} className="premium-link text-sm">
                {c.title} →
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
