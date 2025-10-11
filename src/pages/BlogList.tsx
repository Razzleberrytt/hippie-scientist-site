import React, { useEffect, useState } from "react";
import Meta from "../components/Meta";
import type { BlogStore } from "../types/blog";
import bundledStore from "../generated/blogdata.json";

const BLOGDATA_URL = "/blogdata.json";

export default function BlogList() {
  const [store, setStore] = useState<BlogStore | null>(null);

  useEffect(() => {
    fetch(`${BLOGDATA_URL}?v=${(bundledStore as any).version}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((live: BlogStore) => setStore(live))
      .catch(() => setStore(bundledStore as BlogStore));
  }, []);

  if (!store) {
    return (
      <div className="space-y-6">
        <Meta
          title="Blog — The Hippie Scientist"
          description="Latest updates, research notes, and field observations from The Hippie Scientist."
          path="/blog"
          pageType="website"
          og={{
            url: "https://thehippiescientist.net/blog",
          }}
        />
        <h1 className="text-3xl font-bold">Blog</h1>
        <div className="text-muted-foreground">Loading…</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Meta
        title="Blog — The Hippie Scientist"
        description="Latest updates, research notes, and field observations from The Hippie Scientist."
        path="/blog"
        pageType="website"
        og={{
          url: "https://thehippiescientist.net/blog",
        }}
      />
      <h1 className="text-3xl font-bold">Blog</h1>
      {store.posts.map((p) => (
        <article key={p.slug} className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <h2 className="text-xl font-semibold text-blue-300">
            <a href={`/blog/${p.slug}`}>{p.title}</a>
          </h2>
          <p className="mt-1 text-sm text-white/60">{new Date(p.date).toLocaleDateString()}</p>
          <p className="mt-3 text-white/80">{p.excerpt}</p>
          <a
            className="mt-4 inline-block rounded-lg bg-blue-500/20 px-3 py-2 text-blue-200 hover:bg-blue-500/30"
            href={`/blog/${p.slug}`}
          >
            Read post
          </a>
        </article>
      ))}
    </div>
  );
}
