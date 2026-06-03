import { MetadataRoute } from 'next';

// Define your site URL (use env var in production)
const SITE_URL = process.env.SITE_URL || 'https://thehippiescientist.com';

// Import your data manifests (adjust paths based on your build output)
import herbsData from '@/public/data/herbs.json' assert { type: 'json' };
import compoundsData from '@/public/data/compounds.json' assert { type: 'json' };
import blogManifest from '@/public/data/blog-manifest.json' assert { type: 'json' };
import goalsData from '@/public/data/goals.json' assert { type: 'json' };
import stacksData from '@/public/data/stacks.json' assert { type: 'json' };
import guidesData from '@/public/data/guides.json' assert { type: 'json' };

// Optional: Import education/learn pages if you have a manifest
// import educationPages from '@/public/data/education-pages.json' assert { type: 'json' };

export const dynamic = 'force-static'; // Critical for static export

/**
 * Generate full sitemap for static export
 * Compatible with Next.js 15 + Cloudflare Pages
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

  const sitemapEntries: MetadataRoute.Sitemap = [
    // === Core Pages ===
    {
      url: SITE_URL,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/herbs`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/compounds`,
      lastModified: currentDate,
      changeFreq: 'weekly',
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: currentDate,
      changeFreq: 'daily',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/goals`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.8,
    },
    {
      url: `${SITE_URL}/stacks`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/guides`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/dosing`,
      lastModified: currentDate,
      changeFreq: 'monthly',
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/affiliate-disclosure`,
      lastModified: currentDate,
      changeFreq: 'yearly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/privacy`,
      lastModified: currentDate,
      changeFreq: 'yearly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/disclaimer`,
      lastModified: currentDate,
      changeFreq: 'yearly',
      priority: 0.4,
    },
  ];

  // === Herb Profiles ===
  herbsData.forEach((herb: any) => {
    if (herb.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/herbs/${herb.slug}`,
        lastModified: herb.lastUpdated || currentDate,
        changeFreq: 'weekly',
        priority: 0.85,
      });
    }
  });

  // === Compound Profiles ===
  compoundsData.forEach((compound: any) => {
    if (compound.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/compounds/${compound.slug}`,
        lastModified: compound.lastUpdated || currentDate,
        changeFreq: 'weekly',
        priority: 0.85,
      });
    }
  });

  // === Blog Posts ===
  blogManifest.forEach((post: any) => {
    if (post.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: post.date || currentDate,
        changeFreq: 'monthly',
        priority: 0.75,
      });
    }
  });

  // === Goals ===
  goalsData.forEach((goal: any) => {
    if (goal.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/goals/${goal.slug}`,
        lastModified: currentDate,
        changeFreq: 'monthly',
        priority: 0.7,
      });
    }
  });

  // === Stacks ===
  stacksData.forEach((stack: any) => {
    if (stack.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/stacks/${stack.slug}`,
        lastModified: currentDate,
        changeFreq: 'monthly',
        priority: 0.65,
      });
    }
  });

  // === Guides ===
  guidesData.forEach((guide: any) => {
    if (guide.slug) {
      sitemapEntries.push({
        url: `${SITE_URL}/guides/${guide.slug}`,
        lastModified: currentDate,
        changeFreq: 'monthly',
        priority: 0.65,
      });
    }
  });

  // Optional: Add education/learn pages
  // educationPages?.forEach(...)

  return sitemapEntries;
}
