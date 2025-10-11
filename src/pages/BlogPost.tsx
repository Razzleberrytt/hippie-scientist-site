import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type PostMeta = {
  slug: string;
  title: string;
  date: string;
  description?: string;
  tags?: string[];
  readingTime?: string;
};

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [meta, setMeta] = useState<PostMeta | null>(null);
  const [html, setHtml] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const idx = await fetch("/blogdata/index.json", { cache: "no-cache" }).then((r) => r.json());
        const m = idx.find((p: PostMeta) => p.slug === slug) ?? null;
        if (alive) setMeta(m);

        const h = await fetch(`/blogdata/posts/${slug}.html`, { cache: "no-cache" });
        if (!h.ok) throw new Error(`Post HTML not found: ${slug}`);
        const text = await h.text();
        if (alive) setHtml(text);
      } catch (e: any) {
        if (alive) setError(e.message || "Failed to load post.");
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, [slug]);

  if (error) {
    return (
      <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <p className="text-red-400">{error}</p>
        <Link className="underline" to="/blog">
          ← Back to blog
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <Link to="/blog" className="text-sm text-zinc-400 hover:text-zinc-200">
          ← Back to Blog
        </Link>
        <h1 className="mt-2 text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-100">
          {meta?.title || "Loading…"}
        </h1>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-zinc-400 text-sm">
          {meta?.date && <time dateTime={meta.date}>{formatDate(meta.date)}</time>}
          {meta?.readingTime && <span aria-hidden="true">•</span>}
          {meta?.readingTime && <span>{meta.readingTime}</span>}
          {meta?.tags?.length ? (
            <>
              <span aria-hidden="true">•</span>
              <ul className="flex flex-wrap gap-2">
                {meta.tags.map((t) => (
                  <li
                    key={t}
                    className="rounded-full bg-zinc-800/60 px-2 py-0.5 text-xs text-zinc-300 border border-zinc-700/50"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      </header>

      {/* Markdown HTML */}
      <article
        className="
          prose prose-invert max-w-none
          prose-h1:text-zinc-100 prose-h2:text-zinc-100 prose-h3:text-zinc-200
          prose-a:text-sky-300 hover:prose-a:text-sky-200
          prose-strong:text-zinc-100 prose-li:marker:text-zinc-500
          prose-blockquote:text-zinc-300 prose-blockquote:border-l-zinc-700
          prose-pre:bg-zinc-900/70 prose-code:text-pink-300
          prose-headings:scroll-mt-20 prose-img:rounded-xl
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-10 border-t border-zinc-800/60 pt-6">
        <p className="text-xs text-zinc-500">
          Educational content only. Not medical advice. Consult a qualified professional before use.
        </p>
      </footer>
    </main>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}
