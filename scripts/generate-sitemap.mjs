const fs = await import("fs/promises");
const path = await import("path");

const SITE = "https://thehippiescientist.net";
const outDir = process.argv[2] || "public";
const DEFAULT_LASTMOD = "2024-01-01T00:00:00.000Z";

const baseDirs = [outDir, "public"].map((dir) => path.resolve(dir));
const projectRoot = process.cwd();
const lookupRoots = [...new Set([projectRoot, ...baseDirs])];

const ensureIsoString = (value) => {
  if (!value) {
    return null;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
};

const getLatestMtime = async (relativePaths = []) => {
  const timestamps = [];

  for (const relative of relativePaths) {
    if (!relative) continue;

    for (const rootDir of lookupRoots) {
      try {
        const stats = await fs.stat(path.resolve(rootDir, relative));
        timestamps.push(stats.mtime.getTime());
      } catch (error) {
        if (error.code !== "ENOENT") {
          throw error;
        }
      }
    }
  }

  if (!timestamps.length) {
    return null;
  }

  return new Date(Math.max(...timestamps)).toISOString();
};

const routeSources = new Map([
  ["/", ["src/pages/Home.tsx", "index.html"]],
  ["/about", ["src/pages/About.tsx"]],
  ["/blend", ["src/pages/BuildBlend.tsx"]],
  ["/blog", ["src/pages/BlogList.tsx"]],
  ["/build", ["src/pages/BuildBlend.tsx"]],
  ["/community", ["src/pages/Community.tsx"]],
  ["/compare", ["src/pages/Compare.tsx"]],
  ["/compounds", ["src/pages/Compounds.tsx"]],
  ["/contact", ["src/pages/Contact.tsx"]],
  ["/data-fix", ["src/pages/DataFix.tsx"]],
  ["/data-report", ["src/pages/DataReport.tsx"]],
  ["/disclaimer", ["disclaimer/index.html"]],
  ["/downloads", ["src/pages/Downloads.tsx"]],
  ["/favorites", ["src/pages/Favorites.tsx"]],
  ["/graph", ["src/pages/Graph.tsx"]],
  ["/herb-index", ["src/pages/HerbIndex.tsx"]],
  ["/herbs", ["src/pages/Herbs.tsx"]],
  ["/learn", ["src/pages/Learn.tsx"]],
  ["/newsletter", ["src/pages/Newsletter.tsx"]],
  ["/privacy-policy", ["privacy-policy/index.html"]],
  ["/research", ["src/pages/Research.tsx"]],
  ["/safety", ["src/pages/Safety.tsx"]],
  ["/sitemap", ["src/pages/Sitemap.tsx"]],
  ["/store", ["src/pages/Store.tsx"]],
  ["/theme", ["src/pages/Theme.tsx"]],
  ["/browse/herbs", ["src/pages/HerbIndex.tsx"]],
  ["/browse/compounds", ["src/pages/CompoundIndex.tsx"]],
]);

const addStaticRoutes = async (entries) => {
  for (const [route, sources] of routeSources.entries()) {
    const lastmod = (await getLatestMtime(sources)) ?? DEFAULT_LASTMOD;
    entries.set(route, {
      lastmod,
      changefreq: "monthly",
    });
  }
};

const readJSON = async (relativePath) => {
  for (const dir of lookupRoots) {
    try {
      const file = await fs.readFile(path.resolve(dir, relativePath), "utf8");
      return JSON.parse(file);
    } catch (error) {
      if (error.code !== "ENOENT") {
        throw error;
      }
    }
  }
  return null;
};

const entries = new Map();
await addStaticRoutes(entries);

const addEntry = (pathname, options = {}) => {
  const existing = entries.get(pathname);
  const changefreq =
    options.changefreq ?? existing?.changefreq ?? (pathname.startsWith("/blog/") ? "weekly" : "monthly");
  const lastmod = ensureIsoString(options.lastmod) ?? existing?.lastmod ?? DEFAULT_LASTMOD;
  entries.set(pathname, { changefreq, lastmod });
};

const blogIndex =
  (await readJSON(path.join("blogdata", "index.json"))) ?? (await readJSON(path.join("blog", "posts.json")));
if (Array.isArray(blogIndex)) {
  blogIndex.forEach((post) => {
    if (post?.slug) {
      addEntry(`/blog/${post.slug}`, {
        changefreq: "weekly",
        lastmod: post.updatedAt || post.date,
      });
    }
  });
}

const herbs = await readJSON(path.join("data", "herbs.json"));
if (Array.isArray(herbs)) {
  herbs.forEach((herb) => {
    if (herb?.id) {
      addEntry(`/herbs/${herb.id}`, {
        lastmod: herb.updatedAt || herb.modifiedAt || herb.lastUpdated,
      });
    }
  });
}

const compounds = await readJSON(path.join("data", "compounds.json"));
if (Array.isArray(compounds)) {
  compounds.forEach((compound) => {
    const slug = compound?.slug || compound?.id;
    if (slug) {
      addEntry(`/compounds/${slug}`, {
        lastmod: compound.updatedAt || compound.modifiedAt || compound.lastUpdated,
      });
    }
  });
}

const urls = [...entries.entries()].sort(([a], [b]) => a.localeCompare(b));
const urlset = urls
  .map(
    ([pathname, meta]) => `  <url>\n    <loc>${SITE}${pathname}</loc>\n    <lastmod>${meta.lastmod}</lastmod>\n    <changefreq>${meta.changefreq}</changefreq>\n  </url>`,
  )
  .join("\n");

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>\n`;

const outputs = new Set([
  path.resolve(outDir, "sitemap.xml"),
  path.resolve("public", "sitemap.xml"),
  path.resolve("sitemap.xml"),
]);

await Promise.all(
  [...outputs].map(async (target) => {
    const directory = path.dirname(target);
    await fs.mkdir(directory, { recursive: true });
    await fs.writeFile(target, xml);
  }),
);

console.log(`Wrote sitemap with ${urls.length} URLs to:\n${[...outputs].map((target) => ` - ${target}`).join("\n")}`);
