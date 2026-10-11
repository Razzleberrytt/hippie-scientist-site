// Native SVG science-cartoon actors. Drawn locally: no stock slides,
// fabricated molecules, ungrounded receptor structures, or paid generators.
// The caller chooses a scene purpose from the evidence-reviewed creative brief.
const clean = (v) => String(v ?? '').trim()
const STAGES = new Set(['person', 'compare', 'molecule', 'evidence', 'uncertainty', 'safety', 'outro'])
export const R809_VISUAL_STAGES = [...STAGES]

export function renderR809VisualActor(scene, {x, y, width, height, foreground, background}) {
  const stage = clean(scene.visualScene)
  if (!STAGES.has(stage)) throw new Error(`R8.09 illustration stage must be one of: ${[...STAGES].join(', ')}`)
  const cx = x + width / 2
  const cy = y + height / 2
  const stroke = `stroke="${foreground}" stroke-width="7" stroke-linecap="round" stroke-linejoin="round"`
  const transparent = 'fill="none"'
  const pale = `fill="${foreground}" fill-opacity=".13"`
  const panel = (px,py,w,h) => `<rect x="${px}" y="${py}" width="${w}" height="${h}" rx="36" ${pale} ${stroke}/>`
  // Illustrated figures, visual comparisons and teaching props -- not generic
  // page cards. Geometries below are symbolic and intentionally non-molecular.
  let actor
  if (stage === 'person') {
    actor = `<circle cx="${cx-95}" cy="${cy-65}" r="67" ${pale} ${stroke}/><path d="M ${cx-206} ${cy+145} Q ${cx-198} ${cy+25} ${cx-95} ${cy+22} Q ${cx+14} ${cy+25} ${cx+18} ${cy+145}Z" ${pale} ${stroke}/><path d="M ${cx+22} ${cy-155} Q ${cx+190} ${cy-205} ${cx+240} ${cy-55} Q ${cx+270} ${cy+45} ${cx+134} ${cy+25} L ${cx+50} ${cy+72} L ${cx+70} ${cy+4} Q ${cx+16} ${cy-46} ${cx+22} ${cy-155}Z" ${pale} ${stroke}/><text x="${cx+135}" y="${cy-37}" text-anchor="middle" font-size="118" font-weight="800" fill="${foreground}">?</text>`
  } else if (stage === 'compare') {
    actor = `<circle cx="${cx-180}" cy="${cy-5}" r="112" ${pale} ${stroke}/><circle cx="${cx+180}" cy="${cy-5}" r="112" ${pale} ${stroke}/><circle cx="${cx-180}" cy="${cy-5}" r="32" fill="${foreground}" opacity=".6"/><circle cx="${cx+180}" cy="${cy-5}" r="26" fill="${foreground}" opacity=".6"/><path d="M ${cx-33} ${cy-5} H ${cx+33} M ${cx+9} ${cy-27} L ${cx+33} ${cy-5} L ${cx+9} ${cy+17}" ${stroke} ${transparent}/><path d="M ${cx-285} ${cy+146} H ${cx-75} M ${cx+75} ${cy+146} H ${cx+285}" ${stroke} ${transparent}/>`
  } else if (stage === 'molecule') {
    // A generic, explicitly symbolic connected-node network.
    const nodes=[[-185,30],[-100,-95],[22,-92],[135,-10],[190,105],[-15,125]]
    const edges=[[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,5]]
    actor = `<g data-r809-symbolic-network="true">${edges.map(([a,b])=>`<path d="M ${cx+nodes[a][0]} ${cy+nodes[a][1]} L ${cx+nodes[b][0]} ${cy+nodes[b][1]}" ${stroke} ${transparent}/>`).join('')}${nodes.map(([nx,ny],i)=>`<circle cx="${cx+nx}" cy="${cy+ny}" r="${i%2?37:47}" ${pale} ${stroke}/>`).join('')}</g>`
  } else if (stage === 'evidence') {
    actor = `<path d="M ${cx-174} ${cy-208} H ${cx+119} L ${cx+190} ${cy-140} V ${cy+208} H ${cx-174}Z" ${pale} ${stroke}/><path d="M ${cx+119} ${cy-208} V ${cy-140} H ${cx+190} M ${cx-100} ${cy-90} H ${cx+88} M ${cx-100} ${cy-16} H ${cx+98} M ${cx-100} ${cy+58} H ${cx+58}" ${transparent} ${stroke}/><circle cx="${cx+108}" cy="${cy+136}" r="48" ${pale} ${stroke}/><path d="M ${cx+80} ${cy+136} L ${cx+100} ${cy+154} L ${cx+133} ${cy+117}" ${transparent} ${stroke}/>`
  } else if (stage === 'uncertainty') {
    actor = `<path d="M ${cx} ${cy-225} Q ${cx+150} ${cy-180} ${cx+185} ${cy-140} V ${cy+25} Q ${cx+185} ${cy+170} ${cx} ${cy+235} Q ${cx-185} ${cy+170} ${cx-185} ${cy+25} V ${cy-140} Q ${cx-150} ${cy-180} ${cx} ${cy-225}Z" ${pale} ${stroke}/><text x="${cx}" y="${cy+73}" text-anchor="middle" font-size="208" font-weight="800" fill="${foreground}">?</text>`
  } else if (stage === 'safety') {
    actor = `<path d="M ${cx} ${cy-210} L ${cx+230} ${cy+184} H ${cx-230}Z" ${pale} ${stroke}/><path d="M ${cx} ${cy-70} V ${cy+68}" ${transparent} ${stroke} stroke-width="22"/><circle cx="${cx}" cy="${cy+112}" r="13" fill="${foreground}"/>`
  } else {
    actor = `<circle cx="${cx}" cy="${cy}" r="175" ${pale} ${stroke}/><path d="M ${cx-70} ${cy+8} L ${cx-10} ${cy+66} L ${cx+98} ${cy-62}" ${transparent} ${stroke} stroke-width="16"/><circle cx="${cx+197}" cy="${cy-167}" r="31" fill="${foreground}" opacity=".35"/><circle cx="${cx-213}" cy="${cy+145}" r="24" fill="${foreground}" opacity=".5"/>`
  }
  const scale = Math.min(1, width / 690, height / 550)
  return `<g data-r809-visual-scene="${stage}" aria-label="Stylized scientific explainer illustration" transform="translate(${cx} ${cy}) scale(${scale}) translate(${-cx} ${-cy})">${actor}</g>`
}
