import { formatDisplayLabel, list, text, unique } from '@/lib/display-utils'
import {
  getEvidenceLabel,
  getEvidenceTier,
  hasHumanEvidence,
  hasMechanismEvidence,
  isPreliminaryResearch,
} from '@/lib/evidence'
import type { RuntimeRecord } from '@/types/content'

type ProfileEvidenceLensProps = {
  record: RuntimeRecord | Record<string, unknown>
  evidenceLevel?: string
  safetySummary?: string
  citationsCount?: number
  limitations?: string[]
}

type MeterConfig = {
  label: string
  value: number
  tone: string
  note: string
}

const METER_CONFIG: Record<string, MeterConfig> = {
  strong: {
    label: 'Strong',
    value: 100,
    tone: 'bg-[#358f52]',
    note: 'Most useful for practical interpretation when safety context also fits.',
  },
  moderate: {
    label: 'Moderate',
    value: 74,
    tone: 'bg-[#4fb876]',
    note: 'Useful signal, but study design, dose, and population still matter.',
  },
  limited: {
    label: 'Limited',
    value: 50,
    tone: 'bg-amber-500',
    note: 'Read as directional context, not settled clinical proof.',
  },
  preliminary: {
    label: 'Preliminary',
    value: 34,
    tone: 'bg-amber-400',
    note: 'Early signal that needs stronger human replication before practical claims.',
  },
  mixed: {
    label: 'Mixed',
    value: 46,
    tone: 'bg-amber-500',
    note: 'Findings are inconsistent enough that tradeoffs need careful reading.',
  },
  traditional: {
    label: 'Traditional',
    value: 26,
    tone: 'bg-stone-400',
    note: 'Traditional use is separated from modern clinical confirmation.',
  },
  insufficient: {
    label: 'Insufficient',
    value: 12,
    tone: 'bg-stone-300',
    note: 'Evidence is not strong enough for confident practical interpretation.',
  },
  review: {
    label: 'Needs review',
    value: 10,
    tone: 'bg-stone-300',
    note: 'Treat this profile as unresolved until source review is complete.',
  },
}

function cleanList(value: unknown, limit = 3): string[] {
  return unique(list(value).map(formatDisplayLabel).filter(Boolean)).slice(0, limit)
}

function firstReadable(value: unknown): string {
  const source = text(value)
  if (!source) return ''
  const sentences = source.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.map((item) => item.trim()).filter(Boolean) || []
  return (sentences[0] || source).slice(0, 220)
}

function SignalCard({
  title,
  value,
  detail,
  tone = 'neutral',
}: {
  title: string
  value: string
  detail: string
  tone?: 'clinical' | 'mechanism' | 'caution' | 'neutral'
}) {
  const toneClass =
    tone === 'clinical'
      ? 'border-emerald-800/15 bg-emerald-50/80 text-emerald-950'
      : tone === 'mechanism'
        ? 'border-blue-800/15 bg-blue-50/70 text-blue-950'
        : tone === 'caution'
          ? 'border-amber-800/20 bg-amber-50/80 text-amber-950'
          : 'border-brand-900/10 bg-white/85 text-ink'

  return (
    <div className={`rounded-xl border p-3 ${toneClass}`}>
      <p className="text-[10px] font-bold uppercase tracking-[0.12em] opacity-75">{title}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
      <p className="mt-1 text-xs leading-5 opacity-80">{detail}</p>
    </div>
  )
}

export default function ProfileEvidenceLens({
  record,
  evidenceLevel,
  safetySummary,
  citationsCount = 0,
  limitations = [],
}: ProfileEvidenceLensProps) {
  const runtimeRecord = record as RuntimeRecord
  const tier = getEvidenceTier(runtimeRecord)
  const meter = METER_CONFIG[tier] || METER_CONFIG.limited
  const label = evidenceLevel || getEvidenceLabel(runtimeRecord)
  const mechanisms = cleanList(record.mechanisms || record.primary_mechanisms || record.pathways, 3)
  const effects = cleanList(record.primary_effects || record.primaryEffects || record.effects, 3)
  const humanSignal = hasHumanEvidence(runtimeRecord)
  const mechanismSignal = hasMechanismEvidence(runtimeRecord) || mechanisms.length > 0
  const preliminarySignal = isPreliminaryResearch(runtimeRecord)
  const safety = firstReadable(safetySummary || record.safetyNotes || record.safety_notes || record.safety)
  const limitation = limitations.map(formatDisplayLabel).find(Boolean)

  return (
    <section
      className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm sm:p-5"
      aria-labelledby="profile-evidence-lens-heading"
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">Evidence lens</p>
          <h3 id="profile-evidence-lens-heading" className="text-base font-bold text-ink">
            What kind of evidence supports this profile?
          </h3>
          <p className="text-sm leading-6 text-[#46574d]">
            {meter.note}
          </p>
        </div>
        <div className="min-w-[12rem] rounded-xl border border-brand-900/10 bg-brand-50/50 p-3">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-brand-900">{meter.label}</span>
            <span className="text-[11px] font-semibold text-[#5f6f66]">{label}</span>
          </div>
          <div
            className="mt-3 h-2 overflow-hidden rounded-full bg-white"
            role="progressbar"
            aria-label={`Evidence strength: ${label}`}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={meter.value}
          >
            <div className={`h-full rounded-full ${meter.tone}`} style={{ width: `${meter.value}%` }} />
          </div>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <SignalCard
          title="Human clinical evidence"
          value={humanSignal ? 'Present in source signals' : 'Not the primary signal'}
          detail={humanSignal ? 'Human or clinical-study language is present in the reviewed fields.' : 'Interpret practical claims through mechanisms, safety, and limitations first.'}
          tone={humanSignal ? 'clinical' : 'caution'}
        />
        <SignalCard
          title="Mechanistic / preclinical"
          value={mechanismSignal ? 'Mechanism mapped' : 'Mechanism detail limited'}
          detail={mechanisms.length ? mechanisms.join(' | ') : 'No strong mechanism list is available in the current source fields.'}
          tone={mechanismSignal ? 'mechanism' : 'neutral'}
        />
        <SignalCard
          title="Research maturity"
          value={preliminarySignal ? 'Preliminary or mixed' : 'More interpretable'}
          detail={limitation || (effects.length ? `Main use contexts: ${effects.join(' | ')}` : 'Review the full evidence notes before making practical decisions.')}
          tone={preliminarySignal ? 'caution' : 'clinical'}
        />
        <SignalCard
          title="Safety boundary"
          value={safety ? 'Safety note available' : 'Read with standard caution'}
          detail={safety || 'Medication use, pregnancy status, chronic conditions, and dose all change practical fit.'}
          tone="caution"
        />
      </div>

      {citationsCount > 0 ? (
        <p className="mt-3 text-xs leading-5 text-[#5f6f66]">
          This page currently exposes {citationsCount} cited human-study signal{citationsCount === 1 ? '' : 's'} through the profile freshness layer.
        </p>
      ) : null}
    </section>
  )
}
