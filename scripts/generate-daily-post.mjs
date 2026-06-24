import fs from 'node:fs';
import path from 'node:path';
import { promptLLM } from './ai-client.mjs';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const PUBLIC_BLOG_DIR = path.join(process.cwd(), 'public', 'blog');
const MANIFEST_PATH = path.join(PUBLIC_BLOG_DIR, 'manifest.json');
const POSTS_PATH = path.join(process.cwd(), 'data', 'blog', 'posts.json');
const AUTHOR = 'Auto-Generator';

const topics = [
  'Field Notes',
  'Research Digest',
  'Blend Craft',
  'Pharmacology Basics',
  'Traditional Use',
  'Extraction 101',
  'Materia Medica',
  'Safety Snapshot',
];

const herbs = [
  'Kava',
  'Blue Lotus',
  'Mugwort',
  'Damiana',
  'Passionflower',
  'Skullcap',
  'Ashwagandha',
  'Valerian',
  'Rhodiola',
  'Gotu Kola',
  'Lemon Balm',
  'Holy Basil',
];

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function nowIso() {
  return new Date().toISOString();
}

function todayDate() {
  return nowIso().slice(0, 10);
}

function yamlSafe(str) {
  return String(str).replace(/"/g, '\\"').replace(/:/g, '\\:');
}

function svg(seed) {
  const h1 = (seed * 59) % 360;
  const h2 = (seed * 97) % 360;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" xmlns="http://www.w3.org/2000/svg">
<defs><radialGradient id="g" cx="45%" cy="40%" r="70%">
<stop offset="0%" stop-color="hsl(${h1},70%,60%)"/><stop offset="100%" stop-color="hsl(${h2},60%,12%)"/></radialGradient></defs>
<rect width="100%" height="100%" fill="url(#g)"/></svg>`;
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function wordCount(text) {
  return String(text)
    .replace(/[#*_`>-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean).length;
}

function estimateReadingTime(words) {
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

function cleanExcerpt(text, max = 220) {
  const compact = String(text).replace(/\s+/g, ' ').trim();
  if (compact.length <= max) return compact;
  return `${compact.slice(0, max - 1).trimEnd()}…`;
}

async function generatePostContent({ title, herb, topic }) {
  const system = `You write educational herb blog posts for The Hippie Scientist. Use clear, grounded language. Avoid dosage instructions and medical advice. Output strict JSON only.`;
  const prompt = `Create one blog post in JSON format about "${herb}" under the framing "${topic}".

Return ONLY valid JSON with this exact shape:
{
  "excerpt": "1-2 sentence teaser, 140-220 chars",
  "content": "Markdown with an H1 title and 4-6 ## sections"
}

Rules:
- Content body must be 400-600 words.
- Mention ${herb} naturally throughout.
- Include practical preparation context and a safety section.
- Use cautious phrasing (may, might, preliminary evidence).
- No medical claims, no personalized guidance, no dosage recommendations.
- Keep it educational and specific, not generic filler.
- Do not include code fences or extra keys.`;

  const output = await promptLLM({ system, prompt });
  let parsed;
  try {
    parsed = JSON.parse(output);
  } catch {
    throw new Error('LLM returned invalid JSON for daily post generation.');
  }

  const excerpt = String(parsed?.excerpt || '').trim();
  const content = String(parsed?.content || '').trim();

  if (!excerpt || !content) {
    throw new Error('LLM response missing excerpt/content.');
  }

  const words = wordCount(content);
  if (words < 400 || words > 600) {
    throw new Error(`LLM content length out of range: expected 400-600 words, received ${words}.`);
  }

  const herbToken = herb.toLowerCase();
  if (!excerpt.toLowerCase().includes(herbToken) || !content.toLowerCase().includes(herbToken)) {
    throw new Error('Generated post failed consistency check (herb missing in excerpt/content).');
  }

  const normalizedContent = content.startsWith('# ') ? content : `# ${title}\n\n${content}`;
  return {
    excerpt,
    content: normalizedContent,
    words,
  };
}

function appendManifest(entry) {
  const manifest = readJsonArray(MANIFEST_PATH);
  const exists = manifest.some(item => item && item.slug === entry.slug);
  if (exists) return;
  manifest.unshift(entry);
  writeJson(MANIFEST_PATH, manifest);
}

function appendPostsJson(entry) {
  const posts = readJsonArray(POSTS_PATH);
  const exists = posts.some(item => item && item.slug === entry.slug);
  if (exists) return false;

  const filtered = posts.filter(post => post?.slug !== 'coming-soon');
  filtered.push(entry);
  writeJson(POSTS_PATH, filtered);
  return true;
}

function buildMdx({ title, summary, dateIso, dateOnly, coverRel, body }) {
  const frontmatter = `---
title: "${yamlSafe(title)}"
date: "${dateIso}"
lastUpdated: "${dateOnly}"
author: "${AUTHOR}"
summary: "${yamlSafe(summary)}"
sources: []
tags: ["Daily","Field Notes","Herbs"]
cover: "${coverRel}"
---`;

  return `${frontmatter}\n\n${body}\n`;
}

async function run() {
  ensureDir(BLOG_DIR);
  ensureDir(PUBLIC_BLOG_DIR);
  ensureDir(path.dirname(POSTS_PATH));

  const dateOnly = todayDate();
  const topic = rand(topics);
  const herb = rand(herbs);
  const title = `${topic} — ${herb}`;
  const slug = `${dateOnly}-${slugify(title)}`;

  const hasPostToday = readJsonArray(POSTS_PATH).some(
    post => typeof post?.slug === 'string' && post.slug.startsWith(`${dateOnly}-`),
  );
  if (hasPostToday) {
    console.log('Post for today already exists in data/blog/posts.json.');
    return;
  }

  const generated = await generatePostContent({ title, herb, topic });
  const dateIso = nowIso();
  const coverRel = `/blog/${slug}.svg`;

  const entry = {
    slug,
    title,
    date: dateOnly,
    lastUpdated: dateOnly,
    author: AUTHOR,
    sources: [],
    excerpt: cleanExcerpt(generated.excerpt, 220),
    description: cleanExcerpt(generated.excerpt, 180),
    summary: cleanExcerpt(generated.excerpt, 220),
    tags: ['Daily', 'Field Notes', 'Herbs'],
    readingTime: estimateReadingTime(generated.words),
    content: generated.content,
    cover: coverRel,
    featuredImage: coverRel,
    ogImage: coverRel,
  };

  const wrotePosts = appendPostsJson(entry);
  if (!wrotePosts) {
    console.log('Post slug already exists in data/blog/posts.json:', slug);
    return;
  }

  const mdx = buildMdx({
    title,
    summary: entry.excerpt,
    dateIso,
    dateOnly,
    coverRel,
    body: generated.content,
  });

  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.mdx`), mdx, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_BLOG_DIR, `${slug}.svg`), svg(Date.now()), 'utf8');

  appendManifest({
    slug,
    title,
    date: dateOnly,
    lastUpdated: dateOnly,
    author: AUTHOR,
    summary: entry.summary,
    sources: [],
    tags: entry.tags,
    cover: coverRel,
  });

  console.log('Created blog post:', slug);
}

run().catch(error => {
  console.error('[generate-daily-post] Failed:', error instanceof Error ? error.message : error);
  process.exit(1);
});
