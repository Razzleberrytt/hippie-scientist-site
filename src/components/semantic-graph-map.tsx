'use client'

import { useState, useMemo } from 'react'
import { Search, X, SlidersHorizontal, Info, RefreshCw } from 'lucide-react'
import { graphNodeColor, type SemanticGraphEdge, type SemanticGraphNode } from '../lib/semantic-graph-visuals'

type SemanticGraphMapProps = {
  title?: string
  description?: string
  nodes: SemanticGraphNode[]
  edges: SemanticGraphEdge[]
}

function position(index: number, total: number) {
  const angle = (Math.PI * 2 * index) / Math.max(total, 1)
  const radius = total > 8 ? 38 : 32

  return {
    x: 50 + radius * Math.cos(angle),
    y: 50 + radius * Math.sin(angle),
  }
}

export default function SemanticGraphMap({
  title = 'Semantic relationship map',
  description,
  nodes = [],
  edges = [],
}: SemanticGraphMapProps) {
  // Local state for interactive filtering
  const [searchQuery, setSearchQuery] = useState('')
  const [minWeight, setMinWeight] = useState<number>(1)
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null)

  // Set of active node types to display
  const [visibleTypes, setVisibleTypes] = useState<Set<string>>(
    new Set(['source', 'mechanism', 'pathway', 'effect', 'evidence', 'ecosystem'])
  )

  const toggleType = (type: string) => {
    const next = new Set(visibleTypes)
    if (next.has(type)) {
      // Don't disable 'source' or make it completely empty if we can help it
      if (type === 'source') return
      next.delete(type)
    } else {
      next.add(type)
    }
    setVisibleTypes(next)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setMinWeight(1)
    setVisibleTypes(new Set(['source', 'mechanism', 'pathway', 'effect', 'evidence', 'ecosystem']))
    setHoveredNodeId(null)
  }

  // 1. Filter nodes based on user selections
  const filteredNodes = useMemo(() => {
    return nodes.filter(node => {
      // Source node is always visible for structural sanity
      if (node.type === 'source') return true

      // Filter by type toggles
      if (!visibleTypes.has(node.type)) return false

      // Filter by weight threshold
      if (node.weight < minWeight) return false

      // Filter by search text query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const match = node.label.toLowerCase().includes(query) || node.id.toLowerCase().includes(query)
        if (!match) return false
      }

      return true
    })
  }, [nodes, visibleTypes, minWeight, searchQuery])

  // Get filtered node ID set for edge matching
  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes])

  // 2. Filter edges corresponding to active nodes
  const filteredEdges = useMemo(() => {
    return edges.filter(edge => {
      return filteredNodeIds.has(edge.source) && filteredNodeIds.has(edge.target)
    })
  }, [edges, filteredNodeIds])

  // 3. Recalculate layout dynamically for the filtered set to prevent empty gaps
  const positioned = useMemo(() => {
    return filteredNodes.map((node, index) => ({
      ...node,
      ...position(index, filteredNodes.length),
    }))
  }, [filteredNodes])

  function findNode(id: string) {
    return positioned.find((node) => node.id === id)
  }

  // 4. Hover path tracing logic
  const connectedNodeIds = useMemo(() => {
    if (!hoveredNodeId) return null
    const ids = new Set<string>([hoveredNodeId])
    filteredEdges.forEach(edge => {
      if (edge.source === hoveredNodeId) ids.add(edge.target)
      if (edge.target === hoveredNodeId) ids.add(edge.source)
    })
    return ids
  }, [hoveredNodeId, filteredEdges])

  // Node type legend configurations
  const typeConfigs = [
    { type: 'source', label: 'Central profile', color: '#2f7d4b' },
    { type: 'mechanism', label: 'Mechanism', color: '#2b5fa8' },
    { type: 'pathway', label: 'Pathway', color: '#5f55a4' },
    { type: 'effect', label: 'Primary effect', color: '#a35f20' },
    { type: 'evidence', label: 'Clinical evidence', color: '#247a52' },
    { type: 'ecosystem', label: 'Ecosystem', color: '#566470' },
  ]

  if (!nodes || nodes.length === 0) return null

  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Interactive Semantic Graph</p>
          <span className="chip-readable">Dynamic relationship map</span>
        </div>

        <h2 className="compact-heading">{title}</h2>

        {description ? (
          <p className="compact-copy">{description}</p>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/[0.82] p-4 shadow-sm backdrop-blur-xl sm:p-6 space-y-6">

        {/* Dynamic Controls Dashboard */}
        <div className="grid gap-4 md:grid-cols-3 border-b border-brand-900/5 pb-5">

          {/* Node Search Bar */}
          <div className="space-y-2">
            <label htmlFor="node-search" className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
              <Search className="h-3 w-3" /> Search Nodes
            </label>
            <div className="relative">
              <input
                id="node-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type to filter nodes (e.g. stress, serotonin)..."
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-brand-900/10 focus:border-brand-700 bg-white/70 text-xs text-ink placeholder:text-muted/65 transition focus:outline-none focus:ring-1 focus:ring-brand-750/30"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted hover:text-ink transition"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Weight Threshold Slider */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="weight-slider" className="text-xs font-bold uppercase tracking-wider text-muted flex items-center gap-1">
                <SlidersHorizontal className="h-3 w-3" /> Min Connection Strength
              </label>
              <span className="text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                Tier {minWeight}+
              </span>
            </div>
            <input
              id="weight-slider"
              type="range"
              min="1"
              max="5"
              step="1"
              value={minWeight}
              onChange={(e) => setMinWeight(Number(e.target.value))}
              className="w-full accent-brand-700 h-1.5 bg-brand-900/10 rounded-lg appearance-none cursor-pointer mt-3"
            />
          </div>

          {/* Actions & Help Summary */}
          <div className="flex items-end justify-between md:justify-end gap-3">
            <div className="text-[10px] text-muted flex items-center gap-1.5 max-w-[160px] md:max-w-xs leading-normal">
              <Info className="h-3.5 w-3.5 text-brand-750 shrink-0" />
              <span>Hover nodes to trace pathways. Click legend to hide types.</span>
            </div>
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 rounded-xl border border-brand-900/10 bg-white px-3 py-2 text-xs font-semibold text-ink transition hover:bg-brand-50/50 hover:border-brand-900/25 focus:outline-none"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>
        </div>

        {/* Legend Type Toggles */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-brand-700 block">
            Filter by relationship layer:
          </span>
          <div className="flex flex-wrap gap-2">
            {typeConfigs.map(({ type, label, color }) => {
              const isVisible = visibleTypes.has(type)
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  disabled={type === 'source'}
                  className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold transition border ${
                    type === 'source'
                      ? 'bg-emerald-50/40 border-brand-700 text-brand-800 opacity-90 cursor-default'
                      : isVisible
                      ? 'bg-white shadow-sm hover:bg-brand-50/50 border-brand-900/10 text-ink'
                      : 'bg-brand-950/[0.02] border-brand-900/5 text-muted line-through opacity-50 hover:opacity-70'
                  }`}
                >
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span>{label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Dynamic SVG Canvas */}
        <div className="relative overflow-hidden rounded-2xl border border-brand-900/5 bg-slate-50/30 p-2 sm:p-4">
          {positioned.length > 0 ? (
            <svg
              viewBox="0 0 100 100"
              className="h-[420px] w-full"
              role="img"
              aria-label="Semantic relationship graph"
            >
              <defs>
                <radialGradient id="graphGlow" cx="50%" cy="50%" r="70%">
                  <stop offset="0%" stopColor="rgba(255,255,255,0.95)" />
                  <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                </radialGradient>
              </defs>

              <circle cx="50" cy="50" r="44" fill="url(#graphGlow)" />

              {/* Edge/Connection Lines */}
              {filteredEdges.map((edge, index) => {
                const source = findNode(edge.source)
                const target = findNode(edge.target)

                if (!source || !target) return null

                const isTraceActive = hoveredNodeId !== null
                const isEdgeHighlighted = hoveredNodeId === edge.source || hoveredNodeId === edge.target
                const isDimmed = isTraceActive && !isEdgeHighlighted

                return (
                  <line
                    key={`${edge.source}-${edge.target}-${index}`}
                    x1={source.x}
                    y1={source.y}
                    x2={target.x}
                    y2={target.y}
                    stroke={isEdgeHighlighted ? '#2b7ea8' : 'rgba(71,85,105,0.22)'}
                    strokeWidth={isEdgeHighlighted ? Math.max(0.4, edge.weight * 0.14) : Math.max(0.2, edge.weight * 0.08)}
                    className="transition-all duration-300 ease-in-out"
                    style={{ opacity: isDimmed ? 0.08 : 1 }}
                  />
                )
              })}

              {/* Node Circles and Labels */}
              {positioned.map((node) => {
                const isHovered = hoveredNodeId === node.id
                const isConnected = connectedNodeIds ? connectedNodeIds.has(node.id) : true
                const isDimmed = hoveredNodeId !== null && !isConnected

                return (
                  <g
                    key={node.id}
                    className="cursor-pointer group"
                    onMouseEnter={() => setHoveredNodeId(node.id)}
                    onMouseLeave={() => setHoveredNodeId(null)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={isHovered ? Math.max(2.8, node.weight * 1.05) : Math.max(2.2, node.weight * 0.85)}
                      fill={graphNodeColor(node.type)}
                      fillOpacity={isDimmed ? 0.15 : 0.88}
                      stroke={isHovered ? '#1e293b' : 'rgba(255,255,255,0.95)'}
                      strokeWidth={isHovered ? '0.75' : '0.45'}
                      className="transition-all duration-300 ease-in-out"
                    />

                    <text
                      x={node.x}
                      y={node.y + Math.max(5.5, node.weight + 3)}
                      textAnchor="middle"
                      fontSize="2.2"
                      fill={isHovered ? '#0f172a' : '#344256'}
                      style={{
                        letterSpacing: '0.02em',
                        fontWeight: isHovered || (connectedNodeIds && node.id === hoveredNodeId) ? 'bold' : 'normal'
                      }}
                      fillOpacity={isDimmed ? 0.15 : 1}
                      className="transition-all duration-300 ease-in-out"
                    >
                      {node.label.length > 22
                        ? `${node.label.slice(0, 22)}…`
                        : node.label}
                    </text>
                  </g>
                )
              })}
            </svg>
          ) : (
            <div className="h-[420px] w-full flex flex-col items-center justify-center text-center p-6 space-y-3">
              <p className="text-sm font-semibold text-ink">No relationship nodes match the filter criteria.</p>
              <p className="text-xs text-muted max-w-sm">Try typing a different keyword, clearing your search query, or resetting filters below.</p>
              <button
                type="button"
                onClick={resetFilters}
                className="rounded-full bg-brand-850 hover:bg-brand-900 text-white text-xs py-2 px-4 font-bold shadow transition"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>

        {/* Traversal Badges footer */}
        <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-900/10 pt-4 text-xs text-muted">
          <span>Active Nodes: <strong>{filteredNodes.length}</strong></span>
          <span>•</span>
          <span>Active Connections: <strong>{filteredEdges.length}</strong></span>
        </div>
      </div>
    </section>
  )
}
