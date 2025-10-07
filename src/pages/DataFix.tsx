import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import data from "../data/herbs/herbs.normalized.json";
import { useDrafts } from "../lib/useDrafts";

type HerbRow = (typeof data)[number];

type KeyField = "effects" | "description" | "legalstatus" | "compounds" | "tags";

const KEY_FIELDS: KeyField[] = ["effects", "description", "legalstatus", "compounds", "tags"];

const hasVal = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean).length > 0;
  }
  if (typeof value === "string") {
    return value.trim().length > 0;
  }
  return value != null && String(value).trim().length > 0;
};

const toList = (input: string) =>
  String(input ?? "")
    .split(/[,;|]/)
    .map(token => token.trim())
    .filter(Boolean);

const joinList = (values: string[] = []) => values.filter(Boolean).join(", ");

const tidy = (input: string) => {
  const raw = String(input ?? "")
    .replace(/[;]+/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
  if (!raw) return "";
  return raw[0].toUpperCase() + raw.slice(1);
};

export default function DataFix() {
  const { drafts, setField, clearSlug, resetAll } = useDrafts();
  const [index, setIndex] = useState(0);
  const [onlyMissing, setOnlyMissing] = useState<KeyField[]>([...KEY_FIELDS]);

  const candidates = useMemo(() => {
    return data
      .filter(row =>
        onlyMissing.some(field => {
          const draftValue = drafts[row.slug]?.[field];
          const valueToCheck = draftValue ?? row[field as keyof HerbRow];
          if (field === "compounds" || field === "tags") {
            if (draftValue) {
              return toList(draftValue).length === 0;
            }
          }
          return !hasVal(valueToCheck);
        }),
      )
      .sort((a, b) =>
        String(a.common || a.scientific || "").localeCompare(String(b.common || b.scientific || "")),
      );
  }, [drafts, onlyMissing]);

  const total = candidates.length;
  const row = candidates[index] ?? null;
  const missing = useMemo(() => {
    if (!row) return [] as KeyField[];
    return KEY_FIELDS.filter(field => {
      const draftValue = drafts[row.slug]?.[field];
      if (field === "compounds" || field === "tags") {
        if (draftValue) {
          return toList(draftValue).length === 0;
        }
      }
      const current = draftValue ?? row[field as keyof HerbRow];
      return !hasVal(current);
    }) as KeyField[];
  }, [drafts, row]);

  useEffect(() => {
    if (index >= total) {
      setIndex(Math.max(0, total - 1));
    }
  }, [index, total]);

  const applyDraftsToData = () => {
    return data.map(item => {
      const draft = drafts[item.slug];
      if (!draft) return item;
      const merged: HerbRow = { ...item };
      for (const [field, value] of Object.entries(draft)) {
        if (field === "compounds" || field === "tags") {
          merged[field as keyof HerbRow] = toList(String(value)) as HerbRow[KeyField];
        } else {
          merged[field as keyof HerbRow] = tidy(String(value)) as HerbRow[KeyField];
        }
      }
      return merged;
    });
  };

  const exportPatched = () => {
    const merged = applyDraftsToData();
    const blob = new Blob([JSON.stringify(merged, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "herbs_patched.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const next = useCallback(() => {
    setIndex(i => {
      if (total === 0) return 0;
      return Math.min(i + 1, total - 1);
    });
  }, [total]);

  const prev = useCallback(() => {
    setIndex(i => Math.max(i - 1, 0));
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (event.key === "ArrowRight" || event.key.toLowerCase() === "j") {
        event.preventDefault();
        next();
      }
      if (event.key === "ArrowLeft" || event.key.toLowerCase() === "k") {
        event.preventDefault();
        prev();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <main className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold">🛠️ Fix Missing Data</h1>
        <div className="flex flex-wrap gap-2 text-sm">
          <button
            onClick={exportPatched}
            className="px-3 py-1 rounded-md bg-green-700 hover:bg-green-600 text-white transition"
          >
            💾 Export Patched JSON
          </button>
          <button
            onClick={resetAll}
            className="px-3 py-1 rounded-md border border-gray-600 hover:bg-gray-800 transition"
          >
            Reset Drafts
          </button>
        </div>
      </div>

      <div className="text-sm opacity-80 space-y-2">
        <p>
          Total with gaps: <strong>{total}</strong>. You’re on <strong>{Math.min(index + 1, total)}</strong> / {total || 0}.
        </p>
        <p className="flex flex-wrap items-center gap-2">
          Missing fields considered:
          {KEY_FIELDS.map(field => (
            <label key={field} className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={onlyMissing.includes(field)}
                onChange={event => {
                  const checked = event.target.checked;
                  setIndex(0);
                  setOnlyMissing(prev => {
                    if (checked) {
                      return [...new Set([...prev, field])];
                    }
                    return prev.filter(item => item !== field);
                  });
                }}
              />
              {field}
            </label>
          ))}
        </p>
      </div>

      {!row ? (
        <div className="border border-gray-700 rounded-xl p-6 text-sm">
          <p>
            🎉 No rows match the current filter. Try unchecking some fields or head back to the{" "}
            <Link to="/data-report" className="underline">Data Report</Link>.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <section className="border border-gray-700 rounded-xl p-4 space-y-3">
            <div>
              <h2 className="text-lg font-semibold">{row.common || row.scientific}</h2>
              <p className="italic opacity-80">{row.scientific}</p>
            </div>
            <div className="text-sm space-y-1">
              <p>
                <strong>Slug:</strong> {row.slug}
              </p>
              <p>
                <strong>Category:</strong> {row.category}
              </p>
              <p>
                <strong>Region:</strong> {row.region}
              </p>
              <p>
                <strong>Tags:</strong> {joinList((row.tags as string[]) || [])}
              </p>
              <p className="mt-2">
                <strong>Description:</strong> {row.description || <em className="opacity-70">— missing —</em>}
              </p>
              <p>
                <strong>Effects:</strong> {row.effects || <em className="opacity-70">— missing —</em>}
              </p>
              <p>
                <strong>Legal:</strong> {row.legalstatus || <em className="opacity-70">— missing —</em>}
              </p>
              <p>
                <strong>Compounds:</strong> {joinList((row.compounds as string[]) || []) || <em className="opacity-70">— missing —</em>}
              </p>
            </div>
          </section>

          <section className="border border-gray-700 rounded-xl p-4 space-y-4">
            <div>
              <h3 className="text-base font-semibold">Fill the gaps</h3>
              <p className="text-xs opacity-70">Only missing key fields shown below. Lists accept comma/semicolon separators.</p>
            </div>
            <div className="space-y-3">
              {missing.includes("description") && (
                <div>
                  <label className="text-xs font-semibold block mb-1" htmlFor="description-input">
                    description
                  </label>
                  <textarea
                    id="description-input"
                    value={drafts[row.slug]?.description ?? ""}
                    onChange={event => setField(row.slug, "description", event.target.value)}
                    rows={3}
                    className="w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700"
                    placeholder={`${row.common || row.scientific} is a herb recorded in the database. Category: ${row.category}. Native/used in: ${row.region}.`}
                  />
                </div>
              )}
              {missing.includes("effects") && (
                <div>
                  <label className="text-xs font-semibold block mb-1" htmlFor="effects-input">
                    effects
                  </label>
                  <textarea
                    id="effects-input"
                    value={drafts[row.slug]?.effects ?? ""}
                    onChange={event => setField(row.slug, "effects", event.target.value)}
                    rows={2}
                    className="w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700"
                    placeholder="Relaxation, mild stimulation, cognitive support…"
                  />
                </div>
              )}
              {missing.includes("legalstatus") && (
                <div>
                  <label className="text-xs font-semibold block mb-1" htmlFor="legalstatus-input">
                    legalstatus
                  </label>
                  <input
                    id="legalstatus-input"
                    value={drafts[row.slug]?.legalstatus ?? ""}
                    onChange={event => setField(row.slug, "legalstatus", event.target.value)}
                    className="w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700"
                    placeholder="Legal / Unregulated in many regions"
                  />
                </div>
              )}
              {missing.includes("compounds") && (
                <div>
                  <label className="text-xs font-semibold block mb-1" htmlFor="compounds-input">
                    compounds (comma-separated)
                  </label>
                  <input
                    id="compounds-input"
                    value={drafts[row.slug]?.compounds ?? ""}
                    onChange={event => setField(row.slug, "compounds", event.target.value)}
                    className="w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700"
                    placeholder="DMT, NMT, thujone…"
                  />
                </div>
              )}
              {missing.includes("tags") && (
                <div>
                  <label className="text-xs font-semibold block mb-1" htmlFor="tags-input">
                    tags (comma-separated)
                  </label>
                  <input
                    id="tags-input"
                    value={drafts[row.slug]?.tags ?? ""}
                    onChange={event => setField(row.slug, "tags", event.target.value)}
                    className="w-full text-sm p-2 rounded-md bg-gray-800 border border-gray-700"
                    placeholder="psychedelic, dream, adaptogen…"
                  />
                </div>
              )}
            </div>

            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div className="flex gap-2">
                <button onClick={prev} className="px-3 py-1 border border-gray-600 rounded-md">
                  ← Prev (k)
                </button>
                <button onClick={next} className="px-3 py-1 border border-gray-600 rounded-md">
                  Next (j) →
                </button>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    clearSlug(row.slug);
                  }}
                  className="px-3 py-1 border border-gray-600 rounded-md"
                >
                  Clear draft
                </button>
                <button
                  onClick={() => {
                    next();
                  }}
                  className="px-3 py-1 rounded-md bg-green-700 hover:bg-green-600 text-white transition"
                >
                  Apply &amp; Next
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      <div className="text-sm">
        <Link to="/data-report" className="underline">
          ← Back to Data Report
        </Link>
      </div>
    </main>
  );
}
