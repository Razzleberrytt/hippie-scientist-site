import React from "react";
import Meta from "../components/Meta";
import posts from "../data/blog/posts.json";

type BlogPost = {
  title: string;
  slug: string;
  date?: string;
  description?: string;
  excerpt?: string;
};

export default function Blog() {
  const sorted = [...(posts as BlogPost[])].sort(
    (a, b) =>
      new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
  );

  return (
    <>
      <Meta
        title="Blog — The Hippie Scientist"
        description="Articles on psychoactive herbs, safety, and neuropharmacology."
        path="/blog"
        pageType="website"
      />
      <main className="container mx-auto space-y-8 px-4 py-10">
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-3xl font-extrabold text-transparent">
              Blog
            </h1>
            <p className="mt-1 text-white/70">
              Essays, research notes, and field observations from The Hippie Scientist.
            </p>
          </div>
          <a
            href="/rss.xml"
            className="text-sm text-cyan-300 underline hover:text-cyan-200"
          >
            RSS Feed ↗
          </a>
        </header>

        {sorted.length === 0 ? (
          <p className="text-white/70">No posts yet. Check back soon.</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((p, i) => (
              <article
                key={i}
                className="flex h-full flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm"
              >
                <div>
                  <h2 className="mb-1 text-lg font-semibold text-lime-300">
                    <a href={`/blog/${p.slug}`} className="hover:underline">
                      {p.title}
                    </a>
                  </h2>
                  {p.date ? (
                    <p className="mb-2 text-xs text-white/50">
                      {new Date(p.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  ) : null}
                  <p className="text-sm text-white/70 line-clamp-4">
                    {p.description || p.excerpt || ""}
                  </p>
                </div>
                <div className="mt-3">
                  <a
                    href={`/blog/${p.slug}`}
                    className="text-sm text-cyan-300 underline hover:text-cyan-200"
                  >
                    Read more →
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
