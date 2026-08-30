'use client'

import { useMemo, useRef, useState } from 'react'

export interface AtlasGraphRecord {
  slug: string
  name: string
  compounds: string[]
  mechanisms?: string[]
  explicitEffects?: string[]
  effects: string[]
}

interface Props {
  records: AtlasGraphRecord[]
  compact?: boolean
}

const trimLabel = (value: string, max = 25) => value.length > max ? `${value.slice(0, max - 1)}…` : value

export default function BotanicalAtlasGraph({ records, compact = false }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)
  const [selectedSlug, setSelectedSlug] = useState(records[0]?.slug ?? '')

  const record = useMemo(
    () => records.find((item) => item.slug === selectedSlug) ?? records[0],
    [records, selectedSlug],
  )

  if (!record) return null

  const compounds = record.compounds.slice(0, 4)
  const mechanisms = (record.mechanisms ?? []).slice(0, 4)
  const outcomes = (record.explicitEffects?.length ? record.explicitEffects : record.effects).slice(0, 4)
  const columns = [
    { title: 'Botanical', items: [record.name], x: 12 },
    { title: 'Constituents', items: compounds.length ? compounds : ['Not mapped'], x: 242 },
    { title: 'Mechanisms', items: mechanisms.length ? mechanisms : ['Not mapped'], x: 472 },
    { title: 'Observed / assigned outcomes', items: outcomes.length ? outcomes : ['Not mapped'], x: 702 },
  ]

  const downloadSvg = () => {
    const svg = svgRef.current
    if (!svg) return
    const source = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `botanical-atlas-${record.slug}.svg`
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <section className={compact ? 'space-y-3' : 'space-y-4 rounded-2xl border border-brand-900/10 bg-white/90 p-5'}>
      <div className='flex flex-wrap items-end justify-between gap-3'>
        <div>
          {!compact ? <p className='eyebrow-label'>Relationship graph</p> : null}
          <h2 className={compact ? 'text-lg font-bold text-ink' : 'mt-1 text-2xl font-bold text-ink'}>Botanical → chemistry → pathway → outcome</h2>
          <p className='mt-1 max-w-3xl text-xs leading-5 text-muted'>Mechanisms are shown as mechanistic context, not as proof of a clinical outcome. Outcome nodes use explicit effect data when available.</p>
        </div>
        {!compact ? (
          <div className='flex flex-wrap items-end gap-2'>
            <label className='text-xs font-bold uppercase tracking-wide text-muted'>
              Botanical
              <select className='mt-1 block rounded-lg border border-brand-900/15 bg-white px-2 py-1.5 text-sm font-medium normal-case tracking-normal text-ink' value={record.slug} onChange={(event) => setSelectedSlug(event.target.value)}>
                {records.slice(0, 150).map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}
              </select>
            </label>
            <button type='button' onClick={downloadSvg} className='rounded-lg border border-brand-900/15 px-3 py-2 text-sm font-semibold text-ink hover:bg-brand-50'>Download SVG</button>
          </div>
        ) : null}
      </div>

      <div className='overflow-x-auto' aria-label={`Relationship graph for ${record.name}`}>
        <svg ref={svgRef} viewBox='0 0 920 300' role='img' aria-labelledby={`atlas-graph-title-${record.slug}`} className='min-w-[760px] w-full rounded-xl bg-brand-50/40'>
          <title id={`atlas-graph-title-${record.slug}`}>{record.name} constituent, mechanism, and outcome relationships</title>
          {columns.slice(0, -1).map((column, columnIndex) => {
            const currentItems = column.items
            const nextItems = columns[columnIndex + 1].items
            return currentItems.flatMap((_, currentIndex) => nextItems.map((__, nextIndex) => {
              const y1 = 82 + currentIndex * 48
              const y2 = 82 + nextIndex * 48
              return <line key={`${columnIndex}-${currentIndex}-${nextIndex}`} x1={column.x + 190} y1={y1} x2={columns[columnIndex + 1].x} y2={y2} stroke='currentColor' strokeOpacity='0.18' strokeWidth='1.5' />
            }))
          })}
          {columns.map((column, columnIndex) => (
            <g key={column.title}>
              <text x={column.x} y='28' fontSize='12' fontWeight='700' opacity='0.66'>{column.title}</text>
              {column.items.map((item, index) => {
                const y = 60 + index * 48
                const isMechanism = columnIndex === 2
                return <g key={`${column.title}-${item}-${index}`}>
                  <rect x={column.x} y={y} width='190' height='36' rx='9' fill='white' stroke='currentColor' strokeOpacity={isMechanism ? '0.28' : '0.14'} strokeDasharray={isMechanism ? '5 4' : undefined} />
                  <text x={column.x + 10} y={y + 22} fontSize='11' fontWeight={columnIndex === 0 ? '700' : '500'}>{trimLabel(item)}</text>
                </g>
              })}
            </g>
          ))}
          <text x='472' y='284' fontSize='10' opacity='0.65'>Dashed nodes = mechanism/pathway context, not demonstrated benefit.</text>
        </svg>
      </div>
    </section>
  )
}
