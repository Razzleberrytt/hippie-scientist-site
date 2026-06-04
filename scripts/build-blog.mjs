import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const OUTPUT_PATH = path.join(process.cwd(), 'data', 'blog', 'posts.json');

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const PROFILE_STATUS_PATTERN = /^(draft|published|archived)$/;

const toIsoDate = value => {
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

const estimateReadingTime = text => {
  const words = String(text)
    .replace(/[#*_`>-]/g, ' ')
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
  fileName.replace(/\.(md|mdx)$/i, '').toLowerCase();

const validateSlug = slug => SLUG_PATTERN.test(slug);

const asStringArray = (value, fieldName, fileName) => {
  if (value == null) return [];
  if (Array.isArray(value)) return value.map(item => String(item).trim()).filter(Boolean);
  if (typeof value === 'string') {
    return value
      .split(',')
      .map(item => item.trim())
      .filter(Boolean);
  }

  if (typeof value === 'object') {
    return Object.values(value).map(item => String(item).trim()).filter(Boolean);
  }

  throw new Error(`${fieldName} must be a YAML list, object list, or comma-separated string in ${fileName}.`);
};

function parseMatter(source, fileName) {
  try {
    const parsed = matter(source, {
      engines: {
        yaml: sourceText => {
          try {
            return matter.engines.yaml(sourceText);
          } catch (error) {
            throw new Error(`YAML frontmatter error in ${fileName}: ${error.message}`);
          }
        },
      },
    });
    return {
      data: parsed.data && typeof parsed.data === 'object' ? parsed.data : {},
      content: String(parsed.content || ''),
    };
  } catch (error) {
    throw new Error(`Failed to parse frontmatter in ${fileName}: ${error.message}`);
  }
}

function buildPostFromFile(fileName) {
  try {
    const filePath = path.join(BLOG_DIR, fileName);
    const source = fs.readFileSync(filePath, 'utf8');
    const { data, content } = parseMatter(source, fileName);

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
    const profileStatus = String(data.profile_status || '').trim().toLowerCase();
    const hasProfileStatus = profileStatus.length > 0;
    const hasSitemapIncluded = Object.prototype.hasOwnProperty.call(data, 'sitemap_included');

    if (hasProfileStatus && !PROFILE_STATUS_PATTERN.test(profileStatus)) {
      throw new Error(`Invalid profile_status "${profileStatus}" in ${fileName}.`);
    }

    if (hasSitemapIncluded && typeof data.sitemap_included !== 'boolean') {
      throw new Error(`sitemap_included must be a boolean in ${fileName}.`);
    }

    const post = {
      slug: rawSlug,
      title,
      excerpt,
      date,
      readingTime: estimateReadingTime(content),
      content: content.trim(),
      ai_assisted: Boolean(data.ai_assisted),
      controlled_substance: Boolean(data.controlled_substance),
    };

    const tags = asStringArray(data.tags, 'tags', fileName);
    if (tags.length > 0) {
      post.tags = tags;
    }

    const categories = asStringArray(data.categories, 'categories', fileName);
    if (categories.length > 0) {
      post.categories = categories;
    }

    if (hasProfileStatus) {
      post.profile_status = profileStatus;
    }

    if (hasSitemapIncluded) {
      post.sitemap_included = data.sitemap_included;
    }

    return post;
  } catch (error) {
    throw new Error(`Failed to build blog post ${fileName}: ${error.message}`);
  }
}

function writePosts(posts) {
  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(posts, null, 2)}\n`, 'utf8');
  console.log(`[build-blog] Wrote ${posts.length} posts to ${OUTPUT_PATH}`);
}

function run() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn(`[build-blog] Blog content directory not found: ${BLOG_DIR}`);
    writePosts([]);
    return;
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
  writePosts(posts);
}

run();
