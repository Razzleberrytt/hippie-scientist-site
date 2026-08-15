import type { ReactNode } from 'react'

export type AnswerEngineColumn<Row> = {
  key: string
  header: string
  render: (row: Row) => ReactNode
}

type AnswerEngineTableProps<Row> = {
  id: string
  caption: string
  columns: AnswerEngineColumn<Row>[]
  rows: Row[]
  rowKey: (row: Row, index: number) => string
  definition?: string
}

/**
 * Semantic table primitive for compact, extractable research facts.
 * Requires a caption and explicit column headers instead of visual-only grids.
 */
export default function AnswerEngineTable<Row>({
  id,
  caption,
  columns,
  rows,
  rowKey,
  definition,
}: AnswerEngineTableProps<Row>) {
  return (
    <section id={id} className="scroll-mt-24 space-y-3" data-answer-engine-table="true">
      {definition ? <p className="text-sm leading-6 text-muted"><strong>Definition:</strong> {definition}</p> : null}
      <div className="overflow-x-auto rounded-xl border border-brand-900/10 dark:border-white/10">
        <table className="w-full border-collapse text-left text-sm">
          <caption className="p-3 text-left font-semibold text-ink">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} scope="col" className="border-t border-brand-900/10 px-3 py-2 font-semibold text-ink dark:border-white/10">
                  {column.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={rowKey(row, index)}>
                {columns.map((column, columnIndex) => (
                  columnIndex === 0 ? (
                    <th key={column.key} scope="row" className="border-t border-brand-900/10 px-3 py-2 font-medium text-ink dark:border-white/10">
                      {column.render(row)}
                    </th>
                  ) : (
                    <td key={column.key} className="border-t border-brand-900/10 px-3 py-2 text-muted dark:border-white/10">
                      {column.render(row)}
                    </td>
                  )
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <a href={`#${id}`} className="sr-only">Permanent link to this table</a>
    </section>
  )
}
