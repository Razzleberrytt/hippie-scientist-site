import type { BlogPostRecord } from './editorial-discovery'

export type BlogPost = Required<Pick<BlogPostRecord, 'slug' | 'title'>> &
  Omit<BlogPostRecord, 'slug' | 'title'> & {
    updatedAt?: string
  }

export type BlogStyleGroup = {
  slug: string
  title: string
  description: string
  href: string
  meta: string
}

export const BLOG_STYLE_GROUPS: BlogStyleGroup[] = [
  {
    slug: 'research-digests',
    title: 'Research digests',
    description: 'Evidence summaries with limitations and cautious interpretation.',
    href: '/research-notes/style/research-digests',
    meta: 'Evidence',
  },
  {
    slug: 'pharmacology-basics',
    title: 'Pharmacology basics',
    description: 'Mechanism-first explainers for pathways, compounds, and receptor context.',
    href: '/research-notes/style/pharmacology-basics',
    meta: 'Mechanism',
  },
  {
    slug: 'traditional-use',
    title: 'Traditional use',
    description: 'Historical context kept separate from modern efficacy claims.',
    href: '/research-notes/style/traditional-use',
    meta: 'Tradition',
  },
  {
    slug: 'extraction-preparation',
    title: 'Extraction & preparation',
    description: 'Form, solvent, dose visibility, and practical preparation notes.',
    href: '/research-notes/style/extraction-preparation',
    meta: 'Methods',
  },
  {
    slug: 'safety-set-setting',
    title: 'Safety / set / setting',
    description: 'Conservative reading for uncertainty, cautions, and context of use.',
    href: '/research-notes/style/safety-set-setting',
    meta: 'Safety',
  },
  {
    slug: 'field-notes',
    title: 'Field notes',
    description: 'Editorial observations that help turn profiles into memorable learning.',
    href: '/research-notes/style/field-notes',
    meta: 'Notes',
  },
]

export const getPostSortValue = (post: BlogPost): number => {
  if (!post.date) return 0
  const value = new Date(post.date).getTime()
  return Number.isNaN(value) ? 0 : value
}

export const sortPostsNewestFirst = (sourcePosts: BlogPost[]): BlogPost[] =>
  [...sourcePosts].sort((a, b) => getPostSortValue(b) - getPostSortValue(a))

export const truncateText = (value: string | undefined, maxLength: number): string => {
  if (!value) return 'No summary yet.'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}...`
}

export const formatDate = (value: string | undefined): string => {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

export const inferArticleStyle = (post: BlogPost): string => {
  const text = `${post.title} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()
  if (text.includes('pharmacology')) return 'Pharmacology primer'
  if (text.includes('research digest')) return 'Research digest'
  if (text.includes('traditional')) return 'Traditional context'
  if (text.includes('safety')) return 'Safety note'
  if (text.includes('extraction') || text.includes('preparation')) return 'Preparation guide'
  return 'Editorial note'
}

export const inferResearchStyle = (post: BlogPost): string => {
  const value = `${post.title} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()
  if (value.includes('research digest')) return 'Evidence synthesis'
  if (value.includes('pharmacology')) return 'Mechanism-led'
  if (value.includes('traditional')) return 'Traditional-use led'
  if (value.includes('safety')) return 'Safety-first'
  if (value.includes('extraction') || value.includes('preparation')) return 'Methods / preparation'
  return 'Editorial field note'
}

export const shouldNoindexBlogPost = (post: Pick<BlogPost, 'slug' | 'title'> & Partial<BlogPost>): boolean => {
  const slug = post.slug || ''
  const corpus = `${post.title ?? ''} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()
  const profileStatus = String(post.profile_status || '').toLowerCase()

  if (post.sitemap_included === false) {
    return true
  }

  if (profileStatus === 'draft' || profileStatus === 'archived') {
    return true
  }

  if (/^2025-(?:08|09|10)-\d{2}-.+-(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)-notes$/.test(slug)) {
    return true
  }

  return corpus.includes('placeholder reference a') || corpus.includes('placeholder reference b')
}

export const getBlogStyleGroup = (slug: string): BlogStyleGroup | undefined =>
  BLOG_STYLE_GROUPS.find((group) => group.slug === slug)

export const getPostsForStyle = (sourcePosts: BlogPost[], styleSlug: string): BlogPost[] => {
  const matchesStyle = (post: BlogPost) => {
    const text = `${post.title} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()

    switch (styleSlug) {
      case 'research-digests':
        return text.includes('research digest')
      case 'pharmacology-basics':
        return text.includes('pharmacology')
      case 'traditional-use':
        return text.includes('traditional')
      case 'extraction-preparation':
        return text.includes('extraction') || text.includes('preparation') || text.includes('formulation')
      case 'safety-set-setting':
        return text.includes('safety') || text.includes('set setting') || text.includes('set / setting')
      case 'field-notes':
        return text.includes('field notes') || text.includes('bioassay') || text.includes('notes')
      default:
        return false
    }
  }

  return sortPostsNewestFirst(sourcePosts.filter(matchesStyle))
}
