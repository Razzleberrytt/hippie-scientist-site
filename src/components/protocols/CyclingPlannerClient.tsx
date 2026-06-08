'use client'

import { useState, useMemo } from 'react'
import { Calendar, CheckSquare, Info, ShieldAlert, RotateCw, RefreshCw } from 'lucide-react'

interface CyclingIngredient {
  slug: string
  name: string
  typicalCycle: string
  washoutDays: number
  reason: string
  warning: string
  activeDaysLabel: string
  washoutDaysLabel: string
  substituteSuggestion: string
}

const CYCLING_DATA: CyclingIngredient[] = [
  {
    slug: 'caffeine',
    name: 'Caffeine',
    typicalCycle: '5 days on, 2 days off (or 3 weeks on, 1 week off)',
    washoutDays: 7,
    activeDaysLabel: 'Mon - Fri',
    washoutDaysLabel: 'Sat - Sun (weekly washout) or 1 full week',
    reason: 'Adenosine receptor upregulation leads to tolerance. Regular resets restore receptor sensitivity and reduce withdrawal severity.',
    warning: 'Sudden withdrawal may trigger mild headaches and acute lethargy. Taper dosage or use herbal support.',
    substituteSuggestion: 'L-Tyrosine + L-Theanine stack on off-days to sustain attention without adenosine adaptation.',
  },
  {
    slug: 'l-tyrosine',
    name: 'L-Tyrosine',
    typicalCycle: 'Use 2-3 times per week max, or 4 days on, 3 days off',
    washoutDays: 5,
    activeDaysLabel: 'As needed (max 3 consecutive days)',
    washoutDaysLabel: '4 washout days weekly',
    reason: 'Frequent use downregulates tyrosine hydroxylase (the dopamine rate-limiting enzyme) and depletes dopamine synthesis cofactors.',
    warning: 'Do not stack with MAO inhibitors or thyroid hormones without clinical supervision.',
    substituteSuggestion: 'Rhodiola Rosea or organic decaf green tea for mild dopaminergic support.',
  },
  {
    slug: 'rhodiola-rosea',
    name: 'Rhodiola Rosea',
    typicalCycle: '6 weeks on, 2 weeks off',
    washoutDays: 14,
    activeDaysLabel: '6 consecutive weeks',
    washoutDaysLabel: '2 weeks off-cycle',
    reason: 'Adaptogenic receptor adaptation. Periodic washouts prevent loss of stress-protective efficiency.',
    warning: 'May be mildly stimulating; avoid dosing late in the afternoon to protect sleep architecture.',
    substituteSuggestion: 'Ashwagandha during Rhodiola washout weeks to maintain cortisol regulation.',
  },
  {
    slug: 'ashwagandha',
    name: 'Ashwagandha',
    typicalCycle: '8 - 12 weeks on, 2 weeks off',
    washoutDays: 14,
    activeDaysLabel: '8 - 12 weeks',
    washoutDaysLabel: '2 weeks off-cycle',
    reason: 'Prevents receptor accommodation and mild thyroid hyper-stimulation. Allows HPA axis to recalibrate baseline feedback loops.',
    warning: 'Monitor for signs of mild thyroid excess or emotional blunting (anhedonia). Avoid with active liver conditions.',
    substituteSuggestion: 'Gotu Kola or L-Theanine to sustain GABAergic calm during washout.',
  },
]

