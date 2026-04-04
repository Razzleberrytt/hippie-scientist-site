# The Hippie Scientist: Herb detail research shard (S-T-U-V)

## Executive summary

This shard covers **12 botanicals + clinically relevant nutrients/compounds** whose slug/name begins with **S, T, U, or V**, following the requested assumption that **non-botanical entries are included** and receive **Scientific name = Not applicable**. Core sources used were the U.S. federal evidence summaries from entity["organization","National Center for Complementary and Integrative Health","nih center"] and entity["organization","NIH Office of Dietary Supplements","nih ods"], hepatic safety synthesis from entity["organization","National Institute of Diabetes and Digestive and Kidney Diseases","niddk nih"]’s LiverTox database, EU monographs from entity["organization","European Medicines Agency","eu medicines regulator"], botanical identity and native range from entity["organization","Royal Botanic Gardens, Kew","kew gardens uk"]’s Plants of the World Online, and compound identity/marker context from PubChem. citeturn10view1turn14view0turn23view0turn9view5turn4search0turn20search0

High-confidence “Codex-ready” items (because they have monograph-grade posology and clear safety/contraindication language) include **senna**, **sage**, **thyme**, **uva-ursi**, and **vitamin-d**, plus **selenium** (ODS nutrient monograph-equivalent). citeturn9view3turn9view5turn9view7turn9view0turn15view0turn22view0

Highest interaction risk in this shard is **st-johns-wort**, which is explicitly described by NCCIH as a **potent inducer of cytochrome P450 enzymes and intestinal P-glycoprotein**, with clinically significant interactions documented including cyclosporine, indinavir, oral contraceptives, warfarin, digoxin, and benzodiazepines (among others). citeturn10view0turn10view1

Highest hepatic-safety signal in this shard is **turmeric/curcumin**, where LiverTox (2025 update) describes turmeric as a recently established cause of clinically apparent liver injury, with many cases linked to high-bioavailability curcumin formulations and a suggested HLA association. NCCIH independently warns of reported liver damage with certain bioavailable curcumin products and advises stopping use if symptoms occur. citeturn23view0turn13view0

### Quick comparison table

| slug | type | Overall confidence | Dosage supported by Tier‑1 source? | Most decision-relevant safety anchor |
|---|---:|---:|---:|---|
| saw-palmetto | botanical | Medium | Trial doses documented (NCCIH) | NCCIH |
| st-johns-wort | botanical | High | Not standardized in Tier‑1 summaries here | NCCIH |
| s-adenosyl-l-methionine | compound | Medium | Not standardized in Tier‑1 summaries here | NCCIH |
| selenium | nutrient | High | Yes (ODS RDAs/ULs; common supplement forms) | ODS |
| senna | botanical drug | High | Yes (EMA; hydroxyanthracene derivatives as sennoside B) | EMA |
| sage | botanical drug | High | Yes (EMA; thujone safety constraints) | EMA |
| thyme | botanical drug | Medium | Yes (EMA; multiple prep-specific regimens) | EMA |
| turmeric | botanical | Medium | Variable; LiverTox summarizes ranges (not a recommendation) | LiverTox + NCCIH |
| thunder-god-vine | botanical | Medium | No | NCCIH |
| uva-ursi | botanical drug | High | Yes (EMA; arbutin/hydroquinone derivative framework) | EMA |
| valerian | botanical | Medium | Yes (EMA + NCCIH short-term dosing) | EMA + NCCIH |
| vitamin-d | nutrient | High | Yes (ODS RDAs/ULs) | ODS |

Key dosing frameworks are derived from ODS RDAs/ULs and EMA monographs cited within each record. citeturn15view0turn15view4turn9view3turn9view5turn9view7turn9view0turn9view9

```mermaid
graph TD
  SJW[st-johns-wort] -->|induces CYP450 + P-gp| ManyMeds[many medicines]
  SJW -->|↓ drug levels| OCP[oral contraceptives]
  SJW -->|↓ drug levels| Cyc[cyclosporine]
  SJW -->|↓ drug levels| Warf[warfarin]
  SJW -->|risk of serotonin syndrome| AD[serotonergic antidepressants]
  SAME[s-adenosyl-l-methionine] -->|possible serotonergic interaction| AD
  TUR[turmeric/curcumin] -->|rare but established DILI| Liver[liver injury signal]
  UVA[uva-ursi] -->|hydroquinone derivatives (arbutin)| ShortOnly[short-course only]
  SEN[senna] -->|hypokalaemia risk| Glyc[cardiac glycosides/antiarrhythmics]
  SEN -->|K+ loss additive| Diur[diuretics/corticosteroids/licorice]
```

## saw-palmetto
Name: Saw palmetto  
Scientific name: *Serenoa repens* (W.Bartram) Small citeturn11view0turn4search0  
Overall confidence: Medium

### Recommended field updates
- summary: Saw palmetto is commonly promoted for urinary symptoms of benign prostatic hyperplasia (BPH), but NCCIH concludes it is **probably not helpful** for urinary tract symptoms associated with prostate enlargement, and evidence for other uses is insufficient. citeturn11view0  
- description: A small tree/palm native to the West Indies and the southeast coast of North America; medicinal use centers on the **berries** (extracts sold as dietary supplements). citeturn11view0turn4search0  
- mechanism: Proposed mechanism: **Unresolved in Tier‑1 summaries used here** (NCCIH does not provide a mechanism model in the fact sheet; avoid mechanistic claims without a Tier‑1 citation). citeturn11view0  
- safetyNotes: Generally well tolerated; adverse effects are mild/infrequent (digestive symptoms, dizziness, headache). NCCIH cautions it may be unsafe during pregnancy/breastfeeding; it does not appear to affect PSA readings even at higher-than-usual amounts. citeturn11view0turn11view1  
- interactions: NCCIH Clinical Digest notes saw palmetto **has not been shown to interact with medications** (evidence base largely from studies in men). citeturn11view1  
- activeCompounds: Unresolved (no Tier‑1 chemistry/marker list extracted here). citeturn11view0  
- dosage: Trial dosing context (not a recommended dose): a large randomized trial tested saw palmetto extract up to **3× the standard daily dose (320 mg/day)** without benefit over placebo for BPH symptoms. citeturn11view1turn11view2  
- preparation: Oral berry extracts (including hexane-extracted products in some trials) marketed as dietary supplements for urinary symptoms and other uses. citeturn11view0turn11view2  
- region: Native range: **SE United States** (POWO). citeturn4search0  

