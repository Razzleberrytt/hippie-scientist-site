import posts from '@/data/blog/posts.json'
import generatedCounts from '@/data/site-counts.json'
import { loadHerbsFull } from '@/data/herbs/herbsfull'

export type SiteCounts = {
  herbs: number
  compounds: number
  articles: number
}

type GeneratedCounts = {
  herbs?: number
  compounds?: number
}

function countArticles() {
  return (Array.isArray(posts) ? posts : []).filter(post =>
    Boolean((post as { slug?: string })?.slug)
  ).length
}

const buildCounts = (generatedCounts || {}) as GeneratedCounts

export async function loadSiteCounts(): Promise<SiteCounts> {
  const [herbList] = await Promise.all([loadHerbsFull()])
  return {
    herbs: herbList.length,
    compounds: Number(buildCounts.compounds) || 0,
    articles: countArticles(),
  }
}

export const siteStats: SiteCounts = {
  herbs: Number(buildCounts.herbs) || 0,
  compounds: Number(buildCounts.compounds) || 0,
  articles: countArticles(),
}

export function formatKpis({
  herbs: herbCount = siteStats.herbs,
  compounds: compoundCount = siteStats.compounds,
  articles: articleCount = siteStats.articles,
}: Partial<SiteCounts> = {}) {
  return `${herbCount}+ herbs · ${compoundCount}+ compounds · ${articleCount}+ articles`
}
