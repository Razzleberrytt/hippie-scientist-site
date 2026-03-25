import { Link, useParams } from 'react-router-dom'
import Meta from '@/components/Meta'
import { useHerbData } from '@/lib/herb-data'
import { getCommonName } from '@/lib/herbName'
import { splitClean } from '@/lib/sanitize'
import type { Herb } from '@/types/herb'

type GoalConfig = {
  label: string
  intro: string
  seoDescription: string
  primaryKeywords: string[]
  supportKeywords: string[]
  cautionKeywords: string[]
}

type RankedHerb = {
  herb: Herb
  score: number
  matched: string[]
  safetyNotes: string[]
}

const GOALS: Record<string, GoalConfig> = {
  sleep: {
    label: 'Best Herbs for Sleep',
    intro:
      'Sleep-focused herbs are not all the same: some help with sleep onset (calming racing thoughts), while others support sleep depth or reduce overnight awakenings. This list prioritizes herbs with clear sleep, sedative, or nighttime-calming signals in their effect fields and includes practical cautions so readers can avoid common stacking mistakes.',
    seoDescription:
      'Ranked, evidence-structured list of the best herbs for sleep, including practical safety notes and when each herb may fit.',
    primaryKeywords: ['sleep', 'insomnia', 'sedative', 'night', 'restful'],
    supportKeywords: ['calm', 'relax', 'anxiolytic', 'nervine', 'gaba'],
    cautionKeywords: ['sedative', 'cns depressant', 'drowsy', 'alcohol'],
  },
  anxiety: {
    label: 'Herbs for Anxiety',
    intro:
      'Anxiety-support herbs vary by profile: some are better for physical tension, others for rumination or stress reactivity. This page ranks herbs by anxiety-related effects first, then boosts entries with stronger mechanism and safety detail so the list is useful for comparing options instead of generic browsing.',
    seoDescription:
      'Explore a ranked list of herbs for anxiety support with concise safety notes and data-backed effect matching.',
    primaryKeywords: ['anxiety', 'anxiolytic', 'calm', 'stress', 'tension'],
    supportKeywords: ['relax', 'nervine', 'mood', 'cortisol', 'gaba'],
    cautionKeywords: ['ssri', 'sedative', 'benzodiazepine', 'pregnancy'],
  },
  focus: {
    label: 'Focus and Cognition Herbs',
    intro:
      'For focus and cognition, stimulation alone is not enough. The strongest candidates usually combine attentional support with manageable stimulation and low cognitive “noise.” This ranking emphasizes focus and clarity signals, then favors records with richer mechanism details so users can compare nootropic-style options more intelligently.',
    seoDescription:
      'Compare focus and cognition herbs ranked by effect match quality, with quick notes on stimulation and interaction cautions.',
    primaryKeywords: ['focus', 'attention', 'clarity', 'cognitive', 'nootropic'],
    supportKeywords: ['memory', 'alertness', 'stimulation', 'dopamine', 'acetylcholine'],
    cautionKeywords: ['insomnia', 'hypertension', 'stimulant', 'anxiety'],
  },
}

function confidencePoints(herb: Herb): number {
  const level = String(herb.confidence ?? '').toLowerCase()
  if (level === 'high') return 3
  if (level === 'medium') return 2
  return 1
}

function getBlob(herb: Herb): string {
  return [
    ...splitClean(herb.effects),
    ...splitClean(herb.effectsSummary),
    ...splitClean(herb.description),
    ...splitClean(herb.tags),
    ...splitClean(herb.mechanism),
    ...splitClean(herb.mechanismOfAction),
    ...splitClean(herb.mechanismofaction),
  ]
    .join(' ')
    .toLowerCase()
}

function getSafetyBlob(herb: Herb): string {
  return [
    ...splitClean(herb.safety),
    ...splitClean(herb.contraindications),
    ...splitClean(herb.interactions),
    ...splitClean(herb.sideeffects),
    ...splitClean(herb.sideEffects),
  ]
    .join(' ')
    .toLowerCase()
}

