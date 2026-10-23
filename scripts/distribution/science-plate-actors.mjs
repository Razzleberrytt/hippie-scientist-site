// Reusable native SVG biology plates for the existing EvidenceMotion cinematic renderer.
// Symbolic educational drawings, not measured anatomy or inferred clinical benefit.
// Evidence, voice, caption, phone, art and publication gates remain independent.
const COLORS=Object.freeze({retina:'#f6b654','nerve-blood':'#e78bd7',collagen:'#f2bd7c','calcium-bone':'#f4db78',membrane:'#8ed9a6',clotting:'#82d6e3'})
export const SCIENCE_PLATE_MOTIFS=Object.freeze(Object.keys(COLORS))
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&apos;'}[c]))
const clean=s=>String(s??'').trim().replace(/\s+/g,' ')
const num=x=>Number(x.toFixed(2))
const circle=(x,y,r,fill,stroke='none',sw=2)=>'<circle cx="'+num(x)+'" cy="'+num(y)+'" r="'+num(r)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'
const ellipse=(x,y,rx,ry,fill,stroke='none',sw=2)=>'<ellipse cx="'+num(x)+'" cy="'+num(y)+'" rx="'+num(rx)+'" ry="'+num(ry)+'" fill="'+fill+'" stroke="'+stroke+'" stroke-width="'+sw+'"/>'
const line=(x,y,u,v,fill,sw=4)=>'<path d="M'+num(x)+' '+num(y)+' L'+num(u)+' '+num(v)+'" fill="none" stroke="'+fill+'" stroke-width="'+sw+'" stroke-linecap="round"/>'
const curve=(d,fill,sw=5)=>'<path d="'+d+'" fill="none" stroke="'+fill+'" stroke-width="'+sw+'" stroke-linecap="round" stroke-linejoin="round"/>'
function teachingArt(motif,color,final){
 const fade=final?1:.30
 if(motif==='retina'){
  const rays=Array.from({length:6},(_,i)=>line(-286,-114+i*41,-183,-114+i*41,color,4)).join('')
  return ellipse(0,0,213,116,'#183145',color,8)+ellipse(0,0,116,116,'#092133','#b6e4fc',8)+
   [92,69,48].map(r=>circle(0,0,r,'none',color,3)).join('')+circle(0,0,25,'#071321')+
   circle(-9,-15,10,'#fff8e9')+rays+'<g opacity="'+fade+'">'+line(118,0,258,0,color,8)+curve('M235 -16 L260 0 L235 16',color,7)+'</g>'
 }
 if(motif==='nerve-blood'){
  const dendrites=Array.from({length:10},(_,i)=>{const a=i*2*Math.PI/10,x=Math.cos(a)*207,y=Math.sin(a)*147
   return curve('M0 0 Q'+num(x*.45)+' '+num(y*.8)+' '+num(x)+' '+num(y),color,5)+circle(x,y,10,color)
  }).join('')
  const blood=[[230,132,50],[-230,125,44],[194,-123,36]].map(([x,y,r])=>ellipse(x,y,r,r*.45,'#b84b6e','#ff9db2',6)+ellipse(x,y,r*.48,r*.2,'#641c3c')).join('')
  return '<g opacity="'+fade+'">'+dendrites+'</g>'+circle(0,0,74,'#48234d',color,7)+circle(0,0,27,'#ed9de9')+blood
 }
 if(motif==='collagen'){
  const colors=['#ffd080','#84dcfa','#fc929f']
  const strands=colors.map((c,j)=>{const d=Array.from({length:29},(_,i)=>(i?'L':'M')+num(100*Math.sin(i*.34+j*2.094))+' '+num(-225+i*16)).join(' ')
   return curve(d,c,10)
  }).join('')
  const rungs=Array.from({length:12},(_,i)=>line(-110*Math.sin(i*.27),-193+i*33,110*Math.sin(i*.27),-193+i*33,'#e4edf5',2)).join('')
  return '<g opacity="'+fade+'">'+rungs+strands+'</g>'
 }
 if(motif==='calcium-bone'){
  const heads=Array.from({length:16},(_,i)=>circle(-240+i*32,-121,10,'#419ac8','#8dd9fb',2)).join('')
  const mineral=Array.from({length:5},(_,i)=>{const x=-180+i*91,y=final?(-35+i%2*66):(-85+i%2*45)
   return circle(x,y,29,'#f8d777','#fff4ad',3)+'<text x="'+x+'" y="'+(y+8)+'" font-size="23" font-weight="700" fill="#35424a" text-anchor="middle">Ca</text>'
  }).join('')
  const bone=Array.from({length:6},(_,i)=>{const x=-230+i*92;return line(x,105,x+57,206,'#e2d6b4',17)+line(x+58,105,x,206,'#b7ac91',13)}).join('')
  return '<rect x="-262" y="-164" width="524" height="93" rx="39" fill="#16314b" stroke="#6ac2ec" stroke-width="5"/>'+
   heads+'<g opacity="'+fade+'">'+mineral+bone+'</g>'
 }
 if(motif==='membrane'){
  const lipids=Array.from({length:42},(_,i)=>{const a=i*2*Math.PI/42,s=Math.sin(a),c=Math.cos(a)
   return circle(c*178,s*178,10,'#469e79','#a8f4b6',2)+circle(c*208,s*208,9,'#2d8c69','#89dbae',1)+line(c*189,s*189,c*198,s*198,'#87d9a3',3)
  }).join('')
  return lipids+circle(0,0,110,'#103c3d','#78c9a4',5)+circle(0,0,41,'#277e60')+
   '<g opacity="'+fade+'">'+circle(246,-141,34,'#7e3447','#fda6aa',5)+
   '<text x="246" y="-128" font-size="45" font-weight="700" fill="#ffe3d6" text-anchor="middle">!</text>'+
   curve('M195 -200 Q286 -241 313 -136',color,8)+'</g>'
 }
 const nodes=Array.from({length:32},(_,i)=>{const a=i*2*Math.PI/32,r=i%3===0?185:i%3===1?124:162;return [Math.cos(a)*r,Math.sin(a)*r]})
 const network=nodes.map(([x,y],i)=>{const [u,v]=nodes[(i+5)%nodes.length];return line(x,y,u,v,color,3)}).join('')+nodes.map(([x,y])=>circle(x,y,7,color)).join('')
 const platelets=[[-143,-95],[160,-72],[123,127],[-108,138]].map(([x,y])=>ellipse(x,y,48,25,'#ac3d58','#f994a8',5)+ellipse(x,y,20,9,'#72253b')).join('')
 return '<g opacity="'+fade+'">'+network+'</g>'+platelets
}
export function renderSciencePlateActor(scene,{x,y,width,height,motionPhase='post',shot}){
 const plan=scene?.scienceIllustration
 if(!plan||typeof plan!=='object'||Array.isArray(plan))throw Error('Science plate requires reviewed structured illustration plan')
 const motif=clean(plan.motif),subject=clean(plan.subject),sourceId=clean(plan.sourceId)
 if(!Object.hasOwn(COLORS,motif))throw Error('Unapproved science plate motif: '+motif)
 if(!subject||subject.length>38||/[<>\n]/.test(subject))throw Error('Science plate needs a short source-authored subject')
 if(!sourceId||sourceId!==clean(scene.factualAuthority)||sourceId==='creative-framing'||!clean(scene.onScreenText)||!clean(scene.voiceover))
  throw Error('Science plate must use the existing narrated scene factual authority')
 if(!['pre','post'].includes(motionPhase))throw Error('Science plate requires voice-owned before/after states')
 if(!shot?.id||!shot.parallax?.far||!shot.parallax?.mid||!shot.parallax?.near)throw Error('Science plate must reuse existing cinematic direction')
 if([x,y,width,height].some(z=>!Number.isFinite(z))||width<240||height<220)throw Error('Science plate needs bounded mobile artwork space')
 const final=motionPhase==='post',c=COLORS[motif],cx=x+width/2,cy=y+height/2-12,s=Math.min(width/700,height/560)
 const offset=(plane,axis)=>num((final?1:-1)*shot.parallax[plane][axis])
 return '<g data-r809-visual-scene="'+esc(scene.visualScene)+'" data-evidencemotion-look="ths-cinematic-2p5d-v1" data-ths-science-plate="'+esc(motif)+
  '" data-science-plate-source="'+esc(sourceId)+'" data-science-plate-motion-phase="'+motionPhase+
  '" data-cinematic-dna="'+esc(shot.id)+'" data-science-plate-review="REVIEW_ONLY_NOT_PUBLICATION_APPROVED" aria-label="'+esc(subject)+
  ' symbolic biology illustration" transform="translate('+num(cx)+' '+num(cy)+') scale('+num(s)+')">'+
  '<defs><radialGradient id="science-'+motif+'-halo"><stop offset="0" stop-color="'+c+'" stop-opacity=".26"/><stop offset="1" stop-color="'+c+'" stop-opacity="0"/></radialGradient></defs>'+
  '<g data-depth-plane="far" transform="translate('+offset('far','x')+' '+offset('far','y')+')">'+
  ellipse(0,0,310,240,'url(#science-'+motif+'-halo)')+circle(-245,-160,17,c)+circle(242,174,12,c)+'</g>'+
  '<g data-depth-plane="mid" transform="translate('+offset('mid','x')+' '+offset('mid','y')+')">'+teachingArt(motif,c,final)+'</g>'+
  '<g data-depth-plane="near" transform="translate('+offset('near','x')+' '+offset('near','y')+')">'+line(-270,230,270,230,c,4)+
  '<text x="0" y="261" fill="#f4f8fc" font-family="sans-serif" font-size="29" font-weight="700" text-anchor="middle">'+esc(subject)+'</text></g></g>'
}
