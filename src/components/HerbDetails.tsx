import React from "react";
import type { Herb } from "../types";
import { pick } from "../lib/present";
import { cleanLine } from "../lib/pretty";
import { splitField } from "../utils/herb";

const normalizeText = (value: unknown): string => {
  if (Array.isArray(value)) {
    const joined = normalizeList(value).join(", ");
    return joined;
  }
  if (typeof value === "string") {
    const cleaned = cleanLine(value);
    if (cleaned) return cleaned;
  }
  if (typeof value === "number") {
    return String(value);
  }
  if (value && typeof value === "object") {
    const values = Object.values(value as Record<string, unknown>);
    const text = normalizeList(values).join(", ");
    if (text) return text;
  }
  return "";
};

const normalizeList = (value: unknown): string[] => {
  const results: string[] = [];
  const push = (entry: string) => {
    const cleaned = cleanLine(entry)
      .replace(/^[-•·\u2022\u2023\u25E6\u2043\u2219]+\s*/, "")
      .trim();
    if (cleaned) {
      const key = cleaned.toLowerCase();
      if (!results.some(item => item.toLowerCase() === key)) {
        results.push(cleaned);
      }
    }
  };

  const visit = (input: unknown) => {
    if (!input) return;
    if (Array.isArray(input)) {
      input.forEach(visit);
      return;
    }
    if (typeof input === "string") {
      const normalized = input.replace(/\r?\n+/g, ";").replace(/[•·\u2022\u2023\u25E6\u2043\u2219]+/g, ";");
      const parts = splitField(normalized);
      if (parts.length > 1) {
        parts.forEach(part => visit(part));
      } else {
        push(normalized);
      }
      return;
    }
    if (typeof input === "number") {
      push(String(input));
      return;
    }
    if (input && typeof input === "object") {
      const values = Object.values(input as Record<string, unknown>);
      if (values.length) {
        values.forEach(visit);
      }
      return;
    }
  };

  visit(value);
  return results;
};

const firstText = (...values: unknown[]): string => {
  for (const value of values) {
    const list = normalizeList(value);
    if (list.length) {
      return list.join(", ");
    }
    const text = normalizeText(value);
    if (text) return text;
  }
  return "";
};

const mergeLists = (...values: unknown[]): string[] => {
  const seen = new Set<string>();
  const result: string[] = [];
  values.forEach(value => {
    normalizeList(value).forEach(item => {
      const key = item.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    });
  });
  return result;
};

export function normalizeHerbDetails(herb: Herb) {
  const effects = firstText(herb.effects, pick.effects(herb));
  const description = firstText(herb.description, pick.description(herb));
  const categories = mergeLists(
    herb.categories,
    herb.category,
    herb.subcategory,
    herb.category_label
  );
  const tagLabels = mergeLists(herb.tags, pick.tags(herb));
  const tags = mergeLists(categories, tagLabels);
  const region = firstText(
    herb.region,
    pick.region(herb),
    mergeLists(herb.regiontags).join(", "),
    (herb as any).regionNotes
  );
  const active_compounds = mergeLists(
    herb.active_compounds,
    herb.compounds,
    (herb as any).compoundsDetailed,
    (herb as any).activeconstituents,
    ((herb as any).activeConstituents || []).map((entry: any) => entry?.name)
  );
  const preparation = firstText(
    herb.preparation,
    herb.preparations,
    (herb as any).preparationsText,
    pick.preparations(herb)
  );
  const dosage = firstText(herb.dosage, (herb as any).dosage_notes, pick.dosage(herb));
  const contraindications = firstText(
    herb.contraindications,
    (herb as any).contraindicationsText,
    pick.contraind(herb)
  );
  const interactions = firstText(
    herb.interactions,
    (herb as any).interactionsText,
    (herb as any).drugInteractions,
    pick.interactions(herb)
  );
  const legal = [
    firstText(herb.legal, herb.legalstatus, (herb as any).legalStatus, pick.legalstatus(herb)),
    firstText(herb.legalnotes, (herb as any).legalnotes)
  ]
    .filter(Boolean)
    .join(" — ");
  const sources = mergeLists(herb.sources, pick.sources(herb));

  return {
    effects,
    description,
    categories,
    tags,
    region,
    active_compounds,
    preparation,
    dosage,
    contraindications,
    interactions,
    legal,
    sources,
  };
}

export default function HerbDetails({ herb }: { herb: Herb }) {
  const details = normalizeHerbDetails(herb);
  const rows: Array<[string, React.ReactNode]> = [];

  if (details.effects) rows.push(["Effects", details.effects]);
  if (details.description) rows.push(["Description", details.description]);

  if (details.tags.length) {
    rows.push([
      "Tags",
      (
        <div className="flex flex-wrap gap-2">
          {details.tags.map((t, i) => (
            <span key={i} className="chip hover-glow focus-glow">
              {t}
            </span>
          ))}
        </div>
      ),
    ]);
  }

  if (details.region) rows.push(["Region", details.region]);

  if (details.active_compounds.length)
    rows.push(["Active Compounds", details.active_compounds.join(", ")]);

  if (details.preparation)
    rows.push(["Preparation & Forms", details.preparation]);

  if (details.dosage) rows.push(["Dosage", details.dosage]);

  if (details.contraindications)
    rows.push(["Contraindications", details.contraindications]);

  if (details.interactions)
    rows.push(["Interactions", details.interactions]);

  if (details.legal) rows.push(["Legal", details.legal]);

  if (details.sources.length)
    rows.push([
      "Sources",
      (
        <ul className="ml-5 list-disc space-y-1">
          {details.sources.map((s, i) => (
            <li key={i}>
              {/^(https?:)/i.test(s) ? (
                <a className="link" href={s} target="_blank" rel="noreferrer">
                  {s}
                </a>
              ) : (
                s
              )}
            </li>
          ))}
        </ul>
      ),
    ]);

  if (!rows.length) return null;

  return (
    <dl className="space-y-3">
      {rows.map(([k, v]) => (
        <div key={k}>
          <dt className="font-semibold text-white">{k}:</dt>
          <dd className="text-white/85">{v}</dd>
        </div>
      ))}
    </dl>
  );
}
