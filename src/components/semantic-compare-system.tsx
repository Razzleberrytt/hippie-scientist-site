import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

type CompareEntity = {
  slug?: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  entityType?: 'herb' | 'compound'
  evidence_tier?: string
  evidenceTier?: string
  primary_effects?: string[]
  effects?: string[]
  mechanisms?: string[]
  pathways?: string[]
  traditional_systems?: string[]
}

type SemanticCompareSystemProps = {
  current: CompareEntity
  strongerEvidence?: CompareEntity[]
  similarMechanisms?: CompareEntity[]
  gentlerAlternatives?: CompareEntity[]
  traditionalAlternatives?: CompareEntity[]
  adjacentPathways?: CompareEntity[]
}

function normalize(items: CompareEntity[] = []) {
  return items.filter((item) => item?.slug).slice(0, 8)
}

function entityHref(item: CompareEntity) {
  const type = item.entityType === 'compound' ? 'compounds' : 'herbs'
  return `/${type}/${item.slug}`
}

function evidenceLabel(item: CompareEntity) {
  return formatDisplayLabel(item.evidence_tier || item.evidenceTier || 'Evidence Context')
}

function evidenceClass(value: string) {
  const normalized = value.toLowerCase()

  if (normalized.includes('strong') || normalized.includes('clinical') || normalized.includes('high')) {
    return 'evidence-pill-strong'
  }

  if (normalized.includes('moderate') || normalized.includes('human')) {
    return 'evidence-pill-moderate'
  }

  return 'chip-readable'
}

function semanticSignals(item: CompareEntity) {
  return unique([
    ...list(item.primary_effects),
    ...list(item.effects),
    ...list(item.mechanisms),
    ...list(item.pathways),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 3)
}

function visualSeed(slug = '') {
  return slug.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0)
}

function visualStyle(slug = '') {
  const seed = visualSeed(slug)
  const palettes = [
    ['#e8f4e7', '#2f7d4b'],
    ['#edf3ff', '#2b5fa8'],
    ['#f5eddc', '#a35f20'],
    ['#eef3f8', '#536a86'],
  ]

  const [bg, accent] = palettes[seed % palettes.length]

  return {
    background: bg,
    color: accent,
  }
}

function glyph(name = '') {
  return name.trim().charAt(0).toUpperCase() || 'S'
}

function CompareCard({ item, context }: { item: CompareEntity; context: string }) {
  const name = formatDisplayLabel(item.displayName || item.name || item.slug)
  const summary = cleanSummary(item.summary || item.description || '', item.entityType === 'compound' ? 'compound' : 'herb')
  const evidence = evidenceLabel(item)
  const signals = semanticSignals(item)

  return (
    <Link href={entityHref(item)} className="semantic-rail-card group">
      <div className="flex gap-3">
        <div
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-brand-900/10 text-xl font-semibold shadow-sm"
          style={visualStyle(item.slug)}
        >
          {glyph(name)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap gap-2">
            <span className={evidenceClass(evidence)}>{evidence}</span>
            <span className="identity-kicker">{context}</span>
          </div>

          <h3 className="mt-2 max-w-none text-base font-semibold leading-snug tracking-tight text-ink group-hover:text-brand-700">
            {name}
          </h3>

          <p className="mt-1 line-clamp-2 text-sm leading-6 text-[#46574d]">
            {summary || 'Semantic comparison candidate surfaced through evidence and pathway relationships.'}
          </p>
        </div>
      </div>

      {signals.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-1.5 border-t border-brand-900/10 pt-3">
          {signals.map((signal) => (
            <span key={signal} className="chip-readable">
              {signal}
            </span>
          ))}
        </div>
      ) : null}
    </Link>
  )
}

function CompareRail({
  eyebrow,
  title,
  description,
  items,
  context,
}: {
  eyebrow: string
  title: string
  description: string
  items: CompareEntity[]
  context: string
}) {
  const visible = normalize(items)

  if (visible.length === 0) return null

  return (
    <section className="compact-section section-rhythm-compact">
      <div className="space-y-2">
        <p className="eyebrow-label">{eyebrow}</p>
        <h2 className="compact-heading">{title}</h2>
        <p className="compact-copy">{description}</p>
      </div>

      <div className="semantic-rail">
        {visible.map((item) => (
          <CompareCard key={`${context}-${item.slug}`} item={item} context={context} />
        ))}
      </div>
    </section>
  )
}

export default function SemanticCompareSystem({
  strongerEvidence = [],
  similarMechanisms = [],
  gentlerAlternatives = [],
  traditionalAlternatives = [],
  adjacentPathways = [],
}: SemanticCompareSystemProps) {
  return (
    <div className="section-rhythm-balanced">
      <CompareRail
        eyebrow="Evidence-informed alternatives"
        title="Stronger evidence comparisons"
        description="Profiles surfaced through broader human evidence, richer clinical interpretation, or stronger publication maturity."
        items={strongerEvidence}
        context="Stronger evidence"
      />

      <CompareRail
        eyebrow="Mechanism continuity"
        title="Similar mechanism profiles"
        description="Adjacent compounds and herbs surfaced through overlapping pathways, neurotransmitter targets, or biological signaling patterns."
        items={similarMechanisms}
        context="Mechanism overlap"
      />

      <CompareRail
        eyebrow="Gentler exploration"
        title="Lower-intensity alternatives"
        description="Comparison candidates with potentially gentler stimulation, sedation, or interaction profiles."
        items={gentlerAlternatives}
        context="Gentler option"
      />

      <CompareRail
        eyebrow="Traditional systems"
        title="Traditional-use parallels"
        description="Ethnobotanical and traditional-system adjacency surfaced as exploratory context rather than equivalence claims."
        items={traditionalAlternatives}
        context="Traditional parallel"
      />

      <CompareRail
        eyebrow="Pathway traversal"
        title="Adjacent pathway exploration"
        description="Semantic graph transitions that help users move naturally across connected research ecosystems."
        items={adjacentPathways}
        context="Adjacent pathway"
      />
    </div>
  )
}
