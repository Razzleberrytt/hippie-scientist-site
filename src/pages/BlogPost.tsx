import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Meta from "../components/Meta";
import posts from "../data/blog/posts.json";

type Post = {
  slug: string;
  title: string;
  description?: string;
  date: string;
  tags?: string[];
  html?: string;
  bodyHtml?: string;
};

export default function BlogPost() {
  const { slug } = useParams();

  const post = useMemo(
    () => (posts as Post[]).find((p) => p.slug === slug),
    [slug],
  );

  if (!post) {
    return (
      <>
        <Meta
          title="Post not found — The Hippie Scientist"
          description="That article does not exist."
          path={`/blog/${slug ?? ""}`}
          noindex
        />
        <main id="main" className="container mx-auto px-4 py-16">
          <h1 className="text-2xl font-bold">Post not found</h1>
          <p className="mt-4">
            <Link className="text-accent hover:underline" to="/blog">
              ← Back to Blog
            </Link>
          </p>
        </main>
      </>
    );
  }

  const html = post.html || post.bodyHtml || "";

  return (
    <>
      <Meta
        title={`${post.title} — The Hippie Scientist`}
        description={post.description ?? ""}
        path={`/blog/${post.slug}`}
        pageType="article"
      />
      <main id="main" className="container mx-auto px-4 py-8">
        <article className="prose prose-invert max-w-none">
          <h1>{post.title}</h1>
          <p className="text-sm opacity-75">
            {new Date(post.date).toLocaleDateString()}
          </p>
          {post.tags?.length ? (
            <p className="mt-1 text-sm opacity-80">{post.tags.join(" • ")}</p>
          ) : null}
          <div
            className="mt-6"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </article>
        <p className="mt-8">
          <Link className="text-accent hover:underline" to="/blog">
            ← Back to Blog
          </Link>
        </p>
      </main>
    </>
  );
}
