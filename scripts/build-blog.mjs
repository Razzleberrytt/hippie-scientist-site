// scripts/build-blog.mjs
import fs from "fs";
import fsp from "fs/promises";
import path from "path";
import matter from "gray-matter";
import MarkdownIt from "markdown-it";
import slugify from "slugify";

const md = new MarkdownIt({ html: false, linkify: true, breaks: true });

const ROOT = process.cwd();
const CONTENT_DIR = path.join(ROOT, "content", "blog");
// Write to /public so Vite will ship it into /dist unchanged
const OUT_DIR = path.join(ROOT, "public", "blogdata");
const POSTS_DIR = path.join(OUT_DIR, "posts");

const toSlug = (s) =>
  slugify(String(s || ""), { lower: true, strict: true, trim: true });

const readDirSafe = async (dir) => {
  try { return await fsp.readdir(dir); } catch { return []; }
};

const ensureDir = async (dir) => fsp.mkdir(dir, { recursive: true });

const excerptFromHtml = (html, limit = 220) => {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > limit ? text.slice(0, limit).trim() + "…" : text;
};

const normalizeDate = (v) => {
  if (!v) return null;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
};

(async function build() {
  const files = (await readDirSafe(CONTENT_DIR)).filter((f) => f.endsWith(".md"));

  if (!files.length) {
    console.warn(`[blog] No markdown files found in ${CONTENT_DIR}`);
  }

  await fsp.rm(OUT_DIR, { recursive: true, force: true });
  await ensureDir(POSTS_DIR);

  const index = [];

  for (const file of files) {
    const full = path.join(CONTENT_DIR, file);
    const raw = await fsp.readFile(full, "utf-8");
    const { data, content } = matter(raw);

    // Front-matter
    const title = data.title || path.basename(file, ".md");
    const date = normalizeDate(data.date) || normalizeDate(fs.statSync(full).mtime);
    const tags = Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []);
    const hero = data.image || null;
    const slug = data.slug ? toSlug(data.slug) : toSlug(title);

    // HTML
    const html = md.render(content);
    const excerpt = data.description || excerptFromHtml(html, 220);

    // Per-post JSON
    const post = { slug, title, date, tags, hero, excerpt, html };
    await fsp.writeFile(path.join(POSTS_DIR, `${slug}.json`), JSON.stringify(post, null, 2), "utf-8");

    // Index item (no big HTML)
    index.push({ slug, title, date, tags, hero, excerpt });
  }

  // sort newest first
  index.sort((a, b) => String(b.date).localeCompare(String(a.date)));

  await fsp.writeFile(path.join(OUT_DIR, "index.json"), JSON.stringify(index, null, 2), "utf-8");

  console.log(`[blog] Built ${index.length} posts → /public/blogdata`);
})();
