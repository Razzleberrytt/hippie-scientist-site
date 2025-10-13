import { getCounters } from './counters';

const counters = getCounters();

export const siteStats = {
  herbs: counters.herbCount,
  compounds: counters.compoundCount,
  posts: counters.articleCount,
};

export function formatKpis({
  herbs = siteStats.herbs,
  compounds = siteStats.compounds,
  posts = siteStats.posts,
}: {
  herbs?: number;
  compounds?: number;
  posts?: number;
} = {}) {
  return `${herbs}+ herbs · ${compounds}+ compounds · ${posts}+ articles`;
}
