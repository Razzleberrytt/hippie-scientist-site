import fs from 'fs';
import path from 'path';

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const PUBLIC_BLOG_DIR = path.join(process.cwd(), 'public', 'blog');
const AUTHOR = 'The Hippie Scientist';

const topics = [
  'Field Notes',
  'Research Digest',
  'Blend Craft',
  'Pharmacology Basics',
  'Traditional Use',
  'Extraction 101',
  'Microdosing Log',
  'Set & Setting',
];
const herbs = ['Kava', 'Blue Lotus', 'Mugwort', 'Damiana', 'Passionflower', 'Skullcap', 'Ashwagandha', 'Valerian', 'Rhodiola', 'Gotu Kola'];
const compounds = ['L-Theanine', 'Apigenin', 'Harmine', 'Beta-caryophyllene', 'Eugenol', 'Thujone', 'Choline', 'Hordenine'];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function rand(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function todayISO() {
  return new Date().toISOString();
}

function todayDate() {
  return todayISO().slice(0, 10);
}

function yaml(str) {
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

function run() {
  ensureDir(BLOG_DIR);
  ensureDir(PUBLIC_BLOG_DIR);

  const date = todayDate();
  const hasPost = fs.readdirSync(BLOG_DIR).some((file) => file.startsWith(`${date}-`) && file.endsWith('.mdx'));
  if (hasPost) {
    console.log('Post for today already exists.');
    return;
  }

  const title = `${rand(topics)} — ${rand(herbs)}`;
  const summary = `Daily notes on ${rand(herbs)} with attention to active compounds like ${rand(compounds)} and safe practice.`;
  const slug = `${date}-${slugify(title)}`;
  const coverRel = `/blog/${slug}.svg`;

  const frontmatter = `---
title: "${yaml(title)}"
date: "${todayISO()}"
author: "${AUTHOR}"
summary: "${yaml(summary)}"
tags: ["Daily","Field Notes","Herbs"]
cover: "${coverRel}"
draft: false
---`;

  const body = `
# ${title}

_${summary}_

## Highlights
- Context and traditional notes
- Quick pharmacology snapshot
- Practical prep and safety pointers

## Further Reading
- Placeholder reference A
- Placeholder reference B
`;

  fs.writeFileSync(path.join(BLOG_DIR, `${slug}.mdx`), `${frontmatter}\n${body}`, 'utf8');
  fs.writeFileSync(path.join(PUBLIC_BLOG_DIR, `${slug}.svg`), svg(Date.now()), 'utf8');
  console.log('Created blog post:', slug);
}

run();
