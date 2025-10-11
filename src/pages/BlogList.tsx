import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

type PostIndex = {
  slug: string;
  title: string;
  date: string | null;
  tags?: string[];
  hero?: string | null;
  description?: string;
  readingTime?: string;
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
          className="rounded-2xl border border-zinc-800/60 bg-zinc-900/40 p-5 sm:p-6 shadow-sm hover:border-zinc-700 transition"
        >
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-sky-300">
            <Link to={`/blog/${p.slug}`} className="hover:underline">
              {p.title}
            </Link>
          </h2>
          <div className="mt-2 text-sm text-zinc-400">
            <time dateTime={p.date || undefined}>{formatDate(p.date || "")}</time>
            {p.readingTime && <> · {p.readingTime}</>}
          </div>
          <p className="mt-3 text-zinc-300">{p.description}</p>
          <Link
            to={`/blog/${p.slug}`}
            className="mt-4 inline-flex text-sm text-sky-300 hover:text-sky-200"
          >
            Read post →
          </Link>
        </article>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
