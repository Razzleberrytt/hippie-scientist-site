import fs from "fs";
import path from "path";

const SITE   = "https://thehippiescientist.net";
const outDir = process.argv[2] || process.env.OUT_DIR || "public";
fs.mkdirSync(outDir, { recursive: true });

const out = path.resolve(outDir, "sitemap.xml");

// Confirm your real policy slugs here if different:
const staticPaths = [
  "/",
  "/database",
  "/blog",
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/contact"
];

// Optional herb URLs (safe if file missing)
let herbPaths = [];
try {
  const herbs = JSON.parse(fs.readFileSync("src/data/herbs/herbs.normalized.json","utf-8"));
  const sl = s => String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");
  herbPaths = herbs
    .map(h => sl(h.common || h.scientific || ""))
    .filter(Boolean)
    .map(slug => `/herb/${slug}`);
} catch (_) { /* ok if not present locally */ }

let blogPaths = [];
try {
  const blogPosts = JSON.parse(
    fs.readFileSync("src/data/blog/posts.json", "utf-8"),
  );
  blogPaths = (Array.isArray(blogPosts) ? blogPosts : [])
    .map((post) => (post && post.slug ? `/blog/${post.slug}` : null))
    .filter(Boolean);
} catch (_) {
  /* ok if posts missing */
}

const pages = Array.from(new Set([...staticPaths, ...herbPaths, ...blogPaths])).sort();
const now = new Date().toISOString();

const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(p => `  <url>
    <loc>${SITE}${p}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>${p.startsWith("/blog") ? "weekly" : "monthly"}</changefreq>
  </url>`).join("\n")}
</urlset>`;

fs.writeFileSync(out, body);
console.log("Wrote", out, "with", pages.length, "URLs");
