#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const currentPath = process.argv[2] || path.join(root, 'ops', 'product-monitor', 'current.json')
const baselinePath = process.argv[3] || path.join(root, 'ops', 'product-monitor', 'reviewed-baseline.json')
const outputPath = process.argv[4] || path.join(root, 'reports', 'product-freshness.json')
const staleDays = Number(process.env.PRODUCT_STALE_DAYS || 90)
const dayMs = 86400000

const read = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : { products: [] }
const current = read(currentPath)
const baseline = read(baselinePath)
const baselineByKey = new Map((baseline.products || []).map((product) => [product.key, product]))
const now = Date.now()

const products = (current.products || []).map((product) => {
  const reviewed = baselineByKey.get(product.key) || {}
  const reasons = []
  let status = 'active'
  const checkedAt = Date.parse(product.checkedAt || '')
  const ageDays = Number.isFinite(checkedAt) ? Math.floor(Math.max(0, now - checkedAt) / dayMs) : null

  if (ageDays === null || ageDays > staleDays) {
    status = 'stale'
    reasons.push(ageDays === null ? 'No valid last-check date.' : `Last check is ${ageDays} days old.`)
  }

  if (product.available === false || [404, 410].includes(Number(product.httpStatus)) || /discontinued|no longer available/i.test(String(product.availabilityText || ''))) {
    status = 'discontinued'
    reasons.push('Current monitor indicates the product is no longer available.')
  }

  const fingerprintChanged = reviewed.formulationFingerprint && product.formulationFingerprint && reviewed.formulationFingerprint !== product.formulationFingerprint
  const evidenceFormChanged = reviewed.evidenceForm && product.currentForm && String(reviewed.evidenceForm).trim().toLowerCase() !== String(product.currentForm).trim().toLowerCase()
  if (fingerprintChanged || evidenceFormChanged) {
    status = 'formulation-changed'
    reasons.push(fingerprintChanged ? 'Formulation fingerprint differs from the reviewed baseline.' : 'Current form differs from the evidence form recorded at review.')
  }

  return {
    key: product.key,
    title: product.title,
    url: product.url,
    status,
    ageDays,
    reasons,
    action: status === 'discontinued' || status === 'formulation-changed' ? 'pause' : status === 'stale' ? 'review' : 'allow',
  }
})

const counts = products.reduce((acc, product) => {
  acc[product.status] = (acc[product.status] || 0) + 1
  return acc
}, {})

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), staleDays, counts, products }, null, 2)}\n`)
console.log(`Wrote product freshness report to ${outputPath}`)

if (products.some((product) => product.action === 'pause')) process.exitCode = 1
