import { useState } from 'react'

export function useRowSelection(rowKeys: string[]) {
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const allRowsSelected = rowKeys.length > 0 && rowKeys.every((key) => selectedKeys.has(key))

  function toggleRow(key: string) {
    setSelectedKeys((previous) => {
      const next = new Set(previous)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  function toggleAll() {
    setSelectedKeys((previous) => {
      const next = new Set(previous)
      rowKeys.forEach((key) => (allRowsSelected ? next.delete(key) : next.add(key)))
      return next
    })
  }

  function deselect(key: string) {
    setSelectedKeys((previous) => {
      const next = new Set(previous)
      next.delete(key)
      return next
    })
  }

  function clear() {
    setSelectedKeys(new Set())
  }

  return { selectedKeys, selectedCount: selectedKeys.size, toggleRow, toggleAll, deselect, clear }
}
