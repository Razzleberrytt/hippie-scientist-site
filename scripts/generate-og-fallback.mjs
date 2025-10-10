import fs from "fs";
import path from "path";
import satori from "satori";
import { Resvg } from "@resvg/resvg-js";

const POSTS = "src/data/blog/posts.json";
const HERBS = "src/data/herbs/herbs.normalized.json";
const OUT = "public/og";
fs.mkdirSync(OUT, { recursive: true });
const posts = fs.existsSync(POSTS) ? JSON.parse(fs.readFileSync(POSTS, "utf-8")) : [];
const herbs = fs.existsSync(HERBS) ? JSON.parse(fs.readFileSync(HERBS, "utf-8")) : [];
const only = new Set(process.argv.slice(2).filter((a) => !a.startsWith("--")));
const prune = process.argv.includes("--prune");
const W = 1200;
const H = 630;

const desired = new Set();
const items = [];

function slug(s) {
  return String(s || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

for (const p of posts) {
  const sl = p.slug || slug(p.title);
  if (!sl) continue;
  desired.add(sl);
  items.push({
    slug: sl,
    title: p.title,
    kicker: p.description || "Herbal guide & safety",
  });
}
for (const h of herbs) {
  const sl = h.slug || slug(h.common || h.scientific);
  if (!sl) continue;
  desired.add(sl);
  items.push({
    slug: sl,
    title: h.common || h.scientific || "Herb",
    kicker: h.scientific && h.common ? h.scientific : "Psychoactive herb",
  });
}

if (prune) {
  for (const f of fs.readdirSync(OUT).filter((f) => f.endsWith(".png"))) {
    const sl = f.replace(/\.png$/, "");
    if (!desired.has(sl)) fs.unlinkSync(path.join(OUT, f));
  }
}

const font = { name: "Inter", data: undefined, weight: 700 };
try {
  font.data = fs.readFileSync("public/fonts/Inter-Bold.ttf");
} catch {
  /* optional */
}

function card({ title, kicker }) {
  return {
    type: "div",
    props: {
      style: {
        width: W,
        height: H,
        display: "flex",
        padding: "64px",
        background: "linear-gradient(180deg,#06080b 0%,#0b0f14 60%)",
        color: "#eaf0f6",
        fontFamily: "Inter,system-ui,sans-serif",
      },
      children: [
        {
          type: "div",
          props: {
            style: {
              borderRadius: 24,
              border: "1px solid #ffffff22",
              background: "#0e141caa",
              padding: 48,
              width: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            },
            children: [
              {
                type: "div",
                props: {
                  children: [
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 28, color: "#9db2c7" },
                        children: "The Hippie Scientist",
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 72,
                          fontWeight: 800,
                          lineHeight: 1.05,
                          margin: "12px 0",
                          color: "#eaf0f6",
                        },
                        children: title,
                      },
                    },
                    {
                      type: "div",
                      props: {
                        style: { fontSize: 28, color: "#9db2c7" },
                        children: kicker,
                      },
                    },
                  ],
                },
              },
              {
                type: "div",
                props: {
                  style: {
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: 28,
                    color: "#cfe7ff",
                  },
                  children: [
                    { type: "div", props: { children: "thehippiescientist.net" } },
                    {
                      type: "div",
                      props: {
                        style: {
                          fontSize: 20,
                          padding: "8px 14px",
                          borderRadius: 999,
                          border: "1px solid #ffffff33",
                        },
                        children: "Psychedelic botany • Safety first",
                      },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
    },
  };
}

for (const it of items) {
  if (only.size && !only.has(it.slug)) continue;
  const out = path.join(OUT, `${it.slug}.png`);
  if (fs.existsSync(out)) continue;
  const svg = await satori(card(it), {
    width: W,
    height: H,
    fonts: font.data ? [font] : [],
  });
  const png = new Resvg(svg, { fitTo: { mode: "width", value: W } }).render().asPng();
  fs.writeFileSync(out, png);
  console.log("OG (fallback) =>", out);
}
