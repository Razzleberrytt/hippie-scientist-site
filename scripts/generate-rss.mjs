import fs from "fs";
import path from "path";

const SITE = "https://thehippiescientist.net";
const OUT  = path.resolve("public/feed.xml");
const OUT2 = path.resolve("public/rss.xml");

let posts = [];
try {
  posts = JSON.parse(fs.readFileSync("src/data/blog/posts.json", "utf-8"));
} catch {
  console.warn("No blog posts found, skipping RSS feed.");
  process.exit(0);
}

const now = new Date().toUTCString();
const normalizedPosts = posts
  .slice()
  .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
  .slice(0, 50);

const items = normalizedPosts.map(p => {
  const url = `${SITE}/blog/${p.slug}`;
  const title = p.title || "Untitled";
  const desc = p.description || p.summary || "";
  const pub = new Date(p.date || Date.now()).toUTCString();
  return `
    <item>
      <title><![CDATA[${title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${pub}</pubDate>
      <description><![CDATA[${desc}]]></description>
    </item>`;
}).join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>The Hippie Scientist Blog</title>
  <link>${SITE}/blog</link>
  <description>Psychoactive botany, safety, and DIY blend guides</description>
  <language>en</language>
  <lastBuildDate>${now}</lastBuildDate>
  ${items}
</channel>
</rss>`;

fs.writeFileSync(OUT, xml);
try {
  fs.writeFileSync(OUT2, xml);
} catch (error) {
  console.warn("Unable to mirror RSS feed to", OUT2, error);
}

console.log("RSS feed written to", OUT, "with", normalizedPosts.length);
