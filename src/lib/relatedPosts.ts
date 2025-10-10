import posts from "../data/blog/posts.json";

export function relatedPostsForHerb(herb: {
  common?: string;
  scientific?: string;
  tags?: string[];
  compounds?: string[];
  synonyms?: string[];
  slug?: string;
}) {
  const nameTokens = new Set<string>(
    [
      herb.common,
      herb.scientific,
      ...(herb.tags || []),
      ...(herb.compounds || []),
      ...(herb.synonyms || [])
    ]
      .filter(Boolean)
      .map((v) => String(v).toLowerCase())
  );

  const scored = (posts || []).map((p: any) => {
    const hay = [
      p.title,
      p.description,
      p.excerpt,
      p.body,
      p.bodyHtml
    ]
      .join(" ")
      .toLowerCase();
    let overlap = 0;
    for (const n of nameTokens) if (n && hay.includes(n)) overlap++;
    return { post: p, score: overlap };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((s) => ({
      slug: s.post.slug,
      title: s.post.title,
      date: s.post.date,
      description: s.post.description
    }));
}
