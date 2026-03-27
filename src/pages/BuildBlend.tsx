import { type FormEvent, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { jsPDF } from 'jspdf'
import Card from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import Meta from '@/components/Meta'
import Disclaimer from '@/components/Disclaimer'
import { useHerbData } from '@/lib/herb-data'
import { herbDisplayName } from '@/utils/herbSignals'
import type { Herb } from '@/types/herb'
import { submitLeadCapture } from '@/lib/leadCapture'
import { pushRecentUnique, readStorage, removeStorage, writeStorage } from '@/utils/storageState'

type StackIntent = 'sleep' | 'focus' | 'relaxation'

type StackPlan = {
  intent: StackIntent
  herbSlugs: string[]
}

type RecentStackPlan = StackPlan & {
  id: string
  createdAt: string
}

type InteractionCheckHistory = {
  id: string
  checkedAt: string
  herbSlugs: string[]
  warningCount: number
}

type StackOutput = {
  selectedHerbs: Herb[]
  intentLabel: string
  timing: string[]
  usageNotes: string[]
  dosage: {
    light: string
    moderate: string
    strong: string
  }
  safetyNotes: string[]
  interactionWarnings: string[]
}

const LOCAL_STACK_KEY = 'ths:personal-herb-stack'
const RECENT_STACKS_KEY = 'ths:recent-herb-stacks'
const FAVORITE_HERBS_KEY = 'ths:favorite-herbs'
const INTERACTION_HISTORY_KEY = 'ths:interaction-check-history'
const STACK_SHARE_PARAM = 's'
const MAX_NOTES = 6
const MAX_RECENT_STACKS = 6
const MAX_INTERACTION_HISTORY = 12

const INTENT_COPY: Record<StackIntent, { label: string; timing: string[] }> = {
  sleep: {
    label: 'Sleep',
    timing: [
      'Primary window: 45–90 minutes before bedtime.',
      'Avoid new combinations on nights before critical obligations.',
      'Keep timing consistent for 3–5 nights before adjusting dose range.',
    ],
  },
  focus: {
    label: 'Focus',
    timing: [
      'Primary window: morning or early work block.',
      'Avoid dosing within 8 hours of planned bedtime.',
      'Use once daily first, then evaluate concentration quality after 1 week.',
    ],
  },
  relaxation: {
    label: 'Relaxation',
    timing: [
      'Primary window: late afternoon or early evening.',
      'Use on low-demand days first to observe sedation sensitivity.',
      'If combining calming herbs, increase spacing between doses.',
    ],
  },
}

function normalizeList(value: unknown): string[] {
  if (Array.isArray(value))
    return value
      .map(String)
      .map(item => item.trim())
      .filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[\n,;]+/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function encodeStackPlan(plan: StackPlan): string {
  const compact = [plan.intent, ...plan.herbSlugs].map(item => item.trim().toLowerCase()).join('.')
  return encodeURIComponent(compact)
}

function decodeStackPlan(input: string | null): StackPlan | null {
  if (!input) return null
  try {
    const raw = decodeURIComponent(input).trim()
    const [intentToken, ...slugTokens] = raw.split('.')
    const isIntent =
      intentToken === 'sleep' || intentToken === 'focus' || intentToken === 'relaxation'
    if (isIntent && slugTokens.length > 0) {
      return {
        intent: intentToken,
        herbSlugs: slugTokens.map(item => item.trim().toLowerCase()).filter(Boolean),
      }
    }
  } catch {
    // Continue into legacy decoder.
  }

  try {
    const legacyRaw = decodeURIComponent(atob(input))
    const parsed = JSON.parse(legacyRaw) as StackPlan
    const isIntent =
      parsed.intent === 'sleep' || parsed.intent === 'focus' || parsed.intent === 'relaxation'
    if (!isIntent || !Array.isArray(parsed.herbSlugs)) return null
    return {
      intent: parsed.intent,
      herbSlugs: parsed.herbSlugs.map(item => String(item).trim().toLowerCase()).filter(Boolean),
    }
  } catch {
    return null
  }
}

function buildDosageGuidance(selectedHerbs: Herb[]) {
  const weights = selectedHerbs.map(herb => {
    const intensity = String(herb.intensityLevel || herb.intensity || '').toLowerCase()
    if (intensity.includes('strong')) return 3
    if (intensity.includes('moderate')) return 2
    return 1
  })
  const averageWeight = weights.length
    ? weights.reduce((acc, current) => acc + current, 0) / weights.length
    : 1
  const stackSize = Math.max(selectedHerbs.length, 1)

  const lightUnits = Math.max(0.5, Number((0.6 * averageWeight).toFixed(1)))
  const moderateUnits = Number((lightUnits * (1.5 + stackSize * 0.05)).toFixed(1))
  const strongUnits = Number((moderateUnits * 1.4).toFixed(1))

  return {
    light: `${lightUnits} total stack units/day (start here; split into 1–2 servings).`,
    moderate: `${moderateUnits} total stack units/day (after 3+ stable sessions).`,
    strong: `${strongUnits} total stack units/day (advanced users only; avoid rapid escalation).`,
  }
}

function buildStackOutput(intent: StackIntent, selectedHerbs: Herb[]): StackOutput {
  const usageNotes = selectedHerbs
    .flatMap(herb => {
      const herbName = herbDisplayName(herb)
      const preparationItems = [
        ...normalizeList(herb.preparations),
        ...normalizeList(herb.preparation),
        ...normalizeList(herb.preparationsText),
      ]
      const dosageItems = [...normalizeList(herb.dosage), ...normalizeList(herb.dosage_notes)]
      const prepSummary = preparationItems.length
        ? `${herbName}: ${preparationItems.slice(0, 2).join('; ')}`
        : null
      const dosageSummary = dosageItems.length ? `${herbName} dose note: ${dosageItems[0]}` : null
      return [prepSummary, dosageSummary].filter(Boolean) as string[]
    })
    .map(note => note.replace(/\s+/g, ' ').trim())
    .filter(Boolean)
    .slice(0, MAX_NOTES)

  const safetyNotes = Array.from(
    new Set(
      selectedHerbs
        .flatMap(herb => [
          ...normalizeList(herb.safety),
          ...normalizeList(herb.contraindications),
          ...normalizeList(herb.sideeffects),
        ])
        .map(note => note.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_NOTES)

  const interactionWarnings = Array.from(
    new Set(
      selectedHerbs
        .flatMap(herb => [
          ...normalizeList(herb.interactions),
          ...normalizeList(herb.interactionNotes),
          ...normalizeList(herb.interactionTags),
        ])
        .map(note => note.replace(/\s+/g, ' ').trim())
        .filter(Boolean)
    )
  ).slice(0, MAX_NOTES)

  return {
    selectedHerbs,
    intentLabel: INTENT_COPY[intent].label,
    timing: INTENT_COPY[intent].timing,
    usageNotes,
    dosage: buildDosageGuidance(selectedHerbs),
    safetyNotes: safetyNotes.length
      ? safetyNotes
      : [
          'Safety profile is incomplete for one or more herbs. Start low and review source data before use.',
        ],
    interactionWarnings: interactionWarnings.length
      ? interactionWarnings
      : [
          'No explicit interaction warnings were detected in structured data. This does not guarantee no interactions.',
        ],
  }
}

export default function BuildBlend() {
  const herbs = useHerbData()
  const [searchParams, setSearchParams] = useSearchParams()

  const [intent, setIntent] = useState<StackIntent>('sleep')
  const [query, setQuery] = useState('')
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>([])
  const [result, setResult] = useState<StackOutput | null>(null)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle')
  const [leadEmail, setLeadEmail] = useState('')
  const [leadStatus, setLeadStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [leadMessage, setLeadMessage] = useState('')
  const [favoriteSlugs, setFavoriteSlugs] = useState<string[]>([])
  const [recentStacks, setRecentStacks] = useState<RecentStackPlan[]>([])
  const [interactionHistory, setInteractionHistory] = useState<InteractionCheckHistory[]>([])

  useEffect(() => {
    setFavoriteSlugs(readStorage<string[]>(FAVORITE_HERBS_KEY, []))
    setRecentStacks(readStorage<RecentStackPlan[]>(RECENT_STACKS_KEY, []))
    setInteractionHistory(readStorage<InteractionCheckHistory[]>(INTERACTION_HISTORY_KEY, []))
  }, [])

  useEffect(() => {
    if (!herbs.length) return
    const fromQuery = decodeStackPlan(
      searchParams.get(STACK_SHARE_PARAM) ?? searchParams.get('stack')
    )
    const fromStorage = decodeStackPlan(window.localStorage.getItem(LOCAL_STACK_KEY))
    const restored = fromQuery || fromStorage
    if (!restored) return

    const allowedSlugs = new Set(herbs.map(herb => herb.slug?.toLowerCase()).filter(Boolean))
    const cleanSlugs = restored.herbSlugs.filter(slug => allowedSlugs.has(slug))
    if (!cleanSlugs.length) return

    setIntent(restored.intent)
    setSelectedSlugs(cleanSlugs)
    const selectedHerbs = herbs.filter(herb => cleanSlugs.includes((herb.slug || '').toLowerCase()))
    setResult(buildStackOutput(restored.intent, selectedHerbs))
  }, [herbs, searchParams])

  const filteredHerbs = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return herbs.slice(0, 120)
    return herbs
      .filter(herb => {
        const haystack = [herbDisplayName(herb), herb.scientific, herb.effects]
          .flat()
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(q)
      })
      .slice(0, 120)
  }, [herbs, query])

  const selectedHerbs = useMemo(
    () => herbs.filter(herb => selectedSlugs.includes((herb.slug || '').toLowerCase())),
    [herbs, selectedSlugs]
  )

  const favoriteHerbs = useMemo(
    () => herbs.filter(herb => favoriteSlugs.includes((herb.slug || '').toLowerCase())),
    [favoriteSlugs, herbs]
  )

  const suggestedHerbs = useMemo(() => {
    const seedHerbs = selectedHerbs.length ? selectedHerbs : favoriteHerbs
    if (!seedHerbs.length) return []

    const signalSet = new Set(
      seedHerbs.flatMap(herb =>
        [herb.effects, herb.tags]
          .flat()
          .flatMap(item => (Array.isArray(item) ? item : [item]))
          .map(item =>
            String(item || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
      )
    )

    return herbs
      .filter(herb => {
        const slug = (herb.slug || '').toLowerCase()
        return slug && !selectedSlugs.includes(slug)
      })
      .map(herb => {
        const score = [herb.effects, herb.tags]
          .flat()
          .flatMap(item => (Array.isArray(item) ? item : [item]))
          .map(item =>
            String(item || '')
              .trim()
              .toLowerCase()
          )
          .filter(Boolean)
          .reduce((acc, signal) => (signalSet.has(signal) ? acc + 1 : acc), 0)

        return { herb, score }
      })
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 6)
      .map(item => item.herb)
  }, [favoriteHerbs, herbs, selectedHerbs, selectedSlugs])

  const toggleFavoriteHerb = (slug: string) => {
    setFavoriteSlugs(current => {
      const next = current.includes(slug)
        ? current.filter(item => item !== slug)
        : [...current, slug]
      writeStorage(FAVORITE_HERBS_KEY, next)
      return next
    })
  }

  const toggleHerb = (slug: string) => {
    setSelectedSlugs(current =>
      current.includes(slug) ? current.filter(item => item !== slug) : [...current, slug]
    )
  }

  const handleGenerate = () => {
    if (!selectedHerbs.length) return
    const nextResult = buildStackOutput(intent, selectedHerbs)
    setResult(nextResult)

    const plan: StackPlan = { intent, herbSlugs: selectedSlugs }
    const serialized = encodeStackPlan(plan)
    setSearchParams({ [STACK_SHARE_PARAM]: serialized }, { replace: true })
    writeStorage(LOCAL_STACK_KEY, serialized)

    const nextRecentEntry: RecentStackPlan = {
      ...plan,
      id: `${intent}:${[...selectedSlugs].sort().join('|')}`,
      createdAt: new Date().toISOString(),
    }
    setRecentStacks(pushRecentUnique(RECENT_STACKS_KEY, nextRecentEntry, MAX_RECENT_STACKS))

    const historyEntry: InteractionCheckHistory = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      checkedAt: new Date().toISOString(),
      herbSlugs: selectedSlugs,
      warningCount: nextResult.interactionWarnings.length,
    }
    setInteractionHistory(
      pushRecentUnique(INTERACTION_HISTORY_KEY, historyEntry, MAX_INTERACTION_HISTORY)
    )
  }

  const applyRecentStack = (stack: RecentStackPlan) => {
    setIntent(stack.intent)
    setSelectedSlugs(stack.herbSlugs)
    const selected = herbs.filter(herb => stack.herbSlugs.includes((herb.slug || '').toLowerCase()))
    setResult(buildStackOutput(stack.intent, selected))
    setSearchParams({ [STACK_SHARE_PARAM]: encodeStackPlan(stack) }, { replace: true })
  }

  const handleCopyShareLink = async () => {
    const serialized = encodeStackPlan({ intent, herbSlugs: selectedSlugs })
    const shareLink = `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}?${STACK_SHARE_PARAM}=${serialized}`
    try {
      await navigator.clipboard.writeText(shareLink)
      setShareStatus('copied')
      window.setTimeout(() => setShareStatus('idle'), 1800)
    } catch {
      window.prompt('Copy stack link', shareLink)
    }
  }
  const shareLink =
    typeof window === 'undefined'
      ? ''
      : `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}?${STACK_SHARE_PARAM}=${encodeStackPlan(
          {
            intent,
            herbSlugs: selectedSlugs,
          }
        )}`
  const encodedShareLink = encodeURIComponent(shareLink)
  const shareText = encodeURIComponent('Custom herb stack from The Hippie Scientist')

  const exportPdf = () => {
    if (!result) return
    const doc = new jsPDF()
    const herbNames = result.selectedHerbs.map(herb => `• ${herbDisplayName(herb)}`)
    const lines = [
      `Intent: ${result.intentLabel}`,
      '',
      'Selected Herbs:',
      ...herbNames,
      '',
      'Recommended Timing:',
      ...result.timing.map(line => `• ${line}`),
      '',
      'Preparation & Usage Notes:',
      ...(result.usageNotes.length
        ? result.usageNotes.map(note => `• ${note}`)
        : ['• No preparation-specific notes were found in this herb data.']),
      '',
      'Dosage Guidance:',
      `• Light: ${result.dosage.light}`,
      `• Moderate: ${result.dosage.moderate}`,
      `• Strong: ${result.dosage.strong}`,
      '',
      'Safety Notes:',
      ...result.safetyNotes.map(note => `• ${note}`),
      '',
      'Interaction Warnings:',
      ...result.interactionWarnings.map(note => `• ${note}`),
    ]

    const wrapped = doc.splitTextToSize(lines.join('\n'), 180)
    doc.setFontSize(11)
    doc.text(wrapped, 14, 18)
    doc.save(`blend-summary-${intent}.pdf`)
  }

  const handleLeadSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setLeadStatus('loading')
    setLeadMessage('')

    const submitResult = await submitLeadCapture({
      email: leadEmail,
      source: 'stack-builder',
      context: 'stack-output',
    })

    if (!submitResult.ok) {
      setLeadStatus('error')
      setLeadMessage(submitResult.message || 'Please check your email and try again.')
      return
    }

    setLeadStatus('success')
    setLeadMessage('You’re in. We’ll send safer combinations and practical updates.')
    setLeadEmail('')
  }

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
      <Meta
        title='Personalized Herb Stack Builder'
        description='Select herbs, choose an intent, and generate timing, dosage guidance, safety notes, and interaction warnings.'
        path='/build'
        noindex
      />
      <header className='space-y-2'>
        <p className='text-xs uppercase tracking-[0.25em] text-cyan-300'>Build</p>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>
          Personalized Herb Stack Builder
        </h1>
        <p className='max-w-2xl text-sm text-slate-300 sm:text-base'>
          Choose your intent, select multiple herbs, and export a clean plan with timing, dosage
          ranges, safety notes, and interaction warnings.
        </p>
      </header>

      <Card className='space-y-5 rounded-2xl p-5 sm:p-6'>
        <section className='space-y-3'>
          <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>
            Step 1 · Define Intent
          </p>
          <div className='grid gap-3 sm:grid-cols-3'>
            {(Object.keys(INTENT_COPY) as StackIntent[]).map(item => {
              const isSelected = intent === item
              return (
                <button
                  key={item}
                  type='button'
                  onClick={() => setIntent(item)}
                  className={`rounded-xl border px-3 py-4 text-left text-sm transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-300 bg-cyan-500/20 text-cyan-100'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-cyan-500/50'
                  }`}
                >
                  <span className='text-base font-semibold'>{INTENT_COPY[item].label}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section className='space-y-3'>
          <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>
            Step 2 · Select Herbs
          </p>
          <input
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder='Search herbs by name, scientific name, or effects'
            className='w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500'
          />
          <div className='max-h-80 space-y-2 overflow-auto rounded-xl border border-slate-700/80 p-3'>
            {filteredHerbs.map(herb => {
              const slug = (herb.slug || '').toLowerCase()
              const checked = selectedSlugs.includes(slug)
              const favorite = favoriteSlugs.includes(slug)
              return (
                <label
                  key={slug}
                  className='flex cursor-pointer items-center gap-3 rounded-lg border border-slate-700/70 bg-slate-900/50 p-2 text-sm text-slate-100'
                >
                  <input type='checkbox' checked={checked} onChange={() => toggleHerb(slug)} />
                  <span className='flex-1'>{herbDisplayName(herb)}</span>
                  <button
                    type='button'
                    onClick={event => {
                      event.preventDefault()
                      toggleFavoriteHerb(slug)
                    }}
                    className={`rounded-md border px-2 py-0.5 text-xs ${
                      favorite
                        ? 'border-amber-300/60 bg-amber-500/20 text-amber-100'
                        : 'border-white/20 text-slate-300'
                    }`}
                  >
                    {favorite ? '★ Saved' : '☆ Save'}
                  </button>
                </label>
              )
            })}
          </div>
          <div className='flex flex-wrap items-center gap-2'>
            <p className='text-xs text-slate-300'>Selected: {selectedSlugs.length} herb(s)</p>
            <p className='text-xs text-slate-400'>Saved herbs: {favoriteSlugs.length}</p>
            <Button
              type='button'
              variant='ghost'
              onClick={() => {
                if (!favoriteSlugs.length) return
                setSelectedSlugs(current => Array.from(new Set([...current, ...favoriteSlugs])))
              }}
              disabled={!favoriteSlugs.length}
            >
              Add saved herbs
            </Button>
          </div>
        </section>

        <div className='flex flex-wrap items-center gap-2'>
          <Button
            type='button'
            variant='primary'
            onClick={handleGenerate}
            disabled={!selectedHerbs.length}
          >
            Step 3 · Generate Stack Output
          </Button>
          <Button
            type='button'
            variant='ghost'
            onClick={() => {
              setSelectedSlugs([])
              setResult(null)
              setSearchParams({}, { replace: true })
              removeStorage(LOCAL_STACK_KEY)
            }}
          >
            Reset
          </Button>
        </div>
      </Card>

      <Card className='space-y-3 rounded-2xl p-5 sm:p-6'>
        <div className='flex items-center justify-between gap-2'>
          <h2 className='text-lg font-semibold text-white'>Recent stacks</h2>
          <p className='text-xs text-slate-400'>Saved on this device</p>
        </div>
        {recentStacks.length === 0 ? (
          <p className='text-sm text-slate-300'>
            No recent stacks yet. Generate one and it will appear here for quick resume.
          </p>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
            {recentStacks.map(stack => (
              <button
                key={stack.id}
                type='button'
                onClick={() => applyRecentStack(stack)}
                className='rounded-xl border border-slate-700/80 bg-slate-900/60 p-3 text-left text-sm text-slate-100 hover:border-cyan-500/60'
              >
                <p className='font-semibold text-cyan-200'>
                  {INTENT_COPY[stack.intent].label} stack
                </p>
                <p className='mt-1 text-xs text-slate-300'>
                  {stack.herbSlugs.length} herbs selected
                </p>
                <p className='mt-1 text-xs text-slate-400'>
                  {new Date(stack.createdAt).toLocaleString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </Card>

      <Card className='space-y-3 rounded-2xl p-5 sm:p-6'>
        <h2 className='text-lg font-semibold text-white'>You might also like</h2>
        <p className='text-sm text-slate-300'>
          Suggestions are based on overlap with your currently selected or saved herbs.
        </p>
        {suggestedHerbs.length === 0 ? (
          <p className='text-sm text-slate-400'>
            Save or select herbs to unlock personalized suggestions.
          </p>
        ) : (
          <div className='grid gap-2 sm:grid-cols-2'>
            {suggestedHerbs.map(herb => {
              const slug = (herb.slug || '').toLowerCase()
              return (
                <div
                  key={slug}
                  className='flex items-center justify-between rounded-xl border border-slate-700/80 bg-slate-900/60 p-3'
                >
                  <span className='text-sm text-slate-100'>{herbDisplayName(herb)}</span>
                  <Button type='button' variant='ghost' onClick={() => toggleHerb(slug)}>
                    Add
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      <section className='space-y-4'>
        <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>
          Step 4 · Personalized Output
        </p>
        {!result ? (
          <Card className='rounded-2xl border border-white/10 p-6 text-sm text-slate-300'>
            Select at least one herb and generate your personalized stack output.
          </Card>
        ) : (
          <div className='space-y-4'>
            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Blend Summary</h2>
              <p className='mt-2 text-sm text-slate-300'>
                Goal: <span className='font-medium text-slate-100'>{result.intentLabel}</span>
              </p>
            </Card>

            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Recommended Usage Timing</h2>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200'>
                {result.timing.map(item => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Preparation & Usage Notes</h2>
              {result.usageNotes.length ? (
                <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200'>
                  {result.usageNotes.map(note => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : (
                <p className='mt-3 text-sm text-slate-300'>
                  No preparation-specific notes were found in this herb data.
                </p>
              )}
            </Card>

            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Dosage Guidance</h2>
              <ul className='mt-3 space-y-2 text-sm text-slate-200'>
                <li>
                  <strong>Light:</strong> {result.dosage.light}
                </li>
                <li>
                  <strong>Moderate:</strong> {result.dosage.moderate}
                </li>
                <li>
                  <strong>Strong:</strong> {result.dosage.strong}
                </li>
              </ul>
            </Card>

            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Safety Notes</h2>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200'>
                {result.safetyNotes.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-2xl border border-amber-400/40 bg-amber-500/10 p-5'>
              <h2 className='text-lg font-semibold text-amber-100'>Interaction Warnings</h2>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-amber-50'>
                {result.interactionWarnings.map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-2xl p-5'>
              <h2 className='text-lg font-semibold text-white'>Selected Herbs</h2>
              <ul className='mt-3 list-disc space-y-1 pl-5 text-sm text-slate-200'>
                {result.selectedHerbs.map(herb => (
                  <li key={herb.slug}>{herbDisplayName(herb)}</li>
                ))}
              </ul>
            </Card>

            <Card className='rounded-2xl p-5'>
              <div className='flex flex-wrap items-center gap-2'>
                <Button type='button' variant='default' onClick={handleCopyShareLink}>
                  Copy Share Link
                </Button>
                <Button type='button' variant='primary' onClick={exportPdf}>
                  Export Blend
                </Button>
                <Button type='button' variant='ghost' onClick={() => window.print()}>
                  Print Summary
                </Button>
                {shareStatus === 'copied' ? (
                  <p className='text-xs text-emerald-300'>Link copied.</p>
                ) : null}
              </div>
              <div className='mt-3 flex flex-wrap gap-2 text-xs'>
                <a
                  href={`https://twitter.com/intent/tweet?text=${shareText}&url=${encodedShareLink}`}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
                >
                  Share on X
                </a>
                <a
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodedShareLink}`}
                  target='_blank'
                  rel='noreferrer'
                  className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
                >
                  Share on Facebook
                </a>
              </div>
            </Card>

            <Card className='rounded-2xl border border-cyan-300/25 bg-cyan-500/5 p-5'>
              <h2 className='text-lg font-semibold text-white'>
                Get safer combinations and updates
              </h2>
              <p className='mt-1 text-sm text-slate-200'>
                Optional: subscribe for safer combo guidance and stack updates. No spam, just
                practical notes.
              </p>
              <form onSubmit={handleLeadSubmit} className='mt-3 flex flex-col gap-2 sm:flex-row'>
                <label className='sr-only' htmlFor='stack-lead-email'>
                  Email address
                </label>
                <input
                  id='stack-lead-email'
                  type='email'
                  inputMode='email'
                  autoComplete='email'
                  value={leadEmail}
                  onChange={event => setLeadEmail(event.target.value)}
                  placeholder='you@example.com'
                  className='w-full rounded-lg border border-white/20 bg-white/[0.05] px-3 py-2 text-sm text-white placeholder:text-white/45 focus:outline-none focus:ring-2 focus:ring-cyan-200/45'
                  aria-invalid={leadStatus === 'error'}
                  required
                />
                <Button
                  variant='primary'
                  type='submit'
                  disabled={leadStatus === 'loading'}
                  className='whitespace-nowrap px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-70'
                >
                  {leadStatus === 'loading' ? 'Saving…' : 'Get updates'}
                </Button>
              </form>
              {leadStatus === 'error' && (
                <p className='mt-2 text-xs text-rose-200'>{leadMessage}</p>
              )}
              {leadStatus === 'success' && (
                <p className='mt-2 text-xs text-emerald-200'>{leadMessage}</p>
              )}
            </Card>
          </div>
        )}
      </section>

      {interactionHistory.length > 0 && (
        <Card className='rounded-2xl p-5'>
          <h2 className='text-lg font-semibold text-white'>Recent interaction checks</h2>
          <ul className='mt-3 space-y-2 text-sm text-slate-200'>
            {interactionHistory.slice(0, 5).map(item => (
              <li
                key={item.id}
                className='rounded-lg border border-slate-700/70 bg-slate-900/50 p-2'
              >
                Checked {item.herbSlugs.length} herbs · {item.warningCount} warning
                {item.warningCount === 1 ? '' : 's'} ·{' '}
                <span className='text-slate-400'>{new Date(item.checkedAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Disclaimer />
    </main>
  )
}
