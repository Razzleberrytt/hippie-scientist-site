import React, { useEffect, useState } from 'react'

const ForceGraph2D = React.lazy(() => import('react-force-graph-2d'))
import Meta from '../components/Meta'
import { recordDevMessage } from '../utils/devMessages'

type GraphNode = {
  id: string
  slug: string
  name: string
  group: 'herb' | 'post'
}

type GraphLink = {
  source: string
  target: string
  value: number
}

type GraphData = {
  nodes: GraphNode[]
  links: GraphLink[]
}

type RawGraphData = {
  herbs: Array<{ id: string; slug: string; name: string }>
  posts: Array<{ id: string; slug: string; title: string }>
  edgesHP: Array<{ from: string; to: string; w: number }>
  edgesPH: Array<{ from: string; to: string; w: number }>
}

export default function GraphPage() {
  const [dims, setDims] = useState(() => ({
    w: typeof window === 'undefined' ? 0 : window.innerWidth,
    h: typeof window === 'undefined' ? 0 : window.innerHeight,
  }))
  const [graphData, setGraphData] = useState<GraphData | null>(null)
  const [isDataMissing, setIsDataMissing] = useState(false)

  const openInNewTab = (path: string) => {
    const newWindow = window.open(path, '_blank', 'noopener,noreferrer')
    if (newWindow) {
      newWindow.opener = null
    }
  }

  useEffect(() => {
    const onResize = () =>
      setDims({
        w: window.innerWidth,
        h: window.innerHeight,
      })

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadGraphData = async () => {
      try {
        const module = await import('../data/graph/relevance.json')
        const rawData = (module.default ?? module) as RawGraphData | undefined

        if (!rawData) {
          throw new Error('Graph data module empty')
        }

        const nodes: GraphNode[] = [
          ...rawData.herbs.map(h => ({
            id: h.id,
            slug: h.slug,
            name: h.name,
            group: 'herb' as const,
          })),
          ...rawData.posts.map(p => ({
            id: p.id,
            slug: p.slug,
            name: p.title,
            group: 'post' as const,
          })),
        ]

        const links: GraphLink[] = [
          ...rawData.edgesHP.map(edge => ({
            source: edge.from,
            target: edge.to,
            value: edge.w,
          })),
          ...rawData.edgesPH.map(edge => ({
            source: edge.from,
            target: edge.to,
            value: edge.w,
          })),
        ]

        if (isMounted) {
          setGraphData({ nodes, links })
          setIsDataMissing(false)
        }
      } catch (error) {
        recordDevMessage('warning', 'Graph data missing, skipping render', error)
        if (isMounted) {
          setGraphData({ nodes: [], links: [] })
          setIsDataMissing(true)
        }
      }
    }

    loadGraphData()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <>
      <Meta
        title='NeuroHerbGraph — Interactive Map'
        description='Visualize relationships between herbs and blog posts on The Hippie Scientist.'
        path='/graph'
        pageType='website'
        noindex
      />
      <main className='relative h-screen w-full overflow-hidden bg-black/40 text-white backdrop-blur'>
        <h1 className='sr-only'>NeuroHerbGraph interactive map</h1>
        <React.Suspense
          fallback={
            <div className='absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white/70'>
              Loading graph visualization…
            </div>
          }
        >
          {graphData && !isDataMissing ? (
            <ForceGraph2D
              width={dims.w}
              height={dims.h}
              graphData={graphData}
              nodeLabel={(node: GraphNode) => node.name}
              nodeAutoColorBy='group'
              linkColor={() => 'rgba(255,255,255,0.1)'}
              linkDirectionalParticles={0}
              backgroundColor='rgba(0,0,0,0)'
              onNodeClick={(node: GraphNode) => {
                if (node.group === 'herb') {
                  openInNewTab(`/herb/${node.slug}`)
                } else if (node.group === 'post') {
                  openInNewTab(`/blog/${node.slug}/`)
                }
              }}
              nodeCanvasObject={(
                node: GraphNode & { x?: number; y?: number },
                ctx,
                globalScale
              ) => {
                if (typeof node.x !== 'number' || typeof node.y !== 'number') {
                  return
                }

                const label = node.name
                const fontSize = 12 / globalScale
                ctx.font = `${fontSize}px Inter, sans-serif`
                ctx.fillStyle = node.group === 'herb' ? '#7aff9d' : '#74d7ff'
                const textWidth = ctx.measureText(label).width
                const paddingX = 6
                const paddingY = 4
                const bckgDimensions: [number, number] = [textWidth + paddingX, fontSize + paddingY]
                ctx.fillRect(
                  node.x - bckgDimensions[0] / 2,
                  node.y - bckgDimensions[1] / 2,
                  ...bckgDimensions
                )
                ctx.textAlign = 'center'
                ctx.textBaseline = 'middle'
                ctx.fillStyle = '#000'
                ctx.fillText(label, node.x, node.y)
              }}
            />
          ) : null}
        </React.Suspense>
        <div className='absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/70'>
          <b>Legend:</b> 🟢 herbs · 🔵 posts
          <span className='ml-2 opacity-75'>Click nodes to open pages</span>
        </div>
        {!graphData && !isDataMissing ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white/70'>
            Loading graph data…
          </div>
        ) : null}
        {isDataMissing ? (
          <div className='absolute inset-0 flex items-center justify-center bg-black/70 text-sm text-white/70'>
            Graph data unavailable. Check back soon!
          </div>
        ) : null}
      </main>
    </>
  )
}
