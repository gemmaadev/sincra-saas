import { useState } from 'react'
import type { TabsProps } from './tabs.types'

export function Tabs({ tabs, defaultTab, fillHeight = false }: TabsProps) {
  const [activeKey, setActiveKey] = useState(
    defaultTab ?? (tabs.find((tab) => !tab.disabled) ?? tabs[0])?.key,
  )
  const activeTab = tabs.find((tab) => tab.key === activeKey)

  return (
    <div className={fillHeight ? 'flex h-full flex-col' : undefined}>
      <div
        role="tablist"
        className="flex shrink-0 gap-4 border-b overflow-x-auto border-neutral-100"
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            disabled={tab.disabled}
            aria-selected={tab.key === activeKey}
            aria-controls={`tabpanel-${tab.key}`}
            aria-label={tab.count != null ? `${tab.label} ${tab.count}` : undefined}
            onClick={() => !tab.disabled && setActiveKey(tab.key)}
            className={`inline-flex items-center gap-1.5 border-b-2 px-1 py-2 text-sm font-medium transition-colors
              ${
                tab.disabled
                  ? 'cursor-not-allowed border-transparent text-neutral-300'
                  : tab.key === activeKey
                    ? 'cursor-pointer border-primary text-primary'
                    : 'cursor-pointer border-transparent text-ink-muted hover:text-primary hover:border-primary'
              }
            `}
          >
            {tab.label}
            {tab.count != null && (
              <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-neutral-100 px-1.5 text-xs font-semibold text-ink">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeKey}`}
        aria-labelledby={`tab-${activeKey}`}
        className={fillHeight ? 'flex min-h-0 flex-1 flex-col pt-4' : 'pt-4'}
      >
        {activeTab?.content}
      </div>
    </div>
  )
}
