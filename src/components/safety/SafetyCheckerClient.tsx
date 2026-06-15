'use client'

import { useState, useEffect, useRef, useMemo, useId, type KeyboardEvent } from 'react'
import Link from 'next/link'

interface SafetyItem {
  slug: string
  name: string
  type: 'herb' | 'compound'
  safety?: string
  safety_flags?: string[]
  mechanism?: string
  mechanisms?: string[]
}

interface PharmaceuticalMedication {
  id: string
  name: string
  class: string
  safety_triggers: string[]
  description: string
}

const PHARMACEUTICAL_CLASSES: PharmaceuticalMedication[] = [
  {
    id: 'ssri',
    name: 'SSRI / SNRI Antidepressants',
    class: 'Antidepressants',
    safety_triggers: ['serotonergic'],
    description: 'Selective Serotonin/Norepinephrine Reuptake Inhibitors (e.g. Escitalopram, Sertraline, Fluoxetine, Duloxetine).',
  },
  {
    id: 'maoi',
    name: 'MAO Inhibitors (MAOIs)',
    class: 'Antidepressants',
    safety_triggers: ['maoi'],
    description: 'Monoamine Oxidase Inhibitors (e.g. Phenelzine, Tranylcypromine, Selegiline). Carry severe dietary and drug interaction restrictions.',
  },
  {
    id: 'anticoagulant',
    name: 'Blood Thinners / Anticoagulants',
    class: 'Cardiovascular',
    safety_triggers: ['anticoagulant'],
    description: 'Blood thinners and antiplatelet drugs (e.g. Warfarin, Eliquis, Xarelto, Clopidogrel, high-dose Aspirin).',
  },
  {
    id: 'sedative-med',
    name: 'GABA / CNS Sedatives / Sleep Meds',
    class: 'Sleep & Anxiety',
    safety_triggers: ['sedative'],
    description: 'CNS depressants, benzos, and Z-drugs (e.g. Alprazolam, Diazepam, Clonazepam, Zolpidem, Gabapentin).',
  },
  {
    id: 'stimulant-med',
    name: 'CNS Stimulants (ADHD Meds)',
    class: 'ADHD / Stimulants',
    safety_triggers: ['stimulant'],
    description: 'CNS stimulants (e.g. Amphetamine/Adderall, Methylphenidate/Ritalin, Vyvanse).',
  },
  {
    id: 'bp-med',
    name: 'Blood Pressure / Beta-Blockers',
    class: 'Cardiovascular',
    safety_triggers: ['bp-lowering'],
    description: 'Beta-blockers, ACE inhibitors, and calcium channel blockers (e.g. Metoprolol, Lisinopril, Amlodipine).',
  },
  {
    id: 'thyroid-med',
    name: 'Thyroid Medications',
    class: 'Endocrine',
    safety_triggers: ['thyroid'],
    description: 'Thyroid hormone replacement or antithyroid drugs (e.g. Levothyroxine, Liothyronine, Methimazole).',
  },
  {
    id: 'statin',
    name: 'Statins / Cholesterol Meds',
    class: 'Cardiovascular',
    safety_triggers: ['cyp-interaction', 'liver'],
    description: 'Lipid-lowering drugs with interaction or liver-enzyme considerations (e.g. Atorvastatin, Simvastatin, Rosuvastatin).',
  },
  {
    id: 'diabetes-med',
    name: 'Metformin / Diabetes Meds',
    class: 'Metabolic',
    safety_triggers: ['glucose-lowering'],
    description: 'Blood-sugar-lowering therapies including metformin, insulin, GLP-1 drugs, and sulfonylureas.',
  },
  {
    id: 'hormonal-contraceptive',
    name: 'Hormonal Contraceptives',
    class: 'Hormonal',
    safety_triggers: ['cyp-interaction', 'hormonal'],
    description: 'Oral, patch, ring, implant, or injectable contraceptives that may be affected by enzyme-inducing botanicals.',
  },
  {
    id: 'immunosuppressant',
    name: 'Immunosuppressants',
    class: 'Immune',
    safety_triggers: ['immune-modulating'],
    description: 'Transplant, autoimmune, or biologic immune-suppressing therapies (e.g. Tacrolimus, Cyclosporine, Methotrexate, biologics).',
  },
]