export default function CyclingPlannerClient() {
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(['caffeine'])
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({})

  const handleToggleIngredient = (slug: string) => {
    setSelectedSlugs(prev =>
      prev.includes(slug) ? prev.filter(s => s !== slug) : [...prev, slug]
    )
  }

  const activeIngredients = useMemo(() => {
    return CYCLING_DATA.filter(item => selectedSlugs.includes(item.slug))
  }, [selectedSlugs])

  // Generate checklist tasks based on selection
  const checklistTasks = useMemo(() => {
    const tasks: { id: string; text: string; ingredient: string }[] = []
    activeIngredients.forEach(ing => {
      if (ing.slug === 'caffeine') {
        tasks.push(
          { id: 'caf-1', text: 'Schedule a 2-day weekend washout to downregulate adenosine receptors', ingredient: 'Caffeine' },
          { id: 'caf-2', text: 'Prepare caffeine substitution (e.g. herbal tea or decaf) for off-days', ingredient: 'Caffeine' }
        )
      }
      if (ing.slug === 'l-tyrosine') {
        tasks.push(
          { id: 'tyr-1', text: 'Log active days to ensure L-Tyrosine is limited to 3 days maximum per week', ingredient: 'L-Tyrosine' },
          { id: 'tyr-2', text: 'Prepare a cofactor support routine (e.g. Vitamin B6) to help dopamine conversion', ingredient: 'L-Tyrosine' }
        )
      }
      if (ing.slug === 'rhodiola-rosea') {
        tasks.push(
          { id: 'rho-1', text: 'Mark calendar for a 2-week washout after 6 weeks of continuous dosing', ingredient: 'Rhodiola Rosea' },
          { id: 'rho-2', text: 'Verify standardize active rosavins count (3% minimum) on current bottle', ingredient: 'Rhodiola Rosea' }
        )
      }
      if (ing.slug === 'ashwagandha') {
        tasks.push(
          { id: 'ash-1', text: 'Schedule a 2-week off-cycle reset after 10 weeks of daily ashwagandha', ingredient: 'Ashwagandha' },
          { id: 'ash-2', text: 'Assess for any signs of mild emotional blunting or lethargy', ingredient: 'Ashwagandha' }
        )
      }
    })
    return tasks
  }, [activeIngredients])

  const handleToggleTask = (id: string) => {
    setCompletedTasks(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className='space-y-8'>
      {/* Selector Grid */}
      <div className='grid gap-6 md:grid-cols-3'>
        {/* Checkbox selectors */}
        <div className='md:col-span-1 rounded-3xl border border-brand-900/10 bg-white p-5 space-y-4 shadow-xs'>
          <h3 className='text-sm font-bold uppercase tracking-wider text-slate-400'>
            1. Select Stack Components
          </h3>
          <p className='text-xs text-slate-500'>
            Select the ingredients in your current supplement stack to construct your custom wash-out calendar.
          </p>
          <div className='space-y-2.5 pt-1'>
            {CYCLING_DATA.map(item => {
              const isChecked = selectedSlugs.includes(item.slug)
              return (
                <div
                  key={item.slug}
                  onClick={() => handleToggleIngredient(item.slug)}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                    isChecked
                      ? 'bg-emerald-50/50 border-emerald-300 text-emerald-900'
                      : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type='checkbox'
                    checked={isChecked}
                    readOnly
                    className='h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0'
                  />
                  <div>
                    <span className='block text-sm font-bold'>{item.name}</span>
                    <span className='block text-[10px] text-slate-400 mt-0.5 font-medium'>
                      HL: {item.washoutDays} days washout suggested
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Dynamic cycling protocol explanation */}
        <div className='md:col-span-2 rounded-3xl border border-brand-900/10 bg-white p-6 space-y-6 shadow-xs flex flex-col justify-between'>
          <div className='space-y-4'>
            <div className='flex items-center gap-2'>
              <Calendar className='h-5 w-5 text-emerald-600' />
              <h2 className='text-xl font-bold text-slate-800'>Cycling Schedules & Resensitization</h2>
            </div>
            
            {activeIngredients.length === 0 ? (
              <div className='py-8 text-center text-slate-400 text-sm italic border border-dashed border-slate-200 rounded-2xl bg-slate-50/50'>
                Please select at least one ingredient to generate recommendations.
              </div>
            ) : (
              <div className='space-y-5 divide-y divide-slate-100 max-h-[300px] overflow-y-auto pr-2'>
                {activeIngredients.map((ing, idx) => (
                  <div key={ing.slug} className={`pt-4 first:pt-0 space-y-2`}>
                    <div className='flex items-center justify-between'>
                      <span className='font-bold text-slate-800 text-sm'>{ing.name} Protocol</span>
                      <span className='rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 text-[9px] uppercase font-bold'>
                        {ing.washoutDays}d reset
                      </span>
                    </div>
                    <div className='grid gap-2 text-xs grid-cols-2 bg-slate-50/80 p-3 rounded-2xl border border-slate-100/50'>
                      <div>
                        <span className='text-[10px] text-slate-400 font-bold uppercase block'>Active Window</span>
                        <span className='font-semibold text-slate-700'>{ing.activeDaysLabel}</span>
                      </div>
                      <div>
                        <span className='text-[10px] text-slate-400 font-bold uppercase block'>Washout Window</span>
                        <span className='font-semibold text-emerald-700'>{ing.washoutDaysLabel}</span>
                      </div>
                    </div>
                    <p className='text-xs text-slate-500 leading-normal'>
                      <strong>Resensitization mechanism:</strong> {ing.reason}
                    </p>
                    <p className='text-[10px] text-amber-700 bg-amber-50/50 border border-amber-100/50 p-2 rounded-xl flex items-start gap-1.5 leading-normal'>
                      <ShieldAlert className='h-3.5 w-3.5 text-amber-600 shrink-0 mt-0.5' />
                      <span>{ing.warning}</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className='border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500'>
            <div className='flex items-center gap-1.5'>
              <RotateCw className='h-4 w-4 text-emerald-600 animate-spin-slow' />
              <span>Resensitization Calculator Active</span>
            </div>
            <span>Washouts restore 95%+ of receptor density</span>
          </div>
        </div>
      </div>

      {/* Cycling Calendar & Substitute Planner */}
      {activeIngredients.length > 0 && (
        <div className='grid gap-6 md:grid-cols-2'>
          {/* Weekly Washout Checklist */}
          <div className='rounded-3xl border border-brand-900/10 bg-white p-6 shadow-xs space-y-4'>
            <div className='flex items-center gap-2'>
              <CheckSquare className='h-5 w-5 text-emerald-600' />
              <h3 className='text-base font-bold text-slate-800'>Washout Action Checklist</h3>
            </div>
            <p className='text-xs text-slate-500'>
              Follow these actionable tasks to execute your off-cycle washout periods with minimal down-regulation symptoms.
            </p>
            <div className='space-y-3 pt-2 max-h-[250px] overflow-y-auto pr-2'>
              {checklistTasks.map(task => {
                const isDone = Boolean(completedTasks[task.id])
                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`flex items-start gap-3 rounded-2xl border p-3.5 cursor-pointer transition-all ${
                      isDone
                        ? 'bg-slate-50 border-slate-200 text-slate-400 line-through'
                        : 'bg-white border-slate-100 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      id={`task-${task.id}`}
                      type='checkbox'
                      checked={isDone}
                      readOnly
                      className='mt-0.5 h-4 w-4 rounded-md border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer shrink-0'
                    />
                    <div>
                      <label
                        htmlFor={`task-${task.id}`}
                        className='block text-xs font-semibold leading-relaxed cursor-pointer'
                      >
                        {task.text}
                      </label>
                      <span className='inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-500 uppercase mt-1'>
                        {task.ingredient}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Substitution Strategy Column */}
          <div className='rounded-3xl border border-brand-900/10 bg-white p-6 shadow-xs space-y-4 flex flex-col justify-between'>
            <div className='space-y-4'>
              <div className='flex items-center gap-2'>
                <RefreshCw className='h-5 w-5 text-emerald-600' />
                <h3 className='text-base font-bold text-slate-800'>Substitution Strategy</h3>
              </div>
              <p className='text-xs text-slate-500'>
                To maintain productivity and calm focus during washouts, swap your active stimulants/adaptogens for these non-adapting substitutes:
              </p>
              
              <div className='space-y-3 pt-1'>
                {activeIngredients.map(ing => (
                  <div key={ing.slug} className='border border-slate-100 rounded-2xl p-4 bg-slate-50/50 space-y-1.5'>
                    <span className='text-[10px] font-black uppercase text-indigo-900 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-lg inline-block'>
                      Replace {ing.name}
                    </span>
                    <p className='text-xs text-slate-700 leading-relaxed font-semibold'>
                      {ing.substituteSuggestion}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className='border-t border-slate-100 pt-4 flex items-start gap-3 rounded-2xl bg-amber-50/50 p-4 border border-amber-100/50 mt-4'>
              <Info className='h-4 w-4 text-amber-700 shrink-0 mt-0.5' />
              <p className='text-[11px] text-amber-900 leading-normal'>
                <strong>Clinical Note:</strong> Wash-out periods are physiological rests. If your energy, mood, or focus drop significantly during a washout, this may indicate underlying burnout rather than simple tolerance. Rest and sleep hygiene should be prioritized over continuous substitution stacking.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
