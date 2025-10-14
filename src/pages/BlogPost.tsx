import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ensureTrailingSlash, resolveBlogIndexUrl } from "@/lib/blog";

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
  const base = useMemo(
    () => ensureTrailingSlash(import.meta.env.BASE_URL || "/"),
    [],
  );
  const indexUrl = useMemo(() => resolveBlogIndexUrl(base), [base]);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const idx = await fetch(indexUrl, { cache: "no-cache" }).then((r) => r.json());
        const m = idx.find((p: PostMeta) => p.slug === slug) ?? null;
        if (alive) setMeta(m);

        const h = await fetch(`${base}blogdata/posts/${slug}.html`, { cache: "no-cache" });
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
  }, [slug, base, indexUrl]);

  if (error) {
    return (
      <main className="container-page py-8">
        <p className="text-red-400">{error}</p>
        <a className="underline" href="/#/blog">
          ← Back to blog
        </a>
      </main>
    );
  }

  return (
    <main className="container-page py-8">
      <header className="glass-elev mb-8 rounded-3xl p-6 sm:p-8">
        <a href="/#/blog" className="text-sm text-accent-300 hover:text-accent-200">
          ← Back to Blog
        </a>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-white">
          {meta?.title || "Loading…"}
        </h1>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-white/60">
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
                    className="pill bg-white/10 text-[12px] text-white/70"
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
          prose-a:text-accent-200 hover:prose-a:text-accent-100
          prose-strong:text-white prose-li:marker:text-white/50
          prose-blockquote:text-white/70 prose-blockquote:border-l-white/30
          prose-pre:bg-black/60 prose-code:text-pink-300
          prose-headings:scroll-mt-24 prose-img:rounded-xl
        "
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <footer className="mt-10 border-t border-white/10 pt-6">
        <p className="text-xs text-white/50">
          Educational content only. Not medical advice. Consult a qualified professional before use.
        </p>
      </footer>
    </main>
  );
}

function formatDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
