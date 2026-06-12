// Mechanism visualization data for PathwayDiagram component.
// Each diagram describes how a compound produces its physiological effects.
// Nodes are positioned on a (col, row) grid; edges define arrow connections.

export type PathwayNodeRole =
  | 'compound'   // The input supplement (slate)
  | 'target'     // Receptor or neurotransmitter target (blue)
  | 'mechanism'  // Biological process triggered (emerald)
  | 'effect'     // Observable outcome (amber/orange)

export type PathwayNode = {
  id: string
  label: string
  /** Optional second line of text inside the node */
  sublabel?: string
  role: PathwayNodeRole
  /** 0-indexed horizontal position */
  col: number
  /** 0-indexed vertical position (0 = top row) */
  row: number
}

export type PathwayEdge = {
  from: string  // node id
  to: string    // node id
  /** Short label drawn above horizontal arrows */
  label?: string
}

export type PathwayDiagramData = {
  id: string
  /** Short display title shown above the diagram */
  title: string
  /** Accessible description (used in <desc> and aria-label) */
  summary: string
  nodes: PathwayNode[]
  edges: PathwayEdge[]
}

export const pathwayDiagrams: Record<string, PathwayDiagramData> = {
  'l-theanine-relaxation': {
    id: 'l-theanine-relaxation',
    title: 'How L-Theanine Promotes Relaxation',
    summary:
      'L-theanine modulates GABA and glutamate receptors, increasing alpha-wave brain activity, which produces calm alertness and reduces mental arousal.',
    nodes: [
      { id: 'a', label: 'L-Theanine', sublabel: '100–200 mg', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'GABA & Glutamate', sublabel: 'Receptor modulation', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↑ Alpha Waves', sublabel: 'EEG activity', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Calm Alertness', sublabel: '↓ Mental arousal', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'l-theanine-focus': {
    id: 'l-theanine-focus',
    title: 'L-Theanine for Daytime Calm Focus',
    summary:
      'Without caffeine, L-theanine increases alpha-wave activity via glutamate and GABA modulation, producing calm alertness that supports sustained attention without stimulant effects.',
    nodes: [
      { id: 'a', label: 'L-Theanine', sublabel: '100–200 mg', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'Glutamate Inhibition', sublabel: '+ GABA support', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↑ Alpha Activity', sublabel: 'Relaxed wakefulness', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Calm Focus', sublabel: 'No jitter or crash', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'magnesium-adhd': {
    id: 'magnesium-adhd',
    title: 'How Magnesium Supports Neural Calm',
    summary:
      'Magnesium blocks NMDA receptors to reduce neural over-excitation, while also supporting GABA activity — together these reduce hyperactivation and support calm focus.',
    nodes: [
      { id: 'a', label: 'Magnesium', sublabel: 'Glycinate / Citrate', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'NMDA Block', sublabel: 'Voltage-gated channel', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↓ Excitability', sublabel: 'Reduced over-firing', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Calm + Sleep', sublabel: 'ADHD symptom support', role: 'effect', col: 3, row: 0 },
      { id: 'e', label: 'GABA Support', sublabel: 'Inhibitory boost', role: 'mechanism', col: 1, row: 1 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
      { from: 'b', to: 'e' },
    ],
  },

  'magnesium-sleep': {
    id: 'magnesium-sleep',
    title: 'How Magnesium Supports Sleep',
    summary:
      'Magnesium regulates NMDA receptors and supports GABA signaling, reducing physical tension and neural hyperactivation to support sleep quality and sleep onset.',
    nodes: [
      { id: 'a', label: 'Magnesium', sublabel: 'Glycinate preferred', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'NMDA + GABA', sublabel: 'Dual pathway', role: 'target', col: 1, row: 0 },
      { id: 'c', label: 'Muscle Relaxation', sublabel: 'Physical calm', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Sleep Quality ↑', sublabel: 'Onset + maintenance', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'citicoline-focus': {
    id: 'citicoline-focus',
    title: 'How Citicoline Supports Focus',
    summary:
      'Citicoline provides a choline precursor (CDP-choline) that raises acetylcholine levels, supporting attention, working memory, and executive function.',
    nodes: [
      { id: 'a', label: 'Citicoline', sublabel: '250–500 mg', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'CDP-Choline', sublabel: 'Choline precursor', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↑ Acetylcholine', sublabel: 'Cholinergic pathway', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Focus + Memory', sublabel: 'Cognitive performance', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'alpha-gpc-focus': {
    id: 'alpha-gpc-focus',
    title: 'How Alpha-GPC Supports Focus',
    summary:
      'Alpha-GPC directly donates choline for acetylcholine synthesis, supporting attention, working memory, and cholinergic signaling — especially relevant for focus and ADHD-adjacent symptoms.',
    nodes: [
      { id: 'a', label: 'Alpha-GPC', sublabel: '300–600 mg', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'Choline Release', sublabel: 'High bioavailability', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↑ Acetylcholine', sublabel: 'Cholinergic synthesis', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Attention + Memory', sublabel: 'Cognitive support', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'l-tyrosine-focus': {
    id: 'l-tyrosine-focus',
    title: 'How L-Tyrosine Supports Alertness',
    summary:
      'L-tyrosine is a precursor for dopamine and norepinephrine synthesis. Under cognitive demand or stress, it may help replenish catecholamine pools, supporting alertness and mental stamina.',
    nodes: [
      { id: 'a', label: 'L-Tyrosine', sublabel: 'Amino acid precursor', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'Dopamine Pathway', sublabel: 'Catecholamine synthesis', role: 'target', col: 1, row: 0 },
      { id: 'c', label: 'Dopamine + NE ↑', sublabel: 'Under demand conditions', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Alertness + Focus', sublabel: 'Stress resilience', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'ashwagandha-stress': {
    id: 'ashwagandha-stress',
    title: 'How Ashwagandha Reduces Stress',
    summary:
      'Ashwagandha modulates the HPA axis to reduce cortisol output, blunting the chronic stress response and improving perceived stress, sleep quality, and focus over several weeks.',
    nodes: [
      { id: 'a', label: 'Ashwagandha', sublabel: 'KSM-66 / Sensoril', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'HPA Axis', sublabel: 'Stress-response axis', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↓ Cortisol', sublabel: 'Chronic stress reduction', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Stress Resilience', sublabel: 'Sleep + focus support', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'rhodiola-stamina': {
    id: 'rhodiola-stamina',
    title: 'How Rhodiola Supports Mental Stamina',
    summary:
      'Rhodiola modulates monoamine neurotransmitters (serotonin, dopamine) and stress-response pathways, supporting mental stamina, reducing fatigue, and improving cognitive performance under stress.',
    nodes: [
      { id: 'a', label: 'Rhodiola Rosea', sublabel: 'Salidroside / Rosavins', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'Monoamine System', sublabel: 'Serotonin + Dopamine', role: 'target', col: 1, row: 0 },
      { id: 'c', label: '↓ Mental Fatigue', sublabel: 'Stress adaptation', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Mental Stamina', sublabel: 'Focus under pressure', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },

  'bacopa-memory': {
    id: 'bacopa-memory',
    title: 'How Bacopa Supports Memory',
    summary:
      'Bacopa monnieri promotes dendritic branching and synaptic plasticity via antioxidant activity and modulation of serotonin and acetylcholine systems, supporting long-term memory consolidation.',
    nodes: [
      { id: 'a', label: 'Bacopa Monnieri', sublabel: 'Bacosides A & B', role: 'compound', col: 0, row: 0 },
      { id: 'b', label: 'Synaptic Plasticity', sublabel: 'Antioxidant + cholinergic', role: 'target', col: 1, row: 0 },
      { id: 'c', label: 'Dendritic Growth', sublabel: 'Neural adaptation', role: 'mechanism', col: 2, row: 0 },
      { id: 'd', label: 'Memory + Learning', sublabel: 'Over 8–12 weeks', role: 'effect', col: 3, row: 0 },
    ],
    edges: [
      { from: 'a', to: 'b' },
      { from: 'b', to: 'c' },
      { from: 'c', to: 'd' },
    ],
  },
}
