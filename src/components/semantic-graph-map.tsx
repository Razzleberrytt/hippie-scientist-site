import { graphNodeColor, type SemanticGraphEdge, type SemanticGraphNode } from '@/lib/semantic-graph-visuals'

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
  nodes,
  edges,
}: SemanticGraphMapProps) {
  if (!nodes?.length) return null

  const positioned = nodes.map((node, index) => ({
    ...node,
    ...position(index, nodes.length),
  }))

  function findNode(id: string) {
    return positioned.find((node) => node.id === id)
  }

  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Semantic Graph</p>
          <span className="chip-readable">Interactive-style ecosystem map</span>
        </div>

        <h2 className="compact-heading">{title}</h2>

        {description ? (
          <p className="compact-copy">{description}</p>
        ) : null}
      </div>

      <div className="relative overflow-hidden rounded-[2rem] border border-brand-900/10 bg-white/[0.82] p-4 shadow-sm backdrop-blur-xl sm:p-6">
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

          {edges.map((edge, index) => {
            const source = findNode(edge.source)
            const target = findNode(edge.target)

            if (!source || !target) return null

            return (
              <line
                key={`${edge.source}-${edge.target}-${index}`}
                x1={source.x}
                y1={source.y}
                x2={target.x}
                y2={target.y}
                stroke="rgba(71,85,105,0.22)"
                strokeWidth={Math.max(0.2, edge.weight * 0.08)}
              />
            )
          })}

          {positioned.map((node) => (
            <g key={node.id}>
              <circle
                cx={node.x}
                cy={node.y}
                r={Math.max(2.2, node.weight * 0.85)}
                fill={graphNodeColor(node.type)}
                fillOpacity={0.88}
                stroke="rgba(255,255,255,0.95)"
                strokeWidth="0.45"
              />

              <text
                x={node.x}
                y={node.y + Math.max(5.5, node.weight + 3)}
                textAnchor="middle"
                fontSize="2.2"
                fill="#344256"
                style={{ letterSpacing: '0.02em' }}
              >
                {node.label.length > 22
                  ? `${node.label.slice(0, 22)}…`
                  : node.label}
              </text>
            </g>
          ))}
        </svg>

        <div className="mt-4 flex flex-wrap gap-2 border-t border-brand-900/10 pt-4">
          <span className="chip-readable">Mechanism overlap</span>
          <span className="chip-readable">Pathway continuity</span>
          <span className="chip-readable">Evidence relationships</span>
          <span className="chip-readable">Semantic traversal</span>
        </div>
      </div>
    </section>
  )
}
