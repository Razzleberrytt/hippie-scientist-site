// scripts/generate-stats.mjs
import fs from "fs";
import path from "path";

function readJSON(p, fallback = null) {
  try {
    return JSON.parse(fs.readFileSync(p, "utf8"));
  } catch {
    return fallback;
  }
}

const root = process.cwd();

// Try these common locations; pick what exists.
const herbsPathCandidates = [
  "src/data/herbs/herbs.normalized.json",
  "src/_data/herbs.normalized.json",
  "public/data/herbs.normalized.json",
];
const blogStoreCandidates = [
  "public/blogdata.json",
  "public/data/blogdata.json",
  "public/blog/posts.json",
];
const compoundsPathCandidates = [
  "src/data/compounds.json",
  "public/data/compounds.json",
];

const herbsPath = herbsPathCandidates.find(p => fs.existsSync(p));
const blogPath = blogStoreCandidates.find(p => fs.existsSync(p));
const cmpPath = compoundsPathCandidates.find(p => fs.existsSync(p));

const herbs = herbsPath ? readJSON(herbsPath, []) : [];
const blog = blogPath ? readJSON(blogPath, { posts: [] }) : { posts: [] };
const cmps = cmpPath ? readJSON(cmpPath, []) : [];

const herbCount = Array.isArray(herbs)
  ? herbs.length
  : Array.isArray(herbs.items)
    ? herbs.items.length
    : 0;
const postCount = Array.isArray(blog?.posts)
  ? blog.posts.length
  : Array.isArray(blog)
    ? blog.length
    : 0;
const cmpCount = Array.isArray(cmps)
  ? cmps.length
  : Array.isArray(cmps.items)
    ? cmps.items.length
    : 0;

// Fallbacks if no explicit compounds file; try to infer from herbs data.
let compounds = cmpCount;
if (!compounds && Array.isArray(herbs)) {
  const set = new Set();
  herbs.forEach(h => {
    const fields = [h.compounds, h.active_compounds, h.constituents].flat();
    (fields || []).forEach(x => {
      String(x || "")
        .split(/[;,]/)
        .forEach(s => {
          const t = s.trim();
          if (t) set.add(t.toLowerCase());
        });
    });
  });
  compounds = set.size;
}

const stats = {
  herbs: herbCount,
  compounds: compounds,
  articles: postCount,
  generatedAt: new Date().toISOString(),
};

const outDir = path.resolve("public");
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "stats.json"), JSON.stringify(stats, null, 2));
console.log("Wrote public/stats.json:", stats);
