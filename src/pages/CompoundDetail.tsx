import { Link, useParams } from "react-router-dom";
import Meta from "@/components/Meta";
import { decorateCompounds } from "@/lib/compounds";
import { titleCase } from "@/lib/text";

const compounds = decorateCompounds();

type Param = {
  slug?: string;
};

export default function CompoundDetail() {
  const { slug } = useParams<Param>();
  const compound = compounds.find((entry) => entry.slug === slug);

  if (!compound) {
    return (
      <main className="container mx-auto max-w-3xl px-4 py-10 text-white/70">
        <p>Compound not found.</p>
        <p className="mt-4">
          <Link className="underline" to="/compounds">
            ← Back to compounds
          </Link>
        </p>
      </main>
    );
  }

  const title = compound.common || compound.scientific || compound.name || "Compound";
  const description = compound.description || compound.effects || "Compound profile";
  const intensityLabel = compound.intensityLabel || undefined;
  const foundIn = Array.isArray(compound.compounds) ? compound.compounds : [];

  return (
    <>
      <Meta
        title={`${title} — The Hippie Scientist`}
        description={description}
        path={`/compounds/${slug ?? ""}`}
        pageType="article"
      />
      <main className="container mx-auto max-w-3xl px-4 py-10 text-white">
        <article className="space-y-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(0,0,0,.25)] backdrop-blur-xl">
          <header className="space-y-2">
            <h1 className="text-3xl font-semibold text-white">{title}</h1>
            {compound.scientific && compound.common && compound.common !== compound.scientific && (
              <p className="text-white/60">{compound.scientific}</p>
            )}
            {intensityLabel && (
              <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/80">
                Intensity: {intensityLabel}
              </span>
            )}
          </header>

          {compound.description && (
            <p className="text-white/80">{compound.description}</p>
          )}

          {compound.effects && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Mechanism</h2>
              <p className="mt-2 text-white/80">{compound.effects}</p>
            </section>
          )}

          {foundIn.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Found in</h2>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-white/75">
                {foundIn.map((entry) => (
                  <li key={entry}>{titleCase(entry)}</li>
                ))}
              </ul>
            </section>
          )}

          {compound.tags?.length ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/60">Tags</h2>
              <div className="mt-2 flex flex-wrap gap-2">
                {compound.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs text-white/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </section>
          ) : null}
        </article>

        <p className="mt-8 text-white/70">
          <Link className="underline" to="/compounds">
            ← Back to compounds
          </Link>
        </p>
      </main>
    </>
  );
}
