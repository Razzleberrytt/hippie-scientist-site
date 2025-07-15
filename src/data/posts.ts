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
]
