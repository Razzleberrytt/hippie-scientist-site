import crypto from 'node:crypto'

// CinematicDNA: exact-input, reproducible art direction, not generated science.
// The permitted novelty surface is camera, material, silhouette and lighting.
// Captions, PMIDs, qualifiers, numbers and physical mechanism claims are never
// synthesized by this module.
const STAGES = ['person', 'compare', 'molecule', 'evidence', 'uncertainty', 'safety', 'outro']
const LIGHTS = [
  { id:'cold-laboratory', glint:'#c3fff0', rim:'#6ce8ca', ambient:'#103e58', flare:'#8ee7ec' },
  { id:'amber-discovery', glint:'#ffedc5', rim:'#f3b777', ambient:'#4f394a', flare:'#e7a986' },
  { id:'deep-ocean', glint:'#b6eafb', rim:'#63d6ef', ambient:'#102a5b', flare:'#5ca9de' },
  { id:'iridescent-mint', glint:'#f0ffe9', rim:'#abf2c0', ambient:'#214c48', flare:'#93d7aa' },
]
const MATERIALS = ['ceramic-and-glass','brushed-metal','opaline-crystal','holographic-glass']
const COMPOSITIONS = ['diagonal-orbit','axial-symmetry','radial-discovery','vertical-spine']
const CAMERAS = ['macro-push','orbital-drift','arc-reveal','diagonal-dolly']

const clean = v => String(v ?? '').replace(/\s+/g,' ').trim()
const pick = (list,n) => list[n % list.length]

export function directR814Shot(scene) {
  const stage = clean(scene?.visualScene)
  if (!STAGES.includes(stage)) throw Error('CinematicDNA requires a governed visual stage')
  // Stable across pre and post passes; changing the claim generates new art
  // identity and invalidates downstream media receipts instead of reusing art.
  const seed = ['R8.14',stage,clean(scene?.beatId),clean(scene?.role),
    clean(scene?.onScreenText),clean(scene?.compositionFamily)].join('|')
  const digest = crypto.createHash('sha256').update(seed).digest()
  const read = i => digest[i]
  const variant = read(0) % 4
  const light = LIGHTS[read(1) % LIGHTS.length]
  const material = pick(MATERIALS,read(2))
  const composition = pick(COMPOSITIONS,read(3))
  const camera = pick(CAMERAS,read(4))
  const sign = read(5)%2 ? 1:-1
  // Distance-sensitive motion; far, mid and near NEVER share one flat offset.
  const amplitude = 7 + read(6)%7
  const parallax = Object.freeze({
    far: Object.freeze({x:sign*amplitude*.4,y:-sign*amplitude*.2}),
    mid: Object.freeze({x:-sign*amplitude*.85,y:sign*amplitude*.55}),
    near: Object.freeze({x:sign*amplitude*1.65,y:-sign*amplitude*.95}),
  })
  return Object.freeze({
    version:'ths-cinematic-shot-dna-v1',
    id:digest.toString('hex').slice(0,16),
    stage,variant,light,material,composition,camera,parallax,
    framingDegrees:([-7,-3,3,7])[read(7)%4],
    lensFocus: [0.82,0.91,1.00,1.09][read(8)%4],
    // Explicit record that creative variation is NOT a scientific conclusion.
    generatedScientificClaims:false, inventedResearchValues:false,
    visualPurpose:clean(scene?.visualAction)||clean(scene?.role)||stage,
  })
}

// Reject a production sequence that loops through one repeatedly templated
// visual for multiple beats. Compatible with legitimate repeating science
// stages only when their framing/lighting/composition genuinely changes.
export function auditR814ShotVariety(scenes) {
  const directed=(scenes||[]).filter(x=>x?.visualScene).map(directR814Shot)
  if (!directed.length) throw Error('CinematicDNA requires governed science scenes')
  let repeats = 0
  for(let i=1;i<directed.length;i++){
    const a=directed[i-1], b=directed[i]
    if(a.stage===b.stage && a.material===b.material && a.composition===b.composition && a.camera===b.camera) repeats++
  }
  if(repeats)throw Error('CinematicDNA rejected repeated adjacent art direction; vary the reviewed visual scene or beat framing')
  return {
    total:directed.length,
    uniqueLooks:new Set(directed.map(s=>[s.stage,s.light.id,s.material,s.composition].join('|'))).size,
    identity:crypto.createHash('sha256').update(directed.map(s=>s.id).join('|')).digest('hex'),
    authorialVariation:true, scientificValuesGenerated:false,
  }
}
