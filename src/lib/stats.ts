import generatedCounts from '@/generated/site-counts.json'

export type SiteCounts = {
  herbs: number
  compounds: number
  articles: number
}

type GeneratedCounts = Partial<SiteCounts> & { generatedAt?: string }

const buildCounts = (generatedCounts || {}) as GeneratedCounts

export async function loadSiteCounts(): Promise<SiteCounts> {
  return {
    herbs: Number(buildCounts.herbs) || 0,
    compounds: Number(buildCounts.compounds) || 0,
    articles: Number(buildCounts.articles) || 0,
  }
}

export const siteStats: SiteCounts = {
  herbs: Number(buildCounts.herbs) || 0,
  compounds: Number(buildCounts.compounds) || 0,
  articles: Number(buildCounts.articles) || 0,
}

export function formatKpis({
  herbs: herbCount = siteStats.herbs,
  compounds: compoundCount = siteStats.compounds,
  articles: articleCount = siteStats.articles,
}: Partial<SiteCounts> = {}) {
  return `${herbCount}+ herbs · ${compoundCount}+ compounds · ${articleCount}+ articles`
}
