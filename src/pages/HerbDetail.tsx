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
    <section
      className="card p-5 backdrop-blur"
      style={{ background: "color-mix(in oklab, var(--surface-c) 92%, transparent 8%)" }}
    >
      <h2 className="text-lg font-semibold" style={{ color: "var(--text-c)" }}>
        Related Posts
      </h2>
      <ul className="mt-3 space-y-3">
        {posts.map(p => (
          <li key={p.slug} className="text-sm" style={{ color: "var(--muted-c)" }}>
            <Link
              to={`/blog/${p.slug}`}
              className="link"
              style={{ color: "var(--accent)" }}
            >
              {p.title}
            </Link>
            {p.date && (
              <p className="text-xs" style={{ color: "color-mix(in oklab, var(--muted-c) 75%, transparent 25%)" }}>
                {new Date(p.date).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </p>
            )}
            {p.description && (
              <p className="text-xs" style={{ color: "color-mix(in oklab, var(--muted-c) 85%, transparent 15%)" }}>
                {p.description}
              </p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 text-sm">
        <Link to="/blog" className="link" style={{ color: "var(--accent)" }}>
          View all posts →
        </Link>
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
  const intensityLevel = herb.intensityLevel || null;
  const intensityLabel = herb.intensityLabel
    || (intensityLevel ? titleCase(intensityLevel) : 'Unknown');
  const intensityStyle = (() => {
    switch (intensityLevel) {
      case 'strong':
        return {
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(248, 113, 113, 0.45)',
          color: '#ffdada',
        };
      case 'moderate':
        return {
          background: 'color-mix(in oklab, var(--accent) 18%, var(--surface-c) 82%)',
          border: '1px solid color-mix(in oklab, var(--accent), white 25%)',
          color: 'color-mix(in oklab, var(--accent) 20%, var(--text-c) 80%)',
        };
      case 'mild':
        return {
          background: 'rgba(34, 197, 94, 0.15)',
          border: '1px solid rgba(52, 211, 153, 0.45)',
          color: '#defce7',
        };
      case 'variable':
        return {
          background: 'rgba(56, 189, 248, 0.14)',
          border: '1px solid rgba(56, 189, 248, 0.35)',
          color: '#d6f3ff',
        };
      case 'unknown':
      default:
        return {
          background: 'color-mix(in oklab, var(--surface-c) 92%, transparent 8%)',
          border: '1px solid color-mix(in oklab, var(--border-c) 80%, transparent 20%)',
          color: 'var(--muted-c)',
        };
    }
  })();

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
        image={herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png')}
        og={{
          image: herb.og || (herb.slug ? `/og/herb/${herb.slug}.png` : '/og/default.png'),
        }}
      />
      <main className="container py-6">
        <div className="mx-auto flex max-w-3xl flex-col gap-6">
          <article
            className="card p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)] backdrop-blur"
            style={{ background: "color-mix(in oklab, var(--surface-c) 94%, transparent 6%)" }}
          >
            <header className="flex flex-col gap-2 pb-4" style={{ borderBottom: "1px solid var(--border-c)" }}>
              <h1 className="text-3xl font-semibold" style={{ color: "var(--accent)" }}>
                {herb.common || herb.scientific}
              </h1>
              {hasVal(herb.scientific) && (
                <p className="italic" style={{ color: "var(--muted-c)" }}>
                  {herb.scientific}
                </p>
              )}
              {intensityLabel && (
                <span
                  className="chip hover-glow focus-glow mt-1 inline-flex items-center px-3 py-1 text-[0.7rem] font-semibold uppercase tracking-[0.18em]"
                  style={intensityStyle}
                >
                  Intensity: {intensityLabel}
                </span>
              )}
            </header>

            <div className="mt-4 flex flex-wrap gap-2 text-sm" style={{ color: "var(--muted-c)" }}>
              <Button
                variant="ghost"
                data-fav={herb.slug}
                className="px-3 py-1"
                style={{ color: "inherit" }}
                onClick={() => {
                  toast("Added to favorites ❤️");
                }}
              >
                ★ Favorite
              </Button>
              <Button
                variant="ghost"
                data-compare={herb.slug}
                className="px-3 py-1"
                style={{ color: "inherit" }}
                onClick={() => {
                  toast("Added to compare list 🔄");
                }}
              >
                ⇄ Compare
              </Button>
              <Button
                variant="ghost"
                className="px-3 py-1"
                style={{ color: "inherit" }}
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

            <div className="mt-6 space-y-5" style={{ color: "var(--text-c)" }}>
              <HerbDetails herb={herb} />
            </div>
          </article>

          {hasSafetyExtras && (
            <section
              className="card p-5 backdrop-blur-sm shadow-sm"
              style={{ background: "color-mix(in oklab, var(--surface-c) 92%, transparent 8%)" }}
            >
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-c)" }}>
                Safety Notes
              </h2>
              <div className="mt-3 space-y-3 text-sm" style={{ color: "var(--muted-c)" }}>
                {safety && <p>{safety}</p>}
                {therapeutic && (
                  <p>
                    <strong style={{ color: "var(--text-c)" }}>Therapeutic uses:</strong> {therapeutic}
                  </p>
                )}
                {sideEffects && sideEffects.length > 0 && (
                  <div>
                    <strong style={{ color: "var(--text-c)" }}>Side effects:</strong>
                    <ul className="mt-1 list-disc space-y-1 pl-5">
                      {sideEffects.map((effect, index) => (
                        <li key={`effect-${index}`}>{effect}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {toxicity && (
                  <p>
                    <strong style={{ color: "var(--text-c)" }}>Toxicity:</strong> {toxicity}
                  </p>
                )}
                {toxicityLd50 && (
                  <p>
                    <strong style={{ color: "var(--text-c)" }}>LD50:</strong> {toxicityLd50}
                  </p>
                )}
              </div>
            </section>
          )}

          {hasMechanism && (
            <section
              className="card p-5 backdrop-blur-sm shadow-sm"
              style={{ background: "color-mix(in oklab, var(--surface-c) 92%, transparent 8%)" }}
            >
              <h2 className="text-lg font-semibold" style={{ color: "var(--text-c)" }}>
                Mechanism &amp; Pharmacology
              </h2>
              <div className="mt-3 space-y-3 text-sm" style={{ color: "var(--muted-c)" }}>
                {mechanism && <p>{mechanism}</p>}
                {pharmacology && (
                  <p>
                    <strong style={{ color: "var(--text-c)" }}>Pharmacology:</strong> {pharmacology}
                  </p>
                )}
              </div>
            </section>
          )}

          <RelatedPosts slug={herb.slug} />

          <div className="text-sm" style={{ color: "var(--muted-c)" }}>
            <Link to="/database" className="link" style={{ color: "var(--accent)" }}>
              ← Back to Database
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
