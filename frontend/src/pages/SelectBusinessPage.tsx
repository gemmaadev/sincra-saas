import { useNavigate } from 'react-router'
import { Building2 } from 'lucide-react'
import { useUserBusinesses } from '@/features/auth/hooks/useUserBusinesses'
import { useSelectBusiness } from '@/features/auth/hooks/useSelectBusiness'
import { sectorLabel } from '@/shared/utils'
import { ExitHeader } from '@/shared/components/exit-header/ExitHeader'
import { Card } from '@/shared/components/card'

export default function SelectBusinessPage() {
  const navigate = useNavigate()
  const { data: businesses = [], isLoading, isError } = useUserBusinesses()
  const { selectBusiness, selectingBusinessId, error: selectError } = useSelectBusiness()

  const error = isError ? 'No se pudieron cargar tus negocios. Inténtalo de nuevo.' : selectError

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <ExitHeader ariaLabel="Cerrar sesión" onExit={() => navigate('/login')} />

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-6 pb-10">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold text-ink">Elige un negocio</h1>
          <p className="text-ink-muted">
            Perteneces a varios negocios en Sincra. Elige con cuál quieres entrar.
          </p>
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        {isLoading ? (
          <p className="text-ink-muted">Cargando tus negocios...</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {businesses.map((business) => (
              <Card
                key={business.businessId}
                padding="md"
                className="transition-colors hover:border-primary hover:bg-primary/5 has-[button:disabled]:opacity-50"
              >
                <button
                  type="button"
                  onClick={() => selectBusiness(business.businessId)}
                  disabled={selectingBusinessId !== null}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary">
                    <Building2 size={26} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">
                      {selectingBusinessId === business.businessId ? 'Entrando...' : business.name}
                    </span>
                    {sectorLabel(business.sector) && (
                      <span className="text-sm text-ink-muted">{sectorLabel(business.sector)}</span>
                    )}
                  </div>
                </button>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
