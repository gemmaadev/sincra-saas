import { LogOut } from 'lucide-react'
import { SincraLogo } from '@/shared/components/logo'

interface ExitHeaderProps {
  ariaLabel: string
  onExit: () => void
}

export function ExitHeader({ ariaLabel, onExit }: ExitHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-6">
      <SincraLogo size={24} />
      <button
        type="button"
        onClick={onExit}
        aria-label={ariaLabel}
        className="flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm font-medium text-ink-muted transition-colors hover:bg-neutral-100 hover:text-ink"
      >
        Salir <LogOut size={16} aria-hidden="true" />
      </button>
    </div>
  )
}
