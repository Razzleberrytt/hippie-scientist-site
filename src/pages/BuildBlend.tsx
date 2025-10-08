import { useEffect, useMemo, useState } from "react";
import data from "../data/herbs/herbs.normalized.json";

type Herb = {
  id?: string;
  slug?: string;
  common?: string;
  scientific?: string;
  intensity?: string;
  effects?: string;
  tags?: string[];
  [key: string]: unknown;
};

type RatioMode = "percent" | "grams";

type BlendRatios = Record<RatioMode, number>;

type BlendItem = Herb & {
  key: string;
  displayName: string;
  ratios: BlendRatios;
};

type SavedBlend = {
  id: string;
  name: string;
  createdAt: string;
  items: Array<{
    key: string;
    name: string;
    ratios: BlendRatios;
  }>;
};

const PRESETS: Record<string, string[]> = {
  Relaxation: ["Blue Lotus", "Kava", "Passionflower"],
  Energy: ["Yerba Mate", "Guayusa", "Kola Nut"],
  Lucidity: ["Calea zacatechichi", "Mugwort", "Guayusa"],
  Focus: ["Gotu Kola", "Bacopa monnieri", "Rhodiola rosea"],
};

const RATIO_SETTINGS: Record<RatioMode, { label: string; min: number; max: number; step: number; defaultValue: number }> = {
  percent: {
    label: "%",
    min: 0,
    max: 100,
    step: 1,
    defaultValue: 25,
  },
  grams: {
    label: "g",
    min: 0,
    max: 30,
    step: 0.5,
    defaultValue: 5,
  },
};

const MOOD_KEYWORDS: Record<string, string[]> = {
  Calming: ["calm", "relax", "soothe", "sleep", "anxi", "seren"],
  Uplifting: ["uplift", "energ", "stim", "motivat", "focus", "clarit", "vital"],
  Dreamy: ["dream", "lucid", "vision", "astral", "psychedel", "trance"],
  Grounding: ["ground", "root", "center", "stabil", "earth"],
};

const potencyRank = (herb: Herb) => {
  const intensity = String(herb.intensity ?? "").toLowerCase();
  if (!intensity) return 1;
  if (intensity.includes("strong")) return 3;
  if (intensity.includes("moderate")) return 2;
  return 1;
};

const getHerbKey = (herb: Herb) =>
  (herb.slug as string) || (herb.id as string) || (herb.common as string) || (herb.scientific as string);

const getHerbName = (herb: Herb) => {
  const base = (herb.common || "").trim();
  if (base) return base;
  return (herb.scientific || herb.id || "Unnamed Herb").trim();
};

const dataset: Herb[] = data as Herb[];

