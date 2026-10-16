import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBusinessSettings } from '@/features/settings/hooks/useBusinessSettings'
import { BusinessInfoCard } from '@/features/settings/components/BusinessInfoCard'
import { ContactInfoCard } from '@/features/settings/components/ContactInfoCard'
import { ConnectedChannelsCard } from '@/features/settings/components/ConnectedChannelsCard'

export default function SettingsPage() {
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const { data: business, isLoading, isError } = useBusinessSettings()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Ajustes</h1>
        <p className="text-sm text-ink-muted">
          Configura tu negocio, canales y preferencias de Sincra.
        </p>
      </div>

      {isLoading && <p className="text-ink-muted">Cargando...</p>}
      {isError && <p className="text-error">No se ha podido cargar la información del negocio.</p>}
      {business && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-6">
            <BusinessInfoCard business={business} canEdit={isAdmin} />
            <ContactInfoCard business={business} canEdit={isAdmin} />
          </div>
          <div className="flex flex-col gap-6">
            <ConnectedChannelsCard canEdit={isAdmin} />
          </div>
        </div>
      )}
    </div>
  )
}