### Evidence notes
- What is strongly supported: Lack of meaningful benefit for BPH symptoms in large trials and systematic reviews; short-to-medium term tolerability; no demonstrated medication interactions in available evidence summaries. citeturn11view0turn11view1turn11view2  
- What is only tentative/proposed: Any mechanistic explanation for urinary symptom effects (not established in sources used here). citeturn11view0  
- What remains unresolved: A stable active-compound/marker profile suitable for a compact JSON “activeCompounds” field from Tier‑1 sources alone. citeturn11view0  

### Sources used
- Saw Palmetto: Usefulness and Safety (NCCIH) - https://www.nccih.nih.gov/health/saw-palmetto  
- Spotlight on Saw Palmetto: What the Science Says (NCCIH Clinical Digest) - https://www.nccih.nih.gov/health/providers/digest/spotlight-on-saw-palmetto-science  
- *Serenoa repens* (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A941782-1  

### Field confidence
- summary: High  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: Medium  
- activeCompounds: Low  
- dosage: Medium  
- preparation: Medium  
- region: High  

## st-johns-wort
Name: St. John’s wort  
Scientific name: *Hypericum perforatum* L. citeturn10view1turn4search1  
Overall confidence: High

### Recommended field updates
- summary: Evidence suggests St. John’s wort may be more effective than placebo and as effective as standard antidepressants for **mild to moderate depression**, but it is uncertain for severe depression or treatment periods longer than ~12 weeks; regardless of efficacy, it has **dangerous, sometimes life-threatening drug interactions**. citeturn10view1turn10view0  
- description: A yellow-flowered plant long used in multiple traditional medical systems; currently promoted mainly for depressive symptoms, with additional promoted uses (menopause symptoms and topical wound uses) where evidence is limited. citeturn10view1turn10view0  
- mechanism: Proposed mechanism: NCCIH characterizes St. John’s wort as a **potent inducer of cytochrome P‑450 enzymes and intestinal P‑glycoprotein**, providing a mechanistic basis for reduced exposure to many co-administered drugs. citeturn10view0  
- safetyNotes: Can cause photosensitivity (especially at large doses) and other side effects (e.g., insomnia, anxiety, dry mouth, dizziness, GI symptoms, fatigue, headache, sexual dysfunction). Pregnancy/lactation safety concerns exist (animal birth defects; reported infant effects in breastfeeding). citeturn10view0turn10view1  
- interactions: High-risk interactions documented with cyclosporine, indinavir, oral contraceptives, warfarin, digoxin, benzodiazepines (among others); concomitant use with certain antidepressants may lead to potentially serious serotonin-related effects. citeturn10view0turn10view1turn0search4  
- activeCompounds: Hyperforin and hypericin are widely referenced constituents of St. John’s wort; PubChem describes hyperforin as produced by St. John’s wort and hypericin as naturally found in *Hypericum perforatum*. citeturn20search5turn20search2  
- dosage: Unresolved (Tier‑1 summaries here do not specify a single standardized extract dose suitable for JSON without risking product-specific misrepresentation). citeturn10view1turn10view0  
- preparation: Oral extracts/capsules/tablets and topical preparations exist; interaction risk is primarily relevant to **oral use** affecting systemic drug exposure. citeturn10view0turn10view1  
- region: Native range: **Europe to China and NW Africa** (POWO). citeturn4search1  

### Evidence notes
- What is strongly supported: High interaction risk with a broad set of medicines via CYP/P‑gp induction; depressive symptom evidence strongest for mild-to-moderate depression in systematic reviews/meta-analyses summarized by NCCIH. citeturn10view0turn10view1  
- What is only tentative/proposed: Detailed pharmacodynamic antidepressant mechanism (beyond interaction biology) is not established as “strong human mechanism” in sources used here. citeturn10view1  
- What remains unresolved: Field-ready dosing guidance across product types/standardizations. citeturn10view1  

### Sources used
- St. John’s Wort: Usefulness and Safety (NCCIH) - https://www.nccih.nih.gov/health/st-johns-wort  
- Herb-Drug Interactions: What the Science Says (NCCIH Clinical Digest) - https://www.nccih.nih.gov/health/providers/digest/herb-drug-interactions-science  
- St. John’s Wort and Depression: In Depth (NCCIH) - https://www.nccih.nih.gov/health/st-johns-wort-and-depression-in-depth  
- *Hypericum perforatum* L. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A433719-1  
- Hyperforin (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Hyperforin  
- Hypericin (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Hypericin  

### Field confidence
- summary: High  
- description: High  
- mechanism: High  
- safetyNotes: High  
- interactions: High  
- activeCompounds: Medium  
- dosage: Low  
- preparation: Medium  
- region: High  

## s-adenosyl-l-methionine
Name: S‑Adenosyl‑L‑methionine (SAMe; ademetionine)  
Scientific name: Not applicable citeturn12view0  
Overall confidence: Medium

### Recommended field updates
- summary: SAMe has been studied primarily for depression, osteoarthritis, and liver diseases; NCCIH concludes there are “hints” of benefit but **evidence is not conclusive**, with limitations including short trials and use of injected SAMe in some studies. citeturn12view0  
- description: An endogenous molecule made from methionine; sold in the U.S. as a dietary supplement; abnormal levels have been associated with liver disease and depression, motivating clinical investigations. citeturn12view0  
- mechanism: Proposed mechanism: described as regulating key cellular functions; mechanistic pathways for clinical outcomes are **not established** in the NCCIH summary at a field-ready level. citeturn12view0  
- safetyNotes: Long-term safety data are limited; may not be safe for bipolar disorder (possible worsening of mania); pregnancy safety not established; theoretical concern in immunocompromised individuals regarding Pneumocystis infection growth enhancement. citeturn12view0  
- interactions: May decrease effects of levodopa; possible interaction with serotonergic drugs/supplements (antidepressants, L‑tryptophan, St. John’s wort) due to serotonin-related concerns. citeturn12view0  
- activeCompounds: SAMe itself (S‑adenosyl‑L‑methionine; PubChem CID 34756). citeturn20search0  
- dosage: Unresolved (no monograph-grade dosing recommendations in NCCIH text used here). citeturn12view0  
- preparation: Oral dietary supplement forms; injected preparations have been used in some studies and may not be equivalent to oral supplements. citeturn12view0  
- region: Not applicable

### Evidence notes
- What is strongly supported: Primary evidence limitations and key interaction cautions (levodopa; serotonergic combinations; bipolar disorder risk) are explicitly stated by NCCIH. citeturn12view0  
- What is only tentative/proposed: Any efficacy claim for depression/osteoarthritis/liver disease beyond “inconclusive” evidence summaries. citeturn12view0  
- What remains unresolved: Standard dose ranges by indication and preparation suitable for JSON. citeturn12view0  

### Sources used
- S‑Adenosyl‑L‑Methionine (SAMe): In Depth (NCCIH) - https://www.nccih.nih.gov/health/sadenosyllmethionine-same-in-depth  
- S‑adenosyl‑L‑methionine (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/S-adenosyl-L-methionine  

### Field confidence
- summary: High  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: High  
- activeCompounds: High  
- dosage: Low  
- preparation: Medium  
- region: High  

## selenium
Name: Selenium  
Scientific name: Not applicable citeturn22view0  
Overall confidence: High

### Recommended field updates
- summary: Selenium is an essential mineral; ODS describes it as a constituent of **25 selenoproteins**, which play critical roles in thyroid hormone metabolism, DNA synthesis, reproduction, and protection from oxidative damage and infection. citeturn22view0  
- description: Selenium is present in foods primarily as selenomethionine and selenocysteine; supplements commonly contain selenomethionine, selenium-enriched yeast, sodium selenite, or sodium selenate. citeturn22view0turn15view6  
- mechanism: Mechanism (nutrient): supports selenoprotein-dependent functions (e.g., glutathione peroxidases, thioredoxin reductases, selenoprotein P) relevant to antioxidant defense and thyroid hormone metabolism. citeturn22view0  
- safetyNotes: Chronic high intake can cause **selenosis** (hair loss, nail brittleness/loss, garlic breath odor, metallic taste, rash, GI symptoms, fatigue, irritability, nervous system abnormalities). Adult UL = **400 mcg/day**. citeturn15view4turn15view7  
- interactions: Selenium supplements may interact with medications; ODS notes cisplatin as an example of a medication that can affect selenium levels. citeturn15view5  
- activeCompounds: Common supplemental forms include selenomethionine (also via selenium-enriched yeast), sodium selenite, and sodium selenate. citeturn15view6  
- dosage: ODS RDAs: adults 19+ = **55 mcg/day**; pregnancy = **60 mcg/day**; lactation = **70 mcg/day**. Adult UL = **400 mcg/day**. citeturn22view0turn15view4  
- preparation: Dietary supplements as multivitamin/mineral formulations or stand-alone selenium supplements; ODS notes many multivitamin/mineral products contain 55 mcg and stand-alone supplements often range 100–400 mcg. citeturn22view0  
- region: Not applicable (nutrient; however ODS notes selenium levels in plant foods vary by geographic location due to soil content/forms). citeturn15view6  

### Evidence notes
- What is strongly supported: Nutrient identity, RDA/UL framework, common supplement forms, and toxicity syndrome are clearly established in ODS health professional fact sheet. citeturn22view0turn15view4turn15view6turn15view7  
- What is only tentative/proposed: Disease-prevention claims (e.g., cancer) are not treated as established here; not needed for requested fields. citeturn22view0  
- What remains unresolved: None critical for base selenium record under requested fields.

### Sources used
- Selenium – Health Professional Fact Sheet (ODS) - https://ods.od.nih.gov/factsheets/Selenium-HealthProfessional/  

### Field confidence
- summary: High  
- description: High  
- mechanism: High  
- safetyNotes: High  
- interactions: Medium  
- activeCompounds: High  
- dosage: High  
- preparation: High  
- region: Medium  

## senna
Name: Senna (leaf preparations)  
Scientific name: *Senna alexandrina* Mill. (syn. *Cassia senna* L.; *Cassia angustifolia* Vahl in EMA naming) citeturn7view2turn6search0  
Overall confidence: High

### Recommended field updates
- summary: Traditional herbal medicinal product for **short-term treatment of occasional constipation**; use should not exceed about 1 week, and the smallest effective dose is advised. citeturn9view3turn16view4  
- description: EMA monograph covers senna leaf preparations standardized by **hydroxyanthracene derivatives** calculated as **sennoside B**, with oral use dosing frameworks. citeturn9view3turn16view4  
- mechanism: Proposed mechanism: stimulant laxative effect mediated by senna’s hydroxyanthracene glycosides (sennosides) leading to bowel movement; EMA monograph operationalizes dosing by hydroxyanthracene derivatives but does not present a clinical mechanistic narrative beyond this class identity. citeturn16view5  
- safetyNotes: Pregnancy use is contraindicated (EMA cites concerns re genotoxic risk of certain anthranoids); lactation use is contraindicated because active metabolites may be excreted in small amounts in breast milk. Duration limits reduce risks of dependence and electrolyte disturbances. citeturn9view4turn16view4  
- interactions: Hypokalaemia from long-term laxative abuse can potentiate cardiac glycosides and interact with antiarrhythmics; concomitant use with diuretics, adrenocorticosteroids, and liquorice root may enhance potassium loss. citeturn9view4turn8view6  
- activeCompounds: Sennosides (dose expressed as hydroxyanthracene derivatives calculated as **sennoside B**). PubChem lists Sennoside B (CID 91440). citeturn16view4turn21search3  
- dosage: Adolescents >12, adults, elderly: **single dose equivalent to 10–30 mg hydroxyanthracene derivatives (as sennoside B) once daily at night**; lowest effective dose recommended; **not to be used more than 1 week**. citeturn9view3turn16view4  
- preparation: Oral dosage forms allowing titration; taken at night for next-day effect (per monograph posology presentation). citeturn9view3  
- region: Native range (POWO): **Sahara & Sahel to Indian Subcontinent**. citeturn6search0  

### Evidence notes
- What is strongly supported: Standardized posology, duration limits, pregnancy/lactation contraindications, and hypokalaemia-based interaction logic are explicitly documented in EMA monograph. citeturn9view3turn9view4  
- What is only tentative/proposed: Detailed cellular mechanism beyond the pharmacological class framing. citeturn16view5  
- What remains unresolved: None critical for requested fields (monograph is sufficiently field-ready).

### Sources used
- EU herbal monograph on Senna alexandrina Mill. (Cassia senna L.; Cassia angustifolia Vahl), folium (EMA) - https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-senna-alexandrina-mill-cassia-senna-l-cassia-angustifolia-vahl-folium-revision-1_en.pdf  
- *Senna alexandrina* Mill. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A518323-1  
- Sennoside B (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Sennoside-B  

### Field confidence
- summary: High  
- description: High  
- mechanism: Medium  
- safetyNotes: High  
- interactions: High  
- activeCompounds: High  
- dosage: High  
- preparation: High  
- region: High  

## sage
Name: Sage (sage leaf)  
Scientific name: *Salvia officinalis* L. (folium) citeturn9view5turn5search0  
Overall confidence: High

### Recommended field updates
- summary: Traditional-use indications in EMA monograph include relief of (1) mild dyspeptic complaints (heartburn/bloating), (2) excessive sweating, (3) inflammations in the mouth/throat, and (4) minor skin inflammations. citeturn9view5  
- description: EMA monograph defines multiple preparations (comminuted leaf for tea/infusion; dry and liquid extracts; tincture; oromucosal and cutaneous forms). citeturn17view0turn9view5  
- mechanism: Proposed mechanism: Unresolved in monograph (pharmacodynamic data “not required” under traditional registration); safety-relevant chemistry is highlighted via thujone exposure constraints rather than efficacy mechanism. citeturn9view6turn16view2  
- safetyNotes: EMA warns thujone is neurotoxic; chemotypes with low thujone should be preferred; product must specify thujone and keep daily exposure **below 6.0 mg**. Overconsumption (sage oil corresponding to >15 g leaf) is reported to cause heat sensation, tachycardia, vertigo, and epileptiform convulsions. Pregnancy/lactation safety not established (not recommended). citeturn9view6turn16view2turn19view1  
- interactions: EMA: **none reported**. citeturn17view0turn19view1  
- activeCompounds: Thujone (safety-relevant constituent; exposure constrained in EMA monograph). PubChem lists thujone as a compound and (separately) notes co-occurrence with sage in essential oils. citeturn9view6turn21search2turn24search2  
- dosage: EMA provides preparation- and indication-specific regimens, including:  
  - Dyspeptic complaints: tea (e.g., 1–2 g in 150 mL boiling water) and extract/tincture dosing;  
  - Excessive sweating: tea (2 g in 150 mL) and extract dosing;  
  - Oromucosal inflammation: infusion gargle regimens and extract gel dosing;  
  - Minor skin inflammations: topical infusion applications 2–4x daily. citeturn17view0turn9view5  
- preparation: Oral (tea/extract/tincture), oromucosal (gargle/gel), and cutaneous (topical infusion) routes depending on indication. citeturn19view1turn17view0  
- region: Native range (POWO): **SW Germany to S Europe** (with additional subspecies distribution detail available). citeturn5search0turn5search4  

### Evidence notes
- What is strongly supported: Traditional-use indication list; dosing options tied to preparation type; explicit thujone safety constraints and pregnancy/lactation caution; “none reported” interactions. citeturn9view5turn17view0turn9view6turn19view1  
- What is only tentative/proposed: Any efficacy mechanism (beyond traditional use and general pharmacologic plausibility) is not established in the monograph. citeturn9view6  
- What remains unresolved: None critical for requested fields; however, efficacy strength beyond traditional use is not established here. citeturn9view5  

### Sources used
- EU herbal monograph on Salvia officinalis L., folium (Revision 1) (EMA) - https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-salvia-officinalis-l-folium-revision-1_en.pdf  
- *Salvia officinalis* L. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A456833-1  
- Thujone (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Thujone  

### Field confidence
- summary: High  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: High  
- activeCompounds: Medium  
- dosage: High  
- preparation: High  
- region: High  

## thyme
Name: Thyme (thyme herb)  
Scientific name: *Thymus vulgaris* L. and *Thymus zygis* L. (herba) citeturn7view4turn5search1  
Overall confidence: Medium

### Recommended field updates
- summary: Traditional herbal medicinal product used in **productive cough associated with cold**, exclusively based on long-standing use (traditional-use basis). citeturn9view7turn8view3  
- description: EMA monograph covers multiple liquid/dry extracts and comminuted herb as herbal tea, all for oral use. citeturn9view7turn9view8  
- mechanism: Proposed mechanism: Unresolved in monograph (traditional-use pathway; no strong clinical mechanism claims). citeturn9view7turn9view8  
- safetyNotes: Contraindicated in hypersensitivity to thyme or other Lamiaceae; warnings to seek medical evaluation if dyspnoea, fever, or purulent sputum occurs; pregnancy/lactation safety not established (not recommended). citeturn9view8turn8view3  
- interactions: EMA: **none reported**. citeturn9view8turn8view3  
- activeCompounds: Provisional (compound identity only): thymol is described in PubChem as a natural monoterpene phenol primarily found in thyme; however, the EMA monograph text extracted here does not enumerate marker constituents, so keep “activeCompounds” conservative. citeturn24search3turn9view7  
- dosage: EMA provides multiple preparation-specific regimens; examples include liquid extracts (e.g., DER 1:1 single dose 1–2 mL, 3–4 times daily) and other extracts/tinctures with variable dosing (max daily doses depend on preparation). citeturn9view7turn8view3  
- preparation: Oral use as herbal tea (comminuted herb) and as liquid/dry extracts/tinctures; ethanol-containing tinctures/extracts require appropriate labeling guidance. citeturn9view7turn9view8  
- region: Native range of *Thymus vulgaris* (POWO): **SW Europe and SE Italy**. citeturn5search1  

### Evidence notes
- What is strongly supported: Traditional-use indication for productive cough with cold; preparation-specific dosing options; “none reported” interactions; pregnancy/lactation caution and red-flag symptoms prompting medical review. citeturn9view7turn9view8  
- What is only tentative/proposed: Mechanistic explanations; constituent-level marker lists (not provided by EMA monograph extract used here). citeturn9view7  
- What remains unresolved: A stable activeCompound marker set tied to EMA quality specifications (would require additional EMA assessment report or pharmacopeial extraction). citeturn9view7  

### Sources used
- Community herbal monograph on Thymus vulgaris L. and Thymus zygis L., herba (EMA) - https://www.ema.europa.eu/en/documents/herbal-monograph/final-community-herbal-monograph-thymus-vulgaris-l-and-thymus-zygis-l-herba_en.pdf  
- *Thymus vulgaris* L. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A461765-1  
- Thymol (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Thymol  

### Field confidence
- summary: High  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: High  
- activeCompounds: Medium  
- dosage: Medium  
- preparation: High  
- region: High  

## turmeric
Name: Turmeric  
Scientific name: *Curcuma longa* L. citeturn13view0turn4search2  
Overall confidence: Medium

### Recommended field updates
- summary: NCCIH: evidence is insufficient to definitively conclude benefit for most conditions; initial research suggests possible improvements in certain NAFLD measures and oral mucositis symptoms, but findings are not definitive. LiverTox: rigorous proof of efficacy in any medical condition is lacking. citeturn13view0turn23view0  
- description: A spice/botanical product from the roots/rhizomes of *Curcuma longa*; supplements include turmeric extracts and curcumin-focused products with widely variable curcuminoid content; high-bioavailability curcumin formulations are common. citeturn23view0turn13view0  
- mechanism: Proposed mechanism: LiverTox describes putative anti-inflammatory effects (e.g., inhibition of leukotriene synthesis) and broader hypothesized pathways (e.g., intracellular kinase inhibition for antineoplastic effects), but these remain mechanistic hypotheses without strong clinical proof for outcomes. citeturn23view0  
- safetyNotes: NCCIH: conventionally formulated oral turmeric/curcumin is likely safe in recommended amounts for up to 2–3 months but can cause GI adverse effects; liver damage has been reported with some bioavailable curcumin products, and pregnancy use of supplements may be unsafe. LiverTox: turmeric is now a well-documented cause of clinically apparent liver injury (rare), often linked to high-bioavailability curcumin; advises stopping product if symptoms arise and avoiding rechallenge after injury. citeturn13view0turn23view0  
- interactions: Unresolved (Tier‑1 sources used here do not provide a stable medication-interaction list comparable to St. John’s wort; do not infer interaction pairs from mechanistic speculation alone). citeturn13view0turn23view0  
- activeCompounds: Curcumin is the primary named constituent in NCCIH and LiverTox discussions; PubChem lists curcumin (CID 969516). LiverTox also notes curcumin comprises ~1–6% of whole turmeric extracts by dry weight. citeturn23view0turn20search3turn13view0  
- dosage: Unresolved as a recommended regimen; LiverTox reports recommended daily doses vary widely (depending on preparation/formulation/indication) and gives a broad range (100 to >1,000 mg/day) as a descriptive statement, not guidance. citeturn23view0  
- preparation: Whole turmeric powder, turmeric extracts, and curcumin products (including enhanced-bioavailability forms using piperine or nanoparticle/lipid delivery methods described in LiverTox context). citeturn23view0  
- region: POWO lists turmeric as a cultigen from **SW India**. citeturn4search2  

### Evidence notes
- What is strongly supported: Hepatotoxicity signal characterization (rare but established; often high-bioavailability curcumin; latency typically ~1–4 months; strong HLA association described by LiverTox); NCCIH safety messaging (stop and seek care if liver injury symptoms occur). citeturn23view0turn13view0  
- What is only tentative/proposed: Many proposed pharmacologic mechanisms and many efficacy claims beyond limited/early evidence. citeturn23view0turn13view0  
- What remains unresolved: Clinically validated, indication-specific dosing guidance and a definitive medication-interaction list suitable for stable JSON fields. citeturn23view0turn13view0  

### Sources used
- Turmeric: Usefulness and Safety (NCCIH) - https://www.nccih.nih.gov/health/turmeric  
- Turmeric (LiverTox; updated June 16, 2025) - https://www.ncbi.nlm.nih.gov/books/NBK548561/  
- *Curcuma longa* L. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A796451-1  
- Curcumin (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Curcumin  

### Field confidence
- summary: Medium  
- description: High  
- mechanism: Medium  
- safetyNotes: High  
- interactions: Low  
- activeCompounds: High  
- dosage: Low  
- preparation: Medium  
- region: High  

## thunder-god-vine
Name: Thunder god vine (lei gong teng)  
Scientific name: *Tripterygium wilfordii* Hook.f. citeturn13view1turn4search3  
Overall confidence: Medium

### Recommended field updates
- summary: NCCIH finds enough evidence to conclude thunder god vine **might have benefits for some health conditions**, especially rheumatoid arthritis (RA) symptom contexts; however, serious side effects and preparation-specific toxicity concerns mean risks may exceed benefits in many cases. citeturn13view1turn1search4turn1search12  
- description: A perennial plant commonly grown in southeast China; used traditionally for inflammation/fever and inflammatory/autoimmune diseases; currently promoted orally for RA and other conditions, and topically for RA. citeturn13view1  
- mechanism: Proposed mechanism: Unresolved at a field-ready level in NCCIH summary; toxicity is linked to specific constituents such as triptolide (not a validated “benefit mechanism” statement). citeturn13view1  
- safetyNotes: Possible serious adverse effects include lowered white blood cell count, menstrual cycle changes, kidney damage, and liver problems; rare deaths reported; other parts of the plant may be highly poisonous and preparation quality matters. NCCIH explicitly notes **triptolide**, a component found in thunder god vine, may be toxic in people. Pregnancy use is considered unsafe (birth defect risk). citeturn13view1turn1search8turn1search4  
- interactions: Unresolved (Tier‑1 sources used here do not provide a stable interaction list). citeturn13view1  
- activeCompounds: Triptolide (identified by NCCIH as a component with potential human toxicity; PubChem provides compound identity, CID 107985). citeturn13view1turn21search0  
- dosage: Unresolved (no monograph-grade dosing in sources used here). citeturn13view1  
- preparation: Oral extracts (by mouth) and topical preparations exist; toxicity risk is linked to preparation and dose. citeturn13view1turn1search8  
- region: Native range (POWO): **S China to NE Myanmar and Taiwan**. citeturn4search3  

### Evidence notes
- What is strongly supported: Serious and potentially fatal toxicity risks; pregnancy contraindication message; limited/moderate quality evidence for RA symptom improvement in some studies. citeturn13view1turn1search12turn1search4  
- What is only tentative/proposed: Any mechanism-of-benefit narrative; safe dosing boundaries for consumer supplementation. citeturn13view1  
- What remains unresolved: Reliable dosing, drug interaction list, and standardized preparation standards for supplements (vs regulated medicinal products). citeturn13view1  

### Sources used
- Thunder God Vine: Usefulness and Safety (NCCIH) - https://www.nccih.nih.gov/health/thunder-god-vine  
- Rheumatoid Arthritis: In Depth (NCCIH; thunder god vine safety note) - https://www.nccih.nih.gov/health/rheumatoid-arthritis-in-depth  
- *Tripterygium wilfordii* Hook.f. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A162908-1  
- Triptolide (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Triptolide  

### Field confidence
- summary: Medium  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: Low  
- activeCompounds: Medium  
- dosage: Low  
- preparation: Medium  
- region: High  

## uva-ursi
Name: Uva ursi / Bearberry leaf  
Scientific name: *Arctostaphylos uva-ursi* (L.) Spreng. (folium) citeturn9view0turn5search3  
Overall confidence: High

### Recommended field updates
- summary: Traditional herbal medicinal product for relief of symptoms of **mild recurrent lower urinary tract infections** (burning during urination/frequent urination) **in women**, after serious conditions are excluded by a medical doctor; traditional-use basis. citeturn9view0turn16view6  
- description: EMA monograph defines comminuted/powdered herb and dry/liquid extracts standardized to **hydroquinone derivatives calculated as anhydrous arbutin**. citeturn7view0turn16view6  
- mechanism: Proposed mechanism: antibacterial activity is often attributed to arbutin/hydroquinone derivatives; however, EMA assessment indicates scientific evidence of efficacy/safety in humans is poor and supports only traditional use. citeturn9view2turn9view0  
- safetyNotes: Contraindicated in kidney disorders; not recommended in children/adolescents <18; not recommended in men (medical supervision concerns); not to be used more than 1 week, and if symptoms persist >4 days consult clinician; may cause greenish-brown urine discoloration. EMA assessment concludes that a daily dose corresponding to **840 mg hydroquinone derivatives (as arbutin) for one week** can be considered safe for human use based on long experience. citeturn9view1turn9view2turn16view6turn19view0  
- interactions: Unresolved (not enumerated in monograph excerpts here; avoid speculation). citeturn9view0turn9view1  
- activeCompounds: Arbutin (marker framework: hydroquinone derivatives calculated as anhydrous arbutin); PubChem lists arbutin (CID 440936). citeturn16view6turn21search1  
- dosage: EMA monograph examples for female adults/elderly: herbal tea **1.5–4 g in 150 mL**, 2–4× daily (max daily dose 8 g); powdered herb 700–1050 mg twice daily; extracts dosed by hydroquinone-derivative equivalents (daily 200–840 mg as anhydrous arbutin); duration **≤1 week**. citeturn9view0turn9view1turn16view6  
- preparation: Oral use as herbal infusion or macerate (macerate used immediately after preparation), powder, and standardized dry/liquid extracts; avoid prolonged use. citeturn9view1turn9view0  
- region: Native range (POWO): **Subarctic to N, W & Central USA** (bearberry is also broadly circumboreal; use POWO-native-range text for taxonomy field consistency). citeturn5search3  

### Evidence notes
- What is strongly supported: Traditional indication limitations (women only; mild recurrent LUTI symptoms), strict duration limits, kidney-disorder contraindication, and the arbutin/hydroquinone-derivative dosing framework. citeturn9view0turn9view1turn9view2  
- What is only tentative/proposed: Strong clinical efficacy; EMA explicitly notes evidence in humans is poor/insufficient for well-established use. citeturn9view2  
- What remains unresolved: Definitive modern drug-interaction list (beyond general caution) in Tier‑1 sources used here. citeturn9view0  

### Sources used
- EU herbal monograph on Arctostaphylos uva‑ursi (L.) Spreng., folium (Revision 2) (EMA) - https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-arctostaphylos-uva-ursi-l-spreng-folium-revision-2_en.pdf  
- Assessment report on Arctostaphylos uva‑ursi (L.) Spreng., folium (Revision 2) (EMA) - https://www.ema.europa.eu/en/documents/herbal-report/final-assessment-report-arctostaphylos-uva-ursi-l-spreng-folium-revision-2_en.pdf  
- *Arctostaphylos uva-ursi* (L.) Spreng. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A1024084-2  
- Arbutin (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Arbutin  

### Field confidence
- summary: High  
- description: High  
- mechanism: Medium  
- safetyNotes: High  
- interactions: Low  
- activeCompounds: High  
- dosage: High  
- preparation: High  
- region: Medium  

## valerian
Name: Valerian  
Scientific name: *Valeriana officinalis* L. citeturn13view2turn5search2  
Overall confidence: Medium

### Recommended field updates
- summary: NCCIH: evidence for sleep/anxiety and other conditions is insufficient and inconsistent; a clinical practice guideline recommended against valerian for chronic insomnia. EMA: indications include relief of mild nervous tension and sleep disorders (traditional use for mental stress and to aid sleep). citeturn13view2turn9view9turn1search5  
- description: Roots and rhizomes used medicinally; sold as oral supplements; EMA also includes use as a bath additive (comminuted herb). citeturn13view2turn9view9turn9view10  
- mechanism: Proposed mechanism: not established as strong human mechanism in Tier‑1 sources used here; PubChem describes valerenic acid as a constituent with GABA modulator role (descriptor-level evidence, not clinical proof). citeturn24search0turn13view2  
- safetyNotes: NCCIH: generally safe short-term; studies report apparent safety with 300–600 mg daily for up to 6 weeks; long-term safety unknown; rare liver injury reports (often with multi-herb products); caution against combining with alcohol or sedatives due to possible sleep-inducing effects. EMA: may impair ability to drive/use machines; pregnancy/lactation safety not established (not recommended); GI symptoms may occur. citeturn13view2turn19view0turn18view3  
- interactions: EMA: none reported. NCCIH cautions against combining with alcohol or sedatives (sleep-inducing effect possible though not proven). citeturn19view0turn13view2  
- activeCompounds: Valerenic acid is described in PubChem as a constituent of valerian essential oil; valerian root contains mono-/sesquiterpenes and valepotriates per PubChem summary. (Treat as constituent identification, not efficacy attribution.) citeturn24search0turn24search1  
- dosage: EMA posology examples include: dry extract **400–600 mg** per dose for mild nervous tension up to 3× daily; for sleep, dosing is timed “half to one hour before bedtime” (with preparation-specific doses), plus multiple other preparation-specific regimens; NCCIH notes 300–600 mg daily used with apparent safety up to 6 weeks. citeturn9view9turn13view2turn9view10  
- preparation: Oral extracts (dry extracts, tinctures) and comminuted herb for tea; bath additive use is included in EMA monograph. citeturn9view9turn9view10  
- region: Native range (POWO): **Europe to NW Iran**. citeturn5search2  

### Evidence notes
- What is strongly supported: Short-term tolerability with duration limits; caution with sedatives/alcohol; EMA dosing/time-to-bed framing and driving impairment warning. citeturn13view2turn19view0turn9view9  
- What is only tentative/proposed: Clinical efficacy for insomnia/anxiety and any mechanistic model for sedation. citeturn13view2turn1search5  
- What remains unresolved: Long-term safety; definitive interaction list beyond general CNS-depressant caution (EMA states none reported; NCCIH suggests caution—document as “cautionary/uncertain”). citeturn19view0turn13view2  

### Sources used
- Valerian: Usefulness and Safety (NCCIH) - https://www.nccih.nih.gov/health/valerian  
- EU herbal monograph on Valeriana officinalis L., radix (EMA) - https://www.ema.europa.eu/en/documents/herbal-monograph/final-european-union-herbal-monograph-valeriana-officinalis-l-radix_en.pdf  
- *Valeriana officinalis* L. (POWO) - https://powo.science.kew.org/taxon/urn%3Alsid%3Aipni.org%3Anames%3A860012-1  
- Valerenic acid (PubChem) - https://pubchem.ncbi.nlm.nih.gov/compound/Valerenic-acid  

### Field confidence
- summary: Medium  
- description: High  
- mechanism: Low  
- safetyNotes: High  
- interactions: Medium  
- activeCompounds: Medium  
- dosage: Medium  
- preparation: Medium  
- region: High  

## vitamin-d
Name: Vitamin D  
Scientific name: Not applicable citeturn14view0  
Overall confidence: High

### Recommended field updates
- summary: Vitamin D is a fat-soluble vitamin essential for calcium absorption and bone mineralization; it also has roles in inflammation modulation and immune/neuromuscular function per ODS. citeturn14view0  
- description: Two main supplement forms are vitamin D2 (ergocalciferol) and D3 (cholecalciferol); vitamin D requires activation (hydroxylations to 25(OH)D and 1,25(OH)2D). citeturn14view0  
- mechanism: Mechanism (nutrient): promotes calcium absorption; maintains serum calcium/phosphate; sufficiency prevents rickets/osteomalacia; additional gene-modulatory activity via vitamin D receptor pathways is described by ODS. citeturn14view0  
- safetyNotes: Excessive vitamin D intake can cause hypercalcemia/hypercalciuria and high serum 25(OH)D; in extreme cases renal failure, soft tissue calcification, arrhythmias, death. ULs range from 25–100 mcg (1,000–4,000 IU) depending on age. citeturn14view0  
- interactions: ODS lists medication interaction categories including orlistat, statins, steroids, and thiazide diuretics; ODS advises individuals on regular medications discuss vitamin D intake/status with clinicians. citeturn15view1  
- activeCompounds: Vitamin D2 (ergocalciferol) and vitamin D3 (cholecalciferol). citeturn14view0  
- dosage: ODS Table 2 RDAs: adults 19–70 years **15 mcg (600 IU)/day**; adults 71+ **20 mcg (800 IU)/day**; pregnancy/lactation 15 mcg (600 IU)/day. citeturn15view0  
- preparation: Oral supplements (D2 or D3), fortified foods, and endogenous synthesis with UV exposure (the latter is not a supplement “preparation,” but is relevant context for status). citeturn14view0  
- region: Not applicable

### Evidence notes
- What is strongly supported: RDA/UL framework, toxicity syndrome at high intake, and medication interaction categories. citeturn15view0turn14view0turn15view1  
- What is only tentative/proposed: Non-bone health outcomes are not treated here as established; ODS notes evidence for many outcomes outside bone health is inadequate or contradictory. citeturn14view0  
- What remains unresolved: None critical for base vitamin D record under requested fields.

### Sources used
- Vitamin D – Health Professional Fact Sheet (ODS) - https://ods.od.nih.gov/factsheets/VitaminD-HealthProfessional/  

### Field confidence
- summary: High  
- description: High  
- mechanism: High  
- safetyNotes: High  
- interactions: High  
- activeCompounds: High  
- dosage: High  
- preparation: Medium  
- region: High  

## Final shard summary

Completed herb slugs researched:
- saw-palmetto  
- st-johns-wort  
- s-adenosyl-l-methionine  
- selenium  
- senna  
- sage  
- thyme  
- turmeric  
- thunder-god-vine  
- uva-ursi  
- valerian  
- vitamin-d  

Herbs skipped or left thin due to weak evidence:
- **saw-palmetto**: mechanism + activeCompounds remain unresolved in Tier‑1 summaries used here (benefit claims for BPH are negative/low). citeturn11view0  
- **st-johns-wort**: dosage not standardized in Tier‑1 summaries extracted here (interaction risk is clearly documented, but dosing varies by product). citeturn10view1turn10view0  
- **s-adenosyl-l-methionine**: dosage remains unresolved (NCCIH emphasizes heterogeneity and injected vs oral differences). citeturn12view0  
- **thunder-god-vine**: dosage + interactions unresolved; safety signal dominates. citeturn13view1  
- **turmeric**: interactions and recommended dosage remain unresolved; safety (especially hepatotoxicity) is strong, while efficacy remains unproven. citeturn23view0turn13view0  
- **thyme**: active-compound marker list not provided in EMA monograph excerpt (kept conservative). citeturn9view7  

Most common unresolved fields across the shard:
- **dosage** (when sources do not offer monograph-grade posology or when dosing is formulation-dependent and not stable across products) citeturn12view0turn13view1turn23view0  
- **activeCompounds** (especially where monographs do not enumerate markers; or where commercial products vary widely) citeturn9view7turn11view0turn23view0  
- **interactions** (outside of well-documented cases like St. John’s wort and senna’s hypokalaemia framework) citeturn10view0turn9view4turn13view1  

Safe for Codex update note
- **Safe to write into JSON now (minimal speculation; Tier‑1 text maps directly to fields):**
  - **senna**: summary, description, safetyNotes, interactions, activeCompounds (sennoside framework), dosage, preparation, region citeturn9view3turn9view4turn6search0turn21search3  
  - **sage**: summary, description, safetyNotes (thujone limit), interactions (“none reported”), dosage, preparation, region citeturn9view5turn9view6turn19view1turn5search0  
  - **uva-ursi**: summary, description, safetyNotes, activeCompounds (arbutin framework), dosage, preparation, region citeturn9view0turn9view1turn9view2turn5search3  
  - **vitamin-d**: summary, description, mechanism, safetyNotes, interactions, activeCompounds, dosage (RDA/UL framework), preparation (as supplement forms) citeturn14view0turn15view0turn15view1  
  - **selenium**: summary, description, mechanism, safetyNotes, interactions (general), activeCompounds (forms), dosage (RDA/UL), preparation citeturn22view0turn15view4turn15view5turn15view6  
- **Proceed, but keep certain fields conservative (avoid over-precision):**
  - **st-johns-wort**: interactions + safetyNotes + mechanism are Codex-ready; dosage should remain unresolved or stored as “varies by standardized extract” without numeric claims. citeturn10view0turn10view1  
  - **turmeric**: safetyNotes are Codex-ready (include LiverTox + NCCIH liver injury warnings); dosage and interactions should remain unresolved. citeturn23view0turn13view0  
  - **thunder-god-vine**: safetyNotes + summary/description are Codex-ready; dosage/interactions unresolved. citeturn13view1turn1search4  
  - **s-adenosyl-l-methionine**: summary/safety/interactions as per NCCIH are Codex-ready; dosage unresolved. citeturn12view0  
  - **saw-palmetto**: summary/safety/interactions are Codex-ready; activeCompounds and mechanism unresolved. citeturn11view0turn11view1