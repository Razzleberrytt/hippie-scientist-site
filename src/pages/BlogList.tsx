import { useEffect, useState } from "react";
import Meta from "../components/Meta";

type Post = { slug: string; title: string; date: string; excerpt: string; tags: string[] };

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    fetch("/blogdata/posts.json")
      .then((r) => r.json())
      .then(setPosts)
      .catch(() => setPosts([]));
  }, []);

  return (
    <div className="space-y-6">
      <Meta
        title="Blog — The Hippie Scientist"
        description="Latest updates, research notes, and field observations from The Hippie Scientist."
        path="/blog"
        pageType="website"
        og={{
          url: "https://thehippiescientist.net/blog",
        }}
      />
      <h1 className="text-3xl font-bold">Blog</h1>
      {posts.map((p) => (
        <a
          key={p.slug}
          href={`/blog/${p.slug}`}
          className="block rounded-xl border border-white/10 p-4 hover:bg-white/5"
        >
          <h2 className="text-xl text-sky-300">{p.title}</h2>
          <p className="text-xs opacity-70">{new Date(p.date).toLocaleDateString()}</p>
          <p className="mt-2 opacity-90">{p.excerpt}</p>
          <button className="mt-3 rounded-md bg-sky-600/30 px-3 py-1">Read post</button>
        </a>
      ))}
    </div>
  );
}
