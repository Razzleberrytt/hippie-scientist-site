interface BuyingQualityPrimerProps {
  ingredientName?: string
  isMineral?: boolean
}

const topics = [
  {
    title: 'Standardized extracts',
    body: 'For botanicals, an extract name or standardization can matter because a trial may have studied a defined preparation rather than generic plant powder. Do not assume evidence transfers automatically to every extract.',
  },
  {
    title: 'Clinically studied forms',
    body: 'Match the form on the label to the form used in the relevant human evidence when the form changes absorption, composition, or active-constituent exposure.',
  },
  {
    title: 'Active marker percentages',
    body: 'Marker percentages help identify what an extract contains and make batches easier to compare. A higher percentage is not automatically more effective or safer.',
  },
  {
    title: 'Elemental mineral amounts',
    body: 'Mineral labels can list the weight of a compound and the smaller elemental amount the body actually receives. Compare products using the elemental amount when that is the relevant dose metric.',
  },
  {
    title: 'Proprietary blends',
    body: 'A proprietary blend can hide the amount of each ingredient. That makes it harder to compare a product with studied doses and harder to reason about stacking or safety.',
  },
  {
    title: 'COAs and third-party testing',
    body: 'A useful certificate of analysis should be tied to the product or batch and should show what was actually tested. “Lab tested” without an accessible scope or result is a weaker quality signal.',
  },
  {
    title: 'Contaminant risk',
    body: 'Relevant testing can include heavy metals, microbes, residual solvents, pesticides, or other contaminants depending on the ingredient and manufacturing process.',
  },
  {
    title: 'Adulteration risk',
    body: 'Identity testing matters most in categories with substitution, undeclared drug ingredients, or economically motivated adulteration. Product-quality scoring should reward documented controls rather than marketing language.',
  },
]

export default function BuyingQualityPrimer({ ingredientName = 'this supplement', isMineral = false }: BuyingQualityPrimerProps) {
  return (
    <section className='space-y-5 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8' aria-labelledby='buying-quality-primer-heading'>
      <div>
        <p className='eyebrow-label'>What to look for when buying {ingredientName}</p>
        <h2 id='buying-quality-primer-heading' className='mt-2 text-2xl font-bold tracking-tight text-ink'>Product quality is a separate question from efficacy</h2>
        <p className='mt-3 max-w-4xl text-sm leading-6 text-muted'>A well-made product can contain an ingredient with weak evidence, and an evidence-supported ingredient can be sold in a poor-quality product. The Hippie Scientist keeps those judgments separate.</p>
      </div>

      <div className='grid gap-3 md:grid-cols-2'>
        {topics.filter((topic) => isMineral || topic.title !== 'Elemental mineral amounts').map((topic) => (
          <article key={topic.title} className='rounded-2xl border border-brand-900/10 bg-brand-50/45 p-4'>
            <h3 className='font-bold text-ink'>{topic.title}</h3>
            <p className='mt-2 text-sm leading-6 text-muted'>{topic.body}</p>
          </article>
        ))}
      </div>

      <div className='grid gap-3 sm:grid-cols-3'>
        <div className='rounded-xl border border-emerald-900/15 bg-emerald-50 p-4'><p className='text-xs font-bold uppercase tracking-wide text-emerald-900'>Evidence score</p><p className='mt-2 text-sm leading-6 text-emerald-950'>Based on research for the ingredient/outcome. Product testing and retailer economics do not raise it.</p></div>
        <div className='rounded-xl border border-sky-900/15 bg-sky-50 p-4'><p className='text-xs font-bold uppercase tracking-wide text-sky-900'>Product-quality score</p><p className='mt-2 text-sm leading-6 text-sky-950'>Based on label transparency, form, testing, COA, contamination/adulteration controls, and formulation verification.</p></div>
        <div className='rounded-xl border border-amber-900/15 bg-amber-50 p-4'><p className='text-xs font-bold uppercase tracking-wide text-amber-900'>Affiliate economics</p><p className='mt-2 text-sm leading-6 text-amber-950'>Commission may affect whether a retailer link exists. It is not an input to either evidence or product-quality scoring.</p></div>
      </div>
    </section>
  )
}
