import { Building2, Check } from 'lucide-react'
import { BUSINESS_ROLE_LABELS } from '../auth.constants'
import { useSessionBusinesses } from '../hooks/useSessionBusinesses'
import { useSwitchBusiness } from '../hooks/useSwitchBusiness'

interface SwitchBusinessSectionProps {
  currentBusinessId: string
}

export function SwitchBusinessSection({ currentBusinessId }: SwitchBusinessSectionProps) {
  const { data: businesses = [], isSuccess } = useSessionBusinesses()
  const { switchBusiness, switchingBusinessId, error } = useSwitchBusiness()

  if (!isSuccess || businesses.length < 2) return null

  return (
    <div className="border-t border-neutral-100 py-1" role="group" aria-label="Cambiar de negocio">
      <p className="flex items-center gap-2 px-4 py-1 text-xs font-medium text-ink-muted">
        <Building2 size={14} aria-hidden="true" />
        Cambiar de negocio
      </p>
      <div className="max-h-48 overflow-y-auto">
        {businesses.map((business) => {
          const isCurrent = business.businessId === currentBusinessId
          const isSwitching = switchingBusinessId === business.businessId

          return (
            <button
              key={business.businessId}
              type="button"
              role="menuitemradio"
              aria-checked={isCurrent}
              aria-busy={isSwitching}
              aria-label={isCurrent ? `${business.name} (actual)` : business.name}
              disabled={isCurrent || switchingBusinessId !== null}
              onClick={() => switchBusiness(business.businessId)}
              className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm! ${
                isCurrent ? 'text-ink' : 'text-ink hover:bg-surface-hover'
              } disabled:cursor-default`}
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate">
                  {isSwitching ? 'Cambiando...' : business.name}
                </span>
                <span className="block truncate text-xs text-ink-muted">
                  {BUSINESS_ROLE_LABELS[business.role]}
                </span>
              </span>
              {isCurrent && (
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary">
                  <Check size={14} aria-hidden="true" />
                  Actual
                </span>
              )}
            </button>
          )
        })}
      </div>
      {error && <p className="px-4 py-1 text-xs text-error">{error}</p>}
    </div>
  )
}
