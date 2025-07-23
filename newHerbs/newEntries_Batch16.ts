export const newHerbs = [
  {
    name: "Tilia europaea",
    slug: "tilia-europaea",
    commonNames: ["Linden", "Lime Blossom"],
    region: "Europe, Western Asia",
    effects: ["calming", "mild sedative", "antispasmodic"],
    activeCompounds: ["Farnesol", "Kaempferol"],
    mechanismOfAction: "Mild GABAergic modulation and flavonoid effects",
    traditionalUse: "Used as a calming tea for sleep, anxiety, and tension.",
    tags: ["sedative", "folk", "relaxant"]
  },
  {
    name: "Rubus idaeus",
    slug: "rubus-idaeus",
    commonNames: ["Red Raspberry Leaf"],
    region: "Europe, North America",
    effects: ["uterine tonic", "calming", "digestive support"],
    activeCompounds: ["Fragarine", "Tiliroside"],
    mechanismOfAction: "Smooth muscle modulation and antioxidant action",
    traditionalUse: "Used in midwifery and herbal traditions to support reproductive health.",
    tags: ["folk", "uterine", "tonic"]
  },
  {
    name: "Desmodium adscendens",
    slug: "desmodium-adscendens",
    commonNames: ["Desmodium", "Amor Seco"],
    region: "West Africa, South America",
    effects: ["bronchodilator", "liver support", "anti-allergic"],
    activeCompounds: ["Desmodin", "Astragalin"],
    mechanismOfAction: "Smooth muscle relaxation and anti-inflammatory flavonoid activity",
    traditionalUse: "Used to treat asthma, allergies, and liver issues in folk medicine.",
    tags: ["bronchodilator", "folk", "detox"]
  }
];

export const newCompounds = [
  {
    name: "Farnesol",
    type: "Sesquiterpenoid",
    effects: ["calming", "aromatic"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Kaempferol",
    type: "Flavonoid",
    effects: ["anti-inflammatory", "neuroprotective"],
    foundIn: ["Tilia europaea"]
  },
  {
    name: "Fragarine",
    type: "Alkaloid",
    effects: ["uterine tonic", "muscle relaxant"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Tiliroside",
    type: "Flavonoid glycoside",
    effects: ["digestive support", "mild sedative"],
    foundIn: ["Rubus idaeus"]
  },
  {
    name: "Desmodin",
    type: "Alkaloid",
    effects: ["bronchodilation", "anti-allergic"],
    foundIn: ["Desmodium adscendens"]
  }
];