import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";
import colors from "tailwindcss/colors.js";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
require("ts-node/register/transpile-only");

const {
  gradientTokens,
  gradientKeyForCategory,
  gradientKeyForTag,
  resolveClassKey,
} = await import(pathToFileURL(path.resolve("src/lib/classMap.ts")).href);

const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const OG_DIR = path.resolve("public/og");
const BLOG_DIR = path.join(OG_DIR, "blog");
const HERB_DIR = path.join(OG_DIR, "herb");
const DEFAULT_PATH = path.join(OG_DIR, "default.png");
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 7; // 7 days

fs.mkdirSync(BLOG_DIR, { recursive: true });
fs.mkdirSync(HERB_DIR, { recursive: true });

const fonts = [
  {
    file: "@fontsource/inter/files/inter-latin-400-normal.woff",
    weight: 400,
  },
  {
    file: "@fontsource/inter/files/inter-latin-700-normal.woff",
    weight: 700,
  },
].map(({ file, weight }) => ({
  name: "Inter",
  data: fs.readFileSync(require.resolve(file)),
  weight,
  style: "normal",
}));

function hexToRgb(hex) {
  const normalized = hex.replace("#", "");
  const value = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;
  const num = parseInt(value, 16);
  return {
    r: (num >> 16) & 0xff,
    g: (num >> 8) & 0xff,
    b: num & 0xff,
  };
}

function mixHex(a, b, ratio = 0.5) {
  const colorA = hexToRgb(a);
  const colorB = hexToRgb(b);
  const mix = (channelA, channelB) => Math.round(channelA + (channelB - channelA) * ratio);
  const r = mix(colorA.r, colorB.r).toString(16).padStart(2, "0");
  const g = mix(colorA.g, colorB.g).toString(16).padStart(2, "0");
  const bChannel = mix(colorA.b, colorB.b).toString(16).padStart(2, "0");
  return `#${r}${g}${bChannel}`;
}

function lightenHex(hex, amount = 0.12) {
  const color = hexToRgb(hex);
  const lighten = (channel) => Math.round(channel + (255 - channel) * amount)
    .toString(16)
    .padStart(2, "0");
  return `#${lighten(color.r)}${lighten(color.g)}${lighten(color.b)}`;
}

function gradientPalette(value, fallbackKey = "default") {
  const tokens = gradientTokens(value, fallbackKey);
  const stops = { from: null, via: [], to: null };
  for (const token of tokens) {
    const [, pos, colorName, shade] = token.match(/^(from|via|to)-([a-z]+)-(\d{2,3})$/i) || [];
    if (!pos) continue;
    const palette = colors[colorName];
    if (!palette) continue;
    const shadeValue = palette[shade];
    const colorValue = typeof shadeValue === "string"
      ? shadeValue
      : shadeValue?.DEFAULT;
    if (!colorValue) continue;
    if (pos === "from") stops.from = colorValue;
    if (pos === "to") stops.to = colorValue;
    if (pos === "via") stops.via.push(colorValue);
  }
  const start = stops.from ?? "#22d3ee";
  const end = stops.to ?? "#6366f1";
  const mid = stops.via[0] ?? mixHex(start, end, 0.45);
  return {
    start,
    mid,
    end,
    gradient: `linear-gradient(135deg, ${start} 0%, ${mid} 55%, ${end} 100%)`,
  };
}

function truncate(text, maxLength) {
  const value = String(text ?? "").trim();
  if (!value) return "";
  if (value.length <= maxLength) return value;
  return `${value.slice(0, maxLength - 1).replace(/\s+\S*$/, "").trim()}…`;
}

