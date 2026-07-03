type Ref = { n: number; text: string; url?: string }

export default function References({ refs }: { refs: Ref[] }) {
  return (
    <section className="card-premium p-6 space-y-3 max-w-4xl">
      <h2 className="text-xl font-semibold text-ink">References</h2>
      <ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        {refs.map((ref) => (
          <li key={ref.n} id={`ref-${ref.n}`}>
            <span className="font-semibold text-ink">[{ref.n}]</span> {ref.text}
            {ref.url ? (
              <>
                {' '}
                <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline hover:text-brand-800">
                  PubMed →
                </a>
              </>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  )
}