interface SafetyCheckerClientProps {
  herbs: any[]
  compounds: any[]
}

export default function SafetyCheckerClient({ herbs, compounds }: SafetyCheckerClientProps) {
  const searchInputId = useId()
  const searchHelpId = useId()
  const listboxId = useId()
  const selectionStatusId = useId()
  const riskStatusId = useId()
  const [acknowledged, setAcknowledged] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<SafetyItem[]>([])
  const [selectedMeds, setSelectedMeds] = useState<PharmaceuticalMedication[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [focusedIndex, setFocusedIndex] = useState(-1)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Merge datasets
  const allItems = useMemo(() => [
    ...herbs.map(item => ({ ...item, type: 'herb' as const })),
    ...compounds.map(item => ({ ...item, type: 'compound' as const })),
  ] as SafetyItem[], [herbs, compounds])

  // Filter items for search
  const filteredItems = searchQuery
    ? allItems.filter(item => {
        const matchesName = item.name.toLowerCase().includes(searchQuery.toLowerCase())
        const notSelected = !selectedItems.some(selected => selected.slug === item.slug)
        return matchesName && notSelected
      }).slice(0, 8)
    : []
  const activeOptionId = focusedIndex >= 0 && filteredItems[focusedIndex]
    ? `${listboxId}-${filteredItems[focusedIndex].slug}`
    : undefined
  const selectionCount = selectedItems.length + selectedMeds.length

  // Handle outside click to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleAddItem = (item: SafetyItem) => {
    if (!selectedItems.some(i => i.slug === item.slug)) {
      setSelectedItems([...selectedItems, item])
    }
    setSearchQuery('')
    setIsOpen(false)
    setFocusedIndex(-1)
  }

  const handleRemoveItem = (slug: string) => {
    setSelectedItems(selectedItems.filter(item => item.slug !== slug))
  }

  const handleClearAll = () => {
    setSelectedItems([])
    setSelectedMeds([])
  }

  // Analyze interaction warnings
  const analysis = useMemo(() => {
    const alerts: { type: 'danger' | 'warning' | 'info'; title: string; desc: string }[] = []
    
    if (selectedItems.length === 0 && selectedMeds.length === 0) {
      return { alerts, riskLevel: 'low' as const }
    }

    let sedativeCount = 0
    let stimulantCount = 0
    let serotonergicCount = 0
    let maoiCount = 0
    let bleedingCount = 0
    let bpLoweringCount = 0

    const sedativeList: string[] = []
    const stimulantList: string[] = []
    const serotonergicList: string[] = []
    const maoiList: string[] = []
    const bleedingList: string[] = []
    const bpLoweringList: string[] = []

    selectedItems.forEach(item => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase() + ' ' + (item.mechanisms || []).join(' ').toLowerCase()
      const flags = item.safety_flags || []

      // 1. Sedatives (GABA/CNS Depressants)
      const isSedative = safetyText.includes('sedative') || safetyText.includes('depressant') || safetyText.includes('drowsiness') ||
                        mechText.includes('gaba-a') || mechText.includes('gabaergic') || mechText.includes('valerian') || mechText.includes('kava') ||
                        flags.includes('sedative')

      if (isSedative) {
        sedativeCount++
        sedativeList.push(item.name)
      }

      // 2. Stimulants
      const isStimulant = safetyText.includes('stimulant') || safetyText.includes('insomnia') || safetyText.includes('hypertension') ||
                          mechText.includes('stimulant') || mechText.includes('caffeine') || mechText.includes('ephedrine') || mechText.includes('yohimbine') ||
                          flags.includes('stimulant')

      if (isStimulant) {
        stimulantCount++
        stimulantList.push(item.name)
      }

      // 3. Serotonergic
      const isSerotonergic = safetyText.includes('serotonin syndrome') || safetyText.includes('ssri') || safetyText.includes('maoi') ||
                             mechText.includes('serotonin reuptake') || mechText.includes('5-ht') || mechText.includes('serotonergic') || mechText.includes('kanna') ||
                             flags.includes('serotonergic')

      if (isSerotonergic) {
        serotonergicCount++
        serotonergicList.push(item.name)
      }

      // 4. MAOI
      const isMaoi = safetyText.includes('maoi') || safetyText.includes('monoamine oxidase') || 
                      mechText.includes('mao inhibitor') || mechText.includes('maoi') ||
                      flags.includes('maoi')

      if (isMaoi) {
        maoiCount++
        maoiList.push(item.name)
      }

      // 5. Anticoagulants (bleeding risk)
      const isAnticoagulant = safetyText.includes('bleeding') || safetyText.includes('anticoagulant') || safetyText.includes('blood thinner') || safetyText.includes('surgery') ||
                              mechText.includes('antiplatelet') || mechText.includes('antithrombotic') ||
                              flags.includes('bleeding') || flags.includes('anticoagulant')

      if (isAnticoagulant) {
        bleedingCount++
        bleedingList.push(item.name)
      }

      // 6. Blood pressure lowering
      const isBpLowering = safetyText.includes('hypotension') || safetyText.includes('blood pressure') || safetyText.includes('cardiovascular') ||
                           mechText.includes('vasodilation') || mechText.includes('blood pressure')

      if (isBpLowering) {
        bpLoweringCount++
        bpLoweringList.push(item.name)
      }
    })

    // Process selected medications
    selectedMeds.forEach(med => {
      if (med.safety_triggers.includes('serotonergic')) {
        serotonergicCount++
        serotonergicList.push(`${med.name} (Medication)`)
      }
      if (med.safety_triggers.includes('maoi')) {
        maoiCount++
        maoiList.push(`${med.name} (Medication)`)
      }
      if (med.safety_triggers.includes('sedative')) {
        sedativeCount++
        sedativeList.push(`${med.name} (Medication)`)
      }
      if (med.safety_triggers.includes('stimulant')) {
        stimulantCount++
        stimulantList.push(`${med.name} (Medication)`)
      }
      if (med.safety_triggers.includes('anticoagulant')) {
        bleedingCount++
        bleedingList.push(`${med.name} (Medication)`)
      }
      if (med.safety_triggers.includes('bp-lowering')) {
        bpLoweringCount++
        bpLoweringList.push(`${med.name} (Medication)`)
      }
    })

    // Generate alerts
    if (sedativeCount >= 2) {
      const hasMed = selectedMeds.some(m => m.safety_triggers.includes('sedative'))
      alerts.push({
        type: 'warning',
        title: hasMed ? 'Drug-Supplement Sedative Overlap' : 'CNS Depressant / GABAergic Overlap',
        desc: hasMed
          ? `Combining sedative medications with GABAergic supplements (${sedativeList.join(', ')}) can cause severe drowsiness, respiratory depression, and cognitive/motor impairment.`
          : `You have selected multiple ingredients with sedative or GABAergic mechanisms (${sedativeList.join(', ')}). Combining them can significantly compound drowsiness, motor impairment, and cognitive slowing.`
      })
    }

    if (serotonergicCount >= 2) {
      const hasMed = selectedMeds.some(m => m.safety_triggers.includes('serotonergic'))
      alerts.push({
        type: 'danger',
        title: hasMed ? 'Drug-Supplement Serotonin Toxicity Risk' : 'Serotonin Toxicity (Serotonin Syndrome) Risk',
        desc: hasMed
          ? `Stacking serotonergic medications with serotonergic supplements (${serotonergicList.join(', ')}) significantly increases the risk of Serotonin Syndrome. Symptoms include rapid heart rate, muscle rigidity, high fever, and confusion.`
          : `Multiple selected ingredients modulate serotonin levels or pathways (${serotonergicList.join(', ')}). Combining them increases the risk of Serotonin Syndrome, which presents as high body temperature, agitation, tremor, and rapid heart rate.`
      })
    }

    if (stimulantCount >= 2) {
      const hasMed = selectedMeds.some(m => m.safety_triggers.includes('stimulant'))
      alerts.push({
        type: 'warning',
        title: hasMed ? 'Drug-Supplement Overstimulation Overlap' : 'Cardiovascular Overstimulation Stack',
        desc: hasMed
          ? `Combining CNS stimulant medications with stimulant supplements (${stimulantList.join(', ')}) can compound heart rate increases, hypertensive spikes, palpitations, and severe anxiety.`
          : `Combining multiple stimulants (${stimulantList.join(', ')}) can compound heart rate, blood pressure spikes, palpitations, and severe psychological anxiety or restlessness.`
      })
    }

    const hasMaoiMed = selectedMeds.some(m => m.safety_triggers.includes('maoi'))
    const hasSerotonergicMed = selectedMeds.some(m => m.safety_triggers.includes('serotonergic'))
    const hasStimulantMed = selectedMeds.some(m => m.safety_triggers.includes('stimulant'))

    const hasMaoiSupp = selectedItems.some(item => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase() + ' ' + (item.mechanisms || []).join(' ').toLowerCase()
      const flags = item.safety_flags || []
      return safetyText.includes('maoi') || safetyText.includes('monoamine oxidase') || mechText.includes('mao inhibitor') || mechText.includes('maoi') || flags.includes('maoi')
    })

    const hasSerotonergicSupp = selectedItems.some(item => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase() + ' ' + (item.mechanisms || []).join(' ').toLowerCase()
      const flags = item.safety_flags || []
      return safetyText.includes('serotonin syndrome') || safetyText.includes('ssri') || safetyText.includes('maoi') || mechText.includes('serotonin reuptake') || mechText.includes('5-ht') || mechText.includes('serotonergic') || mechText.includes('kanna') || flags.includes('serotonergic')
    })

    const hasStimulantSupp = selectedItems.some(item => {
      const safetyText = (item.safety || '').toLowerCase()
      const mechText = (item.mechanism || '').toLowerCase() + ' ' + (item.mechanisms || []).join(' ').toLowerCase()
      const flags = item.safety_flags || []
      return safetyText.includes('stimulant') || safetyText.includes('insomnia') || safetyText.includes('hypertension') || mechText.includes('stimulant') || mechText.includes('caffeine') || mechText.includes('ephedrine') || mechText.includes('yohimbine') || flags.includes('stimulant')
    })

    const maoiConflict = (hasMaoiMed && (hasSerotonergicSupp || hasStimulantSupp)) ||
                        (hasMaoiSupp && (hasSerotonergicMed || hasStimulantMed)) ||
                        (maoiCount > 0 && (serotonergicCount > maoiCount || stimulantCount > 0))

    if (maoiConflict) {
      const hasMed = hasMaoiMed || hasSerotonergicMed || hasStimulantMed
      alerts.push({
        type: 'danger',
        title: hasMed ? 'Critical MAOI Drug-Supplement Contraindication' : 'Severe MAOI Contraindication Detected',
        desc: hasMed
          ? `You have matched a Monoamine Oxidase Inhibitor (MAOI) medication (${maoiList.filter(x => x.includes('Medication')).join(', ')}) with serotonergic or stimulant supplements (${[...serotonergicList, ...stimulantList].filter(x => !x.includes('Medication')).join(', ')}). This combination is highly dangerous and can cause fatal hypertensive crises or Serotonin Syndrome.`
          : `You have stacked a Monoamine Oxidase Inhibitor (MAOI) mechanism (${maoiList.join(', ')}) with other serotonergics or stimulants. This combination is highly contraindicated and can lead to acute hypertensive crises or severe serotonin toxicity.`
      })
    }

    if (bleedingCount >= 2) {
      const hasMed = selectedMeds.some(m => m.safety_triggers.includes('anticoagulant'))
      alerts.push({
        type: 'warning',
        title: hasMed ? 'Drug-Supplement Bleeding Risk Overlap' : 'Elevated Bleeding Risk (Anticoagulant Effect)',
        desc: hasMed
          ? `Combining pharmaceutical blood thinners with anticoagulant supplements (${bleedingList.join(', ')}) increases the risk of bruising, gastrointestinal bleeding, or post-injury bleeding complications.`
          : `Multiple ingredients (${bleedingList.join(', ')}) possess blood-thinning or antiplatelet activities. Combining them increases systemic bleeding risk, particularly prior to surgery or in individuals taking pharmaceutical anticoagulants (e.g. Warfarin, Aspirin).`
      })
    }

    if (bpLoweringCount >= 2 || (bpLoweringCount >= 1 && selectedMeds.some(m => m.safety_triggers.includes('bp-lowering')))) {
      const hasMed = selectedMeds.some(m => m.safety_triggers.includes('bp-lowering'))
      alerts.push({
        type: 'warning',
        title: hasMed ? 'Drug-Supplement Blood Pressure Interaction' : 'Additive Hypotensive Risk',
        desc: hasMed
          ? `Combining blood pressure medications with vasoactive or hypotensive supplements (${bpLoweringList.join(', ')}) can cause blood pressure to drop too low (hypotension), leading to dizziness, lightheadedness, or fainting.`
          : `Multiple ingredients (${bpLoweringList.join(', ')}) modulate blood vessel tone or blood pressure. Combining them may have additive hypotensive effects.`
      })
    }

    // Determine overall risk level
    let riskLevel: 'low' | 'medium' | 'high' = 'low'
    if (alerts.some(a => a.type === 'danger')) {
      riskLevel = 'high'
    } else if (alerts.some(a => a.type === 'warning')) {
      riskLevel = 'medium'
    }

    return { alerts, riskLevel }
  }, [selectedItems, selectedMeds])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setFocusedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setFocusedIndex(prev => (prev > 0 ? prev - 1 : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (focusedIndex >= 0 && filteredItems[focusedIndex]) {
        handleAddItem(filteredItems[focusedIndex])
      } else if (filteredItems.length === 1) {
        handleAddItem(filteredItems[0])
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false)
      setFocusedIndex(-1)
    }
  }

  return (
    <div className='space-y-6'>
      {/* Disclaimer Acknowledgment Gate */}
      <div className={`rounded-3xl border p-6 transition-all ${
        acknowledged 
          ? 'border-emerald-900/10 bg-emerald-50/10' 
          : 'border-rose-900/20 bg-rose-50/20 shadow-sm'
      }`}>
        <h2 className='text-base font-bold text-slate-800 flex items-center gap-2'>
          <span aria-hidden="true">⚠️</span>
          Medical Disclaimer & Safety Acknowledgment
        </h2>
        <p className='mt-2 text-xs text-slate-600 leading-relaxed'>
          This safety checker is an educational reference tool built on general biomedical pathways and public databases. It is <strong>not</strong> medical advice, is not monitored by doctors, and cannot replace personalized guidance from a qualified health professional. Stacking supplements, especially alongside prescription drugs, carries inherent physiological risks.
        </p>
        <label className='mt-4 flex items-start gap-3 cursor-pointer select-none text-xs font-semibold text-slate-700'>
          <input
            type='checkbox'
            id='safety-disclaimer-checkbox'
            checked={acknowledged}
            onChange={e => setAcknowledged(e.target.checked)}
            className='mt-0.5 h-5 w-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer transition'
          />
          <span>I acknowledge that this tool is for educational purposes only and agree to consult a clinical professional before starting or changing any supplement regimen.</span>
        </label>
      </div>

      <p id={selectionStatusId} className="sr-only" aria-live="polite">
        {selectionCount === 0 ? 'Current safety checker selection: none.' : `Current safety checker selection: ${selectionCount} item${selectionCount === 1 ? '' : 's'}.`}
      </p>

      <div className='grid grid-cols-1 gap-6 lg:gap-8 lg:grid-cols-3'>
        {/* Selection Column */}
        <div className={`lg:col-span-1 space-y-6 ${!acknowledged ? 'opacity-70 select-none' : ''}`} aria-disabled={!acknowledged}>
          {/* Search Ingredients */}
          <section className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4' ref={dropdownRef} aria-labelledby="ingredient-search-heading">
            <h2 id="ingredient-search-heading" className='text-lg font-bold text-slate-800'>Search Ingredients</h2>
            <p id={searchHelpId} className='text-xs text-slate-500'>
              Add multiple herbs or compounds to evaluate contraindications, drug interactions, and physiological loading overlaps.
            </p>

            <div className='relative'>
              <label htmlFor={searchInputId} className="sr-only">Search herbs or compounds</label>
              <input
                id={searchInputId}
                type='text'
                value={searchQuery}
                disabled={!acknowledged}
                onChange={e => {
                  setSearchQuery(e.target.value)
                  setIsOpen(true)
                  setFocusedIndex(-1)
                }}
                onFocus={() => setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={acknowledged ? 'Type herb or compound...' : 'Please acknowledge disclaimer first...'}
                role='combobox'
                aria-autocomplete='list'
                aria-expanded={isOpen && filteredItems.length > 0}
                aria-controls={listboxId}
                aria-activedescendant={activeOptionId}
                aria-describedby={searchHelpId}
                className='min-h-11 w-full rounded-2xl border border-slate-200 px-4 py-2.5 text-base sm:text-sm focus:border-emerald-500 focus:outline-none disabled:bg-slate-50 disabled:text-slate-400'
              />
            {isOpen && filteredItems.length > 0 && (
              <div id={listboxId} role="listbox" aria-label="Ingredient search results" className='absolute left-0 right-0 top-full z-[110] mt-2 rounded-2xl border border-slate-200 bg-white py-1.5 shadow-xl'>
                {filteredItems.map((item, idx) => (
                  <button
                    key={item.slug}
                    id={`${listboxId}-${item.slug}`}
                    onClick={() => handleAddItem(item)}
                    type='button'
                    role='option'
                    aria-selected={idx === focusedIndex}
                    className={`flex min-h-11 w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${
                      idx === focusedIndex ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span>{item.name}</span>
                    <span className='rounded bg-slate-100 px-2 py-0.5 text-[9px] uppercase font-bold text-slate-500'>
                      {item.type}
                    </span>
                  </button>
                ))}
              </div>
            )}
            {isOpen && searchQuery && filteredItems.length === 0 && (
              <p className="mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600" role="status">
                No matching herbs or compounds found. Try a shorter name or check spelling.
              </p>
            )}
          </div>
        </section>

        {/* Pharmaceutical Medications */}
        <section className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4' aria-labelledby="active-medications-heading">
          <h2 id="active-medications-heading" className='text-sm font-bold text-slate-800'>Active Medications</h2>
          <p className='text-xs text-slate-500'>
            Add your current prescription classes to audit dangerous drug-supplement interactions.
          </p>

          <div className='space-y-2 max-h-60 overflow-y-auto pr-1' role="group" aria-label="Medication classes">
            {PHARMACEUTICAL_CLASSES.map(med => {
              const isSelected = selectedMeds.some(m => m.id === med.id)
              return (
                <button
                  key={med.id}
                  type='button'
                  disabled={!acknowledged}
                  aria-pressed={isSelected}
                  onClick={() => {
                    if (isSelected) {
                      setSelectedMeds(selectedMeds.filter(m => m.id !== med.id))
                    } else {
                      setSelectedMeds([...selectedMeds, med])
                    }
                  }}
                  className={`min-h-11 w-full text-left p-3 rounded-xl border text-xs transition flex flex-col gap-1 ${
                    isSelected
                      ? 'border-emerald-600 bg-emerald-50/70 text-emerald-950 font-medium font-bold'
                      : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-slate-100/60'
                  }`}
                >
                  <div className='flex items-center justify-between w-full'>
                    <span className='font-bold'>{med.name}</span>
                    {isSelected && <span className='text-emerald-700 font-bold'><span aria-hidden="true">✓</span> Active</span>}
                  </div>
                  <span className='text-[10px] text-slate-500 leading-normal'>{med.description}</span>
                </button>
              )
            })}
          </div>
        </section>

        {/* Selected List */}
        <section className='rounded-3xl border border-brand-900/10 bg-white/90 p-5 shadow-sm space-y-4' aria-labelledby="selected-list-heading" aria-describedby={selectionStatusId}>
          <div className='flex items-center justify-between'>
            <h2 id="selected-list-heading" className='text-sm font-bold text-slate-800'>Selected List ({selectionCount})</h2>
            {(selectedItems.length > 0 || selectedMeds.length > 0) && (
              <button
                onClick={handleClearAll}
                className='text-xs font-semibold text-rose-600 hover:underline'
                type='button'
              >
                Clear All
              </button>
            )}
          </div>

          {selectedItems.length === 0 && selectedMeds.length === 0 ? (
            <p className='py-8 text-center text-xs text-slate-400'>
              No items selected. Search above or select active medications to check interactions.
            </p>
          ) : (
            <div className='space-y-2' role="list" aria-label="Selected ingredients and medication classes">
              {selectedItems.map(item => (
                <div
                  key={item.slug}
                  role="listitem"
                  className='flex items-center justify-between rounded-xl bg-slate-50 p-3 border border-slate-100'
                >
                  <div className='min-w-0'>
                    <Link
                      href={item.type === 'herb' ? `/herbs/${item.slug}` : `/compounds/${item.slug}`}
                      className='text-xs font-bold text-slate-800 hover:underline block truncate hover:text-emerald-700'
                    >
                      {item.name}
                    </Link>
                    <span className='text-[8px] uppercase font-bold text-slate-400'>{item.type}</span>
                  </div>
                  <button
                    onClick={() => handleRemoveItem(item.slug)}
                    className='text-slate-450 hover:text-rose-600 hover:bg-slate-100 rounded-lg p-2 transition flex items-center justify-center min-h-[36px] min-w-[36px]'
                    type='button'
                    aria-label={`Remove ${item.name}`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              ))}

              {selectedMeds.map(med => (
                <div
                  key={med.id}
                  role="listitem"
                  className='flex items-center justify-between rounded-xl bg-emerald-50/40 p-3 border border-emerald-100/60'
                >
                  <div className='min-w-0'>
                    <span className='text-xs font-bold text-emerald-950 block truncate'>{med.name}</span>
                    <span className='text-[8px] uppercase font-bold text-emerald-600'>Medication</span>
                  </div>
                  <button
                    onClick={() => setSelectedMeds(selectedMeds.filter(m => m.id !== med.id))}
                    className='text-slate-450 hover:text-rose-600 hover:bg-emerald-100/60 rounded-lg p-2 transition flex items-center justify-center min-h-[36px] min-w-[36px]'
                    type='button'
                    aria-label={`Remove ${med.name}`}
                  >
                    <span aria-hidden="true">✕</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Interaction Reports */}
      <div className={`lg:col-span-2 space-y-6 ${!acknowledged ? 'opacity-70 select-none' : ''}`} aria-disabled={!acknowledged}>
        <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 space-y-6' aria-labelledby="interactive-safety-audit-heading">
          <div className='border-b border-slate-100 pb-4 flex items-center justify-between'>
            <h2 id="interactive-safety-audit-heading" className='text-xl font-bold text-slate-800'>Interactive Safety Audit</h2>
            {(selectedItems.length > 0 || selectedMeds.length > 0) && (
              <span id={riskStatusId} role="status" aria-live="polite" className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${
                analysis.riskLevel === 'high'
                  ? 'bg-rose-100 text-rose-800 animate-pulse'
                  : analysis.riskLevel === 'medium'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}>
                Risk Level: {analysis.riskLevel}
              </span>
            )}
          </div>

          {selectedItems.length === 0 && selectedMeds.length === 0 ? (
            <div className='py-16 text-center text-slate-400 text-sm border border-dashed border-slate-200 rounded-2xl'>
              Add items from the search bar or medications checklist to evaluate safety overlaps and contraindications.
            </div>
          ) : (
            <div className='space-y-6'>
              {/* Warnings and Contraindications alerts */}
              {analysis.alerts.length === 0 ? (
                <div className='rounded-2xl bg-emerald-50/50 border border-emerald-200/40 p-5 text-sm text-emerald-900 leading-relaxed' role="status">
                  <p className='font-bold'><span aria-hidden="true">✓</span> No Severe Interactions Detected</p>
                  <p className='mt-1 text-xs text-emerald-800'>
                    The selected combination does not report immediate chemical contraindications or receptor loading overlaps in our database. Ensure you check individual extract quality guidelines before purchasing.
                  </p>
                </div>
              ) : (
                <div className='space-y-4'>
                  {analysis.alerts.map((alert: any, idx: number) => (
                    <div
                      key={idx}
                      role={alert.type === 'danger' ? 'alert' : 'status'}
                      className={`rounded-2xl p-5 border text-sm leading-relaxed ${
                        alert.type === 'danger'
                          ? 'bg-rose-50 border-rose-200/50 text-rose-900'
                          : 'bg-amber-50 border-amber-200/50 text-amber-900'
                      }`}
                    >
                      <h4 className='font-bold flex items-center gap-2'>
                        <span aria-hidden="true">⚠️</span>
                        {alert.type === 'danger' ? 'Contraindication Alert:' : 'Caution Warning:'}{' '}
                        {alert.title}
                      </h4>
                      <p className='mt-1.5 text-xs opacity-90'>{alert.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Individual Safety Notes Detail */}
              <div className='space-y-3 pt-2'>
                <h3 className='text-xs font-bold uppercase tracking-wider text-slate-400'>
                  Individual Safety Profiles
                </h3>
                <div className='space-y-3'>
                  {selectedItems.map(item => (
                    <div
                      key={item.slug}
                      className='rounded-xl border border-slate-100 p-4 bg-slate-50/30'
                    >
                      <h4 className='text-xs font-bold text-slate-800'>{item.name}</h4>
                      <p className='mt-1 text-xs text-slate-600 leading-relaxed'>
                        {item.safety || 'Generally safe and well-tolerated. Avoid combining with heavy CNS depressants or prescription drugs without medical advice.'}
                      </p>
                    </div>
                  ))}

                  {selectedMeds.map(med => (
                    <div
                      key={med.id}
                      className='rounded-xl border border-slate-100 p-4 bg-emerald-50/10'
                    >
                      <h4 className='text-xs font-bold text-emerald-950'>{med.name}</h4>
                      <p className='mt-1 text-xs text-slate-600 leading-relaxed'>
                        {med.description} If you are taking this medication, exercise extreme caution before starting supplement stacks containing {med.safety_triggers.join(', ')} active ingredients.
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
    </div>
  )
}
