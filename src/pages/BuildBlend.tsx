import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { toast } from 'sonner'
import Card from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { recordDevMessage } from '../utils/devMessages'
import {
  downloadStarterPack,
  generateStarterPack,
  getStarterPackFilename,
  saveGeneratedGuide,
} from '../utils/starterPack'
import { useHerbData } from '@/lib/herb-data'
import BundleUpgradeCard from '../components/BundleUpgradeCard'

type Herb = {
  id?: string
  slug?: string
  common?: string
  scientific?: string
  benefits?: string
  intensity?: string
  intensityLabel?: string
  intensityLevel?: string
  effects?: string
  tags?: string[]
  [key: string]: unknown
}

type RatioMode = 'percent' | 'grams'

type BlendRatios = Record<RatioMode, number>

type BlendItem = Herb & {
  key: string
  displayName: string
  ratios: BlendRatios
}

type SavedGoalBlend = {
  goal: string
  blendName: string
  herbs: string[]
  timestamp: string
}

const STARTER_PACK_LINK = 'https://buy.stripe.com/your-link-here'

const PRESETS: Record<string, string[]> = {
  Relaxation: ['Blue Lotus', 'Kava', 'Passionflower'],
  Energy: ['Yerba Mate', 'Guayusa', 'Kola Nut'],
  Lucidity: ['Calea zacatechichi', 'Mugwort', 'Guayusa'],
  Focus: ['Gotu Kola', 'Bacopa monnieri', 'Rhodiola rosea'],
}

type GoalKey = 'calm' | 'focus' | 'sleep'

type GoalRecommendation = {
  key: GoalKey
  label: string
  prompt: string
  blendName: string
  herbs: Array<{
    name: string
    reason: string
  }>
}

const GOAL_RECOMMENDATIONS: GoalRecommendation[] = [
  {
    key: 'calm',
    label: 'Calm / Anxiety',
    prompt: 'Nervous system reset',
    blendName: 'Grounded Calm Starter',
    herbs: [
      {
        name: 'Lemon Balm',
        reason: 'Softens stress spikes and settles mental noise without feeling heavy.',
      },
      {
        name: 'Passionflower',
        reason: 'Supports a calmer mind when thoughts feel loud or restless.',
      },
      {
        name: 'Tulsi',
        reason: 'Adds a steady, uplifting calm so the blend stays balanced.',
      },
    ],
  },
  {
    key: 'focus',
    label: 'Focus / Energy',
    prompt: 'Clear momentum',
    blendName: 'Bright Focus Starter',
    herbs: [
      {
        name: 'Rhodiola rosea',
        reason: 'Helps with mental stamina so focus lasts longer.',
      },
      {
        name: 'Gotu Kola',
        reason: 'Supports clarity and smoother concentration.',
      },
      {
        name: 'Yerba Mate',
        reason: 'Provides a clean lift for alertness and productivity.',
      },
    ],
  },
  {
    key: 'sleep',
    label: 'Sleep / Recovery',
    prompt: 'Evening downshift',
    blendName: 'Night Recovery Starter',
    herbs: [
      {
        name: 'Passionflower',
        reason: 'Eases nighttime tension and helps the mind unwind.',
      },
      {
        name: 'Chamomile',
        reason: 'Brings gentle body calm and bedtime comfort.',
      },
      {
        name: 'Valerian',
        reason: 'Deepens relaxation when you need stronger sleep support.',
      },
    ],
  },
]

const RATIO_SETTINGS: Record<
  RatioMode,
  { label: string; min: number; max: number; step: number; defaultValue: number }
> = {
  percent: {
    label: '%',
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 25,
  },
  grams: {
    label: 'g',
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 5,
  },
}

