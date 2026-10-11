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
    if (duration / chunks.length < 0.42) throw new Error('R8.09 captions too fast for readability; revise narration')
    const weight = chunks.map((c) => c.join(' ').length)
    const sum = weight.reduce((a, b) => a + b, 0)
    let elapsedWeight = 0
    for (let i = 0; i < chunks.length; i++) {
      const cueStart = i === 0 ? start : start + duration * elapsedWeight / sum
      elapsedWeight += weight[i]
      const cueEnd = i === chunks.length - 1 ? end : start + duration * elapsedWeight / sum
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
