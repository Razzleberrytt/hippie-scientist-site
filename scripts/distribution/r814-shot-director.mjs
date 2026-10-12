/**
 * EvidenceMotion R8.14 art director.
 * Deterministic, source-bound cinematic treatments; zero invented evidence.
 * Repetition debt is a production warning, never permission to alter science.
 */
const fnv = (s) => {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h,16777619) }
  return h >>> 0
}
const clean = s => String(s ?? '').trim().replace(/\s+/g,' ')
export const ART_DIRECTOR_VERSION = 'ths-shot-director-v1'
export const ART_FAMILIES = Object.freeze([
  {id:'bioglass',main:'#8bffe6',shadow:'#0a4151',glow:'#41e0be',warm:'#f8c08c',material:'frosted-organic-glass'},
  {id:'ceramic',main:'#eaf8ef',shadow:'#194d62',glow:'#7fe7dc',warm:'#ffc98c',material:'porcelain-enamel'},
  {id:'copper',main:'#d5fff1',shadow:'#1a505b',glow:'#74dfbf',warm:'#f3a876',material:'etched-oxidized-copper'},
  {id:'polar',main:'#d4f6ff',shadow:'#123c66',glow:'#8ac8ff',warm:'#e1bdf6',material:'frosted-crystal'},
  {id:'cinema-ink',main:'#e9e3ff',shadow:'#28264f',glow:'#ac98ff',warm:'#ffd2aa',material:'ink-and-glass'},
  {id:'golden-hour',main:'#fff3db',shadow:'#31515c',glow:'#d3ebc9',warm:'#ffc478',material:'backlit-translucency'},
])
export const LENSES = Object.freeze(['macro','isometric','portrait','split-diopter','topographic','orbital'])
const STAGE_LENSES = {
  person:['portrait','macro','orbital'], compare:['split-diopter','isometric'],
  molecule:['orbital','macro','isometric'], evidence:['isometric','macro','topographic'],
  uncertainty:['macro','portrait','orbital'], safety:['portrait','isometric'],
  outro:['orbital','macro','topographic'],
}
const STAGES = Object.keys(STAGE_LENSES)
const allowed = (s, re=/^[a-z0-9_.:-]{1,128}$/i) => re.test(String(s))

export function directShot(scene, {episodeKey = 'ths-house', recentlyUsed = []} = {}) {
  const stage = clean(scene?.visualScene)
  if (!STAGES.includes(stage)) throw Error('Unknown cinematography scene stage')
  if (typeof episodeKey !== 'string' || episodeKey.length > 160) throw Error('Episode key must be short and stable')
  const id = clean(scene?.beatId || scene?.role || stage)
  if (!allowed(id)) throw Error('Cinematic shot requires a canonical beat/role ID')
  const semantic = clean(scene?.factualAuthority || 'illustration')
  const seed = fnv([episodeKey,id,stage,semantic].join('|'))
  const themeIndex = fnv(episodeKey) % ART_FAMILIES.length
  const family = ART_FAMILIES[themeIndex]
  const permittedLenses=STAGE_LENSES[stage]
  const lens=permittedLenses[seed % permittedLenses.length]
  const framing=['wide','close','extreme-macro'][Math.floor(seed/7)%3]
  const light=['edge-lit','subsurface','rim-and-fill'][Math.floor(seed/13)%3]
  const orientation=[-8,-4,0,4,8][Math.floor(seed/31)%5]
  const orbit=(Math.floor(seed/67)%2===0)?1:-1
  const signature=[stage,family.id,lens,framing,light].join(':')
  if(!Array.isArray(recentlyUsed)) throw Error('recentlyUsed must be an array of shot signatures')
  return Object.freeze({
    version: ART_DIRECTOR_VERSION, beatId:id,stage,
    theme:family.id,colors:{...family},lens,framing,light,orientation,orbit,
    signature,seed:seed.toString(16).padStart(8,'0'),
    repetitionWarning:recentlyUsed.includes(signature),
    scienceIdentity: clean(scene?.factualAuthority || 'creative-framing'),
    renderPolicy:'symbolic-illustration-not-evidence',
  })
}
export function planCinematicSequence(scenes,{episodeKey='ths-house',recentlyUsed=[]}={}){
  if(!Array.isArray(scenes)||!scenes.length)throw Error('Cinematic sequence requires governed scenes')
  const shots=[]
  const signatures=[...recentlyUsed]
  for(const scene of scenes){
    const shot=directShot(scene,{episodeKey,recentlyUsed:signatures.slice(-8)})
    shots.push(shot)
    signatures.push(shot.signature)
  }
  const duplicates=shots.filter(x=>x.repetitionWarning).map(x=>x.beatId)
  return {
    version:ART_DIRECTOR_VERSION,episodeKey,
    shots,novelty:{distinctShotSignatures:new Set(shots.map(x=>x.signature)).size,total:shots.length,
      consecutiveDuplicates:shots.filter((x,i)=>i>0&&x.signature===shots[i-1].signature).length,
      revisitFlags:duplicates},
    publicationAuthority:false,
    caveat:'Novelty is a design heuristic, not audience performance or human art-quality approval',
  }
}
