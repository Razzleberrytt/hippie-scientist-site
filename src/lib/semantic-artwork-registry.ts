export type SemanticArtworkKind = 'botanical' | 'compound' | 'ecosystem' | 'comparison' | 'pathway'

export type SemanticArtwork = {
  slug: string
  kind: SemanticArtworkKind
  title: string
  alt: string
  palette: {
    base: string
    mid: string
    accent: string
    ink: string
  }
  motifs: string[]
}

const registry: Record<string, SemanticArtwork> = {
  ashwagandha: {
    slug: 'ashwagandha',
    kind: 'botanical',
    title: 'Ashwagandha botanical root ecosystem',
    alt: 'Abstract botanical illustration representing ashwagandha root and adaptogenic stress pathways',
    palette: { base: '#f3ead8', mid: '#d7c39a', accent: '#8b5a2b', ink: '#3d2b18' },
    motifs: ['root', 'adaptogen', 'stress'],
  },
  rhodiola: {
    slug: 'rhodiola',
    kind: 'botanical',
    title: 'Rhodiola alpine adaptogen ecosystem',
    alt: 'Abstract botanical illustration representing rhodiola and alpine stress adaptation pathways',
    palette: { base: '#f6e2c8', mid: '#e6ae74', accent: '#b96425', ink: '#4a2a16' },
    motifs: ['root', 'alpine', 'energy'],
  },
  'l-theanine': {
    slug: 'l-theanine',
    kind: 'compound',
    title: 'L-Theanine calming pathway visual',
    alt: 'Abstract scientific illustration representing L-Theanine and calming tea-related pathways',
    palette: { base: '#edf7ee', mid: '#bfd9c2', accent: '#3f7c58', ink: '#1d3d2e' },
    motifs: ['molecule', 'tea', 'calm'],
  },
  magnesium: {
    slug: 'magnesium',
    kind: 'compound',
    title: 'Magnesium mineral calm visual',
    alt: 'Abstract scientific illustration representing magnesium and mineral calming systems',
    palette: { base: '#edf2f7', mid: '#cdd9e5', accent: '#58708b', ink: '#26394f' },
    motifs: ['mineral', 'calm', 'sleep'],
  },
  'gaba-systems': {
    slug: 'gaba-systems',
    kind: 'ecosystem',
    title: 'GABA calming ecosystem',
    alt: 'Abstract ecosystem artwork representing GABA, sleep, relaxation, and calming pathways',
    palette: { base: '#eef2ff', mid: '#c7d2fe', accent: '#51627d', ink: '#253047' },
    motifs: ['sleep', 'calm', 'network'],
  },
  'dopamine-systems': {
    slug: 'dopamine-systems',
    kind: 'ecosystem',
    title: 'Dopamine focus ecosystem',
    alt: 'Abstract ecosystem artwork representing dopamine, focus, motivation, and attention pathways',
    palette: { base: '#edf4ff', mid: '#bdd7ff', accent: '#2b5fa8', ink: '#183760' },
    motifs: ['focus', 'network', 'spark'],
  },
  'mitochondrial-ecosystems': {
    slug: 'mitochondrial-ecosystems',
    kind: 'ecosystem',
    title: 'Mitochondrial energy ecosystem',
    alt: 'Abstract ecosystem artwork representing mitochondria, energy metabolism, and oxidative stress pathways',
    palette: { base: '#f1efff', mid: '#d8d2ff', accent: '#5f55a4', ink: '#332b66' },
    motifs: ['energy', 'cell', 'network'],
  },
  'adaptogen-ecosystems': {
    slug: 'adaptogen-ecosystems',
    kind: 'ecosystem',
    title: 'Adaptogen stress response ecosystem',
    alt: 'Abstract ecosystem artwork representing adaptogens, resilience, cortisol, and stress response pathways',
    palette: { base: '#edf7ef', mid: '#c8dfce', accent: '#49724f', ink: '#233d29' },
    motifs: ['root', 'stress', 'network'],
  },
  'neuroinflammation-ecosystems': {
    slug: 'neuroinflammation-ecosystems',
    kind: 'ecosystem',
    title: 'Neuroinflammation ecosystem',
    alt: 'Abstract ecosystem artwork representing inflammatory signaling, oxidative stress, cognition, and nervous system context',
    palette: { base: '#fff2e8', mid: '#f4c49d', accent: '#a55f34', ink: '#51301d' },
    motifs: ['inflammation', 'network', 'recovery'],
  },
}

export function getSemanticArtwork(slug?: string | null, kind: SemanticArtworkKind = 'botanical'): SemanticArtwork {
  const normalized = (slug || '').toLowerCase().replace(/_/g, '-')

  return registry[normalized] || {
    slug: normalized || 'default',
    kind,
    title: 'Scientific ecosystem visual',
    alt: 'Abstract scientific ecosystem artwork representing semantic relationships',
    palette: { base: '#f4f8f2', mid: '#deeae1', accent: '#2f7d4b', ink: '#173322' },
    motifs: ['network', 'evidence', 'pathway'],
  }
}

export const featuredArtworkSlugs = Object.keys(registry)
