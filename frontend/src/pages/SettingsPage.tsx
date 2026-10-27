import { useAuth } from '@/features/auth/hooks/useAuth'
import { useBusinessSettings } from '@/features/settings/hooks/useBusinessSettings'
import { BusinessInfoCard } from '@/features/settings/components/BusinessInfoCard'
import { ContactInfoCard } from '@/features/settings/components/ContactInfoCard'
import { ConnectedChannelsCard } from '@/features/settings/components/ConnectedChannelsCard'
import { LocaleCard } from '@/features/settings/components/LocaleCard'
import { TagManagementCard } from '@/features/tags/components/TagManagementCard'
import { DangerZoneCard } from '@/features/settings/components/DangerZoneCard'
import { PageSpinner } from '@/shared/components/spinner'

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

      {isLoading && <PageSpinner label="Cargando ajustes" />}
      {isError && <p className="text-error">No se ha podido cargar la información del negocio.</p>}
      {business && (
        <div className="flex max-w-6xl flex-col divide-y divide-neutral-100">
          <BusinessInfoCard business={business} canEdit={isAdmin} />
          <ContactInfoCard business={business} canEdit={isAdmin} />
          <ConnectedChannelsCard canEdit={isAdmin} />
          <LocaleCard business={business} canEdit={isAdmin} />
          {isAdmin && <TagManagementCard />}
          {isAdmin && <DangerZoneCard />}
        </div>
      )}
    </div>
  )
}