export default function BuildBlend() {
  const [query, setQuery] = useState("");
  const [ratioMode, setRatioMode] = useState<RatioMode>("percent");
  const [blend, setBlend] = useState<BlendItem[]>([]);
  const [favorites, setFavorites] = useState<SavedBlend[]>([]);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const saved = JSON.parse(window.localStorage.getItem("savedBlends") ?? "[]") as SavedBlend[] | Array<Record<string, unknown>>;
      if (Array.isArray(saved)) {
        const normalised: SavedBlend[] = saved.map((entry, index) => {
          const baseName = typeof entry === "object" && entry && "name" in entry && typeof entry.name === "string" ? entry.name : `Blend ${index + 1}`;
          const baseItems =
            typeof entry === "object" && entry && "items" in entry && Array.isArray((entry as { items?: unknown }).items)
              ? ((entry as { items?: Array<Record<string, unknown>> }).items ?? [])
              : [];
          return {
            id: (typeof entry === "object" && entry && "id" in entry && typeof entry.id === "string" ? entry.id : `${Date.now()}-${index}`),
            name: baseName,
            createdAt:
              typeof entry === "object" && entry && "createdAt" in entry && typeof entry.createdAt === "string"
                ? entry.createdAt
                : new Date().toISOString(),
            items: baseItems
              .map((item, itemIndex) => {
                if (!item) return null;
                const source = item as Record<string, unknown>;
                const key =
                  typeof source.key === "string"
                    ? source.key
                    : typeof source.slug === "string"
                    ? source.slug
                    : typeof source.id === "string"
                    ? source.id
                    : typeof source.name === "string"
                    ? source.name
                    : typeof source.common === "string"
                    ? source.common
                    : typeof source.scientific === "string"
                    ? source.scientific
                    : undefined;
                const name =
                  typeof source.name === "string"
                    ? source.name
                    : typeof source.common === "string"
                    ? source.common
                    : typeof source.scientific === "string"
                    ? source.scientific
                    : undefined;
                const ratios =
                  typeof source.ratios === "object" && source.ratios !== null
                    ? (source.ratios as Partial<BlendRatios>)
                    : undefined;
                const legacyRatio = typeof source.ratio === "number" ? (source.ratio as number) : undefined;
                if (!key) return null;
                return {
                  key,
                  name: name ?? `Herb ${itemIndex + 1}`,
                  ratios: {
                    percent:
                      typeof ratios?.percent === "number" && Number.isFinite(ratios.percent)
                        ? ratios.percent
                        : typeof legacyRatio === "number"
                        ? legacyRatio
                        : RATIO_SETTINGS.percent.defaultValue,
                    grams:
                      typeof ratios?.grams === "number" && Number.isFinite(ratios.grams)
                        ? ratios.grams
                        : RATIO_SETTINGS.grams.defaultValue,
                  },
                };
              })
              .filter(Boolean) as SavedBlend["items"],
          };
        });
        setFavorites(normalised);
      }
    } catch (error) {
      console.warn("Unable to parse saved blends", error);
    }
  }, []);

  useEffect(() => {
    if (copyState !== "copied") return;
    const timeout = window.setTimeout(() => setCopyState("idle"), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyState]);

  const herbMap = useMemo(() => {
    const map = new Map<string, Herb>();
    dataset.forEach((herb) => {
      const key = getHerbKey(herb);
      if (key) {
        map.set(key, herb);
      }
    });
    return map;
  }, []);

  const availableHerbs = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    return dataset
      .filter((herb) => {
        const key = getHerbKey(herb);
        if (key && blend.some((item) => item.key === key)) {
          return false;
        }
        if (!lowerQuery) return true;
        const haystack = [herb.common, herb.scientific, herb.effects, Array.isArray(herb.tags) ? herb.tags.join(" ") : ""]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        return haystack.includes(lowerQuery);
      })
      .slice(0, 60);
  }, [blend, query]);

  const totalAmount = useMemo(
    () =>
      blend.reduce((total, herb) => {
        const activeValue = herb.ratios[ratioMode];
        return total + (Number.isFinite(activeValue) ? activeValue : 0);
      }, 0),
    [blend, ratioMode],
  );

  const potencyScore = useMemo(() => {
    if (!blend.length) return 0;
    const denominator = totalAmount || 1;
    const raw = blend.reduce((score, herb) => {
      const contribution = herb.ratios[ratioMode];
      return score + potencyRank(herb) * (Number.isFinite(contribution) ? contribution : 0);
    }, 0);
    return Math.round((raw / denominator) * 10) / 10;
  }, [blend, ratioMode, totalAmount]);

  const moodInsight = useMemo(() => {
    if (!blend.length) {
      return {
        headline: "Awaiting your first herb",
        breakdown: "Add herbs to see the vibe of your blend.",
      };
    }
    const totals = Object.keys(MOOD_KEYWORDS).reduce<Record<string, number>>((acc, key) => {
      acc[key] = 0;
      return acc;
    }, {});
    const aggregate = blend.reduce((sum, herb) => {
      const weight = herb.ratios[ratioMode];
      if (!Number.isFinite(weight)) return sum;
      const text = `${herb.effects ?? ""} ${(Array.isArray(herb.tags) ? herb.tags.join(" ") : "")}`.toLowerCase();
      Object.entries(MOOD_KEYWORDS).forEach(([label, cues]) => {
        if (cues.some((cue) => text.includes(cue))) {
          totals[label] += weight;
        }
      });
      return sum + weight;
    }, 0);

    if (aggregate === 0) {
      return {
        headline: "Balanced synergy",
        breakdown: "No dominant mood cues detected.",
      };
    }

    const sorted = Object.entries(totals).sort(([, a], [, b]) => b - a);
    const [topLabel, topValue] = sorted[0];
    if (!topValue) {
      return {
        headline: "Balanced synergy",
        breakdown: "No dominant mood cues detected.",
      };
    }
    const breakdown = sorted
      .filter(([, value]) => value > 0)
      .map(([label, value]) => `${label} ${(value / aggregate) * 100 >= 1 ? Math.round((value / aggregate) * 100) : ((value / aggregate) * 100).toFixed(1)}%`)
      .join(" · ");

    return {
      headline: `${topLabel} leaning blend`,
      breakdown,
    };
  }, [blend, ratioMode]);

  const addHerbToBlend = (herb: Herb) => {
    const key = getHerbKey(herb);
    if (!key) return;
    setBlend((current) => {
      if (current.some((item) => item.key === key)) {
        return current;
      }
      const displayName = getHerbName(herb);
      const defaultRatios: BlendRatios = {
        percent: RATIO_SETTINGS.percent.defaultValue,
        grams: RATIO_SETTINGS.grams.defaultValue,
      };
      return [
        ...current,
        {
          ...herb,
          key,
          displayName,
          ratios: defaultRatios,
        },
      ];
    });
  };

  const removeHerb = (key: string) => {
    setBlend((current) => current.filter((item) => item.key !== key));
  };

  const updateRatio = (key: string, value: number) => {
    const settings = RATIO_SETTINGS[ratioMode];
    const safeValue = Number.isFinite(value) ? Math.min(settings.max, Math.max(settings.min, value)) : settings.defaultValue;
    setBlend((current) =>
      current.map((item) => {
        if (item.key !== key) return item;
        return {
          ...item,
          ratios: {
            ...item.ratios,
            [ratioMode]: safeValue,
          },
        };
      }),
    );
  };

  const resetBlend = () => {
    setBlend([]);
    setActivePreset(null);
  };

  const applyPreset = (name: string) => {
    const presetHerbs = PRESETS[name];
    if (!presetHerbs) return;
    const resolved = presetHerbs
      .map((presetName) => dataset.find((herb) => getHerbName(herb).toLowerCase() === presetName.toLowerCase()))
      .filter(Boolean) as Herb[];
    if (!resolved.length) return;
    const percentValue = Math.round((100 / resolved.length) * 10) / 10;
    const gramsValue = Math.round((15 / resolved.length) * 10) / 10;
    setBlend(
      resolved.map((herb) => {
        const key = getHerbKey(herb);
        return {
          ...herb,
          key,
          displayName: getHerbName(herb),
          ratios: {
            percent: percentValue,
            grams: gramsValue,
          },
        };
      }),
    );
    setActivePreset(name);
  };

  const copyFormula = async () => {
    if (!blend.length) return;
    const payload = {
      mode: ratioMode,
      items: blend.map((item) => ({
        name: item.displayName,
        slug: item.slug,
        intensity: item.intensity,
        [ratioMode]: Number(item.ratios[ratioMode].toFixed(ratioMode === "percent" ? 0 : 2)),
      })),
    };
    try {
      const serialised = JSON.stringify(payload, null, 2);
      if (typeof navigator === "undefined" || !navigator.clipboard) {
        if (typeof window !== "undefined") {
          window.prompt("Copy your blend formula", serialised);
        }
      } else {
        await navigator.clipboard.writeText(serialised);
        setCopyState("copied");
      }
    } catch (error) {
      console.error("Clipboard copy failed", error);
    }
  };

  const saveBlend = () => {
    if (typeof window === "undefined" || !blend.length) return;
    const defaultName = activePreset ? `${activePreset} Remix` : `Blend ${favorites.length + 1}`;
    const name = window.prompt("Name your blend", defaultName) ?? "";
    const finalName = name.trim() || defaultName;
    const id = `${Date.now()}`;
    const entry: SavedBlend = {
      id,
      name: finalName,
      createdAt: new Date().toISOString(),
      items: blend.map((item) => ({
        key: item.key,
        name: item.displayName,
        ratios: item.ratios,
      })),
    };
    const updated = [...favorites.filter((fav) => fav.id !== id), entry];
    setFavorites(updated);
    window.localStorage.setItem("savedBlends", JSON.stringify(updated));
  };

  const loadFavorite = (saved: SavedBlend) => {
    const resolvedItems: BlendItem[] = [];
    saved.items.forEach((savedItem) => {
      const herb = herbMap.get(savedItem.key);
      if (!herb) return;
      resolvedItems.push({
        ...herb,
        key: savedItem.key,
        displayName: savedItem.name || getHerbName(herb),
        ratios: {
          percent: savedItem.ratios.percent ?? RATIO_SETTINGS.percent.defaultValue,
          grams: savedItem.ratios.grams ?? RATIO_SETTINGS.grams.defaultValue,
        },
      });
    });
    if (!resolvedItems.length) return;
    setBlend(resolvedItems);
    setActivePreset(null);
  };

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 md:space-y-8 md:px-6">
      <header className="space-y-2">
        <p className="inline-flex items-center gap-2 rounded-full bg-lime-500/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-lime-200">
          Experimental Mixer
        </p>
        <h1 className="bg-gradient-to-r from-lime-300 via-emerald-200 to-cyan-300 bg-clip-text text-3xl font-bold text-transparent md:text-4xl">
          Build a Blend
        </h1>
        <p className="max-w-2xl text-sm text-white/70 md:text-base">
          Curate herbs, adjust their ratios in percentages or grams, and watch potency and mood predictions update instantly.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr] lg:items-start">
        <div className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {Object.keys(PRESETS).map((preset) => (
                <button
                  key={preset}
                  onClick={() => applyPreset(preset)}
                  className={`rounded-full border border-white/10 px-3 py-1 text-xs font-medium transition ${
                    activePreset === preset ? "bg-lime-500/30 text-lime-50" : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {preset}
                </button>
              ))}
              {!!blend.length && (
                <button
                  onClick={resetBlend}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white/70 hover:bg-white/10"
                >
                  Clear
                </button>
              )}
            </div>
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 text-xs font-medium">
              {(Object.keys(RATIO_SETTINGS) as RatioMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setRatioMode(mode)}
                  className={`rounded-full px-3 py-1 transition ${
                    ratioMode === mode ? "bg-lime-500/40 text-slate-950" : "text-white/70"
                  }`}
                >
                  {mode === "percent" ? "% ratios" : "Grams"}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="relative">
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search herbs by name, effects, or vibe"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-lime-400 focus:outline-none focus:ring-2 focus:ring-lime-400/40"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute inset-y-0 right-3 flex items-center text-xs text-white/60 hover:text-white"
                >
                  Clear
                </button>
              )}
            </div>

            {!!availableHerbs.length && (
              <div className="flex flex-wrap gap-2">
                {availableHerbs.map((herb) => (
                  <button
                    key={getHerbKey(herb)}
                    onClick={() => addHerbToBlend(herb)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 transition hover:border-lime-300 hover:bg-lime-400/30 hover:text-white"
                  >
                    {getHerbName(herb)}
                  </button>
                ))}
              </div>
            )}
          </div>

          <section className="space-y-4">
            {!blend.length && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 p-6 text-center text-sm text-white/60">
                Use search or presets to start building your signature blend.
              </div>
            )}
            {blend.map((herb) => {
              const settings = RATIO_SETTINGS[ratioMode];
              const value = Number(herb.ratios[ratioMode].toFixed(ratioMode === "percent" ? 0 : 2));
              return (
                <div
                  key={herb.key}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-black/10 backdrop-blur"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                      <div className="text-sm font-semibold text-white">
                        {herb.displayName}
                      </div>
                      {herb.intensity && <p className="text-xs text-white/50">{herb.intensity}</p>}
                      {herb.effects && <p className="text-xs text-white/60">{herb.effects}</p>}
                    </div>
                    <button
                      onClick={() => removeHerb(herb.key)}
                      className="self-start rounded-full border border-white/10 px-2 py-1 text-xs text-white/60 transition hover:border-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="mt-4 space-y-3">
                    <input
                      type="range"
                      min={settings.min}
                      max={settings.max}
                      step={settings.step}
                      value={value}
                      onChange={(event) => updateRatio(herb.key, Number(event.target.value))}
                      className="w-full accent-lime-400"
                    />
                    <div className="flex items-center justify-between text-xs text-white/70">
                      <div>
                        {settings.min}
                        {settings.label}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={value}
                          onChange={(event) => updateRatio(herb.key, Number(event.target.value))}
                          className="w-16 rounded-lg border border-white/10 bg-white/10 px-2 py-1 text-right text-xs text-white focus:border-lime-300 focus:outline-none"
                        />
                        <span className="font-medium text-white">{settings.label}</span>
                      </div>
                      <div>
                        {settings.max}
                        {settings.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/10 via-white/5 to-transparent p-5 shadow-lg shadow-black/20">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Blend telemetry</h2>
            <div className="mt-4 space-y-3 text-sm text-white/80">
              <div className="flex items-center justify-between">
                <span>Total herbs</span>
                <span className="font-semibold text-white">{blend.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Total {ratioMode === "percent" ? "ratio" : "weight"}</span>
                <span className="font-semibold text-white">
                  {ratioMode === "percent"
                    ? `${totalAmount.toFixed(0)}%`
                    : `${totalAmount.toFixed(1)} g`}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>Potency score</span>
                <span className="font-semibold text-white">{potencyScore.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-5 rounded-xl bg-white/5 p-4 text-sm text-white/80">
              <p className="text-xs uppercase tracking-wide text-white/50">Mood projection</p>
              <p className="mt-1 text-base font-semibold text-white">{moodInsight.headline}</p>
              <p className="mt-1 text-xs text-white/60">{moodInsight.breakdown}</p>
            </div>
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <button
                onClick={copyFormula}
                className="flex-1 rounded-full border border-white/10 bg-white/10 px-3 py-2 font-medium text-white transition hover:border-lime-400 hover:bg-lime-400/30 hover:text-white"
                disabled={!blend.length}
              >
                {copyState === "copied" ? "Copied!" : "Copy formula"}
              </button>
              <button
                onClick={saveBlend}
                className="flex-1 rounded-full border border-white/10 bg-lime-500/30 px-3 py-2 font-medium text-white transition hover:bg-lime-400/50"
                disabled={!blend.length}
              >
                Save to favorites
              </button>
            </div>
          </div>

          {!!favorites.length && (
            <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-white/70">Favorites</h2>
              <ul className="space-y-3">
                {favorites.map((fav) => (
                  <li key={fav.id} className="rounded-xl border border-white/10 bg-white/5 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <p className="font-semibold text-white">{fav.name}</p>
                        <p className="text-xs text-white/50">
                          {new Date(fav.createdAt).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                      <button
                        onClick={() => loadFavorite(fav)}
                        className="rounded-full border border-white/10 px-3 py-1 text-xs font-medium text-white transition hover:border-lime-300 hover:bg-lime-400/30"
                      >
                        Load
                      </button>
                    </div>
                    <p className="mt-2 text-xs text-white/60">
                      {fav.items.length} herbs · {ratioMode === "percent" ? "%" : "g"} ready
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}
