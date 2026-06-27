import { getGuideBySlug } from "@/lib/guides";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import { buildPageMetadata, SITE_URL, compactMetaTitle } from "../../../src/lib/seo";
import { ArticleLayout, RelatedArticles } from "@/components/articles";
import type { RelatedArticle } from "@/components/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

// NOTE: kava, elderberry, passionflower, and the rhodiola hub (complete-guide,
// extract-vs-powder, energy, sleep-stack) were migrated to dedicated rich component
// pages under app/guides/<slug>/page.tsx (Phase 2). They are removed here to avoid
// static-export route collisions. ashwagandha and lions-mane remain on this legacy
// renderer until they are upgraded to the dedicated pattern.
const GUIDE_SLUGS = [
  "ashwagandha",
  "lions-mane",
];

// Related guides cross-links for the 4 main guide slugs
const RELATED_GUIDE_MAP: Record<string, RelatedArticle[]> = {
  ashwagandha: [
    {
      href: "/guides/turmeric-curcumin/",
      title: "Turmeric & Curcumin Guide",
      description: "Anti-inflammatory evidence, bioavailability forms, and dosage comparison.",
      category: "stress",
    },
    {
      href: "/guides/lions-mane/",
      title: "Lion's Mane Guide",
      description: "Cognitive support, NGF synthesis, and neuroregeneration evidence.",
      category: "focus",
    },
    {
      href: "/guides/magnesium-for-sleep/",
      title: "Magnesium for Sleep Guide",
      description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.",
      category: "sleep",
    },
  ],
  "lions-mane": [
    {
      href: "/guides/ashwagandha/",
      title: "Ashwagandha Guide",
      description: "Cortisol modulation, stress adaptation, and sleep quality evidence.",
      category: "stress",
    },
    {
      href: "/guides/turmeric-curcumin/",
      title: "Turmeric & Curcumin Guide",
      description: "Anti-inflammatory and neuroprotective evidence with bioavailability context.",
      category: "stress",
    },
    {
      href: "/guides/magnesium-for-sleep/",
      title: "Magnesium for Sleep Guide",
      description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.",
      category: "sleep",
    },
  ],
};

export async function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return {};
  return buildPageMetadata({
    title: compactMetaTitle(guide.title),
    description: guide.description,
    path: `/guides/${slug}/`,
  });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";
  const pageUrl = `${SITE_URL}/guides/${slug}/`;
  const publishDate = guide.publishDate || "2024-01-01";
  const contentBlocks = guide.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const relatedGuides = RELATED_GUIDE_MAP[slug] ?? [];

  return (
    <ArticleLayout zone="supplement">
      <StructuredData
        pageUrl={pageUrl}
        headline={guide.title}
        description={guide.description}
        datePublished={publishDate}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides/" },
          { label: guide.title, href: `/guides/${slug}/` },
        ]}
      />
      {ga4Id && (
        <Script
          id={`guide-page-view-${slug}`}
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('event', 'page_view', {
                page_path: '/guides/${slug}/',
                page_title: '${guide.title.replace(/'/g, "\\'")}',
                guide_slug: '${slug}',
                guide_type: 'guide'
              });
            `,
          }}
        />
      )}
      <div className="space-y-8">
        <div>
          <h1>{guide.title}</h1>
          <p className="mt-2 text-muted">{guide.description}</p>
          <div className="mt-6 space-y-4">
            {contentBlocks.map((block) => (
              <p key={block} className="text-muted">{block}</p>
            ))}
          </div>
        </div>
        {relatedGuides.length > 0 && (
          <RelatedArticles articles={relatedGuides} />
        )}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700" aria-label="Guide support links">
          <Link href="/guides/" className="hover:text-brand-800">All guides</Link>
          <Link href="/articles/" className="hover:text-brand-800">Articles</Link>
          <Link href="/safety-checker/" className="hover:text-brand-800">Safety checker</Link>
        </nav>
      </div>
    </ArticleLayout>
  );
}
