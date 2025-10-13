import herbs from '@/data/herbs/herbs.normalized.json';
import posts from '../../public/blogdata/index.json';

type HerbEntry = {
  active_compounds?: unknown;
  compounds?: unknown;
};

type PostEntry = {
  draft?: boolean;
  published?: boolean;
};

export function getCounters() {
  const herbCount = Array.isArray(herbs) ? herbs.length : 0;

  const compoundSet = new Set<string>();
  if (Array.isArray(herbs)) {
    for (const herb of herbs as HerbEntry[]) {
      const list = Array.isArray(herb.active_compounds)
        ? herb.active_compounds
        : Array.isArray(herb.compounds)
        ? (herb.compounds as unknown[])
        : [];
      for (const compound of list) {
        if (typeof compound === 'string' && compound.trim()) {
          compoundSet.add(compound.toLowerCase().trim());
        }
      }
    }
  }

  const articleCount = Array.isArray(posts)
    ? (posts as PostEntry[]).filter((post) => !post?.draft && post?.published !== false).length
    : 0;

  return {
    herbCount,
    compoundCount: compoundSet.size,
    articleCount,
  };
}
