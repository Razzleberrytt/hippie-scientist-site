import DecisionSnapshot from '@/components/decision-snapshot'

// (keep existing imports above)

// inside HerbDetailPage, AFTER label + leadText definitions:

const bestFor = sentenceList(unique(list(herb.primary_effects)).slice(0,3))
const timeToEffect = text(herb.time_to_effect) || 'Varies'
const evidence = text(herb.evidence_grade) || 'Limited'
const safetySummary = sentenceList(safetyItems)

// then modify return JSX:

return (
  <div className='space-y-6'>

    <DecisionSnapshot
      verdict={safetySummary}
      bestFor={bestFor}
      safety={safetySummary}
      timeToEffect={timeToEffect}
      evidence={evidence}
    />

    {/* EXISTING CONTENT BELOW */}

    <section className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
      <h2 className='text-lg font-bold text-white/90'>Who this is for</h2>
      <p className='text-sm text-white/80 mt-2'>
        Best suited for people looking for {bestFor || 'general support'} with moderate safety considerations.
      </p>
    </section>

    <section className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
      <h2 className='text-lg font-bold text-white/90'>What to expect</h2>
      <p className='text-sm text-white/80 mt-2'>
        Effects typically appear in {timeToEffect}. Evidence strength is {evidence.toLowerCase()}.
      </p>
    </section>

