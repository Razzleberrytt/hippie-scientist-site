import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Meta from "../components/Meta";
import type { BlogStore } from "../types/blog";
import store from "../generated/blogdata.json";

const blogStore = store as BlogStore;

export default function BlogPost() {
  const { slug = "" } = useParams();
  const meta = (blogStore.posts || []).find((p) => p.slug === slug);
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    if (!slug) return;
    fetch(`/blog-html/${slug}.html?v=${(store as any).version}`, { cache: "no-store" })
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setHtml)
      .catch(() => setHtml("<p>Post not found.</p>"));
  }, [slug]);

  if (!meta) return <div className="text-white/70">Post not found.</div>;

  return (
    <>
      <Meta
        title={`${meta.title} — The Hippie Scientist`}
        description={meta.excerpt}
        path={`/blog/${meta.slug}`}
        pageType="article"
        og={{
          url: `https://thehippiescientist.net/blog/${meta.slug}`,
          type: "article",
        }}
      />
      <article className="prose prose-invert max-w-none">
        <h1>{meta.title}</h1>
        <p className="text-sm text-white/60">{new Date(meta.date).toLocaleDateString()}</p>
        <div className="mt-6" dangerouslySetInnerHTML={{ __html: html }} />
      </article>
    </>
  );
}
