// Use the verified offline-acoustic alignment receipt, not proportional scene timing,
// to make R8.10 final MP4 captions. The legacy R8.09 phrase SRT is draft-only.
const clean = (v) => String(v ?? '').trim().replace(/\s+/g,' ')
const stamp = (n,ass=false) => {
  const units=Math.round(Number(n)*(ass?100:1000))
  const factor=ass?100:1000
  const sec=Math.floor(units/factor)
  const hh=Math.floor(sec/3600), mm=Math.floor(sec%3600/60), ss=sec%60
  return ass
    ? [hh,String(mm).padStart(2,'0'),String(ss).padStart(2,'0')].join(':')+'.'+String(units%factor).padStart(2,'0')
    : [hh,String(mm).padStart(2,'0'),String(ss).padStart(2,'0')].join(':')+','+String(units%factor).padStart(3,'0')
}
export function buildR810AlignedCues(scenes,words){
  const cues=[]
  let offset=0
  for(const scene of scenes){
    const spoken=clean(scene.text)
    if(!spoken)continue
    const lexemes=spoken.split(' ').filter(Boolean)
    const aligned=words.slice(offset,offset+lexemes.length)
    if(aligned.length!==lexemes.length)throw Error('R8.10 alignment missing words for '+scene.beatId)
    offset+=lexemes.length
    let chunk=[]
    function push(){
      if(!chunk.length)return
      const first=chunk[0],last=chunk[chunk.length-1]
      if(last.time.end<=first.time.start)throw Error('R8.10 invalid aligned caption duration')
      const split=Math.min(3,chunk.length)
      const lines=chunk.length<=4?[chunk.map(x=>x.word).join(' ')]:[chunk.slice(0,split).map(x=>x.word).join(' '),chunk.slice(split).map(x=>x.word).join(' ')]
      if(lines.some(line=>line.length>45))throw Error('R8.10 caption line exceeds safe width; revise narration')
      cues.push({start:first.time.start,end:last.time.end,beatId:scene.beatId,text:lines.join('\n'),words:chunk.map(x=>({word:x.word,start:Number(x.time.start),end:Number(x.time.end)})),lineBreakAfterWord:chunk.length>4?split:null})
      chunk=[]
    }
    for(let i=0;i<lexemes.length;i++){
      const w=lexemes[i],time=aligned[i]
      if(!Number.isFinite(Number(time.start))||!Number.isFinite(Number(time.end)))throw Error('R8.10 nonfinite aligned caption timing')
      chunk.push({word:w,time})
      if(chunk.length===7){push();continue}
      if(/[.!?]$/.test(w)&&chunk.length>=2)push()
    }
    push()
  }
  if(offset!==words.length)throw Error('R8.10 word alignment has unconsumed speech')
  return cues
}
export function renderR810AlignedCaptionTracks(scenes,words){
  const cues=buildR810AlignedCues(scenes,words)
  const srt=cues.map((cue,i)=>String(i+1)+'\n'+stamp(cue.start)+' --> '+stamp(cue.end)+'\n'+cue.text).join('\n\n')+'\n'
  const header=[
    '[Script Info]','ScriptType: v4.00+','PlayResX: 1080','PlayResY: 1920','WrapStyle: 2','ScaledBorderAndShadow: yes','',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: THS,DejaVu Sans,58,&H00FFFFFF,&H00FFFFFF,&HAA0A1320,&H99000000,-1,0,0,0,100,100,0,0,1,4,1,2,140,140,440,1','',
    '[Events]','Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  const lines=cues.map(c=>{
    if(/[{}\\]/.test(c.text))throw Error('R8.10 control characters cannot be burned as literal subtitles')
    return 'Dialogue: 0,'+stamp(c.start,true)+','+stamp(c.end,true)+',THS,,0,0,0,,'+c.text.replace(/\n/g,'\\N')
  })
  return {srt,ass:[...header,...lines,''].join('\n'),cueCount:cues.length}
}


// R8.17 renders the existing reviewed MFA word timing directly into the
// canonical MP4 via ASS karaoke; phrase-only flashes are not a fallback.
// ASS \k changes from secondary/unhighlighted to primary/highlighted at
// each verified acoustic word onset. No provider credits or timing guesses.
export function renderR817ProgressiveWordCaptions(scenes, alignedWords) {
  const cues=buildR810AlignedCues(scenes,alignedWords)
  const header=[
    '[Script Info]','ScriptType: v4.00+','PlayResX: 1080','PlayResY: 1920',
    'WrapStyle: 2','ScaledBorderAndShadow: yes','',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    // ASS colours are BBGGRR: foreground white, pending words muted teal-grey.
    'Style: THSKaraoke,DejaVu Sans,58,&H00FFFFFF,&H00B6C4BF,&HAA0A1320,&H99000000,-1,0,0,0,100,100,0,0,1,4,1,2,140,140,440,1','',
    '[Events]','Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  let count=0
  const lines=cues.map(cue=>{
    if(!Array.isArray(cue.words)||!cue.words.length) throw Error('R8.17 word-level captions cannot use phrase-only timing')
    if(cue.words.some(w=>/[{}\\]/.test(w.word)))throw Error('R8.17 unsafe caption markup in source word')
    let text=''
    for(let i=0;i<cue.words.length;i++){
      const word=cue.words[i],next=cue.words[i+1]
      const duration=Math.round(((next?next.start:cue.end)-word.start)*100)
      if(!Number.isFinite(duration)||duration<8)throw Error('R8.17 imperceptible karaoke word (minimum 8 centiseconds)')
      // Explicit per-word progression. The last word of a line owns the linebreak.
      text+='{'+'\\k'+duration+'}'+word.word
      if(cue.lineBreakAfterWord===i+1)text+='\\N'
      else if(next)text+=' '
      count++
    }
    return 'Dialogue: 0,'+stamp(cue.start,true)+','+stamp(cue.end,true)+',THSKaraoke,,0,0,0,,'+text
  })
  if(count!==alignedWords.length) throw Error('R8.17 progressive captions omitted an acoustic word')
  const ass=[...header,...lines,''].join('\n')
  if(lines.some(line=>!line.includes('{\\k')))throw Error('R8.17 phrase-flash caption found')
  return {ass,srt:renderR810AlignedCaptionTracks(scenes,alignedWords).srt,
    wordCount:count,cueCount:cues.length,mode:'mfa-acoustic-progressive-word',
    phraseFlashFallback:false,cues}
}
