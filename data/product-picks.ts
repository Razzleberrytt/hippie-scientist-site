import { AFFILIATE_TAGS } from '@/config/affiliate'

export type ProductPick = {
  compound_slug: string
  name: string
  brand: string
  type: 'top' | 'budget' | 'premium'
  url: string
  notes: string
}

export const productPicks: ProductPick[] = [
  // Turmeric
  {
    compound_slug: 'turmeric',
    name: 'NOW Turmeric Curcumin 665 mg, 60 veg capsules',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/dp/B0013OXD3I?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Item #4638: 665 mg standardized turmeric extract supplying about 630 mg curcuminoids (95%); liver-safety context applies to concentrated curcumin.'
  },
  {
    compound_slug: 'turmeric',
    name: 'Thorne Curcumin Phytosome (Meriva-SR), 120 capsules',
    brand: 'Thorne',
    type: 'top',
    url: `https://www.amazon.com/dp/B01D8V0962?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed SF815 variant. A 29-fold total-curcuminoid absorption result came from an n=9 pharmacokinetic comparison versus the matched unformulated mixture, not a clinical efficacy comparison.'
  },
  {
    compound_slug: 'turmeric',
    name: 'Life Extension Super Bio-Curcumin, 400 mg (60 capsules)',
    brand: 'Life Extension',
    type: 'premium',
    url: `https://www.amazon.com/dp/B000X9P5GM?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed BCM-95 variant; bioavailability does not establish comparative clinical effectiveness.'
  },

  // Ashwagandha
  {
    compound_slug: 'ashwagandha',
    name: 'Jarrow KSM-66 Ashwagandha',
    brand: 'Jarrow Formulas',
    type: 'top',
    url: `https://www.amazon.com/s?k=Jarrow+KSM-66+Ashwagandha&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'KSM-66 ashwagandha; historic ASIN conflicts with a provisional variant, so exact direct URL is held.'
  },
  {
    compound_slug: 'ashwagandha',
    name: 'NOW Ashwagandha 450 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Ashwagandha+450+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for a simple ashwagandha capsule.'
  },

  // L-Theanine
  {
    compound_slug: 'l-theanine',
    name: 'Jarrow Theanine 200 mg',
    brand: 'Jarrow Formulas',
    type: 'top',
    url: `https://www.amazon.com/s?k=Jarrow+Theanine+200+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Single-ingredient theanine; exact ASIN remains provisional and this earlier direct ASIN cannot be assumed equivalent.'
  },
  {
    compound_slug: 'l-theanine',
    name: 'NOW L-Theanine 200 mg + Inositol 100 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+L-Theanine+200+mg+inositol+100+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Combination supplement, not plain L-theanine; exact ASIN unverified.'
  },
  {
    compound_slug: 'l-theanine',
    name: 'Sports Research Suntheanine L-Theanine',
    brand: 'Sports Research',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Sports+Research+Suntheanine+L-Theanine+200+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Suntheanine L-theanine liquid softgel with coconut oil; exact ASIN provisional.'
  },

  // Magnesium
  {
    compound_slug: 'magnesium',
    name: 'Pure Encapsulations Magnesium Glycinate',
    brand: 'Pure Encapsulations',
    type: 'top',
    url: `https://www.amazon.com/dp/B07F7NWYD8?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall pick for a cleaner glycinate-style magnesium product.'
  },
  {
    compound_slug: 'magnesium',
    name: "Doctor's Best High Absorption Magnesium",
    brand: "Doctor's Best",
    type: 'budget',
    url: `https://www.amazon.com/s?k=Doctors+Best+High+Absorption+Magnesium+lysinate+glycinate&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for chelated magnesium.'
  },
  {
    compound_slug: 'magnesium',
    name: 'Thorne Magnesium Bisglycinate',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Magnesium+Bisglycinate+powder&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium powder format with high solubility and clean ingredients.'
  },

  // Creatine
  {
    compound_slug: 'creatine',
    name: 'Optimum Nutrition Micronized Creatine Powder, 600 g (120 servings)',
    brand: 'Optimum Nutrition',
    type: 'top',
    url: `https://www.amazon.com/dp/B002DYIZEO?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed unflavored variant; 5 g creatine per serving, with Creapure branding.'
  },
  {
    compound_slug: 'creatine',
    name: 'NOW Sports Micronized Creatine Monohydrate Powder, 21.2 oz',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Sports+Creatine+Monohydrate+Powder+unflavored+21.2+oz&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Provisional 21.2 oz variant; retain search URL until exact product-to-ASIN verification.'
  },
  {
    compound_slug: 'creatine',
    name: 'Thorne Creatine, unflavored (30 servings)',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/dp/B0DVWKPJ32?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed 30-serving variant; NSF Certified for Sport.'
  },

  // Rhodiola Rosea
  {
    compound_slug: 'rhodiola',
    name: 'Gaia Herbs Rhodiola Rosea',
    brand: 'Gaia Herbs',
    type: 'top',
    url: `https://www.amazon.com/s?k=Gaia+Herbs+Rhodiola+Rosea&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Gaia Rhodiola phyto-caps; reported rosavins amount is not a 3%-1% standardized extract claim. Old direct ASIN unresolved.'
  },
  {
    compound_slug: 'rhodiola',
    name: 'NOW Rhodiola 500 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Rhodiola+500+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'NOW Rhodiola root extract standardized to 3% rosavins/1% salidroside; direct ASIN unverified.'
  },
  {
    compound_slug: 'rhodiola',
    name: 'Thorne Rhodiola (SF755)',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Rhodiola+SF755&tag=${AFFILIATE_TAGS.amazon}`,
    notes: '100 mg 5:1 root extract standardized to 3% rosavins and 1% salidroside; direct ASIN provisional.'
  },

  // Lion's Mane
  {
    compound_slug: 'lions-mane',
    name: 'Real Mushrooms Lions Mane',
    brand: 'Real Mushrooms',
    type: 'top',
    url: `https://www.amazon.com/s?k=Real+Mushrooms+Lions+Mane&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Fruiting body with stated beta-glucans; B078SZX3ML replacement is provisional and prior ASIN may be mismatched.'
  },
  {
    compound_slug: 'lions-mane',
    name: 'NOW Lion\'s Mane',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/dp/B09V3BS25N?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed USDA Organic fruiting-body variant; do not transfer strain/form claims to other lion\'s mane products.'
  },
  {
    compound_slug: 'lions-mane',
    name: 'Host Defense Lion\'s Mane mycelium-on-rice',
    brand: 'Host Defense',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Host+Defense+Lions+Mane+mycelium+brown+rice&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Mycelium on brown rice, not fruiting body. Check this variant\'s California Proposition 65 lead warning and ingredient differences.'
  },

  // Glycine — this confirmed product is capsules, not powder.
  {
    compound_slug: 'glycine',
    name: 'NOW Glycine 1,000 mg capsules',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/dp/B08R229KG7?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed 1 g capsules. A 3 g amount used in some small sleep studies is not universal dosing advice.'
  },

  // Melatonin
  {
    compound_slug: 'melatonin',
    name: 'Natrol Melatonin Fast Dissolve',
    brand: 'Natrol',
    type: 'top',
    url: `https://www.amazon.com/s?k=Natrol+Melatonin+5+mg+Fast+Dissolve+tablets&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall fast-dissolve tablet that avoids first-pass metabolism.'
  },
  {
    compound_slug: 'melatonin',
    name: 'NOW Melatonin 3 mg, 180 capsules',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Melatonin+3+mg+180+capsules+733739032577&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'UPC 733739032577 identifies the 180-capsule 3 mg variant. Amazon ASIN unresolved: search link retained.'
  },
  {
    compound_slug: 'melatonin',
    name: 'Thorne Melaton-3',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Melaton-3+melatonin+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium practitioner-brand 3 mg melatonin with clean formulation.'
  },

  // Vitamin D: Thorne D/K2 is a combination formula, not single-ingredient D3.
  {
    compound_slug: 'vitamin-d',
    name: 'NOW Vitamin D3 2000 IU, 240 softgels',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/dp/B001UZPY1O?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed 240-softgel product, NOW item #0377; monitor total vitamin D intake.'
  },
  {
    compound_slug: 'vitamin-d',
    name: 'Pure Encapsulations Vitamin D3 1000 IU, 250 capsules',
    brand: 'Pure Encapsulations',
    type: 'top',
    url: `https://www.amazon.com/dp/B005Z1J0EQ?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed 250-capsule variant; separate 120-capsule SKU/ASIN is not interchangeable.'
  },
  {
    compound_slug: 'vitamin-d',
    name: 'Thorne Vitamin D/K2 Liquid, 1 fl oz (600 servings)',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/dp/B0038NF8MG?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed model #11793; combination D3+K2 product. Vitamin K can interfere with warfarin treatment.'
  },

  // Omega-3
  {
    compound_slug: 'omega-3',
    name: 'Nordic Naturals Ultimate Omega',
    brand: 'Nordic Naturals',
    type: 'top',
    url: `https://www.amazon.com/s?k=Nordic+Naturals+Ultimate+Omega+triglyceride+form&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for third-party tested, triglyceride-form omega-3.'
  },
  {
    compound_slug: 'omega-3',
    name: 'NOW Ultra Omega-3 500 EPA / 250 DHA (ethyl ester)',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/dp/B0015L2LBE?tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Confirmed ethyl-ester fish-oil formulation, not triglyceride; 500 mg EPA plus 250 mg DHA.'
  },
  {
    compound_slug: 'omega-3',
    name: 'Thorne Super EPA',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Super+EPA+omega-3&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium practitioner-grade concentrated EPA fish oil.'
  },

  // Berberine
  {
    compound_slug: 'berberine',
    name: 'Thorne Berberine Dual-Action (HCl + phytosome)',
    brand: 'Thorne',
    type: 'top',
    url: `https://www.amazon.com/s?k=Thorne+Berberine+dual+action+HCl+phytosome&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Reformulated: 450 mg HCl plus 550 mg phytosome per two-capsule serving; old Berberine-500 and HPLC claims withdrawn.'
  },
  {
    compound_slug: 'berberine',
    name: 'NOW Berberine HCl 500 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Berberine+500+mg+HCl+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Berberine HCl 500 mg per capsule; some human trials total 1,000-1,500 mg/day, not necessarily a recommended regimen.'
  },
  {
    compound_slug: 'berberine',
    name: 'Pure Encapsulations Berberine',
    brand: 'Pure Encapsulations',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Pure+Encapsulations+Berberine+HCl+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium hypoallergenic option with high purity.'
  },

  // Kanna
  {
    compound_slug: 'kanna',
    name: 'UltraKanna ET2 Liquid Extract',
    brand: 'UltraKanna',
    type: 'top',
    url: `https://www.amazon.com/s?k=UltraKanna+ET2+liquid+extract&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for standardized mesembrine-rich alkaloid extract.'
  },
  {
    compound_slug: 'kanna',
    name: 'NOW Kanna 100 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Kanna+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for a simple Kanna extract capsule.'
  },
  {
    compound_slug: 'kanna',
    name: 'Zembrin Standardized Kanna',
    brand: 'Zembrin',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Zembrin+standardized+Kanna+extract&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium pick for clinically studied, patented Zembrin extract.'
  },

  // Panax Ginseng
  {
    compound_slug: 'panax-ginseng',
    name: 'Gaia Herbs Panax Ginseng',
    brand: 'Gaia Herbs',
    type: 'top',
    url: `https://www.amazon.com/s?k=Gaia+Herbs+Panax+Ginseng&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for liquid phyto-caps with traceably sourced ginsenosides.'
  },
  {
    compound_slug: 'panax-ginseng',
    name: 'NOW Panax Ginseng 500 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Panax+Ginseng+500+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for standard Asian Ginseng root capsules.'
  },
  {
    compound_slug: 'panax-ginseng',
    name: 'Auragin Korean Red Ginseng',
    brand: 'Auragin',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Auragin+Korean+Red+Ginseng&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium 100% pure Korean red ginseng tablets without fillers.'
  },

  // Bacopa Monnieri
  {
    compound_slug: 'bacopa',
    name: 'NOW Bacopa 450 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Bacopa+450+mg+standardized+extract&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for a standardized bacopa monnieri capsule.'
  },
  {
    compound_slug: 'bacopa',
    name: 'Pure Encapsulations Bacopa',
    brand: 'Pure Encapsulations',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Pure+Encapsulations+Bacopa+hypoallergenic+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium for a hypoallergenic bacopa capsule in a practitioner-grade formula.'
  },

  // Caffeine
  {
    compound_slug: 'caffeine',
    name: 'Kaged PurCaf Organic Caffeine',
    brand: 'Kaged Muscle',
    type: 'top',
    url: `https://www.amazon.com/s?k=Kaged+PurCaf+organic+caffeine+200+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for chemical-free water-extracted organic caffeine.'
  },
  {
    compound_slug: 'caffeine',
    name: 'Sports Research L-Theanine + Caffeine',
    brand: 'Sports Research',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Sports+Research+Caffeine+and+L-Theanine&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium pick pairing 100 mg caffeine with 200 mg L-theanine.'
  },

  // CoQ10
  {
    compound_slug: 'coenzyme-q10',
    name: 'Jarrow Formulas QH-Absorb CoQ10 100 mg',
    brand: 'Jarrow Formulas',
    type: 'top',
    url: `https://www.amazon.com/s?k=Jarrow+Formulas+QH-Absorb+ubiquinol+100+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for the ubiquinol (reduced) form.'
  },
  {
    compound_slug: 'coenzyme-q10',
    name: "Doctor's Best CoQ10 100 mg",
    brand: "Doctor's Best",
    type: 'budget',
    url: `https://www.amazon.com/s?k=Doctors+Best+CoQ10+100+mg+BioPerine&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for ubiquinone CoQ10 with BioPerine.'
  },
  {
    compound_slug: 'coenzyme-q10',
    name: 'Pure Encapsulations CoQ10 120 mg',
    brand: 'Pure Encapsulations',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Pure+Encapsulations+CoQ10+120+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium hypoallergenic ubiquinone capsule.'
  },

  // Quercetin
  {
    compound_slug: 'quercetin',
    name: 'Jarrow Formulas Quercetin 500 mg',
    brand: 'Jarrow Formulas',
    type: 'top',
    url: `https://www.amazon.com/s?k=Jarrow+Formulas+Quercetin+500+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for a clean, pure quercetin dihydrate capsule.'
  },
  {
    compound_slug: 'quercetin',
    name: 'NOW Quercetin with Bromelain',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Quercetin+with+Bromelain+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Quercetin plus bromelain combination; avoid unproven absorption and clinical advantage claims.'
  },
  {
    compound_slug: 'quercetin',
    name: 'Pure Encapsulations Quercetin',
    brand: 'Pure Encapsulations',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Pure+Encapsulations+Quercetin+250+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium for hypoallergenic quercetin in practitioner quality.'
  },

  // Lemon Balm
  {
    compound_slug: 'lemon-balm',
    name: 'Gaia Herbs Lemon Balm',
    brand: 'Gaia Herbs',
    type: 'top',
    url: `https://www.amazon.com/s?k=Gaia+Herbs+Lemon+Balm&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall liquid phyto-caps with certified organic extract.'
  },
  {
    compound_slug: 'lemon-balm',
    name: 'Life Extension Cyracos Lemon Balm',
    brand: 'Life Extension',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Life+Extension+Cyracos+Lemon+Balm&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium pick utilizing patented Cyracos lemon balm extract.'
  },

  // Ginger
  {
    compound_slug: 'ginger',
    name: 'Gaia Herbs Ginger Supreme',
    brand: 'Gaia Herbs',
    type: 'top',
    url: `https://www.amazon.com/s?k=Gaia+Herbs+Ginger+Supreme+liquid+phyto-caps&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for full-spectrum ginger phyto-caps with standardized gingerols.'
  },
  {
    compound_slug: 'ginger',
    name: 'NOW Ginger Root 550 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Ginger+Root+550+mg+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for plain ginger root capsules.'
  },

  // PEA
  {
    compound_slug: 'palmitoylethanolamide',
    name: 'Life Extension Discomfort Relief (PEA)',
    brand: 'Life Extension',
    type: 'top',
    url: `https://www.amazon.com/s?k=Life+Extension+Discomfort+Relief+PEA&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall chewable PEA tablets in a clinically studied dosage.'
  },
  {
    compound_slug: 'palmitoylethanolamide',
    name: 'Vitalitus Ultramicronized PEA',
    brand: 'Vitalitus',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Vitalitus+ultramicronized+PEA+powder&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium ultramicronized PEA powder for maximum absorption.'
  },

  // Boswellia
  {
    compound_slug: 'boswellia',
    name: 'Life Extension 5-Lox Inhibitor (ApresFLEX)',
    brand: 'Life Extension',
    type: 'top',
    url: `https://www.amazon.com/s?k=Life+Extension+5-Lox+Inhibitor+ApresFLEX&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall for patented ApresFLEX Boswellia extract.'
  },
  {
    compound_slug: 'boswellia',
    name: 'NOW Boswellia Extract 500 mg softgels, 90 count',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Boswellia+Extract+500+mg+softgels+90+item+4936&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Item #4936 is a Boswellia-only 500 mg gum-resin extract softgel standardized to at least 65% organic acids; distinct from the turmeric-containing veg-caps variant.'
  },
  {
    compound_slug: 'boswellia',
    name: 'Pure Encapsulations Boswellia',
    brand: 'Pure Encapsulations',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Pure+Encapsulations+Boswellia+serrata+extract&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium practitioner-grade Boswellia extract.'
  },

  // Glucosamine
  {
    compound_slug: 'glucosamine',
    name: "Doctor's Best Glucosamine Chondroitin MSM",
    brand: "Doctor's Best",
    type: 'top',
    url: `https://www.amazon.com/s?k=Doctors+Best+Glucosamine+Chondroitin+MSM&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall combination formula covering joint structural elements.'
  },
  {
    compound_slug: 'glucosamine',
    name: 'NOW Glucosamine 1000 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Glucosamine+Sulfate+1000+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for standard glucosamine sulfate capsules.'
  },
  {
    compound_slug: 'glucosamine',
    name: 'Thorne Glucosamine & Chondroitin',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Glucosamine+and+Chondroitin+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium practitioner-grade formula combining both.'
  },

  // Chondroitin
  {
    compound_slug: 'chondroitin',
    name: "Doctor's Best Glucosamine Chondroitin MSM",
    brand: "Doctor's Best",
    type: 'top',
    url: `https://www.amazon.com/s?k=Doctors+Best+Glucosamine+Chondroitin+MSM&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Best overall combination formula covering joint structural elements.'
  },
  {
    compound_slug: 'chondroitin',
    name: 'NOW Chondroitin Sulfate 600 mg',
    brand: 'NOW Foods',
    type: 'budget',
    url: `https://www.amazon.com/s?k=NOW+Foods+Chondroitin+Sulfate+600+mg&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Budget pick for pure chondroitin sulfate capsules.'
  },
  {
    compound_slug: 'chondroitin',
    name: 'Thorne Glucosamine & Chondroitin',
    brand: 'Thorne',
    type: 'premium',
    url: `https://www.amazon.com/s?k=Thorne+Glucosamine+and+Chondroitin+capsules&tag=${AFFILIATE_TAGS.amazon}`,
    notes: 'Premium practitioner-grade formula combining both.'
  }
]
