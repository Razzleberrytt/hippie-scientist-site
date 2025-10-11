import herbsData from '../data/herbs/herbs.normalized.json';
import { compounds as compoundData } from '../data/compounds/compoundsIndex';
import blogIndex from '../../public/blogdata/index.json';

type BlogIndexLike = {
  items?: Array<unknown>;
};

const herbCount = Array.isArray(herbsData) ? herbsData.length : 0;
const compoundCount = Array.isArray(compoundData) ? compoundData.length : 0;

const resolvedPosts = (() => {
  if (Array.isArray((blogIndex as BlogIndexLike)?.items)) {
    return (blogIndex as BlogIndexLike).items?.length ?? 0;
  }
  if (Array.isArray(blogIndex)) {
    return blogIndex.length;
  }
  return 0;
})();

export const siteStats = {
  herbs: herbCount,
  compounds: compoundCount,
  posts: resolvedPosts,
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
