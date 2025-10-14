import fs from "fs";
import path from "path";

type Intensity = "MILD" | "MODERATE" | "STRONG";
type Entity = {
  id: string;
  kind: "compound";
  commonName?: string;
  latinName: string;
  summary?: string;
  description?: string;
  tags?: string[];
  intensity?: Intensity;
  regions?: string[];
  sources?: { title: string; url: string }[];
  createdAt?: string;
  updatedAt?: string;
};

const PUB = path.join(process.cwd(), "public", "data");
const OUT = path.join(PUB, "compounds.json");
fs.mkdirSync(PUB, { recursive: true });

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
const today = () => new Date().toISOString().slice(0, 10);

// Load existing JSON if present
let list: Entity[] = [];
try {
  list = JSON.parse(fs.readFileSync(OUT, "utf8")) as Entity[];
} catch {}
const have = new Set(list.map((x) => x.id));

// Curated seed (concise, non-controversial summaries)
const seed: Array<{
  name: string;
  latin?: string;
  tags: string[];
  intensity: Intensity;
  summary: string;
}> = [
  {
    name: "DMT",
    latin: "N,N-Dimethyltryptamine",
    tags: ["tryptamine", "psychedelic"],
    intensity: "STRONG",
    summary: "Short-acting tryptamine; commonly discussed for intense visual effects.",
  },
  {
    name: "Psilocybin",
    tags: ["tryptamine", "psychedelic"],
    intensity: "STRONG",
    summary: "Prodrug of psilocin; principal constituent in many Psilocybe species.",
  },
  {
    name: "Psilocin",
    tags: ["tryptamine", "psychedelic"],
    intensity: "STRONG",
    summary: "Active metabolite of psilocybin; engages serotonin receptors.",
  },
  {
    name: "Mescaline",
    latin: "3,4,5-trimethoxyphenethylamine",
    tags: ["phenethylamine", "psychedelic"],
    intensity: "MODERATE",
    summary: "Phenethylamine present in peyote and San Pedro cacti.",
  },
  {
    name: "LSD",
    latin: "Lysergic acid diethylamide",
    tags: ["ergoline", "psychedelic"],
    intensity: "STRONG",
    summary: "Potent semi-synthetic ergoline; very low active dose.",
  },
  {
    name: "Harmine",
    tags: ["beta-carboline", "MAOI"],
    intensity: "MODERATE",
    summary: "Reversible MAO-A inhibitor; occurs in Banisteriopsis caapi and others.",
  },
  {
    name: "Harmaline",
    tags: ["beta-carboline", "MAOI"],
    intensity: "MODERATE",
    summary: "RIMA similar to harmine; traditionally part of ayahuasca admixtures.",
  },
  {
    name: "THC",
    latin: "Δ9-tetrahydrocannabinol",
    tags: ["cannabinoid"],
    intensity: "MODERATE",
    summary: "Primary intoxicating cannabinoid associated with cannabis.",
  },
  {
    name: "CBD",
    latin: "Cannabidiol",
    tags: ["cannabinoid"],
    intensity: "MILD",
    summary: "Non-intoxicating cannabinoid; widely used in consumer products.",
  },
  {
    name: "Ibotenic Acid",
    tags: ["isoxazole"],
    intensity: "MODERATE",
    summary: "Amanita constituent that can decarboxylate to muscimol via heat/drying.",
  },
  {
    name: "Muscimol",
    tags: ["isoxazole", "GABAergic"],
    intensity: "MODERATE",
    summary: "GABA_A receptor agonist; principal active in A. muscaria.",
  },
  {
    name: "Mitragynine",
    tags: ["indole", "opioidergic"],
    intensity: "MODERATE",
    summary: "Kratom alkaloid with activity at opioid receptors.",
  },
  {
    name: "Salvinorin A",
    tags: ["diterpene"],
    intensity: "STRONG",
    summary: "Highly potent kappa-opioid receptor agonist from Salvia divinorum.",
  },
  {
    name: "LSA",
    latin: "d-lysergic acid amide",
    tags: ["ergoline"],
    intensity: "MODERATE",
    summary: "Ergoline found in morning glory and Hawaiian baby woodrose seeds.",
  },
  {
    name: "Yohimbine",
    tags: ["indole", "stimulant"],
    intensity: "MODERATE",
    summary: "α2-adrenergic antagonist; associated with Pausinystalia yohimbe.",
  },
];

for (const s of seed) {
  const id = slug(s.name);
  if (have.has(id)) continue;
  const e: Entity = {
    id,
    kind: "compound",
    commonName: s.name,
    latinName: s.latin ?? s.name,
    summary: s.summary,
    description: undefined,
    tags: Array.from(new Set(["compound", ...s.tags])),
    intensity: s.intensity,
    regions: [],
    sources: [],
    createdAt: today(),
    updatedAt: today(),
  };
  list.push(e);
  have.add(id);
}

// Sort stable and write
list.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(OUT, JSON.stringify(list, null, 2));
console.log(`Seeded ${OUT}. Total compounds: ${list.length}.`);
