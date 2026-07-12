import { formatDisplayLabel, list, text, unique } from '@/lib/display-utils'
import {
  getEvidenceLabel,
  getEvidenceTier,
  hasHumanEvidence,
  hasMechanismEvidence,
  isPreliminaryResearch,
} from '@/lib/evidence'
import type { RuntimeRecord } from '../../src/types/content'

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

function SignalRow({
  title,
  value,
  detail,
  tone = 'neutral',
}: {
  title: string
  value: string
  detail?: string
  tone?: 'clinical' | 'mechanism' | 'caution' | 'neutral'
}) {
  const dotClass =
    tone === 'clinical'
      ? 'bg-emerald-600 dark:bg-emerald-300'
      : tone === 'mechanism'
        ? 'bg-blue-600 dark:bg-blue-300'
        : tone === 'caution'
          ? 'bg-amber-500 dark:bg-amber-300'
          : 'bg-stone-400 dark:bg-stone-300'

  return (
    <div className="flex items-baseline gap-2 py-1.5">
      <span aria-hidden="true" className={`mt-1 h-2 w-2 shrink-0 self-start rounded-full ${dotClass}`} />
      <p className="text-xs leading-5 text-ink">
        <span className="font-bold">{title}:</span> <span className="font-semibold">{value}</span>
        {detail ? <span className="text-muted"> — {detail}</span> : null}
      </p>
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
      className="rounded-2xl border border-brand-900/10 bg-white/80 p-4 shadow-sm dark:border-white/10 dark:bg-white/5"
      aria-labelledby="profile-evidence-lens-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div>
          <h3 id="profile-evidence-lens-heading" className="text-sm font-bold leading-6 text-ink">
            Evidence lens
          </h3>
          <p className="text-xs leading-5 text-muted">{meter.note}</p>
        </div>
        <div className="min-w-[11rem] flex-1 sm:max-w-[14rem]">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-bold text-brand-900 dark:text-brand-100">{meter.label}</span>
            <span className="text-[11px] font-semibold text-muted">{label}</span>
          </div>
          <div
            className="mt-1.5 h-2 overflow-hidden rounded-full bg-brand-50 dark:bg-white/10"
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

      <div className="mt-3 grid gap-x-6 border-t border-brand-900/10 pt-2 dark:border-white/10 md:grid-cols-2">
        <SignalRow
          title="Human clinical evidence"
          value={humanSignal ? 'Present in source signals' : 'Not the primary signal'}
          tone={humanSignal ? 'clinical' : 'caution'}
        />
        <SignalRow
          title="Mechanistic / preclinical"
          value={mechanismSignal ? 'Mechanism mapped' : 'Limited detail'}
          detail={mechanisms.length ? mechanisms.join(' · ') : undefined}
          tone={mechanismSignal ? 'mechanism' : 'neutral'}
        />
        <SignalRow
          title="Research maturity"
          value={preliminarySignal ? 'Preliminary or mixed' : 'More interpretable'}
          detail={limitation || (effects.length ? `main contexts: ${effects.join(' · ')}` : undefined)}
          tone={preliminarySignal ? 'caution' : 'clinical'}
        />
        <SignalRow
          title="Safety boundary"
          value={safety ? 'Safety note available' : 'Standard caution'}
          detail={safety || undefined}
          tone="caution"
        />
      </div>

      {citationsCount > 0 ? (
        <p className="mt-2 text-xs leading-5 text-muted">
          This profile cites {citationsCount} human stud{citationsCount === 1 ? 'y' : 'ies'}.
        </p>
      ) : null}
    </section>
  )
}
