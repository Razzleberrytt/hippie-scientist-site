'use client'

import { useState, useMemo } from 'react'
import { HelpCircle, RefreshCw, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react'
import { resolveBestProduct } from '../../lib/affiliate-intelligence-routing'
import AffiliateProductCard from './AffiliateProductCard'

interface SwapReason {
  id: string
  label: string
  explanation: string
}

interface SwapAlternative {
  slug: string
  name: string
  defaultDose: number
  whySafer: string
  mechanisms: string[]
}

interface SwapIngredient {
  slug: string
  name: string
  reasons: SwapReason[]
  alternatives: Record<string, SwapAlternative[]> // keyed by reason ID
}

const SWAP_DATA: SwapIngredient[] = [
  {
    slug: 'caffeine',
    name: 'Caffeine / Stimulants',
    reasons: [
      {
        id: 'sens',
        label: 'Stimulant Sensitivity / Jitters',
        explanation: 'Caffeine acts as a non-selective adenosine antagonist, increasing epinephrine and norepinephrine which can trigger palpitations, trembling, and state anxiety.',
      },
      {
        id: 'sleep',
        label: 'Sleep Disorders / Insomnia',
        explanation: 'Caffeine has a half-life of 5 hours. Dosing past noon blocks adenosine buildup, disrupting delta slow-wave sleep architecture.',
      },
    ],
    alternatives: {
      sens: [
        {
          slug: 'l-tyrosine',
          name: 'L-Tyrosine',
          defaultDose: 500,
          whySafer: 'Direct catecholamine precursor. Raises dopamine and noradrenaline levels under cognitive load without the raw epinephrine spikes or heart-rate elevation associated with caffeine.',
          mechanisms: ['Dopamine synthesis upregulation', 'Cold-stress cognitive protection'],
        },
        {
          slug: 'l-theanine',
          name: 'L-Theanine',
          defaultDose: 200,
          whySafer: 'Promotes alpha brainwaves and calms glutamate transmission, sustaining clear attention without cardiovascular excitation.',
          mechanisms: ['GABAergic modulation', 'Glutamate receptor antagonism'],
        },
      ],
      sleep: [
        {
          slug: 'rhodiola-rosea',
          name: 'Rhodiola Rosea',
          defaultDose: 250,
          whySafer: 'Adaptogen that reduces fatigue by modulating serotonin and cortisol. Has a faster clearance profile than caffeine and does not block sleep-inducing adenosine receptors.',
          mechanisms: ['MAO-A/B inhibition', 'Cortisol regulation'],
        },
      ],
    },
  },
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    reasons: [
      {
        id: 'thyroid',
        label: 'Thyroid Disorders / Hyperthyroidism',
        explanation: 'Ashwagandha may stimulate thyroid hormone synthesis (T3/T4 conversion), potentially precipitating thyrotoxicosis in hyperthyroid patients.',
      },
      {
        id: 'autoimmune',
        label: 'Autoimmune Diseases',
        explanation: 'Withanolides in ashwagandha modulate immune cells and can theoretically amplify inflammatory flares in rheumatoid arthritis, lupus, or MS.',
      },
    ],
    alternatives: {
      thyroid: [
        {
          slug: 'l-theanine',
          name: 'L-Theanine',
          defaultDose: 150,
          whySafer: 'Soothes nervous system hyper-excitation through GABA-A pathway without stimulating systemic endocrine or thyroid hormone pathways.',
          mechanisms: ['Alpha brainwave amplification', 'Endocrine-neutral relaxation'],
        },
      ],
      autoimmune: [
        {
          slug: 'rhodiola-rosea',
          name: 'Rhodiola Rosea',
          defaultDose: 250,
          whySafer: 'Modulates HPA axis cortisol and catecholamine release without stimulating systemic immune cell profiles in a pro-inflammatory direction.',
          mechanisms: ['HPA-axis stabilizing', 'Adaptogenic cortisol buffer'],
        },
      ],
    },
  },
]

