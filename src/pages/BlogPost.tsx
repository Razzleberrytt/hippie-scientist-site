import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Meta from "../components/Meta";
import { blogJsonLd } from "../lib/seo";
import posts from "../data/blog/posts.json";

type Post = {
  title: string;
  slug: string;
  date: string;
  updated?: string;
  description?: string;
  excerpt?: string;
  image?: string;
  bodyHtml?: string;
  body?: string;
};

export default function BlogPost() {
  const { slug = "" } = useParams();
  const post: Post | undefined = useMemo(
    () => (posts as Post[]).find((p) => p.slug === slug),
    [slug],
  );

  if (!post) {
    return (
      <>
        <Meta
          title="Article Not Found — The Hippie Scientist"
          description="That article doesn’t exist."
          path={`/blog/${slug}`}
          noindex
        />
        <main className="container mx-auto px-4 py-10 space-y-4">
          <h1 className="text-2xl font-bold text-rose-300">Article not found</h1>
          <p className="text-white/70">
            We couldn’t find this post. Try the{" "}
            <Link className="underline" to="/blog">
              blog index
            </Link>
            .
          </p>
        </main>
      </>
    );
  }

  const dateStr = new Date(post.date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  const words = (post.body || post.excerpt || post.description || "")
    .split(/\s+/)
    .filter(Boolean).length;
  const reading = Math.max(1, Math.round(words / 220));

  return (
    <>
      <Meta
        title={`${post.title} — The Hippie Scientist`}
        description={post.description || post.excerpt || ""}
        path={`/blog/${post.slug}`}
        pageType="article"
        image={post.image || "/og/default.png"}
        jsonLd={blogJsonLd(post, `/blog/${post.slug}`)}
      />
      <main className="container mx-auto px-4 py-10 max-w-3xl space-y-6">
        <header>
          <h1 className="text-3xl font-extrabold bg-gradient-to-r from-lime-300 via-cyan-300 to-pink-400 bg-clip-text text-transparent">
            {post.title}
          </h1>
          <p className="text-xs text-white/60 mt-2">
            {dateStr}
            {post.updated
              ? ` • Updated ${new Date(post.updated).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}`
              : null}
            {" "}• ~{reading} min read
          </p>
          {post.description && (
            <p className="text-white/75 mt-3">{post.description}</p>
          )}
        </header>

        {post.image ? (
          <img
            src={post.image}
            alt={post.title}
            className="rounded-xl border border-white/10 bg-white/5"
            loading="lazy"
            decoding="async"
          />
        ) : null}

        {post.bodyHtml ? (
          <article
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: post.bodyHtml }}
          />
        ) : post.body ? (
          <article className="space-y-4 text-white/85 leading-relaxed">
            {post.body.split(/\n{2,}/).map((para, i) => (
              <p key={i}>{para.trim()}</p>
            ))}
          </article>
        ) : (
          <article className="text-white/70">No body content yet.</article>
        )}

        <nav className="pt-6 flex items-center justify-between text-sm">
          <Link className="underline hover:text-cyan-300" to="/blog">
            ← Back to Blog
          </Link>
          <a className="underline hover:text-cyan-300" href="/rss.xml">
            RSS
          </a>
        </nav>
      </main>
    </>
  );
}
