import type { Metadata } from 'next'
import Link from 'next/link'
import fs from 'node:fs'
import path from 'node:path'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { buildPageMetadata } from '../../../src/lib/seo'
import EvidenceLookupClient, { type LookupCompound } from './EvidenceLookupClient'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Lookup — Search Compounds by Clinical Evidence Grade',
  description: 'Search herbs and compounds by evidence grade, from human clinical support to mechanism-only data. Compare what has real evidence with what remains preliminary.',
  path: '/evidence/evidence-checker/',
})

function loadCompounds(): LookupCompound[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'compounds.json')
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return raw
    .filter((c: Record<string, unknown>) => c.name && c.evidence_grade)
    .map((c: Record<string, unknown>) => ({
      slug: String(c.slug || ''),
      name: String(c.name || ''),
      evidence_tier: String(c.evidence_tier || ''),
    }))
    .sort((a: LookupCompound, b: LookupCompound) => a.name.localeCompare(b.name))
}

export default function EvidenceCheckerPage() {
  const compounds = loadCompounds()

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-4 sm:pt-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/evidence/evidence-report/', label: 'Evidence' },
          { label: 'Evidence Lookup' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Evidence Database</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Supplement Evidence Lookup</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Search {compounds.length} compounds by name or filter by clinical evidence tier — from strong human trials to mechanism-only data. The list is generated from the current research library, so it stays aligned as the workbook changes.
        </p>
      </header>

      <section className="section-frame p-5 sm:p-6" aria-labelledby="evidence-lookup-heading">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Search the library</p>
          <h2 id="evidence-lookup-heading" className="compact-heading mt-3">Filter by name or evidence strength.</h2>
          <p className="mt-3 text-sm leading-6 text-[color:var(--hs-body)]">
            Evidence labels describe the strength and maturity of the current research record. They are not a recommendation or a guarantee that a compound will work for a particular person.
          </p>
        </div>
        <div className="mt-5">
          <EvidenceLookupClient compounds={compounds} />
        </div>
      </section>

      <section className="section-frame max-w-4xl p-5 sm:p-6" aria-labelledby="evidence-tier-guide">
        <p className="eyebrow-label">Interpret the labels</p>
        <h2 id="evidence-tier-guide" className="compact-heading mt-3">Evidence Tier Guide</h2>
        <div className="mt-4 space-y-3 text-sm leading-7 text-[color:var(--hs-body)]">
          <p><strong className="text-[color:var(--hs-ink)]">Strong:</strong> Multiple high-quality human trials with consistent findings.</p>
          <p><strong className="text-[color:var(--hs-ink)]">Moderate:</strong> Several human trials with generally positive findings.</p>
          <p><strong className="text-[color:var(--hs-ink)]">Limited:</strong> Few human trials, small samples, or mixed results.</p>
          <p><strong className="text-[color:var(--hs-ink)]">Mechanism:</strong> Only mechanistic or animal data. No solid human trials.</p>
          <div className="border-t border-[color:var(--hs-hairline)] pt-4">
            <Link
              href="/info/methodology/"
              className="text-sm font-bold text-[color:var(--hs-gold-ink)] underline-offset-4 transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
            >
              Read the full methodology →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
