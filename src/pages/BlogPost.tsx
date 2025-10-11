import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<{
    slug: string;
    title: string;
    date: string | null;
    tags?: string[];
    excerpt?: string;
    description?: string;
  } | null>(null);
  const [html, setHtml] = useState<string>("");
  const [missing, setMissing] = useState(false);
  const [loading, setLoading] = useState(true);
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

  useEffect(() => {
    let alive = true;
    setPost(null);
    setHtml("");
    setMissing(false);
    setLoading(true);
    const safe = encodeURIComponent(slug || "");

    const indexPromise = fetch(`${base}blogdata/index.json`, { cache: "no-store" }).then((r) =>
      r.ok ? r.json() : Promise.reject(new Error("index")),
    );
    const htmlPromise = fetch(`${base}blogdata/posts/${safe}.html`, { cache: "no-store" }).then((r) =>
      r.ok ? r.text() : Promise.reject(new Error("html")),
    );

    Promise.all([indexPromise, htmlPromise])
      .then(([list, htmlString]) => {
        if (!alive) return;
        const posts = Array.isArray(list) ? list : [];
        const found = posts.find((p) => p?.slug === slug);
        if (!found) {
          setMissing(true);
          return;
        }
        setPost({
          slug: found.slug,
          title: found.title,
          date: found.date ?? null,
          tags: found.tags,
          excerpt: found.excerpt,
          description: found.description,
        });
        setHtml(htmlString);
      })
      .catch(() => {
        if (alive) setMissing(true);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

  if (loading && !missing) return <div className="p-6 opacity-80">Loading…</div>;
  if (missing) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-semibold mb-3">Post not found</h1>
        <Link to="/blog" className="underline">
          Back to blog
        </Link>
      </div>
    );
  }

  if (!post) return <div className="p-6 opacity-80">Loading…</div>;

  return (
    <article className="max-w-3xl mx-auto px-4 py-10 prose prose-invert">
      <h1>{post.title}</h1>
      {post.date && <div className="opacity-70 -mt-3 mb-6">{post.date}</div>}
      {/* eslint-disable-next-line react/no-danger */}
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <div className="mt-10">
        <Link to="/blog" className="underline">
          ← Back to blog
        </Link>
      </div>
    </article>
  );
}
