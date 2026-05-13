'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import { graphNodeColor, type SemanticGraphEdge, type SemanticGraphNode } from '@/lib/semantic-graph-visuals'

type InteractiveSemanticGraphProps = {
  title?: string
  description?: string
  nodes: SemanticGraphNode[]
  edges: SemanticGraphEdge[]
  hrefForNode?: Record<string, string>
}

function position(index: number, total: number) {
  const angle = (Math.PI * 2 * index) / Math.max(total, 1)
  const radius = total > 12 ? 39 : 33

  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  }
}

function relationshipLabel(edge: SemanticGraphEdge) {
  return edge.relationship
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

export default function InteractiveSemanticGraph({
  title = 'Interactive semantic graph',
  description = 'Select nodes to inspect relationship density, pathway continuity, and graph-native exploration branches.',
  nodes,
  edges,
  hrefForNode = {},
}: InteractiveSemanticGraphProps) {
  const [selectedId, setSelectedId] = useState(nodes[0]?.id || '')

  const positioned = useMemo(() => nodes.map((node, index) => ({
    ...node,
    ...position(index, nodes.length),
  })), [nodes])

  const selectedNode = positioned.find((node) => node.id === selectedId) || positioned[0]

  const selectedEdges = edges.filter((edge) =>
    edge.source === selectedNode?.id || edge.target === selectedNode?.id,
  )

  function findNode(id: string) {
    return positioned.find((node) => node.id === id)
  }

  if (!positioned.length) return null

  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(300px,0.8fr)] lg:items-start">
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <p className="eyebrow-label">Interactive Graph</p>
              <span className="chip-readable">Node inspection</span>
            </div>

            <h2 className="compact-heading">{title}</h2>
            <p className="compact-copy">{description}</p>
          </div>

          <div className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/[0.82] p-4 shadow-sm backdrop-blur-xl sm:p-6">
            <svg
              viewBox="0 0 100 100"
              className="h-[440px] w-full"
              role="img"
              aria-label="Interactive semantic graph"
            >
              <defs>
                <radialGradient id="interactiveGraphGlow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.98)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              <circle cx="50" cy="50" r="45" fill="url(#interactiveGraphGlow)" />

              {edges.map((edge, index) => {
                const source = findNode(edge.source)
                const target = findNode(edge.target)
                const active = selectedNode && (edge.source === selectedNode.id || edge.target === selectedNode.id)

                if (!source || !target) return null

                return (
                  <line
                    key={`${edge.source}-${edge.target}-${index}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={active ? 'rgba(47,125,75,0.58)' : 'rgba(71,85,105,0.18)'}
                    strokeWidth={active ? Math.max(0.35, edge.weight * 0.11) : Math.max(0.18, edge.weight * 0.06)}
                  />
                )
              })}

              {positioned.map((node) => {
                const active = node.id === selectedNode?.id

                return (
                  <g key={node.id} className="cursor-pointer" onClick={() => setSelectedId(node.id)}>
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={Math.max(active ? 3.6 : 2.4, node.weight * (active ? 1.05 : 0.82))}
                      fill={graphNodeColor(node.type)}
                      fillOpacity={active ? 1 : 0.82}
                      stroke={active ? 'rgba(20,83,45,0.95)' : 'rgba(255,255,255,0.95)'}
                      strokeWidth={active ? '0.75' : '0.45'}
                    />

                    <text
                      x={node.x}
                      y={node.y + Math.max(5.5, node.weight + 3)}
                      textAnchor="middle"
                      fontSize={active ? '2.55' : '2.15'}
                      fill={active ? '#163822' : '#344256'}
                      style={{ letterSpacing: '0.02em' }}
                    >
                      {node.label.length > 22 ? `${node.label.slice(0, 22)}…` : node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </div>

        <aside className="compact-card section-rhythm-compact lg:sticky lg:top-6">
          <div className="space-y-2">
            <p className="eyebrow-label">Selected Node</p>
            <h3 className="max-w-none text-2xl font-semibold tracking-tight text-ink">
              {selectedNode?.label}
            </h3>
            <div className="flex flex-wrap gap-2">
              <span className="chip-readable">{selectedNode?.type}</span>
              <span className="chip-readable">weight {selectedNode?.weight}</span>
              <span className="chip-readable">{selectedEdges.length} links</span>
            </div>
          </div>

          <div className="space-y-3 border-t border-brand-900/10 pt-4">
            <p className="eyebrow-label">Connected relationships</p>
            {selectedEdges.length > 0 ? (
              <div className="grid gap-2">
                {selectedEdges.slice(0, 8).map((edge, index) => {
                  const otherId = edge.source === selectedNode?.id ? edge.target : edge.source
                  const other = findNode(otherId)

                  return (
                    <button
                      key={`${edge.source}-${edge.target}-${index}`}
                      type="button"
                      onClick={() => other && setSelectedId(other.id)}
                      className="rounded-2xl border border-brand-900/10 bg-white/70 px-3 py-2 text-left transition hover:border-brand-700/30 hover:bg-white"
                    >
                      <span className="block text-sm font-semibold text-ink">{other?.label || otherId}</span>
                      <span className="block text-xs leading-5 text-[#64766b]">
                        {relationshipLabel(edge)} · weight {edge.weight}
                      </span>
                    </button>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm leading-6 text-[#46574d]">No direct relationships available for this node.</p>
            )}
          </div>

          <div className="space-y-3 border-t border-brand-900/10 pt-4">
            <p className="eyebrow-label">Graph action</p>
            {selectedNode && hrefForNode[selectedNode.id] ? (
              <Link href={hrefForNode[selectedNode.id]} className="button-primary inline-flex rounded-full px-5 py-3 text-sm">
                Open selected node →
              </Link>
            ) : (
              <p className="text-sm leading-6 text-[#46574d]">
                Select a profile node with a route connection to open the full semantic page.
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-brand-900/10 pt-4">
            {[selectedNode?.type || 'semantic', 'relationship', 'pathway'].map((signal) => (
              <PathwayVisualChip key={signal} pathway={signal} />
            ))}
          </div>
        </aside>
      </div>
    </section>
  )
}
