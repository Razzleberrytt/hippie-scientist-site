// Generates one MDX blog post and saves to src/content/blog/YYYY-MM-DD-slug.mdx
import fs from "fs";
import path from "path";
import { haveAiSecrets, promptLLM } from "./ai-client.mjs";

if (process.env.SKIP_AI_GENERATE === "true") {
  console.log("⏭  Skipping AI post generation (SKIP_AI_GENERATE=true).");
  process.exit(0);
}

if (!haveAiSecrets()) {
  console.log("⏭  Skipping AI post generation (no LLM secrets present).");
  process.exit(0);
}

const HERBS_PATH = "src/data/herbs/herbs.normalized.json";
const OUT_DIR = "src/content/blog";

fs.mkdirSync(OUT_DIR, { recursive: true });

function slugify(s){ return String(s).toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function today(){ return new Date().toISOString().slice(0,10); }

function pickTopic(){
  // Prefer queued topics if present; else rotate herbs dataset.
  const queueFile = "src/content/queue/topics.json";
  if (fs.existsSync(queueFile)) {
    const q = JSON.parse(fs.readFileSync(queueFile,"utf-8"));
    if (Array.isArray(q) && q.length) return { kind:"custom", topic:q.shift(), postQueue:q };
  }
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, "utf-8"));
  const pool = herbs.filter(h => (h.common || h.scientific));
  const idx = Math.floor(Math.random()*pool.length);
  const h = pool[idx];
  const name = h.common || h.scientific;
  return { kind:"herb", topic: name, herb: h };
}

const picked = pickTopic();
if (picked.postQueue) {
  fs.writeFileSync("src/content/queue/topics.json", JSON.stringify(picked.postQueue, null, 2));
}

const topic = picked.topic;
const date  = today();
const baseSlug = slugify(topic);
const slug  = `${date}-${baseSlug}`;
const outPath = path.join(OUT_DIR, `${slug}.mdx`);

// Guard: don’t overwrite if we already created a post for this topic today
if (fs.existsSync(outPath)) {
  console.log("Post already exists:", outPath);
  process.exit(0);
}

// Build a strict instruction to keep content safe, useful, and on-brand.
const system = `
You are writing for The Hippie Scientist: educational, evidence-aware herbal content.
Never give personalized medical advice or prescriptive dosing. Include safety notes,
contraindications, and evidence level. Write clearly, cite sources inline as links.
Return valid MDX with YAML frontmatter and no trailing prose outside the MDX.
`;

const herbJsonBlock = picked.herb ? `\nHERB_JSON:\n${JSON.stringify(picked.herb).slice(0,8000)}\n` : "";

const user = `
Write a blog post about: "${topic}".

Audience: curious readers with basic science literacy.
Tone: concise, practical, non-alarmist. Avoid hype.

Structure (MDX):
---
title: "${topic}: what it is, how it’s used, safety"
slug: "${slug}"
date: "${date}"
description: "An evidence-aware overview of ${topic} — uses, mechanisms, safety, and legality."
image: "/og/${slug}.png"
category: "Herbal Guide"
keywords:
  - ${baseSlug}
  - herbs
  - safety
---

import Callout from '../../components/Callout.mdx' /* if not present, plain blockquote is fine */

# ${topic}

**TL;DR** — 2–3 sentences summarizing uses, effects, and key safety note.

## What it is
Short overview; include common/scientific names and tradition (1–2 short paragraphs).

## Potential effects & mechanisms
Bulleted effects; a brief mechanism explanation (neurotransmitters, compounds).

## Preparation & forms
List common forms (tea, tincture, standardized extract) WITHOUT dosage numbers.

## Safety & contraindications
- Who should avoid it (e.g., pregnancy, liver/kidney disease)
- Interactions (SSRIs/MAOIs/anticoagulants)
- Legal notes if relevant

> Not medical advice. Educational only.

## Evidence snapshot
One short paragraph. If evidence is weak, say so. If RCTs exist, mention them.

## References
- Link 3–6 reputable sources (PubMed, NIH, textbooks, monographs); use markdown links.

${herbJsonBlock}

Constraints:
- No dosage recommendations.
- No disease claims; use careful wording ("may", "traditional use").
- Keep length ~900–1200 words.
- Valid MDX only. Do not wrap in code fences.
`;

// Ask the model.
const content = await promptLLM({ system, prompt: user });

// Validate a bit.
if (!/^---\s*[\s\S]+?---/.test(content)) {
  throw new Error("Generator did not return frontmatter. Aborting.");
}

fs.writeFileSync(outPath, content);
console.log("Wrote MDX:", outPath);

// Optionally, append a line to a changelog for the PR description.
fs.appendFileSync(".ai-blog-log", `- ${date} ${topic} → ${outPath}\n`);
