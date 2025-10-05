import React from "react";
import { Link } from "react-router-dom";
import { SEED_HERBS } from "../data/seedHerbs";
import { slugify } from "../lib/slug";
export default function HerbIndex() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold">Herb Index</h1>
      <ul className="mt-6 list-disc pl-5">
        {SEED_HERBS.map(h => (
          <li key={h.commonName}>
            <Link className="underline" to={`/herb/${slugify(h.commonName)}`}>
              {h.commonName} <span className="opacity-70 italic">({h.latinName})</span>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
