import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
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
import ResultsSummaryCard from '../components/ResultsSummaryCard'

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
type TimeOfDay = 'morning' | 'afternoon' | 'evening'
type IntensityPreference = 'gentle' | 'balanced' | 'stronger'

type QuizHistoryEntry = {
  goal: GoalKey
  timeOfDay: TimeOfDay
  intensity: IntensityPreference
  recommendedBlend: string
  timestamp: string
}

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
    blendName: 'Calm Blend',
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
    blendName: 'Focus Blend',
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
    blendName: 'Sleep Blend',
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
  const location = useLocation()
  const dataset = useHerbData() as Herb[]
  const [query, setQuery] = useState('')
  const [ratioMode, setRatioMode] = useState<RatioMode>('percent')
  const [blend, setBlend] = useState<BlendItem[]>([])
  const [savedGoalBlends, setSavedGoalBlends] = useState<SavedGoalBlend[]>([])
  const [activePreset, setActivePreset] = useState<string | null>(null)
  const [copyState, setCopyState] = useState<'idle' | 'copied'>('idle')
  const [selectedGoal, setSelectedGoal] = useState<GoalKey | null>(null)
  const [quizGoal, setQuizGoal] = useState<GoalKey | null>(null)
  const [quizTimeOfDay, setQuizTimeOfDay] = useState<TimeOfDay | null>(null)
  const [quizIntensity, setQuizIntensity] = useState<IntensityPreference | null>(null)
  const [quizRecommendationMessage, setQuizRecommendationMessage] = useState('')
  const [blendSavedMessage, setBlendSavedMessage] = useState(false)
  const [showExploreHerbs, setShowExploreHerbs] = useState(false)
  const [showStarterPackFallback, setShowStarterPackFallback] = useState(false)
  const [showPostCheckoutNote, setShowPostCheckoutNote] = useState(false)
  const [didLoadSharedBlend, setDidLoadSharedBlend] = useState(false)

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

  const resolveQuizRecommendation = (
    goal: GoalKey,
    timeOfDay: TimeOfDay,
    intensity: IntensityPreference
  ) => {
    if (goal === 'calm' && timeOfDay === 'evening') {
      return {
        key: 'calm' as GoalKey,
        message: 'Calm evenings pair best with a soothing downshift profile.',
      }
    }
    if (goal === 'focus' && timeOfDay === 'morning') {
      return {
        key: 'focus' as GoalKey,
        message: 'Morning focus works best with a clear, uplifting start.',
      }
    }
    if (goal === 'sleep' && timeOfDay === 'evening') {
      return {
        key: 'sleep' as GoalKey,
        message: 'Evening sleep support points to a deeper unwind blend.',
      }
    }

    if (goal === 'sleep') {
      return {
        key: 'sleep' as GoalKey,
        message: 'Your answers are closest to bedtime support, so we matched you to Sleep Blend.',
      }
    }
    if (goal === 'calm' || timeOfDay === 'evening') {
      return {
        key: 'calm' as GoalKey,
        message: 'Your answers lean toward steady calm, so Calm Blend is the closest fit.',
      }
    }
    if (goal === 'focus' || timeOfDay === 'morning' || intensity === 'stronger') {
      return {
        key: 'focus' as GoalKey,
        message:
          'Your answers lean toward momentum and clarity, so Focus Blend is the closest fit.',
      }
    }
    return {
      key: goal,
      message: 'We matched the blend closest to your goal and preferred feel.',
    }
  }

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

  useEffect(() => {
    if (didLoadSharedBlend || !dataset.length) return
    const params = new URLSearchParams(location.search)
    const goalParam = params.get('goal')?.trim().toLowerCase() ?? ''
    const herbsParam = params.get('herbs')?.trim() ?? ''

    if (!goalParam && !herbsParam) {
      setDidLoadSharedBlend(true)
      return
    }

    const matchedGoal = GOAL_RECOMMENDATIONS.find(goal => goal.key === goalParam)
    if (matchedGoal) {
      applyGoalRecommendation(matchedGoal)
    }

    if (herbsParam) {
      const requested = herbsParam
        .split(',')
        .map(item => item.trim().toLowerCase())
        .filter(Boolean)

      const resolved = requested
        .map(item => {
          const nameLike = item.replace(/-/g, ' ')
          return dataset.find(herb => {
            const slug = String(herb.slug ?? '')
              .trim()
              .toLowerCase()
            const display = getHerbName(herb).trim().toLowerCase()
            return slug === item || display === nameLike
          })
        })
        .filter(Boolean) as Herb[]

      if (resolved.length) {
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
        setQuizRecommendationMessage('Loaded from your shared blend link.')
      }
    }

    setDidLoadSharedBlend(true)
  }, [applyGoalRecommendation, dataset, didLoadSharedBlend, location.search])

  useEffect(() => {
    if (!quizGoal || !quizTimeOfDay || !quizIntensity) return

    const resolved = resolveQuizRecommendation(quizGoal, quizTimeOfDay, quizIntensity)
    const nextRecommendation = GOAL_RECOMMENDATIONS.find(goal => goal.key === resolved.key)
    if (!nextRecommendation) return

    applyGoalRecommendation(nextRecommendation)
    setQuizRecommendationMessage(resolved.message)

    if (typeof window !== 'undefined') {
      try {
        const raw = window.localStorage.getItem('hs_quiz_history')
        const existing = raw ? (JSON.parse(raw) as QuizHistoryEntry[]) : []
        const safeExisting = Array.isArray(existing) ? existing : []
        const entry: QuizHistoryEntry = {
          goal: quizGoal,
          timeOfDay: quizTimeOfDay,
          intensity: quizIntensity,
          recommendedBlend: nextRecommendation.blendName,
          timestamp: new Date().toISOString(),
        }
        window.localStorage.setItem('hs_quiz_history', JSON.stringify([entry, ...safeExisting]))
      } catch (error) {
        recordDevMessage('warning', 'Unable to store quiz history', error)
      }
    }
  }, [quizGoal, quizIntensity, quizTimeOfDay])

  const handleRetakeQuiz = () => {
    setQuizGoal(null)
    setQuizTimeOfDay(null)
    setQuizIntensity(null)
    setQuizRecommendationMessage('')
    setSelectedGoal(null)
    setBlendSavedMessage(false)
    setShowExploreHerbs(false)
    setBlend([])
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

  const hasRecommendation = Boolean(selectedRecommendation)

  return (
    <main className='container space-y-9 py-8 sm:py-10'>
      <header className='space-y-3'>
        <p className='text-sub text-xs uppercase tracking-[0.3em]'>Experimental Mixer</p>
        <h1 className='h1-grad text-3xl font-semibold md:text-4xl'>Build a Blend</h1>
        <p className='text-sub max-w-2xl text-sm leading-relaxed sm:text-base'>
          Curate herbs, adjust their ratios in percentages or grams, and watch potency and mood
          predictions update instantly.
        </p>
      </header>

      <section className='border-white/12 from-brand-lime/12 via-panel to-brand-lime/6 space-y-6 rounded-3xl border bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.06),0_20px_40px_-24px_rgba(163,230,53,0.7)] sm:p-7'>
        <div className='space-y-2'>
          <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
            Step 1: Choose Your Goal
          </p>
          <h2 className='text-text text-xl font-semibold sm:text-2xl'>
            Let’s build your first blend
          </h2>
          <p className='text-sub max-w-2xl text-sm sm:text-base'>
            Answer a few quick questions and we’ll suggest a simple starting blend.
          </p>
        </div>

        <div className='grid gap-3 md:grid-cols-3'>
          <Card className='border-white/10 bg-black/25 p-4'>
            <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>1. Main goal</p>
            <div className='grid gap-2'>
              {(['calm', 'focus', 'sleep'] as GoalKey[]).map(goal => (
                <button
                  key={goal}
                  onClick={() => setQuizGoal(goal)}
                  className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition ${
                    quizGoal === goal
                      ? 'border-brand-lime/60 bg-brand-lime/15 text-text shadow-[0_0_20px_-14px_rgba(163,230,53,0.9)]'
                      : 'border-border/80 bg-panel/70 text-sub hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-text'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </Card>

          <Card className='border-white/10 bg-black/25 p-4'>
            <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>2. Time of day</p>
            <div className='grid gap-2'>
              {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(timeOption => (
                <button
                  key={timeOption}
                  onClick={() => setQuizTimeOfDay(timeOption)}
                  className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition ${
                    quizTimeOfDay === timeOption
                      ? 'border-brand-lime/60 bg-brand-lime/15 text-text shadow-[0_0_20px_-14px_rgba(163,230,53,0.9)]'
                      : 'border-border/80 bg-panel/70 text-sub hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-text'
                  }`}
                >
                  {timeOption}
                </button>
              ))}
            </div>
          </Card>

          <Card className='border-white/10 bg-black/25 p-4'>
            <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>3. Intensity</p>
            <div className='grid gap-2'>
              {(['gentle', 'balanced', 'stronger'] as IntensityPreference[]).map(intensity => (
                <button
                  key={intensity}
                  onClick={() => setQuizIntensity(intensity)}
                  className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition ${
                    quizIntensity === intensity
                      ? 'border-brand-lime/60 bg-brand-lime/15 text-text shadow-[0_0_20px_-14px_rgba(163,230,53,0.9)]'
                      : 'border-border/80 bg-panel/70 text-sub hover:border-brand-lime/40 hover:bg-brand-lime/10 hover:text-text'
                  }`}
                >
                  {intensity}
                </button>
              ))}
            </div>
          </Card>
        </div>

        {!hasRecommendation && (
          <p className='text-sub rounded-xl border border-white/10 bg-black/25 px-3 py-2 text-xs'>
            Start by selecting your goal above. Your blend will appear in Step 2.
          </p>
        )}

        {selectedRecommendation && (
          <Card className='border-brand-lime/30 space-y-4 bg-black/20 p-4 sm:p-5'>
            <div className='space-y-1'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 2: Your Recommended Blend
              </p>
              <p className='text-sub text-xs'>You did it — here is your starting recommendation.</p>
            </div>
            <ResultsSummaryCard
              goal={selectedGoal ?? quizGoal ?? selectedRecommendation.key}
              blendName={selectedRecommendation.blendName}
              explanation={`Based on your answers, this is the simplest place to start. ${quizRecommendationMessage}`}
              herbs={selectedRecommendation.herbs.map(herb => herb.name)}
              variant='expanded'
            />
            <div className='space-y-1'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 3: Upgrade Your Result
              </p>
              <p className='text-sub text-xs'>
                Optional: unlock done-for-you guidance for this recommendation.
              </p>
            </div>
            <section className='border-brand-lime/40 from-brand-lime/16 to-panel/95 relative space-y-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-[0_0_0_1px_rgba(163,230,53,0.12),0_12px_34px_-18px_rgba(163,230,53,0.9)]'>
              <div className='from-brand-lime/18 via-brand-lime/6 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
              <div className='relative z-10 space-y-4'>
                <div>
                  <h4 className='text-text text-lg font-semibold'>Starter Pack</h4>
                  <p className='text-sub mt-1 text-sm'>
                    Everything you need to try this blend safely and simply.
                  </p>
                </div>

                <div className='grid gap-4 md:grid-cols-2'>
                  <div className='space-y-2 rounded-xl border border-white/10 bg-black/20 p-3.5'>
                    <p className='text-text text-sm font-semibold'>What&apos;s included</p>
                    <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                      {selectedRecommendation.herbs.map(herb => (
                        <li key={`${herb.name}-starter`}>{herb.name}</li>
                      ))}
                    </ul>
                  </div>
                  <div className='space-y-2 rounded-xl border border-white/10 bg-black/20 p-3.5'>
                    <p className='text-text text-sm font-semibold'>Simple prep</p>
                    <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                      <li>1 tsp dried herb blend</li>
                      <li>Steep 10–15 minutes</li>
                      <li>Drink 1–2x daily</li>
                    </ul>
                  </div>
                </div>

                <div className='space-y-2 rounded-xl border border-white/10 bg-black/20 p-3.5'>
                  <p className='text-text text-sm font-semibold'>Why this works</p>
                  <ul className='text-sub list-inside list-disc space-y-1 text-sm'>
                    {selectedRecommendation.herbs.slice(0, 3).map(herb => (
                      <li key={`${herb.name}-why`}>
                        {herb.name}: {herb.reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className='flex flex-col gap-3 rounded-xl border border-white/10 bg-black/20 p-3.5 sm:flex-row sm:items-center sm:justify-between'>
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

            <div className='space-y-1'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 5: Save / Download
              </p>
              <p className='text-sub text-xs'>Keep your result for later or continue exploring.</p>
            </div>
            <div className='grid gap-2.5 sm:grid-cols-3'>
              <Button onClick={handleRetakeQuiz} variant='ghost' className='justify-center'>
                Retake Quiz
              </Button>
              <Button
                onClick={saveRecommendedBlend}
                disabled={!blend.length}
                className='justify-center'
              >
                Save this blend
              </Button>
              <Button
                onClick={() => setShowExploreHerbs(current => !current)}
                variant='ghost'
                className='justify-center'
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

      <section
        className={`grid gap-7 lg:grid-cols-[2fr_1fr] lg:items-start ${
          hasRecommendation ? '' : 'opacity-65'
        }`}
      >
        <div className='space-y-6'>
          <Card className='space-y-5 p-5 sm:p-6'>
            <div className='space-y-2'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 4: Customize (Optional)
              </p>
              <p className='text-sub text-[11px] font-semibold uppercase tracking-[0.22em]'>
                Search &amp; select herbs
              </p>
              <p className='text-sub text-xs'>
                Optional step — skip this if your recommended blend already looks good.
              </p>
              <div className='relative'>
                <input
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                  placeholder='Search herbs by name, effects, or vibe'
                  className='bg-white/6 text-text placeholder:text-sub/70 focus:border-brand-lime/55 focus:ring-brand-lime/25 min-h-10 w-full rounded-xl border border-white/15 px-4 py-2.5 text-sm backdrop-blur-md transition-shadow focus:shadow-[0_0_0_1px_rgba(163,230,53,0.2),0_0_26px_-12px_rgba(163,230,53,0.75)] focus:outline-none focus:ring-2'
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
            </div>

            <div className='border-white/12 bg-panel/45 space-y-3 rounded-2xl border p-3.5'>
              <div className='flex flex-wrap items-center justify-between gap-3'>
                <div className='flex flex-wrap gap-2.5'>
                  {Object.keys(PRESETS).map(preset => (
                    <Button
                      key={preset}
                      onClick={() => applyPreset(preset)}
                      variant={activePreset === preset ? 'primary' : 'default'}
                      className={`min-h-8 px-3 text-[11px] font-semibold ${
                        activePreset === preset
                          ? 'border-brand-lime/45 bg-brand-lime/22 text-text shadow-[0_0_18px_-12px_rgba(163,230,53,0.95)]'
                          : 'text-sub opacity-75 hover:opacity-100'
                      }`}
                    >
                      {preset}
                    </Button>
                  ))}
                  {!!blend.length && (
                    <Button
                      onClick={resetBlend}
                      variant='ghost'
                      className='text-sub hover:text-text min-h-8 px-3 text-[11px] font-medium'
                    >
                      Clear blend
                    </Button>
                  )}
                </div>
                <div className='border-border bg-panel text-sub flex items-center gap-1.5 rounded-full border p-1 text-[11px] font-semibold'>
                  {(Object.keys(RATIO_SETTINGS) as RatioMode[]).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setRatioMode(mode)}
                      className={`rounded-full px-3 py-1 transition ${
                        ratioMode === mode
                          ? 'bg-brand-lime/25 text-text shadow-[0_0_18px_-14px_rgba(163,230,53,0.95)]'
                          : 'opacity-80 hover:bg-white/10 hover:opacity-100'
                      }`}
                    >
                      {mode === 'percent' ? '% ratios' : 'Grams'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {!!availableHerbs.length && (
              <div className='max-h-[14.5rem] overflow-y-auto pr-1'>
                <div className='flex flex-wrap gap-2.5'>
                  {availableHerbs.map(herb => (
                    <button
                      key={getHerbKey(herb)}
                      onClick={() => addHerbToBlend(herb)}
                      className='bg-white/8 text-text/95 hover:border-brand-lime/45 hover:bg-brand-lime/16 active:bg-brand-lime/20 border-white/22 rounded-full border px-3.5 py-2 text-xs font-medium shadow-[0_6px_14px_-12px_rgba(163,230,53,0.85)] transition'
                    >
                      {getHerbName(herb)}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {!availableHerbs.length && (
              <p className='text-sub text-xs'>
                No matching herbs found. Try another search or use a preset filter.
              </p>
            )}
          </Card>

          <section className='space-y-4'>
            {!blend.length && (
              <Card className='text-sub border-dashed p-6 text-center text-sm'>
                Your custom blend will appear here. Start by selecting your goal above.
              </Card>
            )}
            {blend.map(herb => {
              const settings = RATIO_SETTINGS[ratioMode]
              const value = Number(herb.ratios[ratioMode].toFixed(ratioMode === 'percent' ? 0 : 2))
              return (
                <Card key={herb.key} className='space-y-4 p-5 sm:p-6'>
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
                        className='text-sub hover:text-text px-3 text-xs'
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

        <aside className='space-y-5'>
          <Card className='space-y-4 p-5 sm:p-6'>
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
              <Button onClick={copyFormula} className='justify-center' disabled={!blend.length}>
                {copyState === 'copied' ? 'Copied!' : 'Copy formula'}
              </Button>
            </div>
          </Card>
        </aside>
      </section>

      <section className='space-y-4'>
        <div className='flex items-center justify-between gap-3'>
          <h2 className='text-sub text-sm font-semibold uppercase tracking-wide'>Saved blends</h2>
          {!!savedGoalBlends.length && (
            <Button onClick={clearSavedBlends} variant='ghost' className='px-3 py-1 text-xs'>
              Clear saved blends
            </Button>
          )}
        </div>
        {!savedGoalBlends.length ? (
          <Card className='text-sub border-dashed p-5 text-sm'>No saved blends yet.</Card>
        ) : (
          <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
            {savedGoalBlends.slice(0, 3).map(saved => (
              <ResultsSummaryCard
                key={`${saved.timestamp}-${saved.blendName}`}
                goal={saved.goal}
                blendName={saved.blendName}
                herbs={saved.herbs}
                explanation='Saved from your blend recommendations for quick reuse.'
                timestamp={saved.timestamp}
                variant='compact'
              />
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
