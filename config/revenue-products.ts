import { AFFILIATE_TAGS } from './affiliate'
import type { RecommendationProduct } from '@/components/RecommendationSection'
import { isRestrictedIngredient } from '@/lib/restricted-ingredients'

export type RevenueProductSet = {
  slug: string
  title: string
  products: RecommendationProduct[]
}

function amazonUrl(query: string) {
  if (isRestrictedIngredient(query)) return ''
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}&tag=${AFFILIATE_TAGS.amazon}`
}

function amazonAsinUrl(asin: string) {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAGS.amazon}`
}

function amazonProductUrl({ asin, query }: { asin?: string; query: string }) {
  return asin ? amazonAsinUrl(asin) : amazonUrl(query)
}

export const revenueProductSets: Record<string, RevenueProductSet> = {
  // ── EXISTING 5 ──────────────────────────────────────────────────────────────
  ashwagandha: {
    slug: 'ashwagandha',
    title: 'Ashwagandha product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Ashwagandha 450 mg',
        rationale: 'Budget pick for a simple ashwagandha capsule from a widely available supplement brand.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Ashwagandha 450 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow KSM-66 Ashwagandha',
        rationale: 'Best overall pick for users who want a clearly standardized KSM-66 ashwagandha extract.',
        affiliateUrl: amazonProductUrl({ asin: 'B07LFMM7N1', query: 'Jarrow Formulas KSM-66 Ashwagandha' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Stress Balance',
        rationale: 'Premium pick for users who prioritize practitioner-style branding and broader stress-support context.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne ashwagandha stress balance' }),
      },
    ],
  },
  magnesium: {
    slug: 'magnesium',
    title: 'Magnesium product picks',
    products: [
      {
        slot: 'budget',
        brand: "Doctor's Best",
        title: "Doctor's Best High Absorption Magnesium",
        rationale: 'Budget pick for chelated magnesium with clear elemental magnesium labeling.',
        affiliateUrl: amazonProductUrl({ query: "Doctor's Best High Absorption Magnesium lysinate glycinate" }),
      },
      {
        slot: 'overall',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Magnesium Glycinate',
        rationale: 'Best overall pick for a cleaner glycinate-style magnesium product.',
        affiliateUrl: amazonProductUrl({ asin: 'B07F7NWYD8', query: 'Pure Encapsulations Magnesium Glycinate' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Magnesium Bisglycinate',
        rationale: 'Premium pick for users who prefer powder format and a practitioner-oriented brand.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Magnesium Bisglycinate powder' }),
      },
    ],
  },
  'l-theanine': {
    slug: 'l-theanine',
    title: 'L-Theanine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW L-Theanine 200 mg',
        rationale: 'Budget pick for plain L-theanine capsules without a complex calming blend.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods L-Theanine 200 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Theanine 200 mg',
        rationale: 'Best overall pick for a simple 200 mg L-theanine capsule format.',
        affiliateUrl: amazonProductUrl({ asin: 'B01GAOCB56', query: 'Jarrow Formulas Theanine 200 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Sports Research',
        title: 'Sports Research Suntheanine L-Theanine',
        rationale: 'Premium pick for users who want a Suntheanine-labeled theanine product.',
        affiliateUrl: amazonProductUrl({ query: 'Sports Research Suntheanine L-Theanine 200 mg' }),
      },
    ],
  },
  rhodiola: {
    slug: 'rhodiola',
    title: 'Rhodiola product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Rhodiola 500 mg',
        rationale: 'Budget pick for a common Rhodiola rosea capsule from a mainstream brand.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Rhodiola 500 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Rhodiola Rosea',
        rationale: 'Best overall pick for users who want a recognizable botanical brand and liquid phyto-caps format.',
        affiliateUrl: amazonProductUrl({ asin: 'B00E4HSMQE', query: 'Gaia Herbs Rhodiola Rosea' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Rhodiola',
        rationale: 'Premium pick for users prioritizing brand quality signals and transparent standardized extract positioning.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Rhodiola' }),
      },
    ],
  },
  'lions-mane': {
    slug: 'lions-mane',
    title: "Lion's Mane product picks",
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: "NOW Lion's Mane",
        rationale: "Budget pick for a widely available lion's mane capsule.",
        affiliateUrl: amazonProductUrl({ query: "NOW Lion's Mane mushroom supplement" }),
      },
      {
        slot: 'overall',
        brand: 'Real Mushrooms',
        title: "Real Mushrooms Lion's Mane",
        rationale: 'Best overall pick for fruiting-body-forward labeling and mushroom-category transparency.',
        affiliateUrl: amazonProductUrl({ asin: 'B07YJN369J', query: "Real Mushrooms Lion's Mane" }),
      },
      {
        slot: 'premium',
        brand: 'Host Defense',
        title: "Host Defense Lion's Mane",
        rationale: 'Premium pick for users who prefer a well-known mushroom-specialist brand.',
        affiliateUrl: amazonProductUrl({ query: "Host Defense Lion's Mane capsules" }),
      },
    ],
  },

  // ── HERBS ───────────────────────────────────────────────────────────────────
  valerian: {
    slug: 'valerian',
    title: 'Valerian product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Valerian Root 500 mg',
        rationale: 'Budget pick for a standard valerian root capsule from a reliable mass-market brand.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Valerian Root 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: "Nature's Way",
        title: "Nature's Way Standardized Valerian",
        rationale: "Best overall for a standardized 0.8% valerenic acid extract with clear labeling.",
        affiliateUrl: amazonProductUrl({ query: "Nature's Way Standardized Valerian Root Extract" }),
      },
      {
        slot: 'premium',
        brand: 'Herb Pharm',
        title: 'Herb Pharm Valerian Liquid Extract',
        rationale: 'Premium liquid extract for faster absorption and flexible dosing, from a respected botanical brand.',
        affiliateUrl: amazonProductUrl({ query: 'Herb Pharm Valerian liquid extract' }),
      },
    ],
  },
  passionflower: {
    slug: 'passionflower',
    title: 'Passionflower product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Passionflower 350 mg',
        rationale: 'Budget pick for a straightforward passionflower herb capsule.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Passionflower 350 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Passionflower',
        rationale: 'Best overall for a phyto-caps format with traceability and standardized botanical quality.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Passionflower supplement' }),
      },
      {
        slot: 'premium',
        brand: 'Herb Pharm',
        title: 'Herb Pharm Passionflower Extract',
        rationale: 'Premium certified-organic liquid extract for flexible dose titration.',
        affiliateUrl: amazonProductUrl({ query: 'Herb Pharm Passionflower liquid extract certified organic' }),
      },
    ],
  },
  kava: {
    slug: 'kava',
    title: 'Kava product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Kava Kava 250 mg',
        rationale: 'Budget capsule pick for users who want a basic kavalactone entry point.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Kava Kava 250 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Kava Kava',
        rationale: 'Best overall for phyto-caps with standardized kavalactone content and sourcing transparency.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Kava Kava supplement' }),
      },
      {
        slot: 'premium',
        brand: 'Kavafied',
        title: 'Kavafied Supreme Kava Powder',
        rationale: 'Premium noble kava root powder for traditional preparation; higher kavalactone potency.',
        affiliateUrl: amazonProductUrl({ query: 'Kavafied Supreme noble kava root powder' }),
      },
    ],
  },
  reishi: {
    slug: 'reishi',
    title: 'Reishi product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Reishi 270 mg',
        rationale: 'Budget pick for a basic reishi mushroom capsule.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Reishi 270 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Real Mushrooms',
        title: 'Real Mushrooms Reishi Mushroom Extract',
        rationale: 'Best overall for fruiting-body-only extract with beta-glucan labeling and third-party testing.',
        affiliateUrl: amazonProductUrl({ query: 'Real Mushrooms Reishi fruiting body extract capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Host Defense',
        title: 'Host Defense Reishi Capsules',
        rationale: 'Premium pick from the Stamets-line mushroom brand with multi-stage extraction.',
        affiliateUrl: amazonProductUrl({ query: 'Host Defense Reishi mushroom capsules' }),
      },
    ],
  },
  maca: {
    slug: 'maca',
    title: 'Maca product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Maca 750 mg',
        rationale: 'Budget pick for a standard maca root capsule with no additives.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Maca 750 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Maca Root',
        rationale: 'Best overall for organic gelatinized maca with quality sourcing from Peru.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Maca Root capsules' }),
      },
      {
        slot: 'premium',
        brand: 'The Maca Team',
        title: 'The Maca Team Premium Maca Capsules',
        rationale: 'Premium certified-organic gelatinized maca with raw and gelatinized options.',
        affiliateUrl: amazonProductUrl({ query: 'The Maca Team premium organic maca capsules' }),
      },
    ],
  },
  elderberry: {
    slug: 'elderberry',
    title: 'Elderberry product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Elderberry 500 mg',
        rationale: 'Budget pick for a concentrated elderberry capsule during immune season.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Elderberry 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Sambucol',
        title: 'Sambucol Black Elderberry Syrup',
        rationale: 'Best overall for the clinically studied elderberry syrup with widely recognized brand recognition.',
        affiliateUrl: amazonProductUrl({ query: 'Sambucol Black Elderberry Syrup immune support' }),
      },
      {
        slot: 'premium',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Black Elderberry',
        rationale: 'Premium phyto-caps pick for standardized elderberry extract with traceability.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Black Elderberry capsules' }),
      },
    ],
  },
  garlic: {
    slug: 'garlic',
    title: 'Garlic product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Garlic Oil 1500 mg',
        rationale: 'Budget oil-softgel pick for allicin-standardized garlic support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Garlic Oil 1500 mg softgels' }),
      },
      {
        slot: 'overall',
        brand: 'Kyolic',
        title: 'Kyolic Aged Garlic Extract 100',
        rationale: 'Best overall for aged garlic extract — odorless formula with extensive clinical data.',
        affiliateUrl: amazonProductUrl({ query: 'Kyolic Aged Garlic Extract Formula 100' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Optimized Garlic',
        rationale: 'Premium pick for enteric-coated tablets that deliver allicin past stomach acid.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Optimized Garlic enteric coated' }),
      },
    ],
  },
  ginger: {
    slug: 'ginger',
    title: 'Ginger product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Ginger Root 550 mg',
        rationale: 'Budget pick for a plain ginger root capsule for digestive and nausea support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Ginger Root 550 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Ginger Supreme',
        rationale: 'Best overall for full-spectrum ginger phyto-caps with standardized gingerols.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Ginger Supreme liquid phyto-caps' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Phytisone (Ginger)',
        rationale: 'Premium practitioner-grade ginger extract with clean formula and high-potency standardization.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne ginger extract supplement' }),
      },
    ],
  },
  turmeric: {
    slug: 'turmeric',
    title: 'Turmeric / Curcumin product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Turmeric 400 mg',
        rationale: 'Budget pick for basic turmeric root capsules; best used with black pepper for absorption.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Turmeric 400 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Thorne',
        title: 'Thorne Meriva-SR Curcumin',
        rationale: 'Best overall for the clinically validated Meriva phospholipid-bound curcumin format.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Meriva-SR curcumin phytosome' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Super Bio-Curcumin',
        rationale: 'Premium BCM-95 curcumin with enhanced bioavailability versus standard turmeric.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Super Bio-Curcumin BCM-95' }),
      },
    ],
  },
  chamomile: {
    slug: 'chamomile',
    title: 'Chamomile product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Chamomile 400 mg',
        rationale: 'Budget capsule pick for evening use; no flavorings or additives.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Chamomile 400 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Traditional Medicinals',
        title: 'Traditional Medicinals Organic Chamomile Tea',
        rationale: 'Best overall for traditional chamomile tea consumption with organic certification.',
        affiliateUrl: amazonProductUrl({ query: 'Traditional Medicinals Organic Chamomile Tea bags' }),
      },
      {
        slot: 'premium',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Chamomile Liquid Extract',
        rationale: 'Premium liquid extract for fast-acting, concentrated chamomile support.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Chamomile liquid extract' }),
      },
    ],
  },
  'ginkgo-biloba': {
    slug: 'ginkgo-biloba',
    title: 'Ginkgo Biloba product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Ginkgo Biloba 60 mg',
        rationale: 'Budget pick for standardized 24%/6% ginkgo extract at an accessible price.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Ginkgo Biloba 60 mg 24% extract' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Ginkgo Biloba 60 mg',
        rationale: 'Best overall for standardized EGb 761-style ginkgo extract with consistent potency.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Ginkgo Biloba 60 mg standardized' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Ginkgo Biloba Certified Extract',
        rationale: 'Premium for users wanting EGb 761 certified ginkgo with life extension brand trust.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Ginkgo Biloba Certified Extract EGb 761' }),
      },
    ],
  },
  'holy-basil': {
    slug: 'holy-basil',
    title: 'Holy Basil (Tulsi) product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Holy Basil 500 mg',
        rationale: 'Budget capsule pick for adaptogenic tulsi support without added ingredients.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Holy Basil 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Holy Basil Leaf',
        rationale: 'Best overall for a concentrated holy basil extract in phyto-caps with traceability.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Holy Basil Leaf capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Organic India',
        title: 'Organic India Tulsi Holy Basil',
        rationale: 'Premium for certified-organic tulsi from an India-origin brand with Ayurvedic heritage.',
        affiliateUrl: amazonProductUrl({ query: 'Organic India Tulsi Holy Basil capsules certified organic' }),
      },
    ],
  },
  'milk-thistle': {
    slug: 'milk-thistle',
    title: 'Milk Thistle product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Silymarin Milk Thistle 300 mg',
        rationale: 'Budget pick for standardized 80% silymarin milk thistle extract.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Milk Thistle Silymarin 300 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Milk Thistle 150 mg',
        rationale: 'Best overall for a 30:1 concentrated silymarin extract with clear label standardization.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Milk Thistle Silymarin standardized' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Siliphos (Silybin Phytosome)',
        rationale: 'Premium for the phospholipid-bound silybin form with superior bioavailability over standard silymarin.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Siliphos silybin phytosome milk thistle' }),
      },
    ],
  },
  echinacea: {
    slug: 'echinacea',
    title: 'Echinacea product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Echinacea 400 mg',
        rationale: 'Budget pick for an echinacea purpurea herb capsule during cold season.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Echinacea 400 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Echinacea Supreme',
        rationale: 'Best overall for a dual-extract echinacea with purpurea root + angustifolia for broader coverage.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Echinacea Supreme liquid phyto-caps' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Echinacea',
        rationale: 'Premium pick for clean echinacea extract in a practitioner-brand capsule.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Echinacea purpurea supplement' }),
      },
    ],
  },
  bacopa: {
    slug: 'bacopa',
    title: 'Bacopa product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Bacopa 450 mg',
        rationale: 'Budget pick for a standardized bacopa monnieri capsule.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Bacopa 450 mg standardized extract' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Bacopa Monnieri 320 mg',
        rationale: 'Best overall for a standardized 20% bacosides extract in a clean capsule format.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Bacopa Monnieri 320 mg extract' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Bacopa',
        rationale: 'Premium for a hypoallergenic bacopa capsule in a practitioner-grade formula.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Bacopa hypoallergenic capsules' }),
      },
    ],
  },
  'st-johns-wort': {
    slug: 'st-johns-wort',
    title: "St. John's Wort product picks",
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: "NOW St. John's Wort 300 mg",
        rationale: 'Budget pick for standardized 0.3% hypericin St. John\'s Wort extract.',
        affiliateUrl: amazonProductUrl({ query: "NOW Foods St John's Wort 300 mg 0.3% hypericin" }),
      },
      {
        slot: 'overall',
        brand: 'Perika',
        title: 'Nature\'s Way Perika St. John\'s Wort',
        rationale: "Best overall for the clinically studied WS 5570 extract with 0.3% hypericins and 3–6% hyperforin.",
        affiliateUrl: amazonProductUrl({ query: "Nature's Way Perika St John's Wort WS 5570" }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: "Thorne St. John's Wort",
        rationale: 'Premium for a practitioner-brand standardized extract with consistent hypericin content.',
        affiliateUrl: amazonProductUrl({ query: "Thorne St John's Wort standardized extract" }),
      },
    ],
  },
  hawthorn: {
    slug: 'hawthorn',
    title: 'Hawthorn product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Hawthorn Berry 540 mg',
        rationale: 'Budget pick for hawthorn berry capsules for cardiovascular support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Hawthorn Berry 540 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Hawthorn Supplement',
        rationale: 'Best overall for a concentrated hawthorn berry and leaf/flower extract in phyto-caps.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Hawthorn cardiovascular supplement' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Hawthorn Extract',
        rationale: 'Premium for a standardized oligomeric proanthocyanidin (OPC) hawthorn extract.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Hawthorn Extract standardized OPC' }),
      },
    ],
  },
  'saw-palmetto': {
    slug: 'saw-palmetto',
    title: 'Saw Palmetto product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Saw Palmetto 160 mg',
        rationale: 'Budget soft-gel pick for standardized saw palmetto extract.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Saw Palmetto 160 mg softgel extract' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Saw Palmetto 160 mg',
        rationale: 'Best overall for a liposterolic extract standardized to fatty acids for prostate support.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Saw Palmetto 160 mg liposterolic' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Saw Palmetto & Beta-Sitosterol',
        rationale: 'Premium for a saw palmetto + beta-sitosterol combination for broader prostate support.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Saw Palmetto Beta-Sitosterol prostate' }),
      },
    ],
  },
  'black-cohosh': {
    slug: 'black-cohosh',
    title: 'Black Cohosh product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Black Cohosh 80 mg',
        rationale: 'Budget pick for standardized black cohosh extract for menopause support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Black Cohosh 80 mg standardized extract' }),
      },
      {
        slot: 'overall',
        brand: 'Remifemin',
        title: 'Remifemin Menopause Supplement',
        rationale: 'Best overall for the clinically studied isopropanolic black cohosh extract (iCR) with robust trial data.',
        affiliateUrl: amazonProductUrl({ query: 'Remifemin black cohosh menopause supplement' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Black Cohosh',
        rationale: 'Premium for a hypoallergenic, practitioner-grade black cohosh standardized capsule.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Black Cohosh standardized' }),
      },
    ],
  },

  // ── COMPOUNDS ───────────────────────────────────────────────────────────────
  melatonin: {
    slug: 'melatonin',
    title: 'Melatonin product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Melatonin 3 mg',
        rationale: 'Budget pick for a common 3 mg melatonin capsule — lower dose preferred by most sleep researchers.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Melatonin 3 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Natrol',
        title: 'Natrol Melatonin 5 mg Fast Dissolve',
        rationale: 'Best overall for a fast-dissolve tablet that avoids first-pass metabolism; well-reviewed.',
        affiliateUrl: amazonProductUrl({ query: 'Natrol Melatonin 5 mg Fast Dissolve tablets' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Melaton-3',
        rationale: 'Premium for a practitioner-brand 3 mg melatonin with clean formulation.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Melaton-3 melatonin capsules' }),
      },
    ],
  },
  'vitamin-d': {
    slug: 'vitamin-d',
    title: 'Vitamin D product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Vitamin D3 2000 IU',
        rationale: 'Budget pick for basic vitamin D3 cholecalciferol in a clean softgel.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Vitamin D3 2000 IU softgels' }),
      },
      {
        slot: 'overall',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Vitamin D3 1000 IU',
        rationale: 'Best overall for a hypoallergenic, highly tested vitamin D3 capsule from a trusted brand.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Vitamin D3 1000 IU capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Vitamin D/K2 Liquid',
        rationale: 'Premium for a combined D3 + K2 liquid drop to support calcium metabolism alongside vitamin D.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Vitamin D K2 liquid drops' }),
      },
    ],
  },
  'omega-3': {
    slug: 'omega-3',
    title: 'Omega-3 product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Ultra Omega-3 500 EPA / 250 DHA',
        rationale: 'Budget pick for a high-EPA omega-3 at an accessible price; enteric coated.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Ultra Omega-3 500 EPA 250 DHA enteric coated' }),
      },
      {
        slot: 'overall',
        brand: 'Nordic Naturals',
        title: 'Nordic Naturals Ultimate Omega',
        rationale: 'Best overall for third-party tested, triglyceride-form omega-3 with consistent potency.',
        affiliateUrl: amazonProductUrl({ query: 'Nordic Naturals Ultimate Omega triglyceride form' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Super EPA',
        rationale: 'Premium practitioner-grade concentrated EPA fish oil with phospholipid bioavailability.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Super EPA omega-3 concentrate' }),
      },
    ],
  },
  'coenzyme-q10': {
    slug: 'coenzyme-q10',
    title: 'CoQ10 product picks',
    products: [
      {
        slot: 'budget',
        brand: "Doctor's Best",
        title: "Doctor's Best CoQ10 100 mg",
        rationale: 'Budget pick for ubiquinone CoQ10 with BioPerine for absorption at a solid value.',
        affiliateUrl: amazonProductUrl({ query: "Doctor's Best CoQ10 100 mg BioPerine" }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas QH-Absorb CoQ10 100 mg',
        rationale: 'Best overall for the ubiquinol (reduced) form with Kaneka QH-sourced ingredient.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas QH-Absorb ubiquinol 100 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations CoQ10 120 mg',
        rationale: 'Premium hypoallergenic ubiquinone capsule for sensitive individuals and practitioner use.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations CoQ10 120 mg capsules' }),
      },
    ],
  },
  probiotics: {
    slug: 'probiotics',
    title: 'Probiotic product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Probiotic-10 25 Billion',
        rationale: 'Budget pick for a 10-strain broad-spectrum probiotic at a good CFU-per-dollar value.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Probiotic-10 25 billion CFU capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Culturelle',
        title: 'Culturelle Daily Probiotic',
        rationale: 'Best overall for the clinically studied Lactobacillus rhamnosus GG strain with solid safety record.',
        affiliateUrl: amazonProductUrl({ query: 'Culturelle Daily Probiotic Lactobacillus rhamnosus GG' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Probiotic 50B',
        rationale: 'Premium for a practitioner-grade, hypoallergenic 50-billion CFU multi-strain probiotic.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Probiotic 50B capsules' }),
      },
    ],
  },
  glycine: {
    slug: 'glycine',
    title: 'Glycine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Glycine 1 g',
        rationale: 'Budget pick for plain glycine powder or capsules — no fillers.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Glycine 1000 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Glycine 1000 mg',
        rationale: 'Best overall for a clean glycine capsule in a reliable mid-tier brand.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Glycine 1000 mg capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Glycine',
        rationale: 'Premium glycine capsule for sensitive users wanting practitioner-brand quality assurance.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Glycine amino acid capsules' }),
      },
    ],
  },
  taurine: {
    slug: 'taurine',
    title: 'Taurine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Taurine 1000 mg',
        rationale: 'Budget pick for a plain taurine capsule — no additives, good entry dose.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Taurine 1000 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Taurine 1000 mg',
        rationale: 'Best overall for cardiovascular and nerve support with a clean capsule formula.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Taurine 1000 mg capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Taurine',
        rationale: 'Premium for a higher-dose taurine with Life Extension quality verification.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Taurine supplement capsules' }),
      },
    ],
  },
  inositol: {
    slug: 'inositol',
    title: 'Inositol product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Inositol 500 mg',
        rationale: 'Budget capsule pick for myo-inositol mood and metabolic support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Inositol 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Inositol 750 mg',
        rationale: 'Best overall for a clean myo-inositol powder or capsule with solid dose labeling.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Inositol 750 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Inositol',
        rationale: 'Premium hypoallergenic inositol powder for clean dosing in sensitive individuals.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Inositol powder capsules' }),
      },
    ],
  },
  creatine: {
    slug: 'creatine',
    title: 'Creatine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Sports Creatine Monohydrate Powder',
        rationale: 'Budget pick for unflavored creatine monohydrate powder — proven, simple, affordable.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Sports Creatine Monohydrate Powder unflavored' }),
      },
      {
        slot: 'overall',
        brand: 'Optimum Nutrition',
        title: 'Optimum Nutrition Micronized Creatine Powder',
        rationale: 'Best overall for Creapure-sourced micronized creatine monohydrate — industry standard.',
        affiliateUrl: amazonProductUrl({ query: 'Optimum Nutrition Micronized Creatine Powder Creapure' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Creatine',
        rationale: 'Premium NSF Certified for Sport creatine monohydrate — tested for banned substances.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Creatine monohydrate NSF Certified for Sport' }),
      },
    ],
  },
  'vitamin-c': {
    slug: 'vitamin-c',
    title: 'Vitamin C product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Vitamin C-1000 with Rose Hips',
        rationale: 'Budget pick for 1000 mg ascorbic acid with bioflavonoid and rose hip co-factors.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Vitamin C 1000 mg Rose Hips tablets' }),
      },
      {
        slot: 'overall',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Vitamin C 1000 mg',
        rationale: 'Best overall for a hypoallergenic, corn-free ascorbic acid capsule — clean label.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Vitamin C 1000 mg capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Vitamin C with Flavonoids',
        rationale: 'Premium for vitamin C combined with citrus bioflavonoids for enhanced absorption.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Vitamin C with Flavonoids capsules' }),
      },
    ],
  },
  zinc: {
    slug: 'zinc',
    title: 'Zinc product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Zinc Glycinate 30 mg',
        rationale: 'Budget pick for chelated zinc glycinate — better absorbed than oxide forms.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Zinc Glycinate 30 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Zinc Balance',
        rationale: 'Best overall for zinc combined with copper in a 15:1 ratio — prevents copper depletion.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Zinc Balance copper zinc ratio capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Zinc Picolinate 30 mg',
        rationale: 'Premium for picolinate-chelated zinc with practitioner-brand formulation quality.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Zinc Picolinate 30 mg capsules' }),
      },
    ],
  },
  '5-htp': {
    slug: '5-htp',
    title: '5-HTP product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW 5-HTP 100 mg',
        rationale: 'Budget pick for 100 mg 5-HTP from Griffonia simplicifolia seed extract.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods 5-HTP 100 mg capsules Griffonia' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas 5-HTP 100 mg',
        rationale: 'Best overall for enteric-coated 5-HTP that protects from stomach acid conversion.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas 5-HTP 100 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations 5-HTP',
        rationale: 'Premium for a hypoallergenic 5-HTP capsule with clean excipients.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations 5-HTP 100 mg capsules' }),
      },
    ],
  },
  nac: {
    slug: 'nac',
    title: 'NAC (N-Acetyl Cysteine) product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW NAC 600 mg',
        rationale: 'Budget pick for 600 mg NAC capsule — standard clinical dose for glutathione support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods NAC N-Acetyl Cysteine 600 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas NAC Sustain 600 mg',
        rationale: 'Best overall for sustained-release NAC that reduces peak plasma spikes.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas NAC Sustain 600 mg sustained release' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne NAC N-Acetyl-L-Cysteine',
        rationale: 'Premium practitioner-grade NAC with clean formula and consistent potency testing.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne NAC N-Acetyl-L-Cysteine capsules' }),
      },
    ],
  },
  'alpha-lipoic-acid': {
    slug: 'alpha-lipoic-acid',
    title: 'Alpha Lipoic Acid product picks',
    products: [
      {
        slot: 'budget',
        brand: "Doctor's Best",
        title: "Doctor's Best Alpha Lipoic Acid 600 mg",
        rationale: 'Budget pick for high-dose alpha lipoic acid with BioPerine at an accessible price.',
        affiliateUrl: amazonProductUrl({ query: "Doctor's Best Alpha Lipoic Acid 600 mg BioPerine" }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Alpha Lipoic Acid 300 mg',
        rationale: 'Best overall for a 300 mg R+S-ALA capsule with clean labeling.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Alpha Lipoic Acid 300 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Alpha-Lipoic Acid',
        rationale: 'Premium for practitioner-grade ALA with mitochondrial antioxidant positioning.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Alpha-Lipoic Acid capsules' }),
      },
    ],
  },
  berberine: {
    slug: 'berberine',
    title: 'Berberine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Berberine 500 mg',
        rationale: 'Budget pick for berberine HCl at the standard clinical 500 mg dose.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Berberine 500 mg HCl capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Thorne',
        title: 'Thorne Berberine-500',
        rationale: 'Best overall for a practitioner-brand berberine with consistent HPLC testing.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Berberine-500 capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Berberine',
        rationale: 'Premium hypoallergenic berberine for clean formulation and practitioner trust.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Berberine HCl capsules' }),
      },
    ],
  },
  quercetin: {
    slug: 'quercetin',
    title: 'Quercetin product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Quercetin with Bromelain',
        rationale: 'Budget pick for quercetin + bromelain combination for enhanced polyphenol absorption.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Quercetin with Bromelain capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Quercetin 500 mg',
        rationale: 'Best overall for a clean, pure quercetin dihydrate capsule at a reliable dose.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Quercetin 500 mg capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Quercetin',
        rationale: 'Premium for hypoallergenic quercetin in a practitioner-quality formulation.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Quercetin 250 mg capsules' }),
      },
    ],
  },
  'green-tea-extract': {
    slug: 'green-tea-extract',
    title: 'Green Tea Extract product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Green Tea Extract 400 mg',
        rationale: 'Budget pick for a standardized EGCG green tea extract without excessive caffeine.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Green Tea Extract 400 mg EGCG decaffeinated' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Green Tea 500 mg',
        rationale: 'Best overall for a concentrated green tea extract standardized to 80% polyphenols.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Green Tea 500 mg polyphenols' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Mega Green Tea Extract',
        rationale: 'Premium for a 98% polyphenol decaffeinated green tea extract with EGCG focus.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Mega Green Tea Extract 98% polyphenols' }),
      },
    ],
  },
  collagen: {
    slug: 'collagen',
    title: 'Collagen product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Sports Collagen Peptides Powder',
        rationale: 'Budget pick for hydrolyzed bovine collagen peptides in a plain powder format.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Sports Collagen Peptides Powder hydrolyzed bovine' }),
      },
      {
        slot: 'overall',
        brand: 'Vital Proteins',
        title: 'Vital Proteins Collagen Peptides',
        rationale: 'Best overall for a widely used, third-party tested grass-fed bovine collagen peptide powder.',
        affiliateUrl: amazonProductUrl({ query: 'Vital Proteins Collagen Peptides grass-fed powder' }),
      },
      {
        slot: 'premium',
        brand: 'Ancient Nutrition',
        title: 'Ancient Nutrition Multi Collagen Protein',
        rationale: 'Premium for a multi-source collagen (types I, II, III, V, X) for broader tissue support.',
        affiliateUrl: amazonProductUrl({ query: 'Ancient Nutrition Multi Collagen Protein types I II III V X' }),
      },
    ],
  },
  glutamine: {
    slug: 'glutamine',
    title: 'L-Glutamine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW L-Glutamine 500 mg',
        rationale: 'Budget pick for plain L-glutamine capsules for gut lining and muscle recovery.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods L-Glutamine 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas L-Glutamine 1000 mg',
        rationale: 'Best overall for 1000 mg glutamine capsules supporting gut integrity and recovery.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas L-Glutamine 1000 mg capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne L-Glutamine Powder',
        rationale: 'Premium powder format for flexible dosing and practitioner-brand quality.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne L-Glutamine powder' }),
      },
    ],
  },
  'vitamin-b12': {
    slug: 'vitamin-b12',
    title: 'Vitamin B12 product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Vitamin B12 1000 mcg',
        rationale: 'Budget pick for cyanocobalamin or methylcobalamin in a dissolvable lozenge format.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Vitamin B12 1000 mcg methylcobalamin lozenge' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Methyl B-12 500 mcg',
        rationale: 'Best overall for methylcobalamin lozenge — the bioactive form that bypasses conversion.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Methyl B-12 500 mcg lozenge methylcobalamin' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Adenosyl/Methyl B12',
        rationale: 'Premium for the combination of adenosylcobalamin + methylcobalamin covering both metabolic pathways.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Adenosyl Methyl B12 capsules' }),
      },
    ],
  },
  iron: {
    slug: 'iron',
    title: 'Iron product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Iron 18 mg',
        rationale: 'Budget pick for iron bisglycinate chelate — gentler on the stomach than ferrous sulfate.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Iron 18 mg bisglycinate gentle capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Thorne',
        title: 'Thorne Iron Bisglycinate',
        rationale: 'Best overall for a highly bioavailable iron bisglycinate with practitioner-grade labeling.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Iron Bisglycinate capsules' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Iron (C)',
        rationale: 'Premium for iron combined with vitamin C in a hypoallergenic capsule for optimal absorption.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Iron with Vitamin C hypoallergenic' }),
      },
    ],
  },
  'vitamin-k2': {
    slug: 'vitamin-k2',
    title: 'Vitamin K2 product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Vitamin K-2 100 mcg',
        rationale: 'Budget pick for MK-7 form vitamin K2 — longer half-life than MK-4.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Vitamin K-2 MK-7 100 mcg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas MK-7 90 mcg',
        rationale: 'Best overall for Kaneka MK-7 sourced vitamin K2 with solid bioavailability data.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas MK-7 vitamin K2 90 mcg' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Vitamin K2 Liquid',
        rationale: 'Premium liquid K2 for flexible dosing; useful alongside D3 supplementation.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Vitamin K2 liquid drops' }),
      },
    ],
  },
  bcaa: {
    slug: 'bcaa',
    title: 'BCAA product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Sports BCAA Powder',
        rationale: 'Budget pick for unflavored 2:1:1 BCAA powder with no artificial sweeteners.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Sports BCAA Powder 2-1-1 ratio unflavored' }),
      },
      {
        slot: 'overall',
        brand: 'Optimum Nutrition',
        title: 'Optimum Nutrition BCAA 1000 Caps',
        rationale: 'Best overall for a convenient 2:1:1 BCAA capsule with consistent dosing.',
        affiliateUrl: amazonProductUrl({ query: 'Optimum Nutrition BCAA 1000 Capsules 2-1-1' }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Amino Complex',
        rationale: 'Premium for an NSF Certified for Sport amino acid blend including BCAAs for athletes.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Amino Complex NSF Certified Sport BCAAs' }),
      },
    ],
  },
  'sam-e': {
    slug: 'sam-e',
    title: 'SAM-e product picks',
    products: [
      {
        slot: 'budget',
        brand: "Doctor's Best",
        title: "Doctor's Best SAM-e 400 mg",
        rationale: 'Budget pick for enteric-coated SAM-e — the coating is essential for stomach protection.',
        affiliateUrl: amazonProductUrl({ query: "Doctor's Best SAM-e 400 mg enteric coated" }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas SAM-e 400 mg',
        rationale: 'Best overall for pharmaceutical-grade enteric-coated SAM-e with foil-wrapped tabs.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas SAM-e 400 mg enteric coated tablets' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations SAMe',
        rationale: 'Premium hypoallergenic SAM-e for sensitive users or those seeking clean excipients.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations SAMe enteric coated' }),
      },
    ],
  },
  resveratrol: {
    slug: 'resveratrol',
    title: 'Resveratrol product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Natural Resveratrol 200 mg',
        rationale: 'Budget pick for trans-resveratrol from Polygonum cuspidatum at a standard dose.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Resveratrol 200 mg trans-resveratrol' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas Resveratrol 100 mg',
        rationale: 'Best overall for a standardized trans-resveratrol capsule in a clean formula.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas Resveratrol 100 mg trans-resveratrol' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Trans-Resveratrol',
        rationale: 'Premium for high-potency trans-resveratrol combined with grape skin polyphenols.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Trans-Resveratrol grape skin' }),
      },
    ],
  },
  'vitamin-b6': {
    slug: 'vitamin-b6',
    title: 'Vitamin B6 product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Vitamin B-6 100 mg',
        rationale: 'Budget pick for standard pyridoxine HCl B6 capsule.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Vitamin B-6 100 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Jarrow Formulas',
        title: 'Jarrow Formulas P-5-P 50 mg',
        rationale: 'Best overall for the active pyridoxal-5-phosphate form — no conversion step needed.',
        affiliateUrl: amazonProductUrl({ query: 'Jarrow Formulas P5P Pyridoxal-5-Phosphate 50 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations P5P 50',
        rationale: 'Premium hypoallergenic P5P B6 for those needing the active form without fillers.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations P5P 50 pyridoxal-5-phosphate' }),
      },
    ],
  },
  kanna: {
    slug: 'kanna',
    title: 'Kanna product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Kanna 100 mg',
        rationale: 'Budget pick for a simple Kanna extract capsule.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Kanna capsules' }),
      },
      {
        slot: 'overall',
        brand: 'UltraKanna',
        title: 'UltraKanna ET2 Liquid Extract',
        rationale: 'Best overall for standardized mesembrine-rich alkaloid extract.',
        affiliateUrl: amazonProductUrl({ query: 'UltraKanna ET2 liquid extract' }),
      },
      {
        slot: 'premium',
        brand: 'Zembrin',
        title: 'Zembrin Standardized Kanna',
        rationale: 'Premium pick for clinically studied, patented Zembrin extract.',
        affiliateUrl: amazonProductUrl({ query: 'Zembrin standardized Kanna extract' }),
      },
    ],
  },
  'panax-ginseng': {
    slug: 'panax-ginseng',
    title: 'Asian Ginseng product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Panax Ginseng 500 mg',
        rationale: 'Budget pick for standard Asian Ginseng root capsules.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Panax Ginseng 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Panax Ginseng',
        rationale: 'Best overall for liquid phyto-caps with traceably sourced ginsenosides.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Panax Ginseng' }),
      },
      {
        slot: 'premium',
        brand: 'Auragin',
        title: 'Auragin Korean Red Ginseng',
        rationale: 'Premium 100% pure Korean red ginseng tablets without fillers or binders.',
        affiliateUrl: amazonProductUrl({ query: 'Auragin Korean Red Ginseng' }),
      },
    ],
  },
  caffeine: {
    slug: 'caffeine',
    title: 'Caffeine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Sports Caffeine 200 mg',
        rationale: 'Budget pick for plain caffeine anhydrous tablets.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Sports Caffeine 200 mg tablets' }),
      },
      {
        slot: 'overall',
        brand: 'Kaged Muscle',
        title: 'Kaged PurCaf Organic Caffeine',
        rationale: 'Best overall for chemical-free water-extracted organic caffeine from green coffee beans.',
        affiliateUrl: amazonProductUrl({ query: 'Kaged PurCaf organic caffeine 200 mg' }),
      },
      {
        slot: 'premium',
        brand: 'Sports Research',
        title: 'Sports Research L-Theanine + Caffeine',
        rationale: 'Premium pick pairing 100 mg caffeine with 200 mg L-theanine for jitter-free focus.',
        affiliateUrl: amazonProductUrl({ query: 'Sports Research Caffeine and L-Theanine' }),
      },
    ],
  },
  palmitoylethanolamide: {
    slug: 'palmitoylethanolamide',
    title: 'PEA (Palmitoylethanolamide) product picks',
    products: [
      {
        slot: 'budget',
        brand: 'Nutricost',
        title: 'Nutricost PEA 600 mg',
        rationale: 'Budget capsule pick for simple micronized PEA support.',
        affiliateUrl: amazonProductUrl({ query: 'Nutricost Palmitoylethanolamide PEA 600 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Life Extension',
        title: 'Life Extension Discomfort Relief (PEA)',
        rationale: 'Best overall chewable PEA tablets in a clinically studied dosage format.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Discomfort Relief PEA' }),
      },
      {
        slot: 'premium',
        brand: 'Vitalitus',
        title: 'Vitalitus Ultramicronized PEA',
        rationale: 'Premium ultramicronized PEA powder for maximum particle-size absorption quality.',
        affiliateUrl: amazonProductUrl({ query: 'Vitalitus ultramicronized PEA powder' }),
      },
    ],
  },
  boswellia: {
    slug: 'boswellia',
    title: 'Boswellia product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Boswellia Extract 500 mg',
        rationale: 'Budget pick for standardized 65% boswellic acids extract capsules.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Boswellia Extract 500 mg' }),
      },
      {
        slot: 'overall',
        brand: 'Life Extension',
        title: 'Life Extension 5-Lox Inhibitor (ApresFLEX)',
        rationale: 'Best overall for patented ApresFLEX Boswellia extract, standardized for high AKBA content.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension 5-Lox Inhibitor ApresFLEX' }),
      },
      {
        slot: 'premium',
        brand: 'Pure Encapsulations',
        title: 'Pure Encapsulations Boswellia',
        rationale: 'Premium practitioner-grade Boswellia extract with high-purity standardization.',
        affiliateUrl: amazonProductUrl({ query: 'Pure Encapsulations Boswellia serrata extract' }),
      },
    ],
  },
  glucosamine: {
    slug: 'glucosamine',
    title: 'Glucosamine product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Glucosamine 1000 mg',
        rationale: 'Budget pick for standard glucosamine sulfate capsules.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Glucosamine Sulfate 1000 mg' }),
      },
      {
        slot: 'overall',
        brand: "Doctor's Best",
        title: "Doctor's Best Glucosamine Chondroitin MSM",
        rationale: 'Best overall combination formula covering all three major joint structural elements.',
        affiliateUrl: amazonProductUrl({ query: "Doctors Best Glucosamine Chondroitin MSM" }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Glucosamine & Chondroitin',
        rationale: 'Premium practitioner-grade formula combining high-purity glucosamine and chondroitin sulfate.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Glucosamine and Chondroitin capsules' }),
      },
    ],
  },
  chondroitin: {
    slug: 'chondroitin',
    title: 'Chondroitin product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Chondroitin Sulfate 600 mg',
        rationale: 'Budget pick for pure chondroitin sulfate capsules.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Chondroitin Sulfate 600 mg' }),
      },
      {
        slot: 'overall',
        brand: "Doctor's Best",
        title: "Doctor's Best Glucosamine Chondroitin MSM",
        rationale: 'Best overall combination formula covering all three major joint structural elements.',
        affiliateUrl: amazonProductUrl({ query: "Doctors Best Glucosamine Chondroitin MSM" }),
      },
      {
        slot: 'premium',
        brand: 'Thorne',
        title: 'Thorne Glucosamine & Chondroitin',
        rationale: 'Premium practitioner-grade formula combining high-purity glucosamine and chondroitin sulfate.',
        affiliateUrl: amazonProductUrl({ query: 'Thorne Glucosamine and Chondroitin capsules' }),
      },
    ],
  },
  'lemon-balm': {
    slug: 'lemon-balm',
    title: 'Lemon Balm product picks',
    products: [
      {
        slot: 'budget',
        brand: 'NOW Foods',
        title: 'NOW Lemon Balm 500 mg',
        rationale: 'Budget capsule pick for evening relaxation and cognitive support.',
        affiliateUrl: amazonProductUrl({ query: 'NOW Foods Lemon Balm 500 mg capsules' }),
      },
      {
        slot: 'overall',
        brand: 'Gaia Herbs',
        title: 'Gaia Herbs Lemon Balm',
        rationale: 'Best overall liquid phyto-caps with certified organic lemon balm leaf extract.',
        affiliateUrl: amazonProductUrl({ query: 'Gaia Herbs Lemon Balm' }),
      },
      {
        slot: 'premium',
        brand: 'Life Extension',
        title: 'Life Extension Cyracos Lemon Balm',
        rationale: 'Premium pick utilizing patented Cyracos lemon balm extract, studied for stress and sleep.',
        affiliateUrl: amazonProductUrl({ query: 'Life Extension Cyracos Lemon Balm' }),
      },
    ],
  },
}

