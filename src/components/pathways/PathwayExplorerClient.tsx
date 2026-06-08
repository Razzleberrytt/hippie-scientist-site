'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'

interface TargetReceptor {
  id: string
  name: string
  fullName: string
  category: 'GABA' | 'Dopamine' | 'Serotonin' | 'Acetylcholine' | 'Glutamate' | 'HPA-Stress' | 'Neuroplasticity' | 'Adenosine' | 'Other'
  description: string
  function: string
  keywords: string[]
  details: string
}

const TARGETS: TargetReceptor[] = [
  {
    id: 'gaba-a',
    name: 'GABA-A Receptor',
    fullName: 'γ-Aminobutyric Acid Type A Receptor',
    category: 'GABA',
    description: 'Ligand-gated ionotropic chloride channel receptor. Binding of GABA causes receptor opening, chloride influx, membrane hyperpolarization, and rapid inhibitory tone.',
    function: 'Mediates rapid anxiolysis, sedation, sleep induction, muscle relaxation, and anticonvulsant effects.',
    keywords: ['gaba-a', 'gaba a', 'gaba(a)', 'gabaergic', 'gaba positive', 'gaba-benzodiazepine', 'gaba receptors'],
    details: 'This ionotropic receptor is the primary target for classic anxiolytics and sedatives. Positive allosteric modulators (PAMs) enhance the natural inhibitory effect of GABA without directly activating the receptor, offering a gentler safety profile compared to direct agonists.'
  },
  {
    id: 'gaba-b',
    name: 'GABA-B Receptor',
    fullName: 'γ-Aminobutyric Acid Type B Receptor',
    category: 'GABA',
    description: 'Metabotropic G-protein coupled receptor. Suppresses neurotransmitter release via presynaptic calcium channel inhibition and postsynaptic potassium channel activation.',
    function: 'Mediates slow, prolonged inhibitory tone, muscle relaxation, and modulation of mood and drug reward pathways.',
    keywords: ['gaba-b', 'gaba b', 'gaba(b)', 'baclofen'],
    details: 'GABA-B modulation provides a slower, longer-lasting calming effect compared to GABA-A. It plays a significant role in reducing muscle spasticity and modulates dopamine release in reward pathways.'
  },
  {
    id: 'd2',
    name: 'D2 Dopamine Receptor',
    fullName: 'Dopamine D2 Receptor (G-protein coupled)',
    category: 'Dopamine',
    description: 'Inhibitory G-protein coupled receptor (Gi-coupled). Concentrated in the striatum and prefrontal cortex. Modulates motor drive, incentive salience, and prolactin secretion.',
    function: 'Regulates goal-directed behavior, motivation, movement initiation, reward processing, and cognitive control.',
    keywords: ['d2', 'dopamine d2', 'dopaminergic agon', 'd2 receptor', 'd2 agonist', 'dopamine receptor agonist'],
    details: 'The D2 receptor is critical for incentive salience—the "wanting" aspect of motivation. Natural dopaminergic compounds and precursors help sustain motivation levels and focus by maintaining healthy D2 signaling.'
  },
  {
    id: 'd1',
    name: 'D1 Dopamine Receptor',
    fullName: 'Dopamine D1 Receptor (Gs-coupled)',
    category: 'Dopamine',
    description: 'Excitatory G-protein coupled receptor (Gs-coupled). Highly expressed in the prefrontal cortex, stimulating intracellular cyclic AMP signaling.',
    function: 'Principal receptor involved in working memory, executive function, cognitive flexibility, and attentional control.',
    keywords: ['d1', 'dopamine d1', 'd1 receptor'],
    details: 'Optimal D1 receptor activation in the prefrontal cortex follows an inverted U-shape curve; too little or too much signaling impairs working memory. Natural modulators seek to stabilize prefrontal D1 tone.'
  },
  {
    id: '5-ht1a',
    name: '5-HT1A Receptor',
    fullName: '5-Hydroxytryptamine (Serotonin) Receptor 1A',
    category: 'Serotonin',
    description: 'Gi/o-coupled G-protein receptor. Acts as both a presynaptic autoreceptor (slowing serotonin release) and postsynaptic receptor mediating calm.',
    function: 'Primary regulator of emotional behavior, mood stabilization, autonomic stress response, and anxiolytic effects.',
    keywords: ['5-ht1a', '5ht1a', 'serotonin 1a', '5-ht1a agonist', '5-ht(1a)'],
    details: 'Activation of postsynaptic 5-HT1A receptors in the limbic system reduces anxiety and improves resilience to chronic stress. It is a major target for evidence-based botanical mood balancers.'
  },
  {
    id: '5-ht2a',
    name: '5-HT2A Receptor',
    fullName: '5-Hydroxytryptamine (Serotonin) Receptor 2A',
    category: 'Serotonin',
    description: 'Gq/11-coupled G-protein receptor. Broadly distributed in the neocortex. Stimulates phospholipase C, increasing intracellular calcium and cortical excitability.',
    function: 'Modulates cognitive flexibility, sensory perception, neuroplasticity, memory consolidation, and head-twitch responses.',
    keywords: ['5-ht2a', '5ht2a', 'serotonin 2a', '5-ht2a agonist', '5-ht(2a)'],
    details: 'As the principal target for classical psychedelics, 5-HT2A activation promotes dendritic spine growth, synaptic remodeling, and cognitive flexibility, serving as the biological gateway for transformative neuroplasticity.'
  },
  {
    id: 'ache',
    name: 'Acetylcholinesterase (AChE)',
    fullName: 'Acetylcholinesterase Enzyme Inhibitor Target',
    category: 'Acetylcholine',
    description: 'An enzyme that catalyzes the breakdown of acetylcholine (ACh) in the synaptic cleft. Inhibiting AChE prolongs the signaling life of acetylcholine.',
    function: 'Enhances short-term memory retrieval, processing speed, focus, and neuro-muscular transmission.',
    keywords: ['acetylcholinesterase', 'ache', 'cholinesterase inhibitor', 'acetylcholine breakdown', 'inhibits acetylcholinesterase'],
    details: 'Preventing acetylcholine breakdown is the primary pharmacological strategy for age-related cognitive decline and is the primary mechanism for classical "nootropic" herbs, leading to noticeable increases in working memory capacity.'
  },
  {
    id: 'alpha7-nachr',
    name: 'α7 nAChR',
    fullName: 'Alpha-7 Nicotinic Acetylcholine Receptor',
    category: 'Acetylcholine',
    description: 'Homopentameric ligand-gated ion channel with high calcium permeability. Highly expressed in the hippocampus and prefrontal cortex.',
    function: 'Crucial for sensory gating, synaptic plasticity (LTP), neuroprotection, anti-inflammatory signaling, and memory consolidation.',
    keywords: ['alpha-7', 'alpha7', 'nachr', 'nicotinic acetylcholine', 'nicotinic receptor'],
    details: 'Activation of α7 nicotinic receptors supports cellular signaling pathways that protect neurons from oxidative stress while directly facilitating the synaptic remodeling required for new learning.'
  },
  {
    id: 'nmdar',
    name: 'NMDA Receptor',
    fullName: 'N-Methyl-D-Aspartate Glutamate Receptor',
    category: 'Glutamate',
    description: 'Ionotropic glutamate-gated channel permeable to calcium. Requires glycine co-activation and depolarization to remove the blocking magnesium ion.',
    function: 'Controls synaptic plasticity and memory formation (Long-Term Potentiation). Over-activation causes neurotoxicity.',
    keywords: ['nmda', 'nmdar', 'glutamatergic', 'glutamate receptor', 'nmda antagonist', 'nmda receptor'],
    details: 'NMDA receptors are the physical substrate of learning and memory. Weak antagonists (like magnesium or L-Theanine) block excessive calcium influx to prevent excitotoxicity, promoting a state of calm focus.'
  },
  {
    id: 'trkb-bdnf',
    name: 'TrkB / BDNF Pathway',
    fullName: 'Tropomyosin Receptor Kinase B & BDNF Pathway',
    category: 'Neuroplasticity',
    description: 'Receptor tyrosine kinase activated by Brain-Derived Neurotrophic Factor (BDNF). Triggers MAPK, PI3K, and PLCγ signaling cascades.',
    function: 'Promotes neurogenesis in the hippocampus, long-term cell survival, dendritic branching, and synaptic plasticity.',
    keywords: ['trkb', 'bdnf', 'neuroplasticity', 'brain-derived neurotrophic', 'neurogenesis', 'creb'],
    details: 'Elevating BDNF or agonizing its receptor TrkB acts as a "fertilizer" for the brain. This pathway is heavily associated with long-term memory formation and recovery from depression and chronic stress.'
  },
  {
    id: 'mao-b',
    name: 'MAO-B Enzyme',
    fullName: 'Monoamine Oxidase Type B Target',
    category: 'Dopamine',
    description: 'Mitochondrial outer membrane enzyme that selectively deaminates phenethylamine and benzylamine. Responsible for breaking down dopamine in the striatum.',
    function: 'Regulates dopamine longevity, prevents free radical generation in dopaminergic neurons, and extends focus duration.',
    keywords: ['mao-b', 'maob', 'monoamine oxidase b', 'mao-b inhibitor', 'inhibits mao-b'],
    details: 'Inhibiting MAO-B extends the active lifetime of dopamine in synapses. This is a common mechanism for cognitive enhancement, supporting sustained executive drive and attention without sudden spikes.'
  },
  {
    id: 'mao-a',
    name: 'MAO-A Enzyme',
    fullName: 'Monoamine Oxidase Type A Target',
    category: 'Serotonin',
    description: 'Mitochondrial enzyme that degrades serotonin, norepinephrine, and melatonin. Inhibiting MAO-A raises monoamine levels systemically.',
    function: 'Increases emotional stability, general mood elevation, and regulates melatonin/circadian precursors.',
    keywords: ['mao-a', 'maoa', 'monoamine oxidase a', 'mao-a inhibitor', 'inhibits mao-a'],
    details: 'MAO-A inhibition is a powerful mechanism for raising mood and energy. However, strong MAO-A inhibitors require safety mindfulness due to potential interactions with other serotonergic substances (Serotonin Syndrome).'
  },
  {
    id: 'adenosine',
    name: 'Adenosine Receptors',
    fullName: 'Adenosine A1 / A2A Receptors',
    category: 'Adenosine',
    description: 'G-protein coupled receptors that bind adenosine (a byproduct of ATP metabolism) to slow neuronal activity and accumulate sleep pressure.',
    function: 'Regulates sleep-wake homeostasis, fatigue detection, and neurovascular dilation.',
    keywords: ['adenosine', 'a1 receptor', 'a2a receptor', 'adenosine antagonist', 'adenosine receptor'],
    details: 'Blocking these receptors (most famously via caffeine) temporarily prevents the brain from detecting fatigue, maintaining high alert levels, but does not replace the physiological need for restorative sleep.'
  },
  {
    id: 'hpa-axis',
    name: 'Glucocorticoid Receptors / HPA Axis',
    fullName: 'Hypothalamic-Pituitary-Adrenal Axis Cortisol Target',
    category: 'HPA-Stress',
    description: 'Nuclear receptor system responding to cortisol levels. Regulates transcription of stress-responsive genes and resets stress feedback loops.',
    function: 'Modulates cortisol secretion, adrenal output, stress resilience, and systemic immune/inflammatory response.',
    keywords: ['hpa axis', 'cortisol', 'adrenal', 'glucocorticoid', 'stress response', 'crh'],
    details: 'Chronic stress desensitizes cortisol feedback loops, keeping the nervous system in a constant sympathetic state. Adaptogens target glucocorticoid receptors and the HPA axis to normalize stress responses.'
  }
]

