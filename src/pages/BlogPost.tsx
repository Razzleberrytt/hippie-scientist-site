import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BlogPost() {
  const { slug = "" } = useParams();
  const [html, setHtml] = useState<string>("");

  useEffect(() => {
    fetch(`/blogdata/${slug}.html`)
      .then((r) => (r.ok ? r.text() : Promise.reject()))
      .then(setHtml)
      .catch(() => setHtml("<p>Post not found.</p>"));
  }, [slug]);

  return (
    <article className="prose prose-invert max-w-none">
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </article>
  );
}
