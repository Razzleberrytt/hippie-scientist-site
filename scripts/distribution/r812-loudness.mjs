// Post-encode EBU R128 meter. Never infer LUFS from the loudnorm command line.
export const R812_TARGET_LUFS = -14
export function parseR812Loudness(stderr) {
  const raw=String(stderr??'')
  const summary=raw.slice(raw.lastIndexOf('Summary:'))
  if(!summary.includes('Integrated loudness:')||!summary.includes('True peak:'))throw Error('R8.12 FFmpeg EBU R128 meter summary is missing')
  const i=summary.match(/Integrated loudness:\s*I:\s*(-?\d+(?:\.\d+)?)\s*LUFS/)
  const peak=summary.match(/True peak:\s*Peak:\s*(-?\d+(?:\.\d+)?)\s*dBFS/)
  if(!i||!peak)throw Error('R8.12 cannot parse integrated LUFS / true peak')
  const integratedLufs=Number(i[1]),truePeakDbfs=Number(peak[1])
  if(!Number.isFinite(integratedLufs)||!Number.isFinite(truePeakDbfs))throw Error('R8.12 nonfinite audio loudness')
  return {integratedLufs,truePeakDbfs}
}
export function assertR812Loudness(reading, {target=-14,tolerance=1.0,maxTruePeak=-0.5}={}) {
  if(!Number.isFinite(reading?.integratedLufs)||Math.abs(reading.integratedLufs-target)>tolerance)
    throw Error('R8.12 rendered audio misses -14 LUFS integrated target; re-normalize and re-meter before release')
  if(!Number.isFinite(reading?.truePeakDbfs)||reading.truePeakDbfs>maxTruePeak)
    throw Error('R8.12 rendered audio true peak exceeds safe ceiling')
  return {status:'pass',method:'post-encode-ffmpeg-ebur128',...reading,targetLufs:target,toleranceLufs:tolerance,truePeakCeilingDbfs:maxTruePeak}
}
