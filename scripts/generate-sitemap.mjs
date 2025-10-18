import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outDir = process.argv[2] ? path.resolve(process.argv[2]) : path.resolve(__dirname, "..", "dist");
const site = "https://thehippiescientist.net";

const staticPaths = [
  "/",
  "/blog/",
  "/about",
  "/privacy-policy",
  "/disclaimer",
  "/contact",
  "/herb-index",
];

function urlEntry(loc) {
  const lastmod = new Date().toISOString();
  return `<url><loc>${site}${loc}</loc><lastmod>${lastmod}</lastmod><changefreq>weekly</changefreq><priority>0.6</priority></url>`;
}

function toSlugPath(slug) {
  slug = String(slug || "").replace(/^\/+|\/+$/g, "");
  return slug ? `/blog/${slug}/` : null;
}

function readPosts() {
  const blogDataPath = path.resolve(__dirname, "..", "public", "blogdata", "index.json");
  if (!fs.existsSync(blogDataPath)) return [];
  try {
    const raw = fs.readFileSync(blogDataPath, "utf-8");
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function buildXml() {
  const baseUrls = staticPaths.map(urlEntry);
  const postUrls = [];
  const seen = new Set();
  for (const post of readPosts()) {
    const loc = toSlugPath(post.slug);
    if (loc && !seen.has(loc)) {
      seen.add(loc);
      postUrls.push(urlEntry(loc));
    }
  }
  const body = [...baseUrls, ...postUrls].join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${body}\n</urlset>\n`;
}

function run() {
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const xml = buildXml();
  const outFile = path.join(outDir, "sitemap.xml");
  fs.writeFileSync(outFile, xml, "utf-8");
  console.log("[sitemap] wrote", outFile);
}

run();
