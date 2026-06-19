'use client'

import { useState, useMemo } from 'react'
import { Activity, Info, Clock, AlertTriangle, ArrowRight } from 'lucide-react'
import { resolveBestProduct, type ResolvedProductRoute } from '../../lib/affiliate-intelligence-routing'
import AffiliateProductCard from '../sourcing/AffiliateProductCard'

interface IngredientModel {
  slug: string
  name: string
  type: 'acute' | 'cumulative'
  defaultDose: number
  minDose: number
  maxDose: number
  unit: string
  onsetLabel: string
  peakLabel: string
  halfLifeLabel: string
  mechanismText: string
  // Math parameters
  onsetHours?: number
  peakHours?: number
  halfLifeHours?: number
  tauDays?: number // accumulation constant for cumulative
}

const INGREDIENTS: IngredientModel[] = [
  {
    slug: 'caffeine',
    name: 'Caffeine Anhydrous',
    type: 'acute',
    defaultDose: 100,
    minDose: 50,
    maxDose: 400,
    unit: 'mg',
    onsetLabel: '15 - 30 minutes',
    peakLabel: '45 - 60 minutes',
    halfLifeLabel: '4 - 6 hours',
    onsetHours: 0.33,
    peakHours: 1.0,
    halfLifeHours: 5.0,
    mechanismText: 'Acutely antagonizes adenosine A1 and A2A receptors, preventing sleep-signal accumulation and raising catecholamines.',
  },
  {
    slug: 'l-theanine',
    name: 'L-Theanine',
    type: 'acute',
    defaultDose: 200,
    minDose: 50,
    maxDose: 400,
    unit: 'mg',
    onsetLabel: '30 - 45 minutes',
    peakLabel: '1.5 - 2 hours',
    halfLifeLabel: '3 hours',
    onsetHours: 0.5,
    peakHours: 1.75,
    halfLifeHours: 3.0,
    mechanismText: 'Promotes alpha brainwave activity and antagonizes excitatory glutamate receptors, inducing calm focus.',
  },
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    type: 'acute',
    defaultDose: 250,
    minDose: 100,
    maxDose: 600,
    unit: 'mg',
    onsetLabel: '30 - 60 minutes',
    peakLabel: '2 - 3 hours',
    halfLifeLabel: '5 hours',
    onsetHours: 0.75,
    peakHours: 2.5,
    halfLifeHours: 5.0,
    mechanismText: 'Acutely inhibits monoamine oxidase (MAO) and modulates cortisol release, improving cognitive endurance under stress.',
  },
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha Extract',
    type: 'cumulative',
    defaultDose: 300,
    minDose: 150,
    maxDose: 1000,
    unit: 'mg',
    onsetLabel: '7 - 14 days',
    peakLabel: '30 days',
    halfLifeLabel: 'N/A (cumulative)',
    tauDays: 10,
    mechanismText: 'Gradually modulates the hypothalamus-pituitary-adrenal (HPA) axis, reducing serum cortisol and mitigating autonomic stress response.',
  },
  {
    slug: 'berberine',
    name: 'Berberine HCl',
    type: 'cumulative',
    defaultDose: 500,
    minDose: 250,
    maxDose: 1500,
    unit: 'mg',
    onsetLabel: '5 - 10 days',
    peakLabel: '21 days',
    halfLifeLabel: 'N/A (cumulative)',
    tauDays: 7,
    mechanismText: 'Activates AMP-activated protein kinase (AMPK), modulating cellular metabolic pathways and glucose transport over time.',
  },
]

