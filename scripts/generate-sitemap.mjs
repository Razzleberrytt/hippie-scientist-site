const fs = await import("fs/promises");
const path = await import("path");

const BASE_URL = "https://thehippiescientist.net";
const OUTPUT_PATH = path.resolve("public", "sitemap.xml");
const BLOG_INDEX_PATH = path.resolve("public", "blogdata", "index.json");

const STATIC_PAGES = [
  "/",
  "/blog/",
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/contact",
  "/herb-index",
];

const urls = new Set(STATIC_PAGES);

const ensureCleanPath = (slug) => {
  if (!slug) return null;
  const withoutHash = String(slug).trim().replace(/#.*/, "");
  const normalized = withoutHash.replace(/^[\\/]+/, "").replace(/[\\/]+/g, "/");
  const trimmed = normalized.replace(/\/+$/, "");
  if (!trimmed) return null;
  return `/blog/${trimmed}/`;
};

try {
  const raw = await fs.readFile(BLOG_INDEX_PATH, "utf8");
  const posts = JSON.parse(raw);
  posts.forEach(({ slug }) => {
    const clean = ensureCleanPath(slug);
    if (clean) urls.add(clean);
  });
} catch (error) {
  if (error.code !== "ENOENT") {
    console.error("Failed to read blog index", error);
    process.exitCode = 1;
  }
}

const now = new Date().toISOString();
const body = [...urls]
  .sort()
  .map((pathname) => {
    const changefreq = pathname.startsWith("/blog/") ? "weekly" : "monthly";
    return `  <url><loc>${BASE_URL}${pathname}</loc><lastmod>${now}</lastmod><changefreq>${changefreq}</changefreq></url>`;
  })
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;

await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await fs.writeFile(OUTPUT_PATH, xml);

console.log(`Wrote sitemap with ${urls.size} URLs to ${OUTPUT_PATH}`);
