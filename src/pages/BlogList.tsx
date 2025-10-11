import { useMemo } from "react";
import { Link } from "react-router-dom";
import Meta from "../components/Meta";
import posts from "../data/blog/posts.json";

type Post = {
  slug: string;
  title: string;
  date: string;
  excerpt?: string;
  tags?: string[];
};

export default function BlogList() {
  const blogPosts = useMemo(
    () =>
      [...(posts as Post[])]
        .filter((post) => Boolean(post?.slug))
        .sort(
          (a, b) =>
            new Date(b.date ?? 0).getTime() - new Date(a.date ?? 0).getTime(),
        ),
    [],
  );

  return (
    <>
      <Meta
        title="Blog — The Hippie Scientist"
        description="Latest updates, research notes, and field observations from The Hippie Scientist."
        path="/blog"
        pageType="website"
        og={{
          url: "https://thehippiescientist.net/blog",
        }}
      />
      <main id="main" className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold">Blog</h1>
          <p className="mt-2 max-w-2xl text-white/80">
            Deep dives into psychedelic botany, safety research, and blend
            experimentation.
          </p>
        </header>
        {blogPosts.length === 0 ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-white/80">
            <p>No articles yet. Check back soon for fresh field notes.</p>
          </div>
        ) : (
          <ul className="grid gap-5 lg:grid-cols-2">
            {blogPosts.map((post) => {
              const href = `/blog/${post.slug}`;
              const published = post.date ? new Date(post.date) : null;
              return (
                <li
                  key={post.slug}
                  className="flex h-full flex-col justify-between rounded-xl border border-white/10 bg-white/5 p-5 shadow-sm transition hover:border-accent/40 hover:shadow-lg hover:shadow-accent/10"
                >
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      <Link to={href} className="hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/60">
                        {post.title}
                      </Link>
                    </h2>
                    <p className="mt-1 text-sm text-white/70">
                      {published
                        ? published.toLocaleDateString(undefined, {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "Date coming soon"}
                    </p>
                    {post.excerpt && (
                      <p className="mt-3 text-white/85">{post.excerpt}</p>
                    )}
                    {post.tags?.length ? (
                      <ul className="mt-4 flex flex-wrap gap-2 text-xs uppercase tracking-wide text-white/60">
                        {post.tags.map((tag) => (
                          <li
                            key={tag}
                            className="rounded-full border border-white/15 bg-white/5 px-3 py-1"
                          >
                            #{tag}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                  <div className="mt-6">
                    <Link
                      to={href}
                      className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 font-medium text-black transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/80"
                    >
                      Read article
                    </Link>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
}