const MOOD_KEYWORDS: Record<string, string[]> = {
  Calming: ['calm', 'relax', 'soothe', 'sleep', 'anxi', 'seren'],
  Uplifting: ['uplift', 'energ', 'stim', 'motivat', 'focus', 'clarit', 'vital'],
  Dreamy: ['dream', 'lucid', 'vision', 'astral', 'psychedel', 'trance'],
  Grounding: ['ground', 'root', 'center', 'stabil', 'earth'],
}

const potencyRank = (herb: Herb) => {
  const level = String(herb.intensityLevel ?? (herb as any).intensityLevel ?? '').toLowerCase()
  if (!level) return 1
  if (level.includes('strong')) return 3
  if (level.includes('moderate')) return 2
  return 1
}

const getHerbKey = (herb: Herb) =>
  (herb.slug as string) ||
  (herb.id as string) ||
  (herb.common as string) ||
  (herb.scientific as string)

const getHerbName = (herb: Herb) => {
  const base = (herb.common || '').trim()
  if (base) return base
  return (herb.scientific || herb.id || 'Unnamed Herb').trim()
}

export default function BuildBlend() {
  const dataset = useHerbData() as Herb[]
  const [query, setQuery] = useState('')
  const [ratioMode, setRatioMode] = useState<RatioMode>('percent')
  const [blend, setBlend] = useState<BlendItem[]>([])
  const [savedGoalBlends, setSavedGoalBlends] = useState<SavedGoalBlend[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [selectedGoal, setSelectedGoal] = useState<GoalKey | null>(null)
  const [blendSavedMessage, setBlendSavedMessage] = useState(false)
  const [showExploreHerbs, setShowExploreHerbs] = useState(false)
  const [showStarterPackFallback, setShowStarterPackFallback] = useState(false)
  const [showPostCheckoutNote, setShowPostCheckoutNote] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = JSON.parse(window.localStorage.getItem('hs_saved_blends') ?? '[]') as
        | SavedGoalBlend[]
        | Array<Record<string, unknown>>
      if (Array.isArray(saved)) {
        const normalised = saved
          .map(entry => {
            if (!entry || typeof entry !== 'object') return null
            const herbs = Array.isArray((entry as { herbs?: unknown[] }).herbs)
              ? ((entry as { herbs?: unknown[] }).herbs ?? []).filter(
                  herbName => typeof herbName === 'string'
                )
              : []
            if (
              typeof entry.goal !== 'string' ||
              typeof entry.blendName !== 'string' ||
              typeof entry.timestamp !== 'string'
            ) {
              return null
            }
            return {
              goal: entry.goal,
              blendName: entry.blendName,
              herbs: herbs as string[],
              timestamp: entry.timestamp,
            }
          })
          .filter(Boolean) as SavedGoalBlend[]
        setSavedGoalBlends(normalised)
      }
    } catch (error) {
      recordDevMessage('warning', 'Unable to parse saved blends', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('hs_saved_blends', JSON.stringify(savedGoalBlends))
  }, [savedGoalBlends])

  useEffect(() => {
    if (copyState !== 'copied') return
    const timeout = window.setTimeout(() => setCopyState('idle'), 2000)
    return () => window.clearTimeout(timeout)
  }, [copyState])

  const availableHerbs = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase()
    return dataset
      .filter(herb => {
        const key = getHerbKey(herb)
        if (key && blend.some(item => item.key === key)) {
          return false
        }
        if (!lowerQuery) return true
        const haystack = [
          herb.common,
          herb.scientific,
          herb.effects,
          Array.isArray(herb.tags) ? herb.tags.join(' ') : '',
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
        return haystack.includes(lowerQuery)
      })
      .slice(0, 60)
  }, [blend, dataset, query])

  const totalAmount = useMemo(
    () =>
      blend.reduce((total, herb) => {
        const activeValue = herb.ratios[ratioMode]
        return total + (Number.isFinite(activeValue) ? activeValue : 0)
      }, 0),
    [blend, ratioMode]
  )

  const potencyScore = useMemo(() => {
    if (!blend.length) return 0
    const denominator = totalAmount || 1
    const raw = blend.reduce((score, herb) => {
      const contribution = herb.ratios[ratioMode]
      return score + potencyRank(herb) * (Number.isFinite(contribution) ? contribution : 0)
    }, 0)
    return Math.round((raw / denominator) * 10) / 10
  }, [blend, ratioMode, totalAmount])

  const moodInsight = useMemo(() => {
    if (!blend.length) {
      return {
        headline: 'Awaiting your first herb',
        breakdown: 'Add herbs to see the vibe of your blend.',
      }
    }
    const totals = Object.keys(MOOD_KEYWORDS).reduce<Record<string, number>>((acc, key) => {
      acc[key] = 0
      return acc
    }, {})
    const aggregate = blend.reduce((sum, herb) => {
      const weight = herb.ratios[ratioMode]
      if (!Number.isFinite(weight)) return sum
      const text =
        `${herb.effects ?? ''} ${Array.isArray(herb.tags) ? herb.tags.join(' ') : ''}`.toLowerCase()
      Object.entries(MOOD_KEYWORDS).forEach(([label, cues]) => {
        if (cues.some(cue => text.includes(cue))) {
          totals[label] += weight
        }
      })
      return sum + weight
    }, 0)

    if (aggregate === 0) {
      return {
        headline: 'Balanced synergy',
        breakdown: 'No dominant mood cues detected.',
      }
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a)
    const [topLabel, topValue] = sorted[0]
    if (!topValue) {
      return {
        headline: 'Balanced synergy',
        breakdown: 'No dominant mood cues detected.',
      }
    }
    const breakdown = sorted
      .filter(([, value]) => value > 0)
      .map(
        ([label, value]) =>
          `${label} ${(value / aggregate) * 100 >= 1 ? Math.round((value / aggregate) * 100) : ((value / aggregate) * 100).toFixed(1)}%`
      )
      .join(' · ')

    return {
      headline: `${topLabel} leaning blend`,
      breakdown,
    }
  }, [blend, ratioMode])

  const addHerbToBlend = (herb: Herb) => {
    const key = getHerbKey(herb)
    if (!key) return
    setBlend(current => {
      if (current.some(item => item.key === key)) {
        return current
      }
      const displayName = getHerbName(herb)
      const defaultRatios: BlendRatios = {
        percent: RATIO_SETTINGS.percent.defaultValue,
        grams: RATIO_SETTINGS.grams.defaultValue,
      }
      return [
        ...current,
        {
          ...herb,
          key,
          displayName,
          ratios: defaultRatios,
        },
      ]
    })
  }

  const removeHerb = (key: string) => {
    setBlend(current => current.filter(item => item.key !== key))
  }

  const updateRatio = (key: string, value: number) => {
    const settings = RATIO_SETTINGS[ratioMode]
    const safeValue = Number.isFinite(value)
      ? Math.min(settings.max, Math.max(settings.min, value))
      : settings.defaultValue
    setBlend(current =>
      current.map(item => {
        if (item.key !== key) return item
        return {
          ...item,
          ratios: {
            ...item.ratios,
            [ratioMode]: safeValue,
          },
        }
      })
    )
  }

  const resetBlend = () => {
    setBlend([])
    setActivePreset(null)
  }

  const applyPreset = (name: string) => {
    const presetHerbs = PRESETS[name]
    if (!presetHerbs) return
    const resolved = presetHerbs
      .map(presetName =>
        dataset.find(herb => getHerbName(herb).toLowerCase() === presetName.toLowerCase())
      )
      .filter(Boolean) as Herb[]
    if (!resolved.length) return
    const percentValue = Math.round((100 / resolved.length) * 10) / 10
    const gramsValue = Math.round((15 / resolved.length) * 10) / 10
    setBlend(
      resolved.map(herb => {
        const key = getHerbKey(herb)
        return {
          ...herb,
          key,
          displayName: getHerbName(herb),
          ratios: {
            percent: percentValue,
            grams: gramsValue,
          },
        }
      })
    )
    setActivePreset(name)
  }

  const copyFormula = async () => {
    if (!blend.length) return
    const payload = {
      mode: ratioMode,
      items: blend.map(item => ({
        name: item.displayName,
        slug: item.slug,
        intensity: item.intensity,
        [ratioMode]: Number(item.ratios[ratioMode].toFixed(ratioMode === 'percent' ? 0 : 2)),
      })),
    }
    try {
      const serialised = JSON.stringify(payload, null, 2)
      if (typeof navigator === 'undefined' || !navigator.clipboard) {
        if (typeof window !== 'undefined') {
          window.prompt('Copy your blend formula', serialised)
        }
      } else {
        await navigator.clipboard.writeText(serialised)
        setCopyState('copied')
        toast.success('Blend formula copied to clipboard!')
      }
    } catch (error) {
      recordDevMessage('error', 'Clipboard copy failed', error)
    }
  }

  const saveRecommendedBlend = () => {
    if (!selectedRecommendation) return
    const entry: SavedGoalBlend = {
      goal: selectedRecommendation.label,
      blendName: selectedRecommendation.blendName,
      herbs: selectedRecommendation.herbs.map(herb => herb.name),
      timestamp: new Date().toISOString(),
    }
    const comparisonKey = JSON.stringify({
      goal: entry.goal,
      blendName: entry.blendName,
      herbs: entry.herbs,
    })
    setSavedGoalBlends(current => {
      const deduped = current.filter(saved => {
        const savedKey = JSON.stringify({
          goal: saved.goal,
          blendName: saved.blendName,
          herbs: saved.herbs,
        })
        return savedKey !== comparisonKey
      })
      return [entry, ...deduped]
    })
    setBlendSavedMessage(true)
  }

  const selectedRecommendation = useMemo(
    () => GOAL_RECOMMENDATIONS.find(goal => goal.key === selectedGoal) ?? null,
    [selectedGoal]
  )

  const applyGoalRecommendation = (goal: GoalRecommendation) => {
    setSelectedGoal(goal.key)
    setBlendSavedMessage(false)
    setShowExploreHerbs(false)
    const resolved = goal.herbs
      .map(entry =>
        dataset.find(herb => getHerbName(herb).toLowerCase() === entry.name.toLowerCase())
      )
      .filter(Boolean) as Herb[]
    if (!resolved.length) return
    const percentValue = Math.round((100 / resolved.length) * 10) / 10
    const gramsValue = Math.round((15 / resolved.length) * 10) / 10
    setBlend(
      resolved.map(herb => ({
        ...herb,
        key: getHerbKey(herb),
        displayName: getHerbName(herb),
        ratios: {
          percent: percentValue,
          grams: gramsValue,
        },
      }))
    )
    setActivePreset(null)
  }

  const clearSavedBlends = () => setSavedGoalBlends([])

  const handleStarterPackCheckout = () => {
    if (!selectedRecommendation || typeof window === 'undefined') return

    const payload = {
      goal: selectedRecommendation.label,
      blendName: selectedRecommendation.blendName,
      herbs: selectedRecommendation.herbs.map(herb => herb.name),
      timestamp: new Date().toISOString(),
    }

    try {
      window.localStorage.setItem('hs_last_selected_blend', JSON.stringify(payload))
    } catch (error) {
      recordDevMessage('warning', 'Unable to store selected blend for Starter Pack checkout', error)
    }

    let didDownloadStarterPack = false
    try {
      const starterPackContent = generateStarterPack({
        goal: selectedRecommendation.label,
        blendName: selectedRecommendation.blendName,
        herbs: selectedRecommendation.herbs.map(herb => ({
          name: herb.name,
          purpose: herb.reason,
          effect: herb.reason,
        })),
      })

      saveGeneratedGuide({
        goal: selectedRecommendation.label,
        blendName: selectedRecommendation.blendName,
        herbs: selectedRecommendation.herbs.map(herb => herb.name),
        filename: getStarterPackFilename(selectedRecommendation.blendName),
        content: starterPackContent,
      })

      didDownloadStarterPack = downloadStarterPack(
        selectedRecommendation.blendName,
        starterPackContent
      )
    } catch (error) {
      recordDevMessage('warning', 'Unable to generate Starter Pack download', error)
    }

    if (!didDownloadStarterPack) {
      toast.message('Your guide will be available on the next screen')
    }

    const checkoutWindow = window.open(STARTER_PACK_LINK, '_blank', 'noopener,noreferrer')
    setShowPostCheckoutNote(true)
    if (checkoutWindow) {
      checkoutWindow.opener = null
      setShowStarterPackFallback(false)
      return
    }

    setShowStarterPackFallback(true)
    toast.error('Popup blocked. Use the secure checkout link below.')
  }

  const recommendedHerbLinks = useMemo(() => {
    if (!selectedRecommendation) return []
    return selectedRecommendation.herbs.map(entry => {
      const matched = dataset.find(
        herb => getHerbName(herb).toLowerCase() === entry.name.toLowerCase()
      )
      const slug = typeof matched?.slug === 'string' ? matched.slug : ''
      return {
        name: entry.name,
        href: slug ? `/herb/${slug}` : '/herbs',
      }
    })
  }, [dataset, selectedRecommendation])

  return (
    <main className='container space-y-6 py-8'>
      <header className='space-y-3'>
        <p className='text-sub text-xs uppercase tracking-[0.3em]'>Experimental Mixer</p>
        <h1 className='h1-grad text-3xl font-semibold md:text-4xl'>Build a Blend</h1>
        <p className='text-sub max-w-2xl'>
          Curate herbs, adjust their ratios in percentages or grams, and watch potency and mood
          predictions update instantly.
        </p>
      </header>

      <section className='border-border/80 from-brand-lime/10 via-panel to-brand-lime/5 space-y-4 rounded-2xl border bg-gradient-to-br p-4 shadow-[0_0_0_1px_rgba(163,230,53,0.05),0_16px_36px_-22px_rgba(163,230,53,0.7)] sm:p-5'>
        <div className='space-y-2'>
          <h2 className='text-text text-xl font-semibold sm:text-2xl'>
            Let’s build your first blend
          </h2>
          <p className='text-sub max-w-2xl text-sm sm:text-base'>
            Answer a few quick questions and we’ll suggest a simple starting blend.
          </p>
        </div>

        <div className='grid gap-3 sm:grid-cols-3'>
          {GOAL_RECOMMENDATIONS.map(goal => {
            const isActive = selectedGoal === goal.key
            return (
              <button
                key={goal.key}
                onClick={() => applyGoalRecommendation(goal)}
                className={`rounded-xl border p-4 text-left transition ${
                  isActive
                    ? 'border-brand-lime/60 bg-brand-lime/15 shadow-[0_0_24px_-14px_rgba(163,230,53,0.9)]'
                    : 'border-border/80 bg-panel/70 hover:border-brand-lime/40 hover:bg-brand-lime/10'
                }`}
              >
                <p className='text-text font-semibold'>{goal.label}</p>
                <p className='text-sub mt-1 text-xs'>{goal.prompt}</p>
              </button>
            )
          })}
        </div>

        {selectedRecommendation && (
          <Card className='border-brand-lime/30 space-y-4 bg-black/20 p-4'>
            <div>
              <p className='text-sub text-xs uppercase tracking-wide'>Recommended starter</p>
              <h3 className='text-text mt-1 text-lg font-semibold'>
                {selectedRecommendation.blendName}
              </h3>
            </div>
            <ul className='space-y-3'>
              {selectedRecommendation.herbs.map(herb => (
                <li key={herb.name} className='border-border/70 bg-panel/60 rounded-lg border p-3'>
                  <p className='text-text text-sm font-semibold'>{herb.name}</p>
                  <p className='text-sub mt-1 text-xs'>{herb.reason}</p>
                </li>
              ))}
            </ul>
            <section className='border-brand-lime/40 from-brand-lime/16 to-panel/95 relative space-y-4 overflow-hidden rounded-xl border bg-gradient-to-br p-4 shadow-[0_0_0_1px_rgba(163,230,53,0.12),0_12px_34px_-18px_rgba(163,230,53,0.9)]'>
              <div className='from-brand-lime/18 via-brand-lime/6 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
              <div className='relative z-10 space-y-4'>
                <div>
                  <h4 className='text-text text-lg font-semibold'>Starter Pack</h4>
                  <p className='text-sub mt-1 text-sm'>
                    Everything you need to try this blend safely and simply.
                  </p>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2 rounded-lg border border-white/10 bg-black/20 p-3'>
                    <p className='text-text text-sm font-semibold'>What&apos;s included</p>
                    <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                      {selectedRecommendation.herbs.map(herb => (
                        <li key={`${herb.name}-starter`}>{herb.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className='space-y-2 rounded-lg border border-white/10 bg-black/20 p-3'>
                    <p className='text-text text-sm font-semibold'>Simple prep</p>
                    <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                      <li>1 tsp dried herb blend</li>
                      <li>Steep 10–15 minutes</li>
                      <li>Drink 1–2x daily</li>
                    </ul>
                  </div>
                </div>

                <div className='space-y-2 rounded-lg border border-white/10 bg-black/20 p-3'>
                  <p className='text-text text-sm font-semibold'>Why this works</p>
                  <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                    {selectedRecommendation.herbs.slice(0, 3).map(herb => (
                      <li key={`${herb.name}-why`}>
                        {herb.name}: {herb.reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='flex flex-col gap-3 rounded-lg border border-white/10 bg-black/20 p-3 sm:flex-row sm:items-center sm:justify-between'>
                  <p className='text-text text-base font-semibold'>
                    Starter Pack (Digital Guide): $9
                  </p>
                  <div className='flex flex-col items-start gap-1 sm:items-end'>
                    <Button
                      onClick={handleStarterPackCheckout}
                      className='border-brand-lime/40 bg-brand-lime/20 text-brand-lime hover:bg-brand-lime/30 min-w-[190px] justify-center border shadow-[0_0_24px_-12px_rgba(163,230,53,0.95)]'
                    >
                      Get Starter Pack
                    </Button>
                    <p className='text-sub text-xs'>Secure checkout • Instant access</p>
                    <Link to='/downloads' className='text-brand-lime text-xs hover:underline'>
                      My Guides
                    </Link>
                  </div>
                </div>
                {showPostCheckoutNote && (
                  <p className='text-sub rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs'>
                    After checkout, come back here for your next steps. You can also open{' '}
                    <Link
                      to='/starter-pack-success'
                      className='text-brand-lime font-medium hover:underline'
                    >
                      your handoff page
                    </Link>
                    .
                  </p>
                )}
                {showStarterPackFallback && (
                  <p className='text-sub rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-xs'>
                    Your guide will be available on the next screen. Popup blocked?{' '}
                    <a
                      href={STARTER_PACK_LINK}
                      target='_blank'
                      rel='noreferrer'
                      className='text-brand-lime font-medium hover:underline'
                    >
                      Continue to secure checkout
                    </a>
                    .
                  </p>
                )}
              </div>
            </section>

            <BundleUpgradeCard
              sourcePage='build'
              currentBlendName={selectedRecommendation.blendName}
            />

            <div className='flex flex-col gap-2 sm:flex-row'>
              <Button
                onClick={saveRecommendedBlend}
                disabled={!blend.length}
                className='flex-1 justify-center'
              >
                Save this blend
              </Button>
              <Button
                onClick={() => setShowExploreHerbs(current => !current)}
                variant='ghost'
                className='flex-1 justify-center'
              >
                Explore these herbs
              </Button>
            </div>
            {blendSavedMessage && <p className='text-brand-lime text-xs'>Blend saved ✓</p>}
            {showExploreHerbs && (
              <ul className='space-y-2'>
                {recommendedHerbLinks.map(herb => (
                  <li key={herb.name} className='text-sm'>
                    <Link className='text-brand-lime hover:underline' to={herb.href}>
                      {herb.name}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        )}
      </section>

      <section className='grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start'>
        <div className='space-y-6'>
          <Card className='flex flex-col gap-4 p-5'>
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <div className='flex flex-wrap gap-2'>
                {Object.keys(PRESETS).map(preset => (
                  <Button
                    key={preset}
                    onClick={() => applyPreset(preset)}
                    variant={activePreset === preset ? 'primary' : 'default'}
                    className={`px-3 py-1 text-xs ${activePreset === preset ? 'text-brand-lime' : 'text-sub'}`}
                  >
                    {preset}
                  </Button>
                ))}
                {!!blend.length && (
                  <Button
                    onClick={resetBlend}
                    variant='ghost'
                    className='text-sub hover:text-text px-3 py-1 text-xs'
                  >
                    Clear blend
                  </Button>
                )}
              </div>
              <div className='border-border bg-panel text-sub flex items-center gap-2 rounded-full border p-1 text-xs font-medium'>
                {(Object.keys(RATIO_SETTINGS) as RatioMode[]).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setRatioMode(mode)}
                    className={`rounded-full px-3 py-1 transition ${
                      ratioMode === mode ? 'bg-brand-lime/25 text-text' : 'hover:bg-white/10'
                    }`}
                  >
                    {mode === 'percent' ? '% ratios' : 'Grams'}
                  </button>
                ))}
              </div>
            </div>

            <div className='relative'>
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder='Search herbs by name, effects, or vibe'
                className='border-border bg-panel text-text placeholder:text-sub/70 focus:border-brand-lime/60 focus:ring-brand-lime/20 w-full rounded-xl border px-4 py-3 text-sm focus:outline-none focus:ring-2'
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className='text-sub hover:text-text absolute inset-y-0 right-3 flex items-center text-xs transition'
                >
                  Clear
                </button>
              )}
            </div>

            {!!availableHerbs.length && (
              <div className='flex flex-wrap gap-2'>
                {availableHerbs.map(herb => (
                  <button
                    key={getHerbKey(herb)}
                    onClick={() => addHerbToBlend(herb)}
                    className='badge hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-text'
                  >
                    {getHerbName(herb)}
                  </button>
                ))}
              </div>
            )}
          </Card>

          <section className='space-y-4'>
            {!blend.length && (
              <Card className='text-sub border-dashed p-6 text-center text-sm'>
                Use search or presets to start building your signature blend.
              </Card>
            )}
            {blend.map(herb => {
              const settings = RATIO_SETTINGS[ratioMode]
              const value = Number(herb.ratios[ratioMode].toFixed(ratioMode === 'percent' ? 0 : 2))
              return (
                <Card key={herb.key} className='space-y-4 p-5'>
                  <div className='flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between'>
                    <div className='space-y-2'>
                      <p className='text-sub text-xs uppercase tracking-wide'>Herb</p>
                      <h2 className='text-text text-lg font-semibold'>{herb.displayName}</h2>
                      {(herb.intensityLabel || herb.intensityLevel || herb.intensity) && (
                        <Badge className='text-xs uppercase tracking-wide'>
                          INTENSITY:{' '}
                          {herb.intensityLabel ||
                            (typeof herb.intensityLevel === 'string'
                              ? `${herb.intensityLevel.charAt(0).toUpperCase()}${herb.intensityLevel.slice(1)}`
                              : 'Unknown')}
                          .
                        </Badge>
                      )}
                      {herb.benefits && <p className='text-sub text-xs'>{herb.benefits}</p>}
                      {herb.effects && (
                        <p className='text-sub text-xs'>
                          {herb.effects.substring(0, 160)}
                          {herb.effects.length > 160 ? '…' : ''}
                        </p>
                      )}
                    </div>
                    <div className='flex items-center gap-2'>
                      <Badge className='text-xs'>{settings.label}</Badge>
                      <Button
                        variant='ghost'
                        onClick={() => removeHerb(herb.key)}
                        className='text-sub hover:text-text px-3 py-1 text-xs'
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className='space-y-3'>
                    <input
                      type='range'
                      min={settings.min}
                      max={settings.max}
                      step={settings.step}
                      value={value}
                      onChange={event => updateRatio(herb.key, Number(event.target.value))}
                      className='accent-brand-lime w-full'
                    />
                    <div className='text-sub flex items-center justify-between text-xs'>
                      <span>
                        {settings.min}
                        {settings.label}
                      </span>
                      <div className='flex items-center gap-2'>
                        <input
                          type='number'
                          value={value}
                          onChange={event => updateRatio(herb.key, Number(event.target.value))}
                          className='border-border bg-panel text-text focus:border-brand-lime/60 w-16 rounded-lg border px-2 py-1 text-right text-xs focus:outline-none'
                        />
                        <span className='text-text font-semibold'>{settings.label}</span>
                      </div>
                      <span>
                        {settings.max}
                        {settings.label}
                      </span>
                    </div>
                  </div>
                </Card>
              )
            })}
          </section>
        </div>

        <aside className='space-y-6'>
          <Card className='space-y-4 p-5'>
            <h2 className='text-sub text-sm font-semibold uppercase tracking-wide'>
              Blend telemetry
            </h2>
            <div className='text-sub space-y-3 text-sm'>
              <div className='flex items-center justify-between'>
                <span>Total herbs</span>
                <span className='text-text font-semibold'>{blend.length}</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Total {ratioMode === 'percent' ? 'ratio' : 'weight'}</span>
                <span className='text-text font-semibold'>
                  {ratioMode === 'percent'
                    ? `${totalAmount.toFixed(0)}%`
                    : `${totalAmount.toFixed(1)} g`}
                </span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Potency score</span>
                <span className='text-text font-semibold'>{potencyScore.toFixed(1)}</span>
              </div>
            </div>
            <div className='border-border bg-panel text-sub rounded-xl border p-4 text-sm'>
              <p className='text-sub/70 text-xs uppercase tracking-wide'>Mood projection</p>
              <p className='text-text mt-1 text-base font-semibold'>{moodInsight.headline}</p>
              <p className='text-sub mt-1 text-xs'>{moodInsight.breakdown}</p>
            </div>
            <div className='flex flex-wrap gap-3 text-sm'>
              <Button
                onClick={copyFormula}
                className='flex-1 justify-center'
                disabled={!blend.length}
              >
                {copyState === 'copied' ? 'Copied!' : 'Copy formula'}
              </Button>
            </div>
          </Card>
        </aside>
      </section>

      <section className='space-y-3'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-sub text-sm font-semibold uppercase tracking-wide'>Saved blends</h2>
          {!!savedGoalBlends.length && (
            <Button onClick={clearSavedBlends} variant='ghost' className='px-3 py-1 text-xs'>
              Clear saved blends
            </Button>
          )}
        </div>
        {!savedGoalBlends.length ? (
          <Card className='text-sub border-dashed p-4 text-sm'>No saved blends yet.</Card>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {savedGoalBlends.slice(0, 3).map(saved => (
              <Card key={`${saved.timestamp}-${saved.blendName}`} className='space-y-2 p-4'>
                <p className='text-text text-sm font-semibold'>{saved.blendName}</p>
                <p className='text-sub text-xs'>Goal: {saved.goal}</p>
                <p className='text-sub text-xs'>Herbs: {saved.herbs.join(', ')}</p>
              </Card>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