const revenueProductAliases: Record<string, string> = {
  // ashwagandha
  'ashwagandha-root': 'ashwagandha',
  'ashwagandha-root-extract': 'ashwagandha',
  'ashwagandha-extract-ksm-66': 'ashwagandha',
  // magnesium
  'magnesium-glycinate': 'magnesium',
  'magnesium-citrate': 'magnesium',
  'magnesium-threonate': 'magnesium',
  'magnesium-bisglycinate': 'magnesium',
  'magnesium-malate': 'magnesium',
  // l-theanine
  theanine: 'l-theanine',
  'l-theanine-sleep': 'l-theanine',
  // rhodiola
  'rhodiola-rosea': 'rhodiola',
  'rhodiola-extract-shr5': 'rhodiola',
  // lions-mane
  'lions-mane': 'lions-mane',
  'lion-s-mane': 'lions-mane',
  lionmane: 'lions-mane',
  'hericium-erinaceus': 'lions-mane',
  // valerian
  'valerian-root': 'valerian',
  'valerian-root-extract': 'valerian',
  'valeriana-officinalis': 'valerian',
  // passionflower
  'passiflora-incarnata': 'passionflower',
  'passionflower-extract': 'passionflower',
  // kava
  'piper-methysticum': 'kava',
  kavalactones: 'kava',
  'kava-kava': 'kava',
  // reishi
  'ganoderma-lucidum': 'reishi',
  'reishi-mushroom': 'reishi',
  // maca
  'maca-root': 'maca',
  'maca-root-extract': 'maca',
  'lepidium-meyenii': 'maca',
  // turmeric / curcumin
  curcumin: 'turmeric',
  'curcumin-extract': 'turmeric',
  'turmeric-extract': 'turmeric',
  // ginkgo
  'ginkgo-biloba-extract': 'ginkgo-biloba',
  ginkgo: 'ginkgo-biloba',
  // holy-basil
  tulsi: 'holy-basil',
  'tulsi-basil': 'holy-basil',
  // milk-thistle
  silymarin: 'milk-thistle',
  'silybum-marianum': 'milk-thistle',
  // coenzyme-q10
  coq10: 'coenzyme-q10',
  'coq-10': 'coenzyme-q10',
  ubiquinol: 'coenzyme-q10',
  ubiquinone: 'coenzyme-q10',
  // omega-3
  'fish-oil': 'omega-3',
  epa: 'omega-3',
  dha: 'omega-3',
  'epa-dha': 'omega-3',
  // vitamin-d
  'vitamin-d3': 'vitamin-d',
  cholecalciferol: 'vitamin-d',
  // nac
  'n-acetyl-cysteine': 'nac',
  'n-acetyl-l-cysteine': 'nac',
  // alpha-lipoic-acid
  ala: 'alpha-lipoic-acid',
  'r-lipoic-acid': 'alpha-lipoic-acid',
  // green-tea-extract
  egcg: 'green-tea-extract',
  'green-tea-egcg': 'green-tea-extract',
  // vitamin-b12
  cobalamin: 'vitamin-b12',
  shadowcobalamin: 'vitamin-b12',
  methylcobalamin: 'vitamin-b12',
  'b12': 'vitamin-b12',
  // vitamin-b6
  pyridoxine: 'vitamin-b6',
  'p5p': 'vitamin-b6',
  'b6': 'vitamin-b6',
  // vitamin-k2
  'mk-7': 'vitamin-k2',
  'mk-4': 'vitamin-k2',
  menaquinone: 'vitamin-k2',
  // sam-e
  'same': 'sam-e',
  's-adenosyl-methionine': 'sam-e',
  // new additions
  pea: 'palmitoylethanolamide',
  'melissa-officinalis': 'lemon-balm',
  'boswellia-serrata': 'boswellia',
  ginseng: 'panax-ginseng',
}

export function getRevenueProductSet(slug: string): RevenueProductSet | null {
  const normalized = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-')
  if (isRestrictedIngredient(normalized)) return null
  const key = revenueProductAliases[normalized] || normalized
  return revenueProductSets[key] ?? null
}

export const revenueProductPlaceholders = revenueProductSets
export const getRevenueProductPlaceholders = getRevenueProductSet
