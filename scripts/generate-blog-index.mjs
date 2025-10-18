import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDataPath = path.resolve(__dirname, "..", "public", "blogdata", "index.json");
const outDir = path.resolve(__dirname, "..", "public", "blog");
const outFile = path.join(outDir, "index.html");

function esc(s = "") {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

async function run() {
  if (!fs.existsSync(blogDataPath)) {
    console.warn("[generate-blog-index] Skipped: no blogdata at", blogDataPath);
    return;
  }
  const raw = fs.readFileSync(blogDataPath, "utf-8");
  /** @type {{slug:string,title:string,date?:string,description?:string}[]} */
  const posts = JSON.parse(raw);

  posts.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const items = posts.map(p => {
    const slug = String(p.slug || "").replace(/^\/+|\/+$/g, "");
    const url = `/blog/${slug}/`;
    const date = p.date ? `<time datetime="${esc(p.date)}">${esc(p.date)}</time>` : "";
    const desc = p.description ? `<div class="desc">${esc(p.description)}</div>` : "";
    return `<li><a href="${esc(url)}">${esc(p.title || slug)}</a> ${date}${desc}</li>`;
  }).join("\n");

  const nav = `
  <footer>
    <nav>
      <a href="/">Home</a> ·
      <a href="/blog">Blog</a> ·
      <a href="/about">About</a> ·
      <a href="/privacy-policy">Privacy</a> ·
      <a href="/disclaimer">Disclaimer</a> ·
      <a href="/contact">Contact</a> ·
      <a href="/herb-index">Herb Index</a>
    </nav>
  </footer>`;

  const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <title>Blog — The Hippie Scientist</title>
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="index,follow" />
  <link rel="canonical" href="https://thehippiescientist.net/blog/" />
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem; line-height: 1.5; }
    h1 { font-size: 1.75rem; margin-bottom: 1rem; }
    ul { list-style: none; padding: 0; }
    li { margin: 0 0 1rem 0; }
    a { text-decoration: none; }
    a:hover { text-decoration: underline; }
    .desc { opacity: .8; }
    footer { margin-top: 2rem; font-size: .9rem; }
    footer nav a { color: inherit; }
  </style>
</head>
<body>
  <h1>Blog</h1>
  <ul>${items}</ul>
  <p><a href="/">← Back to home</a></p>
${nav}
</body>
</html>`;

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(outFile, html, "utf-8");
  console.log("[generate-blog-index] Wrote", outFile, "with", posts.length, "posts");
}

run().catch(e => {
  console.error("[generate-blog-index] Failed:", e);
  process.exit(1);
});
