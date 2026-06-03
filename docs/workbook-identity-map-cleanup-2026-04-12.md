# Workbook herb identity map cleanup — 2026-04-12

Workbook source used: `data-sources/herb_monograph_master.xlsx` (sheet: `Herb Monographs`).

## Removed invalid identity mappings

The following mappings were removed because source and target are not the same species:

- `pueraria lobata` → `pueraria-mirifica`
- `coleus forskohlii` → `coleus-blumei`
- `kudzu` → `pueraria-mirifica`

## Remaining valid herb identity mappings

```json
{
  "bupleurum": "bupleurum-falcatum",
  "butterbur": "petasites-hybridus",
  "cacao": "theobroma-cacao",
  "cordyceps": "cordyceps-sinensis",
  "dendrobium": "dendrobium-nobile",
  "epimedium": "horny-goat-weed",
  "epimedium sagittatum": "horny-goat-weed",
  "holy basil purple": "holy-basil",
  "holy basil seed": "holy-basil",
  "nettle root": "urtica-dioica",
  "ocimum sanctum": "holy-basil",
  "poria": "poria-cocos",
  "reishi": "reishi-mushroom",
  "rhodiola rosea": "rhodiola-rosea",
  "sage": "white-sage",
  "withania somnifera": "ashwagandha"
}
```

## Unmatched herb classification

- Exact-species matches found in site data (`public/data/herbs.json`) among remaining unmatched workbook herbs: **0**
- Requires new canonical herb entries: **39**

## Canonical candidates (do not auto-create)

```json
[
  { "slug": "black-cohosh", "name": "Black Cohosh", "scientificName": "Actaea racemosa", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "kudzu", "name": "Kudzu", "scientificName": "Pueraria lobata", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "feverfew", "name": "Feverfew", "scientificName": "Tanacetum parthenium", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "pau-darco", "name": "Pau d'Arco", "scientificName": "Handroanthus impetiginosus", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "banaba", "name": "Banaba", "scientificName": "Lagerstroemia speciosa", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "mulberry-leaf", "name": "Mulberry Leaf", "scientificName": "Morus alba", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "cissus", "name": "Cissus", "scientificName": "Cissus quadrangularis", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "ashitaba", "name": "Ashitaba", "scientificName": "Angelica keiskei", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "arjuna", "name": "Arjuna", "scientificName": "Terminalia arjuna", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "cranberry", "name": "Cranberry", "scientificName": "Vaccinium macrocarpon", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "myrtle", "name": "Myrtle", "scientificName": "Myrtus communis", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "acerola", "name": "Acerola", "scientificName": "Malpighia emarginata", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "mangosteen", "name": "Mangosteen", "scientificName": "Garcinia mangostana", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "suma", "name": "Suma", "scientificName": "Pfaffia paniculata", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "maral-root", "name": "Maral Root", "scientificName": "Rhaponticum carthamoides", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "ashoka", "name": "Ashoka", "scientificName": "Saraca asoca", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "carob", "name": "Carob", "scientificName": "Ceratonia siliqua", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "eucommia", "name": "Eucommia", "scientificName": "Eucommia ulmoides", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "cistanche", "name": "Cistanche", "scientificName": "Cistanche deserticola", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "longan", "name": "Longan", "scientificName": "Dimocarpus longan", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "white-peony", "name": "White Peony", "scientificName": "Paeonia lactiflora", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "codonopsis", "name": "Codonopsis", "scientificName": "Codonopsis pilosula", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "ophiopogon", "name": "Ophiopogon", "scientificName": "Ophiopogon japonicus", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "houttuynia", "name": "Houttuynia", "scientificName": "Houttuynia cordata", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "isatis", "name": "Isatis", "scientificName": "Isatis tinctoria", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "notoginseng", "name": "Notoginseng", "scientificName": "Panax notoginseng", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "luo-han-guo", "name": "Luo Han Guo", "scientificName": "Siraitia grosvenorii", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "kuding-tea", "name": "Kuding Tea", "scientificName": "Ilex kudingcha", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "maitake-d-fraction", "name": "Maitake D-Fraction", "scientificName": "Grifola frondosa", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "rehmannia-prepared", "name": "Rehmannia Prepared", "scientificName": "Rehmannia glutinosa praeparata", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "agarikon", "name": "Agarikon", "scientificName": "Fomitopsis officinalis", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "black-pepper", "name": "Black Pepper", "scientificName": "Piper nigrum", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "cardamom", "name": "Cardamom", "scientificName": "Elettaria cardamomum", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "caraway", "name": "Caraway", "scientificName": "Carum carvi", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "ajwain", "name": "Ajwain", "scientificName": "Trachyspermum ammi", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "curry-leaf", "name": "Curry Leaf", "scientificName": "Murraya koenigii", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "turkey-tail", "name": "Turkey Tail", "scientificName": "Trametes versicolor", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "rooibos", "name": "Rooibos", "scientificName": "Aspalathus linearis", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" },
  { "slug": "coleus-forskohlii", "name": "Coleus Forskohlii", "scientificName": "Coleus forskohlii", "sourceWorkbook": "data-sources/herb_monograph_master.xlsx#Herb Monographs" }
]
```
