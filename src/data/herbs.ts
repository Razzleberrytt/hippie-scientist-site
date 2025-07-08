export interface Herb {
  id: string;
  name: string;
  scientificName?: string;
  category: string;
  effects: string[];
  description: string;
  mechanismOfAction: string;
  pharmacokinetics: string;
  therapeuticUses: string;
  sideEffects: string;
  contraindications: string;
  drugInteractions: string;
  toxicityLD50: string;
  safetyRating: number;
  legalStatus: string;
  tags: string[];
}

// Enhanced herb data with comprehensive information
export const herbsData: Herb[] = [
  {
    id: "acorus-calamus",
    name: "Acorus Calamus",
    scientificName: "Acorus calamus",
    category: "Psychoactive",
    effects: ["Mental Clarity", "Mild Stimulation", "Dream Enhancement"],
    description: "Traditional herb known for mental clarity and mild psychoactive effects through β-asarone content.",
    mechanismOfAction: "Contains β-asarone; GABA modulation and mild stimulant effects.",
    pharmacokinetics: "Oral or chewed; onset 30–60 min; duration 2–6 hours.",
    therapeuticUses: "Mental clarity, digestion, dream induction.",
    sideEffects: "Nausea, dizziness, carcinogenicity risk (β-asarone).",
    contraindications: "Pregnancy, seizure disorders, cancer risk.",
    drugInteractions: "Sedatives, CNS depressants.",
    toxicityLD50: "Carcinogenic in rodents at high doses.",
    safetyRating: 4,
    legalStatus: "Legal in most jurisdictions",
    tags: ["traditional", "psychoactive", "caution-required"]
  },
  {
    id: "african-dream-root",
    name: "African Dream Root",
    scientificName: "Silene undulata",
    category: "Oneirogenic",
    effects: ["Lucid Dreaming", "Dream Enhancement", "Spiritual Insight"],
    description: "Traditional African herb used to enhance dream experiences and promote lucid dreaming states.",
    mechanismOfAction: "May stimulate cholinergic systems; used traditionally to enhance dreams.",
    pharmacokinetics: "Chewed or infused; onset hours; dream-phase activation.",
    therapeuticUses: "Lucid dreaming, spiritual insight.",
    sideEffects: "Vivid dreams, rare nausea.",
    contraindications: "Pregnancy, epilepsy.",
    drugInteractions: "Sedatives, cholinergics.",
    toxicityLD50: "Low; safe in traditional use.",
    safetyRating: 8,
    legalStatus: "Legal worldwide",
    tags: ["dreams", "traditional", "spiritual", "safe"]
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha",
    scientificName: "Withania somnifera",
    category: "Adaptogen",
    effects: ["Stress Relief", "Anxiety Reduction", "Strength Enhancement", "Sleep Support"],
    description: "Powerful adaptogenic herb known for reducing stress, anxiety, and supporting overall well-being.",
    mechanismOfAction: "Modulates cortisol, GABAergic and serotonergic systems.",
    pharmacokinetics: "Oral; onset ~1–2 hrs (chronic benefits build over weeks).",
    therapeuticUses: "Stress, anxiety, strength, sleep support.",
    sideEffects: "GI upset, drowsiness.",
    contraindications: "Pregnancy, thyroid issues.",
    drugInteractions: "Sedatives, thyroid meds.",
    toxicityLD50: "LD50 >2 g/kg (rats).",
    safetyRating: 9,
    legalStatus: "Legal worldwide",
    tags: ["adaptogen", "safe", "well-studied", "therapeutic"]
  },
  {
    id: "ayahuasca",
    name: "Ayahuasca",
    scientificName: "Banisteriopsis caapi + Psychotria viridis",
    category: "Psychedelic",
    effects: ["Intense Hallucinations", "Spiritual Experiences", "Emotional Processing"],
    description: "Sacred plant medicine combining MAOIs with DMT for profound psychedelic experiences.",
    mechanismOfAction: "MAOIs + DMT activate serotonergic and hallucinogenic pathways.",
    pharmacokinetics: "Oral brew; onset ~30–60 min; duration ~4–6 hrs.",
    therapeuticUses: "Psychedelic therapy, depression, trauma.",
    sideEffects: "Nausea, intense hallucinations.",
    contraindications: "SSRIs, bipolar disorder.",
    drugInteractions: "MAOIs, antidepressants.",
    toxicityLD50: "Varies; psychological risks high.",
    safetyRating: 3,
    legalStatus: "Illegal in most jurisdictions",
    tags: ["psychedelic", "illegal", "sacred", "high-risk"]
  },
  {
    id: "bacopa",
    name: "Bacopa",
    scientificName: "Bacopa monnieri",
    category: "Nootropic",
    effects: ["Memory Enhancement", "Cognitive Support", "Anxiety Reduction"],
    description: "Well-researched nootropic herb known for enhancing memory, learning, and reducing anxiety.",
    mechanismOfAction: "Enhances cholinergic transmission; antioxidant and neuroprotective.",
    pharmacokinetics: "Oral (capsules or tea); onset weeks (cumulative); acute onset ~60–90 min.",
    therapeuticUses: "Memory, anxiety reduction, learning.",
    sideEffects: "GI discomfort, fatigue (rare).",
    contraindications: "Ulcers, thyroid conditions.",
    drugInteractions: "Thyroid meds, sedatives.",
    toxicityLD50: "LD50 >2000 mg/kg (rats).",
    safetyRating: 9,
    legalStatus: "Legal worldwide",
    tags: ["nootropic", "well-studied", "safe", "cognitive"]
  },
  {
    id: "blue-lotus",
    name: "Blue Lotus",
    scientificName: "Nymphaea caerulea",
    category: "Relaxant",
    effects: ["Relaxation", "Mild Euphoria", "Dream Enhancement", "Aphrodisiac"],
    description: "Ancient Egyptian sacred flower known for its relaxing and mildly euphoric effects.",
    mechanismOfAction: "Modulates dopamine and serotonin; acts as mild sedative and euphoriant.",
    pharmacokinetics: "Smoked or steeped; onset 20–40 min; duration 2–4 hours.",
    therapeuticUses: "Relaxation, sleep aid, aphrodisiac.",
    sideEffects: "Mild sedation, dizziness.",
    contraindications: "Pregnancy, use with sedatives.",
    drugInteractions: "CNS depressants, alcohol.",
    toxicityLD50: "Low; historically used safely.",
    safetyRating: 8,
    legalStatus: "Legal worldwide",
    tags: ["relaxant", "safe", "traditional", "dreams"]
  },
  {
    id: "cannabis",
    name: "Cannabis",
    scientificName: "Cannabis sativa",
    category: "Cannabinoid",
    effects: ["Relaxation", "Euphoria", "Pain Relief", "Appetite Stimulation"],
    description: "Well-known psychoactive plant with both therapeutic and recreational applications.",
    mechanismOfAction: "Cannabinoids interact with CB1/CB2 receptors in the endocannabinoid system.",
    pharmacokinetics: "Inhaled, oral, topical; onset varies by method; duration 2–8 hours.",
    therapeuticUses: "Pain relief, nausea, epilepsy, anxiety, appetite stimulation.",
    sideEffects: "Dry mouth, red eyes, altered cognition, potential anxiety.",
    contraindications: "Pregnancy, schizophrenia, heart conditions.",
    drugInteractions: "CNS depressants, alcohol, certain medications.",
    toxicityLD50: "Very high; no known fatal overdoses.",
    safetyRating: 7,
    legalStatus: "Varies by jurisdiction",
    tags: ["cannabinoid", "medical", "recreational", "legal-varies"]
  },
  {
    id: "kava",
    name: "Kava",
    scientificName: "Piper methysticum",
    category: "Anxiolytic",
    effects: ["Anxiety Relief", "Relaxation", "Muscle Relaxation", "Euphoria"],
    description: "Pacific Island plant known for its powerful anti-anxiety and relaxation effects.",
    mechanismOfAction: "GABA-A modulation; affects sodium/calcium channels.",
    pharmacokinetics: "Oral; onset ~30 min, duration 3–6 hours.",
    therapeuticUses: "Anxiety, stress, insomnia, muscle tension.",
    sideEffects: "Liver toxicity (rare), nausea, sedation.",
    contraindications: "Liver disease, CNS depressants.",
    drugInteractions: "Alcohol, benzodiazepines.",
    toxicityLD50: "Hepatotoxicity risk at high doses or long use.",
    safetyRating: 6,
    legalStatus: "Legal in most jurisdictions",
    tags: ["anxiolytic", "caution-liver", "traditional", "effective"]
  },
  {
    id: "kratom",
    name: "Kratom",
    scientificName: "Mitragyna speciosa",
    category: "Opioid-like",
    effects: ["Pain Relief", "Mood Enhancement", "Energy Boost", "Sedation"],
    description: "Southeast Asian tree with complex effects ranging from stimulation to sedation depending on dose.",
    mechanismOfAction: "Mitragynine acts on mu-opioid receptors; stimulant at low doses, sedative at high.",
    pharmacokinetics: "Oral; onset ~15–45 min; duration 3–6 hours.",
    therapeuticUses: "Pain relief, mood boost, opioid withdrawal aid.",
    sideEffects: "Nausea, constipation, dependency risk.",
    contraindications: "Substance use disorders, pregnancy.",
    drugInteractions: "Opioids, antidepressants.",
    toxicityLD50: "Low; estimated LD50 is high, but not fully established.",
    safetyRating: 5,
    legalStatus: "Varies by jurisdiction",
    tags: ["opioid-like", "dependency-risk", "pain-relief", "legal-varies"]
  },
  {
    id: "psilocybin-mushrooms",
    name: "Psilocybin Mushrooms",
    scientificName: "Psilocybe cubensis",
    category: "Psychedelic",
    effects: ["Visual Hallucinations", "Altered Consciousness", "Spiritual Experiences", "Introspection"],
    description: "Naturally occurring psychedelic mushrooms containing psilocybin, showing promise in therapeutic applications.",
    mechanismOfAction: "Psilocybin converts to psilocin; acts on serotonin 5-HT2A receptors.",
    pharmacokinetics: "Oral; onset 20–60 min; duration 4–8 hours.",
    therapeuticUses: "Depression, PTSD, addiction treatment, end-of-life anxiety.",
    sideEffects: "Nausea, altered perception, potential psychological distress.",
    contraindications: "Schizophrenia, bipolar disorder, pregnancy.",
    drugInteractions: "SSRIs, MAOIs, lithium.",
    toxicityLD50: "Very low toxicity; psychological risks primary concern.",
    safetyRating: 7,
    legalStatus: "Illegal in most jurisdictions",
    tags: ["psychedelic", "therapeutic-potential", "illegal", "research"]
  }
];

export const categories = [
  "All",
  "Psychedelic",
  "Cannabinoid",
  "Stimulant",
  "Depressant",
  "Nootropic",
  "Adaptogen",
  "Anxiolytic",
  "Oneirogenic",
  "Relaxant",
  "Opioid-like"
];

export const effectTags = [
  "Relaxation",
  "Euphoria",
  "Focus",
  "Creativity",
  "Pain Relief",
  "Anxiety Relief",
  "Sleep Aid",
  "Energy Boost",
  "Mood Enhancement",
  "Spiritual",
  "Visual Effects",
  "Cognitive Enhancement",
  "Dream Enhancement",
  "Libido Support"
];
