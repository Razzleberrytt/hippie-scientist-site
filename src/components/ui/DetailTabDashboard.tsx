'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import clsx from 'clsx'

interface Tab {
  id: string
  label: string
  icon?: React.ReactNode
  content: React.ReactNode
}

interface DetailTabDashboardProps {
  tabs: Tab[]
  defaultTab?: string
}

export default function DetailTabDashboard({ tabs, defaultTab }: DetailTabDashboardProps) {
  const [activeTabId, setActiveTabId] = useState(defaultTab || tabs[0]?.id || '')

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0]

  return (
    <div id="profile-tabs" className="w-full space-y-4 sm:space-y-5">
      {/* Tab Navigation Container */}
      <div className="border-b border-brand-900/10 pb-px">
        {/* Mobile: Scrollable pill-shaped navigation */}
        <div className="flex sm:hidden overflow-x-auto pb-2 -mx-4 px-4 snap-x scrollbar-none gap-1.5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                id={`${tab.id}-tab-mobile`}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={clsx(
                  "snap-center shrink-0 min-h-8 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 border",
                  isActive
                    ? "bg-brand-800 border-brand-800 text-white shadow-sm"
                    : "bg-white/80 border-brand-900/10 text-brand-900 hover:bg-white hover:text-brand-800"
                )}
              >
                <div className="flex items-center gap-1.5">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>
              </button>
            )
          })}
        </div>

        {/* Desktop: Horizontal tab row with sliding indicator line */}
        <div className="hidden sm:flex items-center gap-4 md:gap-5">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTabId
            return (
              <button
                key={tab.id}
                id={`${tab.id}-tab`}
                type="button"
                onClick={() => setActiveTabId(tab.id)}
                className={clsx(
                  "relative py-3 text-sm font-semibold tracking-tight transition duration-200 focus:outline-none",
                  isActive ? "text-brand-800" : "text-muted hover:text-ink"
                )}
              >
                <div className="flex items-center gap-2">
                  {tab.icon}
                  <span>{tab.label}</span>
                </div>

                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-500 rounded-full"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panel Content Container */}
      <div className="relative min-h-[220px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTabId}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
            id={activeTab?.id}
            className="focus:outline-none"
          >
            <div className="space-y-4 sm:space-y-5">
              {activeTab?.content}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
