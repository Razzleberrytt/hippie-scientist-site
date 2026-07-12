import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import fs from 'node:fs'
import path from 'node:path'
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
    <div className="container-page py-10 space-y-8">
      <section className="space-y-4 max-w-3xl">
        <p className="eyebrow-label">Evidence Database</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Supplement Evidence Lookup
        </h1>
        <p className="text-lg leading-8 text-muted">
          Search {compounds.length} compounds by name or filter by clinical evidence tier — from strong human trials
          to mechanism-only data. The list is generated from the current research library, so it stays aligned as the workbook changes.
        </p>
      </section>

      <EvidenceLookupClient compounds={compounds} />

      {/* Legend */}
      <section className="max-w-3xl card-premium p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Evidence Tier Guide</h2>
        <div className="space-y-2 text-sm leading-7 text-muted">
          <p><strong>Strong:</strong> Multiple high-quality human trials with consistent findings.</p>
          <p><strong>Moderate:</strong> Several human trials with generally positive findings.</p>
          <p><strong>Limited:</strong> Few human trials, small samples, or mixed results.</p>
          <p><strong>Mechanism:</strong> Only mechanistic or animal data. No solid human trials.</p>
          <div className="pt-2">
            <Link href="/info/methodology/" className="text-sm font-bold text-brand-700 transition hover:text-brand-800">
              Full methodology →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
