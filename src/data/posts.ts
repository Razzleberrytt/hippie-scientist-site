export interface Post {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
}

export const posts: Post[] = [
  {
    id: 1,
    slug: 'welcome-to-the-cosmos',
    title: 'Welcome to the Cosmic Journal',
    excerpt: 'An introduction to our explorations of plants and consciousness.',
    content: `# Welcome\nThis is a sample post to demonstrate the new blog layout. Enjoy drifting through knowledge in our digital forest.`,
    date: '2024-05-01',
  },
  {
    id: 2,
    slug: 'field-research-basics',
    title: 'Field Research Basics',
    excerpt: 'Tips for documenting herbal finds during your adventures.',
    content: `Exploring nature requires preparation. Always record the location, habitat and any noticeable characteristics of the plant. Photograph specimens before collecting and respect local regulations.`,
    date: '2024-06-15',
  },
  {
    id: 3,
    slug: 'psychedelic-renaissance',
    title: 'The Psychedelic Renaissance',
    excerpt: 'A brief overview of the current resurgence in research.',
    content: `Interest in psychedelic-assisted therapy has exploded in recent years. Universities around the globe are revisiting compounds such as psilocybin and MDMA to evaluate their therapeutic potential.`,
    date: '2024-07-01',
  },
]
