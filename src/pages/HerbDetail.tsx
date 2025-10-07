import { useParams, Link } from "react-router-dom";
import data from "../data/herbs/herbs.normalized.json";
import Collapse from "../components/ui/Collapse";
import Chip from "../components/ui/Chip";

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

  if (!herb) return <main className="p-6">Not found.</main>;

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
        <Chip key={i}>{x}</Chip>
      ));

  return (
    <main className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      {/* Header */}
      <header className="bg-black/30 border border-white/10 rounded-2xl p-4 md:p-5 relative">
        <h1 className="text-2xl md:text-3xl font-bold text-lime-300">
          {herb.common || herb.scientific}
        </h1>
        {hasVal(herb.scientific) && (
          <p className="italic opacity-80">{herb.scientific}</p>
        )}
        {hasVal(intensity) && (
          <span
            className={`mt-3 inline-block text-xs px-2 py-1 rounded-full ${intensityClass}`}
          >
            INTENSITY: {titleCase(intensity)}
          </span>
        )}

        {/* Quick actions */}
        <div className="mt-3 flex flex-wrap gap-3 sticky top-3 z-10 bg-black/40 backdrop-blur-sm px-3 py-2 rounded-xl md:static md:bg-transparent md:backdrop-blur-0 md:px-0 md:py-0 md:rounded-none">
          <button data-fav={herb.slug} className="underline opacity-90">
            ★ Favorite
          </button>
          <button data-compare={herb.slug} className="underline opacity-90">
            ⇄ Compare
          </button>
          <button
            onClick={() =>
              navigator.share?.({
                title: herb.common || herb.scientific,
                url:
                  typeof window !== "undefined" ? window.location.href : undefined,
              })
            }
            className="underline opacity-90"
          >
            ↗ Share
          </button>
        </div>
      </header>

      {/* Legal banner */}
      {hasVal(herb.legalstatus) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="font-semibold mb-1">Legal</div>
          <p className="opacity-90">{herb.legalstatus}</p>
          {hasVal(herb.legalnotes) && (
            <p className="mt-1 text-sm opacity-75">{herb.legalnotes}</p>
          )}
        </div>
      )}

      {/* Region */}
      {(hasVal(herb.region) || hasVal(herb.regiontags)) && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-3">
          <div className="font-semibold mb-1">Region</div>
          <p className="opacity-90">
            {herb.region ? herb.region : (herb.regiontags || []).join(", ")}
          </p>
        </div>
      )}

      {/* Description / Effects */}
      {hasVal(herb.description) && (
        <Collapse title="Description" defaultOpen>
          <p className="leading-relaxed">{herb.description}</p>
        </Collapse>
      )}
      {hasVal(herb.effects) && (
        <Collapse title="Effects" defaultOpen>
          <p className="leading-relaxed">{herb.effects}</p>
        </Collapse>
      )}

      {/* Compounds / Tags / Preparations */}
      {(hasVal(herb.compounds) || hasVal(herb.tags) || hasVal(herb.preparations)) && (
        <section className="grid gap-3">
          {hasVal(herb.compounds) && (
            <div>
              <div className="font-semibold mb-1">Active Compounds</div>
              <div>{chips(herb.compounds)}</div>
            </div>
          )}
          {hasVal(herb.preparations) && (
            <div>
              <div className="font-semibold mb-1">Preparations</div>
              <div>{chips(herb.preparations)}</div>
            </div>
          )}
          {hasVal(herb.tags) && (
            <div>
              <div className="font-semibold mb-1">Tags</div>
              <div>{chips(herb.tags)}</div>
            </div>
          )}
        </section>
      )}

      {/* Safety / Contraindications / Interactions */}
      {(hasVal(herb.safety) ||
        hasVal(herb.contraindications) ||
        hasVal(herb.interactions)) && (
        <Collapse title="Safety & Contraindications">
          {hasVal(herb.safety) && <p className="mb-2">{herb.safety}</p>}
          {hasVal(herb.contraindications) && (
            <div className="mb-2">
              <div className="font-semibold">Contraindications</div>
              <ul className="list-disc list-inside opacity-90">
                {(herb.contraindications || []).map((x: string, i: number) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
          {hasVal(herb.interactions) && (
            <div>
              <div className="font-semibold">Interactions</div>
              <ul className="list-disc list-inside opacity-90">
                {(herb.interactions || []).map((x: string, i: number) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </div>
          )}
        </Collapse>
      )}

      {/* Mechanism / Pharmacology (optional) */}
      {(hasVal(herb.mechanism) || hasVal(herb.pharmacology)) && (
        <Collapse title="Mechanism & Pharmacology">
          {hasVal(herb.mechanism) && <p className="mb-2">{herb.mechanism}</p>}
          {hasVal(herb.pharmacology) && <p>{herb.pharmacology}</p>}
        </Collapse>
      )}

      {/* Sources */}
      {hasVal(herb.sources) && (
        <Collapse title="Sources">
          <ul className="list-disc list-inside">
            {(herb.sources || []).map((s: string, i: number) => (
              <li key={i}>
                {/^(https?:\/\/)/i.test(s) ? (
                  <a className="underline" href={s} target="_blank" rel="noreferrer">
                    {s}
                  </a>
                ) : (
                  s
                )}
              </li>
            ))}
          </ul>
        </Collapse>
      )}

      <div className="opacity-70 text-sm">
        <Link to="/database" className="underline">
          ← Back to Database
        </Link>
      </div>
    </main>
  );
}
