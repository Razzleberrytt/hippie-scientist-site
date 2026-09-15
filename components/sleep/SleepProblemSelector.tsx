import Link from 'next/link'

const PROBLEMS = [
  {
    title: 'I cannot fall asleep',
    label: 'Sleep onset',
    body: 'The useful research endpoint is sleep-onset latency: how long it takes to fall asleep. Do not assume an ingredient that changes onset will also reduce middle-of-the-night waking.',
    links: [
      ['Melatonin', '/compounds/melatonin/'],
      ['L-theanine', '/compounds/l-theanine/'],
    ],
  },
  {
    title: 'I fall asleep, then wake up',
    label: 'Sleep maintenance',
    body: 'Look for wake after sleep onset (WASO), awakenings and sleep efficiency. A supplement that improves sleep onset is not automatically a treatment for maintenance insomnia.',
    links: [
      ['Magnesium', '/compounds/magnesium/'],
      ['Sleep outcome explainer', '/articles/sleep-onset-vs-sleep-maintenance/'],
    ],
  },
  {
    title: 'My sleep timing is shifted',
    label: 'Circadian timing',
    body: 'Timing is a different question from sedation. Melatonin has its clearest rationale when the problem is circadian timing rather than simply wanting a stronger sleep aid.',
    links: [['Melatonin', '/compounds/melatonin/']],
  },
  {
    title: 'My mind is racing at night',
    label: 'Nighttime stress',
    body: 'If stress or racing thoughts are the main barrier, route to the dedicated nighttime-stress guide rather than assuming a generic sleep supplement is the right endpoint.',
    links: [['Nighttime stress guide', '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/']],
  },
  {
    title: 'I have persistent insomnia',
    label: 'Chronic insomnia',
    body: 'Do not let a supplement ranking obscure the treatment hierarchy. For chronic insomnia, CBT-I has substantially stronger guideline support than supplement stacking.',
    links: [['Read the chronic-insomnia section', '#insomnia']],
  },
]

export default function SleepProblemSelector() {
  return (
    <section id="sleep-problem" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-7">
      <p className="eyebrow-label">Start with the problem</p>
      <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">What part of sleep are you actually trying to change?</h2>
      <p className="mt-3 max-w-3xl text-sm leading-7 text-muted sm:text-base">
        “Better sleep” is too broad for an evidence comparison. Pick the outcome that matches the complaint before comparing ingredients. This keeps sleep-onset, sleep-maintenance and circadian evidence from being mixed together.
      </p>
      <div className="mt-5 grid gap-4 md:grid-cols-2">
        {PROBLEMS.map((problem) => (
          <article key={problem.label} className="rounded-xl border border-brand-900/10 bg-brand-50/35 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{problem.label}</p>
            <h3 className="mt-1 text-base font-semibold text-ink">{problem.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{problem.body}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm font-semibold">
              {problem.links.map(([label, href]) => (
                <Link key={href} href={href} className="text-brand-700 hover:underline">{label} →</Link>
              ))}
            </div>
          </article>
        ))}
      </div>
      <p className="mt-5 text-xs leading-5 text-muted">
        Research note: sleep-onset latency, wake after sleep onset, total sleep time and sleep efficiency are distinct outcomes. A statistically significant change in one does not prove a broad improvement in all of them.
      </p>
    </section>
  )
}
