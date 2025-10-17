#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { marked } from "marked";

// Configure marked to ensure proper spacing and semantic tags
marked.setOptions({
  breaks: true,
  headerIds: true,
  mangle: false,
});

const ROOT = process.cwd();
const BLOG_SRC = path.join(ROOT, "content", "blog");
const OUT = path.join(ROOT, "public", "blogdata");
const POSTS_OUT = path.join(OUT, "posts");
const BLOG_HTML_OUT = path.join(ROOT, "public", "blog");
const DATA_OUT = path.join(ROOT, "src", "data", "blog", "posts.json");
const PUBLIC_POSTS = path.join(ROOT, "public", "blog", "posts.json");

function iso(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

function statISO(p) {
  try {
    const st = fs.statSync(p);
    const fallback = st.birthtimeMs || st.mtimeMs;
    if (fallback) {
      const formatted = iso(fallback);
      if (formatted) return formatted;
    }
  } catch {}
  return iso(Date.now()) ?? new Date().toISOString().slice(0, 10);
}

function escapeAttr(value) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildHtmlDocument({ title, description, slug, body, ogImage }) {
  const canonical = `https://thehippiescientist.net/blog/${slug}/`;
  const fallbackDescription = description || "";
  const fallbackImage = ogImage || "/og-default.jpg";
  const pageTitle = `${title} — The Hippie Scientist`;
  const indentedBody = body
    .split("\n")
    .map((line) => (line ? `      ${line}` : ""))
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeAttr(pageTitle)}</title>
    <meta name="description" content="${escapeAttr(fallbackDescription)}" />
    <link rel="canonical" href="${escapeAttr(canonical)}" />
    <meta property="og:type" content="article" />
    <meta property="og:title" content="${escapeAttr(title)}" />
    <meta property="og:description" content="${escapeAttr(fallbackDescription)}" />
    <meta property="og:url" content="${escapeAttr(canonical)}" />
    <meta property="og:image" content="${escapeAttr(fallbackImage)}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeAttr(title)}" />
    <meta name="twitter:description" content="${escapeAttr(fallbackDescription)}" />
    <meta name="twitter:image" content="${escapeAttr(fallbackImage)}" />
  </head>
  <body>
    <main id="blog-post">
${indentedBody}
    </main>
  </body>
</html>
`;
}

/**
 * Resolve the post's creation date with this precedence:
 * 1) front-matter 'date'
 * 2) first Git commit author date (if repo)
 * 3) file system birthtime
 * 4) now
 */
function getCreatedDate(fp, fmDate) {
  const frontMatter = fmDate ? iso(fmDate) : null;
  if (frontMatter) return frontMatter;

  try {
    const cmd = `git log --follow --diff-filter=A --format=%aI -- "${fp}" | tail -n 1`;
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    const gitDate = out ? iso(out) : null;
    if (gitDate) return gitDate;
  } catch {}

  const fsDate = statISO(fp);
  if (fsDate) return fsDate;

  return iso(Date.now());
}

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(POSTS_OUT, { recursive: true, force: true });
fs.mkdirSync(POSTS_OUT, { recursive: true });

const files = fs.existsSync(BLOG_SRC)
  ? fs
      .readdirSync(BLOG_SRC)
      .filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
  : [];
const rows = [];

for (const file of files) {
  const rawSlug = file.replace(/\.(md|mdx)$/, "");
  const filePath = path.join(BLOG_SRC, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  if (data?.draft) continue;
  const postHtml = marked.parse(content);
  const firstParagraph = content.split(/\n\s*\n/).find(Boolean) || content;
  const excerpt = firstParagraph.replace(/\n+/g, " ").trim().slice(0, 220);
  const words = content.trim().split(/\s+/).length;
  const readingTime = `${Math.max(1, Math.round(words / 225))} min read`;
  const created = getCreatedDate(filePath, data?.date);
  const tags = Array.isArray(data.tags) ? data.tags.map((tag) => String(tag)) : [];
  const summary = data.summary || data.description || excerpt;
  const cover = data.cover || data.hero || null;
  const title = data.title || rawSlug;
  const description = data.description || excerpt;
  const ogImage = data.ogImage || cover || null;

  fs.writeFileSync(path.join(POSTS_OUT, `${rawSlug}.html`), postHtml, "utf-8");

  const postDir = path.join(BLOG_HTML_OUT, rawSlug);
  fs.rmSync(postDir, { recursive: true, force: true });
  fs.mkdirSync(postDir, { recursive: true });
  const post = {
    slug: rawSlug,
    title,
    date: created,
    description,
    summary,
    tags,
    readingTime,
    cover: cover || undefined,
    ogImage: ogImage || undefined,
  };

  let html = buildHtmlDocument({
    title: post.title,
    description: post.description,
    slug: post.slug,
    body: postHtml,
    ogImage,
  });

  const slug = String(post.slug || "").replace(/^\/+|\/+$/g, "");
  const canonical = `<link rel="canonical" href="https://thehippiescientist.net/blog/${slug}/">`;
  if (/<\/head>/i.test(html) && !/rel=["']canonical["']/i.test(html)) {
    html = html.replace(/<\/head>/i, `${canonical}\n</head>`);
  }

  fs.writeFileSync(path.join(postDir, "index.html"), html, "utf-8");

  rows.push(post);
}

rows.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(rows, null, 2), "utf-8");

const metadata = rows.map((row) => ({
  slug: row.slug,
  title: row.title,
  date: row.date,
  excerpt: row.description,
  description: row.description,
  summary: row.summary,
  tags: row.tags,
  readingTime: row.readingTime,
  cover: row.cover,
  ogImage: row.ogImage,
}));

fs.mkdirSync(path.dirname(DATA_OUT), { recursive: true });
fs.writeFileSync(DATA_OUT, JSON.stringify(metadata, null, 2), "utf-8");

fs.mkdirSync(path.dirname(PUBLIC_POSTS), { recursive: true });
fs.writeFileSync(PUBLIC_POSTS, JSON.stringify(metadata, null, 2), "utf-8");

console.log(
  `Built ${rows.length} posts → /public/blogdata & /public/blog/{slug}/index.html`
);
