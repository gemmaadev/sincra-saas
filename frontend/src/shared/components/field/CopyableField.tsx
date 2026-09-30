import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import type { FieldProps } from './field.types'

export function CopyableField({ label, value }: FieldProps) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm text-ink-muted">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-ink">{value}</span>
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copiar ${label.toLowerCase()}`}
          className="text-ink-muted hover:text-primary"
        >
          {copied ? (
            <Check size={14} className="text-success" aria-hidden="true" />
          ) : (
            <Copy size={14} aria-hidden="true" />
          )}
        </button>
      </div>
    </div>
  )
}
