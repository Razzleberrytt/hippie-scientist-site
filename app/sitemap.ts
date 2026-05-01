import type { MetadataRoute } from 'next'
import posts from '@/data/blog/posts.json'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import { getCompounds, getHerbs } from '@/lib/runtime-data'

export const dynamic = 'force-static'

type SlugRecord = { slug: string }
type BlogPost = { slug: string }
type StackRecord = { slug: string }

const siteUrl = 'https://thehippiescientist.net'
const now = new Date()

const withSiteUrl = (path: string): string =>
  path === '/' ? siteUrl : `${siteUrl}${path}`

const route = (path: string): MetadataRoute.Sitemap[number] => ({
  url: withSiteUrl(path),
  lastModified: now,
})

const goals = ['sleep', 'stress', 'fat-loss', 'cognition', 'performance']
const comparisons = [
  'creatine-vs-beta-alanine',
  'magnesium-vs-glycine',
  'caffeine-vs-l-theanine',
  'ashwagandha-vs-rhodiola',
  'citicoline-vs-alpha-gpc',
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [herbs, runtimeCompounds] = await Promise.all([
    getHerbs() as Promise<SlugRecord[]>,
    getCompounds() as Promise<SlugRecord[]>,
  ])

  const blogPosts = posts as BlogPost[]
  const stacks = stacksData as StackRecord[]
  const fileCompounds = Array.isArray(compoundsData) ? (compoundsData as SlugRecord[]) : []
  const compoundSlugs = [...new Set([...runtimeCompounds, ...fileCompounds].map(item => item?.slug).filter(Boolean))]

  return [
    ...['/', '/herbs', '/compounds', '/stacks', '/blog'].map(route),
    ...goals.map(goal => route(`/goals/${goal}`)),
    ...goals.map(goal => route(`/${goal}-supplements`)),
    ...stacks.filter(stack => stack?.slug).map(stack => route(`/stacks/${stack.slug}`)),
    ...herbs.filter(herb => herb?.slug).map(herb => route(`/herbs/${herb.slug}`)),
    ...compoundSlugs.map(slug => route(`/compounds/${slug}`)),
    ...comparisons.map(slug => route(`/compare/${slug}`)),
    ...blogPosts.filter(post => post?.slug).map(post => route(`/blog/${post.slug}`)),
  ]
}
