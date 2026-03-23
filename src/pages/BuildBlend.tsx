import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import Meta from '@/components/Meta'
import Disclaimer from '@/components/Disclaimer'
import { GOALS, type GoalDefinition } from '@/data/goals'
import { herbs } from '@/lib/data'
import type { Herb } from '@/types/herb'
import type { BlendFilters, BlendState } from '@/types/blend'
import type { ConfidenceLevel } from '@/types/confidence'
import { generateBlend, type BlendRecommendation } from '@/utils/generateBlend'
import { deserializeBlend } from '@/utils/deserializeBlend'
import { serializeBlend } from '@/utils/serializeBlend'
import { getHerbConfidence, getHerbEffects, herbDisplayName } from '@/utils/herbSignals'

type ConfidenceFilter = BlendFilters['confidence']
const LAST_BLEND_KEY = 'ths:last-build-blend'

function isConfidenceLevel(value: string): value is ConfidenceLevel {
  return value === 'high' || value === 'medium' || value === 'low'
}

function HerbMiniCard({ herb }: { herb: Herb }) {
  const effects = getHerbEffects(herb).slice(0, 4)

  return (
    <Card className='rounded-2xl p-4 transition-all duration-300 hover:shadow-[0_0_24px_rgba(56,189,248,0.2)]'>
      <div className='space-y-3'>
        <div>
          <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Herb</p>
          <h4 className='text-lg font-semibold text-white'>{herbDisplayName(herb)}</h4>
        </div>
        <div className='flex flex-wrap gap-2'>
          {effects.length ? (
            effects.map(effect => (
              <Badge key={`${herb.slug}-${effect}`} className='bg-slate-800/70 text-slate-100'>
                {effect}
              </Badge>
            ))
          ) : (
            <Badge className='bg-slate-800/70 text-slate-100'>No effect tags</Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

export default function BuildBlend() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [selectedGoalId, setSelectedGoalId] = useState<string>(GOALS[0].id)
  const [experienceLevel, setExperienceLevel] =
    useState<NonNullable<BlendFilters['experience']>>('beginner')
  const [confidenceFilter, setConfidenceFilter] = useState<ConfidenceFilter>('all')
  const [excludeInput, setExcludeInput] = useState('')
  const [result, setResult] = useState<BlendRecommendation | null>(null)
  const [blendLoadError, setBlendLoadError] = useState(false)
  const [shareStatus, setShareStatus] = useState<'idle' | 'copied' | 'shared'>('idle')

  const selectedGoal = useMemo<GoalDefinition | undefined>(
    () => GOALS.find(goal => goal.id === selectedGoalId),
    [selectedGoalId]
  )

  const excludedHerbIds = useMemo(
    () =>
      excludeInput
        .split(',')
        .map(value => value.trim().toLowerCase())
        .filter(Boolean),
    [excludeInput]
  )

  const beginnerPsychedelicWarning =
    selectedGoal?.id === 'introspection' && experienceLevel === 'beginner'

  const buildRecommendationFromState = (
    state: BlendState,
    allHerbs: Herb[]
  ): BlendRecommendation | null => {
    const herbMap = new Map(
      allHerbs.map(herb => [String(herb.slug || herb.id || '').toLowerCase(), herb])
    )
    const primary = herbMap.get(state.primary.toLowerCase())
    const supporting = state.supporting
      .map(item => herbMap.get(item.toLowerCase()))
      .filter((item): item is Herb => Boolean(item))

    if (!primary || supporting.length === 0) return null

    const goalLabel = GOALS.find(goal => goal.id === state.goal)?.label ?? state.goal
    const usedLowConfidenceData = [primary, ...supporting].some(
      herb => getHerbConfidence(herb) === 'low'
    )

    return {
      primary,
      supporting,
      reasoning: [
        `Restored blend for ${goalLabel}.`,
        `Primary herb and ${supporting.length} supporting herbs are loaded from the shared link.`,
        usedLowConfidenceData
          ? 'Some selected herbs have limited confidence data, so review sources and safety notes.'
          : 'This blend emphasizes stronger-confidence data where possible.',
      ],
      usedLowConfidenceData,
    }
  }

  useEffect(() => {
    if (!herbs.length) return

    const blendParam = searchParams.get('blend')
    const rawBlend = blendParam || window.localStorage.getItem(LAST_BLEND_KEY)
    if (!rawBlend) return

    const restored = deserializeBlend(rawBlend)
    if (!restored) {
      if (blendParam) setBlendLoadError(true)
      return
    }

    const recommendation = buildRecommendationFromState(restored, herbs)
    if (!recommendation) {
      setBlendLoadError(true)
      return
    }

    const restoredGoal = GOALS.some(goal => goal.id === restored.goal) ? restored.goal : GOALS[0].id
    setSelectedGoalId(restoredGoal)
    if (restored.confidence && isConfidenceLevel(restored.confidence)) {
      setConfidenceFilter(restored.confidence)
    }
    setResult(recommendation)
    setBlendLoadError(false)
  }, [herbs, searchParams])

  const onGenerate = () => {
    if (!selectedGoal) return
    const recommendation = generateBlend(selectedGoal, {
      confidence: confidenceFilter,
      excludeHerbs: excludedHerbIds,
      experience: experienceLevel,
    })
    setResult(recommendation)
    if (!recommendation) return

    const blendState: BlendState = {
      goal: selectedGoal.id,
      primary: String(
        recommendation.primary.slug ??
          recommendation.primary.id ??
          recommendation.primary.name ??
          ''
      ),
      supporting: recommendation.supporting.map(herb =>
        String(herb.slug ?? herb.id ?? herb.name ?? '')
      ),
      ...(confidenceFilter !== 'all' ? { confidence: confidenceFilter } : {}),
    }
    const serialized = serializeBlend(blendState)
    setSearchParams({ blend: serialized }, { replace: true })
    window.localStorage.setItem(LAST_BLEND_KEY, serialized)
    setBlendLoadError(false)
  }

  const handleCopyLink = async () => {
    const fullUrl = window.location.href
    try {
      await navigator.clipboard.writeText(fullUrl)
      setShareStatus('copied')
    } catch {
      window.prompt('Copy blend link', fullUrl)
    } finally {
      window.setTimeout(() => setShareStatus('idle'), 1800)
    }
  }

  const handleShare = async () => {
    if (!navigator.share || !result) return
    try {
      await navigator.share({
        title: `${selectedGoal?.label ?? 'Custom'} Blend`,
        text: `Blend with ${herbDisplayName(result.primary)} + ${result.supporting
          .map(herb => herbDisplayName(herb))
          .join(', ')}`,
        url: window.location.href,
      })
      setShareStatus('shared')
      window.setTimeout(() => setShareStatus('idle'), 1800)
    } catch {
      // user canceled share
    }
  }

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
      <Meta
        title='Build a Custom Herbal Blend'
        description='Generate, restore, and share deterministic herbal blends for your goal.'
        path='/build'
      />
      <header className='space-y-3'>
        <p className='text-xs uppercase tracking-[0.25em] text-cyan-300'>Build</p>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>
          Smart Guided Blend Recommender
        </h1>
        <p className='max-w-2xl text-sm text-slate-300 sm:text-base'>
          Pick a goal, tune your constraints, and generate a deterministic blend recommendation with
          clear reasoning.
        </p>
      </header>

      <Card className='space-y-5 rounded-2xl p-5 sm:p-6'>
        <section className='space-y-3'>
          <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>
            Step 1 · Goal Selection
          </p>
          <div className='grid grid-cols-2 gap-3 sm:grid-cols-3'>
            {GOALS.map(goal => {
              const isSelected = selectedGoalId === goal.id
              return (
                <button
                  key={goal.id}
                  type='button'
                  onClick={() => setSelectedGoalId(goal.id)}
                  className={`min-h-20 rounded-xl border px-3 py-4 text-left text-sm transition-all duration-300 ${
                    isSelected
                      ? 'border-cyan-300 bg-cyan-500/20 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)]'
                      : 'border-slate-700 bg-slate-900/60 text-slate-200 hover:border-cyan-500/50 hover:bg-slate-800/80'
                  }`}
                >
                  <span className='block text-base font-semibold'>{goal.label}</span>
                  <span className='mt-1 block text-xs text-slate-400'>
                    {goal.targetEffects.slice(0, 2).join(' · ')}
                  </span>
                </button>
              )
            })}
          </div>
        </section>

        <section className='grid gap-4 sm:grid-cols-2'>
          <div className='space-y-2'>
            <label className='text-xs uppercase tracking-[0.2em] text-slate-400'>
              Step 2 · Experience Level
            </label>
            <select
              value={experienceLevel}
              onChange={event =>
                setExperienceLevel(event.target.value as NonNullable<BlendFilters['experience']>)
              }
              className='w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100'
            >
              <option value='beginner'>Beginner</option>
              <option value='intermediate'>Intermediate</option>
              <option value='advanced'>Advanced</option>
            </select>
          </div>

          <div className='space-y-2'>
            <label className='text-xs uppercase tracking-[0.2em] text-slate-400'>
              Step 2 · Confidence Filter
            </label>
            <select
              value={confidenceFilter}
              onChange={event => setConfidenceFilter(event.target.value as ConfidenceFilter)}
              className='w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100'
            >
              <option value='all'>All confidence</option>
              <option value='high'>High only</option>
              <option value='medium'>Medium only</option>
              <option value='low'>Low only</option>
            </select>
          </div>

          <div className='space-y-2 sm:col-span-2'>
            <label className='text-xs uppercase tracking-[0.2em] text-slate-400'>
              Optional Exclude List (comma-separated slug or name)
            </label>
            <input
              value={excludeInput}
              onChange={event => setExcludeInput(event.target.value)}
              placeholder='kava, blue-lotus'
              className='w-full rounded-xl border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500'
            />
          </div>
        </section>

        {beginnerPsychedelicWarning ? (
          <div className='rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-100'>
            Beginner + introspection can involve high-intensity herbs. Start with non-psychedelic
            goals first and review safety information.
          </div>
        ) : null}

        <div>
          <Button
            type='button'
            variant='primary'
            onClick={onGenerate}
            disabled={!herbs.length || !selectedGoal}
            className='w-full rounded-xl py-3 text-sm font-semibold sm:w-auto sm:px-8'
          >
            Step 3 · Generate Recommendation
          </Button>
        </div>
      </Card>

      <section className='space-y-4 transition-all duration-300'>
        <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Step 4 · Results</p>

        {!result ? (
          <Card className='rounded-2xl p-6 text-sm text-slate-300'>
            Generate a blend to see the primary herb, support stack, and reasoning.
          </Card>
        ) : (
          <div className='space-y-4 transition-all duration-300'>
            <Card className='rounded-2xl border border-cyan-400/30 p-6 shadow-[0_0_30px_rgba(34,211,238,0.18)]'>
              <p className='text-xs uppercase tracking-[0.24em] text-cyan-300'>Primary Herb</p>
              <h2 className='mt-2 text-2xl font-bold text-cyan-50'>
                {herbDisplayName(result.primary)}
              </h2>
              <div className='mt-4 flex flex-wrap gap-2'>
                {getHerbEffects(result.primary)
                  .slice(0, 6)
                  .map(effect => (
                    <Badge key={`primary-${effect}`} className='bg-cyan-600/20 text-cyan-50'>
                      {effect}
                    </Badge>
                  ))}
              </div>
            </Card>

            <div className='grid gap-3 sm:grid-cols-2 lg:grid-cols-3'>
              {result.supporting.map(herb => (
                <HerbMiniCard key={herb.slug ?? herb.id ?? herbDisplayName(herb)} herb={herb} />
              ))}
            </div>

            <Card className='rounded-2xl p-5'>
              <p className='text-xs uppercase tracking-[0.22em] text-slate-400'>Reasoning</p>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-sm text-slate-200'>
                {result.reasoning.map(line => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </Card>

            {result.usedLowConfidenceData ? (
              <Card className='rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-sm text-amber-100'>
                Data limited: one or more selected herbs are supported by low-confidence data.
              </Card>
            ) : null}

            <Card className='rounded-2xl p-4 sm:p-5'>
              <div className='flex flex-wrap items-center gap-2'>
                <Button type='button' variant='default' onClick={handleCopyLink}>
                  Copy Link
                </Button>
                {typeof navigator !== 'undefined' && typeof navigator.share === 'function' ? (
                  <Button type='button' variant='ghost' onClick={handleShare}>
                    Share
                  </Button>
                ) : null}
                {shareStatus === 'copied' ? (
                  <p className='text-xs text-emerald-300'>Link copied.</p>
                ) : null}
                {shareStatus === 'shared' ? (
                  <p className='text-xs text-emerald-300'>Shared successfully.</p>
                ) : null}
              </div>
            </Card>
          </div>
        )}
        {blendLoadError ? (
          <Card className='rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 text-sm text-rose-100'>
            Invalid or outdated blend link.
          </Card>
        ) : null}
      </section>

      <Disclaimer />
    </main>
  )
}
