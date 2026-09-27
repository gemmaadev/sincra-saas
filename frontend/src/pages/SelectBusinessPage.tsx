import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { Building2 } from 'lucide-react'
import { api, ApiError } from '@/shared/services'
import { SECTOR_OPTIONS } from '@/features/onboarding/onboarding.constants'
import { ExitHeader } from '@/shared/components/exit-header/ExitHeader'
import { Card } from '@/shared/components/card'

interface Business {
  businessId: string
  name: string
  sector?: string
  role: 'ADMIN' | 'EMPLOYEE'
}

function sectorLabel(sector?: string) {
  if (!sector) return null
  return SECTOR_OPTIONS.find((option) => option.value === sector)?.label ?? sector
}

export function SelectBusinessPage() {
  const navigate = useNavigate()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectingId, setSelectingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true

    api
      .get<{ businesses: Business[] }>('/users/me/businesses')
      .then((data) => {
        if (isMounted) setBusinesses(data.businesses)
      })
      .catch(() => {
        if (isMounted) setError('No se pudieron cargar tus negocios. Inténtalo de nuevo.')
      })
      .finally(() => {
        if (isMounted) setIsLoading(false)
      })

    return () => {
      isMounted = false
    }
  }, [])

  const handleSelect = async (businessId: string) => {
    setError(null)
    setSelectingId(businessId)
    try {
      await api.post('/auth/select-business', { businessId })
      navigate('/inbox')
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'No se pudo entrar a ese negocio. Inténtalo de nuevo.',
      )
      setSelectingId(null)
    }
  }

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
                  onClick={() => handleSelect(business.businessId)}
                  disabled={selectingId !== null}
                  className="flex w-full items-center gap-3 text-left"
                >
                  <span className="flex size-11 shrink-0 items-center justify-center rounded-lg text-primary">
                    <Building2 size={26} />
                  </span>
                  <div className="flex flex-col gap-0.5">
                    <span className="font-semibold text-ink">
                      {selectingId === business.businessId ? 'Entrando...' : business.name}
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
