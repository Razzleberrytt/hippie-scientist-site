import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Meta from '@/components/Meta'
import { Button } from '@/components/ui/Button'
import InteractionReportCard from '@/components/interactions/InteractionReportCard'
import InteractionSearch, {
  type InteractionCatalogItem,
} from '@/components/interactions/InteractionSearch'
import SelectedInteractionItems from '@/components/interactions/SelectedInteractionItems'
import InteractionDisclaimer from '@/components/interactions/InteractionDisclaimer'
import InteractionLeadCapture from '@/components/interactions/InteractionLeadCapture'
import { useHerbDataState } from '@/lib/herb-data'
import { InteractionReportSkeleton } from '@/components/skeletons/DetailSkeletons'
import type { InteractionReport, InteractionSourceItem } from '@/types/interactions'
import { checkInteractions } from '@/utils/interactions/checkInteractions'
import { buildStackSummary } from '@/utils/stack/buildStackSummary'
import { exportStackPDF } from '@/utils/stack/exportStackPDF'
import {
  buildReportSummary,
  buildShareCardText,
  buildShareItemsValue,
  buildShareUrl,
  buildStackShareToken,
  getSavedReports,
  parseItemsFromSearch,
  parseStackShareToken,
  saveReport,
  type SavedInteractionReport,
} from '@/utils/interactions/reportSharing'
import { FEATURED_COLLECTION_SLUGS, SEO_COLLECTIONS } from '@/data/seoCollections'
import { type ComboGoal, type PrebuiltCombo, COMBO_GOAL_LABELS } from '@/types/combos'
import { normalizeLookupToken } from '@/utils/normalizeToken'
import { splitClean } from '@/lib/sanitize'
import { pushRecentUnique } from '@/utils/storageState'

type LeadCaptureActionContext = 'after-report' | 'after-save' | 'after-share' | 'after-export'

type InteractionEngagementCounters = {
  saveCount: number
  shareCount: number
  exportCount: number
}

type ComboUsageState = {
  usageCount: Record<string, number>
  recentIds: string[]
}

const GOAL_FILTERS: Array<{ label: string; value: ComboGoal }> = [
  { label: 'Relax', value: 'relaxation' },
  { label: 'Focus', value: 'focus' },
  { label: 'Sleep', value: 'sleep' },
  { label: 'Mood', value: 'mood' },
  { label: 'Energy', value: 'energy' },
]
const STACK_INTENTS = [
  { label: 'Sleep', value: 'sleep' },
  { label: 'Focus', value: 'focus' },
  { label: 'Relaxation', value: 'relaxation' },
] as const
type StackIntent = (typeof STACK_INTENTS)[number]['value']

const INTERACTION_ENGAGEMENT_KEY = 'hs_interaction_engagement_v1'
const INTERACTION_LEAD_CAPTURED_KEY = 'hs_interaction_lead_captured_v1'
const INTERACTION_COMBO_USAGE_KEY = 'hs_interaction_combo_usage_v1'
const STACK_EMAIL_GATE_KEY = 'hs_stack_builder_email_v1'
const STACK_SHARE_PARAM = 'stack'
const INTERACTION_HISTORY_KEY = 'ths:interaction-check-history'
const MAX_SELECTION = 3
const MAX_INTERACTION_HISTORY = 12

type InteractionCheckHistory = {
  id: string
  checkedAt: string
  herbSlugs: string[]
  warningCount: number
}

const DEFAULT_ENGAGEMENT: InteractionEngagementCounters = {
  saveCount: 0,
  shareCount: 0,
  exportCount: 0,
}

function loadEngagementCounters(): InteractionEngagementCounters {
  if (typeof window === 'undefined') return DEFAULT_ENGAGEMENT
  const raw = window.localStorage.getItem(INTERACTION_ENGAGEMENT_KEY)
  if (!raw) return DEFAULT_ENGAGEMENT

  try {
    const parsed = JSON.parse(raw) as Partial<InteractionEngagementCounters>
    return {
      saveCount: Number(parsed.saveCount || 0),
      shareCount: Number(parsed.shareCount || 0),
      exportCount: Number(parsed.exportCount || 0),
    }
  } catch {
    return DEFAULT_ENGAGEMENT
  }
}

function persistEngagementCounters(counters: InteractionEngagementCounters) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INTERACTION_ENGAGEMENT_KEY, JSON.stringify(counters))
}

function loadComboUsage(): ComboUsageState {
  if (typeof window === 'undefined') {
    return { usageCount: {}, recentIds: [] }
  }

  const raw = window.localStorage.getItem(INTERACTION_COMBO_USAGE_KEY)
  if (!raw) return { usageCount: {}, recentIds: [] }

  try {
    const parsed = JSON.parse(raw) as Partial<ComboUsageState>
    const usageCount =
      parsed.usageCount && typeof parsed.usageCount === 'object' ? parsed.usageCount : {}
    const recentIds = Array.isArray(parsed.recentIds)
      ? parsed.recentIds.map(item => String(item))
      : []
    return { usageCount, recentIds }
  } catch {
    return { usageCount: {}, recentIds: [] }
  }
}

