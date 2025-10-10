import fs from "fs";
import path from "path";

const HERBS_PATH = "src/data/herbs/herbs.normalized.json";
const POSTS_PATH = "src/data/blog/posts.json";
const OUT_PATH   = "src/data/graph/relevance.json";

const herbs = fs.existsSync(HERBS_PATH) ? JSON.parse(fs.readFileSync(HERBS_PATH,"utf-8")) : [];
const posts = fs.existsSync(POSTS_PATH) ? JSON.parse(fs.readFileSync(POSTS_PATH,"utf-8")) : [];

function sl(s){return String(s||"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/(^-|-$)/g,"");}
function tokens(...parts){
  const text = parts.filter(Boolean).join(" ").toLowerCase();
  return new Set(text.replace(/<[^>]+>/g," ").replace(/[^a-z0-9\s]/g," ").split(/\s+/).filter(w=>w && w.length>=4));
}

const herbNodes = herbs.map(h=>{
  const slug = h.slug || sl(h.common || h.scientific || "");
  const t = new Set([
    ...(h.tags||[]).map(x=>x.toLowerCase()),
    ...(h.compounds||[]).map(x=>x.toLowerCase()),
    ...(h.synonyms||[]).map(x=>x.toLowerCase()),
    ...(tokens(h.effects, h.common, h.scientific))
  ]);
  return { id:`herb:${slug}`, slug, name:h.common||h.scientific||"Herb", t };
});

const postNodes = posts.map(p=>{
  const slug = p.slug || sl(p.title);
  const t = new Set([
    ...(p.keywords||[]).map(x=>x.toLowerCase()),
    ...tokens(p.title, p.description, p.excerpt, p.body, p.bodyHtml)
  ]);
  return { id:`post:${slug}`, slug, title:p.title, t };
});

function scoreOverlap(aSet, bSet){
  let c = 0; for (const k of aSet) if (bSet.has(k)) c++;
  return c;
}

const edgesHP = []; // herb -> post
const edgesPH = []; // post -> herb

for (const h of herbNodes){
  for (const p of postNodes){
    let s = scoreOverlap(h.t, p.t);
    // small boosts for explicit mentions
    const name = h.name.toLowerCase();
    if (p.t.has(name)) s += 2;
    if (s > 0){
      edgesHP.push({ from:h.id, to:p.id, w:s });
      edgesPH.push({ from:p.id, to:h.id, w:s });
    }
  }
}

// Keep top-k per node to avoid bloat
function topK(edges, k=6){
  const byFrom = new Map();
  for (const e of edges){
    const arr = byFrom.get(e.from) || [];
    arr.push(e);
    byFrom.set(e.from, arr);
  }
  const pruned = [];
  for (const [from, arr] of byFrom.entries()){
    arr.sort((a,b)=>b.w - a.w);
    pruned.push(...arr.slice(0,k));
  }
  return pruned;
}

const graph = {
  meta: { generatedAt: new Date().toISOString(), herbs: herbNodes.length, posts: postNodes.length },
  herbs: herbNodes.map(({id,slug,name})=>({id,slug,name})),
  posts: postNodes.map(({id,slug,title})=>({id,slug,title})),
  edgesHP: topK(edgesHP, 6),
  edgesPH: topK(edgesPH, 6)
};

fs.mkdirSync(path.dirname(OUT_PATH), { recursive: true });
fs.writeFileSync(OUT_PATH, JSON.stringify(graph,null,2));
console.log(`Graph built → ${OUT_PATH} (H:${herbNodes.length} P:${postNodes.length} E:${graph.edgesHP.length+graph.edgesPH.length})`);
