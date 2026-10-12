import { describe, expect, it } from 'vitest'
import {
  MOBILE_AUDIO_PROFILE, mobileAacEncodeArgs, assertNoDecorativeVideoChrome,
  assertMobileAudioProbe, assertAudibleDecodedAudio, assertMobilePlaybackReceipt,
} from '../evidencemotion-delivery-guardrails.mjs'

const svg = (label) => `<svg xmlns="http://www.w3.org/2000/svg"><text x="58" y="1184">${label}</text></svg>`
const goodProfile = {
  audioCodec: 'aac', audioSampleRate: 44100, audioChannels: 2, audioChannelLayout: 'stereo',
  mobileAudioVerified: true,
  decodedAudio: { meanVolumeDb: -21.3, maxVolumeDb: -1.1, verification: 'decoded-final-mp4-volumedetect' },
}

describe('EvidenceMotion permanent screen + iPhone playback guardrails', () => {
  it('allows source citations, legitimate science language and concise branding', () => {
    expect(assertNoDecorativeVideoChrome(svg('PMID 38788532'))).toBe(true)
    expect(assertNoDecorativeVideoChrome(svg('Evidence signal remains uncertain'))).toBe(true)
    expect(assertNoDecorativeVideoChrome(svg('The Hippie Scientist'))).toBe(true)
    expect(assertNoDecorativeVideoChrome(svg('This is observational, not causation'))).toBe(true)
  })

  it.each(['SCIENCE / SIGNAL / CONTEXT', 'science — signal — concept',
    'SCIENCE SIGNAL CONCEPT', '001 / Evidence', 'EVIDENCE / 002'])(
    'rejects redundant non-informational bottom chrome: %s', (label) => {
      expect(() => assertNoDecorativeVideoChrome(svg(label))).toThrow(/non-informational footer or serial/)
    }
  )

  it('specifies ordinary 44.1 kHz stereo AAC rather than 24/96 kHz mono', () => {
    expect(MOBILE_AUDIO_PROFILE).toMatchObject({codec:'aac', sampleRate:44100, channels:2, channelLayout:'stereo'})
    expect(mobileAacEncodeArgs()).toEqual(['-c:a','aac','-b:a','192k','-ar','44100','-ac','2'])
  })

  it('requires that FFprobe actually sees the expected audio stream', () => {
    const good={streams:[{codec_name:'aac',sample_rate:'44100',channels:2,channel_layout:'stereo'}]}
    expect(assertMobileAudioProbe(good)).toMatchObject({sampleRate:44100,channels:2})
    expect(() => assertMobileAudioProbe({streams:[{codec_name:'aac',sample_rate:'96000',channels:1}]})).toThrow(/44.1 kHz stereo/)
    expect(() => assertMobileAudioProbe({streams:[]})).toThrow(/exactly one/)
    expect(() => assertMobileAudioProbe({streams:[good.streams[0], good.streams[0]]})).toThrow(/exactly one/)
  })

  it('measures the final AAC decoded waveform and rejects near-silent audio', () => {
    const report='[Parsed_volumedetect_0] mean_volume: -19.7 dB\\n[Parsed_volumedetect_0] max_volume: -1.1 dB'
    expect(assertAudibleDecodedAudio(report)).toMatchObject({meanVolumeDb:-19.7,maxVolumeDb:-1.1})
    expect(() => assertAudibleDecodedAudio('mean_volume: -91.0 dB\\nmax_volume: -80.0 dB')).toThrow(/silent/)
    expect(() => assertAudibleDecodedAudio('n/a')).toThrow(/measured/)
  })

  it('blocks publishing older or merely self-declared AAC receipts', () => {
    expect(assertMobilePlaybackReceipt(goodProfile)).toBe(true)
    expect(() => assertMobilePlaybackReceipt({...goodProfile, audioChannels:1})).toThrow(/44.1 kHz/)
    expect(() => assertMobilePlaybackReceipt({...goodProfile, mobileAudioVerified:false})).toThrow(/verified/)
    expect(() => assertMobilePlaybackReceipt({...goodProfile, decodedAudio:{...goodProfile.decodedAudio,meanVolumeDb:-85}})).toThrow(/decoded-audio/)
  })
})
