import { getGuideBySlug } from "@/lib/guides";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";

interface Props {
  params: Promise<{ slug: string }>;
}

const GUIDE_SLUGS = [
  "ashwagandha",
  "kava",
  "elderberry",
  "passionflower",
  "lions-mane",
  "rhodiola-complete-guide",
  "rhodiola-extract-vs-powder",
  "rhodiola-energy",
  "rhodiola-sleep-stack",
];

const SITE_URL = "https://thehippiescientist.net";

// Related guides cross-links for the 4 main guide slugs
const RELATED_GUIDE_MAP: Record<string, { href: string; label: string; description: string }[]> = {
  ashwagandha: [
    {
      href: "/guides/turmeric-curcumin",
      label: "Turmeric & Curcumin Guide",
      description: "Anti-inflammatory evidence, bioavailability forms, and dosage comparison.",
    },
    {
      href: "/guides/lions-mane",
      label: "Lion's Mane Guide",
      description: "Cognitive support, NGF synthesis, and neuroregeneration evidence.",
    },
    {
      href: "/guides/magnesium-for-sleep",
      label: "Magnesium for Sleep Guide",
      description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.",
    },
  ],
  "lions-mane": [
    {
      href: "/guides/ashwagandha",
      label: "Ashwagandha Guide",
      description: "Cortisol modulation, stress adaptation, and sleep quality evidence.",
    },
    {
      href: "/guides/turmeric-curcumin",
      label: "Turmeric & Curcumin Guide",
      description: "Anti-inflammatory and neuroprotective evidence with bioavailability context.",
    },
    {
      href: "/guides/magnesium-for-sleep",
      label: "Magnesium for Sleep Guide",
      description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.",
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
  return {
    title: guide.title,
    description: guide.description,
    robots: { index: true, follow: true },
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || "";
  const pageUrl = `${SITE_URL}/guides/${slug}`;
  const publishDate = guide.publishDate || "2024-01-01";
  const contentBlocks = guide.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  const relatedGuides = RELATED_GUIDE_MAP[slug] ?? [];

  return (
    <>
      <StructuredData
        pageUrl={pageUrl}
        headline={guide.title}
        description={guide.description}
        datePublished={publishDate}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Guides", href: "/guides" },
          { label: guide.title, href: `/guides/${slug}` },
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
                page_path: '/guides/${slug}',
                page_title: '${guide.title.replace(/'/g, "\\'")}',
                guide_slug: '${slug}',
                guide_type: 'guide'
              });
            `,
          }}
        />
      )}
      <article className="max-w-3xl mx-auto px-4 py-8">
        <h1>{guide.title}</h1>
        <p className="text-gray-600 mb-8">{guide.description}</p>
        <div className="prose prose-sm max-w-none">
          {contentBlocks.map((block) => (
            <p key={block}>{block}</p>
          ))}
        </div>
      </article>
      {relatedGuides.length > 0 && (
        <div className="mx-auto max-w-3xl space-y-4 px-4 pb-12 sm:px-6">
          <h2 className="text-xl font-semibold text-ink">Related Guides</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {relatedGuides.map((g) => (
              <Link
                key={g.href}
                href={g.href}
                className="rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
              >
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                  Guide
                </p>
                <p className="mt-1 text-sm font-semibold text-ink">{g.label}</p>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                  {g.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
