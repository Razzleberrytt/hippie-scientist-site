/**
 * EvidenceMotion presentation and mobile-playback invariants.
 *
 * Preserve science/source/uncertainty labels. Reject redundant decorative
 * bottom ribbons and verify actual decoded AAC after encoding. A plausible
 * encoder command alone is NOT evidence that a viewer can hear the MP4.
 */
export const MOBILE_AUDIO_PROFILE = Object.freeze({
  codec: 'aac',
  sampleRate: 44100,
  channels: 2,
  channelLayout: 'stereo',
  bitrate: '192k',
})

const stripTags = (value) => String(value ?? '')
  .replace(/<[^>]*>/g, ' ')
  .replace(/&(?:nbsp|#160);/gi, ' ')
  .replace(/&amp;/gi, '&')
  .replace(/\s+/g, ' ')
  .trim()

// Exact ornamental phrases only. "Evidence" and "signal" are legitimate
// scientific terms and must not be rejected when used in actual explanations.
const CHROME_PATTERNS = [
  /^science\s*[/|·–—-]\s*signal\s*[/|·–—-]\s*context$/i,
  /^science\s*[/|·–—-]?\s*signal\s*[/|·–—-]?\s*concept$/i,
  /^(?:00\d\s*[/|·–—-]\s*evidence|evidence\s*[/|·–—-]\s*00\d)$/i,
]

export function assertNoDecorativeVideoChrome(svg) {
  if (typeof svg !== 'string' || !svg.includes('<svg')) throw Error('EvidenceMotion chrome QA requires scene SVG')
  const visible = [...svg.matchAll(/<text\b[^>]*>([\s\S]*?)<\/text>/gi)]
    .map(match => stripTags(match[1]))
  const offending = visible.find(label => CHROME_PATTERNS.some(pattern => pattern.test(label)))
  if (offending) throw Error('EvidenceMotion rejected non-informational footer or serial: ' + offending)
  return true
}

export function mobileAacEncodeArgs() {
  return ['-c:a', MOBILE_AUDIO_PROFILE.codec, '-b:a', MOBILE_AUDIO_PROFILE.bitrate,
    '-ar', String(MOBILE_AUDIO_PROFILE.sampleRate), '-ac', String(MOBILE_AUDIO_PROFILE.channels)]
}

export function assertMobileAudioProbe(probe) {
  const audioStreams = Array.isArray(probe?.streams) ? probe.streams : []
  if (audioStreams.length !== 1) throw Error('Mobile playback QA: exactly one AAC audio stream is required')
  const stream = audioStreams[0]
  if (stream.codec_name !== MOBILE_AUDIO_PROFILE.codec
      || Number(stream.sample_rate) !== MOBILE_AUDIO_PROFILE.sampleRate
      || Number(stream.channels) !== MOBILE_AUDIO_PROFILE.channels
      || !['stereo', ''].includes(String(stream.channel_layout ?? '').toLowerCase())) {
    throw Error('Mobile playback QA: encoded output must be 44.1 kHz stereo AAC')
  }
  return { codec: stream.codec_name, sampleRate: Number(stream.sample_rate), channels: Number(stream.channels), channelLayout: 'stereo' }
}

export function assertAudibleDecodedAudio(log) {
  const transcript = String(log ?? '')
  const meanMatch = transcript.match(/mean_volume:\s*(-?[0-9.]+)\s*dB/i)
  const peakMatch = transcript.match(/max_volume:\s*(-?[0-9.]+)\s*dB/i)
  const meanDb = Number(meanMatch?.[1])
  const peakDb = Number(peakMatch?.[1])
  if (!meanMatch || !peakMatch || !Number.isFinite(meanDb) || !Number.isFinite(peakDb)
      || meanDb <= -50 || peakDb <= -30 || meanDb > peakDb) {
    throw Error('Mobile playback QA: final MP4 AAC decoded silent, too quiet, or could not be measured')
  }
  return { meanVolumeDb: meanDb, maxVolumeDb: peakDb, verification: 'decoded-final-mp4-volumedetect' }
}

export function assertMobilePlaybackReceipt(profile) {
  if (profile?.audioCodec !== 'aac' || profile?.audioSampleRate !== 44100
      || profile?.audioChannels !== 2 || profile?.audioChannelLayout !== 'stereo'
      || profile?.mobileAudioVerified !== true
      || profile?.decodedAudio?.verification !== 'decoded-final-mp4-volumedetect'
      || !Number.isFinite(profile?.decodedAudio?.meanVolumeDb)
      || !Number.isFinite(profile?.decodedAudio?.maxVolumeDb)
      || profile.decodedAudio.meanVolumeDb <= -50
      || profile.decodedAudio.maxVolumeDb <= -30) {
    throw Error('Mobile playback QA: missing verified 44.1 kHz stereo AAC decoded-audio receipt')
  }
  return true
}
