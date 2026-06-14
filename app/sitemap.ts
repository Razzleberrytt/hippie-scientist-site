import { existsSync, readFileSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { MetadataRoute } from 'next';
import matter from 'gray-matter';

import { SITE_URL } from '@/lib/site';
import { learnPosts } from './learn/data';
import { getAllFocusClusterArticles } from '@/lib/focus-cluster-markdown';

type SitemapSourceItem = {
  slug?: string;
  lastUpdated?: string;
  updatedAt?: string;
  date?: string;
  sitemap_included?: boolean | string;
  robots?: string;
  indexability_status?: string;
  runtime_export_decision?: string;
  profile_status?: string;
  summary_quality?: string;
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

function readMdxRecords(relativePath: string): (SitemapSourceItem & Record<string, any>)[] {
  const dirPath = path.join(process.cwd(), relativePath);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath)
      .filter((fileName) => /\.mdx$/i.test(fileName))
      .map((fileName) => {
        const filePath = path.join(dirPath, fileName);
        const fileContent = readFileSync(filePath, 'utf8');
        const { data } = matter(fileContent);
        return {
          slug: fileName.replace(/\.mdx$/i, ''),
          ...data
        };
      });
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

// Discovers App Router compare pages by scanning app/compare/ for subdirectories
// that contain a page.tsx. This picks up custom compare pages.
function readAppComparePageSlugs(relativePath: string): SitemapSourceItem[] {
  const dirPath = path.join(process.cwd(), relativePath);
  if (!existsSync(dirPath)) return [];

  try {
    return readdirSync(dirPath, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isDirectory()) return false;
        if (/^\[/.test(entry.name)) return false; // skip [slug] dynamic routes
        if (entry.name === 'dynamic') return false; // skip dynamic utility directory
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

function normalizeSitemapUrl(pathName: string): string {
  const normalizedPath = normalizeRoutePath(pathName);
  if (normalizedPath === '/') {
    return `${SITE_URL}/`;
  }
  return `${SITE_URL}${normalizedPath}/`;
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

function hasNoindex(record: SitemapSourceItem | null | undefined): boolean {
  if (!record) return true;

  if (record.sitemap_included === false || record.sitemap_included === 'false') {
    return true;
  }

  const robots = String(record.robots || '').toLowerCase();
  if (robots.includes('noindex')) {
    return true;
  }

  const indexabilityStatus = String(record.indexability_status || '').toUpperCase();
  if (['NOINDEX', 'NEEDS_REVIEW', 'BLOCKED'].includes(indexabilityStatus)) {
    return true;
  }

  const decision = String(record.runtime_export_decision || '').toLowerCase();
  if (['hide', 'hidden', 'blocked', 'block', 'alias_redirect_only', 'hidden_until_grounded', 'research_archive_runtime'].includes(decision)) {
    return true;
  }

  const profileStatus = String(record.profile_status || '').toLowerCase();
  if (['draft', 'archived', 'minimal', 'research_only'].includes(profileStatus)) {
    return true;
  }

  const summaryQuality = String(record.summary_quality || '').toLowerCase();
  if (['weak', 'minimal', 'thin', 'stub', 'research_needed', 'none'].includes(summaryQuality)) {
    return true;
  }

  return false;
}

function isSitemapEligible(record: SitemapSourceItem | null | undefined): boolean {
  return !hasNoindex(record);
}

function checkRouteFileEligibility(normalizedRoute: string): boolean {
  const clean = normalizedRoute.replace(/^\//, '');
  if (clean.includes('[') || clean.includes(']')) return true;

  const possiblePaths = [
    path.join(process.cwd(), 'app', clean, 'page.tsx'),
    path.join(process.cwd(), 'app', clean, 'page.ts'),
    path.join(process.cwd(), 'app', clean, 'layout.tsx'),
    path.join(process.cwd(), 'app', clean, 'layout.ts'),
  ];
  for (const filePath of possiblePaths) {
    if (existsSync(filePath)) {
      try {
        const content = readFileSync(filePath, 'utf8');
        if (/robots\s*:\s*["'][^"']*noindex/i.test(content) || /robots\s*:\s*\{\s*index\s*:\s*false/i.test(content)) {
          return false;
        }
        const canonicalMatch = content.match(/canonical\s*:\s*['"]([^'"]+)['"]/);
        if (canonicalMatch) {
          const canonicalVal = canonicalMatch[1];
          const normCanonical = normalizeRoutePath(canonicalVal);
          if (normCanonical !== normalizedRoute) {
            return false;
          }
        }
      } catch {
        // Safe fallback
      }
    }
  }
  return true;
}

function isAllowedRouteManifestEntry(routeStr: string): boolean {
  if (!routeStr || typeof routeStr !== 'string') return false;

  const normalized = normalizeRoutePath(routeStr);

  const blockedPrefixes = [
    '/api',
    '/_next',
    '/static',
    '/assets',
    '/pagefind',
    '/data',
    '/admin',
    '/preview',
    '/drafts',
    '/tmp',
    '/temp',
    '/test',
    '/dev',
    '/analytics',
    '/graph',
    '/theme',
    '/data-report',
  ];

  if (blockedPrefixes.some(prefix => normalized === prefix || normalized.startsWith(prefix + '/'))) {
    return false;
  }

  if (normalized.includes('[') || normalized.includes(']')) {
    return false;
  }

  if (normalized.toLowerCase().includes('dynamic')) {
    return false;
  }

  const allowedCoreStaticRoutes = new Set([
    '/',
    '/about',
    '/contact',
    '/faq',
    '/methodology',
    '/evidence-digest',
    '/safety-checker',
    '/herbs',
    '/compounds',
    '/articles',
    '/goals',
    '/stacks',
    '/guides',
    '/learn',
    '/compare',
    '/tools',
    '/dosing',
    '/affiliate-disclosure',
    '/privacy',
    '/disclaimer',
  ].map(normalizeRoutePath));

  if (allowedCoreStaticRoutes.has(normalized)) {
    return true;
  }

  const clean = normalized.replace(/^\//, '');
  if (!clean) return true;
  const possiblePaths = [
    path.join(process.cwd(), 'app', clean, 'page.tsx'),
    path.join(process.cwd(), 'app', clean, 'page.ts'),
    path.join(process.cwd(), 'app', clean, 'route.ts'),
  ];
  if (possiblePaths.some(p => existsSync(p))) {
    return true;
  }

  if (normalized.startsWith('/goals/') || normalized.startsWith('/stacks/') || normalized.startsWith('/guides/') || normalized.startsWith('/education/')) {
    return true;
  }

  return false;
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
  const blogPosts = readJsonArray<SitemapSourceItem>('data/blog/posts.json');
  const articlesData = readJsonArray<SitemapSourceItem>('data/articles/articles.json');
  const routeManifest = readJsonArray<SitemapSourceItem & { route?: string; segment?: string }>('public/data/runtime-manifests/route-manifest.json');
  const goalsData = readJsonArray<SitemapSourceItem>('public/data/goals.json');
  const stacksData = readJsonArray<SitemapSourceItem>('public/data/stacks.json');
  const guidesData = readMdxRecords('content/guides');
  const educationMdx = readMdxRecords('content/education');

  const sitemapEntries: MetadataRoute.Sitemap = [
    route(normalizeSitemapUrl('/'), currentDate, 'weekly', 1.0),
    route(normalizeSitemapUrl('/about'), currentDate, 'yearly', 0.6),
    route(normalizeSitemapUrl('/contact'), currentDate, 'yearly', 0.5),
    route(normalizeSitemapUrl('/faq'), currentDate, 'monthly', 0.7),
    route(normalizeSitemapUrl('/methodology'), currentDate, 'yearly', 0.6),
    route(normalizeSitemapUrl('/evidence-digest'), currentDate, 'weekly', 0.85),
    route(normalizeSitemapUrl('/safety-checker'), currentDate, 'monthly', 0.8),
    route(normalizeSitemapUrl('/herbs'), currentDate, 'weekly', 0.9),
    route(normalizeSitemapUrl('/compounds'), currentDate, 'weekly', 0.9),
    route(normalizeSitemapUrl('/articles'), currentDate, 'daily', 0.8),
    route(normalizeSitemapUrl('/goals'), currentDate, 'monthly', 0.8),
    route(normalizeSitemapUrl('/stacks'), currentDate, 'monthly', 0.7),
    route(normalizeSitemapUrl('/guides'), currentDate, 'monthly', 0.85),
    route(normalizeSitemapUrl('/compare'), currentDate, 'monthly', 0.7),
    route(normalizeSitemapUrl('/tools'), currentDate, 'monthly', 0.6),
    route(normalizeSitemapUrl('/dosing'), currentDate, 'monthly', 0.6),
    route(normalizeSitemapUrl('/affiliate-disclosure'), currentDate, 'yearly', 0.5),
    route(normalizeSitemapUrl('/privacy'), currentDate, 'yearly', 0.4),
    route(normalizeSitemapUrl('/disclaimer'), currentDate, 'yearly', 0.4),
  ];

  const addRoute = (
    pathName: string,
    changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: number,
    lastModified?: string,
  ) => {
    const normalized = normalizeRoutePath(pathName);
    if (redirectSources.has(normalized)) return;
    sitemapEntries.push(route(normalizeSitemapUrl(normalized), currentDate, changeFrequency, priority, lastModified));
  };

  const addFocusClusterRoute = (
    pathName: string,
    lastModified?: string,
  ) => {
    const normalized = normalizeRoutePath(pathName);
    if (redirectSources.has(normalized)) return;
    sitemapEntries.push(route(normalizeSitemapUrl(normalized), currentDate, 'monthly', 0.75, lastModified));
  };

  const DEPRECATED_HERBS = new Set([
    'allium-sativum',
    'valeriana-officinalis',
    'hericium-erinaceus',
    'passiflora-incarnata',
    'piper-methysticum',
    'ganoderma-lucidum',
  ]);

  const DEPRECATED_COMPOUNDS = new Set([
    'coq10',
    'coenzyme-q10-ubiquinol',
    'theanine',
    'l-theanine-sleep',
    'methyleugenol',
    'bcaas',
    'green-tea-egcg-isolated',
    'green-tea-extract-egcg',
    'nr',
    'berberine-hcl',
    'probiotic-multistrain',
    'probiotic-strain-bifidobacterium',
    'probiotic-strain-lactobacillus',
    'probiotics-bifidobacterium',
    'probiotics-lactobacillus',
    'taurine-blend',
    'taurine-sleep',
    'glycine-sleep',
    'inositol-sleep',
    'ashwagandha-extract-ksm-66',
    'ashwagandha-root-extract',
    'garlic',
    'garlic-extract',
    'garlic-aged-extract',
    'aged-garlic-extract',
    'ginger',
    'gingerol',
    'gingerols',
    'valerian',
    'valerian-extract-standardized',
    'valerian-root-extract',
    'lions-mane',
    'passionflower',
    'passionflower-extract',
    'passionflower-extract-standardized',
    'kava',
    'kavalactones',
    'reishi',
    'maca',
    'maca-root-extract',
    'elderberry',
    'resveratrol',
    'trans-resveratrol',
  ]);

  herbsData.forEach((herb) => {
    if (!herb.slug) return;
    if (DEPRECATED_HERBS.has(herb.slug.toLowerCase())) return;
    if (!isSitemapEligible(herb)) return;

    addRoute(`/herbs/${herb.slug}`, 'weekly', 0.85, herb.lastUpdated || herb.updatedAt);
  });

  compoundsData.forEach((compound) => {
    if (!compound.slug) return;
    if (DEPRECATED_COMPOUNDS.has(compound.slug.toLowerCase())) return;
    if (!isSitemapEligible(compound)) return;

    addRoute(`/compounds/${compound.slug}`, 'weekly', 0.85, compound.lastUpdated || compound.updatedAt);
  });

  const articleSlugs = new Set<string>();

  articlesData.forEach((article) => {
    if (!article.slug) return;
    if (!isSitemapEligible(article)) return;
    articleSlugs.add(article.slug);

    addRoute(`/articles/${article.slug}`, 'monthly', 0.75, article.updatedAt || article.date || article.lastUpdated);
  });

  blogPosts.forEach((post) => {
    if (!post.slug) return;
    if (articleSlugs.has(post.slug)) return;
    if (!isSitemapEligible(post)) return;

    addRoute(`/articles/${post.slug}`, 'monthly', 0.75, post.date || post.lastUpdated || post.updatedAt);
  });

  getAllFocusClusterArticles().forEach((article) => {
    if (!isSitemapEligible(article)) return;
    addFocusClusterRoute(`/${article.slug}`, article.dateModified);
  });

  // Add App Router article pages not covered by articles.json or blog posts.json
  readAppArticlePageSlugs('app/articles').forEach((article) => {
    if (!article.slug || articleSlugs.has(article.slug)) return;
    if (!isSitemapEligible(article)) return;
    articleSlugs.add(article.slug);
    addRoute(`/articles/${article.slug}`, 'monthly', 0.75);
  });

  goalsData.forEach((goal) => {
    if (!goal.slug) return;
    if (!isSitemapEligible(goal)) return;

    addRoute(`/goals/${goal.slug}`, 'monthly', 0.7);
  });

  stacksData.forEach((stack) => {
    if (!stack.slug) return;
    if (!isSitemapEligible(stack)) return;

    addRoute(`/stacks/${stack.slug}`, 'monthly', 0.65);
  });

  const guideSlugs = new Set<string>();

  guidesData.forEach((guide) => {
    if (!guide.slug) return;
    if (!isSitemapEligible(guide)) return;
    guideSlugs.add(guide.slug);
    addRoute(`/guides/${guide.slug}`, 'monthly', 0.65);
  });

  // Add App Router guide pages not covered by content/guides
  readAppGuidePageSlugs('app/guides').forEach((guide) => {
    if (!guide.slug || guideSlugs.has(guide.slug)) return;
    if (!isSitemapEligible(guide)) return;
    guideSlugs.add(guide.slug);
    addRoute(`/guides/${guide.slug}`, 'monthly', 0.65);
  });

  learnPosts.forEach((post) => {
    if (!isSitemapEligible(post)) return;
    addRoute(`/learn/${post.slug}`, 'monthly', 0.7);
  });

  educationMdx.forEach((edu) => {
    if (!edu.slug) return;
    if (!isSitemapEligible(edu)) return;
    addRoute(`/education/${edu.slug}`, 'monthly', 0.75);
  });

  // Add compare detail routes (data-driven + custom directories)
  const compareFromGen = readTsStringArray('data/generated-comparisons.ts', 'generatedComparisons');
  const compareFromData = readTsStringArray('data/comparisons.ts', 'supplementComparisons')
    .map((s: string) => s)
    .filter(Boolean);
  const compareFromDirs = readAppComparePageSlugs('app/compare').map(item => item.slug).filter((s): s is string => Boolean(s));
  Array.from(new Set([...compareFromGen, ...compareFromData, ...compareFromDirs])).forEach((slug) => {
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
    if (!isAllowedRouteManifestEntry(r)) return;
    if (!isSitemapEligible(entry)) return;
    addRoute(r, 'monthly', 0.5);
  });

  // Dedupe by url (supplements + manifest may overlap) for valid lean sitemap
  const seen = new Set<string>();
  const uniqueEntries = sitemapEntries.filter((e) => {
    const norm = normalizeRoutePath(e.url);
    if (redirectSources.has(norm)) return false;
    if (!checkRouteFileEligibility(norm)) return false;
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
  return uniqueEntries;
}
