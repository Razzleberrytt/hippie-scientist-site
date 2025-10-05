import React, { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { SEED_HERBS } from "../data/seedHerbs";
import { slugify } from "../lib/slug";
export default function HerbDetail() {
  const { slug } = useParams();
  const herb = useMemo(() => SEED_HERBS.find(h => slugify(h.commonName) === slug), [slug]);
  if (!herb) return <main className="mx-auto max-w-3xl px-4 py-8"><h1>Not found</h1><p><Link className="underline" to="/herb-index">← Back</Link></p></main>;
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p><Link className="underline" to="/herb-index">← Back to Herb Index</Link></p>
      <h1 className="mt-3 text-3xl font-bold">{herb.commonName} <span className="text-lg italic opacity-70">({herb.latinName})</span></h1>
      {herb.mechanism && <section className="mt-6"><h2 className="text-xl font-semibold">Mechanism</h2><p className="mt-2">{herb.mechanism}</p></section>}
      {herb.compounds && <section className="mt-6"><h2 className="text-xl font-semibold">Key Compounds</h2><ul className="list-disc pl-5 mt-2">{herb.compounds.map(c => <li key={c}>{c}</li>)}</ul></section>}
      {herb.traditionalUses && <section className="mt-6"><h2 className="text-xl font-semibold">Traditional Uses</h2><p className="mt-2">{herb.traditionalUses}</p></section>}
      {herb.safety && <section className="mt-6"><h2 className="text-xl font-semibold">Safety & Interactions</h2><p className="mt-2">{herb.safety}</p></section>}
      {herb.legal && <section className="mt-6"><h2 className="text-xl font-semibold">Legal & Availability</h2><p className="mt-2">{herb.legal}</p></section>}
      <section className="mt-6"><h2 className="text-xl font-semibold">Related</h2>
        <p className="mt-2">
          {herb.commonName === "Kanna" ? <Link className="underline" to="/herb/blue-lotus">Blue Lotus</Link> : <Link className="underline" to="/herb/kanna">Kanna</Link>}
        </p>
      </section>
    </main>
  );
}
