import React, { useEffect, useMemo, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import Meta from "../components/Meta";
import graphData from "../data/graph/relevance.json";

type GraphNode = {
  id: string;
  slug: string;
  name: string;
  group: "herb" | "post";
};

type GraphLink = {
  source: string;
  target: string;
  value: number;
};

export default function GraphPage() {
  const [dims, setDims] = useState(() => ({
    w: typeof window === "undefined" ? 0 : window.innerWidth,
    h: typeof window === "undefined" ? 0 : window.innerHeight,
  }));

  useEffect(() => {
    const onResize = () =>
      setDims({
        w: window.innerWidth,
        h: window.innerHeight,
      });

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const data = useMemo(() => {
    const nodes: GraphNode[] = [
      ...graphData.herbs.map((h: any) => ({
        id: h.id,
        slug: h.slug,
        name: h.name,
        group: "herb" as const,
      })),
      ...graphData.posts.map((p: any) => ({
        id: p.id,
        slug: p.slug,
        name: p.title,
        group: "post" as const,
      })),
    ];

    const links: GraphLink[] = [
      ...graphData.edgesHP.map((e: any) => ({
        source: e.from,
        target: e.to,
        value: e.w,
      })),
      ...graphData.edgesPH.map((e: any) => ({
        source: e.from,
        target: e.to,
        value: e.w,
      })),
    ];

    return { nodes, links };
  }, []);

  return (
    <>
      <Meta
        title="NeuroHerbGraph — Interactive Map"
        description="Visualize relationships between herbs and blog posts on The Hippie Scientist."
        path="/graph"
        pageType="website"
        noindex
      />
      <main className="relative h-screen w-full overflow-hidden bg-black text-white">
        <ForceGraph2D
          width={dims.w}
          height={dims.h}
          graphData={data}
          nodeLabel={(node: GraphNode) => node.name}
          nodeAutoColorBy="group"
          linkColor={() => "rgba(255,255,255,0.1)"}
          linkDirectionalParticles={0}
          backgroundColor="#000"
          onNodeClick={(node: GraphNode) => {
            if (node.group === "herb") {
              window.open(`/herb/${node.slug}`, "_blank");
            } else if (node.group === "post") {
              window.open(`/blog/${node.slug}`, "_blank");
            }
          }}
          nodeCanvasObject={(node: GraphNode & { x?: number; y?: number }, ctx, globalScale) => {
            if (typeof node.x !== "number" || typeof node.y !== "number") {
              return;
            }

            const label = node.name;
            const fontSize = 12 / globalScale;
            ctx.font = `${fontSize}px Inter, sans-serif`;
            ctx.fillStyle = node.group === "herb" ? "#7aff9d" : "#74d7ff";
            const textWidth = ctx.measureText(label).width;
            const paddingX = 6;
            const paddingY = 4;
            const bckgDimensions: [number, number] = [
              textWidth + paddingX,
              fontSize + paddingY,
            ];
            ctx.fillRect(
              node.x - bckgDimensions[0] / 2,
              node.y - bckgDimensions[1] / 2,
              ...bckgDimensions
            );
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = "#000";
            ctx.fillText(label, node.x, node.y);
          }}
        />
        <div className="absolute left-3 top-3 z-10 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-white/70">
          <b>Legend:</b> 🟢 herbs · 🔵 posts
          <span className="ml-2 opacity-75">Click nodes to open pages</span>
        </div>
      </main>
    </>
  );
}
