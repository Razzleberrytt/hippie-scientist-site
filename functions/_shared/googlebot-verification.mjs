import { GOOGLE_COMMON_CRAWLER_PREFIXES } from './google-common-crawler-ranges.mjs'

function ipv4ToBigInt(ip) {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let value = 0n
  for (const part of parts) {
    if (!/^\d+$/.test(part)) return null
    const octet = Number(part)
    if (octet < 0 || octet > 255) return null
    value = (value << 8n) + BigInt(octet)
  }
  return value
}

function ipv6ToBigInt(ip) {
  const value = ip.toLowerCase().split('%')[0]
  if (value.includes('.')) return null
  const halves = value.split('::')
  if (halves.length > 2) return null
  const left = halves[0] ? halves[0].split(':').filter(Boolean) : []
  const right = halves[1] ? halves[1].split(':').filter(Boolean) : []
  const missing = 8 - left.length - right.length
  if (missing < 0 || (halves.length === 1 && missing !== 0)) return null
  const groups = [...left, ...Array(missing).fill('0'), ...right]
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return null
  return groups.reduce((out, group) => (out << 16n) + BigInt(`0x${group}`), 0n)
}

function parseIp(ip) {
  return ip.includes(':') ? { bits: 128, value: ipv6ToBigInt(ip) } : { bits: 32, value: ipv4ToBigInt(ip) }
}

export function ipMatchesCidr(ip, cidr) {
  const [network, prefixRaw] = cidr.split('/')
  const target = parseIp(ip)
  const base = parseIp(network)
  const prefix = Number(prefixRaw)
  if (target.value == null || base.value == null || target.bits !== base.bits || !Number.isInteger(prefix) || prefix < 0 || prefix > target.bits) return false
  const shift = BigInt(target.bits - prefix)
  return (target.value >> shift) === (base.value >> shift)
}

export function isVerifiedGoogleCommonCrawlerIp(ip) {
  return Boolean(ip) && GOOGLE_COMMON_CRAWLER_PREFIXES.some((cidr) => ipMatchesCidr(ip, cidr))
}

export function classifyGooglebot(userAgent) {
  const ua = String(userAgent || '')
  if (!/Googlebot/i.test(ua)) return null
  if (/Googlebot-Image/i.test(ua)) return 'image'
  if (/Googlebot-Video/i.test(ua)) return 'video'
  if (/Mobile|Android|iPhone/i.test(ua)) return 'smartphone'
  return 'desktop'
}
