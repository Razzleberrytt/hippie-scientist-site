// Speech-first, lossless *phrase* captions. Exact audio duration owns each beat.
// Within-beat word timing is estimated; word-level alignment is NOT claimed.
const clean = (text) => String(text ?? '').trim().replace(/\s+/g, ' ')
const ms = (seconds) => {
  const value = Math.round(seconds * 1000)
  const h = String(Math.floor(value / 3600000)).padStart(2, '0')
  const m = String(Math.floor((value % 3600000) / 60000)).padStart(2, '0')
  const s = String(Math.floor((value % 60000) / 1000)).padStart(2, '0')
  return `${h}:${m}:${s},${String(value % 1000).padStart(3, '0')}`
}

function wrap(words) {
  const lines = ['']
  for (const word of words) {
    if (word.length > 24) throw new Error(`R8.09 cannot fit caption word: ${word}`)
    const index = lines.length - 1
    const next = lines[index] ? `${lines[index]} ${word}` : word
    if (next.length <= 24) lines[index] = next
    else if (lines.length < 2) lines.push(word)
    else throw new Error('R8.09 caption exceeds two-line layout; split the phrase')
  }
  return lines
}

function phrases(text) {
  const words = clean(text).split(' ').filter(Boolean)
  const result = []
  let pending = []
  for (const word of words) {
    if (pending.length === 7) {
      result.push(wrap(pending))
      pending = []
    }
    try { wrap([...pending, word]); pending.push(word) }
    catch (error) {
      if (!pending.length) throw error
      result.push(wrap(pending))
      pending = [word]
      wrap(pending)
    }
  }
  if (pending.length) result.push(wrap(pending))
  return result
}

export function buildR809CaptionCues(scenes) {
  const cues = []
  for (const scene of scenes) {
    const spoken = clean(scene.voiceover ?? scene.text)
    if (!spoken) continue
    const start = Number(scene.start)
    const end = Number(scene.end)
    if (!(Number.isFinite(start) && Number.isFinite(end) && end > start)) throw new Error('R8.09 invalid voice beat times')
    const chunks = phrases(spoken)
    const duration = end - start
    const minCueSeconds = 0.42
    if (duration + 1e-9 < chunks.length * minCueSeconds) {
      throw new Error('R8.09 captions too fast for readability; revise narration')
    }
    const weight = chunks.map((c) => c.join(' ').length)
    const sum = weight.reduce((a, b) => a + b, 0)
    // Reserve a readable minimum for EVERY cue before allocating spare time by
    // phrase length. Averaging first and weighting later made one-word endings
    // flash for milliseconds even when the average exceeded 0.42 seconds.
    const remaining = Math.max(0, duration - chunks.length * minCueSeconds)
    let elapsedSeconds = 0
    for (let i = 0; i < chunks.length; i++) {
      const cueStart = i === 0 ? start : start + elapsedSeconds
      elapsedSeconds += minCueSeconds + remaining * weight[i] / sum
      const cueEnd = i === chunks.length - 1 ? end : start + elapsedSeconds
      if (cueEnd - cueStart < minCueSeconds - 1e-6) {
        throw new Error('R8.09 individual caption cue is too fast for readability')
      }
      cues.push({ start: cueStart, end: cueEnd, text: chunks[i].join('\n'), beatId: scene.beatId || null })
    }
  }
  return cues
}

export function renderR809CaptionsSrt(scenes) {
  const cues = buildR809CaptionCues(scenes)
  return cues.map((cue, i) => `${i + 1}\n${ms(cue.start)} --> ${ms(cue.end)}\n${cue.text}`).join('\n\n') + '\n'
}

export function validateR809CaptionsSrt(scenes, actual) {
  const expected = renderR809CaptionsSrt(scenes)
  if (actual !== expected) throw new Error('R8.09 caption track deviates from the exact voice-derived phrase plan')
  return true
}

// Burn-in typography uses native FFmpeg/libass. Cue text is never rewritten.
export function renderR809CaptionAss(scenes) {
  const cues = buildR809CaptionCues(scenes)
  const timestamp = (v) => {
    const cs = Math.round(Number(v) * 100)
    const h = Math.floor(cs / 360000)
    const m = Math.floor(cs % 360000 / 6000)
    const sec = Math.floor(cs % 6000 / 100)
    return `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs % 100).padStart(2, '0')}`
  }
  const header = [
    '[Script Info]', 'ScriptType: v4.00+', 'PlayResX: 1080', 'PlayResY: 1920', 'WrapStyle: 2', 'ScaledBorderAndShadow: yes', '',
    '[V4+ Styles]',
    'Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding',
    'Style: THS,DejaVu Sans,58,&H00FFFFFF,&H00FFFFFF,&HAA0A1320,&H99000000,-1,0,0,0,100,100,0,0,1,4,1,2,140,140,440,1', '',
    '[Events]', 'Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text',
  ]
  const lines = cues.map(({start,end,text}) => {
    // Failing closed prevents source words or punctuation from being silently
    // modified by the ASS markup layer. A caller can revise the narration or
    // use an explicitly reviewed renderer with literal-brace support.
    if (/[{}\\\\]/.test(text)) throw new Error('R8.09 ASS caption contains unrenderable control characters')
    const literal = text.replace(/\n/g, '\\N')
    return `Dialogue: 0,${timestamp(start)},${timestamp(end)},THS,,0,0,0,,${literal}`
  })
  return [...header, ...lines, ''].join('\n')
}
