import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { MetadataRoute } from 'next';

import { SITE_URL } from '@/lib/site';
import { learnPosts } from './learn/data';
import { getAllFocusClusterArticles } from '@/lib/focus-cluster-markdown';

type SitemapSourceItem = {
  slug?: string;
  lastUpdated?: string;
  updatedAt?: string;
  date?: string;
};

export const dynamic = 'force-static';

function readJsonArray<T>(relativePath: string): T[] {
  const filePath = path.join(process.cwd(), relativePath);

  if (!existsSync(filePath)) {
    return [];
  }

  try {
    const parsed = JSON.parse(readFileSync(filePath, 'utf8'));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function readMdxSlugs(relativePath: string): SitemapSourceItem[] {
  const dirPath = path.join(process.cwd(), relativePath);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath)
      .filter((fileName) => /\.mdx$/i.test(fileName))
      .map((fileName) => ({ slug: fileName.replace(/\.mdx$/i, '') }));
  } catch {
    return [];
  }
}

// Discovers App Router article pages by scanning app/articles/ for subdirectories
// that contain a page.tsx. This picks up cluster articles that have no .md counterpart
// in content/articles/ without requiring a hardcoded list.
function readAppArticlePageSlugs(relativePath: string): SitemapSourceItem[] {
  const dirPath = path.join(process.cwd(), relativePath);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isDirectory()) return false;
        if (/^\[/.test(entry.name)) return false; // skip [slug] dynamic routes
        return existsSync(path.join(dirPath, entry.name, 'page.tsx'));
      })
      .map((entry) => ({ slug: entry.name }));
  } catch {
    return [];
  }
}

// Discovers App Router guide pages by scanning app/guides/ for subdirectories
// that contain a page.tsx. This picks up custom guides without requiring a hardcoded list.
function readAppGuidePageSlugs(relativePath: string): SitemapSourceItem[] {
  const dirPath = path.join(process.cwd(), relativePath);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isDirectory()) return false;
        if (/^\[/.test(entry.name)) return false; // skip [slug] dynamic routes
        return existsSync(path.join(dirPath, entry.name, 'page.tsx'));
      })
      .map((entry) => ({ slug: entry.name }));
  } catch {
    return [];
  }
}

function readTsStringArray(relativePath: string, varName: string): string[] {
  const filePath = path.join(process.cwd(), relativePath);
  if (!existsSync(filePath)) return [];
  try {
    const src = readFileSync(filePath, 'utf8');
    // Match export const varName = [ 'a', 'b', ... ]
    const re = new RegExp(`export\\s+const\\s+${varName}\\s*=\\s*\\[([\\s\\S]*?)\\]`, 'm');
    const m = src.match(re);
    if (!m) return [];
    const body = m[1];
    const items: string[] = [];
    const itemRe = /['"]([^'"]+)['"]/g;
    let im;
    while ((im = itemRe.exec(body)) !== null) {
      if (im[1]) items.push(im[1]);
    }
    return items;
  } catch {
    return [];
  }
}

