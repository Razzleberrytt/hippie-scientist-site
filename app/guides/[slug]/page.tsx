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
  const contentBlocks = guide.content.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);
  const relatedGuides = RELATED_GUIDE_MAP[slug] ?? [];
  const atlasGuide = ATLAS_GUIDE_MAP[slug];

  return (
    <ArticleLayout zone="supplement">
      {guide.publishDate ? (
        <StructuredData
          pageUrl={pageUrl}
          headline={guide.title}
          description={guide.description}
          datePublished={guide.publishDate}
          dateModified={guide.lastUpdated}
          breadcrumbs={[
            { label: "Home", href: "/" },
            { label: "Guides", href: "/guides/" },
            { label: guide.title, href: `/guides/${slug}/` },
          ]}
        />
      ) : null}

      <div className="space-y-9 sm:space-y-10">
        <header className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
          <p className="eyebrow-label">Evidence guide</p>
          <h1 className="heading-premium mt-5 max-w-4xl">{guide.title}</h1>
          <p className="text-reading mt-4 max-w-3xl">{guide.description}</p>
          {(guide.publishDate || guide.lastUpdated) ? (
            <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 font-mono text-[0.64rem] font-semibold uppercase tracking-[0.11em] text-[color:var(--hs-body)]">
              {guide.publishDate ? <span>Published {guide.publishDate}</span> : null}
              {guide.publishDate && guide.lastUpdated ? <span aria-hidden="true">·</span> : null}
              {guide.lastUpdated ? <span>Updated {guide.lastUpdated}</span> : null}
            </div>
          ) : null}
        </header>

        {contentBlocks.length > 0 ? (
          <section className="max-w-3xl border-y border-[color:var(--hs-hairline)] py-7 sm:py-9" aria-label="Guide overview">
            <p className="section-label">Overview</p>
            <div className="mt-4 space-y-4">
              {contentBlocks.map((block) => (
                <p key={block} className="text-[1rem] leading-8 text-[color:var(--hs-body)]">{block}</p>
              ))}
            </div>
          </section>
        ) : null}

        {atlasGuide ? (
          <aside className="relative overflow-hidden rounded-[1.6rem] border border-[color:color-mix(in_srgb,var(--tone)_22%,var(--hs-hairline))] bg-[color:color-mix(in_srgb,var(--tone)_6%,var(--hs-surface))] p-5 sm:p-6">
            <div aria-hidden="true" className="absolute -right-12 -top-12 h-32 w-32 rounded-full border border-[color:color-mix(in_srgb,var(--hs-gold)_20%,transparent)]" />
            <div className="relative max-w-2xl">
              <p className="section-label">Botanical Activity Atlas</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">{atlasGuide.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]">{atlasGuide.description}</p>
              <Link href={atlasGuide.href} className="button-primary mt-5 inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold">
                Open evidence-sorted comparison →
              </Link>
            </div>
          </aside>
        ) : null}

        {relatedGuides.length > 0 ? <RelatedArticles articles={relatedGuides} /> : null}

        <nav className="flex flex-wrap gap-x-5 gap-y-2 border-t border-[color:var(--hs-hairline)] pt-5 text-sm font-semibold text-[color:var(--tone-ink)]" aria-label="Guide support links">
          <Link href="/guides/" className="hover:text-[color:var(--hs-ink)] hover:underline">All guides</Link>
          <Link href="/tools/botanical-activity-atlas/" className="hover:text-[color:var(--hs-ink)] hover:underline">Botanical Activity Atlas</Link>
          <Link href="/safety-checker/" className="hover:text-[color:var(--hs-ink)] hover:underline">Safety checker</Link>
        </nav>
      </div>
    </ArticleLayout>
  );
}
