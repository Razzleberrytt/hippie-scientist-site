import graph from "../data/graph/relevance.json";

type Edge = { from:string; to:string; w:number };
type NodeRef = { id:string; slug:string; name?:string; title?:string };

export function relatedPostsByHerbSlug(slug:string, limit=3){
  const id = `herb:${slug}`;
  const edges = (graph.edgesHP as Edge[]).filter(e=>e.from===id).sort((a,b)=>b.w-a.w).slice(0,limit);
  const posts = new Map((graph.posts as NodeRef[]).map(p=>[p.id,p]));
  return edges.map(e => posts.get(e.to)).filter(Boolean);
}

export function relatedHerbsByPostSlug(slug:string, limit=4){
  const id = `post:${slug}`;
  const edges = (graph.edgesPH as Edge[]).filter(e=>e.from===id).sort((a,b)=>b.w-a.w).slice(0,limit);
  const herbs = new Map((graph.herbs as NodeRef[]).map(h=>[h.id,h]));
  return edges.map(e => herbs.get(e.to)).filter(Boolean);
}
