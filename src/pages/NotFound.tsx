import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";
import data from "../data/herbs/herbs.normalized.json";

export default function NotFound() {
  const [q, setQ] = useState("");
  const popular = useMemo(() => {
    const arr = (data || []).slice(0, 6);
    return arr.map((h) => ({
      slug:
        h.slug ||
        (h.common || h.scientific || "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, ""),
      title: h.common || h.scientific,
    }));
  }, []);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return [];
    return (data || [])
      .filter((h) => {
        const hay = [
          h.common,
          h.scientific,
          h.effects,
          (h.tags || []).join(" "),
          (h.compounds || []).join(" "),
        ]
          .join(" ")
          .toLowerCase();
        return hay.includes(s);
      })
      .slice(0, 10)
      .map((h) => ({
        slug:
          h.slug ||
          (h.common || h.scientific || "")
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, ""),
        title: h.common || h.scientific,
      }));
  }, [q]);

  return (
    <>
      <Meta
        title="Page Not Found — The Hippie Scientist"
        description="That page does not exist. Try searching the herb index."
        path="/404"
        noindex
      />
      <main className="container mx-auto px-4 py-10 space-y-6">
        <header className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-6">
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
            Page not found
          </h1>
          <p className="text-white/75 mt-2">
            Let’s get you to the right herb or article.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <input
              className="w-full max-w-md rounded-lg px-3 py-2 bg-white/10 border border-white/10 placeholder-white/50"
              placeholder="Search herbs, compounds, effects…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          {!!results.length && (
            <ul className="mt-3 grid sm:grid-cols-2 gap-2">
              {results.map((r, i) => (
                <li key={i}>
                  <Link className="underline" to={`/herb/${encodeURIComponent(r.slug)}`}>
                    {r.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </header>

        <section>
          <h2 className="text-white/85 font-semibold mb-2">Popular herbs</h2>
          <ul className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
            {popular.map((p, i) => (
              <li
                key={i}
                className="rounded-xl border border-white/10 bg-white/[0.04] p-3"
              >
                <Link className="underline" to={`/herb/${encodeURIComponent(p.slug)}`}>
                  {p.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <nav className="text-white/70">
          <Link className="underline mr-4" to="/database">
            Browse database
          </Link>
          <Link className="underline mr-4" to="/blog">
            Read the blog
          </Link>
          <Link className="underline" to="/">
            Go home
          </Link>
        </nav>
      </main>
    </>
  );
}
