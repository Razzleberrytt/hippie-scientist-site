import fs from 'node:fs'
import path from 'node:path'

const target = path.join(process.cwd(), 'app/compounds/[slug]/page.tsx')
let source = fs.readFileSync(target, 'utf8')
const original = source

function replaceOnce(label, before, after) {
  const first = source.indexOf(before)
  if (first === -1) throw new Error(`${label}: expected source pattern was not found`)
  if (source.indexOf(before, first + before.length) !== -1) {
    throw new Error(`${label}: expected source pattern was not unique`)
  }
  source = source.replace(before, after)
}

replaceOnce(
  'profile hero shell',
  '        <div className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10">\n          <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">',
  '        <div id="overview" className="profile-hero hero-shell scroll-mt-24 rounded-[2rem] border border-brand-900/10 p-5 shadow-sm sm:p-6">\n          <header className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-start">',
)

const heroMetaBefore = `              <div className="mt-3 flex flex-wrap items-center gap-3">
                <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
                <EvidenceScoreBadge record={compound} />
              </div>
            </div>
            <MonographHeroImage image={heroImage} label={displayName} eyebrow="Monograph visual" />`

const heroMetaAfter = `              <div className="mt-3 flex flex-wrap items-center gap-3">
                <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
                <EvidenceScoreBadge record={compound} />
              </div>

              <div className={\`mt-4 rounded-xl border px-3 py-2 text-xs leading-5 \${
                safetyTone === 'Generally well tolerated'
                  ? 'border-emerald-900/10 bg-emerald-50/70 text-emerald-950'
                  : 'border-amber-900/10 bg-amber-50/70 text-amber-950'
              }\`}>
                <strong>{safetyTone}:</strong>{' '}
                {firstSentences(safetySummary, 1)}{' '}
                <a href="#safety" className="font-semibold underline underline-offset-2">Details</a>
              </div>

              <dl className="profile-quick-stats mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Evidence</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{evidenceLevel || 'Mixed or uncertain'}</dd>
                </div>
                <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Typical onset</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{timeline || 'Varies by prep'}</dd>
                </div>
                <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
                  <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Safety</dt>
                  <dd className="mt-1 text-sm font-semibold text-ink">{safetyTone}</dd>
                </div>
                {effects.length > 0 ? (
                  <div className="rounded-xl border border-brand-900/10 bg-[var(--surface-card)] p-3">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-muted">Best for</dt>
                    <dd className="mt-1 text-sm text-ink">{effects.slice(0, 3).join(', ')}</dd>
                  </div>
                ) : null}
                {avoidIf.length > 0 ? (
                  <div className="rounded-xl border border-amber-900/10 bg-[var(--surface-warning)] p-3 sm:col-span-2 lg:col-span-1">
                    <dt className="text-[10px] font-bold uppercase tracking-wider text-amber-900">Avoid / review if</dt>
                    <dd className="mt-1 text-sm text-amber-950">{avoidIf.slice(0, 3).join(', ')}</dd>
                  </div>
                ) : null}
              </dl>
            </div>
            <MonographHeroImage image={heroImage} label={displayName} eyebrow="Monograph visual" />`

replaceOnce('hero evidence/safety facts', heroMetaBefore, heroMetaAfter)

replaceOnce(
  'overview jump target',
  "            { label: 'Quick Stats', href: '#quick-stats' },",
  "            { label: 'Overview', href: '#overview' },",
)

replaceOnce(
  'evidence jump target',
  "            { label: 'Evidence', href: '#evidence-summary' },",
  "            { label: 'Evidence', href: '#evidence' },",
)

const quickStatsStartMarker = '        {/* Section 1: Quick Stats */}'
const sourceHerbsMarker = '        {/* Source herbs — internal links from the curated relationship map */}'
const quickStatsStart = source.indexOf(quickStatsStartMarker)
const sourceHerbsStart = source.indexOf(sourceHerbsMarker)
if (quickStatsStart === -1 || sourceHerbsStart === -1 || sourceHerbsStart <= quickStatsStart) {
  throw new Error('quick stats removal: expected section markers were not found in order')
}
source = source.slice(0, quickStatsStart) + source.slice(sourceHerbsStart)

replaceOnce(
  'safety scroll target',
  '<section id="safety" className="rounded-2xl bg-amber-50/70 border border-amber-900/10 border-l-4 border-amber-500/60 p-4 sm:p-5 space-y-3">',
  '<section id="safety" className="scroll-mt-24 rounded-2xl bg-amber-50/70 border border-amber-900/10 border-l-4 border-amber-500/60 p-4 sm:p-5 space-y-3">',
)

replaceOnce(
  'mechanisms scroll target',
  '<section id="mechanisms" className="card-premium p-4 sm:p-5">',
  '<section id="mechanisms" className="card-premium scroll-mt-24 p-4 sm:p-5">',
)

replaceOnce(
  'compare scroll target',
  '<section id="compare" className="card-premium p-4 sm:p-5 space-y-4">',
  '<section id="compare" className="card-premium scroll-mt-24 p-4 sm:p-5 space-y-4">',
)

const tocBefore = `          <ProfileTOC items={[
            { id: 'evidence',  label: 'Evidence'  },
            { id: 'safety',    label: 'Safety'    },
            { id: 'dosing',    label: 'Dosing'    },
            { id: 'compounds', label: 'Compounds' },
            { id: 'faq',       label: 'FAQ'       },
          ]} />`

const tocAfter = `          <ProfileTOC items={[
            { id: 'overview', label: 'Overview' },
            { id: 'safety', label: 'Safety' },
            ...(interactionEdges.length > 0 ? [{ id: 'interactions', label: 'Interactions' }] : []),
            { id: 'evidence', label: 'Evidence' },
            { id: 'dosing', label: 'Dosing' },
            { id: 'compounds', label: 'Source herbs' },
            ...(mechanismHints.length > 0 ? [{ id: 'mechanisms', label: 'Mechanisms' }] : []),
            { id: 'compare', label: 'Compare' },
          ]} />`

replaceOnce('profile table of contents', tocBefore, tocAfter)

const required = [
  'id="overview"',
  'profile-quick-stats',
  'href="#safety"',
  "{ label: 'Evidence', href: '#evidence' }",
  "{ id: 'overview', label: 'Overview' }",
]
for (const token of required) {
  if (!source.includes(token)) throw new Error(`post-migration invariant missing: ${token}`)
}
if (source.includes("href: '#evidence-summary'")) throw new Error('stale #evidence-summary jump target remains')
if (source.includes('id="quick-stats"')) throw new Error('duplicate standalone quick-stats section remains')

if (source === original) {
  console.log('Compound profile parity migration already applied; no changes required.')
  process.exit(0)
}

fs.writeFileSync(target, source)
console.log('Applied compound profile parity migration successfully.')
