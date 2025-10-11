import React, { useEffect, useState } from "react";
import Meta from "../components/Meta";

type PostMeta = { slug: string; title: string; date: string; summary: string; tags?: string[] };

const BLOGDATA_URL = "/blogdata/index.json";

export default function BlogList() {
  const [posts, setPosts] = useState<PostMeta[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const url = `${BLOGDATA_URL}?b=${(globalThis as any).__BUILD_ID__ || ""}`;
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data: PostMeta[]) => setPosts(Array.isArray(data) ? data : []))
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, []);

  return (
    <>
      <Meta title="Blog" description="Research, essays, and guides." path="/blog" pageType="website" />
      <main id="main" className="container py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        {err && <p className="text-red-400">Could not load posts: {err}</p>}
        {!posts && !err && <p>Loading…</p>}
        {posts && posts.length === 0 && <p>No posts yet.</p>}
        {posts &&
          posts.map((p) => (
            <article key={p.slug} className="card mb-4">
              <a href={`/blog/${p.slug}`} className="block no-underline">
                <h2 className="text-2xl font-semibold">{p.title}</h2>
                <p className="opacity-70 text-sm">{new Date(p.date).toLocaleDateString()}</p>
                {p.summary && <p className="mt-2">{p.summary}</p>}
                <button className="btn mt-3">Read post</button>
              </a>
            </article>
          ))}
      </main>
    </>
  );
}
