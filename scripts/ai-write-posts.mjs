#!/usr/bin/env node
/**
 * AI blog seeder
 * - Generates N long-form Markdown posts with YAML front-matter
 * - Topics riff on the herb dataset when available
 * - Idempotent per title/slug (won't overwrite)
 * ENV:
 *   OPENAI_API_KEY  required
 *   OPENAI_MODEL    optional (default: gpt-4o-mini)
 */

import fs from "fs";
import path from "path";
import crypto from "crypto";
import matter from "gray-matter";
import slugify from "slugify";

const ROOT = process.cwd();
const BLOG_DIR = path.join(ROOT, "content", "blog");
const DATA_HERBS = path.join(ROOT, "src", "data", "herbs", "herbs.normalized.json");

// -------- utilities
const ensureDir = (p) => fs.mkdirSync(p, { recursive: true });
const readJSON = (p, fallback = null) => {
  try {
    return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {
    return fallback;
  }
};
const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const todayISO = () => new Date().toISOString().slice(0, 10);

function toSlug(s) {
  const base = slugify(String(s || "").toLowerCase(), { strict: true });
  return base.replace(/^-+|-+$/g, "");
}
function existsSlug(slug) {
  const p = path.join(BLOG_DIR, `${slug}.md`);
  return fs.existsSync(p);
}

function pickTopics(count = 1) {
  const herbs = readJSON(DATA_HERBS, []);
  const herbTopics = herbs
    .map((h) => {
      const common = h.common || h.scientific || "";
      const family = h.family || h.category || "";
      const focus = h.effects && Array.isArray(h.effects) ? h.effects.slice(0, 3).join(", ") : "";
      return {
        title: `${common}: ${focus ? focus : "uses, safety, and science"}`,
        angle: `Deep dive on ${common}${family ? ` (${family})` : ""}: tradition vs. evidence, preparation, dosage, and contraindications.`,
      };
    })
    .filter((x) => x.title.trim().length > 6);

  // plus some evergreen ideas
  const evergreen = [
    { title: "Adaptogens 101 — Comparing Ashwagandha, Rhodiola, and Tulsi", angle: "Mechanisms, evidence quality, dosing, and who should avoid." },
    { title: "MAOIs in Ethnobotany — Safety First", angle: "Ayahuasca analogs, dietary cautions, and medication interactions." },
    { title: "Kava Chemotypes Explained", angle: "Why noble > tudei, extraction methods, and liver safety data." },
    { title: "Herbal Stacks for Sleep (Non-Addictive)", angle: "GABAergic herbs, synergy, and daytime grogginess avoidance." },
    { title: "A Beginner’s Guide to Tinctures", angle: "Solvents, ratios, percolation vs. maceration, and storage." },
  ];

  const pool = herbTopics.length ? herbTopics : evergreen;
  const picks = new Set();
  while (picks.size < Math.min(count, pool.length)) picks.add(rand(pool));
  return Array.from(picks);
}

// -------- OpenAI client (fetch-based, no SDK)
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";
const KEY = process.env.OPENAI_API_KEY;

async function ai(markdownPrompt) {
  if (!KEY) throw new Error("OPENAI_API_KEY missing.");
  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a careful herbal science writer. You write long, well-structured Markdown posts with citations and safety sections. You avoid medical claims; include disclaimers.",
        },
        { role: "user", content: markdownPrompt },
      ],
      temperature: 0.7,
    }),
  });
  if (!r.ok) {
    const t = await r.text();
    throw new Error(`OpenAI error: ${r.status} ${t}`);
  }
  const json = await r.json();
  return json.choices?.[0]?.message?.content?.trim() ?? "";
}

function buildPrompt(topic) {
  return `
Write a long, well-structured Markdown article (1200–1800 words) for "The Hippie Scientist".
Audience: curious readers with basic science literacy.
Tone: clear, neutral, safety-forward. No medical advice.

Topic:
Title: ${topic.title}
Angle: ${topic.angle}

Must include sections (H2):
- Overview
- Traditional Uses & Cultural Context
- Active Compounds & Mechanisms (plain-language, avoid overclaiming)
- Evidence Snapshot (bullets: human RCTs, observational, in vitro/animal; cite studies with links if possible)
- Preparation & Dosage (typical ranges, forms; emphasize variability)
- Safety & Contraindications (pregnancy, SSRIs/MAOIs, liver/kidney, drug interactions)
- Sources & Further Reading (bulleted links)

Begin with a short teaser paragraph.
End with a short disclaimer that this is educational, not medical advice.`;
}

function frontmatter({ title, description, tags }) {
  const fm = {
    title,
    description,
    date: todayISO(),
    tags: tags && tags.length ? tags : ["herbalism", "science", "safety"],
  };
  return matter.stringify("", fm).split("\n---\n")[0] + "\n---\n";
}

// -------- main
async function main() {
  ensureDir(BLOG_DIR);

  const arg = Object.fromEntries(
    process.argv.slice(2).map((a) => {
      const [k, v] = a.replace(/^--/, "").split("=");
      return [k, v ?? true];
    }),
  );
  const count = arg.one ? 1 : Number(arg.count || 1);

  const topics = pickTopics(count);

  let made = 0;
  for (const t of topics) {
    const baseSlug = toSlug(t.title) || crypto.randomBytes(4).toString("hex");
    let slug = baseSlug;
    let i = 2;
    while (existsSlug(slug)) slug = `${baseSlug}-${i++}`;
    const filepath = path.join(BLOG_DIR, `${slug}.md`);

    const desc = t.angle.replace(/\.$/, "") + ".";
    const prompt = buildPrompt(t);
    console.log(`→ Generating: ${t.title}`);

    try {
      const body = await ai(prompt);

      // combine with frontmatter
      const md = `${frontmatter({ title: t.title, description: desc, tags: ["herbs", "science"] })}\n${body}\n`;
      fs.writeFileSync(filepath, md, "utf-8");
      console.log("   saved", filepath);
      made++;
    } catch (e) {
      console.error("   failed:", e.message);
    }
  }

  if (made) {
    // refresh blog store so runtime can serve immediately in dev
    try {
      console.log("→ Rebuilding blog store...");
      const { spawnSync } = await import("node:child_process");
      const res = spawnSync(process.execPath, ["scripts/build-blog.mjs"], { stdio: "inherit" });
      if (res.status !== 0) console.warn("build-blog.mjs exited non-zero.");
    } catch (e) {
      console.warn("Could not run build-blog:", e.message);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
