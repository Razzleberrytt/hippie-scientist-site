import { Link } from "react-router-dom";
import Meta from "../components/Meta";
import posts from "../data/blog/posts.json";

type Post = {
  slug: string;
  title: string;
  description?: string;
  date: string;
};

export default function BlogList() {
  const blogPosts = [...(posts as Post[])].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );

  return (
    <>
      <Meta
        title="Blog — The Hippie Scientist"
        description="Latest updates, research notes, and field observations from The Hippie Scientist."
        path="/blog"
        pageType="website"
      />
      <main id="main" className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        <ul className="space-y-4">
          {blogPosts.map((p) => (
            <li
              key={p.slug}
              className="rounded-xl border border-white/10 bg-white/5 p-4"
            >
              <h2 className="text-xl font-semibold">
                <Link
                  to={`/blog/${p.slug}`}
                  className="hover:underline"
                >
                  {p.title}
                </Link>
              </h2>
              <p className="text-sm text-white/70">
                {new Date(p.date).toLocaleDateString()}
              </p>
              {p.description && (
                <p className="mt-2 text-white/90">{p.description}</p>
              )}
              <div className="mt-3">
                <Link
                  to={`/blog/${p.slug}`}
                  className="inline-block rounded-lg bg-accent px-3 py-1 font-medium text-black hover:brightness-110"
                >
                  Read post
                </Link>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </>
  );
}
