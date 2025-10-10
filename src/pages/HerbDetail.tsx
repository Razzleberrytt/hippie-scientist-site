import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import data from "../data/herbs/herbs.normalized.json";
import Collapse from "../components/ui/Collapse";
import Card from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { chipClassFor } from "../lib/tags";
import Meta from "../components/Meta";
import { relatedPostsForHerb } from "../lib/relatedPosts";

const hasVal = (v: any) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? "").trim();
const titleCase = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

type Herb = (typeof data)[number];

type Param = {
  slug?: string;
};

function RelatedPosts({ herb }: { herb: Herb }) {
  const posts = relatedPostsForHerb(herb);
  if (!posts.length) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-sm p-5 mt-8">
      <h2 className="text-lg font-semibold text-white/90 mb-3">Related Posts</h2>
      <ul className="space-y-3">
        {posts.map((p, i) => (
          <li key={i}>
            <a href={`/blog/${p.slug}`} className="underline text-cyan-300 hover:text-cyan-200">
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
            <p className="text-sm text-white/70 line-clamp-2">{p.description}</p>
          </li>
        ))}
      </ul>
      <div className="mt-3 text-sm">
        <a href="/blog" className="underline text-cyan-300 hover:text-cyan-200">
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

  const description =
    (herb.description && String(herb.description).trim()) ||
    (herb.effects && String(herb.effects).trim()) ||
    "Herb profile";

  const intensity = String(herb.intensity || "").toLowerCase();
  const intensityClass = intensity.includes("strong")
    ? "chip chip--warn font-semibold uppercase tracking-wide"
    : intensity.includes("moderate")
    ? "chip chip--stim font-semibold uppercase tracking-wide"
    : intensity.includes("mild")
    ? "chip chip--adapt font-semibold uppercase tracking-wide"
    : "";

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
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:gap-6">
        <Card className="relative space-y-4 p-5 md:p-6">
          <header className="stack">
            <h1 className="h1 text-lime-300">{herb.common || herb.scientific}</h1>
            {hasVal(herb.scientific) && <p className="italic small text-white/65">{herb.scientific}</p>}
            {hasVal(intensity) && (
              <span className={intensityClass || "chip"}>INTENSITY: {titleCase(intensity)}</span>
            )}
          </header>

          <div className="flex flex-wrap gap-2 text-sm text-sub">
            <Button
              variant="ghost"
              data-fav={herb.slug}
              className="px-3 py-1 text-sub hover:text-text"
              onClick={() => {
                toast("Added to favorites ❤️");
              }}
            >
              ★ Favorite
            </Button>
            <Button
              variant="ghost"
              data-compare={herb.slug}
              className="px-3 py-1 text-sub hover:text-text"
              onClick={() => {
                toast("Added to compare list 🔄");
              }}
            >
              ⇄ Compare
            </Button>
            <Button
              variant="ghost"
              className="px-3 py-1 text-sub hover:text-text"
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
        </Card>

        <section className="section-hero">
          <h2 className="h2">Overview</h2>
        </section>

        {hasVal(herb.legalstatus) && (
          <Card className="space-y-2 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-sub">Legal</h2>
            <p className="text-sm text-text/90">{herb.legalstatus}</p>
            {hasVal(herb.legalnotes) && <p className="text-xs text-sub/80">{herb.legalnotes}</p>}
          </Card>
        )}

        {(hasVal(herb.region) || hasVal(herb.regiontags)) && (
          <Card className="space-y-2 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-sub">Region</h2>
            <p className="text-sm text-text/90">{herb.region ? herb.region : (herb.regiontags || []).join(", ")}</p>
          </Card>
        )}

        {hasVal(herb.description) && (
          <Card className="p-5">
            <Collapse title="Description" defaultOpen>
              <p className="leading-relaxed text-sub">{herb.description}</p>
            </Collapse>
          </Card>
        )}

        {hasVal(herb.effects) && (
          <Card className="p-5">
            <Collapse title="Effects" defaultOpen>
              <p className="leading-relaxed text-sub">{herb.effects}</p>
            </Collapse>
          </Card>
        )}

        {(hasVal(herb.compounds) || hasVal(herb.tags) || hasVal(herb.preparations)) && (
          <Card className="space-y-4 p-5">
            <div className="stack">
              {hasVal(herb.compounds) && (
                <div>
                  <div className="section-title mb-1">Active Compounds</div>
                  <div className="cluster">
                    {(herb.compounds || []).filter(Boolean).map((c, i) => (
                      <span key={i} className="chip">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasVal(herb.preparations) && (
                <div>
                  <div className="section-title mb-1">Preparations</div>
                  <div className="cluster">
                    {(herb.preparations || []).filter(Boolean).map((p, i) => (
                      <span key={i} className="chip">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {hasVal(herb.tags) && (
                <div>
                  <div className="section-title mb-1">Tags</div>
                  <div className="cluster">
                    {(herb.tags || []).filter(Boolean).map((t, i) => (
                      <span key={i} className={chipClassFor(t)}>
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {(hasVal(herb.safety) || hasVal(herb.contraindications) || hasVal(herb.interactions)) && (
          <Card className="p-5">
            <Collapse title="Safety & Contraindications">
              <div className="space-y-4 text-sub">
                {hasVal(herb.safety) && <p>{herb.safety}</p>}
                {hasVal(herb.contraindications) && (
                  <div>
                    <h4 className="text-sm font-semibold text-text">Contraindications</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {(herb.contraindications || []).map((x: string, i: number) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {hasVal(herb.interactions) && (
                  <div>
                    <h4 className="text-sm font-semibold text-text">Interactions</h4>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {(herb.interactions || []).map((x: string, i: number) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Collapse>
          </Card>
        )}

        {(hasVal(herb.mechanism) || hasVal(herb.pharmacology)) && (
          <Card className="p-5">
            <Collapse title="Mechanism & Pharmacology">
              <div className="space-y-3 text-sub">
                {hasVal(herb.mechanism) && <p>{herb.mechanism}</p>}
                {hasVal(herb.pharmacology) && <p>{herb.pharmacology}</p>}
              </div>
            </Collapse>
          </Card>
        )}

        {hasVal(herb.sources) && (
          <Card className="p-5">
            <Collapse title="Sources">
              <ul className="list-disc space-y-1 pl-5 text-sub">
                {(herb.sources || []).map((s: string, i: number) => (
                  <li key={i}>
                    {/^(https?:\/\/)/i.test(s) ? (
                      <a className="underline decoration-dotted underline-offset-4" href={s} target="_blank" rel="noreferrer">
                        {s}
                      </a>
                    ) : (
                      s
                    )}
                  </li>
                ))}
              </ul>
            </Collapse>
          </Card>
        )}

        <RelatedPosts herb={herb} />

        <div className="text-sm text-sub">
          <Link to="/database" className="underline decoration-dotted underline-offset-4">
            ← Back to Database
          </Link>
        </div>
      </div>
      </main>
    </>
  );
}
