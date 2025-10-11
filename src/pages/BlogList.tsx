import React from "react";
type Post = { slug:string; title:string; date:string; summary:string; tags?:string[] };

export default function BlogList(){
  const [posts,setPosts] = React.useState<Post[]>([]);
  const [err,setErr] = React.useState<string>("");

  React.useEffect(()=>{
    fetch("/blogdata/index.json", { cache: "no-store" })
      .then(r=> r.ok ? r.json() : Promise.reject(r.statusText))
      .then(j=> setPosts(j.posts||[]))
      .catch(e=> setErr(String(e)));
  },[]);

  if (err) return <div className="container mx-auto p-4 text-red-400">Blog failed to load: {err}</div>;
  if (!posts.length) return <div className="container mx-auto p-4 opacity-75">No posts yet.</div>;

  return (
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      {posts.map(p=>(
        <article key={p.slug} className="rounded-xl border border-white/10 bg-white/5 p-4">
          <h2 className="text-xl font-semibold">
            <a className="text-sky-400 hover:underline" href={`/blog/${p.slug}`}>{p.title}</a>
          </h2>
          <div className="text-sm opacity-70">{new Date(p.date).toLocaleDateString()}</div>
          <p className="mt-2">{p.summary}</p>
          <a className="inline-block mt-3 px-3 py-2 rounded-lg bg-sky-500/20 hover:bg-sky-500/30" href={`/blog/${p.slug}`}>Read post</a>
        </article>
      ))}
    </div>
  );
}
