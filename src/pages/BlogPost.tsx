import React from "react";
import { useParams } from "react-router-dom";

export default function BlogPost(){
  const { slug } = useParams<{slug:string}>();
  const [html,setHtml] = React.useState<string>("");
  const [err,setErr] = React.useState<string>("");

  React.useEffect(()=>{
    if(!slug) return;
    fetch(`/blogdata/${slug}.html`, { cache: "no-store" })
      .then(r=> r.ok ? r.text() : Promise.reject(r.statusText))
      .then(setHtml)
      .catch(e=> setErr(String(e)));
  },[slug]);

  if (err) return <div className="container mx-auto p-4">Post not found.</div>;
  if (!html) return <div className="container mx-auto p-4 opacity-70">Loading…</div>;

  return (
    <div className="container mx-auto p-4 prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: html }} />
      <hr className="my-8 opacity-20" />
      <a className="text-sky-400 hover:underline" href="/blog">← Back to blog</a>
    </div>
  );
}
