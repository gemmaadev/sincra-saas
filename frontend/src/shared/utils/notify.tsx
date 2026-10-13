import type { ReactNode } from 'react'
import { notifications } from '@mantine/notifications'
import { Check } from 'lucide-react'

const SUCCESS_AUTO_CLOSE_MS = 4000
const UNDO_AUTO_CLOSE_MS = 6000

export function notifySuccess(message: string) {
  notifications.show({
    message,
    color: 'var(--color-success)',
    icon: <Check size={16} aria-hidden="true" />,
    autoClose: SUCCESS_AUTO_CLOSE_MS,
  })
}

export function notifyWithUndo(message: ReactNode, onUndo: () => void) {
  const id = `undo-${Date.now()}-${Math.random().toString(36).slice(2)}`

  notifications.show({
    id,
    message: (
      <div className="flex items-center justify-between gap-3">
        <span>{message}</span>
        <button
          type="button"
          className="shrink-0 text-sm font-semibold text-primary hover:underline"
          onClick={() => {
            notifications.hide(id)
            onUndo()
          }}
        >
          Deshacer
        </button>
      </div>
    ),
    autoClose: UNDO_AUTO_CLOSE_MS,
  })
}
