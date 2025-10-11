import fs from "fs";
import path from "path";
import { generateAllOgImages } from "./generate-og.mjs";

const SITE = "https://thehippiescientist.net";
const outDir = process.argv[2] || process.env.OUT_DIR || "public";
fs.mkdirSync(outDir, { recursive: true });

const sitemapPath = path.resolve(outDir, "sitemap.xml");
const feedPath = path.resolve(outDir, "feed.xml");

const staticPaths = [
  "/",
  "/database",
  "/blog",
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/contact",
];

const urlEntries = new Map();
const now = new Date();

const addUrl = (
  urlPath,
  { lastmod = now, changefreq = "monthly", images = [] } = {},
) => {
  const canonical = normalizePath(urlPath);
  const entry = urlEntries.get(canonical);
  const normalizedDate = coerceDate(lastmod);
  const imageUrls = images
    .map((src) => absoluteUrl(src))
    .filter(Boolean);

  if (entry) {
    const current = coerceDate(entry.lastmod);
    entry.lastmod = current > normalizedDate ? current : normalizedDate;
    entry.changefreq = entry.changefreq || changefreq;
    entry.images = Array.from(
      new Set([...(entry.images || []), ...imageUrls]),
    );
    urlEntries.set(canonical, entry);
  } else {
    urlEntries.set(canonical, {
      path: canonical,
      lastmod: normalizedDate,
      changefreq,
      images: imageUrls,
    });
  }
};

staticPaths.forEach((p) => addUrl(p));

let herbPaths = [];
let herbEntries = [];
try {
  const herbs = JSON.parse(
    fs.readFileSync("src/data/herbs/herbs.normalized.json", "utf-8"),
  );
  herbEntries = herbs;
  const sl = (value) =>
    String(value || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  herbPaths = [];
  for (const herb of herbs) {
    const slug = sl(herb.common || herb.scientific || "");
    if (!slug) continue;
    const route = `/herb/${slug}`;
    herbPaths.push(route);
    const image = herb?.og;
    addUrl(route, {
      images: image ? [image] : [],
      changefreq: "monthly",
    });
  }
} catch (error) {
  if (process.env.DEBUG_SITEMAP) {
    console.warn("Skipping herb URLs:", error);
  }
}

let blogPosts = [];
try {
  blogPosts = JSON.parse(
    fs.readFileSync("src/data/blog/posts.json", "utf-8"),
  );
  blogPosts
    .filter((post) => post && post.slug)
    .forEach((post) => {
      const lastmod = post.date ? new Date(post.date) : now;
      addUrl(`/blog/${post.slug}`, {
        lastmod,
        changefreq: "weekly",
        images: post.og ? [post.og] : [],
      });
    });
} catch (error) {
  if (process.env.DEBUG_SITEMAP) {
    console.warn("Skipping blog URLs:", error);
  }
  blogPosts = [];
}

const sortedEntries = Array.from(urlEntries.values()).sort((a, b) =>
  a.path.localeCompare(b.path),
);

await generateAllOgImages({ posts: blogPosts, herbs: herbEntries });

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${sortedEntries
  .map(
    (entry) => `  <url>
    <loc>${SITE}${entry.path}</loc>
    <lastmod>${formatDateForSitemap(entry.lastmod)}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
${(entry.images || [])
        .map((src) => `    <image:image>\n      <image:loc>${src}</image:loc>\n    </image:image>`)
        .join("\n")}
  </url>`,
  )
  .join("\n")}
</urlset>`;

fs.writeFileSync(sitemapPath, sitemap);

if (blogPosts.length > 0) {
  const sortedPosts = blogPosts
    .filter((post) => post && post.slug)
    .sort(
      (a, b) => new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime(),
    );
  const updated = sortedPosts[0]?.date
    ? new Date(sortedPosts[0].date)
    : now;
  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Hippie Scientist — Blog Feed</title>
  <id>${SITE}/blog</id>
  <updated>${updated.toISOString()}</updated>
  <link rel="self" href="${SITE}/feed.xml" />
  <link rel="alternate" href="${SITE}/blog" />
  ${sortedPosts
    .map((post) => {
      const postUrl = `${SITE}/blog/${post.slug}`;
      const published = post.date ? new Date(post.date) : now;
      const summary = post.excerpt || post.description || "";
      return `  <entry>
    <title><![CDATA[${post.title || "Untitled"}]]></title>
    <id>${postUrl}</id>
    <link href="${postUrl}" />
    <updated>${published.toISOString()}</updated>
    <published>${published.toISOString()}</published>
    <summary type="html"><![CDATA[${summary}]]></summary>
  </entry>`;
    })
    .join("\n")}
</feed>`;
  fs.writeFileSync(feedPath, feed);
  console.log("Wrote", sitemapPath, "and", feedPath, "with", sortedEntries.length, "URLs");
} else {
  if (fs.existsSync(feedPath)) {
    fs.unlinkSync(feedPath);
  }
  console.log("Wrote", sitemapPath, "with", sortedEntries.length, "URLs");
}

function normalizePath(p) {
  if (!p) return "/";
  return p.startsWith("/") ? p : `/${p}`;
}

function coerceDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  return date;
}

function formatDateForSitemap(date) {
  return coerceDate(date).toISOString().split("T")[0];
}

function absoluteUrl(value) {
  if (!value) return undefined;
  const stringValue = String(value);
  if (/^https?:\/\//i.test(stringValue)) return stringValue;
  const normalized = normalizePath(stringValue);
  return `${SITE}${normalized}`;
}
