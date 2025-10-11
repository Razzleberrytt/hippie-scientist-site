#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "node:child_process";
import matter from "gray-matter";
import { marked } from "marked";

// Configure marked to ensure proper spacing and semantic tags
marked.setOptions({
  breaks: true,
  headerIds: true,
  mangle: false,
});

const ROOT = process.cwd();
const BLOG_SRC = path.join(ROOT, "content", "blog");
const OUT = path.join(ROOT, "public", "blogdata");
const POSTS_OUT = path.join(OUT, "posts");

function iso(d) {
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

/**
 * Resolve the post's creation date with this precedence:
 * 1) front-matter 'date'
 * 2) first Git commit author date (if repo)
 * 3) file system birthtime
 * 4) now
 */
function getCreatedDate(fp, fmDate) {
  const frontMatter = fmDate ? iso(fmDate) : null;
  if (frontMatter) return frontMatter;

  try {
    const cmd = `git log --follow --diff-filter=A --format=%aI -- "${fp}" | tail -n 1`;
    const out = execSync(cmd, { stdio: ["ignore", "pipe", "ignore"] }).toString().trim();
    const gitDate = out ? iso(out) : null;
    if (gitDate) return gitDate;
  } catch {}

  try {
    const st = fs.statSync(fp);
    const birth = st.birthtime ? iso(st.birthtime) : null;
    if (birth) return birth;
  } catch {}

  return iso(Date.now());
}

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(POSTS_OUT, { recursive: true, force: true });
fs.mkdirSync(POSTS_OUT, { recursive: true });

const files = fs.existsSync(BLOG_SRC)
  ? fs.readdirSync(BLOG_SRC).filter((f) => f.endsWith(".md"))
  : [];
const rows = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const filePath = path.join(BLOG_SRC, file);
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  const firstParagraph = content.split(/\n\s*\n/).find(Boolean) || content;
  const excerpt = firstParagraph.replace(/\n+/g, " ").slice(0, 220);
  const words = content.trim().split(/\s+/).length;
  const readingTime = `${Math.max(1, Math.round(words / 225))} min read`;
  const created = getCreatedDate(filePath, data?.date);

  fs.writeFileSync(path.join(POSTS_OUT, `${slug}.html`), html, "utf-8");

  rows.push({
    slug,
    title: data.title || slug,
    date: created,
    description: data.description || excerpt,
    tags: data.tags || [],
    readingTime,
  });
}

rows.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(rows, null, 2), "utf-8");

console.log(`Built ${rows.length} posts → /public/blogdata`);
