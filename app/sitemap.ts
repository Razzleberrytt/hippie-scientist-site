import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { MetadataRoute } from 'next';

const SITE_URL = 'https://thehippiescientist.net';

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

  const herbsData = readJsonArray<SitemapSourceItem>('public/data/herbs.json');
  const compoundsData = readJsonArray<SitemapSourceItem>('public/data/compounds.json');
  // Blog posts come from build-blog data pipeline (not the missing blog-manifest); filter sitemap-eligible
  const blogPosts = readJsonArray<SitemapSourceItem>('data/blog/posts.json');
  const routeManifest = readJsonArray<SitemapSourceItem & { route?: string; segment?: string }>('public/data/runtime-manifests/route-manifest.json');
  const goalsData = readJsonArray<SitemapSourceItem>('public/data/goals.json');
  const stacksData = readJsonArray<SitemapSourceItem>('public/data/stacks.json');
  const guidesData = readJsonArray<SitemapSourceItem>('public/data/guides.json');

  const sitemapEntries: MetadataRoute.Sitemap = [
    route(`${SITE_URL}/`, currentDate, 'weekly', 1.0),
    route(`${SITE_URL}/about/`, currentDate, 'yearly', 0.6),
    route(`${SITE_URL}/contact/`, currentDate, 'yearly', 0.5),
    route(`${SITE_URL}/faq/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/learn/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/methodology/`, currentDate, 'yearly', 0.6),
    route(`${SITE_URL}/safety-checker/`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/herbs/`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/compounds/`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/blog/`, currentDate, 'daily', 0.8),
    route(`${SITE_URL}/goals/`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/stacks/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/guides/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/compare/`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/collections/`, currentDate, 'monthly', 0.6),
    route(`${SITE_URL}/dosing/`, currentDate, 'monthly', 0.6),
    route(`${SITE_URL}/affiliate-disclosure/`, currentDate, 'yearly', 0.5),
    route(`${SITE_URL}/privacy/`, currentDate, 'yearly', 0.4),
    route(`${SITE_URL}/disclaimer/`, currentDate, 'yearly', 0.4),
  ];

  herbsData.forEach((herb) => {
    if (!herb.slug) return;

    sitemapEntries.push(
      route(
        `${SITE_URL}/herbs/${herb.slug}/`,
        currentDate,
        'weekly',
        0.85,
        herb.lastUpdated || herb.updatedAt,
      ),
    );
  });

  compoundsData.forEach((compound) => {
    if (!compound.slug) return;

    sitemapEntries.push(
      route(
        `${SITE_URL}/compounds/${compound.slug}/`,
        currentDate,
        'weekly',
        0.85,
        compound.lastUpdated || compound.updatedAt,
      ),
    );
  });

  blogPosts.forEach((post) => {
    if (!post.slug) return;
    const status = (post as any).profile_status || '';
    if ((post as any).sitemap_included === false) return;
    if (/draft|archived/i.test(String(status))) return;

    sitemapEntries.push(
      route(
        `${SITE_URL}/blog/${post.slug}/`,
        currentDate,
        'monthly',
        0.75,
        post.date || post.lastUpdated || post.updatedAt,
      ),
    );
  });

  goalsData.forEach((goal) => {
    if (!goal.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/goals/${goal.slug}/`, currentDate, 'monthly', 0.7));
  });

  stacksData.forEach((stack) => {
    if (!stack.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/stacks/${stack.slug}/`, currentDate, 'monthly', 0.65));
  });

  guidesData.forEach((guide) => {
    if (!guide.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/guides/${guide.slug}/`, currentDate, 'monthly', 0.65));
  });

  // Add compare detail routes (data-driven, for task requirement to cover /compare/:slug)
  const compareFromGen = readTsStringArray('data/generated-comparisons.ts', 'generatedComparisons');
  const compareFromData = readTsStringArray('data/comparisons.ts', 'supplementComparisons')
    .map((s: any) => (typeof s === 'string' ? s : (s && s.slug) || ''))
    .filter(Boolean);
  Array.from(new Set([...compareFromGen, ...compareFromData])).forEach((slug) => {
    if (slug) sitemapEntries.push(route(`${SITE_URL}/compare/${slug}/`, currentDate, 'monthly', 0.65));
  });

  // Add collections/:slug (redirect targets or defined in lib; include per task)
  const knownCollections = ['best-studied-sleep-compounds', 'adaptogens-for-stress', 'cholinergic-compounds', 'high-evidence-anti-inflammatory-herbs'];
  knownCollections.forEach((slug) => {
    sitemapEntries.push(route(`${SITE_URL}/collections/${slug}/`, currentDate, 'monthly', 0.55));
  });

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
    sitemapEntries.push(route(`${SITE_URL}/${p}/`, currentDate, 'monthly', 0.6));
  });

  // Pull any extra from comprehensive route-manifest (covers additional /compare index, ecosystems etc not already listed)
  routeManifest.forEach((entry: any) => {
    const r = (entry && (entry.route || entry.slug)) as string | undefined;
    if (!r || typeof r !== 'string' || r === '/' || r.startsWith('/herbs/') || r.startsWith('/compounds/') || r.startsWith('/blog/') || r.startsWith('/goals/') || r.startsWith('/compare/') || r.startsWith('/collections/')) return;
    if (r.startsWith('/_') || r.includes('dynamic')) return;
    const url = r.endsWith('/') || r === '' ? `${SITE_URL}${r || '/'}` : `${SITE_URL}${r}/`;
    sitemapEntries.push(route(url, currentDate, 'monthly', 0.5));
  });

  // Dedupe by url (supplements + manifest may overlap) for valid lean sitemap
  const seen = new Set<string>();
  const uniqueEntries = sitemapEntries.filter((e) => {
    if (seen.has(e.url)) return false;
    seen.add(e.url);
    return true;
  });
  return uniqueEntries;
}
