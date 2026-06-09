import { getGuideBySlug } from "@/lib/guides";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Script from "next/script";

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
  };
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params;
  const guide = await getGuideBySlug(slug);
  if (!guide) notFound();

  const ga4Id = process.env.NEXT_PUBLIC_GA4_ID?.trim() || '';
  const contentBlocks = guide.content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean);

  return (
    <>
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
    </>
  );
}
