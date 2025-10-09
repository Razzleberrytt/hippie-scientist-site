import React, { useMemo } from "react";
import Meta from "../components/Meta";
import herbs from "../data/herbs/herbs.normalized.json";

let blogPosts: { title: string; slug: string }[] = [];
try {
  blogPosts = require("../data/blog/posts.json");
} catch (_) {
  /* ignore if not present */
}

export default function Sitemap() {
  const herbLinks = useMemo(() => {
    const sl = (s: string) =>
      s
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    return (herbs || []).map((h) => ({
      name: h.common || h.scientific,
      slug: `/herb/${sl(h.common || h.scientific || "")}`,
    }));
  }, []);

  return (
    <>
      <Meta
        title="HTML Sitemap — The Hippie Scientist"
        description="Explore every page, herb, and post on The Hippie Scientist."
        path="/sitemap"
        noindex
      />
      <main className="container mx-auto px-4 py-10 space-y-8">
        <h1 className="h1 bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
          HTML Sitemap
        </h1>
        <section>
          <h2 className="text-white/85 font-semibold mb-2">Core Pages</h2>
          <ul className="list-disc list-inside text-white/70 space-y-1">
            <li>
              <a className="underline" href="/">
                Home
              </a>
            </li>
            <li>
              <a className="underline" href="/database">
                Herb Database
              </a>
            </li>
            <li>
              <a className="underline" href="/blog">
                Blog
              </a>
            </li>
            <li>
              <a className="underline" href="/about">
                About
              </a>
            </li>
            <li>
              <a className="underline" href="/privacy">
                Privacy Policy
              </a>
            </li>
            <li>
              <a className="underline" href="/disclaimer">
                Disclaimer
              </a>
            </li>
            <li>
              <a className="underline" href="/contact">
                Contact
              </a>
            </li>
          </ul>
        </section>

        {blogPosts.length > 0 && (
          <section>
            <h2 className="text-white/85 font-semibold mb-2">Blog Posts</h2>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              {blogPosts.map((p, i) => (
                <li key={i}>
                  <a className="underline" href={`/blog/${p.slug}`}>
                    {p.title}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section>
          <h2 className="text-white/85 font-semibold mb-2">Herbs</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-y-1 text-white/70">
            {herbLinks.map((h, i) => (
              <li key={i}>
                <a className="underline" href={h.slug}>
                  {h.name}
                </a>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}
