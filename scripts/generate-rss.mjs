import fs from "fs";
import path from "path";

const SITE = "https://thehippiescientist.net";
const OUT  = path.resolve("public/rss.xml");

let posts = [];
try {
  posts = JSON.parse(fs.readFileSync("src/data/blog/posts.json", "utf-8"));
} catch {
  console.warn("No blog posts found, skipping RSS feed.");
  process.exit(0);
}

const now = new Date().toUTCString();

const items = posts.map(p => {
  const url = `${SITE}/blog/${p.slug}`;
  const title = p.title || "Untitled";
  const desc = p.description || "";
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
console.log("RSS feed written to", OUT, "with", posts.length);