function normalizeRoutePath(value: string): string {
  if (!value) return '/';
  try {
    const url = value.startsWith('http') ? new URL(value) : null;
    value = url ? url.pathname : value;
  } catch {
    // Keep original relative path.
  }
  const pathOnly = value.split(/[?#]/)[0] || '/';
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`;
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/';
}

function readRedirectSources(relativePath = 'public/_redirects'): Set<string> {
  const filePath = path.join(process.cwd(), relativePath);
  const sources = new Set<string>();
  if (!existsSync(filePath)) return sources;

  try {
    const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const [source, target, status] = trimmed.split(/\s+/);
      if (!source || source.includes('*')) continue;
      if (!/^30[1278]$/.test(status || '')) continue;
      if (target && normalizeRoutePath(source) === normalizeRoutePath(target)) continue;
      sources.add(normalizeRoutePath(source));
    }
  } catch {
    return sources;
  }

  return sources;
}

function route(
  url: string,
  currentDate: string,
  changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
  priority: number,
  lastModified?: string,
): MetadataRoute.Sitemap[number] {
  return {
    url,
    lastModified: lastModified || currentDate,
    changeFrequency,
    priority,
  };
}

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString().split('T')[0];
  const redirectSources = readRedirectSources();

  const herbsData = readJsonArray<SitemapSourceItem>('public/data/herbs.json');
  const compoundsData = readJsonArray<SitemapSourceItem>('public/data/compounds.json');
  // Blog posts come from build-blog data pipeline (not the missing blog-manifest); filter sitemap-eligible
  const blogPosts = readJsonArray<SitemapSourceItem>('data/blog/posts.json');
  const articlesData = readJsonArray<SitemapSourceItem>('data/articles/articles.json');
  const routeManifest = readJsonArray<SitemapSourceItem & { route?: string; segment?: string }>('public/data/runtime-manifests/route-manifest.json');
  const goalsData = readJsonArray<SitemapSourceItem>('public/data/goals.json');
  const stacksData = readJsonArray<SitemapSourceItem>('public/data/stacks.json');
  const guidesData = readMdxSlugs('content/guides');

  const sitemapEntries: MetadataRoute.Sitemap = [
    route(`${SITE_URL}/`, currentDate, 'weekly', 1.0),
    route(`${SITE_URL}/about/`, currentDate, 'yearly', 0.6),
    route(`${SITE_URL}/contact/`, currentDate, 'yearly', 0.5),
    route(`${SITE_URL}/faq/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/methodology/`, currentDate, 'yearly', 0.6),
    route(`${SITE_URL}/safety-checker/`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/herbs/`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/compounds/`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/articles/`, currentDate, 'daily', 0.8),
    route(`${SITE_URL}/goals/`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/stacks/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/guides/`, currentDate, 'monthly', 0.85),
    route(`${SITE_URL}/learn/`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/compare/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/tools/`, currentDate, 'monthly', 0.6),
    route(`${SITE_URL}/dosing/`, currentDate, 'monthly', 0.6),
    route(`${SITE_URL}/affiliate-disclosure/`, currentDate, 'yearly', 0.5),
    route(`${SITE_URL}/privacy/`, currentDate, 'yearly', 0.4),
    route(`${SITE_URL}/disclaimer/`, currentDate, 'yearly', 0.4),
  ];

  const addRoute = (
    pathName: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
    lastModified?: string,
  ) => {
    const normalized = normalizeRoutePath(pathName);
    if (redirectSources.has(normalized)) return;
    sitemapEntries.push(route(`${SITE_URL}${normalized === '/' ? '/' : `${normalized}/`}`, currentDate, changeFrequency, priority, lastModified));
  };

  const DEPRECATED_HERBS = new Set([
    'allium-sativum',
    'valeriana-officinalis',
    'hericium-erinaceus',
    'passiflora-incarnata',
    'piper-methysticum',
    'ganoderma-lucidum',
  ]);

  herbsData.forEach((herb) => {
    if (!herb.slug) return;
    if (DEPRECATED_HERBS.has(herb.slug.toLowerCase())) return;

    addRoute(`/herbs/${herb.slug}`, 'weekly', 0.85, herb.lastUpdated || herb.updatedAt);
  });

  compoundsData.forEach((compound) => {
    if (!compound.slug) return;

    addRoute(`/compounds/${compound.slug}`, 'weekly', 0.85, compound.lastUpdated || compound.updatedAt);
  });

  const articleSlugs = new Set<string>();

  articlesData.forEach((article) => {
    if (!article.slug) return;
    const status = (article as Record<string, unknown>).profile_status || '';
    if ((article as Record<string, unknown>).sitemap_included === false) return;
    if (/draft|archived/i.test(String(status))) return;
    articleSlugs.add(article.slug);

    addRoute(`/articles/${article.slug}`, 'monthly', 0.75, article.updatedAt || article.date || article.lastUpdated);
  });

  blogPosts.forEach((post) => {
    if (!post.slug) return;
    if (articleSlugs.has(post.slug)) return;
    const status = (post as Record<string, unknown>).profile_status || '';
    if ((post as Record<string, unknown>).sitemap_included === false) return;
    if (/draft|archived/i.test(String(status))) return;

    addRoute(`/articles/${post.slug}`, 'monthly', 0.75, post.date || post.lastUpdated || post.updatedAt);
  });

  getAllFocusClusterArticles().forEach((article) => {
    addRoute(`/${article.slug}`, 'monthly', 0.75, article.dateModified);
  });

  // Add App Router article pages not covered by articles.json or blog posts.json
  readAppArticlePageSlugs('app/articles').forEach((article) => {
    if (!article.slug || articleSlugs.has(article.slug)) return;
    articleSlugs.add(article.slug);
    addRoute(`/articles/${article.slug}`, 'monthly', 0.75);
  });

  goalsData.forEach((goal) => {
    if (!goal.slug) return;

    addRoute(`/goals/${goal.slug}`, 'monthly', 0.7);
  });

  stacksData.forEach((stack) => {
    if (!stack.slug) return;

    addRoute(`/stacks/${stack.slug}`, 'monthly', 0.65);
  });

  const guideSlugs = new Set<string>();

  guidesData.forEach((guide) => {
    if (!guide.slug) return;
    guideSlugs.add(guide.slug);
    addRoute(`/guides/${guide.slug}`, 'monthly', 0.65);
  });

  // Add App Router guide pages not covered by content/guides
  readAppGuidePageSlugs('app/guides').forEach((guide) => {
    if (!guide.slug || guideSlugs.has(guide.slug)) return;
    guideSlugs.add(guide.slug);
    addRoute(`/guides/${guide.slug}`, 'monthly', 0.65);
  });

  learnPosts.forEach((post) => {
    addRoute(`/learn/${post.slug}`, 'monthly', 0.7);
  });

  // Add compare detail routes (data-driven, for task requirement to cover /compare/:slug)
  const compareFromGen = readTsStringArray('data/generated-comparisons.ts', 'generatedComparisons');
  const compareFromData = readTsStringArray('data/comparisons.ts', 'supplementComparisons')
    .map((s: string) => s)
    .filter(Boolean);
  Array.from(new Set([...compareFromGen, ...compareFromData])).forEach((slug) => {
    if (slug) addRoute(`/compare/${slug}`, 'monthly', 0.65);
  });

  // Inactive collections routes (redirect targets or defined in lib) are excluded from the sitemap.
  // Add /top/* and best-supplements-for-* entry pages (from seo-entry-pages definitions)
  const topPages = [
    'best-supplements-for-sleep',
    'best-supplements-for-stress',
    'best-supplements-for-focus',
    'best-supplements-for-fat-loss',
    'best-supplements-for-blood-pressure',
    'best-supplements-for-gut-health',
    'best-supplements-for-joint-support',
    'best-herbs-for-anxiety',
    'best-nootropics-for-focus',
    'best-adaptogens-for-stress',
  ];
  topPages.forEach((p) => {
    addRoute(`/${p}`, 'monthly', 0.6);
  });

  // Pull any extra from comprehensive route-manifest (covers additional /compare index, ecosystems etc not already listed)
  routeManifest.forEach((entry: Record<string, unknown>) => {
    const r = (entry && (entry.route || entry.slug)) as string | undefined;
    if (!r || typeof r !== 'string' || r === '/' || r.startsWith('/herbs/') || r.startsWith('/compounds/') || r.startsWith('/blog/') || r.startsWith('/research-notes/') || r.startsWith('/articles/') || r.startsWith('/goals/') || r.startsWith('/compare/') || r.startsWith('/collections/')) return;
    if (r.startsWith('/_') || r.includes('dynamic')) return;
    addRoute(r, 'monthly', 0.5);
  });

  // Dedupe by url (supplements + manifest may overlap) for valid lean sitemap
  const seen = new Set<string>();
  const uniqueEntries = sitemapEntries.filter((e) => {
    if (redirectSources.has(normalizeRoutePath(e.url))) return false;
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
  return uniqueEntries;
}
