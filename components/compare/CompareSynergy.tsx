import type { CompareItem } from '@/lib/compare'
import { stimulationProfile } from '@/lib/compare'

interface CompareSynergyProps {
  item1: CompareItem
  item2: CompareItem
}

type SynergyStatus = 'yes' | 'conditional' | 'not-recommended'

function determineSynergy(item1: CompareItem, item2: CompareItem): SynergyStatus {
  const isAdaptogenOrStress = (item: CompareItem) => {
    const text = [...item.mechanismCategories, ...item.mechanisms, item.description]
      .join(' ')
      .toLowerCase()
    return /adapt|hpa.axis|cortisol|stress/.test(text)
  }

  // Both are adaptogens/stress modulators — conditional (don't double-dose cortisol axis)
  if (isAdaptogenOrStress(item1) && isAdaptogenOrStress(item2)) {
    return 'conditional'
  }

  const profile1 = stimulationProfile(item1)
  const profile2 = stimulationProfile(item2)

  // Calming + stimulating pair up well
  if (
    (profile1 === 'calming' && profile2 === 'stimulating') ||
    (profile1 === 'stimulating' && profile2 === 'calming')
  ) {
    return 'yes'
  }

  // Different mechanism category domains → likely complementary
  const cats1 = new Set(item1.mechanismCategories.map((c) => c.toLowerCase()))
  const cats2 = new Set(item2.mechanismCategories.map((c) => c.toLowerCase()))
  const shared = [...cats1].filter((c) => cats2.has(c))
  if (shared.length === 0 && cats1.size > 0 && cats2.size > 0) {
    return 'yes'
  }

  return 'conditional'
}

function deriveTiming(item: CompareItem): 'morning' | 'evening' | 'flexible' {
  const profile = stimulationProfile(item)
  if (item.bestTiming) {
    const t = item.bestTiming.toLowerCase()
    if (/morning|am|early|before work|wake/.test(t)) return 'morning'
    if (/evening|night|pm|before bed|sleep/.test(t)) return 'evening'
  }
  if (profile === 'stimulating') return 'morning'
  if (profile === 'calming') return 'evening'
  return 'flexible'
}

function buildMechanismExplanation(
  status: SynergyStatus,
  item1: CompareItem,
  item2: CompareItem,
): string {
  const m1 = item1.canonicalMechanisms.slice(0, 2).join(' and ') || item1.mechanisms[0] || 'its active compounds'
  const m2 = item2.canonicalMechanisms.slice(0, 2).join(' and ') || item2.mechanisms[0] || 'different pathways'

  if (status === 'yes') {
    return `${item1.name} works primarily through ${m1}, while ${item2.name} acts via ${m2}. These non-overlapping mechanisms make them naturally complementary — each supports a different aspect of the same outcome without redundancy.`
  }

  if (status === 'conditional') {
    return `${item1.name} and ${item2.name} share overlapping mechanisms (${m1} and ${m2} respectively). Starting one at a time allows you to gauge individual tolerance and isolate any response before combining. Many people use both successfully, but conservative titration is advisable.`
  }

  return `${item1.name} and ${item2.name} may compete at shared receptors or pathways. Combining them without medical guidance is not recommended based on current data.`
}

export default function CompareSynergy({ item1, item2 }: CompareSynergyProps) {
  const status = determineSynergy(item1, item2)
  const timing1 = deriveTiming(item1)
  const timing2 = deriveTiming(item2)
  const explanation = buildMechanismExplanation(status, item1, item2)

  const badgeConfig: Record<
    SynergyStatus,
    { icon: string; label: string; badgeClass: string }
  > = {
    yes: {
      icon: '✅',
      label: 'YES — Generally Compatible',
      badgeClass: 'bg-brand-50/50 border border-brand-900/10 text-evidence-strong',
    },
    conditional: {
      icon: '⚠️',
      label: 'CONDITIONAL — Use with Care',
      badgeClass: 'bg-amber-50/60 border border-amber-600/20 text-safety-caution',
    },
    'not-recommended': {
      icon: '❌',
      label: 'NOT RECOMMENDED',
      badgeClass: 'bg-red-50/60 border border-red-600/20 text-safety-avoid',
    },
  }

  const badge = badgeConfig[status]

  // Build timing protocol cards only when the synergy allows combination
  const showTimingProtocol = status !== 'not-recommended'

  // Assign morning/evening slots
  const morningItem =
    timing1 === 'morning' ? item1 : timing2 === 'morning' ? item2 : item1
  const eveningItem =
    timing2 === 'evening' ? item2 : timing1 === 'evening' ? item1 : item2
  const morningTiming =
    morningItem.bestTiming || 'Morning — with or without food'
  const eveningTiming =
    eveningItem.bestTiming || 'Evening — 30–60 min before bed'

  const sameItem = morningItem.slug === eveningItem.slug

  return (
    <section className="space-y-6 max-w-4xl">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Combination Guide</p>
        <h2 className="text-2xl font-semibold tracking-tight text-ink mt-1">
          Can You Take {item1.name} and {item2.name} Together?
        </h2>
      </div>

      {/* Status badge */}
      <div
        className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${badge.badgeClass}`}
      >
        <span aria-hidden="true">{badge.icon}</span>
        {badge.label}
      </div>

      {/* Mechanism explanation */}
      <p className="text-sm leading-relaxed text-muted max-w-prose">{explanation}</p>

      {/* Timing protocol */}
      {showTimingProtocol && (
        <div className="card-premium p-5 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">
            Suggested Timing Protocol
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <p className="text-xs font-bold uppercase tracking-wider text-ink">Morning</p>
              <p className="text-sm font-semibold text-ink">{morningItem.name}</p>
              <p className="text-xs leading-relaxed text-muted">{morningTiming}</p>
            </div>
            {!sameItem && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ink">Evening</p>
                <p className="text-sm font-semibold text-ink">{eveningItem.name}</p>
                <p className="text-xs leading-relaxed text-muted">{eveningTiming}</p>
              </div>
            )}
            {sameItem && (
              <div className="space-y-1">
                <p className="text-xs font-bold uppercase tracking-wider text-ink">Note</p>
                <p className="text-xs leading-relaxed text-muted">
                  Both items share a similar timing profile. Follow manufacturer guidelines and adjust based on individual response.
                </p>
              </div>
            )}
          </div>

          {status === 'conditional' && (
            <p className="text-xs leading-relaxed text-safety-caution border-t border-brand-900/10 pt-3">
              Start each supplement separately for at least one week before combining. Reduce dose of each by one-third when stacking until tolerance is confirmed.
            </p>
          )}
        </div>
      )}

      {/* General disclaimer */}
      <div className="rounded-xl border border-yellow-200 bg-amber-50/60 p-4">
        <p className="text-xs font-semibold text-safety-caution uppercase tracking-wider">
          Always Consult a Healthcare Provider
        </p>
        <p className="mt-1 text-xs leading-relaxed text-muted">
          This analysis is based on documented mechanisms and is not a substitute for personalised medical advice. Individual responses vary. If you take prescription medications, consult a healthcare provider before combining any supplements.
        </p>
      </div>
    </section>
  )
}