function createSafetyNotes(herb: Herb, config: GoalConfig): string[] {
  const safetyBlob = getSafetyBlob(herb)
  const notes: string[] = []

  if (config.cautionKeywords.some(keyword => safetyBlob.includes(keyword))) {
    notes.push('Potential interaction/sedation caution flagged in safety fields.')
  }
  if (safetyBlob.includes('pregnan')) {
    notes.push('Pregnancy caution appears in record; verify with a clinician.')
  }
  if (safetyBlob.includes('liver')) {
    notes.push('Liver-related caution mentioned; avoid high or prolonged dosing.')
  }
  if (safetyBlob.includes('blood pressure') || safetyBlob.includes('hypertension')) {
    notes.push('Blood-pressure-related caution noted in interactions/safety data.')
  }

  if (!notes.length) {
    notes.push('Review herb profile for contraindications, interactions, and dosing context.')
  }

  return notes.slice(0, 2)
}

function rankHerbs(herbs: Herb[], config: GoalConfig): RankedHerb[] {
  return herbs
    .map(herb => {
      const blob = getBlob(herb)
      const primaryMatches = config.primaryKeywords.filter(keyword => blob.includes(keyword))
      const supportMatches = config.supportKeywords.filter(keyword => blob.includes(keyword))
      const completeness = [
        herb.description,
        herb.effects,
        herb.mechanism || herb.mechanismOfAction || herb.mechanismofaction,
        herb.safety || herb.contraindications || herb.interactions,
      ].filter(field => splitClean(field).length > 0).length

      const score =
        primaryMatches.length * 4 +
        supportMatches.length * 2 +
        confidencePoints(herb) +
        completeness

      return {
        herb,
        score,
        matched: [...primaryMatches, ...supportMatches],
        safetyNotes: createSafetyNotes(herb, config),
      }
    })
    .filter(item => item.matched.length > 0)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const nameA = getCommonName(a.herb) || a.herb.scientific || a.herb.slug || ''
      const nameB = getCommonName(b.herb) || b.herb.scientific || b.herb.slug || ''
      return nameA.localeCompare(nameB)
    })
    .slice(0, 18)
}

export default function HerbGoalPage() {
  const { goal = '' } = useParams<{ goal: string }>()
  const config = GOALS[goal]
  const herbs = useHerbData()

  if (!config) {
    return (
      <main className='container-page py-8 text-white/80'>
        <p>Collection not found.</p>
      </main>
    )
  }

  const ranked = rankHerbs(herbs, config)

  return (
    <main className='container-page py-8'>
      <Meta
        title={`${config.label} | The Hippie Scientist`}
        description={config.seoDescription}
        path={`/herbs-for-${goal}`}
      />

      <section className='ds-card-lg'>
        <h1 className='text-3xl font-semibold text-white'>{config.label}</h1>
        <p className='mt-3 text-sm leading-7 text-white/80'>{config.intro}</p>
      </section>

      <section className='ds-card mt-5'>
        <h2 className='text-lg font-semibold text-white'>Ranked herb list</h2>
        <ol className='mt-3 space-y-3'>
          {ranked.map((item, index) => (
            <li
              key={item.herb.slug || index}
              className='rounded-xl border border-white/10 bg-white/5 p-4'
            >
              <div className='flex items-start justify-between gap-3'>
                <div>
                  <p className='text-xs uppercase tracking-wide text-cyan-200/90'>#{index + 1}</p>
                  <Link
                    to={`/herbs/${item.herb.slug}`}
                    className='text-base font-semibold text-white hover:text-cyan-200'
                  >
                    {getCommonName(item.herb) || item.herb.scientific || item.herb.slug}
                  </Link>
                </div>
                <p className='text-xs text-white/70'>Effect score: {item.score}</p>
              </div>
              <p className='mt-2 text-sm text-white/80'>
                {(item.herb.effectsSummary as string) ||
                  item.herb.description ||
                  'See full herb profile.'}
              </p>
              <p className='mt-2 text-xs text-white/65'>
                Match drivers: {item.matched.slice(0, 4).join(', ')}
              </p>
              <ul className='mt-2 list-disc pl-5 text-xs text-amber-100/85'>
                {item.safetyNotes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </section>

      <section className='ds-card mt-5'>
        <h2 className='text-lg font-semibold text-white'>Quick safety notes</h2>
        <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-white/80'>
          <li>These pages are educational indexes, not a diagnosis or prescription.</li>
          <li>Start low, avoid stacking multiple sedative or stimulant herbs at once.</li>
          <li>
            Check medication interactions, especially for SSRIs, benzodiazepines, and sleep meds.
          </li>
        </ul>
      </section>
    </main>
  )
}
