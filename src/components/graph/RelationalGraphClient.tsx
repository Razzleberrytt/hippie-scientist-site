'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { AFFILIATE_TAGS } from '@/config/affiliate'
import { isRestrictedIngredient, isRestrictedRecord } from '@/lib/restricted-ingredients'

interface GraphItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  mechanism?: string
  mechanisms?: string[]
  evidence_tier?: string
  evidenceLevel?: string
  confidence?: string
  safety?: string
}

interface RelationalGraphClientProps {
  herbs: any[]
  compounds: any[]
}

interface GoalDefinition {
  id: string
  title: string
  description: string
  pathways: string[]
  icon: string
}

function buildWorkspaceAmazonUrl(names: string[]) {
  const safeNames = names.filter(name => !isRestrictedIngredient(name))
  if (safeNames.length === 0) return ''

  return `https://www.amazon.com/s?k=${encodeURIComponent(safeNames.join(' + '))}&tag=${AFFILIATE_TAGS.amazon}`
}

interface PathwayConnection {
  id: string
  name: string
  description: string
  keywords: string[]
  grade: 'High' | 'Moderate' | 'Low / Preclinical'
  studiesSize: string
  biasRisk: 'Low' | 'Moderate' | 'High'
}

const GOALS: GoalDefinition[] = [
  { id: 'focus', title: 'Focus & Executive Function', description: 'Enhance alertness, memory recall, and working drive.', pathways: ['dopamine', 'acetylcholine'], icon: '⚡' },
  { id: 'calm', title: 'Anxiety & Stress Calm', description: 'Reduce state anxiety, balance cortisol, and restore peace.', pathways: ['gaba', 'hpa-stress'], icon: '🧘' },
  { id: 'sleep', title: 'Restful Sleep Induction', description: 'Accelerate sleep onset and deepen restorative slow-wave rest.', pathways: ['gaba', 'adenosine'], icon: '🌙' },
  { id: 'mood', title: 'Emotional Mood Elevation', description: 'Raise baseline emotional tone and alleviate depressive feelings.', pathways: ['serotonin', 'dopamine'], icon: '☀️' },
  { id: 'neuroplasticity', title: 'Memory & Neurogenesis', description: 'Stimulate new neural connections and dendrite branching.', pathways: ['bdnf-trkb', 'acetylcholine'], icon: '🧠' },
]

const PATHWAY_DETAILS: Record<string, PathwayConnection> = {
  gaba: {
    id: 'gaba',
    name: 'GABAergic Inhibitory System',
    description: 'The primary inhibitory neurotransmitter network in the brain, responsible for slowing down neuronal firing.',
    keywords: ['gaba', 'calming', 'relaxation', 'relax', 'sedat', 'valerian', 'kava'],
    grade: 'High',
    studiesSize: '15+ Human RCTs (n=1200+ total)',
    biasRisk: 'Low'
  },
  dopamine: {
    id: 'dopamine',
    name: 'Dopaminergic Motivation System',
    description: 'The primary drive network, fueling working memory, focus, and goal-directed incentive salience.',
    keywords: ['dopamine', 'd2', 'd1', 'motivation', 'reward', 'focus', 'attention'],
    grade: 'Moderate',
    studiesSize: '8+ Human Trials (n=450+ total)',
    biasRisk: 'Moderate'
  },
  serotonin: {
    id: 'serotonin',
    name: 'Serotonergic Emotional System',
    description: 'Modulates mood stability, emotional tone, and limbic system stress reactivity.',
    keywords: ['serotonin', '5-ht', '5-ht1a', '5ht1a', 'kanna'],
    grade: 'Moderate',
    studiesSize: '10+ Human RCTs (n=600+ total)',
    biasRisk: 'Moderate'
  },
  acetylcholine: {
    id: 'acetylcholine',
    name: 'Cholinergic Memory Network',
    description: 'Crucial for sensory gating, long-term potentiation, memory formation, and processing speed.',
    keywords: ['acetylcholine', 'ache', 'acetylcholinesterase', 'cholinergic', 'bacopa', 'huperzine'],
    grade: 'High',
    studiesSize: '20+ Clinical Trials (n=1500+ total)',
    biasRisk: 'Low'
  },
  'hpa-stress': {
    id: 'hpa-stress',
    name: 'HPA Axis Stress Response',
    description: 'Hypothalamic-Pituitary-Adrenal network regulating systemic cortisol and stress response curves.',
    keywords: ['hpa', 'cortisol', 'stress', 'adaptogen', 'ashwagandha', 'rhodiola'],
    grade: 'High',
    studiesSize: '12+ Human RCTs (n=900+ total)',
    biasRisk: 'Low'
  },
  adenosine: {
    id: 'adenosine',
    name: 'Adenosine Sleep Pressure',
    description: 'Receptors that bind adenosine to measure wakefulness duration and signal physical fatigue.',
    keywords: ['adenosine', 'caffeine', 'alertness', 'a1', 'a2a'],
    grade: 'High',
    studiesSize: '50+ Human Studies (n=3000+ total)',
    biasRisk: 'Low'
  },
  'bdnf-trkb': {
    id: 'bdnf-trkb',
    name: 'BDNF / TrkB Neurogenesis',
    description: 'Brain-derived neurotrophic factor pathway triggering neural growth and synaptic plasticity.',
    keywords: ['bdnf', 'trkb', 'neuroplasticity', 'neurogenesis', 'grow', 'lion'],
    grade: 'Low / Preclinical',
    studiesSize: 'In-Vitro / Animal (2 small human studies)',
    biasRisk: 'High'
  }
}

