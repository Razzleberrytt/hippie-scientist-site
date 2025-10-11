#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ROOT = process.cwd();
const POSTS_DIR = path.join(ROOT, "content", "posts");
const OUT_JSON = path.join(ROOT, "public", "blog.json");
const HERB_JSON = path.join(ROOT, "src", "data", "herbs", "herbs.normalized.json");

const MAX_PER_RUN = parseInt(process.env.AI_POSTS_PER_RUN || "1", 10);
const USE_AI = !!process.env.OPENAI_API_KEY;

function ensureDir(d){ fs.mkdirSync(d, { recursive: true }); }
function slugify(s){ return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }
function todayISO(){ return new Date().toISOString().slice(0,10); }
function hash(x){ return crypto.createHash("sha1").update(x).digest("hex").slice(0,8); }
function readJSON(file, fallback){ try { return JSON.parse(fs.readFileSync(file,"utf-8")); } catch { return fallback; } }
function pick(arr, n=1){ const c=[...arr]; const out=[]; while(c.length && out.length<n){ out.push(c.splice(Math.floor(Math.random()*c.length),1)[0]); } return out; }
function clean(text=""){ return String(text).replace(/\s+/g," ").trim(); }

// --- Approved domains for Sources ---
const APPROVED_DOMAINS = [
  // primary
  "pubmed.ncbi.nlm.nih.gov", "ncbi.nlm.nih.gov", "ods.od.nih.gov", "cochranelibrary.com",
  // big journals/publishers (expand as needed)
  "nejm.org", "jamanetwork.com", "thelancet.com", "nature.com", "sciencemag.org", "cell.com",
  "oxfordacademic.com", "cambridge.org", "springer.com", "wiley.com", "tandfonline.com", "bmj.com",
  "who.int", "ema.europa.eu", "fda.gov", "cdc.gov"
];

function extractLinks(md){
  // returns array of {text, url}, and the raw "Sources" block (if any)
  const linkRe = /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g;
  const links = [];
  let m;
  while ((m = linkRe.exec(md))) links.push({ text: m[1], url: m[2] });
  // crude Sources block capture
  const srcBlock = md.match(/(^|\n)##\s*Sources[\s\S]*?(\n##\s|\n> \*\*Disclaimer|\s*$)/i)?.[0] || "";
  return { links, srcBlock };
}

function isApproved(url){
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    return APPROVED_DOMAINS.some(d => host === d || host.endsWith(`.${d}`));
  } catch { return false; }
}

function filterSourcesBlock(block){
  if (!block) return { ok: 0, block: "" };
  // keep only approved links; preserve Markdown list items
  const lines = block.split("\n");
  const kept = [];
  for (const line of lines){
    const m = line.match(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/);
    if (m && isApproved(m[2])) kept.push(line);
    else if (!m) kept.push(line); // keep headings/plain text
  }
  // remove empty bullets
  const cleaned = kept
    .join("\n")
    .replace(/^\s*-\s*$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  const ok = (cleaned.match(/\((https?:\/\/)/g) || []).length;
  return { ok, block: cleaned };
}

function replaceSourcesInMarkdown(md, newBlock){
  if (!newBlock) return md;
  const stripped = newBlock
    .replace(/^\s*##\s*Sources\s*/i, "")
    .replace(/^\s*\n+/, "")
    .trim();
  const payload = stripped ? `${stripped}\n` : "";
  if (/(^|\n)##\s*Sources\b/i.test(md)){
    return md.replace(/(^|\n)##\s*Sources[\s\S]*?(\n##\s|\n> \*\*Disclaimer|\s*$)/i,
      `\n\n## Sources\n${payload}\n$2`);
  }
  // If there wasn't a Sources section, append one above the disclaimer
  return md.replace(/\n> \*\*Disclaimer:[\s\S]*$/i, match => `\n\n## Sources\n${payload}\n${match}`);
}

ensureDir(POSTS_DIR);
const herbs = readJSON(HERB_JSON, []);
const postsJSON = readJSON(OUT_JSON, []);
const existingSlugs = new Set(postsJSON.map(p=>p.slug));

// --- minimal md→html for list (unchanged) ---
function parseFrontmatter(md){
  const m = md.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) return { fm:{}, body: md };
  const fmRaw = m[1], body = m[2];
  const fm = {};
  for (const line of fmRaw.split("\n")){
    const kv = line.match(/^(\w+):\s*(.+)$/);
    if (!kv) continue;
    const k = kv[1], v = kv[2];
    if (k === "tags"){
      const arr = v.replace(/^\[|\]$/g,"").split(",").map(s=>s.trim().replace(/^"|"$/g,"")).filter(Boolean);
      fm[k] = arr;
    } else {
      fm[k] = v.replace(/^"|"$/g,"");
    }
  }
  return { fm, body };
}
function mdToHtml(md){
  let h = md
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^\s*-\s+(.*)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>)(?![\s\S]*?<li>)/gms, "<ul>$1</ul>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  h = h.split(/\n{2,}/).map(p=>{
    if (p.match(/^<h\d|^<ul|^<li|^<\/ul|^<\/li/)) return p;
    return `<p>${p}</p>`;
  }).join("\n");
  return h;
}
function rebuildJSON(){
  ensureDir(path.dirname(OUT_JSON));
  const files = fs.readdirSync(POSTS_DIR).filter(f=>f.endsWith(".md")).sort();
  const list = files.map(f=>{
    const md = fs.readFileSync(path.join(POSTS_DIR,f),"utf-8");
    const { fm, body } = parseFrontmatter(md);
    const slug = fm.slug || f.replace(/\.md$/,"");
    const date = fm.date || todayISO();
    const title = fm.title || slug;
    const tags = fm.tags || [];
    const excerpt = smartExcerpt(body);
    const html = mdToHtml(body);
    return { slug, date, title, tags, excerpt, html };
  });
  fs.writeFileSync(OUT_JSON, JSON.stringify(list, null, 2));
  return list.length;
}

