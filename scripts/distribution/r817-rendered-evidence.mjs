import crypto from 'node:crypto'
const sha=v=>crypto.createHash('sha256').update(v).digest('hex')
const hash=v=>/^[a-f0-9]{64}$/.test(String(v??''))
const clean=v=>String(v??'').trim()
export function measureR817HookCenterChange(before,after,{width=160,height=176,pixelDelta=22}={}){
 const size=width*height
 if(!Buffer.isBuffer(before)||!Buffer.isBuffer(after)||before.length!==size||after.length!==size)
   throw Error('R8.17 hook needs two equal decoded grayscale CENTRAL artwork frames')
 const changed=new Uint8Array(size);let count=0
 for(let i=0;i<size;i++){if(Math.abs(before[i]-after[i])>=pixelDelta){changed[i]=1;count++}}
 const visited=new Uint8Array(size);let largest=0;const queue=new Int32Array(size)
 for(let i=0;i<size;i++){
  if(!changed[i]||visited[i])continue
  let head=0,tail=1;queue[0]=i;visited[i]=1
  while(head<tail){
   const p=queue[head++],x=p%width,y=Math.floor(p/width)
   for(const n of [x>0?p-1:-1,x<width-1?p+1:-1,y>0?p-width:-1,y<height-1?p+width:-1]){
    if(n>=0&&changed[n]&&!visited[n]){visited[n]=1;queue[tail++]=n}
   }
  }
  largest=Math.max(largest,tail)
 }
 return {method:'decoded-central-artwork-grayscale-v1',width,height,
   beforeSha256:sha(before),afterSha256:sha(after),
   changeFraction:count/size,largestConnectedChangeFraction:largest/size,
   passed:count/size>=.065&&largest/size>=.012}
}
export function assertR817RenderedActionProof(plan,proof,outputSha256){
 const beats=plan?.beats||[],actions=proof?.actions||[]
 const errors=[]
 if(!hash(outputSha256)||!beats.length||actions.length!==beats.length)errors.push('R8.17 every authored beat requires an actual rendered semantic action receipt')
 if(proof?.outputSha256!==outputSha256)errors.push('R8.17 action inspection is not bound to exact MP4')
 if(!clean(plan?.authorId)||proof?.reviewerId===plan.authorId||!clean(proof?.reviewerId)||
    proof?.independentVisualReview!=='approved')
   errors.push('R8.17 rendered action requires independent non-author visual inspection')
 for(let i=0;i<beats.length;i++){
  const b=beats[i],a=actions[i]
  if(!a||a.beatId!==b.id||a.renderedAction!==b.semanticAction||
    a.renderedObjectKind!==b.visualObject?.kind||a.outputSha256!==outputSha256||
    !hash(a.beforeFrameSha256)||!hash(a.afterFrameSha256)||
    a.beforeFrameSha256===a.afterFrameSha256)
    errors.push('R8.17 rendered action not demonstrably bound to plan intent: '+b.id)
  if(b.artMethod==='rendered-3d'&&(!hash(a?.compositorAssetSha256)||
    a?.compositorEngine!==b.renderEngine||
    a?.compositorAssetSha256!==b.visualObject?.assetSha256||
    a?.verifiedVisiblePocket!==true&&b.visualObject?.kind==='receptor-binding'))
    errors.push('R8.17 compositor did not prove actual source 3D binding geometry: '+b.id)
  if(!a?.visualComprehensionObserved)errors.push('R8.17 rendered action absent independent visual confirmation: '+b.id)
 }
 if(errors.length)throw Error(errors.join('; '))
 return {status:'INDEPENDENT_RENDERED_ACTIONS_APPROVED',actionCount:actions.length,
  exactMasterSha256:outputSha256,reviewerId:proof.reviewerId}
}
export function assertR817HookPixels(hookFrames,outputSha256){
 if(!hookFrames||hookFrames.outputSha256!==outputSha256||!hash(outputSha256)||
   hookFrames.pixelProof?.method!=='decoded-central-artwork-grayscale-v1'||
   hookFrames.pixelProof?.beforeSha256!==hookFrames.beforeSha256||
   hookFrames.pixelProof?.afterSha256!==hookFrames.afterSha256||
   hookFrames.pixelProof?.passed!==true||
   !(hookFrames.pixelProof?.changeFraction>=.065)||
   !(hookFrames.pixelProof?.largestConnectedChangeFraction>=.012)||
   !(hookFrames.afterAtSeconds>0&&hookFrames.afterAtSeconds<=3))
   throw Error('R8.17 first-three-second hook lacks decoded CENTRAL semantic-change pixel receipt')
 return true
}
