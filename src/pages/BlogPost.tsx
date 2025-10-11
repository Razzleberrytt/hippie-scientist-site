import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Meta from "../components/Meta";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [html, setHtml] = useState<string | null>(null);
  const [title, setTitle] = useState<string>("Loading…");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    setHtml(null);
    setErr(null);
    setTitle("Loading…");
    const url = `/blogdata/${slug}.html?b=${(globalThis as any).__BUILD_ID__ || ""}`;
    fetch(url, { cache: "no-store" })
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((txt) => {
        setHtml(txt);
        const m = txt.match(/<h1[^>]*>([^<]+)<\/h1>/i);
        setTitle(m ? m[1] : slug.replace(/-/g, " "));
      })
      .catch((e: unknown) => setErr(e instanceof Error ? e.message : String(e)));
  }, [slug]);

  return (
    <>
      <Meta title={title} description={title} path={`/blog/${slug}`} pageType="article" />
      <main id="main" className="container py-8 prose prose-invert max-w-none">
        {err && <p className="text-red-400">Could not load post: {err}</p>}
        {!err && !html && <p>Loading…</p>}
        {html && <div dangerouslySetInnerHTML={{ __html: html }} />}
      </main>
    </>
  );
}