// --- Fallback templater (kept from your previous version) ---
function fallbackArticle(){
  const sample = pick(herbs.filter(h=>h?.common || h?.scientific), 1)[0] || {};
  const name = sample.common || sample.scientific || "Unknown Herb";
  const topic = `How ${name} fits into modern herbal practice`;
  const slug = `${slugify(topic)}-${hash(name+todayISO())}`;
  const date = todayISO();
  const excerpt = `Exploring ${name} — overview, potential benefits, safety, and preparation.`;
  const tags = ["herbalism","guide","daily"];
  const sections = [
    `## Overview\n${clean(sample.description || sample.effects || `An introduction to ${name}.`)}`,
    sample.effects ? `## Potential Effects\n${clean(sample.effects)}` : "",
    (sample.contraindications||sample.legal) ? `## Safety & Contraindications\n${clean((sample.contraindications||"") + " " + (sample.legal||""))}` : "",
    (sample.forms||sample.preparation) ? `## Preparation & Forms\n${clean((Array.isArray(sample.forms)?sample.forms.join(", "):
    sample.forms)||sample.preparation||"")}` : "",
    `## Sources\nThis is an educational overview assembled from the site’s dataset.`,
    `\n> **Disclaimer:** Educational content only; not medical advice.`
  ].filter(Boolean).join("\n\n");

  return {
    slug, date, title: topic, excerpt, tags,
    markdown: `---\nslug: ${slug}\ndate: ${date}\ntitle: "${topic.replace(/"/g,'\\"')}"\ntags: [${tags.map(t=>`"${t}"`).join(", ")}]\n---\n\n${sections}\n`
  };
}

// --- OpenAI client & prompts ---
async function callOpenAI(messages, {maxTokens=1200, temperature=0.4}={}){
  const key = process.env.OPENAI_API_KEY;
  const url = "https://api.openai.com/v1/chat/completions";
  const body = {
    model: "gpt-4o-mini", // small + cheap; upgrade if you want
    messages,
    temperature,
    max_tokens: maxTokens,
  };
  for (let attempt=0; attempt<3; attempt++){
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${key}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`OpenAI ${res.status}`);
      const json = await res.json();
      const txt = json?.choices?.[0]?.message?.content?.trim();
      if (!txt) throw new Error("Empty completion");
      return txt;
    } catch (err){
      const backoff = 400 * (2 ** attempt);
      await new Promise(r=>setTimeout(r, backoff));
      if (attempt === 2) throw err;
    }
  }
}

function pickTopic(){
  const pool = [
    "Adaptogens for stress (evidence overview)",
    "Comparing phenethylamines vs tryptamines (gentle primer)",
    "Beginner’s guide to herb safety labels",
    "Sleep stack: sedatives & interactions",
    "Nootropic teas: bacopa, gotu kola, lion’s mane",
  ];
  const herbNames = herbs.map(h=>h.common||h.scientific).filter(Boolean);
  if (herbNames.length) pool.push(`Profile: ${pick(herbNames,1)[0]} — benefits, safety, preparation`);
  return pool[Math.floor(Math.random()*pool.length)];
}

