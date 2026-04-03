import type { HerbRecommendation } from '@/types/recommendations'

export const herbRecommendations: HerbRecommendation[] = [
  {
    herbSlug: 'ashwagandha',
    recommendedForms: ['capsule', 'powder', 'extract'],
    preferredAttributes: [
      'root-only labeling',
      'standardized withanolide content',
      'clear per-serving dosage',
      'third-party tested',
    ],
    avoidFlags: [
      'proprietary blends that hide the ashwagandha amount',
      'leaf-heavy formulas when root is expected',
      'unclear extract ratio or no standardization details',
    ],
    shoppingNotes:
      'Capsules and labeled extracts are usually the easiest formats to compare. Powder can work when the seller clearly states root form and serving size.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'bacopa-monnieri',
    recommendedForms: ['capsule', 'powder', 'extract'],
    preferredAttributes: [
      'bacoside standardization details',
      'single-herb formula',
      'third-party tested',
      'batch or lot transparency',
    ],
    avoidFlags: [
      'blends that do not list bacopa content',
      'labels with no standardization or extract details',
      'marketing claims without dosage clarity',
    ],
    shoppingNotes:
      'Standardized capsules are usually easier to compare than mixed nootropic blends. Choose a format with a plainly labeled serving amount.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'calendula-officinalis',
    recommendedForms: ['tea', 'loose herb', 'tincture'],
    preferredAttributes: [
      'vibrant flower material',
      'single-herb labeling',
      'organic when available',
      'clear plant part identification',
    ],
    avoidFlags: [
      'dull or heavily broken flower material',
      'unclear plant part labeling',
      'multi-herb blends when you want to assess calendula itself',
    ],
    shoppingNotes:
      'For tea or loose herb, color and plant-part clarity matter. Tinctures are easier to compare when the herb-to-solvent ratio is disclosed.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'chamomile',
    recommendedForms: ['tea', 'loose herb', 'tincture'],
    preferredAttributes: [
      'whole flower heads or clearly identified flowers',
      'single-herb tea',
      'organic when possible',
      'fresh aroma and harvest transparency',
    ],
    avoidFlags: [
      'tea blends where chamomile amount is unclear',
      'dusty low-aroma material',
      'labels that do not identify the flower as the main ingredient',
    ],
    shoppingNotes:
      'Tea is the simplest format for most buyers. Loose flowers can be a good step up if the seller shows clean, aromatic flower material rather than generic filler.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'echinacea-purpurea',
    recommendedForms: ['tincture', 'capsule', 'tea'],
    preferredAttributes: [
      'species clearly identified',
      'plant part disclosed',
      'single-herb formula',
      'third-party tested',
    ],
    avoidFlags: [
      'products that do not name the echinacea species',
      'blends that make the actual echinacea amount unclear',
      'vague extract descriptions',
    ],
    shoppingNotes:
      'Species and plant-part labeling are more helpful than flashy immune-marketing language. Choose products that make those details easy to verify.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'ginger',
    recommendedForms: ['capsule', 'tea', 'powder', 'extract'],
    preferredAttributes: [
      'root or rhizome clearly identified',
      'single-herb formula',
      'gingerol standardization for extracts when provided',
      'clear serving size',
    ],
    avoidFlags: [
      'candy-style products sold as supplements',
      'blends with unclear ginger quantity',
      'weak labeling around root content',
    ],
    shoppingNotes:
      'Powder and tea are practical everyday formats. For capsules or extracts, choose labels that make the ginger amount and form easy to compare.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'peppermint',
    recommendedForms: ['tea', 'loose herb', 'capsule', 'tincture'],
    preferredAttributes: [
      'leaf identified clearly',
      'fresh aroma',
      'single-herb preparation',
      'enteric-coated capsules when the label specifies it',
    ],
    avoidFlags: [
      'tea blends where peppermint is secondary',
      'stale or low-aroma leaf material',
      'capsules with weak serving details',
    ],
    shoppingNotes:
      'Tea or loose leaf is usually the easiest starting point. Capsule products are easier to compare when the label clearly explains the format and serving amount.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'reishi-mushroom',
    recommendedForms: ['extract', 'capsule', 'powder'],
    preferredAttributes: [
      'fruiting body disclosure',
      'beta-glucan testing or standardization',
      'extraction method transparency',
      'third-party tested',
    ],
    avoidFlags: [
      'mycelium-on-grain products with vague active-content labeling',
      'no beta-glucan or extract detail',
      'proprietary mushroom blends',
    ],
    shoppingNotes:
      'Extract-based products are usually easier to compare than generic mushroom powders. Look for fruiting body and testing details before marketing language.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'rhodiola-rosea',
    recommendedForms: ['capsule', 'extract', 'tincture'],
    preferredAttributes: [
      'rhodiola rosea species named clearly',
      'rosavin and salidroside standardization details',
      'third-party tested',
      'simple formula',
    ],
    avoidFlags: [
      'products that only say rhodiola without species detail',
      'unclear standardization',
      'energy blends that obscure rhodiola dosage',
    ],
    shoppingNotes:
      'Standardized extracts are usually the most comparable option. Skip products that lean on adaptogen marketing but do not explain the exact extract profile.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'sambucus-nigra',
    recommendedForms: ['extract', 'tincture', 'tea'],
    preferredAttributes: [
      'species identified as sambucus nigra',
      'berry-focused labeling when that is the intended form',
      'sugar content disclosed for syrups or liquids',
      'single-herb clarity',
    ],
    avoidFlags: [
      'syrups that read more like sweeteners than herb products',
      'species not identified',
      'blend-heavy labels with unclear elderberry content',
    ],
    shoppingNotes:
      'Liquid extracts can be practical, but compare the actual herb content rather than front-label syrup claims. Tea works best when the ingredient panel stays simple.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'silybum-marianum',
    recommendedForms: ['capsule', 'extract', 'softgel'],
    preferredAttributes: [
      'silymarin standardization details',
      'seed identified clearly',
      'third-party tested',
      'clear per-serving dosage',
    ],
    avoidFlags: [
      'milk thistle blends with hidden herb amounts',
      'no silymarin or extract detail',
      'weak serving-size disclosure',
    ],
    shoppingNotes:
      'Capsules or softgels are usually the easiest formats to compare. Look for seed-based standardized extracts instead of vague detox-focused branding.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'tulsi',
    recommendedForms: ['tea', 'tincture', 'capsule'],
    preferredAttributes: [
      'single-herb tulsi',
      'species or leaf identification when available',
      'organic when possible',
      'clear serving size',
    ],
    avoidFlags: [
      'stress blends where tulsi amount is hidden',
      'labels that do not make the herb form clear',
      'tea products with mostly flavoring ingredients',
    ],
    shoppingNotes:
      'Tea is often the most practical entry point. For tinctures or capsules, favor simple labels over broad wellness blends that make tulsi hard to evaluate.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'turmeric',
    recommendedForms: ['capsule', 'powder', 'extract'],
    preferredAttributes: [
      'curcuminoid standardization for extracts',
      'root identified clearly',
      'third-party tested',
      'clear serving amount',
    ],
    avoidFlags: [
      'proprietary blends that hide turmeric quantity',
      'extracts with no curcuminoid detail',
      'capsules padded with unnecessary filler blends',
    ],
    shoppingNotes:
      'Powder is practical for kitchen use, while capsules and extracts are easier to compare for consistent labeled intake. Prioritize transparent curcuminoid details when choosing extracts.',
    recommendationConfidence: 'high',
  },
  {
    herbSlug: 'urtica-dioica',
    recommendedForms: ['tea', 'capsule', 'loose herb', 'extract'],
    preferredAttributes: [
      'plant part identified clearly',
      'single-herb labeling',
      'organic when available',
      'clean dried material',
    ],
    avoidFlags: [
      'labels that never state leaf, root, or seed',
      'dusty low-detail bulk material',
      'blend products with unclear nettle content',
    ],
    shoppingNotes:
      'Plant-part clarity matters more than bold marketing language. Tea and loose herb are easy to assess visually, while capsules should make the exact nettle form obvious.',
    recommendationConfidence: 'medium',
  },
  {
    herbSlug: 'valerian-root',
    recommendedForms: ['capsule', 'tincture', 'tea', 'extract'],
    preferredAttributes: [
      'root identified clearly',
      'strong natural aroma',
      'single-herb formula',
      'clear extract or serving information',
    ],
    avoidFlags: [
      'sleep blends that hide valerian quantity',
      'low-aroma material that may be old',
      'labels with no root or extract detail',
    ],
    shoppingNotes:
      'Capsules and tinctures are usually the easiest to compare. For tea or loose material, aroma and root identification give useful quality signals.',
    recommendationConfidence: 'high',
  },
]
