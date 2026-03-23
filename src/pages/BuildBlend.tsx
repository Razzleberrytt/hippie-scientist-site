import { useEffect, useMemo, useRef, useState } from 'react'
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
import { trackEvent, useSavedItems } from '@/lib/growth'
import { CTA } from '@/lib/cta'

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
const MAX_FREE_SAVED_BLENDS = 3

const PRESETS: Record<string, string[]> = {
  Relaxation: ['Blue Lotus', 'Kava', 'Passionflower'],
  Energy: ['Yerba Mate', 'Guayusa', 'Kola Nut'],
  Lucidity: ['Calea zacatechichi', 'Mugwort', 'Guayusa'],
  Focus: ['Gotu Kola', 'Bacopa monnieri', 'Rhodiola rosea'],
}

type GoalKey = 'calm' | 'focus' | 'sleep'
type TimeOfDay = 'morning' | 'afternoon' | 'evening'
type IntensityPreference = 'gentle' | 'balanced' | 'stronger'
type BlendMode = 'guided' | 'manual'

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
  const [blendMode, setBlendMode] = useState<BlendMode>('guided')
  const [quizGoal, setQuizGoal] = useState<GoalKey | null>(null)
  const [quizTimeOfDay, setQuizTimeOfDay] = useState<TimeOfDay | null>(null)
  const [quizIntensity, setQuizIntensity] = useState<IntensityPreference | null>(null)
  const [quizRecommendationMessage, setQuizRecommendationMessage] = useState('')
  const [blendSavedMessage, setBlendSavedMessage] = useState(false)
  const [showExploreHerbs, setShowExploreHerbs] = useState(false)
  const [showStarterPackFallback, setShowStarterPackFallback] = useState(false)
  const [showPostCheckoutNote, setShowPostCheckoutNote] = useState(false)
  const [didLoadSharedBlend, setDidLoadSharedBlend] = useState(false)
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false)
  const [starterPackEmail, setStarterPackEmail] = useState('')
  const [starterPackEmailError, setStarterPackEmailError] = useState('')
  const [starterPackUnlocked, setStarterPackUnlocked] = useState(false)
  const { save } = useSavedItems()
  const stepTwoRef = useRef<HTMLElement | null>(null)
  const stepThreeRef = useRef<HTMLElement | null>(null)
  const stepFourRef = useRef<HTMLElement | null>(null)

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
    if (savedGoalBlends.length >= MAX_FREE_SAVED_BLENDS) {
      toast.message('You reached the free limit of 3 saved blends.')
      return
    }
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
    save({
      type: 'blend',
      slug: `${selectedRecommendation.key}-${Date.now()}`,
      title: selectedRecommendation.blendName,
      href: '/blend',
      note: selectedRecommendation.herbs.map(herb => herb.name).join(', '),
    })
    trackEvent('blend_created', {
      blend: selectedRecommendation.blendName,
      herbs: selectedRecommendation.herbs.length,
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

  const handleStarterPackUnlock = () => {
    const normalized = starterPackEmail.trim().toLowerCase()
    if (!normalized.includes('@')) {
      setStarterPackEmailError('Enter a valid email to save and download your starter guide.')
      return
    }
    setStarterPackEmailError('')
    setStarterPackUnlocked(true)
    trackEvent('email_submit', { context: 'starter-pack', source: 'build_blend_gate' })
    trackEvent('starter_pack_saved', { source: 'build_blend', has_blend: blend.length > 0 })
  }

  const scrollToStep = (target: HTMLElement | null) => {
    if (!target || typeof window === 'undefined') return
    window.setTimeout(() => {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 120)
  }

  useEffect(() => {
    if (!quizGoal || (quizTimeOfDay && quizIntensity)) return
    scrollToStep(stepTwoRef.current)
  }, [quizGoal, quizIntensity, quizTimeOfDay])

  useEffect(() => {
    if (!selectedRecommendation) return
    scrollToStep(stepThreeRef.current)
  }, [selectedRecommendation])

  useEffect(() => {
    if (!isCustomizeOpen) return
    scrollToStep(stepFourRef.current)
  }, [isCustomizeOpen])

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
  const hasCompletedQuiz = Boolean(quizGoal && quizTimeOfDay && quizIntensity)
  const currentStep =
    blendMode === 'manual'
      ? !quizGoal
        ? 1
        : !hasRecommendation
          ? 3
          : isCustomizeOpen
            ? 4
            : 5
      : !quizGoal
        ? 1
        : !hasCompletedQuiz
          ? 2
          : !hasRecommendation
            ? 3
            : isCustomizeOpen
              ? 4
              : 5
  const currentStepLabel =
    currentStep === 1
      ? 'Choose Your Goal'
      : currentStep === 2
        ? 'Choose Time + Intensity'
        : currentStep === 3
          ? 'View Recommendation'
          : currentStep === 4
            ? 'Customize (Optional)'
            : 'Save / Download'
  const visibleAvailableHerbs = availableHerbs.slice(0, 24)

  return (
    <main className='container space-y-10 py-8 sm:py-10'>
      <header className='space-y-3'>
        <p className='text-sub text-xs uppercase tracking-[0.3em]'>Experimental Mixer</p>
        <h1 className='h1-grad text-3xl font-semibold md:text-4xl'>Build a Blend</h1>
        <p className='text-sub max-w-2xl text-sm leading-relaxed sm:text-base'>
          Curate herbs, adjust their ratios in percentages or grams, and watch potency and mood
          predictions update instantly.
        </p>
        <div className='bg-panel/45 inline-flex rounded-full border border-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em]'>
          Step {currentStep} of 5 — {currentStepLabel}
        </div>
      </header>

      <section className='border-white/12 from-brand-lime/10 via-panel to-brand-lime/5 space-y-6 rounded-3xl border bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.04),0_12px_24px_-20px_rgba(163,230,53,0.55)] sm:p-7'>
        <div className='border-border bg-panel/50 inline-flex rounded-full border p-1 text-xs'>
          <button
            onClick={() => setBlendMode('guided')}
            className={`rounded-full px-3 py-1.5 transition ${
              blendMode === 'guided'
                ? 'bg-brand-lime/20 text-text'
                : 'text-sub hover:text-text hover:bg-white/10'
            }`}
          >
            Guided mode
          </button>
          <button
            onClick={() => setBlendMode('manual')}
            className={`rounded-full px-3 py-1.5 transition ${
              blendMode === 'manual'
                ? 'bg-brand-lime/20 text-text'
                : 'text-sub hover:text-text hover:bg-white/10'
            }`}
          >
            Manual mode
          </button>
        </div>
        <div className='space-y-2'>
          <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
            {blendMode === 'guided' ? 'Step 1: Choose Your Goal' : 'Quick Start: Pick a Goal'}
          </p>
          <h2 className='text-text text-xl font-semibold sm:text-2xl'>
            {blendMode === 'guided'
              ? 'Let’s build your first blend'
              : 'Build manually with a goal anchor'}
          </h2>
          <p className='text-sub max-w-2xl text-sm sm:text-base'>
            {blendMode === 'guided'
              ? 'Answer a few quick questions and we’ll suggest a simple starting blend.'
              : 'Select a goal to prefill starter herbs, then customize ratios and ingredients.'}
          </p>
        </div>

        <Card className='border-white/10 bg-black/20 p-4'>
          <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>Main goal</p>
          <div className='grid gap-2 sm:grid-cols-3'>
            {(['calm', 'focus', 'sleep'] as GoalKey[]).map(goal => (
              <button
                key={goal}
                onClick={() => {
                  setQuizGoal(goal)
                  if (blendMode === 'manual') {
                    const recommendation = GOAL_RECOMMENDATIONS.find(entry => entry.key === goal)
                    if (recommendation) {
                      applyGoalRecommendation(recommendation)
                      setIsCustomizeOpen(true)
                    }
                  }
                }}
                className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition duration-200 ${
                  quizGoal === goal
                    ? 'border-brand-lime/70 bg-brand-lime/20 text-text scale-[1.01] shadow-[0_0_16px_-12px_rgba(163,230,53,0.9)]'
                    : 'border-border/70 bg-panel/60 text-sub hover:border-brand-lime/35 hover:bg-brand-lime/8 hover:text-text'
                }`}
              >
                {goal}
              </button>
            ))}
          </div>
        </Card>
      </section>

      {blendMode === 'guided' && quizGoal && (
        <section ref={stepTwoRef} className='scroll-mt-24 space-y-5'>
          <div className='space-y-1'>
            <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
              Step 2: Choose Time + Intensity
            </p>
            <p className='text-sub text-sm'>
              Tune the recommendation to your day and desired feel.
            </p>
          </div>
          <div className='grid gap-3 md:grid-cols-2'>
            <Card className='border-white/10 bg-black/20 p-4'>
              <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>Time of day</p>
              <div className='grid gap-2'>
                {(['morning', 'afternoon', 'evening'] as TimeOfDay[]).map(timeOption => (
                  <button
                    key={timeOption}
                    onClick={() => setQuizTimeOfDay(timeOption)}
                    className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition duration-200 ${
                      quizTimeOfDay === timeOption
                        ? 'border-brand-lime/70 bg-brand-lime/20 text-text scale-[1.01] shadow-[0_0_16px_-12px_rgba(163,230,53,0.9)]'
                        : 'border-border/70 bg-panel/60 text-sub hover:border-brand-lime/35 hover:bg-brand-lime/8 hover:text-text'
                    }`}
                  >
                    {timeOption}
                  </button>
                ))}
              </div>
            </Card>

            <Card className='border-white/10 bg-black/20 p-4'>
              <p className='text-sub mb-2 text-xs uppercase tracking-[0.2em]'>Intensity</p>
              <div className='grid gap-2'>
                {(['gentle', 'balanced', 'stronger'] as IntensityPreference[]).map(intensity => (
                  <button
                    key={intensity}
                    onClick={() => setQuizIntensity(intensity)}
                    className={`min-h-10 rounded-xl border px-3.5 py-2.5 text-left text-sm capitalize transition duration-200 ${
                      quizIntensity === intensity
                        ? 'border-brand-lime/70 bg-brand-lime/20 text-text scale-[1.01] shadow-[0_0_16px_-12px_rgba(163,230,53,0.9)]'
                        : 'border-border/70 bg-panel/60 text-sub hover:border-brand-lime/35 hover:bg-brand-lime/8 hover:text-text'
                    }`}
                  >
                    {intensity}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        </section>
      )}

      {selectedRecommendation && (
        <section ref={stepThreeRef} className='scroll-mt-24 space-y-5'>
          <Card className='border-brand-lime/35 from-brand-lime/15 to-panel/90 space-y-5 bg-gradient-to-br p-5 shadow-[0_0_0_1px_rgba(163,230,53,0.08),0_16px_28px_-22px_rgba(163,230,53,0.8)] sm:p-6'>
            <div className='space-y-1'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 3: Your Recommended Blend
              </p>
              <p className='text-sub text-xs'>
                You completed the quiz. Here&apos;s your blend recommendation.
              </p>
            </div>
            <ResultsSummaryCard
              goal={selectedGoal ?? quizGoal ?? selectedRecommendation.key}
              blendName={selectedRecommendation.blendName}
              explanation={`Based on your answers, this is the simplest place to start. ${quizRecommendationMessage}`}
              herbs={selectedRecommendation.herbs.map(herb => herb.name)}
              variant='expanded'
            />

            <Card className='border-white/10 bg-black/15 p-4'>
              <h2 className='text-sub text-xs font-semibold uppercase tracking-[0.2em]'>
                Blend stats
              </h2>
              <div className='text-sub mt-3 grid gap-2 text-sm sm:grid-cols-3'>
                <div className='rounded-lg border border-white/10 bg-black/20 px-3 py-2'>
                  <p>Total herbs</p>
                  <p className='text-text font-semibold'>{blend.length}</p>
                </div>
                <div className='rounded-lg border border-white/10 bg-black/20 px-3 py-2'>
                  <p>Total {ratioMode === 'percent' ? 'ratio' : 'weight'}</p>
                  <p className='text-text font-semibold'>
                    {ratioMode === 'percent'
                      ? `${totalAmount.toFixed(0)}%`
                      : `${totalAmount.toFixed(1)} g`}
                  </p>
                </div>
                <div className='rounded-lg border border-white/10 bg-black/20 px-3 py-2'>
                  <p>Potency score</p>
                  <p className='text-text font-semibold'>{potencyScore.toFixed(1)}</p>
                </div>
              </div>
              <div className='bg-panel/50 text-sub mt-3 rounded-xl border border-white/10 p-3 text-xs'>
                <p className='text-sub/70 uppercase tracking-wide'>Mood projection</p>
                <p className='text-text mt-1 text-sm font-semibold'>{moodInsight.headline}</p>
                <p className='mt-1'>{moodInsight.breakdown}</p>
              </div>
            </Card>

            <div className='space-y-1'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 5: Save / Download
              </p>
              <p className='text-sub text-xs'>
                Keep this blend as a reusable protocol, then export a guide for your notes.
              </p>
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
                {CTA.conversion.saveBlend}
              </Button>
              <Button
                onClick={() => setShowExploreHerbs(current => !current)}
                variant='ghost'
                className='justify-center'
              >
                Explore these herbs
              </Button>
            </div>
            {!starterPackUnlocked ? (
              <div className='space-y-2 rounded-xl border border-white/10 bg-black/20 p-3.5'>
                <p className='text-sm font-semibold text-white'>
                  Save your blend + get a printable guide
                </p>
                <p className='text-sub text-xs'>
                  Enter your email to unlock your starter pack download. No popups, no spam.
                </p>
                <div className='grid gap-2 sm:grid-cols-[1fr_auto]'>
                  <label htmlFor='starter-pack-email' className='sr-only'>
                    Email address for starter pack access
                  </label>
                  <input
                    id='starter-pack-email'
                    type='email'
                    value={starterPackEmail}
                    onChange={event => setStarterPackEmail(event.target.value)}
                    placeholder='you@example.com'
                    className='rounded-lg border border-white/15 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/45'
                  />
                  <Button onClick={handleStarterPackUnlock} className='justify-center'>
                    {CTA.conversion.getGuide}
                  </Button>
                </div>
                {starterPackEmailError && (
                  <p className='text-xs text-rose-300'>{starterPackEmailError}</p>
                )}
              </div>
            ) : (
              <Button
                onClick={handleStarterPackCheckout}
                variant='ghost'
                className='justify-center'
              >
                {CTA.secondary.download}
              </Button>
            )}
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

            <section className='border-brand-lime/30 from-brand-lime/12 to-panel/95 relative space-y-4 overflow-hidden rounded-2xl border bg-gradient-to-br p-4 shadow-[0_0_0_1px_rgba(163,230,53,0.08),0_10px_24px_-18px_rgba(163,230,53,0.75)]'>
              <div className='from-brand-lime/14 via-brand-lime/4 pointer-events-none absolute inset-0 bg-gradient-to-r to-transparent' />
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
                      disabled={!starterPackUnlocked}
                      className='border-brand-lime/35 bg-brand-lime/18 text-brand-lime hover:bg-brand-lime/26 min-w-[190px] justify-center border shadow-[0_0_20px_-14px_rgba(163,230,53,0.9)]'
                    >
                      {starterPackUnlocked ? 'Download starter pack' : 'Unlock with email first'}
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
          </Card>
        </section>
      )}

      {hasRecommendation && (
        <section ref={stepFourRef} className='scroll-mt-24 space-y-5'>
          <Card className='space-y-4 p-5 sm:p-6'>
            <div className='space-y-2'>
              <p className='text-brand-lime text-xs font-semibold uppercase tracking-[0.24em]'>
                Step 4: Customize (Optional)
              </p>
              <Button
                onClick={() => setIsCustomizeOpen(current => !current)}
                variant='ghost'
                className='w-full justify-between border border-white/10 px-3 py-2 text-left text-sm'
              >
                <span>
                  {isCustomizeOpen ? 'Hide customization' : 'Customize your blend (optional)'}
                </span>
                <span className='text-brand-lime'>{isCustomizeOpen ? '−' : '+'}</span>
              </Button>
            </div>

            {isCustomizeOpen && (
              <>
                <p className='text-sub text-[11px] font-semibold uppercase tracking-[0.22em]'>
                  Search &amp; select herbs
                </p>
                <div className='relative'>
                  <label htmlFor='blend-herb-search' className='sr-only'>
                    Search herbs by name, effects, or vibe
                  </label>
                  <input
                    id='blend-herb-search'
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

                <div className='border-white/12 bg-panel/35 space-y-3 rounded-2xl border p-3.5'>
                  <div className='flex flex-wrap items-center justify-between gap-3'>
                    <div className='flex flex-wrap gap-2.5'>
                      {Object.keys(PRESETS).map(preset => (
                        <Button
                          key={preset}
                          onClick={() => applyPreset(preset)}
                          variant={activePreset === preset ? 'primary' : 'default'}
                          className={`min-h-8 px-3 text-[11px] font-semibold ${
                            activePreset === preset
                              ? 'border-brand-lime/35 bg-brand-lime/20 text-text shadow-[0_0_12px_-10px_rgba(163,230,53,0.85)]'
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
                              ? 'bg-brand-lime/22 text-text shadow-[0_0_12px_-12px_rgba(163,230,53,0.9)]'
                              : 'opacity-80 hover:bg-white/10 hover:opacity-100'
                          }`}
                        >
                          {mode === 'percent' ? '% ratios' : 'Grams'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {!!visibleAvailableHerbs.length && (
                  <div className='max-h-[12rem] overflow-y-auto rounded-xl border border-white/10 bg-black/15 p-3 pr-2'>
                    <div className='flex flex-wrap gap-2'>
                      {visibleAvailableHerbs.map(herb => (
                        <button
                          key={getHerbKey(herb)}
                          onClick={() => addHerbToBlend(herb)}
                          className='bg-white/6 text-text/90 hover:border-brand-lime/35 hover:bg-brand-lime/10 rounded-full border border-white/15 px-3 py-1.5 text-xs font-medium transition active:scale-[0.99]'
                        >
                          {getHerbName(herb)}
                        </button>
                      ))}
                    </div>
                    {availableHerbs.length > visibleAvailableHerbs.length && (
                      <p className='text-sub mt-3 text-xs'>
                        Showing the first {visibleAvailableHerbs.length} herbs. Use search to narrow
                        your options.
                      </p>
                    )}
                  </div>
                )}
                {!visibleAvailableHerbs.length && (
                  <p className='text-sub text-xs'>
                    No matching herbs found. Try another search or use a preset filter.
                  </p>
                )}
              </>
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
                      aria-label={`${herb.displayName} ${ratioMode} slider`}
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
                          aria-label={`${herb.displayName} ${ratioMode} value`}
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
        </section>
      )}

      {hasRecommendation && (
        <section className='bg-panel/25 space-y-4 rounded-2xl border border-white/10 p-5'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-sub text-sm font-semibold uppercase tracking-wide'>Saved blends</h2>
            {!!savedGoalBlends.length && (
              <Button onClick={clearSavedBlends} variant='ghost' className='px-3 py-1 text-xs'>
                Clear saved blends
              </Button>
            )}
          </div>
          {!savedGoalBlends.length ? (
            <Card className='text-sub border-dashed p-5 text-sm'>
              Your saved blends will appear here after you create one.
            </Card>
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
          {savedGoalBlends.length >= MAX_FREE_SAVED_BLENDS && (
            <p className='text-sub rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs'>
              Free limit reached (3 saved blends). Unlock unlimited saved blends in a future premium
              plan.
            </p>
          )}
          <Button onClick={copyFormula} className='justify-center' disabled={!blend.length}>
            {copyState === 'copied' ? 'Copied!' : 'Copy formula'}
          </Button>
        </section>
      )}
    </main>
  )
}
