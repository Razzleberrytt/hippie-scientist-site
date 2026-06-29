import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../src/lib/seo'
import fs from 'node:fs'
import path from 'node:path'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Evidence Lookup — Search 557 Compounds by Clinical Trial Grade',
  description: 'Search our database of 557 herbs and compounds for evidence grades (A-F) based on 816 peer-reviewed studies. See which supplements have real human evidence vs marketing claims.',
  path: '/evidence-checker/',
})

interface Compound {
  slug: string
  name: string
  summary: string
  evidence_grade: string
  evidence_tier: string
}

function loadCompounds(): Compound[] {
  const filePath = path.join(process.cwd(), 'public', 'data', 'compounds.json')
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'))
  return raw
    .filter((c: Record<string, unknown>) => c.name && c.evidence_grade)
    .map((c: Record<string, unknown>) => ({
      slug: String(c.slug || ''),
      name: String(c.name || ''),
      summary: String(c.summary || ''),
      evidence_grade: String(c.evidence_grade || ''),
      evidence_tier: String(c.evidence_tier || ''),
    }))
    .sort((a: Compound, b: Compound) => a.name.localeCompare(b.name))
}

const TIER_COLORS: Record<string, string> = {
  'Strong Human Evidence': 'bg-emerald-50 border-emerald-200 text-emerald-800',
  'Moderate Human Evidence': 'bg-lime-50 border-lime-200 text-lime-800',
  'Limited Human Evidence': 'bg-amber-50 border-amber-200 text-amber-800',
  'Mechanism Only': 'bg-orange-50 border-orange-200 text-orange-800',
  'Insufficient Evidence': 'bg-red-50 border-red-200 text-red-800',
}

const COMPOUNDS_BY_LETTER: Record<string, Compound[]> = {}
function getCompoundsByLetter(): Record<string, Compound[]> {
  if (Object.keys(COMPOUNDS_BY_LETTER).length > 0) return COMPOUNDS_BY_LETTER
  const compounds = loadCompounds()
  for (const c of compounds) {
    const letter = c.name.charAt(0).toUpperCase()
    if (!COMPOUNDS_BY_LETTER[letter]) COMPOUNDS_BY_LETTER[letter] = []
    COMPOUNDS_BY_LETTER[letter].push(c)
  }
  return COMPOUNDS_BY_LETTER
}

export default function EvidenceCheckerPage() {
  const byLetter = getCompoundsByLetter()
  const letters = Object.keys(byLetter).sort()
  const total = Object.values(byLetter).reduce((sum, arr) => sum + arr.length, 0)

  return (
    <div className="container-page py-10 space-y-8">
      <section className="space-y-4 max-w-3xl">
        <p className="eyebrow-label">Evidence Database</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Supplement Evidence Lookup
        </h1>
        <p className="text-lg leading-8 text-[#46574d]">
          Browse {total} compounds by their clinical evidence grade — from strong human trials (Grade A) 
          to mechanism-only data (Grade D). Grades are based on analysis of 816 peer-reviewed studies.
        </p>
      </section>

      {/* Alphabet nav */}
      <nav className="flex flex-wrap gap-1.5 max-w-3xl">
        {letters.map(letter => (
          <a
            key={letter}
            href={`#letter-${letter}`}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-900/10 bg-white text-sm font-semibold text-ink transition hover:border-brand-700/30 hover:bg-brand-50"
          >
            {letter}
          </a>
        ))}
      </nav>

      {/* Compounds by letter */}
      <div className="max-w-3xl space-y-10">
        {letters.map(letter => (
          <section key={letter} id={`letter-${letter}`} className="scroll-mt-24 space-y-3">
            <h2 className="text-xl font-bold text-ink border-b border-brand-900/10 pb-2 sticky top-0 bg-[var(--bg)] pt-2">
              {letter}
              <span className="ml-2 text-sm font-normal text-muted">
                ({byLetter[letter].length} compound{byLetter[letter].length !== 1 ? 's' : ''})
              </span>
            </h2>
            <div className="space-y-2">
              {byLetter[letter].map(compound => (
                <Link
                  key={compound.slug}
                  href={`/compounds/${compound.slug}/`}
                  className="flex items-center justify-between gap-4 rounded-xl border border-brand-900/10 bg-white/70 px-4 py-3 transition hover:border-brand-700/30 hover:bg-white"
                >
                  <span className="font-medium text-ink text-sm truncate">{compound.name}</span>
                  <span className={`shrink-0 rounded-full border px-2.5 py-0.5 text-[0.65rem] font-bold ${TIER_COLORS[compound.evidence_tier] || 'bg-gray-50 border-gray-200 text-gray-600'}`}>
                    {compound.evidence_grade.toUpperCase()}
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Legend */}
      <section className="max-w-3xl card-premium p-6 space-y-4">
        <h2 className="text-xl font-semibold text-ink">Evidence Grade Guide</h2>
        <div className="space-y-2 text-sm leading-7 text-[#46574d]">
          <p><strong>Grade A:</strong> Multiple high-quality RCTs with consistent findings.</p>
          <p><strong>Grade B:</strong> Several RCTs with generally positive findings.</p>
          <p><strong>Grade C:</strong> Limited human trials or mixed results.</p>
          <p><strong>Grade D:</strong> Only mechanistic/animal data. No human trials.</p>
          <p><strong>Grade F:</strong> Human trials show no benefit.</p>
          <div className="pt-2">
            <Link href="/methodology/" className="text-sm font-bold text-brand-700 transition hover:text-brand-800">
              Full methodology →
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
