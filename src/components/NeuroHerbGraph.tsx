import React, { useEffect, useRef } from 'react'
import Plotly from 'plotly.js-dist-min'
import { forceSimulation, forceManyBody, forceLink, forceCenter } from 'd3-force'
import { useNavigate } from 'react-router-dom'
import neuroHerbGraphData from '../data/neuroHerbGraphData'

const colorMap: Record<string, string> = {
  'MAOI': '#f87171',
  'SSRI-like': '#f472b6',
  'L-DOPA': '#fbbf24',
  'Dopamine agonist': '#fbbf24',
  'GABA agonist': '#34d399',
  'GABAergic': '#34d399',
  'Cholinergic': '#60a5fa',
  'AChE inhibitor': '#60a5fa'
}

export default function NeuroHerbGraph() {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    const { nodes, links } = neuroHerbGraphData
    const sim = forceSimulation(nodes as any)
      .force('link', forceLink(links as any).id((d: any) => d.id).distance(120))
      .force('charge', forceManyBody().strength(-300))
      .force('center', forceCenter(0, 0))
      .stop()

    for (let i = 0; i < 300; i++) sim.tick()

    const edgeX: number[] = []
    const edgeY: number[] = []
    links.forEach(l => {
      const s: any = nodes.find(n => n.id === l.source)
      const t: any = nodes.find(n => n.id === l.target)
      edgeX.push(s.x, t.x, NaN)
      edgeY.push(s.y, t.y, NaN)
    })

    const nodeX = nodes.map((n: any) => n.x)
    const nodeY = nodes.map((n: any) => n.y)
    const text = nodes.map(n =>
      n.type === 'herb' && n.effect ? `${n.label} – ${n.effect}` : n.label
    )
    const markerColor = nodes.map(n =>
      n.type === 'neuro' ? '#fef08a' : colorMap[n.effect ?? ''] || '#a5b4fc'
    )
    const markerSize = nodes.map(n => (n.type === 'neuro' ? 28 : 16))

    const edgeTrace = {
      x: edgeX,
      y: edgeY,
      mode: 'lines' as const,
      line: { color: '#94a3b8', width: 1 },
      hoverinfo: 'none'
    }

    const nodeTrace = {
      x: nodeX,
      y: nodeY,
      text,
      mode: 'markers' as const,
      hovertemplate: '%{text}<extra></extra>',
      marker: {
        size: markerSize,
        color: markerColor,
        line: { width: 2, color: '#fff' }
      }
    }

    const layout = {
      showlegend: false,
      hovermode: 'closest' as const,
      dragmode: 'pan' as const,
      margin: { t: 20, b: 20, l: 20, r: 20 },
      xaxis: { visible: false },
      yaxis: { visible: false }
    }

    if (ref.current) {
      Plotly.newPlot(ref.current, [edgeTrace, nodeTrace], layout, {
        responsive: true,
        displayModeBar: false
      }).then(div => {
        div.on('plotly_click', ev => {
          const point = ev.points[0]
          if (!point) return
          const idx = point.pointIndex
          const node = nodes[idx]
          if (node.type === 'herb' && node.slug) {
            navigate(`/herbs/${node.slug}`)
          }
        })
      })
    }
  }, [navigate])

  return <div ref={ref} className='h-[600px] w-full' />
}