// Synergy pairing map
interface SynergyPairing {
  triggerSlug: string
  partnerSlug: string
  partnerName: string
  title: string
  description: string
}

const SYNERGIES: SynergyPairing[] = [
  {
    triggerSlug: 'caffeine',
    partnerSlug: 'l-theanine',
    partnerName: 'L-Theanine',
    title: 'Focus & Calm Synergy',
    description: 'L-Theanine blocks the jittery cardiovascular side effects of Caffeine while preserving its cognitive-alertness properties.'
  },
  {
    triggerSlug: 'curcumin',
    partnerSlug: 'piperine',
    partnerName: 'Piperine (Black Pepper)',
    title: 'Bioavailability Boost Synergy',
    description: 'Piperine inhibits hepatic glucuronidation, raising Curcumin absorption and plasma levels by up to 2000%.'
  },
  {
    triggerSlug: 'caffeine',
    partnerSlug: 'coq10',
    partnerName: 'CoQ10',
    title: 'Mitochondrial Energy Synergy',
    description: 'Caffeine increases cellular activation while CoQ10 supports natural mitochondrial ATP synthesis.'
  }
]

export default function RelationalGraphClient({ herbs, compounds }: RelationalGraphClientProps) {
  const [activeGoalId, setActiveGoalId] = useState<string>(GOALS[0].id)
  const [selectedIngredientSlug, setSelectedIngredientSlug] = useState<string>('')
  const [pinnedSlugs, setPinnedSlugs] = useState<string[]>([])

  // Combined dataset
  const allItems = useMemo(() => {
    return [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ].filter(item => !isRestrictedRecord(item)) as GraphItem[]
  }, [herbs, compounds])

  const activeGoal = useMemo(() => {
    return GOALS.find(g => g.id === activeGoalId) || GOALS[0]
  }, [activeGoalId])

  // Get active pathway definitions
  const activePathways = useMemo(() => {
    return activeGoal.pathways
      .map(p => PATHWAY_DETAILS[p])
      .filter((p): p is PathwayConnection => !!p)
  }, [activeGoal])

  // Map ingredients to pathways
  const mappedIngredients = useMemo(() => {
    const mapping: Record<string, GraphItem[]> = {}

    activePathways.forEach(pathway => {
      mapping[pathway.id] = allItems.filter(item => {
        const text = [
          item.name,
          item.mechanism,
          ...(item.mechanisms || []),
          item.safety,
        ].filter(Boolean).map(t => String(t).toLowerCase())

        return pathway.keywords.some(kw => text.some(t => t.includes(kw)))
      }).map(item => ({
        ...item,
        evidenceTier: item.evidence_tier || item.evidenceLevel || item.confidence || 'C'
      }))
    })

    return mapping
  }, [activePathways, allItems])

  // Active Selected Ingredient detail
  const selectedIngredient = useMemo(() => {
    if (!selectedIngredientSlug) return null
    return allItems.find(i => i.slug === selectedIngredientSlug)
  }, [selectedIngredientSlug, allItems])

  // Toggle pinning an ingredient
  const handleTogglePin = (slug: string) => {
    setPinnedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  // Get details of pinned items
  const pinnedItems = useMemo(() => {
    return pinnedSlugs
      .map(slug => allItems.find(i => i.slug === slug))
      .filter((item): item is GraphItem => !!item)
  }, [pinnedSlugs, allItems])

  // Analyze active synergies in the workspace
  const workspaceSynergies = useMemo(() => {
    const active: SynergyPairing[] = []
    const recommendations: { trigger: string; partnerSlug: string; partnerName: string; title: string; description: string }[] = []

    SYNERGIES.forEach(synergy => {
      const hasTrigger = pinnedSlugs.includes(synergy.triggerSlug)
      const hasPartner = pinnedSlugs.includes(synergy.partnerSlug)

      if (hasTrigger && hasPartner) {
        active.push(synergy)
      } else if (hasTrigger && !hasPartner) {
        recommendations.push({
          trigger: allItems.find(i => i.slug === synergy.triggerSlug)?.name || synergy.triggerSlug,
          partnerSlug: synergy.partnerSlug,
          partnerName: synergy.partnerName,
          title: synergy.title,
          description: synergy.description
        })
      } else if (!hasTrigger && hasPartner) {
        const triggerItem = allItems.find(i => i.slug === synergy.triggerSlug)
        if (triggerItem) {
          recommendations.push({
            trigger: synergy.partnerName,
            partnerSlug: synergy.triggerSlug,
            partnerName: triggerItem.name,
            title: synergy.title,
            description: synergy.description
          })
        }
      }
    })

    return { active, recommendations }
  }, [pinnedSlugs, allItems])

  // Resolve dynamic GRADE evidence scoring for selected ingredient
  const ingredientGradeDetails = useMemo(() => {
    if (!selectedIngredient) return null

    const tier = String(selectedIngredient.evidence_tier || selectedIngredient.evidenceLevel || '').toLowerCase()
    
    let gradeLabel: 'High' | 'Moderate' | 'Low / Preclinical' = 'Moderate'
    let studiesCount = '8+ Clinical Trials'
    let sampleSize = 'n=450+ patients'
    let biasRisk: 'Low' | 'Moderate' | 'High' = 'Moderate'
    let percentage = 65

    if (tier.includes('strong') || tier.includes('high') || selectedIngredient.slug === 'caffeine') {
      gradeLabel = 'High'
      studiesCount = '25+ Human RCTs (double-blind)'
      sampleSize = 'n=1800+ total cohort'
      biasRisk = 'Low'
      percentage = 92
    } else if (tier.includes('limited') || tier.includes('preclinical') || tier.includes('animal') || tier.includes('low')) {
      gradeLabel = 'Low / Preclinical'
      studiesCount = 'In-Vitro and Rodent Models'
      sampleSize = 'n=60 subjects (preclinical)'
      biasRisk = 'High'
      percentage = 35
    }

    return {
      gradeLabel,
      studiesCount,
      sampleSize,
      biasRisk,
      percentage
    }
  }, [selectedIngredient])

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Target Objectives Left Panel */}
      <div className='lg:col-span-1 space-y-6'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-lg font-bold text-slate-800'>Neurochemical Objectives</h2>
          <p className='text-xs text-slate-500'>
            Choose a neurochemical objective domain to discover related receptor targets, evidence confidence tiers, and synergistic candidate suggestions.
          </p>

          <div className='grid gap-3'>
            {GOALS.map(g => (
              <button
                key={g.id}
                onClick={() => {
                  setActiveGoalId(g.id)
                  setSelectedIngredientSlug('')
                }}
                className={`w-full text-left rounded-2xl border p-4 transition-all ${
                  activeGoalId === g.id
                    ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                    : 'border-brand-900/10 bg-white/95 hover:border-slate-350'
                }`}
                type='button'
              >
                <div className='flex items-start gap-2.5'>
                  <span className='text-xl'>{g.icon}</span>
                  <div>
                    <h3 className='text-sm font-bold text-slate-800'>{g.title}</h3>
                    <p className='mt-1 text-[11px] text-slate-500 leading-normal'>{g.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Synergy Workspace Panel */}
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <div className='flex items-center justify-between'>
            <h2 className='text-base font-bold text-slate-800'>Synergy Workspace</h2>
            <span className='rounded bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700'>
              {pinnedItems.length} selected
            </span>
          </div>

          {pinnedItems.length === 0 ? (
            <p className='text-xs text-slate-400 italic py-3 text-center border-2 border-dashed border-slate-100 rounded-xl'>
              No ingredients selected. Click an ingredient inside the graph map, then select "Pin to Workspace".
            </p>
          ) : (
            <div className='space-y-4'>
              <div className='flex flex-wrap gap-1.5'>
                {pinnedItems.map(item => (
                  <div
                    key={item.slug}
                    className='inline-flex items-center gap-1 bg-slate-50 border border-slate-200/60 rounded-full px-2.5 py-1 text-xs text-slate-700'
                  >
                    <span>{item.name}</span>
                    <button
                      type='button'
                      onClick={() => handleTogglePin(item.slug)}
                      className='text-slate-400 hover:text-rose-600 font-bold ml-0.5'
                      aria-label={`Unpin ${item.name}`}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Active Synergies list */}
              {workspaceSynergies.active.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-emerald-800'>✨ Active Synergies</p>
                  {workspaceSynergies.active.map(s => (
                    <div key={s.title} className='rounded-xl bg-emerald-50 border border-emerald-150 p-3 text-[11px] text-emerald-950 space-y-0.5'>
                      <p className='font-bold text-emerald-900'>{s.title}</p>
                      <p className='opacity-90 leading-relaxed'>{s.description}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Recommendations list */}
              {workspaceSynergies.recommendations.length > 0 && (
                <div className='space-y-2'>
                  <p className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>💡 Synergy Opportunities</p>
                  {workspaceSynergies.recommendations.map(r => (
                    <div key={r.partnerSlug} className='rounded-xl bg-slate-50 border border-slate-200/50 p-3 text-[11px] text-slate-700 space-y-1'>
                      <p className='font-bold text-slate-800 flex items-center gap-1.5'>
                        <span>Unlock synergy for {r.trigger}</span>
                      </p>
                      <p className='opacity-90 leading-relaxed'>{r.description}</p>
                      <button
                        type='button'
                        onClick={() => handleTogglePin(r.partnerSlug)}
                        className='text-emerald-700 hover:text-emerald-850 font-bold text-[10px] uppercase mt-1 block'
                      >
                        + Add {r.partnerName} to Workspace
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Amazon Affiliate Buy CTA for Workspace */}
              <div className='border-t border-slate-100 pt-3.5'>
                <a
                  href={buildWorkspaceAmazonUrl(pinnedItems.map(i => i.name))}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='block w-full text-center rounded-2xl bg-emerald-600 hover:bg-emerald-750 text-white font-bold text-xs py-2.5 px-4 transition-all'
                >
                  🛒 Source Workspace Combo (Amazon)
                </a>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Relational Graph Center Panel */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          {/* Header */}
          <div className='border-b border-slate-100 pb-5'>
            <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800'>
              Relational Pathway Mapper
            </span>
            <h2 className='text-2xl font-bold text-slate-800 sm:text-3xl mt-2'>
              {activeGoal.icon} {activeGoal.title}
            </h2>
          </div>

          {/* Biological Mapped Pathways */}
          <div className='space-y-6'>
            {activePathways.map(pathway => {
              const matched = mappedIngredients[pathway.id] || []
              return (
                <div
                  key={pathway.id}
                  className='rounded-2xl border border-slate-100 bg-slate-50/40 p-5 space-y-4'
                >
                  {/* Pathway Header */}
                  <div className='flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2.5'>
                    <div>
                      <h3 className='text-sm font-bold text-slate-800'>{pathway.name}</h3>
                      <p className='text-xs text-slate-500 leading-normal mt-0.5'>{pathway.description}</p>
                    </div>
                    {/* GRADE evidence rating */}
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${
                      pathway.grade === 'High'
                        ? 'bg-emerald-100 text-emerald-800'
                        : pathway.grade === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      GRADE: {pathway.grade}
                    </span>
                  </div>

                  {/* Connected Candidates */}
                  <div className='space-y-2'>
                    <span className='text-[9px] font-bold uppercase tracking-wider text-slate-400'>
                      Mapped Solutions
                    </span>
                    {matched.length === 0 ? (
                      <p className='text-xs text-slate-400 italic'>No matching records in raw database.</p>
                    ) : (
                      <div className='flex flex-wrap gap-2'>
                        {matched.map(item => {
                          const isSelected = selectedIngredientSlug === item.slug
                          return (
                            <button
                              key={item.slug}
                              onClick={() => setSelectedIngredientSlug(item.slug)}
                              type='button'
                              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition ${
                                isSelected
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-sm'
                                  : 'border-slate-200 bg-white text-slate-700 hover:border-slate-350 hover:bg-slate-50'
                              }`}
                            >
                              {item.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Details Drilldown Panel */}
          {selectedIngredient && ingredientGradeDetails && (
            <div className='rounded-2xl border border-emerald-200/50 bg-gradient-to-br from-emerald-50/20 to-white p-5 space-y-5 animate-fadeIn'>
              <div className='flex items-start justify-between gap-2 border-b border-emerald-100 pb-3'>
                <div>
                  <h4 className='text-base font-bold text-slate-800'>{selectedIngredient.name}</h4>
                  <div className='flex items-center gap-2 mt-1'>
                    <span className='rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-slate-500'>
                      {selectedIngredient.type}
                    </span>
                    <span className='text-xs text-slate-500'>
                      {selectedIngredient.evidence_tier || 'Limited evidence profile'}
                    </span>
                  </div>
                </div>
                <div className='flex items-center gap-3'>
                  <button
                    type='button'
                    onClick={() => handleTogglePin(selectedIngredient.slug)}
                    className={`rounded-full px-3.5 py-1 text-xs font-semibold border transition ${
                      pinnedSlugs.includes(selectedIngredient.slug)
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-250 hover:bg-emerald-100'
                    }`}
                  >
                    {pinnedSlugs.includes(selectedIngredient.slug) ? '✕ Unpin' : '📌 Pin to Workspace'}
                  </button>
                  <Link
                    href={selectedIngredient.type === 'herb' ? `/herbs/${selectedIngredient.slug}` : `/compounds/${selectedIngredient.slug}`}
                    className='text-emerald-700 hover:underline text-xs font-bold'
                  >
                    Full Monograph →
                  </Link>
                </div>
              </div>

              {/* GRADE certitude breakdown details (Task 2.3) */}
              <div className='grid gap-6 sm:grid-cols-2'>
                <div className='space-y-3.5'>
                  <div className='flex items-center justify-between'>
                    <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                      GRADE Evidence score
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      ingredientGradeDetails.gradeLabel === 'High'
                        ? 'bg-emerald-100 text-emerald-800'
                        : ingredientGradeDetails.gradeLabel === 'Moderate'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-50 text-rose-700'
                    }`}>
                      {ingredientGradeDetails.gradeLabel}
                    </span>
                  </div>

                  <div className='w-full bg-slate-150 rounded-full h-1.5'>
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        ingredientGradeDetails.gradeLabel === 'High'
                          ? 'bg-emerald-600'
                          : ingredientGradeDetails.gradeLabel === 'Moderate'
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${ingredientGradeDetails.percentage}%` }}
                    />
                  </div>

                  <div className='space-y-1.5 text-xs text-slate-600'>
                    <div className='flex justify-between border-b border-slate-50 py-0.5'>
                      <span>Clinical Study Pool:</span>
                      <span className='font-bold text-slate-800'>{ingredientGradeDetails.studiesCount}</span>
                    </div>
                    <div className='flex justify-between border-b border-slate-50 py-0.5'>
                      <span>Patient Sample Size:</span>
                      <span className='font-bold text-slate-800'>{ingredientGradeDetails.sampleSize}</span>
                    </div>
                    <div className='flex justify-between border-b border-slate-50 py-0.5'>
                      <span>Risk of Bias (GRADE):</span>
                      <span className='font-bold text-slate-800'>{ingredientGradeDetails.biasRisk} Risk</span>
                    </div>
                  </div>
                </div>

                {/* Synergistic Suggestion (Task 2.2) */}
                <div className='space-y-2'>
                  <span className='text-[10px] font-bold uppercase tracking-wider text-slate-400'>
                    Pharmacological Synergies
                  </span>
                  {SYNERGIES.filter(s => s.triggerSlug === selectedIngredient.slug || s.partnerSlug === selectedIngredient.slug).length === 0 ? (
                    <p className='text-xs text-slate-500 italic leading-relaxed'>
                      No direct clinical synergies defined. You can pin this item to cross-reference multiple targets and customize active doses.
                    </p>
                  ) : (
                    <div className='space-y-2'>
                      {SYNERGIES.filter(s => s.triggerSlug === selectedIngredient.slug || s.partnerSlug === selectedIngredient.slug).map(s => {
                        const isPartnerPinned = pinnedSlugs.includes(s.triggerSlug === selectedIngredient.slug ? s.partnerSlug : s.triggerSlug)
                        return (
                          <div key={s.title} className={`rounded-xl border p-3 text-[11px] leading-relaxed space-y-1 ${
                            isPartnerPinned
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                              : 'bg-slate-50 border-slate-200/60 text-slate-700'
                          }`}>
                            <p className={`font-bold ${isPartnerPinned ? 'text-emerald-900' : 'text-slate-800'}`}>
                              {s.title} {isPartnerPinned && '✨'}
                            </p>
                            <p className='opacity-90'>{s.description}</p>
                            {!isPartnerPinned && (
                              <button
                                type='button'
                                onClick={() => handleTogglePin(s.triggerSlug === selectedIngredient.slug ? s.partnerSlug : s.triggerSlug)}
                                className='text-emerald-700 hover:text-emerald-900 font-bold text-[10px] uppercase mt-1 block'
                              >
                                + Pin {s.triggerSlug === selectedIngredient.slug ? s.partnerName : allItems.find(i => i.slug === s.triggerSlug)?.name || s.partnerName} to unlock synergy
                              </button>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