export default function SubstitutionEnginePanel() {
  const [selectedIngredientSlug, setSelectedIngredientSlug] = useState('caffeine')
  const [selectedReasonId, setSelectedReasonId] = useState('sens')

  const currentIngredient = useMemo(() => {
    return SWAP_DATA.find(item => item.slug === selectedIngredientSlug) || SWAP_DATA[0]
  }, [selectedIngredientSlug])

  // Reset reason selection when ingredient changes
  const handleIngredientChange = (slug: string) => {
    setSelectedIngredientSlug(slug)
    const target = SWAP_DATA.find(i => i.slug === slug)
    if (target && target.reasons[0]) {
      setSelectedReasonId(target.reasons[0].id)
    }
  }

  const currentReason = useMemo(() => {
    return currentIngredient.reasons.find(r => r.id === selectedReasonId) || currentIngredient.reasons[0]
  }, [currentIngredient, selectedReasonId])

  const recommendations = useMemo(() => {
    const list = currentIngredient.alternatives[selectedReasonId] || []
    return list.map(item => {
      // Resolve product from registry
      const productRoute = resolveBestProduct(item.slug, item.defaultDose, 'cost')
      return {
        ...item,
        productRoute,
      }
    })
  }, [currentIngredient, selectedReasonId])

  return (
    <div className='space-y-8'>
      {/* 2-Step Selector Layout */}
      <div className='grid gap-6 md:grid-cols-2'>
        {/* Ingredient Choice */}
        <div className='rounded-3xl border border-brand-900/10 bg-white p-5 space-y-4 shadow-xs'>
          <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
            1. Select Ingredient to Replace
          </h3>
          <div className='flex flex-col gap-2'>
            {SWAP_DATA.map(item => (
              <button
                key={item.slug}
                onClick={() => handleIngredientChange(item.slug)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-left text-sm font-bold border transition-all cursor-pointer ${
                  selectedIngredientSlug === item.slug
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{item.name}</span>
                <RefreshCw className={`h-4 w-4 shrink-0 ${selectedIngredientSlug === item.slug ? 'text-emerald-600' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Reason / Contraindication Choice */}
        <div className='rounded-3xl border border-brand-900/10 bg-white p-5 space-y-4 shadow-xs'>
          <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
            2. Choose Your Contraindication
          </h3>
          <div className='flex flex-col gap-2'>
            {currentIngredient.reasons.map(reason => (
              <button
                key={reason.id}
                onClick={() => setSelectedReasonId(reason.id)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3.5 border text-left text-sm font-bold transition-all cursor-pointer ${
                  selectedReasonId === reason.id
                    ? 'bg-amber-50 text-amber-900 border-amber-300'
                    : 'bg-white text-slate-700 border-slate-100 hover:bg-slate-50'
                }`}
              >
                <span>{reason.label}</span>
                <HelpCircle className={`h-4 w-4 shrink-0 ${selectedReasonId === reason.id ? 'text-amber-600' : 'text-slate-300'}`} />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rationale Alert */}
      {currentReason && (
        <div className='flex items-start gap-4 rounded-3xl bg-amber-50/50 p-5 border border-amber-100/50 shadow-xs'>
          <AlertTriangle className='h-5 w-5 text-amber-700 shrink-0 mt-0.5' />
          <div className='text-xs text-amber-900 leading-relaxed space-y-1.5'>
            <h4 className='font-bold text-sm'>
              Clinical Mechanism for Avoiding {currentIngredient.name}:
            </h4>
            <p>{currentReason.explanation}</p>
          </div>
        </div>
      )}

      {/* Suggested Substitutes List */}
      <div className='space-y-6'>
        <div className='border-b border-slate-100 pb-3'>
          <h3 className='text-xl font-bold text-slate-800'>Safer Botanical Alternatives</h3>
          <p className='text-xs text-slate-500 mt-1'>
            These options provide similar cognitive benefits without aggravating the selected contraindication.
          </p>
        </div>

        <div className='space-y-8'>
          {recommendations.map(alt => (
            <div
              key={alt.slug}
              className='grid gap-6 lg:grid-cols-3 bg-white border border-brand-900/10 rounded-[2.5rem] p-6 shadow-xs relative overflow-hidden'
            >
              {/* Substitute description & mechanisms */}
              <div className='lg:col-span-2 space-y-4 flex flex-col justify-between'>
                <div className='space-y-3'>
                  <div className='flex items-center gap-2'>
                    <span className='rounded-full bg-emerald-50 border border-emerald-100 text-emerald-800 px-3 py-1 text-xs font-black uppercase tracking-wider'>
                      Substitute: {alt.name}
                    </span>
                  </div>
                  <h4 className='text-base font-bold text-slate-800 pt-1'>
                    Why this is a safer mechanism:
                  </h4>
                  <p className='text-xs text-slate-600 leading-relaxed'>
                    {alt.whySafer}
                  </p>
                </div>

                <div className='space-y-2 pt-2 border-t border-slate-100'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400 block'>
                    Target Receptor Pathways
                  </span>
                  <div className='flex flex-wrap gap-2'>
                    {alt.mechanisms.map(mech => (
                      <span
                        key={mech}
                        className='inline-flex items-center gap-1 text-[10.5px] font-semibold text-slate-600 bg-slate-50 border border-slate-100/80 px-2.5 py-1 rounded-xl'
                      >
                        <ArrowRight className='h-3 w-3 text-emerald-600 shrink-0' />
                        {mech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Resolved Affiliate Card for Substitute */}
              <div className='lg:col-span-1 border-t lg:border-t-0 lg:border-l border-slate-100 pt-6 lg:pt-0 lg:pl-6 flex flex-col justify-center'>
                {alt.productRoute ? (
                  <AffiliateProductCard
                    route={alt.productRoute}
                    isBestCost
                  />
                ) : (
                  <div className='h-full flex items-center justify-center p-4 border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400 italic text-center'>
                    No specific product registry recommendation found for {alt.name}.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