function sys(){
  return `You are "The Analyst": precise, skeptical, measured. Write like a thoughtful human researcher.
Rules:
- No hype, no superlatives. Cite sources or say "evidence is limited".
- Never give medical advice. Include a final disclaimer.
- Tone: clear, concise, professional; no emojis or filler.`;
}

function outlinePrompt(topic){
  return `Topic: ${topic}
Produce a detailed outline for a long-form article (target 1,800–2,600 words) on psychedelic botany/herbalism.

Sections (H2/H3) only; no prose. Include:
- Abstract (2–4 sentences)
- Table of Contents (bulleted)
- Core sections (8–12 H2s) with 1–3 H3s each
- "Safety & Contraindications"
- "Interactions & Legal Notes" (if relevant)
- "Preparation & Dosage" (if relevant; emphasize not medical advice)
- "FAQs" (5–8 concise Q&A)
- "Sources" (placeholder)
Do not write the article yet; outline only.`;
}

function draftPrompt(topic, outline, contextBlob){
  return `Write a long-form Markdown article (target 1,800–2,600 words) on: ${topic}

STRICT REQUIREMENTS:
- Start with a short **Abstract** (2–4 sentences) summarizing key points.
- Include a **Table of Contents** (bulleted list linking to section headings with markdown anchors).
- Use clear H2/H3 hierarchy exactly as in the outline; expand each H3 with 2–4 paragraphs where relevant.
- Include at least two **Sidebars/Callouts** (blockquotes or > **Note:** style) for nuance, controversies, or cautions.
- Add a **FAQs** section with 5–8 Q&A, answers 2–4 sentences each.
- Include a **Sources** section with 4–8 credible links (PubMed, NIH/ODS, Cochrane, reputable textbooks/publishers). No blogs/marketing.
- Maintain neutral tone. Flag weak evidence explicitly. No medical advice.
- End with: "> **Disclaimer:** Educational content only; not medical advice."

Context (use cautiously; don’t overfit):
${contextBlob}

Outline:
${outline}`;
}

function polishPrompt(markdown){
  return `Polish and fact-scrub this Markdown for clarity, cohesion, and correctness.
- Keep word count within 1,800–2,600 words.
- Keep all headings, TOC, callouts, FAQs, Sources, and final disclaimer.
- Tighten language (no hype), fix hedging, ensure citations remain.

CONTENT TO POLISH:
${markdown}`;
}

function sourcesRepairPrompt(topic, md){
  return `The article below needs a "Sources" section restricted to credible domains only:
- Allowed domains: ${APPROVED_DOMAINS.join(", ")}
- Provide 4–8 sources max, in Markdown list format:
  - [Title](URL) — brief one-line note
- Replace any non-approved links.
- Keep the rest of the article unchanged; return ONLY the new Sources list, nothing else.

Topic: ${topic}

ARTICLE (context):
${md}`;
}

function wordCount(s){ return String(s||"").trim().split(/\s+/).filter(Boolean).length; }

async function extendIfShort(md, topic, contextBlob){
  if (wordCount(md) >= 1600) return md;
  const extender = await callOpenAI([
    { role: "system", content: sys() },
    { role: "user", content:
`The article below is under-length. Extend it to reach 1,800–2,600 words while keeping the structure (headings, TOC, FAQs, Sources, Disclaimer).
- Add depth: mechanisms, historical context, study summaries, limitations, contrasting viewpoints.
- Do not add fluff; add substance and nuance.
- Keep neutral tone and safety language.

Topic: ${topic}

Context (optional reference):
${contextBlob}

Article to extend:
${md}`
    }
  ], { maxTokens: 1800, temperature: 0.25 });
  return extender;
}

