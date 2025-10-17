import { useEffect, useMemo, useState } from 'react'
import { useHerbData } from '@/lib/herb-data'

export type AdvancedHerb = {
  common?: string
  scientific?: string
  effects?: string
  tags?: string[]
  compounds?: string[]
  contraindications?: string[] | string
  interactions?: string[] | string
  intensity?: string | number | null
  intensityLabel?: string | number | null
  intensityLevel?: string | null
  intensityClean?: string | number | null
  [key: string]: unknown
}

const TAG_CATALOG = [
  'adaptogen',
  'sedative',
  'stimulant',
  'nootropic',
  'anxiolytic',
  'psychedelic',
  'antidepressant',
  'anti-inflammatory',
]

function norm(value: string | undefined | null) {
  return String(value ?? '').toLowerCase()
}

function getContraindicationText(herb: AdvancedHerb) {
  const segments: string[] = []
  const { contraindications, contraindicationsText, interactions, interactionsText } =
    herb as Record<string, unknown>

  if (Array.isArray(contraindications)) segments.push(contraindications.join(' '))
  if (typeof contraindications === 'string') segments.push(contraindications)
  if (typeof contraindicationsText === 'string') segments.push(contraindicationsText)

  if (Array.isArray(interactions)) segments.push(interactions.join(' '))
  if (typeof interactions === 'string') segments.push(interactions)
  if (typeof interactionsText === 'string') segments.push(interactionsText)

  return norm(segments.join(' '))
}

const PREGNANCY_PATTERN = /pregnan|gestation|lactation|breastfeed/i
const PREGNANCY_AVOID_PATTERN = /pregnan|gestation|lactation|breastfeed|avoid|contraindicat/i
const MAOI_PATTERN = /(maoi|ssri|serotonin|serotonergic)/i

function getIntensityValue(herb: AdvancedHerb) {
  const candidates = [
    herb.intensity,
    herb.intensityLabel,
    herb.intensityLevel,
    (herb as Record<string, unknown>).intensity_label,
    (herb as Record<string, unknown>).intensity_level,
    herb.intensityClean,
    (herb as Record<string, unknown>).intensityScore,
  ]

  for (const candidate of candidates) {
    if (typeof candidate === 'number' && Number.isFinite(candidate)) return candidate
    if (typeof candidate === 'string' && candidate.trim()) {
      const numeric = Number.parseFloat(candidate)
      if (Number.isFinite(numeric)) return numeric

      const lower = candidate.toLowerCase()
      if (/(ultra|extreme|very\s+strong|overwhelming)/.test(lower)) return 9
      if (/(strong|potent|high)/.test(lower)) return 8
      if (/(moderate|medium|balanced)/.test(lower)) return 5
      if (/(mild|gentle|light|low)/.test(lower)) return 2
      if (/variable|varied|depends/.test(lower)) return 4
    }
  }

  return 5
}

