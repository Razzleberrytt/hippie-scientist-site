import type { PathwayDiagramData, PathwayNodeRole } from '@/lib/pathway-data'

// ─── Layout constants ─────────────────────────────────────────────────────────
const NODE_W = 130
const NODE_H = 52
const COL_GAP = 66   // horizontal gap between node right edge and next node left edge
const ROW_GAP = 52   // vertical gap between node bottom edge and next node top edge
const COL_STEP = NODE_W + COL_GAP
const ROW_STEP = NODE_H + ROW_GAP
const PAD = 16

function nodeX(col: number) { return PAD + col * COL_STEP }
function nodeY(row: number) { return PAD + row * ROW_STEP }
function nodeCx(col: number) { return nodeX(col) + NODE_W / 2 }
function nodeCy(row: number) { return nodeY(row) + NODE_H / 2 }

// ─── Colors by role ───────────────────────────────────────────────────────────
function roleColors(role: PathwayNodeRole) {
  switch (role) {
    case 'compound':
      return { fill: 'var(--surface-subtle)', stroke: 'var(--border-strong)', text: 'var(--text-primary)' }
    case 'target':
      return { fill: 'rgba(37,99,235,0.08)', stroke: 'rgba(147,197,253,0.6)', text: 'var(--color-evidence-moderate)' }
    case 'mechanism':
      return { fill: 'rgba(47,95,58,0.08)', stroke: 'rgba(134,239,172,0.5)', text: 'var(--color-evidence-strong)' }
    case 'effect':
      return { fill: 'rgba(180,83,9,0.07)', stroke: 'rgba(254,215,170,0.5)', text: 'var(--color-evidence-limited)' }
    default:
      return { fill: 'var(--surface)', stroke: 'var(--border-soft)', text: 'var(--text-secondary)' }
  }
}

// ─── Arrow path between two grid positions ────────────────────────────────────
function arrowPath(
  fromCol: number, fromRow: number,
  toCol: number, toRow: number,
): { x1: number; y1: number; x2: number; y2: number } {
  const horizontal = fromRow === toRow && toCol === fromCol + 1
  const vertical = fromCol === toCol && toRow === fromRow + 1

  if (horizontal) {
    return {
      x1: nodeX(fromCol) + NODE_W,
      y1: nodeCy(fromRow),
      x2: nodeX(toCol) - 2,
      y2: nodeCy(toRow),
    }
  }
  if (vertical) {
    return {
      x1: nodeCx(fromCol),
      y1: nodeY(fromRow) + NODE_H,
      x2: nodeCx(toCol),
      y2: nodeY(toRow) - 2,
    }
  }
  // Fallback: center-to-center (skipped edges — diagonal)
  return {
    x1: nodeCx(fromCol),
    y1: nodeCy(fromRow),
    x2: nodeCx(toCol),
    y2: nodeCy(toRow),
  }
}

type Props = {
  data: PathwayDiagramData
  className?: string
}

export default function PathwayDiagram({ data, className = '' }: Props) {
  // Compute SVG viewport from max col and row across all nodes
  const maxCol = Math.max(...data.nodes.map((n) => n.col))
  const maxRow = Math.max(...data.nodes.map((n) => n.row))
  const svgW = PAD + maxCol * COL_STEP + NODE_W + PAD
  const svgH = PAD + maxRow * ROW_STEP + NODE_H + PAD

  const nodeMap = Object.fromEntries(data.nodes.map((n) => [n.id, n]))
  const markerId = `arrow-${data.id}`

  return (
    <figure
      className={`overflow-hidden rounded-[1rem] border border-brand-900/10 bg-white/90 p-4 shadow-sm ${className}`}
      aria-label={data.summary}
    >
      <p className="mb-3 text-[10px] font-bold uppercase tracking-wider text-muted">
        Mechanism Pathway — {data.title}
      </p>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${svgW} ${svgH}`}
          width={svgW}
          height={svgH}
          role="img"
          aria-label={data.summary}
          style={{ maxWidth: '100%', height: 'auto' }}
          xmlns="http://www.w3.org/2000/svg"
        >
          <title>{data.title}</title>
          <desc>{data.summary}</desc>

          <defs>
            <marker
              id={markerId}
              viewBox="0 0 10 10"
              refX="9"
              refY="5"
              markerUnits="userSpaceOnUse"
              markerWidth="10"
              markerHeight="10"
              orient="auto-start-reverse"
            >
              <path d="M 0 1 L 10 5 L 0 9 z" fill="var(--border-strong)" />
            </marker>
          </defs>

          {/* ── Edges (arrows) ── */}
          {data.edges.map((edge, i) => {
            const from = nodeMap[edge.from]
            const to = nodeMap[edge.to]
            if (!from || !to) return null
            const { x1, y1, x2, y2 } = arrowPath(from.col, from.row, to.col, to.row)
            const midX = (x1 + x2) / 2
            const midY = (y1 + y2) / 2
            return (
              <g key={i}>
                <line
                  x1={x1} y1={y1} x2={x2} y2={y2}
                  stroke="var(--border-strong)"
                  strokeWidth="2"
                  markerEnd={`url(#${markerId})`}
                />
                {edge.label && (
                  <text
                    x={midX}
                    y={midY - 6}
                    textAnchor="middle"
                    fontSize="9"
                    fill="var(--text-muted)"
                    fontFamily="system-ui, sans-serif"
                  >
                    {edge.label}
                  </text>
                )}
              </g>
            )
          })}

          {/* ── Nodes ── */}
          {data.nodes.map((node) => {
            const colors = roleColors(node.role)
            const nx = nodeX(node.col)
            const ny = nodeY(node.row)
            const ncx = nodeCx(node.col)
            const ncy = nodeCy(node.row)
            const hasSubLabel = Boolean(node.sublabel)
            const mainLabelY = hasSubLabel ? ncy - 8 : ncy

            return (
              <g key={node.id}>
                <rect
                  x={nx}
                  y={ny}
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  ry="8"
                  fill={colors.fill}
                  stroke={colors.stroke}
                  strokeWidth="1.5"
                />
                <text
                  x={ncx}
                  y={mainLabelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="12"
                  fontWeight="600"
                  fill={colors.text}
                  fontFamily="system-ui, sans-serif"
                >
                  {node.label}
                </text>
                {node.sublabel && (
                  <text
                    x={ncx}
                    y={ncy + 11}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="9.5"
                    fill={colors.text}
                    opacity="0.7"
                    fontFamily="system-ui, sans-serif"
                  >
                    {node.sublabel}
                  </text>
                )}
              </g>
            )
          })}
        </svg>
      </div>

      {/* Color legend key */}
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
        {(
          [
            ['compound', 'bg-slate-100 border-slate-300', 'Compound'],
            ['target', 'bg-blue-50 border-blue-200', 'Target / Receptor'],
            ['mechanism', 'bg-emerald-50 border-emerald-200', 'Mechanism'],
            ['effect', 'bg-orange-50 border-orange-200', 'Effect / Outcome'],
          ] as const
        ).map(([, cls, label]) => (
          <span key={label} className="flex items-center gap-1.5 text-[10px] text-muted">
            <span className={`inline-block h-3 w-6 rounded border ${cls}`} aria-hidden="true" />
            {label}
          </span>
        ))}
      </div>
    </figure>
  )
}
