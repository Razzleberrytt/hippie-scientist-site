import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const DIR = path.resolve("src/content/blog");
const OUT = path.resolve("src/data/blog/posts.json");

fs.mkdirSync(path.dirname(OUT), { recursive: true });

function slugify(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function getExcerpt(markdown) {
  const stripped = markdown
    .replace(/[#*_>\-\n`]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return stripped.slice(0, 240) + (stripped.length > 240 ? "…" : "");
}

const files = fs.existsSync(DIR)
  ? fs.readdirSync(DIR).filter((f) => f.endsWith(".md") || f.endsWith(".mdx"))
  : [];

const posts = [];

for (const file of files) {
  const src = fs.readFileSync(path.join(DIR, file), "utf-8");
  const { data: fm, content } = matter(src);
  const html = marked.parse(content);

  const title = fm.title || path.basename(file, path.extname(file));
  const slug = fm.slug || slugify(title);
  const date = fm.date || new Date().toISOString();
  const description = fm.description || fm.excerpt || getExcerpt(content);
  const image = fm.image || `/og/${slug}.png`;
  const category = fm.category || "General";

  posts.push({
    title,
    slug,
    date,
    description,
    image,
    category,
    excerpt: description,
    bodyHtml: html,
  });
}

posts.sort((a, b) => new Date(b.date) - new Date(a.date));

fs.writeFileSync(OUT, JSON.stringify(posts, null, 2));
console.log(`Built ${posts.length} posts → ${OUT}`);
