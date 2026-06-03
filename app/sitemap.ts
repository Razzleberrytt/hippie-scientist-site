import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { MetadataRoute } from 'next';

const SITE_URL = process.env.SITE_URL || 'https://thehippiescientist.net';

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
  const blogManifest = readJsonArray<SitemapSourceItem>('public/data/blog-manifest.json');
  const goalsData = readJsonArray<SitemapSourceItem>('public/data/goals.json');
  const stacksData = readJsonArray<SitemapSourceItem>('public/data/stacks.json');
  const guidesData = readJsonArray<SitemapSourceItem>('public/data/guides.json');

  const sitemapEntries: MetadataRoute.Sitemap = [
    route(SITE_URL, currentDate, 'weekly', 1.0),
    route(`${SITE_URL}/herbs`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/compounds`, currentDate, 'weekly', 0.9),
    route(`${SITE_URL}/blog`, currentDate, 'daily', 0.8),
    route(`${SITE_URL}/goals`, currentDate, 'monthly', 0.8),
    route(`${SITE_URL}/stacks`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/guides`, currentDate, 'monthly', 0.7),
    route(`${SITE_URL}/dosing`, currentDate, 'monthly', 0.6),
    route(`${SITE_URL}/affiliate-disclosure`, currentDate, 'yearly', 0.5),
    route(`${SITE_URL}/privacy`, currentDate, 'yearly', 0.4),
    route(`${SITE_URL}/disclaimer`, currentDate, 'yearly', 0.4),
  ];

  herbsData.forEach((herb) => {
    if (!herb.slug) return;

    sitemapEntries.push(
      route(
        `${SITE_URL}/herbs/${herb.slug}`,
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
        `${SITE_URL}/compounds/${compound.slug}`,
        currentDate,
        'weekly',
        0.85,
        compound.lastUpdated || compound.updatedAt,
      ),
    );
  });

  blogManifest.forEach((post) => {
    if (!post.slug) return;

    sitemapEntries.push(
      route(
        `${SITE_URL}/blog/${post.slug}`,
        currentDate,
        'monthly',
        0.75,
        post.date || post.lastUpdated || post.updatedAt,
      ),
    );
  });

  goalsData.forEach((goal) => {
    if (!goal.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/goals/${goal.slug}`, currentDate, 'monthly', 0.7));
  });

  stacksData.forEach((stack) => {
    if (!stack.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/stacks/${stack.slug}`, currentDate, 'monthly', 0.65));
  });

  guidesData.forEach((guide) => {
    if (!guide.slug) return;

    sitemapEntries.push(route(`${SITE_URL}/guides/${guide.slug}`, currentDate, 'monthly', 0.65));
  });

  return sitemapEntries;
}
