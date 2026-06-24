export type FutureProduct = {
  id: string
  category: 'Beginner Packs' | 'Research Packs' | 'Field Guides'
  title: string
  summary: string
  status: 'Planned'
}

export const futureProducts: FutureProduct[] = [
  {
    id: 'calm-pack',
    category: 'Beginner Packs',
    title: 'Calm pack',
    summary: 'Simple blend starting points for stress regulation and evening downshift routines.',
    status: 'Planned',
  },
  {
    id: 'focus-pack',
    category: 'Beginner Packs',
    title: 'Focus pack',
    summary: 'Clear daytime blend templates designed for attention and cognitive stamina.',
    status: 'Planned',
  },
  {
    id: 'sleep-pack',
    category: 'Beginner Packs',
    title: 'Sleep pack',
    summary: 'Low-friction nightly blend ideas with conservative safety framing.',
    status: 'Planned',
  },
  {
    id: 'alkaloid-dataset',
    category: 'Research Packs',
    title: 'Alkaloid dataset',
    summary: 'Structured rows for alkaloid classes, known targets, and confidence labels.',
    status: 'Planned',
  },
  {
    id: 'psychedelic-mechanisms',
    category: 'Research Packs',
    title: 'Psychedelic mechanisms',
    summary: 'Cross-index of receptor pathways, downstream effects, and uncertainty markers.',
    status: 'Planned',
  },
  {
    id: 'field-guide-pdfs',
    category: 'Field Guides',
    title: 'Printable field guides',
    summary: 'Clean, aesthetic PDF guides for practical review and low-friction study sessions.',
    status: 'Planned',
  },
]
