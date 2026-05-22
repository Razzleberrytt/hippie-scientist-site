import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

type Compound = { slug: string; name?: string; displayName?: string; summary?: string }

const PICKS = ['creatine', 'caffeine', 'l-theanine']
const label = (c: Compound) => c.displayName || c.name || c.slug

export const metadata: Metadata = {
  title: 'Best Supplements for Brain Fog (2026 Guide)',
  description: 'Educational breakdown of supplements frequently discussed for brain fog and clearer mental performance.',
}

export default async function Page() {
  const compounds = (await getCompounds()) as Compound[]
  const map = new Map(compounds.map((c) => [c.slug, c]))
  const picks = PICKS.map((slug) => map.get(slug)).filter(Boolean) as Compound[]

  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Top list · educational</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Supplements for Brain Fog</h1>
        <p className="detail-reading mt-4 text-muted">Brain fog can have many causes. This list is for educational exploration, not diagnosis or treatment.</p>
      </section>
      {picks.map((c, i) => (
        <article key={c.slug} className="card-premium p-6">
          <h2 className="text-2xl font-semibold text-ink">#{i + 1} {label(c)}</h2>
          <p className="mt-2 text-muted">{c.summary || 'Review this compound for use-cases, safety considerations, and evidence context.'}</p>
          <div className="mt-3 flex gap-4">
            <Link href={`/compounds/${c.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">Read profile</Link>
            <a href={buildAmazonSearchUrl(c.slug)} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-sm font-medium text-emerald-700 hover:underline">Compare products</a>
          </div>
        </article>
      ))}
      <div className="flex gap-4">
        <Link href="/top/focus" className="text-sm font-medium text-emerald-700 hover:underline">Best supplements for focus</Link>
        <Link href="/guides/supplements-for-brain-fog-and-fatigue" className="text-sm font-medium text-emerald-700 hover:underline">Brain fog + fatigue guide</Link>
      </div>
    </main>
  )
}
