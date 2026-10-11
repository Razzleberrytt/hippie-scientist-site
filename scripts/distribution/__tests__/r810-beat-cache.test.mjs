import { describe,it,expect,afterEach } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cachedR810BeatSvg,r810BeatCacheKey,pruneR810BeatCache } from '../r810-beat-cache.mjs'
const hex=(c)=>c.repeat(64)
let tmp=[]
const root=()=>{const p=fs.mkdtempSync(path.join(os.tmpdir(),'ths-r810-cache-'));tmp.push(p);return p}
afterEach(()=>{for(const p of tmp)fs.rmSync(p,{recursive:true,force:true});tmp=[]})
const inputs=()=>({rendererCodeSha256:hex('a'),creativeBriefSha256:hex('b'),
  sceneReceiptSha256:hex('c'),sourceContentHash:'source-pinned-hash'})
describe('R8.10 immutable SVG beat cache',()=>{
  it('reuses bytes unchanged without calling the generator again',()=>{
    const dir=root()
    let renders=0
    const generate=()=>{renders++;return '<svg><text>Approved narrated scene</text></svg>'}
    const first=cachedR810BeatSvg(dir,inputs(),generate)
    const second=cachedR810BeatSvg(dir,inputs(),generate)
    expect(first.cacheHit).toBe(false)
    expect(second.cacheHit).toBe(true)
    expect(first.sha256).toBe(second.sha256)
    expect(renders).toBe(1)
  })
  it('invalidates the cached beat if the renderer source hash or safety-bound input changes',()=>{
    const dir=root()
    const original=cachedR810BeatSvg(dir,inputs(),()=>'<svg>scene A</svg>')
    const changed=cachedR810BeatSvg(dir,{...inputs(),rendererCodeSha256:hex('d')},()=>'<svg>scene B</svg>')
    expect(original.key).not.toBe(changed.key)
    expect(original.sha256).not.toBe(changed.sha256)
    expect(r810BeatCacheKey({...inputs(),sceneReceiptSha256:hex('e')})).not.toBe(original.key)
  })
  it('fails closed on cache tampering or incomplete metadata',()=>{
    const dir=root(),entry=cachedR810BeatSvg(dir,inputs(),()=>'<svg>approved</svg>')
    fs.writeFileSync(path.join(dir,entry.key+'.svg'),'<svg>unapproved</svg>')
    expect(()=>cachedR810BeatSvg(dir,inputs(),()=>'<svg>approved</svg>')).toThrow(/corrupted/)
  })
  it('prunes generated intermediates without touching authoritative source assets',()=>{
    const dir=root()
    cachedR810BeatSvg(dir,inputs(),()=>'<svg>disposable local cache</svg>')
    const found=pruneR810BeatCache(dir,{maxBytes:1,maxAgeDays:30})
    expect(found.removed).toBe(1)
    expect(found.bytesAfter).toBe(0)
  })
})
