// scripts/generate-backdated-posts.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BLOG_DIR = path.join(process.cwd(), 'content', 'blog');
const PUBLIC_BLOG_DIR = path.join(process.cwd(), 'public', 'blog');

// Config
const DAYS_BACK = 60;             // ~two months
const POST_TIME = { hour: 9, minute: 30 }; // 09:30 local each day
const AUTHOR = 'The Hippie Scientist';

const topics = [
  'Psychoactive Botany','Blend Craft','Cultivar Notes','Research Digest',
  'Field Notes','Pharmacology Basics','Traditional Use','Formulation Tips',
  'Safety & Set/Setting','Extraction 101','Bioassays','Microdosing Log'
];

const herbs = [
  'Kava','Calea zacatechichi','Lion\'s Mane','Blue Lotus','Mugwort',
  'Damiana','Passionflower','Skullcap','Ashwagandha','Valerian',
  'Rhodiola','Gotu Kola','Amanita muscaria','Reishi','Cordyceps'
];

const compounds = [
  'L-Theanine','Apigenin','Harmine','Myriscin','Mesembrine',
  'Beta-caryophyllene','Eugenol','Thujone','Choline','Hordenine'
];

function ensureDir(p) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function rand(arr) { return arr[Math.floor(Math.random()*arr.length)]; }
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
}

function dateForOffset(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(POST_TIME.hour, POST_TIME.minute, 0, 0);
  return d;
}

function listExistingSlugs() {
  ensureDir(BLOG_DIR);
  const files = fs.readdirSync(BLOG_DIR).filter(f => f.endsWith('.md') || f.endsWith('.mdx'));
  return new Set(files.map(f => f.replace(/\.(md|mdx)$/,'').toLowerCase()));
}

function postFilenameFromDate(date, slug) {
  const iso = date.toISOString().slice(0,10); // YYYY-MM-DD
  return `${iso}-${slug}.mdx`;
}

function svgGradient(seed) {
  // deterministic-ish gradient from seed
  const h1 = (seed * 61) % 360;
  const h2 = (seed * 127) % 360;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1600" height="900" viewBox="0 0 1600 900" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <radialGradient id="g1" cx="30%" cy="35%" r="70%">
      <stop offset="0%" stop-color="hsl(${h1},70%,60%)" />
      <stop offset="100%" stop-color="hsl(${h2},60%,12%)" />
    </radialGradient>
    <filter id="noise">
      <feTurbulence baseFrequency="0.9" numOctaves="2" type="fractalNoise" />
      <feColorMatrix type="saturate" values="0.2"/>
      <feBlend mode="soft-light" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="url(#g1)"/>
  <rect width="100%" height="100%" fill="#000" opacity="0.1" filter="url(#noise)"/>
</svg>`;
}

function mdxTemplate({title, dateISO, summary, tags, cover, slug}) {
  return `---
title: "${title}"
date: "${dateISO}"
author: "${AUTHOR}"
summary: "${summary}"
tags: ${JSON.stringify(tags)}
cover: "${cover}"
draft: false
---

import Callout from '@/components/Callout' /* safe to leave; if missing, remove this line */

# ${title}

_${summary}_

<Callout emoji="🌿">This post is part of our daily field notes series.</Callout>

## Highlights

- Context and traditional use
- Pharmacology snapshot and key actives
- Practical tips: preparation, dosing ranges, safety

## Quick Blend Idea

Try pairing **${rand(herbs)}** with **${rand(compounds)}** for a complementary effect profile. Start low, go slow.

## Further Reading

- Placeholder reference A
- Placeholder reference B

*Filed in: ${tags.join(', ')}.*
`;
}

function generate() {
  ensureDir(BLOG_DIR);
  ensureDir(PUBLIC_BLOG_DIR);
  const existing = listExistingSlugs();
  let created = 0;

  for (let i = DAYS_BACK - 1; i >= 0; i--) {
    const date = dateForOffset(i);
    const dayLabel = date.toLocaleDateString('en-US', { weekday:'long' });
    const title = `${rand(topics)} — ${rand(herbs)} (${dayLabel} Notes)`;
    const slug = slugify(title);
    const filename = postFilenameFromDate(date, slug);
    const fileSlug = filename.replace(/\.(md|mdx)$/,'').toLowerCase();

    if (existing.has(fileSlug)) continue; // skip if something already exists for that date+slug

    const summary = `Daily notes on ${rand(herbs)} with a focus on practical use, active compounds like ${rand(compounds)}, and safe experimentation.`;
    const tags = [rand(['Field Notes','Research','Blend Ideas','Safety']), rand(['Herbs','Compounds','Culture'])];

    const coverPath = `/blog/${slug}.svg`;
    const coverAbs = path.join(PUBLIC_BLOG_DIR, `${slug}.svg`);
    fs.writeFileSync(coverAbs, svgGradient(i+7), 'utf8');

    const body = mdxTemplate({
      title,
      dateISO: date.toISOString(),
      summary,
      tags,
      cover: coverPath,
      slug
    });

    const abs = path.join(BLOG_DIR, filename);
    fs.writeFileSync(abs, body, 'utf8');
    created++;
  }

  console.log(`✅ Generated ${created} backdated posts in ${BLOG_DIR}`);
}

generate();
