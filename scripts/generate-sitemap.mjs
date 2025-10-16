const fs = await import("fs/promises");
const path = await import("path");

const SITE = "https://thehippiescientist.net";
const outDir = process.argv[2] || "public";

const baseDirs = [outDir, "public"].map((dir) => path.resolve(dir));
const pages = new Set([
  "/",
  "/about",
  "/contact",
  "/disclaimer",
  "/privacy-policy",
  "/herbs",
  "/herb-index",
  "/browse/herbs",
  "/browse/compounds",
  "/blog",
  "/compounds",
  "/compare",
  "/favorites",
  "/theme",
  "/newsletter",
  "/graph",
  "/store",
  "/learn",
  "/research",
  "/safety",
  "/community",
  "/blend",
  "/build",
  "/downloads",
  "/data-report",
  "/data-fix",
  "/sitemap",
]);

const readJSON = async (relativePath) => {
  for (const dir of baseDirs) {
    try {
      const file = await fs.readFile(path.resolve(dir, relativePath), "utf8");
      return JSON.parse(file);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return null;
};

const blogIndex = await readJSON(path.join("blogdata", "index.json"));
if (Array.isArray(blogIndex)) {
  blogIndex.forEach((post) => {
    if (post?.slug) {
      pages.add(`/blog/${post.slug}`);
    }
  });
}

const herbs = await readJSON(path.join("data", "herbs.json"));
if (Array.isArray(herbs)) {
  herbs.forEach((herb) => {
    if (herb?.id) {
      pages.add(`/herbs/${herb.id}`);
    }
  });
}

const compounds = await readJSON(path.join("data", "compounds.json"));
if (Array.isArray(compounds)) {
  compounds.forEach((compound) => {
    const slug = compound?.slug || compound?.id;
    if (slug) {
      pages.add(`/compounds/${slug}`);
    }
  });
}

const now = new Date().toISOString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...pages]
  .sort()
  .map((p) => {
    const changefreq = p.startsWith("/blog/") ? "weekly" : "monthly";
    return `  <url><loc>${SITE}${p}</loc><lastmod>${now}</lastmod><changefreq>${changefreq}</changefreq></url>`;
  })
  .join("\n")}
</urlset>`;

await fs.writeFile(path.resolve(outDir, "sitemap.xml"), xml);
console.log("Wrote sitemap with", pages.size, "URLs");
