import { getGuideBySlug } from "@/lib/guides";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import StructuredData from "@/components/StructuredData";
import { buildPageMetadata, SITE_URL, compactMetaTitle } from "../../../src/lib/seo";
import { ArticleLayout, RelatedArticles } from "@/components/articles";
import type { RelatedArticle } from "@/components/articles";

interface Props {
  params: Promise<{ slug: string }>;
}

const GUIDE_SLUGS = ["ashwagandha", "lions-mane"];

const RELATED_GUIDE_MAP: Record<string, RelatedArticle[]> = {
  ashwagandha: [
    { href: "/guides/herbs/turmeric-curcumin/", title: "Turmeric & Curcumin Guide", description: "Anti-inflammatory evidence, bioavailability forms, and dosage comparison.", category: "stress" },
    { href: "/guides/lions-mane/", title: "Lion's Mane Guide", description: "Cognitive support, NGF synthesis, and neuroregeneration evidence.", category: "focus" },
    { href: "/guides/sleep/magnesium-for-sleep/", title: "Magnesium for Sleep Guide", description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.", category: "sleep" },
  ],
  "lions-mane": [
    { href: "/guides/ashwagandha/", title: "Ashwagandha Guide", description: "Cortisol modulation, stress adaptation, and sleep quality evidence.", category: "stress" },
    { href: "/guides/herbs/turmeric-curcumin/", title: "Turmeric & Curcumin Guide", description: "Anti-inflammatory and neuroprotective evidence with bioavailability context.", category: "stress" },
    { href: "/guides/sleep/magnesium-for-sleep/", title: "Magnesium for Sleep Guide", description: "Magnesium forms, dosage, and evidence for sleep and anxiety support.", category: "sleep" },
  ],
};

const ATLAS_GUIDE_MAP: Record<string, { href: string; title: string; description: string }> = {
  ashwagandha: {
    href: "/tools/botanical-activity-atlas/calming-botanicals/?effect=Calming&sort=evidence",
    title: "Compare calming botanicals",
    description: "See ashwagandha beside other calming herbs, filtered by effect and sorted by strongest evidence.",
  },
  "lions-mane": {
    href: "/tools/botanical-activity-atlas/?effect=Cognition+%2F+focus&sort=evidence",
    title: "Compare cognition-focused botanicals",
    description: "Compare Lion's Mane with other cognition and focus botanicals using the atlas evidence view.",
  },
};

export async function generateStaticParams() {
  return GUIDE_SLUGS.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) return { title: 'Page Not Found', robots: { index: false, follow: true } };
  return buildPageMetadata({ title: compactMetaTitle(guide.title), description: guide.description, path: `/guides/${slug}/` });
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const pageUrl = `${SITE_URL}/guides/${slug}/`;
  const publishDate = guide.publishDate || "2024-01-01";
  const contentBlocks = guide.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const relatedGuides = RELATED_GUIDE_MAP[slug] ?? [];
  const atlasGuide = ATLAS_GUIDE_MAP[slug];

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
      {/*
        Guide views are emitted by <ClickTracker /> in app/layout.tsx, which waits for
        analytics consent. An inline gtag snippet here would fire before consent and
        would also overwrite the consent-aware window.gtag installed by loadAnalytics().
      */}
      <div className="space-y-8">
        <div>
          <h1>{guide.title}</h1>
          <p className="mt-2 text-muted">{guide.description}</p>
          <div className="mt-6 space-y-4">
            {contentBlocks.map((block) => <p key={block} className="text-muted">{block}</p>)}
          </div>
        </div>

        {atlasGuide && (
          <aside className="rounded-2xl border border-emerald-900/10 bg-emerald-50/60 p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">Botanical Activity Atlas</p>
            <h2 className="mt-2 text-xl font-bold text-ink">{atlasGuide.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{atlasGuide.description}</p>
            <Link href={atlasGuide.href} className="mt-4 inline-flex min-h-[44px] items-center rounded-full bg-emerald-800 px-5 text-sm font-semibold text-white hover:bg-emerald-900">
              Open evidence-sorted comparison →
            </Link>
          </aside>
        )}

        {relatedGuides.length > 0 && <RelatedArticles articles={relatedGuides} />}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700" aria-label="Guide support links">
          <Link href="/guides/" className="hover:text-brand-800">All guides</Link>
          <Link href="/tools/botanical-activity-atlas/" className="hover:text-brand-800">Botanical Activity Atlas</Link>
          <Link href="/safety-checker/" className="hover:text-brand-800">Safety checker</Link>
        </nav>
      </div>
    </ArticleLayout>
  );
}
