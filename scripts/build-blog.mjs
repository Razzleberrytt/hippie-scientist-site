import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'blog', 'posts.json');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const toIsoDate = value => {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const estimateReadingTime = text => {
  const words = String(text)
    .replace(/[#*_`>\-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
};

const normalizeExcerpt = (excerpt, fallback) => {
  const preferred = String(excerpt || '').trim();
  if (preferred) return preferred;

  const compact = String(fallback || '').replace(/\s+/g, ' ').trim();
  if (!compact) return 'No summary yet.';
  return compact.length > 220 ? `${compact.slice(0, 219).trimEnd()}…` : compact;
};

const getSlugFromFilename = fileName =>
  fileName.replace(/\.(mdx)$/i, '').toLowerCase();

const validateSlug = slug => SLUG_PATTERN.test(slug);

function buildPostFromFile(fileName) {
  const filePath = path.join(BLOG_DIR, fileName);
  const source = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(source);

  const rawSlug = String(data.slug || getSlugFromFilename(fileName)).trim().toLowerCase();
  const title = String(data.title || '').trim();
  const date = toIsoDate(data.date);

  if (!validateSlug(rawSlug)) {
    throw new Error(`Invalid slug "${rawSlug}" in ${fileName}.`);
  }
  if (!title) {
    throw new Error(`Missing required frontmatter field "title" in ${fileName}.`);
  }
  if (!date) {
    throw new Error(`Missing or invalid required frontmatter field "date" in ${fileName}.`);
  }

  const excerpt = normalizeExcerpt(data.excerpt, data.summary || content);

  return {
    slug: rawSlug,
    title,
    excerpt,
    date,
    readingTime: estimateReadingTime(content),
    content: content.trim(),
  };
}

function run() {
  if (!fs.existsSync(BLOG_DIR)) {
    throw new Error(`Blog content directory not found: ${BLOG_DIR}`);
  }

  const files = fs
    .readdirSync(BLOG_DIR)
    .filter(fileName => /\.(md|mdx)$/i.test(fileName))
    .sort((a, b) => a.localeCompare(b));

  const posts = files.map(buildPostFromFile);

  const seen = new Set();
  for (const post of posts) {
    if (seen.has(post.slug)) {
      throw new Error(`Duplicate slug detected: ${post.slug}`);
    }
    seen.add(post.slug);
  }

  posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');

  console.log(`[build-blog] Wrote ${posts.length} posts to ${OUTPUT_PATH}`);
}

run();