function createFrame({ title, subtitle, palette }) {
  const safeTitle = truncate(title || "The Hippie Scientist", 120);
  const safeSubtitle = truncate(subtitle || "Psychoactive botany • Safety • DIY blends", 220);
  const accentGlow = lightenHex(palette.end, 0.25);

  return {
    type: "div",
    props: {
      style: {
        width: OG_WIDTH,
        height: OG_HEIGHT,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "64px",
        color: "#f8fafc",
        background: palette.gradient,
        position: "relative",
        fontFamily: "Inter, system-ui, -apple-system, 'Segoe UI', sans-serif",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              inset: 0,
              background: `radial-gradient(circle at 80% 10%, ${lightenHex(palette.mid, 0.35)} 0%, transparent 60%)`,
              opacity: 0.65,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "absolute",
              width: 260,
              height: 260,
              top: 80,
              right: 96,
              borderRadius: "50%",
              background: `radial-gradient(circle at 35% 35%, ${lightenHex(palette.mid, 0.3)} 0%, ${accentGlow} 45%, rgba(15, 23, 42, 0) 70%)`,
              boxShadow: `0 45px 120px rgba(15, 23, 42, 0.4)` ,
            },
          },
        },
        {
          type: "div",
          props: {
            style: {
              display: "flex",
              flexDirection: "column",
              gap: 36,
              position: "relative",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    width: 110,
                    height: 110,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 30% 30%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.05) 70%)`,
                    border: "3px solid rgba(255,255,255,0.35)",
                    boxShadow: `0 28px 90px rgba(15,23,42,0.35)` ,
                  },
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 64,
                    fontWeight: 700,
                    lineHeight: 1.05,
                    maxWidth: 880,
                    textShadow: "0 12px 40px rgba(15,23,42,0.35)",
                  },
                  children: safeTitle,
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 28,
                    lineHeight: 1.4,
                    maxWidth: 900,
                    opacity: 0.88,
                  },
                  children: safeSubtitle,
                },
              },
            ],
          },
        },
        {
          type: "div",
          props: {
            style: {
              position: "relative",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 24,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
            },
            children: [
              {
                type: "div",
                props: {
                  style: {
                    fontWeight: 600,
                  },
                  children: "thehippiescientist.net",
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    fontSize: 20,
                    padding: "12px 22px",
                    borderRadius: 999,
                    background: "rgba(15,23,42,0.45)",
                    border: "1px solid rgba(255,255,255,0.35)",
                    color: "rgba(241,245,249,0.92)",
                  },
                  children: "Psychoactive botany • Safety • DIY blends",
                },
              },
            ],
          },
        },
      ],
    },
  };
}

function shouldGenerate(filePath) {
  if (!fs.existsSync(filePath)) return true;
  const stats = fs.statSync(filePath);
  return Date.now() - stats.mtimeMs > MAX_AGE_MS;
}

async function renderOg({ title, subtitle, outPath, gradientKey }) {
  const palette = gradientPalette(gradientKey, gradientKey ?? "default");
  const view = createFrame({ title, subtitle, palette });
  const svg = await satori(view, {
    width: OG_WIDTH,
    height: OG_HEIGHT,
    fonts,
  });
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: OG_WIDTH },
  })
    .render()
    .asPng();
  fs.writeFileSync(outPath, png);
}

export async function generateOgForBlog(posts = [], options = {}) {
  const limit = Number.isFinite(options.limit) ? Number(options.limit) : null;
  let generated = 0;
  for (const post of posts) {
    if (limit != null && generated >= limit) break;
    if (!post?.slug) continue;
    const slug = String(post.slug);
    const outPath = path.join(BLOG_DIR, `${slug}.png`);
    if (!shouldGenerate(outPath)) continue;
    const gradientKey = post.tags?.length
      ? gradientKeyForTag(post.tags[0])
      : resolveClassKey("blog");
    const subtitle =
      post.summary || post.excerpt || post.description || "Article overview";
    await renderOg({
      title: post.title || "Field Notes",
      subtitle,
      outPath,
      gradientKey,
    });
    generated += 1;
  }
  return generated;
}

export async function generateOgForHerbs(herbs = [], options = {}) {
  const limit = Number.isFinite(options.limit) ? Number(options.limit) : null;
  let generated = 0;
  for (const herb of herbs) {
    if (limit != null && generated >= limit) break;
    if (!herb?.slug) continue;
    const slug = String(herb.slug);
    const outPath = path.join(HERB_DIR, `${slug}.png`);
    if (!shouldGenerate(outPath)) continue;
    const gradientKey = gradientKeyForCategory(
      herb.category || herb.category_label || herb.compoundClasses?.[0],
    );
    const subtitle = herb.description || herb.effects || herb.intensity || "Herb profile";
    await renderOg({
      title: herb.common || herb.scientific || slug,
      subtitle,
      outPath,
      gradientKey,
    });
    generated += 1;
  }
  return generated;
}

export async function generateDefaultOg() {
  if (!shouldGenerate(DEFAULT_PATH)) return false;
  await renderOg({
    title: "Herb knowledge without the fluff",
    subtitle: "Psychoactive botany • Safety • DIY blends",
    outPath: DEFAULT_PATH,
    gradientKey: resolveClassKey("blog"),
  });
  return true;
}

export async function generateAllOgImages({ posts = [], herbs = [] } = {}, options = {}) {
  const skipEnv = process.env.OG_SKIP === "1" || process.env.OG_SKIP === "true";
  const limitEnv = process.env.OG_LIMIT ? Number(process.env.OG_LIMIT) : null;
  const skip = options.skip ?? skipEnv;
  const limit = Number.isFinite(options.limit) ? Number(options.limit) : limitEnv;
  if (skip) {
    return { default: false, blog: 0, herb: 0 };
  }
  const results = {
    default: false,
    blog: 0,
    herb: 0,
  };
  results.default = await generateDefaultOg();
  if (posts.length) {
    results.blog = await generateOgForBlog(posts, { limit });
  }
  if (herbs.length) {
    results.herb = await generateOgForHerbs(herbs, { limit });
  }
  return results;
}

async function loadJsonMaybe(filePath) {
  if (!fs.existsSync(filePath)) return [];
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch (error) {
    console.warn(`Failed to read ${filePath}:`, error);
    return [];
  }
}

async function main() {
  const herbs = await loadJsonMaybe("src/data/herbs/herbs.normalized.json");
  const posts = await loadJsonMaybe("src/data/blog/posts.json");
  const results = await generateAllOgImages({ posts, herbs });
  console.log(
    `OG images updated → default:${results.default ? "yes" : "skip"} | blog:${results.blog} | herb:${results.herb}`,
  );
}

if (import.meta.url === pathToFileURL(process.argv[1] || "").href) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
