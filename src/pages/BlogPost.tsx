import { useEffect, useMemo, useRef } from "react";
import { useParams, Link } from "react-router-dom";
import DOMPurify from "dompurify";
import Meta from "../components/Meta";
import posts from "../data/blog/posts.json";
import { blogJsonLd } from "../lib/seo";

type Post = {
  slug: string;
  title: string;
  date: string;
  tags?: string[];
  html?: string;
  bodyHtml?: string;
  excerpt?: string;
  description?: string;
  og?: string;
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
          path="/blog/404"
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

  const rawHtml = post.html || post.bodyHtml || "";
  const plainExcerpt = useMemo(() => {
    return rawHtml
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [rawHtml]);

  const ogPath = post.og ?? `/og/blog/${post.slug}.png`;
  const ogImage = ogPath.startsWith("http")
    ? ogPath
    : `https://thehippiescientist.net${ogPath.startsWith("/") ? "" : "/"}${ogPath}`;
  const ogUrl = `https://thehippiescientist.net/blog/${post.slug}`;
  const absoluteOgImage = ogImage;

  const sanitizedHtml = useMemo(
    () =>
      DOMPurify.sanitize(rawHtml, {
        ALLOWED_TAGS: [
          "p",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "ul",
          "ol",
          "li",
          "strong",
          "em",
          "a",
          "img",
          "br",
        ],
        ALLOWED_ATTR: ["href", "src", "alt", "title", "target", "rel"],
        ALLOW_DATA_ATTR: false,
      }),
    [rawHtml],
  );
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;

    const handleError = (event: Event) => {
      const img = event.currentTarget as HTMLImageElement;
      img.classList.add("opacity-60");
      if (!img.dataset.fallbackApplied) {
        img.dataset.fallbackApplied = "true";
        img.alt = img.alt || `${post.title} illustration`;
        img.src = absoluteOgImage;
      }
    };

    const images = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
    images.forEach((img) => {
      img.loading = "lazy";
      if (!img.alt) {
        img.alt = `${post.title} image`;
      }
      img.addEventListener("error", handleError, { once: true });
    });

    return () => {
      images.forEach((img) => img.removeEventListener("error", handleError));
    };
  }, [sanitizedHtml, post.slug, post.title, absoluteOgImage]);

  const relatedPosts = useMemo(() => {
    const tagSet = new Set((post.tags || []).map((tag) => tag.toLowerCase()));
    if (!tagSet.size) return [] as Post[];

    return (posts as Post[])
      .filter((candidate) => candidate.slug !== post.slug)
      .map((candidate) => {
        const candidateTags = (candidate.tags || []).map((tag) => tag.toLowerCase());
        const overlap = candidateTags.filter((tag) => tagSet.has(tag));
        return {
          candidate,
          overlapCount: overlap.length,
        };
      })
      .filter((item) => item.overlapCount > 0)
      .sort((a, b) => {
        if (b.overlapCount !== a.overlapCount) {
          return b.overlapCount - a.overlapCount;
        }
        return (
          new Date(b.candidate.date ?? 0).getTime() -
          new Date(a.candidate.date ?? 0).getTime()
        );
      })
      .slice(0, 3)
      .map((item) => item.candidate);
  }, [post.slug, post.tags]);

  const excerpt = post.excerpt || post.description || plainExcerpt.slice(0, 240);
  const publishedAt = post.date ? new Date(post.date) : null;

  return (
    <>
      <Meta
        title={`${post.title} — The Hippie Scientist`}
        description={excerpt}
        path={`/blog/${post.slug}`}
        pageType="article"
        image={ogImage}
        og={{
          title: post.title,
          description: excerpt,
          image: ogImage,
          url: ogUrl,
          articlePublishedTime: post.date,
          type: "article",
        }}
        jsonLd={blogJsonLd(
          {
            title: post.title,
            slug: post.slug,
            date: post.date,
            description: excerpt,
            excerpt,
            image: ogPath,
          },
          `/blog/${post.slug}`,
        )}
      />
      <main id="main" className="container mx-auto px-4 py-8">
        <article className="prose prose-invert max-w-none [&_img]:rounded-xl [&_img]:border [&_img]:border-white/10 [&_img]:bg-black/20 [&_img]:p-1">
          <h1>{post.title}</h1>
          <p className="text-sm opacity-75">
            {publishedAt ? publishedAt.toLocaleDateString() : "Date coming soon"}
          </p>
          {post.tags?.length ? (
            <p className="mt-1 text-sm opacity-80">{post.tags.join(" • ")}</p>
          ) : null}
          <div
            ref={contentRef}
            className="mt-6 space-y-4"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        </article>
        {relatedPosts.length > 0 ? (
          <aside className="mt-12 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
            <h2 className="text-xl font-semibold text-white">Related articles</h2>
            <ul className="mt-4 space-y-3">
              {relatedPosts.map((related) => (
                <li key={related.slug} className="flex flex-col">
                  <Link
                    to={`/blog/${related.slug}`}
                    className="text-base font-medium text-accent hover:underline"
                  >
                    {related.title}
                  </Link>
                  <span className="text-xs uppercase tracking-wide text-white/60">
                    {(related.tags || [])
                      .slice(0, 3)
                      .map((tag) => `#${tag}`)
                      .join(" · ")}
                  </span>
                </li>
              ))}
            </ul>
          </aside>
        ) : null}
        <p className="mt-8">
          <Link className="text-accent hover:underline" to="/blog">
            ← Back to Blog
          </Link>
        </p>
      </main>
    </>
  );
}