export default function EfficacyModelerClient() {
  const [selectedSlug, setSelectedSlug] = useState('caffeine')
  const [dose, setDose] = useState(100)
  const [stopDosingCumulative, setStopDosingCumulative] = useState(false)
  const [sortPreference, setSortPreference] = useState<'cost' | 'potency' | 'certification'>('cost')

  const activeIngredient = useMemo(() => {
    const ing = INGREDIENTS.find(i => i.slug === selectedSlug) || INGREDIENTS[0]
    return ing
  }, [selectedSlug])

  // Reset dosage to default when changing ingredients
  const handleIngredientChange = (slug: string) => {
    setSelectedSlug(slug)
    const target = INGREDIENTS.find(i => i.slug === slug)
    if (target) {
      setDose(target.defaultDose)
    }
  }

  // Resolve best affiliate product based on dosage and sorting preference
  const matchedRoute = useMemo(() => {
    return resolveBestProduct(activeIngredient.slug, dose, sortPreference)
  }, [activeIngredient, dose, sortPreference])

  // Math models for drawing the graph
  const graphPoints = useMemo(() => {
    const points: { x: number; y: number }[] = []
    const isAcute = activeIngredient.type === 'acute'

    if (isAcute) {
      // Plot 24 hours, step = 0.2 hours (120 points)
      const tOnset = activeIngredient.onsetHours || 0.5
      const tPeak = activeIngredient.peakHours || 1.5
      const tHalf = activeIngredient.halfLifeHours || 4.0

      const ke = Math.log(2) / tHalf
      const ka = 3.0 / tPeak

      // Normalize amplitude based on dosage range
      const ratio = dose / activeIngredient.maxDose
      const amplitude = ratio * 90 // Max height in SVG coordinates

      for (let t = 0; t <= 24; t += 0.2) {
        // Double exponential curve representing absorption and elimination
        let val = 0
        if (t >= 0) {
          const factor = ka / (ka - ke)
          val = amplitude * factor * (Math.exp(-ke * t) - Math.exp(-ka * t))
        }
        points.push({ x: t, y: Math.max(0, val) })
      }
    } else {
      // Plot 60 days, step = 1 day (60 points)
      const tau = activeIngredient.tauDays || 10
      const ratio = dose / activeIngredient.maxDose
      const amplitude = ratio * 90

      for (let d = 0; d <= 60; d++) {
        let val = 0
        if (stopDosingCumulative && d > 30) {
          // Decay starting from Day 30
          const valAt30 = amplitude * (1 - Math.exp(-30 / tau))
          val = valAt30 * Math.exp(-(d - 30) / 7)
        } else {
          // Accumulation
          val = amplitude * (1 - Math.exp(-d / tau))
        }
        points.push({ x: d, y: Math.max(0, val) })
      }
    }

    return points
  }, [activeIngredient, dose, stopDosingCumulative])

  // Convert points to SVG polyline / path coordinates
  const svgPath = useMemo(() => {
    if (graphPoints.length === 0) return ''
    const width = 600
    const height = 200
    const padding = 20

    const isAcute = activeIngredient.type === 'acute'
    const maxX = isAcute ? 24 : 60

    return graphPoints
      .map((p, i) => {
        const xPercent = p.x / maxX
        const xSvg = padding + xPercent * (width - 2 * padding)
        // Invert Y because SVG origin is top-left
        const ySvg = height - padding - (p.y / 100) * (height - 2 * padding)
        return `${i === 0 ? 'M' : 'L'} ${xSvg.toFixed(1)} ${ySvg.toFixed(1)}`
      })
      .join(' ')
  }, [graphPoints, activeIngredient])

  // Find Peak coordinates for labeling
  const peakCoord = useMemo(() => {
    if (graphPoints.length === 0) return null
    let maxPt = graphPoints[0]
    for (const pt of graphPoints) {
      if (pt.y > maxPt.y) {
        maxPt = pt
      }
    }

    const width = 600
    const height = 200
    const padding = 20
    const isAcute = activeIngredient.type === 'acute'
    const maxX = isAcute ? 24 : 60

    const xPercent = maxPt.x / maxX
    const xSvg = padding + xPercent * (width - 2 * padding)
    const ySvg = height - padding - (maxPt.y / 100) * (height - 2 * padding)

    return {
      x: xSvg,
      y: ySvg,
      valX: maxPt.x,
      valY: maxPt.y,
    }
  }, [graphPoints, activeIngredient])

  return (
    <div className='space-y-8'>
      {/* Selector and Controls Header */}
      <div className='grid gap-6 md:grid-cols-3'>
        {/* Ingredient selection */}
        <div className='md:col-span-1 rounded-3xl border border-brand-900/10 bg-white p-5 space-y-4 shadow-xs'>
          <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
            1. Select Ingredient
          </h3>
          <div className='flex flex-col gap-2'>
            {INGREDIENTS.map(ing => (
              <button
                key={ing.slug}
                onClick={() => handleIngredientChange(ing.slug)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-bold transition-all border cursor-pointer ${
                  selectedSlug === ing.slug
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{ing.name}</span>
                <span
                  className={`rounded-full px-2 py-0.5 text-[9px] uppercase font-bold shrink-0 ${
                    ing.type === 'acute'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}
                >
                  {ing.type}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Modeler Controls Dashboard */}
        <div className='md:col-span-2 rounded-3xl border border-brand-900/10 bg-white p-6 space-y-6 shadow-xs flex flex-col justify-between'>
          <div className='space-y-4'>
            <div className='flex items-start justify-between gap-4'>
              <div>
                <h2 className='text-xl font-bold text-slate-800'>{activeIngredient.name}</h2>
                <p className='text-xs text-slate-500 mt-1'>{activeIngredient.mechanismText}</p>
              </div>
            </div>

            {/* Dosage Slider */}
            <div className='space-y-3 pt-2'>
              <div className='flex items-center justify-between'>
                <span className='text-xs font-bold text-slate-600'>Adjust Modeler Dosage:</span>
                <span className='text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-100'>
                  {dose} {activeIngredient.unit}
                </span>
              </div>
              <input
                type='range'
                min={activeIngredient.minDose}
                max={activeIngredient.maxDose}
                step={activeIngredient.slug === 'caffeine' || activeIngredient.slug === 'l-theanine' ? 50 : 50}
                value={dose}
                onChange={e => setDose(Number(e.target.value))}
                className='w-full accent-emerald-600 h-2 bg-slate-100 rounded-lg cursor-pointer appearance-none'
              />
              <div className='flex justify-between text-[10px] text-slate-400'>
                <span>Min: {activeIngredient.minDose}mg</span>
                <span>Max: {activeIngredient.maxDose}mg</span>
              </div>
            </div>

            {/* Cumulative compliance toggle */}
            {activeIngredient.type === 'cumulative' && (
              <div className='flex items-center gap-3 bg-indigo-50/50 border border-indigo-100/50 rounded-2xl p-3.5'>
                <input
                  type='checkbox'
                  id='stop-dosing-check'
                  checked={stopDosingCumulative}
                  onChange={e => setStopDosingCumulative(e.target.checked)}
                  className='h-4 w-4 rounded-md border-indigo-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer'
                />
                <label htmlFor='stop-dosing-check' className='text-xs text-indigo-900 cursor-pointer font-semibold'>
                  Simulate discontinuing daily dose at Day 30 (visualize washout period)
                </label>
              </div>
            )}
          </div>

          {/* Quick Metrics Bar */}
          <div className='grid grid-cols-3 gap-2 border-t border-slate-100 pt-4'>
            <div className='text-center p-2 rounded-2xl bg-slate-50 border border-slate-100/50'>
              <span className='block text-[9px] uppercase tracking-wider text-slate-400 font-bold'>Onset</span>
              <span className='text-xs font-black text-slate-700 mt-0.5 block'>{activeIngredient.onsetLabel}</span>
            </div>
            <div className='text-center p-2 rounded-2xl bg-slate-50 border border-slate-100/50'>
              <span className='block text-[9px] uppercase tracking-wider text-slate-400 font-bold'>Peak Action</span>
              <span className='text-xs font-black text-slate-700 mt-0.5 block'>{activeIngredient.peakLabel}</span>
            </div>
            <div className='text-center p-2 rounded-2xl bg-slate-50 border border-slate-100/50'>
              <span className='block text-[9px] uppercase tracking-wider text-slate-400 font-bold'>Clearance / HL</span>
              <span className='text-xs font-black text-slate-700 mt-0.5 block'>{activeIngredient.halfLifeLabel}</span>
            </div>
          </div>
        </div>
      </div>

      {/* SVG Interactive Chart Curve */}
      <div className='rounded-3xl border border-brand-900/10 bg-white p-6 shadow-xs space-y-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Activity className='h-4 w-4 text-emerald-600' />
            <h3 className='text-sm font-bold text-slate-800'>
              Efficacy Curve & Plasma Concentration Map
            </h3>
          </div>
          <span className='text-[10px] bg-slate-100 text-slate-500 rounded-lg px-2 py-1 font-bold uppercase'>
            Client-Side Simulation
          </span>
        </div>

        {/* Chart Window */}
        <div className='relative w-full overflow-hidden bg-slate-50/50 rounded-2xl border border-slate-100 pt-4 pb-2'>
          <svg
            viewBox='0 0 600 200'
            className='w-full h-auto overflow-visible'
          >
            {/* Grid Lines */}
            <line x1='20' y1='20' x2='20' y2='180' stroke='#e2e8f0' strokeWidth='1' />
            <line x1='20' y1='180' x2='580' y2='180' stroke='#e2e8f0' strokeWidth='1' />

            <line x1='20' y1='100' x2='580' y2='100' stroke='#f1f5f9' strokeWidth='1' strokeDasharray='4 4' />
            <line x1='20' y1='20' x2='580' y2='20' stroke='#f1f5f9' strokeWidth='1' strokeDasharray='4 4' />

            {/* Timelines labels */}
            {activeIngredient.type === 'acute' ? (
              <>
                {/* 0, 6, 12, 18, 24 Hours */}
                <text x='20' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>0h</text>
                <text x='160' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>6h</text>
                <text x='300' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>12h</text>
                <text x='440' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>18h</text>
                <text x='580' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>24h</text>
              </>
            ) : (
              <>
                {/* 0, 15, 30, 45, 60 Days */}
                <text x='20' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>Day 0</text>
                <text x='160' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>Day 15</text>
                <text x='300' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>Day 30</text>
                <text x='440' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>Day 45</text>
                <text x='580' y='195' textAnchor='middle' fontSize='9' fill='#94a3b8' fontWeight='bold'>Day 60</text>
              </>
            )}

            {/* SVG Path Curve */}
            {svgPath && (
              <path
                d={svgPath}
                fill='none'
                stroke={activeIngredient.type === 'acute' ? '#358f52' : '#6366f1'}
                strokeWidth='3.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            )}

            {/* Peak Dot & Marker */}
            {peakCoord && peakCoord.valY > 0 && (
              <>
                <circle
                  cx={peakCoord.x}
                  cy={peakCoord.y}
                  r='5'
                  fill={activeIngredient.type === 'acute' ? '#1b4a2f' : '#4f46e5'}
                  stroke='#ffffff'
                  strokeWidth='1.5'
                />
                <text
                  x={peakCoord.x}
                  y={peakCoord.y - 10}
                  textAnchor='middle'
                  fontSize='10'
                  fontWeight='bold'
                  fill={activeIngredient.type === 'acute' ? '#1b4a2f' : '#4f46e5'}
                >
                  Peak ({peakCoord.valY.toFixed(0)}% max)
                </text>
              </>
            )}
          </svg>
        </div>

        {/* Chart Explainer Alert */}
        <div className='flex items-start gap-3 rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50'>
          <Info className='h-4 w-4 text-amber-700 shrink-0 mt-0.5' />
          <div className='text-xs text-amber-900 leading-normal space-y-1'>
            <p className='font-bold'>Pharmacokinetic Curve Interpretation:</p>
            <p>
              This chart demonstrates modeled physiological absorption rates and clearance thresholds.
              Individual neurochemistry, metabolism, genetics, food intake, and enzyme status (such as CYP1A2 for caffeine clearance) will significantly alter your actual timing curve.
            </p>
          </div>
        </div>
      </div>

      {/* Sourcing Conversion Block: Affiliate Cards & Router Integration */}
      <div className='space-y-6 pt-4'>
        <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4'>
          <div>
            <h2 className='text-2xl font-bold text-slate-800'>Verified Sourcing Recommendations</h2>
            <p className='text-xs text-slate-500 mt-1'>
              We rank and resolve verified third-party tested supplements optimized for your target dose of{' '}
              <strong className='text-emerald-800 font-semibold'>{dose}mg</strong>.
            </p>
          </div>

          {/* Sorting preference selector */}
          <div className='flex items-center gap-2 bg-slate-100/80 border border-slate-200/50 p-1 rounded-2xl text-xs font-bold text-slate-600 shrink-0'>
            <span className='px-2 py-1 text-[10px] uppercase text-slate-400'>Rank By:</span>
            <button
              onClick={() => setSortPreference('cost')}
              className={`rounded-xl px-3 py-1 cursor-pointer ${
                sortPreference === 'cost' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-800'
              }`}
            >
              Lowest Cost
            </button>
            <button
              onClick={() => setSortPreference('potency')}
              className={`rounded-xl px-3 py-1 cursor-pointer ${
                sortPreference === 'potency' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-800'
              }`}
            >
              Potency
            </button>
            <button
              onClick={() => setSortPreference('certification')}
              className={`rounded-xl px-3 py-1 cursor-pointer ${
                sortPreference === 'certification' ? 'bg-white text-emerald-800 shadow-xs' : 'hover:text-slate-800'
              }`}
            >
              Quality Checks
            </button>
          </div>
        </div>

        {/* Display recommendations */}
        {matchedRoute ? (
          <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
            <AffiliateProductCard
              route={matchedRoute}
              isBestCost={sortPreference === 'cost'}
              isBestPotency={sortPreference === 'potency'}
              isBestCert={sortPreference === 'certification'}
            />

            {/* Educational Decision Sidebar Card */}
            <div className='rounded-3xl border border-brand-900/10 bg-slate-50/50 p-5 space-y-4 flex flex-col justify-between'>
              <div className='space-y-3'>
                <div className='flex items-center gap-2 text-indigo-900 font-bold text-sm'>
                  <ShieldCheck className='h-4 w-4 text-indigo-700' />
                  <span>Sourcing Quality Standards</span>
                </div>
                <p className='text-xs text-slate-600 leading-relaxed'>
                  All recommended vendors carry current GMP (Good Manufacturing Practice) certification. Products undergo third-party laboratory analysis to verify concentration integrity and check for contaminants like heavy metals, pesticide residues, and microbial impurities.
                </p>
                <div className='space-y-2 text-[11px] text-slate-500 pt-1'>
                  <div className='flex items-center gap-1.5'>
                    <ArrowRight className='h-3 w-3 text-emerald-600' />
                    <span>GMP: Good Manufacturing Practices</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <ArrowRight className='h-3 w-3 text-emerald-600' />
                    <span>COA: Certificate of Analysis (verified purity)</span>
                  </div>
                  <div className='flex items-center gap-1.5'>
                    <ArrowRight className='h-3 w-3 text-emerald-600' />
                    <span>USP: United States Pharmacopeia standards</span>
                  </div>
                </div>
              </div>
              <div className='pt-2'>
                <p className='text-[10px] text-slate-400 italic leading-snug'>
                  Always consult a clinical specialist before starting a new supplement regimen, especially if taking pharmaceutical therapeutics or diagnosed with underlying conditions.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className='py-8 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-[2rem] bg-white/50'>
            No specific product registry matches for this dosage query. Check standard buy guides.
          </div>
        )}
      </div>
    </div>
  )
}

function ShieldCheck({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill='none'
      viewBox='0 0 24 24'
      strokeWidth={2.5}
      stroke='currentColor'
    >
      <path strokeLinecap='round' strokeLinejoin='round' d='M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z' />
    </svg>
  )
}
