import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

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
  const reduceMotion = useReducedMotion();

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
    <div className="container-page space-y-6 py-8">
      <h1 className="text-4xl font-extrabold tracking-tight">Blog</h1>
      {posts.map((p) => (
        <motion.article
          key={p.slug}
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-elev rounded-3xl p-5 text-white transition hover:translate-y-[-2px] hover:shadow-glow sm:p-6"
        >
          <h2 className="text-xl font-semibold tracking-tight sm:text-2xl">
            <a href={`/#/blog/${p.slug}`} className="text-accent-200 hover:text-accent-100">
              {p.title}
            </a>
          </h2>
          <div className="mt-2 text-sm text-white/60">
            <time dateTime={p.date || undefined}>{formatDate(p.date || "")}</time>
            {p.readingTime && <> • {p.readingTime}</>}
          </div>
          <p className="mt-3 text-white/80">{p.description}</p>
          <div className="mt-4">
            <a href={`/#/blog/${p.slug}`} className="btn-primary">
              Read post
            </a>
          </div>
        </motion.article>
      ))}
    </div>
  );
}

function formatDate(iso: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
