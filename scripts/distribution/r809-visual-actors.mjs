import { directR814Shot } from './r814-cinematic-director.mjs'
import { renderSciencePlateActor } from './science-plate-actors.mjs'
// EvidenceMotion cinematic 2.5D science actors (R8.14 craft candidate).
// No photoreal fake molecules, fake numeric plots, stock slides or generative credits.
// Depth is explicit: distant atmosphere, lit middle-stage objects, foreground detail.
// Real motion uses narration-owned pre/post semantic states, NOT arbitrary labels.
const clean = (v) => String(v ?? '').trim()
const STAGES = new Set(['person', 'compare', 'molecule', 'evidence', 'uncertainty', 'safety', 'outro'])
export const R809_VISUAL_STAGES = [...STAGES]
export const CINEMATIC_LOOK = 'ths-cinematic-2p5d-v1'

const number = (n, label) => {
  if (!Number.isFinite(Number(n))) throw Error('Cinematic composition requires finite ' + label)
  return Number(n)
}
const rounded = (n) => Number(n.toFixed(2))
const escape = (s) => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))

export function renderR809VisualActor(scene, { x, y, width, height, foreground, background, motionPhase = 'post' }) {
  const stage = clean(scene?.visualScene)
  if (!STAGES.has(stage)) throw Error('R8.09 illustration stage must be one of: ' + [...STAGES].join(', '))
  if (!['pre','post'].includes(motionPhase)) throw Error('Cinematic 2.5D requires pre/post narration-owned motion phase')
  const px = number(x,'x'), py = number(y,'y'), w = number(width,'width'), h = number(height,'height')
  if (w <= 0 || h <= 0) throw Error('Cinematic composition requires positive viewport')
  if (!/^#[a-f0-9]{3,8}$/i.test(String(foreground || ''))) throw Error('Cinematic 2.5D requires hex foreground color')
  const color = escape(foreground)
  const shot = directR814Shot(scene)
  // Opt-in biological teaching objects reuse this cinematic director and the
  // canonical narration/source checks; they are not a parallel video generator.
  if (scene.scienceIllustration) {
    return renderSciencePlateActor(scene, {x:px, y:py, width:w, height:h, motionPhase, shot})
  }
  const cx = px + w/2, cy = py + h/2
  const id = 'ths-cine-' + stage
  const final = motionPhase === 'post'
  const depth = final ? 0 : -24
  const scale = Math.min(1, w/700, h/535) * shot.lensFocus
  const g = (s) => rounded(s)
  const primaryStroke = 'stroke="' + color + '" stroke-width="5" stroke-linejoin="round" stroke-linecap="round"'
  const deck = (xx,yy,ww,hh,rotation=0) => `<g transform="rotate(${rotation} ${g(xx+ww/2)} ${g(yy+hh/2)})"><rect x="${g(xx+13)}" y="${g(yy+22)}" width="${g(ww)}" height="${g(hh)}" rx="28" fill="#020f1b" opacity=".55"/><rect x="${g(xx)}" y="${g(yy)}" width="${g(ww)}" height="${g(hh)}" rx="28" fill="url(#${id}-glass)" stroke="#90f4dc" stroke-opacity=".7" stroke-width="3"/><path d="M ${g(xx+26)} ${g(yy+16)} H ${g(xx+ww-38)}" stroke="white" opacity=".4" stroke-width="4"/><path d="M ${g(xx+ww-20)} ${g(yy+30)} V ${g(yy+hh-30)}" stroke="#75e8ca" opacity=".25" stroke-width="6"/></g>`
  const globe = (x,y,r,fill='pearl') => `<circle cx="${g(x+9)}" cy="${g(y+12)}" r="${g(r)}" fill="#06131d" opacity=".52"/><circle cx="${g(x)}" cy="${g(y)}" r="${g(r)}" fill="url(#${id}-${fill})" stroke="#b7ffeb" stroke-opacity=".46" stroke-width="3"/><ellipse cx="${g(x-r*.32)}" cy="${g(y-r*.45)}" rx="${g(r*.4)}" ry="${g(r*.18)}" transform="rotate(-25 ${g(x-r*.32)} ${g(y-r*.45)})" fill="white" opacity=".32"/>`
  const link = (x1,y1,x2,y2) => `<path d="M ${g(x1)} ${g(y1)} L ${g(x2)} ${g(y2)}" stroke="#9bf3d9" stroke-opacity=".35" stroke-width="18" stroke-linecap="round"/><path d="M ${g(x1)} ${g(y1)} L ${g(x2)} ${g(y2)}" stroke="#dffef5" stroke-width="5" stroke-linecap="round"/>`
  let actor=''
  if(stage==='person'){
    actor=`<g data-art-object="human-silhouette"><path d="M -152 132 Q -128 -16 -10 -7 Q 97 -7 151 132 Q 0 188 -152 132Z" fill="url(#${id}-glass)" ${primaryStroke}/>${globe(-17,-73,83)}<path d="M -7 13 Q -12 33 -4 62" fill="none" stroke="#dffff5" stroke-width="6"/><path d="M 38 -72 Q 125 -152 210 -83" stroke="#79f4d3" stroke-opacity=".65" stroke-width="5" fill="none"/>${final ? globe(194,-95,40,'amber') : `<circle cx="194" cy="-95" r="40" stroke="#a1ffff" stroke-dasharray="10 9" fill="none" stroke-width="4"/>`}<path d="M 110 -54 L 158 -78" stroke="#ffca89" stroke-width="6" opacity=".75"/></g>`
  }else if(stage==='compare'){
    const l=-170,r=170
    actor=`<g data-art-object="two-distinct-evidence-objects">${deck(-310,-116,258,231,-7)}${deck(54,-116,258,231,7)}${globe(l,-8,65)}${final?globe(r,-8,63,'amber'):`<circle cx="${r}" cy="-8" r="64" stroke="#ffcc91" stroke-width="5" stroke-dasharray="12 13" fill="none"/>`}<path d="M -34 -5 L 34 -5" stroke="#f0fffc" stroke-width="9" stroke-linecap="round"/><path d="M 15 -24 L 38 -5 L 15 14" fill="none" stroke="#f0fffc" stroke-width="8" stroke-linecap="round"/><ellipse cx="-180" cy="137" rx="143" ry="20" fill="#4fe4cd" opacity=".18"/><ellipse cx="180" cy="137" rx="143" ry="20" fill="#ffbc73" opacity=".14"/></g>`
  }else if(stage==='molecule'){
    // Schematic connectivity only. Never encode chemical formula, geometry, or potency.
    const nodes=[[-211,25],[-121,-103],[3,-84],[134,-22],[210,100],[-23,122]]
    const edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]]
    actor=`<g data-art-object="symbolic-not-chemical-structure" data-r809-symbolic-network="true">${edges.map(([a,b])=>link(...nodes[a],...nodes[b])).join('')}${nodes.map(([xx,yy],i)=>(final||i<3)?globe(xx,yy,i%2?39:46,i===4?'amber':'pearl'):`<circle cx="${xx}" cy="${yy}" r="40" fill="none" stroke="#7becd1" stroke-opacity=".45" stroke-width="4" stroke-dasharray="9 10"/>`).join('')}<path d="M -190 -163 Q 10 -215 174 -130" fill="none" stroke="white" stroke-opacity=".28" stroke-width="3"/></g>`
  }else if(stage==='evidence'){
    actor=`<g data-art-object="source-documents-and-lens">${deck(-207,-158,344,312,-8)}${deck(-170,-170,344,312,5)}<path d="M -121 -98 H 108 M -121 -40 H 78 M -121 18 H 103" stroke="#e3fff5" stroke-opacity=".65" stroke-width="9" stroke-linecap="round"/>${final?globe(141,95,84):`<circle cx="141" cy="95" r="84" fill="none" stroke="#a1e9d1" stroke-width="8"/>`}<path d="M 190 150 L 257 215" stroke="#d4ffed" stroke-width="27" stroke-linecap="round"/><path d="M 190 150 L 257 215" stroke="#316e70" stroke-width="15" stroke-linecap="round"/></g>`
  }else if(stage==='uncertainty'){
    actor=`<g data-art-object="evidence-uncertainty-prism"><path d="M 0 -198 L 178 -93 L 178 110 L 0 214 L -178 110 L -178 -93Z" fill="url(#${id}-glass)" stroke="#abf8e2" stroke-width="7"/><path d="M 0 -198 L 0 214 M -178 -93 L 0 19 L 178 -93" stroke="#d4fff2" stroke-opacity=".43" stroke-width="4" fill="none"/><circle cx="0" cy="19" r="97" fill="#062731" opacity=".84"/><text x="0" y="73" text-anchor="middle" fill="#e5fff4" font-family="sans-serif" font-size="160" font-weight="800">?</text>${final ? `<path d="M -170 142 Q -14 228 181 125" stroke="#f7c07d" stroke-width="6" fill="none"/>` : ''}</g>`
  }else if(stage==='safety'){
    actor=`<g data-art-object="safety-signal"><path d="M 0 -216 L 226 177 H -226Z" fill="url(#${id}-amber)" stroke="#ffd8a0" stroke-width="9" stroke-linejoin="round"/><path d="M 0 -174 L 182 145 H -182Z" fill="#202e37" opacity=".85"/><rect x="-17" y="-55" width="34" height="113" rx="15" fill="#fff1d7"/>${final?globe(0,105,17,'amber'):`<circle cx="0" cy="105" r="17" fill="#ffdca3"/>`}<path d="M -233 190 L 231 190" stroke="#ffc484" stroke-opacity=".45" stroke-width="8"/></g>`
  }else{
    actor=`<g data-art-object="science-reveal">${globe(0,-4,170)}<path d="M -80 5 L -15 68 L 114 -84" stroke="#042b39" stroke-width="36" stroke-linecap="round" stroke-linejoin="round" fill="none"/><path d="M -80 5 L -15 68 L 114 -84" stroke="#f5fff9" stroke-width="23" stroke-linecap="round" stroke-linejoin="round" fill="none"/>${final? `<circle cx="191" cy="-154" r="28" fill="#ffcf91"/><circle cx="-203" cy="137" r="17" fill="#baffed"/>`:''}</g>`
  }
  // Scene-authored silhouettes: different shot DNA has distinct negative-space
  // motifs, rather than swapping only a color gradient on the same template.
  const motif = shot.composition === 'diagonal-orbit'
    ? `<ellipse cx="0" cy="0" rx="312" ry="154" transform="rotate(-24)" fill="none" stroke="${shot.light.rim}" stroke-width="4" opacity=".32"/><circle cx="-265" cy="118" r="13" fill="${shot.light.glint}" opacity=".85"/>`
    : shot.composition === 'axial-symmetry'
      ? `<path d="M -330 -191 V 188 M 330 -191 V 188" stroke="${shot.light.rim}" stroke-opacity=".22" stroke-width="3"/><path d="M -260 0 H -190 M 190 0 H 260" stroke="${shot.light.glint}" stroke-opacity=".45" stroke-width="5"/>`
      : shot.composition === 'radial-discovery'
        ? `<circle r="290" fill="none" stroke="${shot.light.rim}" stroke-opacity=".24" stroke-width="4"/><circle r="245" fill="none" stroke="${shot.light.flare}" stroke-opacity=".18" stroke-width="7" stroke-dasharray="24 37"/>`
        : `<path d="M 0 -263 V -218 M 0 205 V 261 M -100 -240 H 100 M -100 237 H 100" fill="none" stroke="${shot.light.rim}" stroke-width="5" stroke-opacity=".36"/>`
  const definitions=`<defs>
  <radialGradient id="${id}-halo"><stop stop-color="${shot.light.flare}" stop-opacity=".43"/><stop offset=".5" stop-color="#237e89" stop-opacity=".18"/><stop offset="1" stop-color="#08252e" stop-opacity="0"/></radialGradient>
  <radialGradient id="${id}-pearl" cx=".26" cy=".2" r=".88"><stop stop-color="${shot.light.glint}"/><stop offset=".21" stop-color="#9cfbe0"/><stop offset=".56" stop-color="#28acac"/><stop offset="1" stop-color="#0b364b"/></radialGradient>
  <radialGradient id="${id}-amber" cx=".27" cy=".2" r=".87"><stop stop-color="#fff8dd"/><stop offset=".3" stop-color="#fbd396"/><stop offset=".7" stop-color="#df855e"/><stop offset="1" stop-color="#653d43"/></radialGradient>
  <linearGradient id="${id}-glass" x1="0" y1="0" x2=".93" y2="1"><stop stop-color="${shot.light.glint}" stop-opacity=".42"/><stop offset=".23" stop-color="#378d99" stop-opacity=".46"/><stop offset=".8" stop-color="#103b51" stop-opacity=".92"/><stop offset="1" stop-color="#031626" stop-opacity=".97"/></linearGradient>
  <filter id="${id}-soft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="17"/></filter>
  </defs>`
  // The three independently authored spatial layers establish lighting,
  // occlusion and camera-cue parallax without raster stock/stock photos.
  return `<g data-r809-visual-scene="${escape(stage)}" data-r809-visual-phase="${motionPhase}" data-evidencemotion-look="${CINEMATIC_LOOK}" data-cinematic-dna="${shot.id}" data-cinematic-camera="${shot.camera}" data-cinematic-material="${shot.material}" data-cinematic-composition="${shot.composition}" aria-label="Depth-layered symbolic educational object" transform="translate(${g(cx)} ${g(cy)}) scale(${g(scale)}) rotate(${shot.framingDegrees})">
    ${definitions}
    <g data-depth-plane="far" transform="translate(${final?g(shot.parallax.far.x):g(-shot.parallax.far.x)} ${final?g(shot.parallax.far.y):g(-shot.parallax.far.y)})">${motif}<ellipse cx="15" cy="-2" rx="352" ry="245" fill="url(#${id}-halo)"/><circle cx="-250" cy="-144" r="29" fill="#6bf5d4" opacity=".23" filter="url(#${id}-soft)"/><circle cx="238" cy="123" r="26" fill="#f9b478" opacity=".23" filter="url(#${id}-soft)"/></g>
    <g data-depth-plane="mid" transform="translate(${final?g(shot.parallax.mid.x):g(-shot.parallax.mid.x)} ${depth+(final?g(shot.parallax.mid.y):g(-shot.parallax.mid.y))})"><ellipse cx="4" cy="208" rx="252" ry="35" fill="#000913" opacity=".42" filter="url(#${id}-soft)"/>${actor}</g>
    <g data-depth-plane="near" transform="translate(${final?g(shot.parallax.near.x):g(-shot.parallax.near.x)} ${final?g(shot.parallax.near.y):g(-shot.parallax.near.y)})"><path d="M -320 160 Q -118 226 43 215" fill="none" stroke="#8cf7df" stroke-width="4" opacity=".22"/><path d="M 160 -190 Q 271 -154 305 -70" fill="none" stroke="#ffdda9" stroke-width="5" opacity=".35"/></g>
  </g>`
}
