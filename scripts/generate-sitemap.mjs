const fs = await import("fs/promises");
const path = await import("path");
const SITE = "https://thehippiescientist.net";
const outDir = process.argv[2] || "public";

const pages = new Set([
  "/",
  "/blog/",
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/contact",
  "/herb-index",
]);

// Load blog posts if available
try {
  const idx = JSON.parse(
    await fs.readFile(path.resolve(outDir, "blogdata/index.json"), "utf8"),
  );
  idx.forEach((p) => pages.add(`/blog/${p.slug.replace(/#.*$/, "")}/`));
} catch {}

const now = new Date().toISOString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages]
  .sort()
  .map(
    (p) =>
      `  <url><loc>${SITE}${p}</loc><lastmod>${now}</lastmod><changefreq>${p.startsWith("/blog/") ? "weekly" : "monthly"}</changefreq></url>`,
  )
  .join("\n")}
</urlset>`;
await fs.writeFile(path.resolve(outDir, "sitemap.xml"), xml);
console.log("Wrote sitemap with", pages.size, "URLs");
