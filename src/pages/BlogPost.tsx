import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

type Post = {
  slug: string;
  title: string;
  date: string | null;
  tags?: string[];
  hero?: string | null;
  excerpt: string;
  html: string;
};

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [post, setPost] = useState<Post | null>(null);
  const [missing, setMissing] = useState(false);
  const base = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "/");

  useEffect(() => {
    let alive = true;
    setPost(null);
    setMissing(false);
    const safe = encodeURIComponent(slug || "");
    fetch(`${base}blogdata/posts/${safe}.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((p) => {
        if (alive) setPost(p);
      })
      .catch(() => {
        if (alive) setMissing(true);
      });
    return () => {
      alive = false;
    };
  }, [slug]);

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
      <div dangerouslySetInnerHTML={{ __html: post.html }} />
      <div className="mt-10">
        <Link to="/blog" className="underline">
          ← Back to blog
        </Link>
      </div>
    </article>
  );
}
