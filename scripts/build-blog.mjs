import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";

const SRC = "content/blog";
const OUT_DIR = "public/blogdata";       // static json/html that the app fetches
fs.mkdirSync(OUT_DIR, { recursive: true });

/** read all .md posts */
const files = fs.existsSync(SRC)
  ? fs.readdirSync(SRC).filter(f => f.endsWith(".md"))
  : [];

const posts = files.map(filename => {
  const raw = fs.readFileSync(path.join(SRC, filename), "utf-8");
  const { data, content } = matter(raw);
  const slug = (data.slug || filename.replace(/\.md$/, "")).toLowerCase();
  const html = marked.parse(content);
  const post = {
    slug,
    title: data.title || slug,
    date: data.date || new Date().toISOString().slice(0,10),
    excerpt: data.excerpt || "",
    tags: Array.isArray(data.tags) ? data.tags : [],
    html
  };
  // write html per post (static)
  fs.writeFileSync(path.join(OUT_DIR, `${slug}.html`), html, "utf-8");
  return post;
}).sort((a,b) => (a.date < b.date ? 1 : -1));

/** fallback welcome if none */
if (posts.length === 0) {
  const fallback = {
    slug: "welcome",
    title: "Welcome to The Hippie Scientist",
    date: new Date().toISOString().slice(0,10),
    excerpt: "What we’re building and how to use the herb index.",
    tags: ["site"],
    html: "<p>Welcome!</p>"
  };
  posts.push(fallback);
  fs.writeFileSync(path.join(OUT_DIR, "welcome.html"), fallback.html, "utf-8");
}

/** write the list store */
fs.writeFileSync(path.join(OUT_DIR, "posts.json"), JSON.stringify(posts, null, 2));
console.log(`Blog: wrote ${posts.length} posts to ${OUT_DIR}`);
