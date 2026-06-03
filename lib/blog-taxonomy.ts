import posts from '../data/blog/posts.json'

export type BlogPostRecord = {
  slug: string
  title?: string
  excerpt?: string
  content?: string
  date?: string
  updatedAt?: string
}

const allPosts = posts as BlogPostRecord[]

const CATEGORY_PATTERNS: Array<{ slug: string; label: string; pattern: RegExp }> = [
  { slug: 'research-digests', label: 'Research Digests', pattern: /research digest|evidence|study|trial/i },
  { slug: 'pharmacology', label: 'Pharmacology', pattern: /pharmacology|mechanism|pathway|receptor/i },
  { slug: 'traditional-context', label: 'Traditional Context', pattern: /traditional|ethnobotanical|histor/i },
  { slug: 'safety-notes', label: 'Safety Notes', pattern: /safety|contraindication|interaction|warning|risk/i },
  { slug: 'preparation-guides', label: 'Preparation Guides', pattern: /extraction|preparation|tincture|decoction|infusion/i },
]

const TAG_PATTERNS: Array<{ slug: string; label: string; pattern: RegExp }> = [
  { slug: 'sleep', label: 'Sleep', pattern: /sleep|insomnia|sedative|rest/i },
  { slug: 'stress', label: 'Stress', pattern: /stress|calm|anxiety|relax/i },
  { slug: 'cognition', label: 'Cognition', pattern: /cognition|focus|memory|nootropic/i },
  { slug: 'inflammation', label: 'Inflammation', pattern: /inflamm|immune/i },
  { slug: 'preparation', label: 'Preparation', pattern: /extract|prepar|tincture|brew|infusion/i },
  { slug: 'safety', label: 'Safety', pattern: /safety|contraindication|interaction|adverse|warning/i },
]

const getSearchBody = (post: BlogPostRecord): string =>
  `${post.title || ''} ${post.excerpt || ''} ${post.content || ''}`

export function getBlogPosts(): BlogPostRecord[] {
  return allPosts.filter(post => post.slug)
}

export function getPrimaryCategory(post: BlogPostRecord) {
  const body = getSearchBody(post)
  return CATEGORY_PATTERNS.find(({ pattern }) => pattern.test(body)) || { slug: 'editorial-notes', label: 'Editorial Notes', pattern: /./ }
}

export function getPostTags(post: BlogPostRecord) {
  const body = getSearchBody(post)
  const tags = TAG_PATTERNS.filter(({ pattern }) => pattern.test(body))
  return tags.length ? tags : [{ slug: 'editorial', label: 'Editorial', pattern: /./ }]
}

export function getBlogCategories() {
  const counts = new Map<string, { slug: string; label: string; count: number }>()
  for (const post of getBlogPosts()) {
    const category = getPrimaryCategory(post)
    const current = counts.get(category.slug)
    counts.set(category.slug, { slug: category.slug, label: category.label, count: (current?.count || 0) + 1 })
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}

export function getBlogTags() {
  const counts = new Map<string, { slug: string; label: string; count: number }>()
  for (const post of getBlogPosts()) {
    for (const tag of getPostTags(post)) {
      const current = counts.get(tag.slug)
      counts.set(tag.slug, { slug: tag.slug, label: tag.label, count: (current?.count || 0) + 1 })
    }
  }
  return [...counts.values()].sort((a, b) => b.count - a.count)
}
