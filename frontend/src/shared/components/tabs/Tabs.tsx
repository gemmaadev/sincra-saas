import { useState } from 'react'
import type { TabsProps } from './tabs.types'

export function Tabs({ tabs, defaultTab }: TabsProps) {
  const [activeKey, setActiveKey] = useState(defaultTab ?? tabs[0]?.key)
  const activeTab = tabs.find((tab) => tab.key === activeKey)

  return (
    <div>
      <div role="tablist" className="flex gap-4 border-b border-neutral-100">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            id={`tab-${tab.key}`}
            role="tab"
            aria-selected={tab.key === activeKey}
            aria-controls={`tabpanel-${tab.key}`}
            onClick={() => setActiveKey(tab.key)}
            className={`
              border-b-2 px-1 py-2 text-sm font-medium transition-colors
              ${
                tab.key === activeKey
                  ? 'border-primary text-primary'
                  : 'border-transparent text-ink-muted hover:text-ink'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeKey}`}
        aria-labelledby={`tab-${activeKey}`}
        className="pt-4"
      >
        {activeTab?.content}
      </div>
    </div>
  )
}
