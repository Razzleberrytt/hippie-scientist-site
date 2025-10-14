import posts from "@/data/blog/posts.json";
import { baseCompounds } from "@/data/compounds/compoundData";
import { herbs } from "@/data/herbs/herbsfull";

export type SiteCounts = {
  herbs: number;
  compounds: number;
  articles: number;
};

function countArticles() {
  return (Array.isArray(posts) ? posts : [])
    .filter((post) => Boolean((post as { slug?: string })?.slug))
    .length;
}

export function getSiteCounts(): SiteCounts {
  return {
    herbs: herbs.length,
    compounds: baseCompounds.length,
    articles: countArticles(),
  };
}

export const siteStats: SiteCounts = getSiteCounts();

export function formatKpis({
  herbs: herbCount = siteStats.herbs,
  compounds: compoundCount = siteStats.compounds,
  articles: articleCount = siteStats.articles,
}: Partial<SiteCounts> = {}) {
  return `${herbCount}+ herbs · ${compoundCount}+ compounds · ${articleCount}+ articles`;
}
