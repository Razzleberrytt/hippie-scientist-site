import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type PostIndex = {
  slug: string;
  title: string;
  date: string | null;
  tags?: string[];
  hero?: string | null;
  excerpt: string;
};

export default function BlogList() {
  const [posts, setPosts] = useState<PostIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

  useEffect(() => {
    let alive = true;
    fetch(`${base}blogdata/index.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : []))
      .then((data) => {
        if (alive) setPosts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (alive) setPosts([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="p-6 opacity-80">Loading…</div>;
  if (!posts.length) return <div className="p-6 opacity-80">No posts yet.</div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts.map((p) => (
        <article
          key={p.slug}
          className="rounded-2xl border border-white/10 bg-black/20 p-5"
        >
          <h2 className="text-xl font-semibold text-sky-400">
            <Link to={`/blog/${p.slug}`}>{p.title}</Link>
          </h2>
          <div className="text-sm mt-1 opacity-70">{p.date}</div>
          <p className="mt-3">{p.excerpt}</p>
          <div className="mt-4">
            <Link
              to={`/blog/${p.slug}`}
              className="px-3 py-2 rounded-lg bg-sky-500/20 border border-sky-500/30"
            >
              Read post
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}
