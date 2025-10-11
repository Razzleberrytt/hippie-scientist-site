#!/usr/bin/env node
import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const ROOT = process.cwd();
const BLOG_SRC = path.join(ROOT, "content", "blog");
const OUT = path.join(ROOT, "public", "blogdata");
const POSTS_OUT = path.join(OUT, "posts");

fs.mkdirSync(OUT, { recursive: true });
fs.rmSync(POSTS_OUT, { recursive: true, force: true });
fs.mkdirSync(POSTS_OUT, { recursive: true });

const files = fs.existsSync(BLOG_SRC)
  ? fs.readdirSync(BLOG_SRC).filter((f) => f.endsWith(".md"))
  : [];
const rows = [];

for (const file of files) {
  const slug = file.replace(/\.md$/, "");
  const raw = fs.readFileSync(path.join(BLOG_SRC, file), "utf-8");
  const { data, content } = matter(raw);
  const html = marked.parse(content);
  const firstLine = (content || "")
    .split("\n")
    .find((l) => l.trim())
    ?.trim();
  const excerptSource = (data.description || firstLine || "").trim();
  const excerpt = excerptSource.slice(0, 220);

  fs.writeFileSync(path.join(POSTS_OUT, `${slug}.html`), html, "utf-8");

  rows.push({
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString().slice(0, 10),
    excerpt,
    tags: data.tags || [],
    description: data.description || excerpt,
  });
}

rows.sort((a, b) => (a.date < b.date ? 1 : -1));
fs.writeFileSync(path.join(OUT, "index.json"), JSON.stringify(rows, null, 2), "utf-8");

console.log(`Built ${rows.length} posts → /public/blogdata`);
