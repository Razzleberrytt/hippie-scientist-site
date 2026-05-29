import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'

type Herb = { slug: string; name?: string; displayName?: string; summary?: string }

const PICKS = ['lemon-balm', 'ashwagandha', 'passionflower']

const label = (h: Herb) => h.displayName || h.name || h.slug

export const metadata: Metadata = {
  title: 'Best Herbs for Overthinking (2026 Guide)',
  description: 'Evidence-informed educational guide to herbs often used in overthinking and racing-thought contexts.',
}

export default async function Page() {
  const herbs = (await getHerbs()) as Herb[]
  const map = new Map(herbs.map((h) => [h.slug, h]))
  const picks = PICKS.map((slug) => map.get(slug)).filter(Boolean) as Herb[]

  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Top list · educational</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Herbs for Overthinking</h1>
        <p className="detail-reading mt-4 text-muted">Use this list as a starting point for research. It is not diagnosis or treatment guidance.</p>
      </section>
      {picks.map((h, i) => {
        const links = getHerbSearchLinks(label(h))
        return (
          <article key={h.slug} className="card-premium p-6">
            <h2 className="text-2xl font-semibold text-ink">#{i + 1} {label(h)}</h2>
            <p className="mt-2 text-muted">{h.summary || 'Explore this profile for effects, safety, and selection context.'}</p>
            <div className="mt-3 flex gap-4">
              <Link href={`/herbs/${h.slug}`} className="text-sm font-medium text-emerald-700 hover:underline">Read profile</Link>
              {links[0] ? <a href={links[0].url} target="_blank" rel="noopener noreferrer nofollow sponsored" className="text-sm font-medium text-emerald-700 hover:underline">Compare products</a> : null}
            </div>
          </article>
        )
      })}
      <p className="text-sm text-muted">Safety note: if anxiety symptoms are severe, persistent, or worsening, seek care from a licensed professional.</p>
      <Link href="/top/stress" className="text-sm font-medium text-emerald-700 hover:underline">Best herbs for stress</Link>
    </main>
  )
}