function smartExcerpt(md, max = 230){
  const body = md
    .replace(/^---[\s\S]*?---\n/, "")
    .replace(/^>.*$/gm, "")
    .replace(/^#{1,6}\s.*$/gm, "")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1");
  const text = body.replace(/\s+/g," ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const lastPeriod = cut.lastIndexOf(".");
  return (lastPeriod > 80 ? cut.slice(0, lastPeriod+1) : cut) + (lastPeriod>80 ? "" : "…");
}

function herbContext(topic){
  const key = (topic||"").toLowerCase();
  // Grab snippets of up to 3 related herbs to help the model anchor facts
  const picks = herbs.filter(h=>{
    const blob = [h.common,h.scientific,h.effects,h.description].join(" ").toLowerCase();
    return key.split(/\s+/).some(tok => blob.includes(tok));
  }).slice(0,3);
  return picks.map(h=>{
    return `Name: ${h.common||h.scientific}
Effects: ${clean(h.effects||"")}
Contraindications: ${clean(h.contraindications||"")}
Forms: ${Array.isArray(h.forms)?h.forms.join(", "):
    clean(h.forms||"")}
Notes: ${clean(h.description||"")}`;
  }).join("\n---\n");
}

async function aiArticle(){
  if (!USE_AI) return fallbackArticle();
  const topic = pickTopic();
  const date = todayISO();

  // 1) Outline
  const outline = await callOpenAI([
    { role: "system", content: sys() },
    { role: "user", content: outlinePrompt(topic) }
  ], { maxTokens: 900,  temperature: 0.2 });

  // 2) Draft
  const contextBlob = herbContext(topic);
  const draft = await callOpenAI([
    { role: "system", content: sys() },
    { role: "user", content: draftPrompt(topic, outline, contextBlob) }
  ], { maxTokens: 3500, temperature: 0.35 });

  // 3) Polish
  const finalMd = await callOpenAI([
    { role: "system", content: sys() },
    { role: "user", content: polishPrompt(draft) }
  ], { maxTokens: 2600, temperature: 0.2 });

  let longMd = await extendIfShort(finalMd, topic, contextBlob);

  // --- Source gating & auto-repair ---
  let gatedMd = longMd;
  {
    const { srcBlock } = extractLinks(gatedMd);
    let { ok, block } = filterSourcesBlock(srcBlock);

    if (ok < 3) {
      try {
        const repaired = await callOpenAI(
          [{ role: "system", content: sys() },
           { role: "user", content: sourcesRepairPrompt(topic, gatedMd) }],
          { maxTokens: 600, temperature: 0.2 }
        );
        const { ok: ok2, block: block2 } = filterSourcesBlock(`\n${repaired}\n`);
        if (ok2 >= Math.max(3, ok)) {
          gatedMd = replaceSourcesInMarkdown(gatedMd, block2);
        } else if (ok >= 1) {
          gatedMd = replaceSourcesInMarkdown(gatedMd, block);
        } else {
          const canned = [
            "- [NIH Office of Dietary Supplements](https://ods.od.nih.gov/) — ingredient fact sheets",
            "- [PubMed](https://pubmed.ncbi.nlm.nih.gov/) — primary literature",
            "- [Cochrane Library](https://www.cochranelibrary.com/) — systematic reviews"
          ].join("\n");
          gatedMd = replaceSourcesInMarkdown(gatedMd, canned);
        }
      } catch {
        if (ok >= 1) {
          gatedMd = replaceSourcesInMarkdown(gatedMd, block);
        } else {
          const canned = [
            "- [NIH Office of Dietary Supplements](https://ods.od.nih.gov/)",
            "- [PubMed](https://pubmed.ncbi.nlm.nih.gov/)",
            "- [Cochrane Library](https://www.cochranelibrary.com/)"
          ].join("\n");
          gatedMd = replaceSourcesInMarkdown(gatedMd, canned);
        }
      }
    } else {
      gatedMd = replaceSourcesInMarkdown(gatedMd, block);
    }
  }

  // Extract title (first H1) and excerpt
  const h1 = gatedMd.match(/^#\s+(.+?)\s*$/m)?.[1] || topic;
  const slug = `${slugify(h1)}-${hash(date+h1)}`;
  const excerpt = smartExcerpt(gatedMd);
  const tags = ["ai","daily","herbalism"];

  const fm = `---\nslug: ${slug}\ndate: ${date}\ntitle: "${h1.replace(/"/g,'\\"')}"\ntags: [${tags.map(t=>`"${t}"`).join(", ")}]
---\n\n`;
  const markdown = fm + gatedMd;

  return { slug, date, title: h1, excerpt, tags, markdown };
}

function writePostMD(post){
  const file = path.join(POSTS_DIR, `${post.slug}.md`);
  if (fs.existsSync(file)) return false;
  fs.writeFileSync(file, post.markdown);
  return true;
}

(async ()=>{
  let created = 0;
  for (let i=0; i<MAX_PER_RUN; i++){
    let post;
    try {
      post = await aiArticle();
    } catch (e){
      console.warn("AI failed, using fallback:", e.message);
      post = fallbackArticle();
    }
    if (existingSlugs.has(post.slug)) continue;
    if (writePostMD(post)) { created++; existingSlugs.add(post.slug); }
  }
  const total = rebuildJSON();
  console.log(`AI posts: created ${created}, total ${total}`);
})();
