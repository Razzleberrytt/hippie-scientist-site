import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import Meta from "../components/Meta";
import HerbDetails, { normalizeHerbDetails } from "../components/HerbDetails";
import { Button } from "../components/ui/Button";
import data from "../data/herbs/herbs.normalized.json";
import postsData from "../data/blog/posts.json";
import { relatedPostsByHerbSlug } from "../lib/relevance";
import { cleanLine, hasVal, titleCase } from "../lib/pretty";
import { pick } from "../lib/present";

type Herb = (typeof data)[number];

type BlogPost = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
};

const blogPosts = postsData as BlogPost[];

type Param = {
  slug?: string;
};

function RelatedPosts({ slug }: { slug?: string }) {
  if (!slug) return null;
  const posts = relatedPostsByHerbSlug(slug, 3)
    .map(ref => blogPosts.find(p => p.slug === ref?.slug))
    .filter((p): p is BlogPost => Boolean(p));
  if (!posts.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <h2 className="text-lg font-semibold text-white/90">Related Posts</h2>
      <ul className="mt-3 space-y-3">
        {posts.map(p => (
          <li key={p.slug} className="text-sm text-white/80">
            <a href={`/blog/${p.slug}`} className="link text-[rgb(var(--accent))]">
              {p.title}
            </a>
            {p.date && (
              <p className="text-xs text-white/50">
                {new Date(p.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
            {p.description && <p className="text-xs text-white/60">{p.description}</p>}
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm">
        <a href="/blog" className="link text-[rgb(var(--accent))]">
          View all posts →
        </a>
      </div>
    </section>
  );
}

export default function HerbDetail() {
  const { slug } = useParams<Param>();
  const herb = data.find((h: Herb) => h.slug === slug);

  if (!herb) return <main className="container py-6">Not found.</main>;

  const details = normalizeHerbDetails(herb);
  const description = details.description || details.effects || "Herb profile";
  const intensityRaw = String(
    herb.intensity ?? herb.intensity_label ?? pick.intensity(herb) ?? ""
  ).toLowerCase();
  const intensityLabel = intensityRaw ? titleCase(intensityRaw) : "";
  const intensityTone = intensityRaw.includes("strong")
    ? "border-rose-400/40 bg-rose-500/15 text-rose-100"
    : intensityRaw.includes("moderate")
      ? "border-[rgb(var(--accent))]/40 bg-[rgb(var(--accent))]/15 text-[rgb(var(--fg))]"
      : intensityRaw.includes("mild")
        ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-100"
        : "border-white/15 bg-white/10 text-white/70";

  const safety = cleanLine(herb.safety || pick.safety(herb));
  const therapeutic = cleanLine(herb.therapeutic || pick.therapeutic(herb));
  const sideEffects = pick.sideeffects(herb)
    .map(effect => cleanLine(effect))
    .filter(Boolean);
  const toxicity = cleanLine(herb.toxicity || pick.toxicity(herb));
  const toxicityLd50 = cleanLine(
    (herb.toxicity_ld50 as string) ||
      (herb as any).toxicityld50 ||
      (herb as any).toxicityLD50 ||
      pick.toxicity_ld50(herb)
  );
  const mechanism = cleanLine(herb.mechanism || pick.mechanism(herb));
  const pharmacology = cleanLine(
    (herb as any).pharmacology ||
      (herb as any).pharmacokinetics ||
      ""
  );

  const hasSafetyExtras = Boolean(
    safety || therapeutic || toxicity || toxicityLd50 || (sideEffects && sideEffects.length > 0)
  );
  const hasMechanism = Boolean(mechanism || pharmacology);

  return (
    <>
      <Meta
        title={`${herb.common || herb.scientific} — The Hippie Scientist`}
        description={description}
        path={`/herb/${slug}`}
        pageType="article"
        image={`/og/${herb.slug || slug}.png`}
      />
      <main className="container py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <article className="rounded-3xl border border-white/10 bg-[rgb(var(--card))]/95 p-6 shadow-lg shadow-black/30 backdrop-blur">
            <header className="flex flex-col gap-2 border-b border-white/10 pb-4">
              <h1 className="text-3xl font-semibold text-[rgb(var(--accent))]">
                {herb.common || herb.scientific}
              </h1>
              {hasVal(herb.scientific) && (
                <p className="italic text-white/70">{herb.scientific}</p>
              )}
              {intensityLabel && (
                <span className={`mt-1 inline-flex items-center rounded-full px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em] ${intensityTone}`}>
                  Intensity: {intensityLabel}
                </span>
              )}
            </header>

            <div className="mt-4 flex flex-wrap gap-2 text-sm text-white/70">
              <Button
                variant="ghost"
                data-fav={herb.slug}
                className="px-3 py-1 text-white/70 hover:text-white"
                onClick={() => {
                  toast("Added to favorites ❤️");
                }}
              >
                ★ Favorite
              </Button>
              <Button
                variant="ghost"
                data-compare={herb.slug}
                className="px-3 py-1 text-white/70 hover:text-white"
                onClick={() => {
                  toast("Added to compare list 🔄");
                }}
              >
                ⇄ Compare
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1 text-white/70 hover:text-white"
                onClick={() =>
                  navigator.share?.({
                    title: herb.common || herb.scientific,
                    url: typeof window !== "undefined" ? window.location.href : undefined,
                  })
                }
              >
                ↗ Share
              </Button>
            </div>

            <div className="mt-6 space-y-5">
              <HerbDetails herb={herb} />
            </div>
          </article>

          {hasSafetyExtras && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm shadow-sm">
              <h2 className="text-lg font-semibold text-white/90">Safety Notes</h2>
              <div className="mt-3 space-y-3 text-sm text-white/80">
                {safety && <p>{safety}</p>}
                {therapeutic && (
                  <p>
                    <strong className="text-white">Therapeutic uses:</strong> {therapeutic}
                  </p>
                )}
                {sideEffects && sideEffects.length > 0 && (
                  <div>
                    <strong className="text-white">Side effects:</strong>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {sideEffects.map((effect, index) => (
                        <li key={`effect-${index}`}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {toxicity && (
                  <p>
                    <strong className="text-white">Toxicity:</strong> {toxicity}
                  </p>
                )}
                {toxicityLd50 && (
                  <p>
                    <strong className="text-white">LD50:</strong> {toxicityLd50}
                  </p>
                )}
              </div>
            </section>
          )}

          {hasMechanism && (
            <section className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm shadow-sm">
              <h2 className="text-lg font-semibold text-white/90">Mechanism &amp; Pharmacology</h2>
              <div className="mt-3 space-y-3 text-sm text-white/80">
                {mechanism && <p>{mechanism}</p>}
                {pharmacology && <p>{pharmacology}</p>}
              </div>
            </section>
          )}

          <RelatedPosts slug={herb.slug} />

          <div className="text-sm text-white/70">
            <Link to="/database" className="link">
              ← Back to Database
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
