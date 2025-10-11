import fs from "fs";
import path from "path";

// Where source markdown lives:
const SRC = "content/blog";         // .md files
// Where generated assets go (MUST be under public so deploy picks them up):
const OUT_DIR = "public/blogdata";  // JSON + HTML
fs.mkdirSync(OUT_DIR, { recursive: true });

/** Very tiny MD -> HTML (headings/paragraphs/links) to avoid extra deps */
function mdToHtml(md) {
  return md
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^>\s?(.*)$/gm, "<blockquote>$1</blockquote>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .split(/\n{2,}/)
    .map(p => {
      const trimmed = p.trim();
      if (!trimmed) return "";
      if (/^<h[1-6]>/.test(trimmed) || /^<blockquote>/.test(trimmed)) return trimmed;
      return `<p>${trimmed}</p>`;
    })
    .filter(Boolean)
    .join("\n");
}

function slugify(s){ return String(s||"")
  .toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,""); }

function readPosts() {
  if (!fs.existsSync(SRC)) fs.mkdirSync(SRC, { recursive: true });

  // Seed 10 posts if directory is empty
  const files = fs.readdirSync(SRC).filter(f => f.endsWith(".md"));
  if (files.length < 10) {
    const seeds = [
      ["kava-chemotypes-safety", "Kava Chemotypes & Safety — Noble vs. Tudei", "2025-01-20",
       `# Kava Chemotypes & Safety
Kava (Piper methysticum) contains varying **kavalactone** profiles...
## Noble vs. Tudei
Evidence suggests...
## Preparation & Dose
Traditional methods...`],
      ["blue-lotus-aporphines", "Blue Lotus & Aporphines — Myth vs. Data", "2025-01-18",
       `# Blue Lotus & Aporphines
Nymphaea caerulea contains aporphine-class alkaloids...
## Effects & Safety
Calm, dreamy...`],
      ["rhodiola-adaptogen", "Rhodiola: Adaptogen for Stress & Fatigue", "2025-01-17",
       `# Rhodiola Overview
Rhodiola rosea is an **adaptogen**...
## Evidence
Randomized trials indicate...`],
      ["lion-s-mane-nerve-growth", "Lion’s Mane & NGF — What the Studies Say", "2025-01-15",
       `# Lion's Mane
Hericium erinaceus and erinacines...
## Cognition
Human data...`],
      ["cacao-theobromine", "Cacao, Theobromine, and Mood", "2025-01-14",
       `# Cacao & Theobromine
Theobromine is a mild stimulant...
## Dose & Interactions
Caffeine overlap...`],
      ["ashwagandha-cortisol", "Ashwagandha & Cortisol — Anxiety Evidence", "2025-01-13",
       `# Ashwagandha
Withania somnifera as an **anxiolytic**...
## Trials
Meta-analyses show...`],
      ["valerian-sleep", "Valerian for Sleep — Mixed but Useful?", "2025-01-12",
       `# Valerian
Valeriana officinalis and **valerenic acid**...
## Evidence
Mixed results...`],
      ["kratom-alkaloids", "Kratom Alkaloids — Pharmacology & Risks", "2025-01-10",
       `# Kratom
Mitragyna speciosa alkaloids...
## Safety
Dependence risks...`],
      ["mugwort-dreaming", "Mugwort for Dreams — Tradition & Reality", "2025-01-09",
       `# Mugwort
Artemisia vulgaris in dream lore...
## Evidence
Anecdotal...`],
      ["passionflower-gaba", "Passionflower & GABA — Gentle Anxiolytic", "2025-01-08",
       `# Passionflower
Passiflora incarnata may modulate **GABA**...
## Dose
Tea and tincture...`],
    ];
    for (const [slug, title, date, body] of seeds) {
      const f = path.join(SRC, `${slug}.md`);
      if (!fs.existsSync(f)) {
        fs.writeFileSync(f, `---\ntitle: ${title}\ndate: ${date}\ntags: [herbs]\n---\n\n${body}\n`);
      }
    }
  }

  // Parse files with front-matter (simple)
  const posts = fs.readdirSync(SRC).filter(f => f.endsWith(".md")).map(f => {
    const raw = fs.readFileSync(path.join(SRC,f), "utf-8");
    const fm = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/m.exec(raw);
    let meta = {}, body = raw;
    if (fm) {
      const yaml = fm[1]; body = fm[2];
      yaml.split("\n").forEach(line=>{
        const m = /^(\w+):\s*(.*)$/.exec(line.trim());
        if (m) { const k=m[1]; let v=m[2];
          if (v.startsWith("[") && v.endsWith("]")) try{ v = JSON.parse(v.replace(/'/g,'"')); }catch {}
          else if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1,-1);
          meta[k]=v;
        }
      });
    }
    const title = meta.title || f.replace(/\.md$/,"");
    const slug = slugify(meta.slug || title);
    const date = meta.date || "2025-01-01";
    const tags = Array.isArray(meta.tags) ? meta.tags : ["herbs"];
    return { slug, title, date, tags, markdown: body.trim() };
  });

  // Sort newest first
  posts.sort((a,b)=> (a.date<b.date?1:-1));

  // Write per-post HTML + summary
  const list = [];
  for (const p of posts) {
    const html = mdToHtml(p.markdown);
    const summary = p.markdown.split("\n").slice(0,3).join(" ").slice(0,200) + "…";
    fs.writeFileSync(path.join(OUT_DIR, `${p.slug}.html`), html, "utf-8");
    list.push({ slug:p.slug, title:p.title, date:p.date, tags:p.tags, summary });
  }

  // Write index JSON
  fs.writeFileSync(path.join(OUT_DIR,"index.json"), JSON.stringify({ posts:list },null,2));
  console.log(`Wrote ${list.length} posts to ${OUT_DIR}`);
}

readPosts();
