import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import matter from "gray-matter";
import { marked } from "marked";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT = path.resolve(__dirname, "..");
const CONTENT = path.join(ROOT, "content", "blog");
const PUBLIC = path.join(ROOT, "public");
const GEN = path.join(ROOT, "src", "generated");
const HTML_OUT = path.join(PUBLIC, "blog-html");
const FEED_OUT = path.join(PUBLIC, "atom.xml");
const STORE_PUBLIC = path.join(PUBLIC, "blogdata.json");
const STORE_SRC = path.join(GEN, "blogdata.json");
const SITE = "https://thehippiescientist.net";

fs.mkdirSync(HTML_OUT, { recursive: true });
fs.mkdirSync(GEN, { recursive: true });

/** load markdown */
const files = fs.readdirSync(CONTENT)
  .filter(f => f.endsWith(".md"))
  .sort();

const posts = [];

for (const file of files) {
  const raw = fs.readFileSync(path.join(CONTENT, file), "utf-8");
  const { data, content } = matter(raw);
  const slug = (data.slug || file.replace(/\.md$/, "")).toLowerCase();
  const title = data.title || slug;
  const date = data.date ? new Date(data.date).toISOString() : new Date().toISOString();
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const html = marked.parse(content);
  const excerpt = (data.description || content.replace(/\n+/g, " ").slice(0, 220)).trim();

  // write per-post HTML for /blog/:slug reader
  fs.writeFileSync(path.join(HTML_OUT, `${slug}.html`), html);

  posts.push({ slug, title, date, excerpt, tags });
}

// newest first
posts.sort((a,b) => new Date(b.date) - new Date(a.date));

const version = Date.now().toString();
const store = { version, count: posts.length, posts };

// emit store to public (runtime consumers) and src/generated (bundled import)
fs.writeFileSync(STORE_PUBLIC, JSON.stringify(store, null, 2));
fs.writeFileSync(STORE_SRC, JSON.stringify(store));

console.log(`Wrote ${posts.length} posts; version=${version}`);

/** minimal Atom feed */
const feedItems = posts.map(p => `
  <entry>
    <title><![CDATA[${p.title}]]></title>
    <id>${SITE}/blog/${p.slug}</id>
    <link href="${SITE}/blog/${p.slug}" />
    <updated>${p.date}</updated>
    <summary><![CDATA[${p.excerpt}]]></summary>
  </entry>`).join("\n");

const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>The Hippie Scientist — Blog</title>
  <id>${SITE}/blog</id>
  <link rel="self" href="${SITE}/atom.xml"/>
  <updated>${new Date().toISOString()}</updated>
  ${feedItems}
</feed>`;

fs.writeFileSync(FEED_OUT, feed);

// optional: append blog routes to sitemap if script/file exists
try {
  const sitemapPath = path.join(PUBLIC, "sitemap.xml");
  if (fs.existsSync(sitemapPath)) {
    let sm = fs.readFileSync(sitemapPath, "utf-8");
    // naive append just before closing </urlset>
    const urls = posts.map(p => `  <url><loc>${SITE}/blog/${p.slug}</loc></url>`).join("\n");
    sm = sm.replace("</urlset>", `${urls}\n</urlset>`);
    fs.writeFileSync(sitemapPath, sm);
  }
} catch (e) {
  console.warn("sitemap append skipped:", e.message);
}