interface PathwayExplorerClientProps {
  herbs: any[]
  compounds: any[]
}

export default function PathwayExplorerClient({ herbs, compounds }: PathwayExplorerClientProps) {
  const [selectedTargetId, setSelectedTargetId] = useState<string>(TARGETS[0].id)
  const [activeCategory, setActiveCategory] = useState<string>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')

  // Merge database items
  const allItems = useMemo(() => {
    return [
      ...herbs.map(item => ({ ...item, type: 'herb' as const })),
      ...compounds.map(item => ({ ...item, type: 'compound' as const })),
    ]
  }, [herbs, compounds])

  // Get categories
  const categories = useMemo(() => {
    const cats = new Set(TARGETS.map(t => t.category))
    return ['All', ...Array.from(cats)]
  }, [])

  // Find selected target definition
  const selectedTarget = useMemo(() => {
    return TARGETS.find(t => t.id === selectedTargetId) || TARGETS[0]
  }, [selectedTargetId])

  // Process and match database items to target receptors
  const matchedData = useMemo(() => {
    const matches: Record<string, { herbs: any[]; compounds: any[] }> = {}

    TARGETS.forEach(target => {
      matches[target.id] = { herbs: [], compounds: [] }

      allItems.forEach(item => {
        // Collect text to search
        const textsToSearch = [
          item.name,
          item.displayName,
          item.mechanism,
          ...(Array.isArray(item.mechanisms) ? item.mechanisms : []),
          item.pathway_bucket,
          ...(Array.isArray(item.pathways) ? item.pathways : []),
          item.description,
          item.summary,
          item.primary_effects,
          ...(Array.isArray(item.primaryEffects) ? item.primaryEffects : []),
          ...(Array.isArray(item.effects) ? item.effects : []),
        ].filter(Boolean).map(t => String(t).toLowerCase())

        // Check if any keyword matches
        const isMatch = target.keywords.some(keyword => {
          const kw = keyword.toLowerCase()
          return textsToSearch.some(text => text.includes(kw))
        })

        if (isMatch) {
          // Find which field had the match to extract a nice snippet
          let matchingSnippet = ''
          const mechFields = [
            item.mechanism,
            ...(Array.isArray(item.mechanisms) ? item.mechanisms : []),
            item.summary,
            item.description,
          ].filter(Boolean)

          for (const field of mechFields) {
            const fStr = String(field)
            const index = fStr.toLowerCase().indexOf(target.keywords[0].toLowerCase())
            if (index !== -1) {
              // Extract a nice surrounding sentence/clause
              const start = Math.max(0, index - 40)
              const end = Math.min(fStr.length, index + 80)
              matchingSnippet = `...${fStr.slice(start, end).trim()}...`
              break
            }
          }

          if (!matchingSnippet && item.mechanism) {
            matchingSnippet = String(item.mechanism)
          }

          const decoratedItem = {
            ...item,
            matchingSnippet,
            evidenceTier: item.evidence_tier || item.evidenceLevel || item.confidence || 'C'
          }

          if (item.type === 'herb') {
            matches[target.id].herbs.push(decoratedItem)
          } else {
            matches[target.id].compounds.push(decoratedItem)
          }
        }
      })

      // Sort matched ingredients: A-tier first, then B, then C/others
      const sortFunction = (a: any, b: any) => {
        const tierA = String(a.evidenceTier).toUpperCase()
        const tierB = String(b.evidenceTier).toUpperCase()
        if (tierA === 'A' && tierB !== 'A') return -1
        if (tierA !== 'A' && tierB === 'A') return 1
        if (tierA === 'B' && tierB !== 'B' && tierB !== 'A') return -1
        if (tierA !== 'B' && tierA !== 'A' && tierB === 'B') return 1
        return a.name.localeCompare(b.name)
      }

      matches[target.id].herbs.sort(sortFunction)
      matches[target.id].compounds.sort(sortFunction)
    })

    return matches
  }, [allItems])

  // Filtered target list based on category & search query
  const filteredTargets = useMemo(() => {
    return TARGETS.filter(target => {
      const matchesCategory = activeCategory === 'All' || target.category === activeCategory
      const matchesQuery = searchQuery === '' || 
        target.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        target.function.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesCategory && matchesQuery
    })
  }, [activeCategory, searchQuery])

  const selectedMatches = matchedData[selectedTarget.id] || { herbs: [], compounds: [] }
  const totalMatchesCount = selectedMatches.herbs.length + selectedMatches.compounds.length

  return (
    <div className='grid gap-8 lg:grid-cols-3'>
      {/* Search and Targets List Panel */}
      <div className='space-y-6 lg:col-span-1'>
        <div className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4'>
          <h2 className='text-lg font-bold text-slate-800'>Neurochemical Targets</h2>
          
          <div className='space-y-3'>
            {/* Search Input */}
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search targets (e.g. GABA, D2)...'
              className='w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-sm focus:border-emerald-500 focus:outline-none'
            />

            {/* Category Select Pills */}
            <div className='flex flex-wrap gap-1.5 pt-1'>
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  type='button'
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    activeCategory === cat
                      ? 'bg-emerald-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Targets List */}
        <div className='space-y-3 max-h-[600px] overflow-y-auto pr-1'>
          {filteredTargets.length === 0 ? (
            <div className='rounded-3xl border border-slate-150 bg-white/70 py-12 text-center text-sm text-slate-400'>
              No targets match your filter.
            </div>
          ) : (
            filteredTargets.map(target => {
              const matches = matchedData[target.id] || { herbs: [], compounds: [] }
              const count = matches.herbs.length + matches.compounds.length
              const isSelected = selectedTargetId === target.id

              return (
                <button
                  key={target.id}
                  onClick={() => setSelectedTargetId(target.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition-all ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-50/50 shadow-sm'
                      : 'border-brand-900/10 bg-white/90 hover:border-slate-300 hover:bg-white'
                  }`}
                  type='button'
                >
                  <div className='flex items-start justify-between gap-2'>
                    <div>
                      <span className='rounded bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold uppercase text-emerald-800'>
                        {target.category}
                      </span>
                      <h3 className='mt-1 text-sm font-bold text-slate-800'>{target.name}</h3>
                    </div>
                    <span className='rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500'>
                      {count} {count === 1 ? 'link' : 'links'}
                    </span>
                  </div>
                  <p className='mt-1.5 line-clamp-2 text-xs text-slate-500 leading-normal'>
                    {target.function}
                  </p>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Connectivity Detail Panel */}
      <div className='lg:col-span-2 space-y-6'>
        <div className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6'>
          {/* Header */}
          <div className='border-b border-slate-100 pb-5 space-y-2'>
            <div className='flex flex-wrap items-center gap-2'>
              <span className='rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800'>
                {selectedTarget.category} Target Network
              </span>
            </div>
            <h2 className='text-2xl font-bold text-slate-800 sm:text-3xl'>{selectedTarget.name}</h2>
            <p className='text-xs font-semibold text-slate-400 italic'>{selectedTarget.fullName}</p>
          </div>

          {/* Biological Mechanics */}
          <div className='grid gap-6 sm:grid-cols-2'>
            <div className='rounded-2xl bg-slate-50/50 border border-slate-100 p-5 space-y-2.5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Biological Role</h3>
              <p className='text-sm leading-relaxed text-slate-700'>{selectedTarget.description}</p>
            </div>
            <div className='rounded-2xl bg-slate-50/50 border border-slate-100 p-5 space-y-2.5'>
              <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>Physiological Effect</h3>
              <p className='text-sm leading-relaxed text-slate-700'>{selectedTarget.function}</p>
            </div>
          </div>

          <div className='rounded-2xl bg-emerald-50/20 border border-emerald-100/50 p-5 text-sm leading-relaxed text-slate-600'>
            <span className='font-bold text-emerald-800'>Scientific Context: </span>
            {selectedTarget.details}
          </div>

          {/* Connected Profiles */}
          <div className='space-y-6 pt-2'>
            <div className='flex items-center justify-between border-b border-slate-100 pb-3'>
              <h3 className='text-base font-bold text-slate-800'>
                Connected Database Entries ({totalMatchesCount})
              </h3>
              <span className='text-xs text-slate-400'>Sorted by evidence strength</span>
            </div>

            {totalMatchesCount === 0 ? (
              <div className='py-8 text-center text-sm text-slate-400'>
                No specific monograph entries mapped to this receptor target in the current version.
              </div>
            ) : (
              <div className='space-y-6'>
                {/* Connected Herbs */}
                {selectedMatches.herbs.length > 0 && (
                  <div className='space-y-3'>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-emerald-800'>
                      Botanical Extracts & Herbs ({selectedMatches.herbs.length})
                    </h4>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      {selectedMatches.herbs.map(herb => (
                        <div
                          key={herb.slug}
                          className='flex flex-col justify-between rounded-2xl border border-slate-100 p-4 hover:shadow-sm bg-white'
                        >
                          <div>
                            <div className='flex items-start justify-between gap-2'>
                              <Link
                                href={`/herbs/${herb.slug}`}
                                className='text-sm font-bold text-slate-800 hover:text-emerald-700 hover:underline'
                              >
                                {herb.name}
                              </Link>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                String(herb.evidenceTier).toUpperCase() === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {herb.evidenceTier}-Tier
                              </span>
                            </div>
                            {herb.matchingSnippet && (
                              <p className='mt-2 text-xs text-slate-500 italic leading-normal'>
                                {herb.matchingSnippet}
                              </p>
                            )}
                          </div>
                          <div className='mt-3 border-t border-slate-50 pt-2 flex items-center justify-between text-[10px] text-slate-400'>
                            <span>Mechanism Pathway Match</span>
                            <Link
                              href={`/herbs/${herb.slug}`}
                              className='text-emerald-600 hover:underline font-semibold'
                            >
                              Open Profile →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Connected Compounds */}
                {selectedMatches.compounds.length > 0 && (
                  <div className='space-y-3'>
                    <h4 className='text-xs font-bold uppercase tracking-wider text-emerald-800'>
                      Isolated Compounds & Molecules ({selectedMatches.compounds.length})
                    </h4>
                    <div className='grid gap-4 sm:grid-cols-2'>
                      {selectedMatches.compounds.map(compound => (
                        <div
                          key={compound.slug}
                          className='flex flex-col justify-between rounded-2xl border border-slate-100 p-4 hover:shadow-sm bg-white'
                        >
                          <div>
                            <div className='flex items-start justify-between gap-2'>
                              <Link
                                href={`/compounds/${compound.slug}`}
                                className='text-sm font-bold text-slate-800 hover:text-emerald-700 hover:underline'
                              >
                                {compound.name}
                              </Link>
                              <span className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                                String(compound.evidenceTier).toUpperCase() === 'A'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {compound.evidenceTier}-Tier
                              </span>
                            </div>
                            {compound.matchingSnippet && (
                              <p className='mt-2 text-xs text-slate-500 italic leading-normal'>
                                {compound.matchingSnippet}
                              </p>
                            )}
                          </div>
                          <div className='mt-3 border-t border-slate-50 pt-2 flex items-center justify-between text-[10px] text-slate-400'>
                            <span>Mechanism Pathway Match</span>
                            <Link
                              href={`/compounds/${compound.slug}`}
                              className='text-emerald-600 hover:underline font-semibold'
                            >
                              Open Profile →
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