function persistComboUsage(value: ComboUsageState) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(INTERACTION_COMBO_USAGE_KEY, JSON.stringify(value))
}

function trackInteractionCheck(items: InteractionCatalogItem[], report: InteractionReport) {
  const herbSlugs = items
    .filter(item => item.kind === 'herb')
    .map(item => item.id.replace(/^herb:/, ''))
    .filter(Boolean)
  if (!herbSlugs.length) return
  const entry: InteractionCheckHistory = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    checkedAt: new Date().toISOString(),
    herbSlugs,
    warningCount: report.findings.length,
  }
  pushRecentUnique(INTERACTION_HISTORY_KEY, entry, MAX_INTERACTION_HISTORY)
}

export default function InteractionsPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { herbs, isLoading: isHerbsLoading } = useHerbDataState()
  const [selectedItems, setSelectedItems] = useState<InteractionCatalogItem[]>([])
  const [report, setReport] = useState<InteractionReport | null>(null)
  const [selectionMessage, setSelectionMessage] = useState<string>('')
  const [copyLinkStatus, setCopyLinkStatus] = useState<'idle' | 'copied'>('idle')
  const [copySummaryStatus, setCopySummaryStatus] = useState<'idle' | 'copied'>('idle')
  const [copyShareCardStatus, setCopyShareCardStatus] = useState<'idle' | 'copied'>('idle')
  const [screenshotMode, setScreenshotMode] = useState(false)
  const [savedReports, setSavedReports] = useState<SavedInteractionReport[]>([])
  const [leadContext, setLeadContext] = useState<LeadCaptureActionContext | null>(null)
  const [leadCaptured, setLeadCaptured] = useState<boolean>(false)
  const [engagementCounters, setEngagementCounters] =
    useState<InteractionEngagementCounters>(DEFAULT_ENGAGEMENT)
  const [prebuiltCombos, setPrebuiltCombos] = useState<PrebuiltCombo[]>([])
  const [comboUsage, setComboUsage] = useState<ComboUsageState>({ usageCount: {}, recentIds: [] })
  const [activeGoalFilter, setActiveGoalFilter] = useState<ComboGoal | null>(null)
  const [activeComboId, setActiveComboId] = useState<string | null>(null)
  const [stackName, setStackName] = useState('')
  const [stackIntent, setStackIntent] = useState<StackIntent>('relaxation')
  const [stackCopyStatus, setStackCopyStatus] = useState<'idle' | 'copied'>('idle')
  const [showEmailGate, setShowEmailGate] = useState(false)
  const [pendingExport, setPendingExport] = useState(false)
  const [emailInput, setEmailInput] = useState('')
  const discoveryCollections = useMemo(
    () =>
      FEATURED_COLLECTION_SLUGS.slice(0, 6)
        .map(slug => SEO_COLLECTIONS.find(collection => collection.slug === slug))
        .filter((collection): collection is (typeof SEO_COLLECTIONS)[number] =>
          Boolean(collection)
        ),
    []
  )

  const herbCatalog = useMemo<InteractionCatalogItem[]>(
    () =>
      herbs.map(herb => ({
        id: `herb:${herb.slug}`,
        name: herb.common || herb.scientific || herb.name || herb.slug,
        kind: 'herb',
        category: String(herb.class || herb.category || ''),
        effects: splitClean(herb.effects),
      })),
    [herbs]
  )

  const catalog = useMemo(
    () => [...herbCatalog].sort((a, b) => a.name.localeCompare(b.name)),
    [herbCatalog]
  )

  const sourceItemMap = useMemo(() => {
    const map = new Map<string, InteractionSourceItem>()

    herbs.forEach(herb => {
      const id = `herb:${herb.slug}`
      map.set(id, {
        id,
        name: herb.common || herb.scientific || herb.name || herb.slug,
        kind: 'herb',
        category: String(herb.class || herb.category || ''),
        mechanism: String(herb.mechanism || herb.mechanismOfAction || ''),
        effects: splitClean(herb.effects),
        activeCompounds: splitClean((herb as Record<string, unknown>).activeCompounds),
        contraindications: splitClean(herb.contraindications),
        interactions: splitClean(herb.interactions),
        interactionTags: splitClean((herb as Record<string, unknown>).interactionTags),
        interactionNotes: splitClean((herb as Record<string, unknown>).interactionNotes),
        safety: splitClean([herb.safety, herb.sideEffects, herb.toxicity]),
        confidence: herb.confidence,
      })
    })

    return map
  }, [herbs])

  const catalogLookup = useMemo(() => {
    const map = new Map<string, InteractionCatalogItem>()

    catalog.forEach(item => {
      const fallbackSlug = item.id.split(':')[1] ?? item.id
      const tokens = [item.name, fallbackSlug]
      for (const token of tokens) {
        const normalized = normalizeLookupToken(token)
        if (normalized && !map.has(normalized)) {
          map.set(normalized, item)
        }
      }
    })

    return map
  }, [catalog])

  const resolvedCombos = useMemo(() => {
    return prebuiltCombos
      .map(combo => {
        const resolvedItems = combo.items
          .map(item => catalogLookup.get(normalizeLookupToken(item)))
          .filter((item): item is InteractionCatalogItem => Boolean(item))
          .slice(0, 3)
        return { combo, resolvedItems }
      })
      .filter(entry => entry.resolvedItems.length >= 2)
  }, [catalogLookup, prebuiltCombos])

  const popularCombos = useMemo(() => {
    const filtered = activeGoalFilter
      ? resolvedCombos.filter(entry => entry.combo.goal === activeGoalFilter)
      : resolvedCombos
    return filtered.slice(0, 12)
  }, [activeGoalFilter, resolvedCombos])

  const trendingCombos = useMemo(() => {
    const byRecent = comboUsage.recentIds
      .map(id => resolvedCombos.find(entry => entry.combo.id === id))
      .filter((entry): entry is (typeof resolvedCombos)[number] => Boolean(entry))

    const byUsage = [...resolvedCombos]
      .sort(
        (a, b) =>
          (comboUsage.usageCount[b.combo.id] ?? 0) - (comboUsage.usageCount[a.combo.id] ?? 0)
      )
      .filter(entry => (comboUsage.usageCount[entry.combo.id] ?? 0) > 0)

    const unique = new Map<string, (typeof resolvedCombos)[number]>()
    ;[...byRecent, ...byUsage].forEach(entry => {
      if (!unique.has(entry.combo.id)) {
        unique.set(entry.combo.id, entry)
      }
    })

    return Array.from(unique.values()).slice(0, 6)
  }, [comboUsage.recentIds, comboUsage.usageCount, resolvedCombos])

  const suggestedCombos = useMemo(() => {
    if (!report) return []
    const selectedIds = new Set(selectedItems.map(item => item.id))

    return resolvedCombos
      .filter(entry => entry.combo.id !== activeComboId)
      .filter(entry => {
        const sharesItem = entry.resolvedItems.some(item => selectedIds.has(item.id))
        const sameGoal =
          activeComboId &&
          resolvedCombos.find(comboEntry => comboEntry.combo.id === activeComboId)?.combo.goal ===
            entry.combo.goal
        return sharesItem || sameGoal
      })
      .slice(0, 4)
  }, [activeComboId, report, resolvedCombos, selectedItems])

  const applyCombo = (entry: (typeof resolvedCombos)[number]) => {
    setSelectedItems(entry.resolvedItems)
    setStackName(entry.combo.name)
    const sourceItems = entry.resolvedItems
      .map(item => sourceItemMap.get(item.id))
      .filter((item): item is InteractionSourceItem => Boolean(item))
    const nextReport = checkInteractions(sourceItems)
    setReport(nextReport)
    trackInteractionCheck(entry.resolvedItems, nextReport)
    setSelectionMessage('')
    setLeadContext('after-report')
    setActiveComboId(entry.combo.id)
    if (
      entry.combo.goal === 'sleep' ||
      entry.combo.goal === 'focus' ||
      entry.combo.goal === 'relaxation'
    ) {
      setStackIntent(entry.combo.goal)
    }

    const sharedItems = buildShareItemsValue(entry.resolvedItems, catalog)
    if (sharedItems) {
      navigate(`/interactions?r=${sharedItems}`, { replace: true })
    }

    setComboUsage(prev => {
      const next: ComboUsageState = {
        usageCount: {
          ...prev.usageCount,
          [entry.combo.id]: (prev.usageCount[entry.combo.id] ?? 0) + 1,
        },
        recentIds: [entry.combo.id, ...prev.recentIds.filter(id => id !== entry.combo.id)].slice(
          0,
          12
        ),
      }
      persistComboUsage(next)
      return next
    })
  }

  const addItem = (item: InteractionCatalogItem) => {
    if (selectedItems.some(existing => existing.id === item.id)) {
      setSelectionMessage(`${item.name} is already selected.`)
      return
    }

    if (selectedItems.length >= MAX_SELECTION) {
      setSelectionMessage('You can select up to 3 items. Remove one to add another.')
      return
    }

    setSelectedItems(prev => {
      return [...prev, item]
    })
    setSelectionMessage('')
  }

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id))
    setSelectionMessage('')
  }

  const runCheck = () => {
    const sourceItems = selectedItems
      .map(item => sourceItemMap.get(item.id))
      .filter((item): item is InteractionSourceItem => Boolean(item))

    const nextReport = checkInteractions(sourceItems)
    setReport(nextReport)
    trackInteractionCheck(selectedItems, nextReport)
    setLeadContext('after-report')
    const sharedItems = buildShareItemsValue(selectedItems, catalog)
    if (sharedItems) {
      navigate(`/interactions?r=${sharedItems}`, { replace: true })
    }
  }

  useEffect(() => {
    setSavedReports(getSavedReports())
    setEngagementCounters(loadEngagementCounters())
    setComboUsage(loadComboUsage())
    if (typeof window !== 'undefined') {
      setLeadCaptured(window.localStorage.getItem(INTERACTION_LEAD_CAPTURED_KEY) === '1')
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    async function loadPrebuiltCombos() {
      try {
        const response = await fetch('/data/prebuiltCombos.json')
        if (!response.ok) return
        const parsed = (await response.json()) as PrebuiltCombo[]
        if (isMounted) {
          setPrebuiltCombos(Array.isArray(parsed) ? parsed : [])
        }
      } catch {
        if (isMounted) {
          setPrebuiltCombos([])
        }
      }
    }

    loadPrebuiltCombos()

    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    if (!catalog.length) return
    const parsed = parseItemsFromSearch(location.search, catalog)
    const params = new URLSearchParams(location.search)
    const stackShared = parseStackShareToken(params.get(STACK_SHARE_PARAM))
    if (parsed.items.length > 0) {
      setSelectedItems(parsed.items)
      if (parsed.items.length >= 2) {
        const sourceItems = parsed.items
          .map(item => sourceItemMap.get(item.id))
          .filter((item): item is InteractionSourceItem => Boolean(item))
        setReport(checkInteractions(sourceItems))
      } else {
        setReport(null)
      }
    }
    if (stackShared?.items?.length) {
      const stackItems = stackShared.items
        .map(id => catalog.find(item => item.id === id))
        .filter((item): item is InteractionCatalogItem => Boolean(item))
      if (stackItems.length) {
        setSelectedItems(stackItems)
      }
      if (
        stackShared.intent === 'sleep' ||
        stackShared.intent === 'focus' ||
        stackShared.intent === 'relaxation'
      ) {
        setStackIntent(stackShared.intent)
      }
      if (stackShared.name) {
        setStackName(stackShared.name)
      }
      if (stackItems.length >= 2) {
        const sourceItems = stackItems
          .map(item => sourceItemMap.get(item.id))
          .filter((item): item is InteractionSourceItem => Boolean(item))
        setReport(checkInteractions(sourceItems))
      }
    }

    if (parsed.invalidTokens.length > 0) {
      setSelectionMessage('Some shared items were not found in the current dataset.')
    } else if (parsed.items.length > 0) {
      setSelectionMessage('')
    }
  }, [catalog, location.search, sourceItemMap])

  const copyShareLink = async () => {
    const shareUrl = buildShareUrl(selectedItems, catalog)
    await navigator.clipboard.writeText(shareUrl)
    setCopyLinkStatus('copied')
    window.setTimeout(() => setCopyLinkStatus('idle'), 1800)
    setLeadContext('after-share')
    setEngagementCounters(prev => {
      const next = { ...prev, shareCount: prev.shareCount + 1 }
      persistEngagementCounters(next)
      return next
    })
  }
  const reportShareUrl = useMemo(
    () =>
      typeof window === 'undefined' || selectedItems.length < 2
        ? ''
        : buildShareUrl(selectedItems, catalog),
    [catalog, selectedItems]
  )
  const reportShareText = encodeURIComponent('Interaction report from The Hippie Scientist')
  const encodedReportUrl = encodeURIComponent(reportShareUrl)

  const onSaveReport = () => {
    if (selectedItems.length < 2) return
    setSavedReports(saveReport(selectedItems))
    setLeadContext('after-save')
    setEngagementCounters(prev => {
      const next = { ...prev, saveCount: prev.saveCount + 1 }
      persistEngagementCounters(next)
      return next
    })
  }

  const loadSavedReport = (savedReport: SavedInteractionReport) => {
    const reloaded = savedReport.items
      .map(id => catalog.find(item => item.id === id))
      .filter((item): item is InteractionCatalogItem => Boolean(item))
      .slice(0, 3)

    if (reloaded.length < 2) {
      setSelectionMessage('This saved report includes items that are no longer available.')
      return
    }

    setSelectedItems(reloaded)
    const sourceItems = reloaded
      .map(item => sourceItemMap.get(item.id))
      .filter((item): item is InteractionSourceItem => Boolean(item))
    setReport(checkInteractions(sourceItems))
    const sharedItems = buildShareItemsValue(reloaded, catalog)
    navigate(`/interactions?r=${sharedItems}`, { replace: true })
  }

  const copyShareCard = async () => {
    if (!report) return
    await navigator.clipboard.writeText(buildShareCardText(report))
    setCopyShareCardStatus('copied')
    window.setTimeout(() => setCopyShareCardStatus('idle'), 1800)
    setLeadContext('after-export')
    setEngagementCounters(prev => {
      const next = { ...prev, exportCount: prev.exportCount + 1 }
      persistEngagementCounters(next)
      return next
    })
  }
  const copyReportSummary = async () => {
    if (!report) return
    await navigator.clipboard.writeText(buildReportSummary(report))
    setCopySummaryStatus('copied')
    window.setTimeout(() => setCopySummaryStatus('idle'), 1800)
    setLeadContext('after-export')
    setEngagementCounters(prev => {
      const next = { ...prev, exportCount: prev.exportCount + 1 }
      persistEngagementCounters(next)
      return next
    })
  }

  const activeStackItems = selectedItems

  const stackSourceItems = useMemo(
    () =>
      activeStackItems
        .map(item => sourceItemMap.get(item.id))
        .filter((item): item is InteractionSourceItem => Boolean(item)),
    [selectedItems, sourceItemMap]
  )

  const activeGoalLabel = useMemo(() => {
    const selectedIntent = STACK_INTENTS.find(intent => intent.value === stackIntent)?.label
    if (selectedIntent) return selectedIntent

    if (activeComboId) {
      const activeCombo = resolvedCombos.find(entry => entry.combo.id === activeComboId)
      if (activeCombo) return COMBO_GOAL_LABELS[activeCombo.combo.goal]
    }

    return null
  }, [activeComboId, resolvedCombos, stackIntent])

  const stackSummary = useMemo(
    () =>
      buildStackSummary({
        stackName,
        goal: activeGoalLabel,
        report,
        sourceItems: stackSourceItems,
      }),
    [activeGoalLabel, report, stackName, stackSourceItems]
  )

  const clearStack = () => {
    setSelectedItems([])
    setStackName('')
    setReport(null)
    setActiveComboId(null)
    setSelectionMessage('')
    navigate('/interactions', { replace: true })
  }

  const copyStack = async () => {
    if (activeStackItems.length === 0) return
    const why =
      report?.findings[0]?.summary || report?.summary || 'No major interaction signals detected.'
    const payload = [
      `${stackSummary.name}:`,
      ...activeStackItems.map(item => `- ${item.name}`),
      '',
      `Goal: ${stackSummary.goal || 'Not specified'}`,
      `Timing: ${stackSummary.recommendedTiming}`,
      'Dosage ranges:',
      `- Light: ${stackSummary.dosageRanges.light}`,
      `- Moderate: ${stackSummary.dosageRanges.moderate}`,
      `- Strong: ${stackSummary.dosageRanges.strong}`,
      '',
      `Verdict: ${stackSummary.interactionVerdict}`,
      '',
      'Why:',
      why,
    ].join('\n')

    await navigator.clipboard.writeText(payload)
    setStackCopyStatus('copied')
    window.setTimeout(() => setStackCopyStatus('idle'), 1800)
  }

  const buildStackShareUrl = () => {
    const token = buildStackShareToken({
      items: activeStackItems.map(item => item.id),
      intent: stackIntent,
      name: stackName,
    })
    const base = `${window.location.origin}${window.location.pathname}${window.location.hash.split('?')[0]}`
    return `${base}?${STACK_SHARE_PARAM}=${token}`
  }

  const copyStackShareLink = async () => {
    if (activeStackItems.length === 0) return
    const shareUrl = buildStackShareUrl()
    await navigator.clipboard.writeText(shareUrl)
    setStackCopyStatus('copied')
    window.setTimeout(() => setStackCopyStatus('idle'), 1800)
  }

  const stackShareUrl = useMemo(
    () =>
      typeof window === 'undefined' || activeStackItems.length === 0 ? '' : buildStackShareUrl(),
    [activeStackItems, stackIntent, stackName]
  )
  const stackShareText = encodeURIComponent(
    `Check out this herb stack on The Hippie Scientist: ${stackName || 'My stack'}`
  )
  const encodedStackUrl = encodeURIComponent(stackShareUrl)

  const runExport = () => {
    if (activeStackItems.length < 2) return
    exportStackPDF(stackSummary)
    setLeadContext('after-export')
    setEngagementCounters(prev => {
      const next = { ...prev, exportCount: prev.exportCount + 1 }
      persistEngagementCounters(next)
      return next
    })
  }

  const startExport = () => {
    if (typeof window !== 'undefined' && window.localStorage.getItem(STACK_EMAIL_GATE_KEY)) {
      runExport()
      return
    }

    setPendingExport(true)
    setShowEmailGate(true)
  }

  const submitEmailGate = () => {
    if (typeof window !== 'undefined' && emailInput.trim()) {
      window.localStorage.setItem(STACK_EMAIL_GATE_KEY, emailInput.trim())
    }
    setShowEmailGate(false)
    if (pendingExport) {
      runExport()
      setPendingExport(false)
    }
  }

  const skipEmailGate = () => {
    setShowEmailGate(false)
    if (pendingExport) {
      runExport()
      setPendingExport(false)
    }
  }

  const powerUserPrompt =
    engagementCounters.saveCount >= 2 ||
    engagementCounters.shareCount >= 2 ||
    engagementCounters.exportCount >= 2

  const shouldShowLeadCapture = Boolean(report) && !leadCaptured
  const activeLeadContext: LeadCaptureActionContext = leadContext || 'after-report'
  const isCatalogLoading = isHerbsLoading

  return (
    <main className='mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10'>
      <Meta
        title='Interaction Checker | The Hippie Scientist'
        description='Check potential overlap signals between 2-3 herbs using structured normalized data.'
        path='/interactions'
      />

      <header className='space-y-2 rounded-2xl border border-white/10 bg-black/35 p-5'>
        <h1 className='text-3xl font-bold text-white sm:text-4xl'>Interaction Checker</h1>
        <p className='max-w-3xl text-sm text-white/80 sm:text-base'>
          Compare 2-3 herbs for overlap signals, safety warnings, and stacking concerns.
        </p>
      </header>

      <section className='space-y-3 rounded-2xl border border-white/10 bg-black/25 p-5'>
        <h2 className='text-lg font-semibold text-white'>Explore by intent</h2>
        <p className='text-xs text-white/70'>
          Not sure where to start? Browse targeted collections, then come back here to check
          overlap.
        </p>
        <div className='flex flex-wrap gap-2'>
          {discoveryCollections.map(collection => (
            <Link
              key={collection.slug}
              to={`/collections/${collection.slug}`}
              className='btn-secondary text-xs'
            >
              {collection.title}
            </Link>
          ))}
        </div>
      </section>

      <section className='space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5'>
        <div className='space-y-2'>
          <div className='flex items-center justify-between gap-3'>
            <h2 className='text-lg font-semibold text-white'>Try a popular combo</h2>
            {activeGoalFilter && (
              <button
                type='button'
                onClick={() => setActiveGoalFilter(null)}
                className='text-xs text-cyan-200/90 underline-offset-2 hover:underline'
              >
                Clear filter
              </button>
            )}
          </div>
          <p className='text-xs text-white/65'>Most people start here. Try one instantly.</p>
          <div className='flex flex-wrap gap-2'>
            {GOAL_FILTERS.map(goal => (
              <button
                key={goal.value}
                type='button'
                onClick={() =>
                  setActiveGoalFilter(current => (current === goal.value ? null : goal.value))
                }
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  activeGoalFilter === goal.value
                    ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100'
                    : 'border-white/20 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {goal.label}
              </button>
            ))}
          </div>
          <div className='flex gap-3 overflow-x-auto pb-1'>
            {popularCombos.map(entry => (
              <button
                key={entry.combo.id}
                type='button'
                onClick={() => applyCombo(entry)}
                className='min-w-[220px] rounded-xl border border-white/15 bg-white/[0.04] p-3 text-left transition hover:bg-white/[0.08]'
              >
                <div className='mb-2 flex items-center justify-between gap-2'>
                  <p className='text-sm font-semibold text-white'>{entry.combo.name}</p>
                  <span className='rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] text-cyan-100'>
                    {COMBO_GOAL_LABELS[entry.combo.goal]}
                  </span>
                </div>
                <p className='text-xs text-white/80'>
                  {entry.resolvedItems.map(item => item.name).join(' + ')}
                </p>
                <p className='mt-2 text-[11px] text-white/60'>{entry.combo.description}</p>
              </button>
            ))}
            {popularCombos.length === 0 && (
              <p className='rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-xs text-white/60'>
                No prebuilt combos found for this filter.
              </p>
            )}
          </div>
        </div>

        {trendingCombos.length > 0 && (
          <div className='space-y-2 rounded-xl border border-white/10 bg-black/20 p-3'>
            <h3 className='text-sm font-semibold text-white'>Trending now</h3>
            <p className='text-xs text-white/65'>Common combinations people explore.</p>
            <div className='flex flex-wrap gap-2'>
              {trendingCombos.map(entry => (
                <button
                  key={entry.combo.id}
                  type='button'
                  onClick={() => applyCombo(entry)}
                  className='rounded-full border border-white/20 bg-white/[0.03] px-3 py-1.5 text-xs text-white/80 transition hover:bg-white/[0.08]'
                >
                  {entry.combo.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <InteractionSearch
          items={catalog}
          selectedIds={selectedItems.map(item => item.id)}
          onAddItem={addItem}
          maxSelection={MAX_SELECTION}
        />

        <SelectedInteractionItems
          items={selectedItems}
          onRemove={removeItem}
          maxSelection={MAX_SELECTION}
        />

        {selectionMessage && (
          <p className='rounded-lg border border-amber-300/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100'>
            {selectionMessage}
          </p>
        )}

        <div className='flex flex-wrap items-center gap-3'>
          <Button
            variant='primary'
            onClick={runCheck}
            disabled={selectedItems.length < 2}
            className='px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60'
          >
            Check Interactions
          </Button>
          {selectedItems.length < 2 && (
            <p className='text-sm text-white/65'>
              Select at least two herbs to generate an interaction report.
            </p>
          )}
        </div>
      </section>

      {isCatalogLoading ? (
        <InteractionReportSkeleton />
      ) : (
        <InteractionReportCard
          report={report}
          screenshotMode={screenshotMode}
          onToggleScreenshotMode={() => setScreenshotMode(prev => !prev)}
          onCopyShareCard={copyShareCard}
          shareCopyStatus={copyShareCardStatus}
          actions={
            <>
              <Button
                variant='default'
                onClick={copyShareLink}
                disabled={selectedItems.length < 2}
                className='px-3 py-1.5 text-xs'
              >
                {copyLinkStatus === 'copied' ? 'Copied!' : 'Copy Share Link'}
              </Button>
              <Button
                variant='default'
                onClick={onSaveReport}
                disabled={selectedItems.length < 2}
                className='px-3 py-1.5 text-xs'
              >
                Save Report
              </Button>
              <Button
                variant='default'
                onClick={copyReportSummary}
                disabled={!report}
                className='px-3 py-1.5 text-xs'
              >
                {copySummaryStatus === 'copied' ? 'Copied!' : 'Copy Report Summary'}
              </Button>
            </>
          }
          footerPrompt='Know someone combining similar herbs? Share this report.'
        />
      )}

      {selectedItems.length >= 2 && (
        <section className='rounded-2xl border border-white/10 bg-black/25 p-5'>
          <h2 className='text-lg font-semibold text-white'>Share this report</h2>
          <p className='mt-1 text-xs text-white/65'>
            Copy and share this link so others can open the same interaction report.
          </p>
          <div className='mt-3 flex flex-wrap gap-2 text-xs'>
            <Button variant='default' onClick={copyShareLink} className='px-3 py-1.5 text-xs'>
              {copyLinkStatus === 'copied' ? 'Copied!' : 'Copy Report Link'}
            </Button>
            <a
              href={`https://twitter.com/intent/tweet?text=${reportShareText}&url=${encodedReportUrl}`}
              target='_blank'
              rel='noreferrer'
              className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
            >
              Share on X
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${encodedReportUrl}`}
              target='_blank'
              rel='noreferrer'
              className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
            >
              Share on Facebook
            </a>
          </div>
        </section>
      )}

      <section className='space-y-4 rounded-2xl border border-white/10 bg-black/30 p-5'>
        <div className='space-y-1'>
          <h2 className='text-lg font-semibold text-white'>Your Stack</h2>
          <p className='text-xs text-white/65'>Save this for later or share it</p>
        </div>

        <label className='block space-y-1'>
          <span className='text-xs font-medium uppercase tracking-wide text-white/70'>
            Stack name (optional)
          </span>
          <input
            value={stackName}
            onChange={event => setStackName(event.target.value)}
            placeholder='My evening unwind stack'
            className='w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-300/60 focus:outline-none'
          />
        </label>
        <div className='space-y-2'>
          <span className='text-xs font-medium uppercase tracking-wide text-white/70'>Intent</span>
          <div className='flex flex-wrap gap-2'>
            {STACK_INTENTS.map(intent => (
              <button
                key={intent.value}
                type='button'
                onClick={() => setStackIntent(intent.value)}
                className={`rounded-full border px-3 py-1 text-xs transition ${
                  stackIntent === intent.value
                    ? 'border-cyan-300/70 bg-cyan-400/20 text-cyan-100'
                    : 'border-white/20 bg-white/[0.03] text-white/70 hover:bg-white/[0.08]'
                }`}
              >
                {intent.label}
              </button>
            ))}
          </div>
        </div>

        {activeStackItems.length === 0 ? (
          <p className='rounded-lg border border-dashed border-white/20 bg-white/[0.02] px-3 py-3 text-sm text-white/65'>
            Add at least two herbs to build your stack.
          </p>
        ) : (
          <ul className='space-y-2'>
            {activeStackItems.map(item => (
              <li
                key={item.id}
                className='flex items-center justify-between rounded-lg border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-white/90'
              >
                <span>{item.name}</span>
                <button
                  type='button'
                  onClick={() => removeItem(item.id)}
                  className='text-xs text-rose-200/90 underline-offset-2 hover:underline'
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className='flex flex-wrap gap-2'>
          <Button
            variant='primary'
            onClick={startExport}
            disabled={activeStackItems.length < 2}
            className='px-3 py-1.5 text-xs'
          >
            Export PDF
          </Button>
          <Button
            variant='default'
            onClick={copyStackShareLink}
            disabled={activeStackItems.length < 1}
            className='px-3 py-1.5 text-xs'
          >
            {stackCopyStatus === 'copied' ? 'Copied!' : 'Copy Stack Link'}
          </Button>
          <Button
            variant='default'
            onClick={copyStack}
            disabled={activeStackItems.length < 1}
            className='px-3 py-1.5 text-xs'
          >
            Copy Stack Notes
          </Button>
          <Button
            variant='default'
            onClick={clearStack}
            disabled={activeStackItems.length < 1}
            className='px-3 py-1.5 text-xs'
          >
            Clear Stack
          </Button>
        </div>

        {activeStackItems.length >= 1 && (
          <div className='rounded-xl border border-white/10 bg-black/20 p-4'>
            <h3 className='text-sm font-semibold text-white'>Share</h3>
            <p className='mt-1 text-xs text-white/65'>
              Share this stack with a clean link. It includes only selected items, intent, and
              optional stack name.
            </p>
            <div className='mt-3 flex flex-wrap gap-2 text-xs'>
              <a
                href={`https://twitter.com/intent/tweet?text=${stackShareText}&url=${encodedStackUrl}`}
                target='_blank'
                rel='noreferrer'
                className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
              >
                Share on X
              </a>
              <a
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodedStackUrl}`}
                target='_blank'
                rel='noreferrer'
                className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
              >
                Share on Facebook
              </a>
              <a
                href={`https://www.reddit.com/submit?url=${encodedStackUrl}&title=${stackShareText}`}
                target='_blank'
                rel='noreferrer'
                className='rounded-full border border-white/20 px-3 py-1.5 text-white/80 hover:bg-white/[0.08]'
              >
                Share on Reddit
              </a>
            </div>
          </div>
        )}

        {activeStackItems.length >= 2 && (
          <div className='grid gap-3 rounded-xl border border-white/10 bg-black/20 p-4 sm:grid-cols-2'>
            <div className='space-y-1'>
              <p className='text-xs uppercase tracking-wide text-cyan-200/80'>Usage timing</p>
              <p className='text-sm text-white/90'>{stackSummary.recommendedTiming}</p>
            </div>
            <div className='space-y-1'>
              <p className='text-xs uppercase tracking-wide text-cyan-200/80'>Dosage guidance</p>
              <ul className='space-y-1 text-xs text-white/80'>
                <li>
                  <strong>Light:</strong> {stackSummary.dosageRanges.light}
                </li>
                <li>
                  <strong>Moderate:</strong> {stackSummary.dosageRanges.moderate}
                </li>
                <li>
                  <strong>Strong:</strong> {stackSummary.dosageRanges.strong}
                </li>
              </ul>
            </div>
            <div className='space-y-1'>
              <p className='text-xs uppercase tracking-wide text-cyan-200/80'>Safety notes</p>
              <ul className='list-disc space-y-1 pl-4 text-xs text-white/80'>
                {(stackSummary.safetyNotes.length
                  ? stackSummary.safetyNotes
                  : [stackSummary.safetySummary]
                ).map(note => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
            <div className='space-y-1'>
              <p className='text-xs uppercase tracking-wide text-cyan-200/80'>
                Interaction warnings
              </p>
              <ul className='list-disc space-y-1 pl-4 text-xs text-white/80'>
                {(stackSummary.interactionWarnings.length
                  ? stackSummary.interactionWarnings
                  : [stackSummary.interactionVerdict]
                ).map(warning => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </section>

      {showEmailGate && (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4'>
          <div className='w-full max-w-md space-y-3 rounded-2xl border border-white/20 bg-slate-950 p-5 shadow-xl'>
            <h3 className='text-lg font-semibold text-white'>Send this stack to your email?</h3>
            <p className='text-sm text-white/70'>
              We can keep this stack handy for later. You can skip this for now.
            </p>
            <input
              type='email'
              value={emailInput}
              onChange={event => setEmailInput(event.target.value)}
              placeholder='you@example.com'
              className='w-full rounded-lg border border-white/20 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/40 focus:border-cyan-300/60 focus:outline-none'
            />
            <div className='flex justify-end gap-2 pt-1'>
              <Button variant='default' onClick={skipEmailGate} className='px-3 py-1.5 text-xs'>
                Skip
              </Button>
              <Button variant='primary' onClick={submitEmailGate} className='px-3 py-1.5 text-xs'>
                Continue to PDF
              </Button>
            </div>
          </div>
        </div>
      )}

      {report && suggestedCombos.length > 0 && (
        <section className='space-y-3 rounded-2xl border border-white/10 bg-black/25 p-5'>
          <h2 className='text-lg font-semibold text-white'>You might also try</h2>
          <p className='text-xs text-white/65'>Common combinations people explore.</p>
          <div className='grid gap-3 sm:grid-cols-2'>
            {suggestedCombos.map(entry => (
              <button
                key={entry.combo.id}
                type='button'
                onClick={() => applyCombo(entry)}
                className='rounded-xl border border-white/15 bg-white/[0.03] p-3 text-left transition hover:bg-white/[0.08]'
              >
                <div className='flex items-center justify-between gap-2'>
                  <p className='text-sm font-medium text-white'>{entry.combo.name}</p>
                  <span className='rounded-full bg-cyan-400/15 px-2 py-0.5 text-[11px] text-cyan-100'>
                    {COMBO_GOAL_LABELS[entry.combo.goal]}
                  </span>
                </div>
                <p className='mt-1 text-xs text-white/80'>
                  {entry.resolvedItems.map(item => item.name).join(' + ')}
                </p>
              </button>
            ))}
          </div>
        </section>
      )}

      {shouldShowLeadCapture && (
        <InteractionLeadCapture
          context={activeLeadContext}
          emphasized={powerUserPrompt}
          onSuccess={() => {
            setLeadCaptured(true)
            if (typeof window !== 'undefined') {
              window.localStorage.setItem(INTERACTION_LEAD_CAPTURED_KEY, '1')
            }
          }}
        />
      )}

      <section className='space-y-3 rounded-2xl border border-white/10 bg-black/25 p-5'>
        <h2 className='text-lg font-semibold text-white'>Saved Reports</h2>
        {savedReports.length === 0 ? (
          <p className='text-sm text-white/70'>No saved reports yet.</p>
        ) : (
          <ul className='space-y-2'>
            {savedReports.map(savedReport => (
              <li key={savedReport.id}>
                <button
                  type='button'
                  onClick={() => loadSavedReport(savedReport)}
                  className='w-full rounded-lg border border-white/15 bg-white/[0.03] px-3 py-2 text-left text-sm text-white/85 transition hover:bg-white/[0.06]'
                >
                  <span className='font-medium'>
                    {savedReport.items
                      .map(id => catalog.find(item => item.id === id)?.name || id)
                      .join(' + ')}
                  </span>
                  <span className='mt-1 block text-xs text-white/60'>
                    Saved {new Date(savedReport.createdAt).toLocaleString()}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <InteractionDisclaimer />
    </main>
  )
}