export default function AdvancedSearch({
  open,
  onClose,
  onApply,
}: {
  open: boolean
  onClose: () => void
  onApply: (results: AdvancedHerb[]) => void
}) {
  const herbs = useHerbData() as AdvancedHerb[]
  const [q, setQ] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [pregSafe, setPregSafe] = useState<null | boolean>(null)
  const [maoiSsr, setMaoiSsr] = useState<null | boolean>(null)
  const [intensity, setIntensity] = useState<[number, number]>([0, 10])

  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const filtered = useMemo(() => {
    const query = norm(q)
    return herbs.filter(herb => {
      const fields = [
        herb.common,
        herb.scientific,
        herb.effects,
        (herb as Record<string, unknown>).description,
        (herb.tags || []).join(' '),
        (herb.compounds || []).join(' '),
      ]
      const haystack = norm(fields.join(' '))
      if (query && !haystack.includes(query)) return false

      if (tags.length) {
        const herbTags = new Set((herb.tags || []).map(tag => norm(tag)))
        for (const tag of tags) if (!herbTags.has(tag)) return false
      }

      const contraindicationText = getContraindicationText(herb)

      if (pregSafe === false && !PREGNANCY_PATTERN.test(contraindicationText)) return false
      if (pregSafe === true && PREGNANCY_AVOID_PATTERN.test(contraindicationText)) return false

      if (maoiSsr === true && !MAOI_PATTERN.test(contraindicationText)) return false
      if (maoiSsr === false && MAOI_PATTERN.test(contraindicationText)) return false

      const intensityValue = getIntensityValue(herb)
      if (intensityValue < intensity[0] || intensityValue > intensity[1]) return false

      return true
    })
  }, [q, tags, pregSafe, maoiSsr, intensity, herbs])

  function toggleTag(tag: string) {
    const normalized = norm(tag)
    setTags(prev =>
      prev.includes(normalized) ? prev.filter(t => t !== normalized) : [...prev, normalized]
    )
  }

  if (!open) return null

  return (
    <div
      role='dialog'
      aria-modal='true'
      className='fixed inset-0 z-50'
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm' />
      <div className='bg-white/14 ring-white/12 relative z-10 mx-auto mt-10 w-[min(92vw,780px)] rounded-2xl p-5 text-white shadow-[0_10px_40px_-10px_rgba(0,0,0,.6)] ring-1 backdrop-blur-xl'>
        <div className='flex items-start justify-between gap-3'>
          <h2 className='bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-lg font-semibold text-transparent'>
            Advanced search
          </h2>
          <button
            type='button'
            aria-label='Close'
            onClick={onClose}
            className='bg-white/6 hover:bg-white/9 rounded-md px-2 py-1 text-sm text-white/90 ring-1 ring-white/15 transition'
          >
            ✕
          </button>
        </div>

        <div className='mt-4 grid gap-4 md:grid-cols-2'>
          <label className='block'>
            <span className='text-sm text-white/85'>Query</span>
            <input
              value={q}
              onChange={event => setQ(event.target.value)}
              placeholder='e.g., sleep, GABA, adaptogen'
              className='bg-white/14 ring-white/12 mt-1 w-full rounded-lg px-3 py-2 text-white/90 placeholder-white/50 ring-1 backdrop-blur-xl'
            />
          </label>

          <div>
            <span className='text-sm text-white/85'>Tags</span>
            <div className='mt-1 flex flex-wrap gap-2'>
              {TAG_CATALOG.map(tag => {
                const normalized = norm(tag)
                const active = tags.includes(normalized)
                return (
                  <button
                    key={tag}
                    type='button'
                    onClick={() => toggleTag(tag)}
                    className={`pill transition ${
                      active ? 'text-lime-200 ring-1 ring-lime-300' : 'hover:bg-white/9'
                    }`}
                  >
                    {tag}
                  </button>
                )
              })}
            </div>
          </div>
          <div>
            <span className='text-sm text-white/85'>Pregnancy safety</span>
            <div className='mt-1 flex items-center gap-2'>
              <button
                type='button'
                className={`pill ${pregSafe === null ? 'ring-1 ring-white/20' : 'hover:bg-white/9'}`}
                onClick={() => setPregSafe(null)}
              >
                Any
              </button>
              <button
                type='button'
                className={`pill ${pregSafe === true ? 'text-lime-200 ring-1 ring-lime-300' : 'hover:bg-white/9'}`}
                onClick={() => setPregSafe(true)}
              >
                Explicitly safe
              </button>
              <button
                type='button'
                className={`pill ${pregSafe === false ? 'text-rose-200 ring-1 ring-rose-300' : 'hover:bg-white/9'}`}
                onClick={() => setPregSafe(false)}
              >
                Show cautions
              </button>
            </div>
          </div>

          <div>
            <span className='text-sm text-white/85'>MAOI/SSRI interactions</span>
            <div className='mt-1 flex items-center gap-2'>
              <button
                type='button'
                className={`pill ${maoiSsr === null ? 'ring-1 ring-white/20' : 'hover:bg-white/9'}`}
                onClick={() => setMaoiSsr(null)}
              >
                Any
              </button>
              <button
                type='button'
                className={`pill ${maoiSsr === true ? 'text-amber-200 ring-1 ring-amber-300' : 'hover:bg-white/9'}`}
                onClick={() => setMaoiSsr(true)}
              >
                Must have caution
              </button>
              <button
                type='button'
                className={`pill ${maoiSsr === false ? 'text-lime-200 ring-1 ring-lime-300' : 'hover:bg-white/9'}`}
                onClick={() => setMaoiSsr(false)}
              >
                Exclude cautions
              </button>
            </div>
          </div>

          <div className='md:col-span-2'>
            <span className='text-sm text-white/85'>Intensity range</span>
            <div className='mt-2 flex flex-wrap items-center gap-3 text-sm text-white/75'>
              <input
                type='range'
                min={0}
                max={10}
                value={intensity[0]}
                onChange={event => {
                  const next = Number(event.target.value)
                  setIntensity(prev => [Math.min(next, prev[1]), prev[1]] as [number, number])
                }}
              />
              <span>min {intensity[0]}</span>
              <input
                type='range'
                min={0}
                max={10}
                value={intensity[1]}
                onChange={event => {
                  const next = Number(event.target.value)
                  setIntensity(prev => [prev[0], Math.max(next, prev[0])] as [number, number])
                }}
              />
              <span>max {intensity[1]}</span>
            </div>
          </div>
        </div>

        <div className='mt-5 flex flex-wrap items-center justify-between gap-3 text-sm'>
          <div className='text-xs text-white/75'>{filtered.length} results</div>
          <div className='flex gap-2'>
            <button
              type='button'
              className='btn-secondary rounded-lg px-3 py-1.5'
              onClick={() => {
                setQ('')
                setTags([])
                setPregSafe(null)
                setMaoiSsr(null)
                setIntensity([0, 10])
              }}
            >
              Reset
            </button>
            <button
              type='button'
              className='btn-primary rounded-lg px-3 py-1.5'
              onClick={() => {
                onApply(filtered)
                onClose()
              }}
            >
              Apply filters
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
