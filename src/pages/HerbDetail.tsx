import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import data from "../data/herbs/herbs.normalized.json";
import Collapse from "../components/ui/Collapse";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { Button } from "../components/ui/Button";

const hasVal = (v: any) =>
  Array.isArray(v) ? v.filter(Boolean).length > 0 : !!String(v ?? "").trim();
const titleCase = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : "");

type Herb = (typeof data)[number];

type Param = {
  slug?: string;
};

export default function HerbDetail() {
  const { slug } = useParams<Param>();
  const herb = data.find((h: Herb) => h.slug === slug);

  if (!herb) return <main className="container py-6">Not found.</main>;

  const intensity = String(herb.intensity || "").toLowerCase();
  const intensityClass = intensity.includes("strong")
    ? "bg-red-600/20 text-red-200"
    : intensity.includes("moderate")
    ? "bg-yellow-600/20 text-yellow-100"
    : intensity.includes("mild")
    ? "bg-green-700/20 text-green-200"
    : "bg-white/10 text-white/80";

  const chips = (arr?: string[]) =>
    (arr || [])
      .filter(Boolean)
      .map((x, i) => (
        <Badge key={i}>{x}</Badge>
      ));

  return (
    <main className="container py-6">
      <div className="mx-auto flex max-w-3xl flex-col gap-4 md:gap-6">
        <Card className="relative space-y-4 p-5 md:p-6">
          <header className="space-y-2">
            <p className="text-xs uppercase tracking-[0.3em] text-sub">Profile</p>
            <h1 className="text-3xl font-semibold text-brand-lime/90 md:text-4xl">
              {herb.common || herb.scientific}
            </h1>
            {hasVal(herb.scientific) && <p className="italic text-sub">{herb.scientific}</p>}
            {hasVal(intensity) && (
              <span className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${intensityClass}`}>
                INTENSITY: {titleCase(intensity)}
              </span>
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
            {hasVal(herb.compounds) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Active Compounds</h3>
                <div className="flex flex-wrap gap-1.5">{chips(herb.compounds)}</div>
              </div>
            )}
            {hasVal(herb.preparations) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Preparations</h3>
                <div className="flex flex-wrap gap-1.5">{chips(herb.preparations)}</div>
              </div>
            )}
            {hasVal(herb.tags) && (
              <div className="space-y-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-sub">Tags</h3>
                <div className="flex flex-wrap gap-1.5">{chips(herb.tags)}</div>
              </div>
            )}
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

        <div className="text-sm text-sub">
          <Link to="/database" className="underline decoration-dotted underline-offset-4">
            ← Back to Database
          </Link>
        </div>
      </div>
    </main>
  );
}
